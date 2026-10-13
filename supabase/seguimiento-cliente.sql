-- Conserva los pedidos existentes y todos sus permisos privados.
-- El nonce permite invalidar un enlace individual sin cambiar el permiso de carga.
alter table public.zain_pedidos add column if not exists consulta_nonce uuid not null default gen_random_uuid();
comment on column public.zain_pedidos.consulta_nonce is 'Sal independiente para la capacidad de consulta; nunca se devuelve a los clientes.';
