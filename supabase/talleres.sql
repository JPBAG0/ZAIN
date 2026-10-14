begin;
create table public.zain_talleres(id uuid primary key default gen_random_uuid(),email text not null unique check(email=lower(email)),nombre text not null check(length(nombre) between 1 and 120),tecnica text not null check(tecnica in ('Bordado','DTF','Serigrafía')),activo boolean not null default true,principal boolean not null default false,user_id uuid references auth.users(id),version integer not null default 0,created_at timestamptz not null default now(),created_by uuid not null references auth.users(id));
create unique index zain_taller_principal_tecnica on public.zain_talleres(tecnica) where activo and principal;
create table public.zain_partidas_taller(id uuid primary key default gen_random_uuid(),pedido_id uuid not null references public.zain_pedidos(id),indice integer not null check(indice between 0 and 19),taller_id uuid not null references public.zain_talleres(id),tecnica text not null check(tecnica in ('Bordado','DTF','Serigrafía')),estado text not null default 'pendiente' check(estado in ('pendiente','aceptado','en_proceso','listo')),version integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(pedido_id,indice));
create index zain_partidas_taller_bandeja on public.zain_partidas_taller(taller_id,created_at desc,id);
create table public.zain_taller_historial(id bigint generated always as identity primary key,partida_id uuid not null references public.zain_partidas_taller(id),actor uuid not null references auth.users(id),estado text not null,created_at timestamptz not null default now());
alter table public.zain_talleres enable row level security;
alter table public.zain_partidas_taller enable row level security;
alter table public.zain_taller_historial enable row level security;
revoke all on public.zain_talleres,public.zain_partidas_taller,public.zain_taller_historial from public,anon,authenticated;
grant select,insert,update on public.zain_talleres,public.zain_partidas_taller,public.zain_taller_historial to service_role;
revoke all on sequence public.zain_taller_historial_id_seq from public,anon,authenticated;
grant usage,select on sequence public.zain_taller_historial_id_seq to service_role;
create or replace function public.zain_vincular_taller(p_id uuid,p_user uuid,p_email text) returns jsonb language plpgsql security invoker set search_path='' as $$
declare t public.zain_talleres;
begin
 -- La API verificó previamente JWT, correo confirmado e identidad con Supabase Auth.
 -- Esta RPC es exclusiva del servidor; no necesita permisos de lectura sobre auth.users.
 update public.zain_talleres set user_id=p_user where id=p_id and email=p_email and activo and (user_id is null or user_id=p_user) returning * into t;
 if not found then return null; end if;
 return jsonb_build_object('id',t.id,'nombre',t.nombre,'tecnica',t.tecnica);
