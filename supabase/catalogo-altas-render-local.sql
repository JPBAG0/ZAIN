begin;
create sequence public.zain_producto_sku_seq;
create table public.zain_categorias_gestion(nombre text primary key check(length(nombre) between 1 and 80),created_by uuid not null references auth.users(id),created_at timestamptz not null default now());
create unique index zain_categorias_nombre_unico on public.zain_categorias_gestion(lower(nombre));
create table public.zain_productos_gestion(id text primary key,sku text not null unique,request_id uuid not null unique,request_hash text not null,datos jsonb not null check(jsonb_typeof(datos)='object'),created_by uuid not null references auth.users(id),created_at timestamptz not null default now(),publicado_at timestamptz);
create table public.zain_render_cola(id uuid primary key,request_id uuid not null unique,producto_id text not null references public.zain_productos_gestion(id),entrada_foto uuid not null references public.zain_catalogo_fotos(id),solicitado_por uuid not null references auth.users(id),estado text not null default 'pendiente' check(estado in ('pendiente','generando','revision','error','cancelado')),worker_hash text,worker_at timestamptz,resultado_foto uuid references public.zain_catalogo_fotos(id),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),error text not null default '');
create unique index zain_render_una_generacion on public.zain_render_cola(producto_id) where estado in ('pendiente','generando');
create index zain_render_pendientes on public.zain_render_cola(created_at,id) where estado='pendiente';
alter table public.zain_categorias_gestion enable row level security;
alter table public.zain_productos_gestion enable row level security;
alter table public.zain_render_cola enable row level security;
revoke all on public.zain_categorias_gestion,public.zain_productos_gestion,public.zain_render_cola from public,anon,authenticated;
revoke all on sequence public.zain_producto_sku_seq from public,anon,authenticated;
grant select,insert,update on public.zain_categorias_gestion,public.zain_productos_gestion,public.zain_render_cola to service_role;
grant usage,select on sequence public.zain_producto_sku_seq to service_role;
create function public.zain_crear_categoria(p_nombre text,p_actor uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare name text;
begin
 if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
 if length(trim(p_nombre)) not between 1 and 80 or lower(trim(p_nombre)) in ('todo','todos') then raise exception 'Categoria invalida'; end if;
 insert into public.zain_categorias_gestion(nombre,created_by) values(trim(p_nombre),p_actor) on conflict do nothing;
 select nombre into name from public.zain_categorias_gestion where lower(nombre)=lower(trim(p_nombre));
 return jsonb_build_object('nombre',name);
end;
$$;
create function public.zain_crear_producto(p_request uuid,p_datos jsonb,p_hash text,p_actor uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare old public.zain_productos_gestion;code text;new_id text;
begin
 if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_request::text,0));
 select * into old from public.zain_productos_gestion where request_id=p_request;
 if found then
  if old.request_hash<>p_hash then raise exception 'zain_conflict'; end if;
  return jsonb_build_object('id',old.id,'sku',old.sku);
 end if;
 if (select count(*) from public.zain_productos_gestion)>=2000 then raise exception 'Limite de productos'; end if;
 code:='ZN-NP-'||lpad(nextval('public.zain_producto_sku_seq')::text,6,'0');new_id:=lower(code);
 insert into public.zain_productos_gestion(id,sku,request_id,request_hash,datos,created_by) values(new_id,code,p_request,p_hash,p_datos,p_actor);
 insert into public.zain_catalogo_ediciones(producto_id,cambios,updated_by) values(new_id,jsonb_build_object('activo',false),p_actor);
 insert into public.zain_catalogo_historial(producto_id,version,cambios,actor) values(new_id,0,jsonb_build_object('evento','creacion'),p_actor);
 return jsonb_build_object('id',new_id,'sku',code);
