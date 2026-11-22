-- Catálogos y listas de precios de los proveedores (JP, 21-nov-2026): en Gestión → Catálogo, para abrirlos sin buscarlos
-- en Dropbox. Bucket privado; solo la Edge con sesión del equipo firma enlaces de 60 minutos. Nunca se borran: «Quitar»
-- los archiva. Posterior a los SQL históricos; no los modifica.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('zain-proveedores','zain-proveedores',false,52428800,array['application/pdf','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create table if not exists public.zain_proveedores_archivos(
 id uuid primary key,
 proveedor text not null check(char_length(proveedor) between 2 and 80),
 tipo text not null check(tipo in ('catalogo','precios','otro')),
 titulo text not null check(char_length(titulo) between 2 and 120),
 objeto text not null unique check(objeto ~ '^[0-9a-f-]{36}\.(pdf|xlsx|jpg|png|webp)$'),
 mime text not null check(mime in ('application/pdf','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','image/jpeg','image/png','image/webp')),
 bytes bigint not null check(bytes between 1 and 52428800),
 nota text not null default '' check(char_length(nota)<=300),
 archivado_at timestamptz,
 version integer not null default 1 check(version>=1),
 creado_por uuid references auth.users(id),
 actor uuid references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists zain_proveedores_archivos_lista on public.zain_proveedores_archivos(proveedor,tipo,titulo) where archivado_at is null;
alter table public.zain_proveedores_archivos enable row level security;
revoke all on public.zain_proveedores_archivos from public,anon,authenticated;
grant select,insert,update on public.zain_proveedores_archivos to service_role;
comment on table public.zain_proveedores_archivos is 'Catálogos y listas de precios de proveedores para el equipo. Privado. Nunca se borran: archivado_at los quita de la lista.';