end;$$;
revoke all on function public.zain_vincular_taller(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.zain_vincular_taller(uuid,uuid,text) to service_role;
create function public.zain_guardar_taller(p_id uuid,p_version integer,p_email text,p_nombre text,p_tecnica text,p_activo boolean,p_principal boolean,p_actor uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare t public.zain_talleres;
begin
 if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
 if p_tecnica not in ('Bordado','DTF','Serigrafía') or length(trim(p_nombre)) not between 1 and 120 then raise exception 'Datos invalidos'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('zain:talleres',0));
 if p_id is null then
  if p_principal and p_activo then update public.zain_talleres set principal=false,version=version+1 where tecnica=p_tecnica and principal; end if;
  insert into public.zain_talleres(email,nombre,tecnica,activo,principal,created_by) values(p_email,trim(p_nombre),p_tecnica,p_activo,p_principal,p_actor) returning * into t;
 else
  select * into t from public.zain_talleres where id=p_id for update;
  if not found or t.version<>p_version then return null; end if;
  if t.email<>p_email or t.tecnica<>p_tecnica then raise exception 'Identidad protegida'; end if;
  if p_principal and p_activo then update public.zain_talleres set principal=false,version=version+1 where tecnica=p_tecnica and principal and id<>p_id; end if;
  update public.zain_talleres set nombre=trim(p_nombre),activo=p_activo,principal=p_principal,version=version+1 where id=p_id returning * into t;
 end if;
 return jsonb_build_object('id',t.id,'version',t.version);
end;$$;
create function public.zain_asignar_partida(p_pedido uuid,p_indice integer,p_taller uuid,p_actor uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare x public.zain_pedidos;t public.zain_talleres;task public.zain_partidas_taller;
begin
 if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
 select * into x from public.zain_pedidos where id=p_pedido for update;
 if not found or x.archivado_at is not null or x.guardado_at is null or x.estado not in ('confirmado','produccion') then raise exception 'Confirma el pedido antes de asignar'; end if;
 if p_indice<0 or p_indice>=jsonb_array_length(x.items) then raise exception 'Partida invalida'; end if;
 select * into t from public.zain_talleres where id=p_taller and activo for share;
 if not found or t.tecnica<>x.items->p_indice->>'tecnica' then raise exception 'Tecnica incompatible'; end if;
 insert into public.zain_partidas_taller(pedido_id,indice,taller_id,tecnica) values(x.id,p_indice,t.id,t.tecnica)
 on conflict(pedido_id,indice) do update set taller_id=excluded.taller_id,estado='pendiente',version=zain_partidas_taller.version+1,updated_at=now()
 returning * into task;
 insert into public.zain_taller_historial(partida_id,actor,estado) values(task.id,p_actor,'asignado');
 return jsonb_build_object('id',task.id);
end;$$;
create function public.zain_actualizar_partida(p_id uuid,p_version integer,p_estado text,p_taller uuid,p_actor uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare x public.zain_pedidos;task public.zain_partidas_taller;pid uuid;
begin
 if p_estado not in ('aceptado','en_proceso','listo') then raise exception 'Estado invalido'; end if;
 select pedido_id into pid from public.zain_partidas_taller where id=p_id and taller_id=p_taller;
 select * into x from public.zain_pedidos where id=pid for share;
 if not found or x.archivado_at is not null or x.guardado_at is null or x.estado not in ('confirmado','produccion','entregado') then return null; end if;
 if not exists(select 1 from public.zain_talleres where id=p_taller and user_id=p_actor and activo) then return null; end if;
 select * into task from public.zain_partidas_taller where id=p_id and taller_id=p_taller and tecnica=x.items->indice->>'tecnica' for update;
 if not found or task.version<>p_version then return null; end if;
 update public.zain_partidas_taller set estado=p_estado,version=version+1,updated_at=now() where id=p_id returning * into task;
 insert into public.zain_taller_historial(partida_id,actor,estado) values(p_id,p_actor,p_estado);
 return jsonb_build_object('id',task.id,'version',task.version,'estado',task.estado);
end;$$;
create function public.zain_repartir_confirmado() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.guardado_at is not null and new.archivado_at is null and new.estado in ('confirmado','produccion') then
  insert into public.zain_partidas_taller(pedido_id,indice,taller_id,tecnica)
  select new.id,(e.n-1)::integer,t.id,t.tecnica from jsonb_array_elements(new.items) with ordinality e(item,n)
  join public.zain_talleres t on t.tecnica=e.item->>'tecnica' and t.activo and t.principal
  on conflict(pedido_id,indice) do nothing;
 end if;
 return new;
end;$$;
create trigger zain_repartir_confirmado after update of estado on public.zain_pedidos for each row execute function public.zain_repartir_confirmado();
revoke all on function public.zain_vincular_taller(uuid,uuid,text),public.zain_guardar_taller(uuid,integer,text,text,text,boolean,boolean,uuid),public.zain_asignar_partida(uuid,integer,uuid,uuid),public.zain_actualizar_partida(uuid,integer,text,uuid,uuid),public.zain_repartir_confirmado() from public,anon,authenticated;
grant execute on function public.zain_vincular_taller(uuid,uuid,text),public.zain_guardar_taller(uuid,integer,text,text,text,boolean,boolean,uuid),public.zain_asignar_partida(uuid,integer,uuid,uuid),public.zain_actualizar_partida(uuid,integer,text,uuid,uuid),public.zain_repartir_confirmado() to service_role;
commit;
