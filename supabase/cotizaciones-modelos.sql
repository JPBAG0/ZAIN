-- Cotizaciones por modelo y talla guardadas en Gestión (sin cantidades). Solo el servidor (service_role) las lee y escribe.
-- No se borran: «descartada» las saca de la lista activa. «convertida» queda ligada al pedido que se creó con ellas.
begin;
create table if not exists public.zain_cotizaciones_modelos(
 id uuid primary key,
 numero integer generated always as identity unique,
 folio text generated always as ('COT-'||lpad(numero::text,4,'0')) stored unique,
 estado text not null default 'borrador' check(estado in ('borrador','enviada','autorizada','convertida','descartada')),
 cliente text not null default '' check(char_length(cliente)<=180),
 -- Composición del equipo (modelos, márgenes, precios escritos). Privada: incluye márgenes.
 datos jsonb not null check(jsonb_typeof(datos)='object' and pg_column_size(datos)<400000),
 -- Última proyección comercial (lo que vio el cliente): precios por pieza, sin costos.
 comercial jsonb check(comercial is null or (jsonb_typeof(comercial)='object' and pg_column_size(comercial)<400000)),
 desde integer check(desde is null or desde>=0),
 modelos smallint not null default 0 check(modelos between 0 and 20),
 logo jsonb check(logo is null or jsonb_typeof(logo)='object'),
 pedido_id uuid references public.zain_pedidos(id),
 version integer not null default 1 check(version>=1),
 creado_por uuid not null references auth.users(id),
 actor uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists zain_cotizaciones_modelos_fecha on public.zain_cotizaciones_modelos(updated_at desc);
alter table public.zain_cotizaciones_modelos enable row level security;
revoke all on public.zain_cotizaciones_modelos from public,anon,authenticated;
grant select,insert,update on public.zain_cotizaciones_modelos to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('zain-cotizaciones-logos','zain-cotizaciones-logos',false,15728640,array['image/png','image/jpeg','image/webp','image/svg+xml'])
 on conflict(id) do update set public=false,file_size_limit=15728640,allowed_mime_types=excluded.allowed_mime_types;
commit;
