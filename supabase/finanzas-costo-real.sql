-- 17-oct-2026: cotizaciones publicadas con precio directo (sin costos) calculan utilidad provisional
-- en cuanto se registra material real (gastos 'base'). Mismas columnas y permisos que gastos-cierre.sql.
create or replace view public.zain_finanzas_estado with(security_invoker=true) as
with datos as(
 select p.id,p.estado,p.archivado_at,(q.publicada->>'revision')::integer as revision,
 (q.publicada->>'subtotal')::bigint as venta,(q.publicada->>'total')::bigint as venta_total,
 (h.borrador->>'costo')::bigint as base_estimada,c.version,c.cerrado_at,case when c.pedido_id is null then 5000 else c.reparto_bp end as reparto_bp,
 coalesce(m.base_real,0)::bigint as base_real,coalesce(m.extras,0)::bigint as extras,
 coalesce(m.gastos,0)::bigint as gastos_pagados,coalesce(m.jp,0)::bigint as jp,coalesce(m.ga,0)::bigint as ga,
 coalesce(m.rjp,0)::bigint as rjp,coalesce(m.rga,0)::bigint as rga,coalesce(pg.recibido,0)::bigint as cobrado
 from public.zain_pedidos p left join public.zain_cotizaciones q on q.pedido_id=p.id
 left join public.zain_cotizaciones_historial h on h.pedido_id=p.id and h.version=(q.publicada->>'revision')::integer and h.modo='publicar'
 left join public.zain_pedido_cuentas c on c.pedido_id=p.id
 left join lateral(select
  sum(importe-iva_recuperable) filter(where tipo='gasto' and grupo='base') as base_real,
  sum(importe-iva_recuperable) filter(where tipo='gasto' and grupo='extra') as extras,
  sum(importe) filter(where tipo='gasto') as gastos,
  sum(importe) filter(where tipo='gasto' and persona='juan_pablo') as jp,
  sum(importe) filter(where tipo='gasto' and persona='garcia') as ga,
  sum(importe) filter(where tipo='reembolso' and persona='juan_pablo') as rjp,
  sum(importe) filter(where tipo='reembolso' and persona='garcia') as rga
  from public.zain_pedido_movimientos where pedido_id=p.id and anulado_at is null) m on true
 left join lateral(select sum(importe) as recibido from public.zain_pagos where pedido_id=p.id and revision=(q.publicada->>'revision')::integer) pg on true
 where p.guardado_at is not null
), costos as(
 select *,case when cerrado_at is not null then base_real+extras
  when base_estimada is not null then greatest(base_estimada,base_real)+extras
  -- Cotización publicada sin costos (precio directo): usar el material real registrado; sin él, sigue pendiente.
  when base_real>0 then base_real+extras else null end::bigint as costo
 from datos
)
select *,case when venta is null or costo is null then null else venta-costo end::bigint as utilidad,
 (cerrado_at is null) as provisional,(jp-rjp)::bigint as debe_jp,(ga-rga)::bigint as debe_garcia
from costos;
revoke all on public.zain_finanzas_estado from public,anon,authenticated,service_role;
grant select on public.zain_finanzas_estado to service_role;
