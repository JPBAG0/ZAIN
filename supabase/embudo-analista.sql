-- Analista diario del embudo ZAIN (18-oct-2026).
-- Solo números agregados y folios: sin nombres, artículos, archivos ni notas.
-- Lo lee la Edge Function zain-embudo con service_role; nadie más puede ejecutarlo.

create table if not exists public.zain_analistas (
  huella text primary key check (huella ~ '^[a-f0-9]{64}$'),
  nombre text not null check (length(nombre) between 1 and 60),
  activo boolean not null default true,
  creado timestamptz not null default now()
);
comment on table public.zain_analistas is 'Huellas SHA-256 de los tokens de lectura del embudo. Privado: sin políticas.';
alter table public.zain_analistas enable row level security;
revoke all on public.zain_analistas from anon, authenticated;
grant select on public.zain_analistas to service_role;

create or replace function public.zain_embudo(p_desde date, p_hasta date, p_corte date default '2026-10-16')
returns jsonb
language sql
stable
set search_path = ''
as $$
with
lim as (
  select (p_desde::timestamp at time zone 'America/Mexico_City') as d0,
         ((p_hasta + 1)::timestamp at time zone 'America/Mexico_City') as d1,
         (p_corte::timestamp at time zone 'America/Mexico_City') as corte
),
base as (
  -- Prueba: nota con NO COTIZAR/prueba, o mandada a la papelera sin haberse cotizado nunca.
  select p.*, (coalesce(p.notas_internas, '') ~* '(no cotizar|prueba)'
    or (p.archivado_at is not null and not exists (
      select 1 from public.zain_cotizaciones_historial h where h.pedido_id = p.id and h.modo = 'publicar'))) as es_prueba
  from public.zain_pedidos p, lim
  where p.guardado_at is not null and p.created_at >= lim.corte
),
r as (
  select b.id, b.folio, b.estado, b.created_at, b.archivado_at,
    (select min(h.created_at) from public.zain_cotizaciones_historial h where h.pedido_id = b.id and h.modo = 'publicar') as cotizada_at,
    (select min(a.aceptada_at) from public.zain_cotizacion_aceptaciones a where a.pedido_id = b.id) as aceptada_at,
    (select min(h.created_at) from public.zain_historial h where h.pedido_id = b.id
       and h.estado_nuevo in ('confirmado', 'produccion', 'entregado') and h.estado_anterior is distinct from h.estado_nuevo) as confirmado_at,
    (select min(h.created_at) from public.zain_historial h where h.pedido_id = b.id
       and h.estado_nuevo = 'entregado' and h.estado_anterior is distinct from h.estado_nuevo) as entregado_at,
    (select (a.documento->>'total')::bigint from public.zain_cotizacion_aceptaciones a
       where a.pedido_id = b.id order by a.revision desc limit 1) as total_aceptado,
    (select coalesce(sum(g.importe), 0) from public.zain_pagos g where g.pedido_id = b.id) as cobrado_total,
    greatest(b.created_at,
      (select max(h.created_at) from public.zain_historial h where h.pedido_id = b.id),
      (select max(h.created_at) from public.zain_cotizaciones_historial h where h.pedido_id = b.id),
      (select max(a.aceptada_at) from public.zain_cotizacion_aceptaciones a where a.pedido_id = b.id),
      (select max(g.created_at) from public.zain_pagos g where g.pedido_id = b.id)) as ultimo_mov
  from base b
  where not b.es_prueba
),
pagos as (
  select g.created_at, g.importe from public.zain_pagos g join r on r.id = g.pedido_id
),
dias as (
  select d::date as fecha from generate_series(p_desde, p_hasta, interval '1 day') d
),
local as (
  select r.*,
    (r.created_at at time zone 'America/Mexico_City')::date as dia_sol,
    (r.cotizada_at at time zone 'America/Mexico_City')::date as dia_cot,
    (r.aceptada_at at time zone 'America/Mexico_City')::date as dia_acep,
    greatest(coalesce(r.total_aceptado, 0) - r.cobrado_total, 0) as saldo,
    extract(epoch from (now() - r.ultimo_mov)) / 3600 as horas
  from r
),
seg as (
  select folio,
    case when cotizada_at is null and estado in ('nuevo', 'contactado') then 'por cotizar'
         when cotizada_at is not null and aceptada_at is null then 'cotización sin respuesta'
         when aceptada_at is not null and saldo > 0 then 'saldo pendiente' end as etapa,
    round(horas)::int as horas_sin_mover, round(saldo / 100.0, 2) as saldo_mxn
  from local
  where estado <> 'cancelado' and archivado_at is null and horas > 48
)
select jsonb_build_object(
  'ventana', jsonb_build_object('desde', p_desde, 'hasta', p_hasta, 'zona', 'America/Mexico_City'),
  'corte', p_corte,
  'generado', now(),
  'periodo', (select jsonb_build_object(
      'solicitudes', count(*) filter (where created_at >= lim.d0 and created_at < lim.d1),
      'cotizaciones_enviadas', count(*) filter (where cotizada_at >= lim.d0 and cotizada_at < lim.d1),
      'aceptadas', count(*) filter (where aceptada_at >= lim.d0 and aceptada_at < lim.d1),
      'confirmados', count(*) filter (where confirmado_at >= lim.d0 and confirmado_at < lim.d1),
      'entregados', count(*) filter (where entregado_at >= lim.d0 and entregado_at < lim.d1),
      'cancelados_de_las_solicitudes', count(*) filter (where created_at >= lim.d0 and created_at < lim.d1 and estado = 'cancelado'),
      'venta_aceptada_mxn', round(coalesce(sum(total_aceptado) filter (where aceptada_at >= lim.d0 and aceptada_at < lim.d1), 0) / 100.0, 2),
      'cobrado_mxn', round(coalesce((select sum(importe) from pagos where created_at >= lim.d0 and created_at < lim.d1), 0) / 100.0, 2),
      'horas_mediana_solicitud_a_cotizacion', round((percentile_cont(0.5) within group (order by extract(epoch from (cotizada_at - created_at)) / 3600)
         filter (where cotizada_at >= lim.d0 and cotizada_at < lim.d1))::numeric, 1)
    ) from local, lim group by lim.d0, lim.d1),
  'por_dia', (select coalesce(jsonb_agg(jsonb_build_object(
      'fecha', d.fecha,
      'solicitudes', (select count(*) from local where dia_sol = d.fecha),
      'cotizaciones_enviadas', (select count(*) from local where dia_cot = d.fecha),
      'aceptadas', (select count(*) from local where dia_acep = d.fecha),
      'cobrado_mxn', round(coalesce((select sum(importe) from pagos where (created_at at time zone 'America/Mexico_City')::date = d.fecha), 0) / 100.0, 2)
    ) order by d.fecha), '[]'::jsonb) from dias d),
  'ahora', (select jsonb_build_object(
      'por_cotizar', count(*) filter (where cotizada_at is null and estado in ('nuevo', 'contactado') and archivado_at is null),
      'cotizadas_sin_aceptar', count(*) filter (where cotizada_at is not null and aceptada_at is null and estado <> 'cancelado' and archivado_at is null),
      'en_produccion', count(*) filter (where estado in ('confirmado', 'produccion') and archivado_at is null),
      'pedidos_con_saldo', count(*) filter (where saldo > 0 and estado <> 'cancelado'),
      'saldo_por_cobrar_mxn', round(coalesce(sum(saldo) filter (where estado <> 'cancelado'), 0) / 100.0, 2)
    ) from local),
  'seguimiento_48h', (select coalesce(jsonb_agg(jsonb_build_object('folio', folio, 'etapa', etapa, 'horas_sin_mover', horas_sin_mover, 'saldo_mxn', saldo_mxn)
      order by horas_sin_mover desc), '[]'::jsonb) from seg where etapa is not null),
  'excluidos_como_prueba', (select count(*) from base where es_prueba)
);
$$;
comment on function public.zain_embudo(date, date, date) is 'Embudo agregado para el analista diario. Pruebas: antes del corte, con NO COTIZAR/prueba en la nota interna o en la papelera sin cotizar.';
revoke all on function public.zain_embudo(date, date, date) from public, anon, authenticated;
grant execute on function public.zain_embudo(date, date, date) to service_role;
