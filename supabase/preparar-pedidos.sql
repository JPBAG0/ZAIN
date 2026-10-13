-- Ejecutar en el proyecto dedicado de ZAIN. No habilita acceso público a pedidos.
begin;
create table if not exists public.zain_equipo (
  user_id uuid primary key references auth.users(id),
  nombre text not null,
  activo boolean not null default true
);
create table if not exists public.zain_pedidos (
  id uuid primary key,
  folio text not null unique,
  token_hash text not null check (length(token_hash)=64),
  created_at timestamptz not null default now(),
  guardado_at timestamptz,
  estado text not null default 'nuevo' check (estado in ('nuevo','contactado','cotizado','confirmado','produccion','entregado','cancelado')),
  items jsonb not null check (jsonb_typeof(items)='array'),
  archivos jsonb not null check (jsonb_typeof(archivos)='array'),
  total integer not null check (total>0),
  notas_internas text not null default '',
  version integer not null default 0,
  updated_at timestamptz not null default now()
);
create index if not exists zain_pedidos_fecha on public.zain_pedidos (created_at desc) where guardado_at is not null;
create index if not exists zain_pedidos_estado_fecha on public.zain_pedidos (estado,created_at desc) where guardado_at is not null;
create table if not exists public.zain_historial (
  id bigint generated always as identity primary key,
  pedido_id uuid not null references public.zain_pedidos(id),
  actor uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  estado_anterior text not null,
  estado_nuevo text not null,
  notas text not null
);
create index if not exists zain_historial_pedido on public.zain_historial(pedido_id,created_at desc);
create table if not exists public.zain_limites (
  clave text primary key,
  valor bigint not null default 0,
  vence timestamptz not null default now()+interval '1 hour'
);
alter table public.zain_equipo enable row level security;
alter table public.zain_pedidos enable row level security;
alter table public.zain_historial enable row level security;
alter table public.zain_limites enable row level security;
revoke all on public.zain_equipo,public.zain_pedidos,public.zain_historial,public.zain_limites from public,anon,authenticated;
grant select,insert,update,delete on public.zain_equipo,public.zain_pedidos,public.zain_historial,public.zain_limites to service_role;
grant usage,select on sequence public.zain_historial_id_seq to service_role;

create or replace function public.zain_crear_pedido(p_id uuid,p_token_hash text,p_items jsonb,p_archivos jsonb,p_total integer,p_bytes bigint,p_capacity bigint,p_client text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare old public.zain_pedidos; used bigint; ref text;
begin
  -- Una clave persistente hace atómicos el cupo, el folio y la deduplicación.
  insert into public.zain_limites(clave) values ('capacidad') on conflict do nothing;
  select valor into used from public.zain_limites where clave='capacidad' for update;
  select * into old from public.zain_pedidos where id=p_id;
  if found then
    if old.token_hash<>p_token_hash or old.items<>p_items or old.archivos<>p_archivos then raise exception 'zain_conflict'; end if;
    return jsonb_build_object('folio',old.folio);
  end if;
  if p_bytes<0 or p_capacity<1 or used+p_bytes>p_capacity then raise exception 'zain_capacity'; end if;
  insert into public.zain_limites(clave,valor) values ('ip-'||p_client,1)
  on conflict(clave) do update set valor=case when public.zain_limites.vence<now() then 1 else public.zain_limites.valor+1 end,
    vence=case when public.zain_limites.vence<now() then now()+interval '1 hour' else public.zain_limites.vence end
  returning valor into used;
  if used>10 then raise exception 'zain_rate'; end if;
  ref:='ZAIN-'||upper(substr(replace(p_id::text,'-',''),1,12));
  insert into public.zain_pedidos(id,folio,token_hash,items,archivos,total) values(p_id,ref,p_token_hash,p_items,p_archivos,p_total);
  update public.zain_limites set valor=valor+p_bytes where clave='capacidad';
  return jsonb_build_object('folio',ref);
end;
$$;
revoke all on function public.zain_crear_pedido(uuid,text,jsonb,jsonb,integer,bigint,bigint,text) from public,anon,authenticated;
grant execute on function public.zain_crear_pedido(uuid,text,jsonb,jsonb,integer,bigint,bigint,text) to service_role;

create or replace function public.zain_actualizar_pedido(p_id uuid,p_version integer,p_estado text,p_notas text,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare old public.zain_pedidos; changed public.zain_pedidos;
begin
  if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
  select * into old from public.zain_pedidos where id=p_id and guardado_at is not null for update;
  if not found or old.version<>p_version then return null; end if;
  update public.zain_pedidos set estado=p_estado,notas_internas=p_notas,version=version+1,updated_at=now() where id=p_id returning * into changed;
  insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,old.estado,p_estado,p_notas);
  return to_jsonb(changed);
end;
$$;
revoke all on function public.zain_actualizar_pedido(uuid,integer,text,text,uuid) from public,anon,authenticated;
grant execute on function public.zain_actualizar_pedido(uuid,integer,text,text,uuid) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('zain-pedidos','zain-pedidos',false,15728640,array['image/png','image/jpeg','image/webp','image/svg+xml','application/pdf'])
on conflict(id) do update set public=false,file_size_limit=15728640,allowed_mime_types=excluded.allowed_mime_types;
-- Incluso si otro bucket tiene una política amplia, no autoriza este bucket.
do $$ begin
  if not exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='zain_solo_api') then
    create policy zain_solo_api on storage.objects as restrictive for all to anon,authenticated
      using(bucket_id<>'zain-pedidos') with check(bucket_id<>'zain-pedidos');
  end if;
end $$;
commit;

-- Dar de alta SOLO a los dos usuarios confirmados, después de crear sus cuentas:
-- insert into public.zain_equipo(user_id,nombre)
-- select id,'Nombre confirmado' from auth.users where email='correo-confirmado';
