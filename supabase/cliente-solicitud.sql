-- Nombre/empresa y fecha deseada que escribe el cliente al solicitar su cotización (16-oct-2026).
-- Solo los lee el equipo autorizado en Gestión; la consulta del cliente y los talleres usan campos explícitos.
alter table public.zain_pedidos add column if not exists cliente jsonb not null default '{}'::jsonb;
alter table public.zain_pedidos drop constraint if exists zain_pedidos_cliente_objeto;
alter table public.zain_pedidos add constraint zain_pedidos_cliente_objeto
  check (jsonb_typeof(cliente)='object' and pg_column_size(cliente)<2048);
comment on column public.zain_pedidos.cliente is 'Datos que escribe el cliente: {nombre, fecha (AAAA-MM-DD, opcional)}. Privado del equipo.';