end;
$$;
create function public.zain_asignar_render(p_producto text,p_foto uuid,p_version integer,p_actor uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare old public.zain_catalogo_ediciones;prod public.zain_productos_gestion;
begin
 if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
 select * into old from public.zain_catalogo_ediciones where producto_id=p_producto for update;
 if not found or old.version<>p_version then return null; end if;
 select * into prod from public.zain_productos_gestion where id=p_producto for update;
 if not found or prod.publicado_at is not null then raise exception 'Render protegido'; end if;
 if not exists(select 1 from public.zain_catalogo_fotos where id=p_foto and producto_id=p_producto) then raise exception 'Foto no vinculada'; end if;
 update public.zain_productos_gestion set datos=jsonb_set(datos,'{render_id}',to_jsonb(p_foto::text)) where id=p_producto;
 update public.zain_catalogo_ediciones set version=version+1,updated_at=now(),updated_by=p_actor where producto_id=p_producto;
 insert into public.zain_catalogo_historial(producto_id,version,cambios,actor) values(p_producto,old.version+1,jsonb_build_object('evento','render_revision','foto_id',p_foto),p_actor);
 return jsonb_build_object('version',old.version+1);
end;
$$;
create function public.zain_solicitar_render(p_producto text,p_foto uuid,p_request uuid,p_actor uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare old public.zain_render_cola;prod public.zain_productos_gestion;
begin
 if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
 select * into prod from public.zain_productos_gestion where id=p_producto for update;
 if not found or prod.publicado_at is not null then raise exception 'Render protegido'; end if;
 if not exists(select 1 from public.zain_catalogo_fotos where id=p_foto and producto_id=p_producto) then raise exception 'Foto no vinculada'; end if;
 select * into old from public.zain_render_cola where request_id=p_request;
 if found then
  if old.producto_id<>p_producto or old.entrada_foto<>p_foto then raise exception 'zain_conflict'; end if;
  return jsonb_build_object('id',old.id,'estado',old.estado);
 end if;
 select * into old from public.zain_render_cola where producto_id=p_producto and estado in ('pendiente','generando');
 if found then return jsonb_build_object('id',old.id,'estado',old.estado); end if;
 insert into public.zain_render_cola(id,request_id,producto_id,entrada_foto,solicitado_por) values(p_request,p_request,p_producto,p_foto,p_actor);
 return jsonb_build_object('id',p_request,'estado','pendiente');
end;
$$;
create function public.zain_tomar_render_local(p_hash text) returns jsonb language plpgsql security invoker set search_path='' as $$
declare job public.zain_render_cola;photo public.zain_catalogo_fotos;prod public.zain_productos_gestion;
begin
 update public.zain_render_cola set estado='error',error='La sesión de Codex venció. Revisa y solicita otro render.',worker_hash=null,updated_at=now() where estado='generando' and worker_at<now()-interval '2 hours';
 if p_hash !~ '^[a-f0-9]{64}$' then raise exception 'Ticket invalido'; end if;
 select * into job from public.zain_render_cola where estado='pendiente' order by created_at,id for update skip locked limit 1;
 if not found then return null; end if;
 select * into prod from public.zain_productos_gestion where id=job.producto_id;
 if prod.publicado_at is not null then update public.zain_render_cola set estado='cancelado',updated_at=now() where id=job.id;return null;end if;
 update public.zain_render_cola set estado='generando',worker_hash=p_hash,worker_at=now(),updated_at=now() where id=job.id;
 select * into photo from public.zain_catalogo_fotos where id=job.entrada_foto;
 return jsonb_build_object('id',job.id,'producto_id',job.producto_id,'nombre',prod.datos->>'nombre','objeto',photo.objeto);
end;
$$;
create function public.zain_render_error_local(p_id uuid,p_hash text,p_error text) returns boolean language plpgsql security invoker set search_path='' as $$
begin
 update public.zain_render_cola set estado='error',error=left(p_error,500),worker_hash=null,updated_at=now() where id=p_id and worker_hash=p_hash and estado='generando';return found;
end;
$$;
create function public.zain_render_salida_local(p_id uuid,p_hash text,p_foto uuid) returns boolean language plpgsql security invoker set search_path='' as $$
declare job public.zain_render_cola;
begin
 select * into job from public.zain_render_cola where id=p_id and worker_hash=p_hash and estado='generando' and worker_at>now()-interval '2 hours' for update;
 if not found then return false; end if;
 if job.resultado_foto is not null then return job.resultado_foto=p_foto;end if;
 insert into public.zain_catalogo_fotos(id,producto_id,objeto,creada_by) values(p_foto,job.producto_id,job.producto_id||'/'||p_foto::text||'.webp',job.solicitado_por);
 update public.zain_render_cola set resultado_foto=p_foto,updated_at=now() where id=p_id;
 return true;
end;
$$;
create function public.zain_render_listo_local(p_id uuid,p_hash text) returns boolean language plpgsql security invoker set search_path='' as $$
begin
 update public.zain_render_cola set estado='revision',worker_hash=null,updated_at=now() where id=p_id and worker_hash=p_hash and estado='generando' and resultado_foto is not null;return found;
end;
$$;
revoke all on function public.zain_crear_categoria(text,uuid),public.zain_crear_producto(uuid,jsonb,text,uuid),public.zain_asignar_render(text,uuid,integer,uuid),public.zain_solicitar_render(text,uuid,uuid,uuid),public.zain_tomar_render_local(text),public.zain_render_error_local(uuid,text,text),public.zain_render_salida_local(uuid,text,uuid),public.zain_render_listo_local(uuid,text) from public,anon,authenticated;
grant execute on function public.zain_crear_categoria(text,uuid),public.zain_crear_producto(uuid,jsonb,text,uuid),public.zain_asignar_render(text,uuid,integer,uuid),public.zain_solicitar_render(text,uuid,uuid,uuid),public.zain_tomar_render_local(text),public.zain_render_error_local(uuid,text,text),public.zain_render_salida_local(uuid,text,uuid),public.zain_render_listo_local(uuid,text) to service_role;
create or replace function public.zain_guardar_catalogo(p_producto_id text,p_version integer,p_cambios jsonb,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare old public.zain_catalogo_ediciones; changed public.zain_catalogo_ediciones; prod public.zain_productos_gestion;
begin
 if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
 if jsonb_typeof(p_cambios)<>'object' or exists(select 1 from jsonb_object_keys(p_cambios) k where k not in ('activo','nombre','descripcion','especificaciones','tejido','composicion','gramaje','medidas','disponibilidad','proveedor','sku_proveedor','foto_id','tecnicas','categoria')) then raise exception 'Campo no editable'; end if;
 if p_cambios ? 'tecnicas' then
  if jsonb_typeof(p_cambios->'tecnicas') is distinct from 'array' then raise exception 'Tecnicas invalidas'; end if;
  if jsonb_array_length(p_cambios->'tecnicas') not between 1 and 3
   or exists(select 1 from jsonb_array_elements_text(p_cambios->'tecnicas') t where t not in ('bordado','serigrafia','dtf'))
   or (select count(distinct t) from jsonb_array_elements_text(p_cambios->'tecnicas') t)<>jsonb_array_length(p_cambios->'tecnicas')
  then raise exception 'Tecnicas invalidas'; end if;
 end if;
 if p_cambios ? 'foto_id' and p_cambios->>'foto_id' is not null and not exists(select 1 from public.zain_catalogo_fotos where id::text=p_cambios->>'foto_id' and producto_id=p_producto_id) then raise exception 'Foto no vinculada al producto'; end if;
 insert into public.zain_catalogo_ediciones(producto_id) values(p_producto_id) on conflict do nothing;
 select * into old from public.zain_catalogo_ediciones where producto_id=p_producto_id for update;
 if old.version<>p_version then return null; end if;
 select * into prod from public.zain_productos_gestion where id=p_producto_id for update;
 if found and p_cambios->>'activo'='true' then
  if prod.datos->>'plantilla' is null and prod.datos->>'render_id' is null then raise exception 'Falta render revisado'; end if;
  update public.zain_productos_gestion set publicado_at=coalesce(publicado_at,now()) where id=p_producto_id;
 end if;
 update public.zain_catalogo_ediciones set cambios=old.cambios||p_cambios,version=version+1,updated_at=now(),updated_by=p_actor where producto_id=p_producto_id returning * into changed;
 insert into public.zain_catalogo_historial(producto_id,version,cambios,actor) values(p_producto_id,changed.version,p_cambios,p_actor);
 return to_jsonb(changed);
end;
$$;
revoke all on function public.zain_guardar_catalogo(text,integer,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.zain_guardar_catalogo(text,integer,jsonb,uuid) to service_role;
commit;
