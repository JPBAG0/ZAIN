begin;
create table public.zain_catalogo_ediciones(producto_id text primary key,cambios jsonb not null default '{}'::jsonb check(jsonb_typeof(cambios)='object'),version integer not null default 0,updated_at timestamptz not null default now(),updated_by uuid references auth.users(id));
create table public.zain_catalogo_fotos(id uuid primary key,producto_id text not null,objeto text not null unique,creada_by uuid not null references auth.users(id),created_at timestamptz not null default now());
create table public.zain_catalogo_historial(id bigint generated always as identity primary key,producto_id text not null,version integer not null,cambios jsonb not null,actor uuid not null references auth.users(id),created_at timestamptz not null default now());
create index zain_catalogo_historial_producto on public.zain_catalogo_historial(producto_id,created_at desc);
alter table public.zain_catalogo_ediciones enable row level security;
alter table public.zain_catalogo_fotos enable row level security;
alter table public.zain_catalogo_historial enable row level security;
revoke all on public.zain_catalogo_ediciones,public.zain_catalogo_fotos,public.zain_catalogo_historial from public,anon,authenticated;
grant select,insert,update on public.zain_catalogo_ediciones to service_role;
grant select,insert on public.zain_catalogo_fotos,public.zain_catalogo_historial to service_role;
grant usage,select on sequence public.zain_catalogo_historial_id_seq to service_role;
create function public.zain_guardar_catalogo(p_producto_id text,p_version integer,p_cambios jsonb,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare old public.zain_catalogo_ediciones; changed public.zain_catalogo_ediciones;
begin
 if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
 if jsonb_typeof(p_cambios)<>'object' or exists(select 1 from jsonb_object_keys(p_cambios) k where k not in ('activo','nombre','descripcion','especificaciones','tejido','composicion','gramaje','medidas','disponibilidad','proveedor','sku_proveedor','foto_id')) then raise exception 'Campo no editable'; end if;
 if p_cambios ? 'foto_id' and p_cambios->>'foto_id' is not null and not exists(select 1 from public.zain_catalogo_fotos where id::text=p_cambios->>'foto_id' and producto_id=p_producto_id) then raise exception 'Foto no vinculada al producto'; end if;
 insert into public.zain_catalogo_ediciones(producto_id) values(p_producto_id) on conflict do nothing;
 select * into old from public.zain_catalogo_ediciones where producto_id=p_producto_id for update;
 if old.version<>p_version then return null; end if;
 update public.zain_catalogo_ediciones set cambios=old.cambios||p_cambios,version=version+1,updated_at=now(),updated_by=p_actor where producto_id=p_producto_id returning * into changed;
 insert into public.zain_catalogo_historial(producto_id,version,cambios,actor) values(p_producto_id,changed.version,p_cambios,p_actor);
 return to_jsonb(changed);
end;
$$;
revoke all on function public.zain_guardar_catalogo(text,integer,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.zain_guardar_catalogo(text,integer,jsonb,uuid) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('zain-catalogo-fotos','zain-catalogo-fotos',true,4194304,array['image/webp']);
create policy zain_catalogo_solo_api on storage.objects as restrictive for all to anon,authenticated using(bucket_id<>'zain-catalogo-fotos') with check(bucket_id<>'zain-catalogo-fotos');
commit;

