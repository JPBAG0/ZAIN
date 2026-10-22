-- 22-oct-2026: ventas reales, saldos y negociación separados. Aplicar DESPUÉS de
-- gastos-cierre.sql, finanzas-generales.sql, finanzas-costo-real.sql,
-- finanzas-dashboard-v2.sql y cotizaciones-modelos.sql. No reescribe datos.
-- Importes en centavos. Vendido/por cobrar/negociación incluyen IVA;
-- ventas/costo/utilidad conservan su base sin IVA para calcular el margen.
-- Sin porcentaje histórico: solo el cobro total demuestra anticipo cubierto.
-- Modelos sin cantidades: contar casos, nunca sumar precios «desde».
begin;
create or replace view public.zain_finanzas_estado with(security_invoker=true) as
with datos as(
 select p.id,p.estado,p.archivado_at,(q.publicada->>'revision')::integer as revision,
 (q.publicada->>'subtotal')::bigint as venta,(q.publicada->>'total')::bigint as venta_total,
 (q.publicada->'pagos'->>'anticipo')::integer as anticipo_bp,
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
select id,estado,archivado_at,revision,venta,venta_total,base_estimada,version,cerrado_at,reparto_bp,base_real,extras,gastos_pagados,jp,ga,rjp,rga,cobrado,costo,case when venta is null or costo is null then null else venta-costo end::bigint as utilidad,
 (cerrado_at is null) as provisional,(jp-rjp)::bigint as debe_jp,(ga-rga)::bigint as debe_garcia
 ,anticipo_requerido,
 (archivado_at is null and estado in ('confirmado','produccion','entregado')
  and venta is not null and venta_total is not null and anticipo_requerido is not null and cobrado>=anticipo_requerido) as vendido,
 (archivado_at is null and estado in ('nuevo','contactado','cotizado','aceptado')
  and (cobrado=0 or anticipo_requerido is null or cobrado<anticipo_requerido)) as en_negociacion
from (select *,case when anticipo_bp is null then venta_total
 when anticipo_bp between 0 and 10000 then (venta_total*anticipo_bp+5000)/10000
 else null end::bigint as anticipo_requerido from costos) clasificados;

create or replace function public.zain_finanzas_panel(p_estado text,p_q text,p_papelera boolean,p_semana boolean,p_offset integer)
returns jsonb language sql stable security invoker set search_path='' as $$
 with filtrados as materialized(
 select p.id,p.folio,p.created_at,p.guardado_at,p.archivado_at,p.estado,p.total,p.version,p.items,to_jsonb(f) as finanzas
 from public.zain_pedidos p join public.zain_finanzas_estado f on f.id=p.id
 where (p.archivado_at is not null)=p_papelera and (coalesce(p_estado,'')='' or p.estado=p_estado)
 and (coalesce(p_q,'')='' or p.folio ilike '%'||p_q||'%')
 and (not p_semana or p.created_at>=date_trunc('week',now() at time zone 'America/Mexico_City') at time zone 'America/Mexico_City')
 ), vendidos as materialized(select * from filtrados where (finanzas->>'vendido')::boolean),
 negociacion as materialized(select * from filtrados where (finanzas->>'en_negociacion')::boolean),
 pagina as(select * from filtrados order by case when p_papelera then archivado_at end desc,created_at desc,id desc limit 20 offset greatest(0,least(p_offset,100000)))
 select jsonb_build_object('pedidos',coalesce((select jsonb_agg(to_jsonb(p) order by case when p_papelera then p.archivado_at end desc,p.created_at desc,p.id desc) from pagina p),'[]'::jsonb),
 'siguiente',(select count(*)>p_offset+20 from filtrados),
 'finanzas',jsonb_build_object('version_ventas',1,'pedidos',(select count(*) from filtrados),
 'cotizados',(select count(*) from filtrados where estado<>'cancelado' and archivado_at is null and finanzas->>'venta' is not null),
 'vendidos',(select count(*) from vendidos),
 'vendido',(select coalesce(sum((finanzas->>'venta_total')::bigint),0) from vendidos),
 'venta',(select coalesce(sum((finanzas->>'venta')::bigint),0) from vendidos),
 'cobrado',(select coalesce(sum((finanzas->>'cobrado')::bigint),0) from vendidos),
 'por_cobrar',(select coalesce(sum(greatest((finanzas->>'venta_total')::bigint-(finanzas->>'cobrado')::bigint,0)),0) from vendidos),
 'en_negociacion',(select coalesce(sum((finanzas->>'venta_total')::bigint),0) from negociacion),
 'negociacion_pedidos',(select count(*) from negociacion),
 'negociacion_sin_importe',(select count(*) from negociacion where finanzas->>'venta_total' is null),
 'cotizaciones_modelos',(select count(*) from public.zain_cotizaciones_modelos c where not p_papelera and c.estado in ('enviada','autorizada') and c.pedido_id is null
   and coalesce(p_estado,'')='' and (coalesce(p_q,'')='' or c.folio ilike '%'||p_q||'%')
   and (not p_semana or c.created_at>=date_trunc('week',now() at time zone 'America/Mexico_City') at time zone 'America/Mexico_City')),
 'sin_anticipo',(select count(*) from filtrados where archivado_at is null and estado in ('confirmado','produccion','entregado') and not (finanzas->>'vendido')::boolean),
 'costo',(select case when count(*) filter(where finanzas->>'costo' is null)>0 then null else coalesce(sum((finanzas->>'costo')::bigint),0) end from vendidos),
 'utilidad',(select case when count(*) filter(where finanzas->>'utilidad' is null)>0 then null else coalesce(sum((finanzas->>'utilidad')::bigint),0) end from vendidos),
 'pendientes',(select count(*) from vendidos where finanzas->>'costo' is null),
 'provisionales',(select count(*) from vendidos where (finanzas->>'provisional')::boolean),
 'por_cobrar_pedidos',coalesce((select jsonb_agg(jsonb_build_object('id',id,'folio',folio,'venta_total',(finanzas->>'venta_total')::bigint,'cobrado',(finanzas->>'cobrado')::bigint,'saldo',greatest((finanzas->>'venta_total')::bigint-(finanzas->>'cobrado')::bigint,0)) order by created_at,id) from vendidos where (finanzas->>'venta_total')::bigint>(finanzas->>'cobrado')::bigint),'[]'::jsonb)))
$$;
create or replace function public.zain_finanzas_dashboard(p_anio integer)
returns jsonb language sql stable security invoker set search_path='' as $$
 with meses as(select generate_series(1,12) as mes),
 ped as(
  select extract(month from p.created_at at time zone 'America/Mexico_City')::integer as mes,f.venta,f.costo,f.utilidad,f.venta_total,f.cobrado,p.id,p.folio,p.created_at,p.estado,p.estado='entregado' as entregado,f.vendido,f.en_negociacion
  from public.zain_pedidos p join public.zain_finanzas_estado f on f.id=p.id
  where p.archivado_at is null and p.estado<>'cancelado' and p.guardado_at is not null
   and extract(year from p.created_at at time zone 'America/Mexico_City')=p_anio
 ),
 gen as(
  select extract(month from fecha)::integer as mes,tipo,categoria,importe-iva_recuperable as neto
  from public.zain_movimientos_generales where anulado_at is null and extract(year from fecha)=p_anio
 ),
 por_mes as(
  select m.mes,
   coalesce((select sum(venta) from ped where ped.mes=m.mes and vendido),0)::bigint as ventas,
   coalesce((select sum(costo) from ped where ped.mes=m.mes and vendido and costo is not null),0)::bigint as costo_pedidos,
   coalesce((select sum(utilidad) from ped where ped.mes=m.mes and vendido and utilidad is not null),0)::bigint as utilidad_pedidos,
   (select count(*) from ped where ped.mes=m.mes and vendido and costo is null)::integer as pedidos_sin_costo,
   (select count(*) from ped where ped.mes=m.mes and vendido)::integer as pedidos,
   coalesce((select sum(venta_total) from ped where ped.mes=m.mes and en_negociacion),0)::bigint as cotizado,
   coalesce((select sum(venta_total) from ped where ped.mes=m.mes and vendido),0)::bigint as vendido,
   coalesce((select sum(venta_total) from ped where ped.mes=m.mes and en_negociacion),0)::bigint as en_negociacion,
   (select count(*) from ped where ped.mes=m.mes and en_negociacion)::integer as negociacion_pedidos,
   (select count(*) from ped where ped.mes=m.mes and en_negociacion and venta_total is null)::integer as negociacion_sin_importe,
   (select count(*) from public.zain_cotizaciones_modelos c where c.estado in ('enviada','autorizada') and c.pedido_id is null and extract(year from c.created_at at time zone 'America/Mexico_City')=p_anio and extract(month from c.created_at at time zone 'America/Mexico_City')=m.mes)::integer as cotizaciones_modelos,
   (select count(*) from ped where ped.mes=m.mes and estado in ('confirmado','produccion','entregado') and not vendido)::integer as sin_anticipo,
   coalesce((select sum(greatest(venta_total-cobrado,0)) from ped where ped.mes=m.mes and vendido),0)::bigint as por_cobrar,
   (select count(*) from ped where ped.mes=m.mes and entregado and vendido)::integer as entregados,
   coalesce((select sum(neto) from gen where gen.mes=m.mes and tipo='gasto'),0)::bigint as gastos_generales,
   coalesce((select sum(neto) from gen where gen.mes=m.mes and tipo='ingreso' and categoria<>'Aportación de capital'),0)::bigint as ingresos,
   coalesce((select sum(neto) from gen where gen.mes=m.mes and tipo='ingreso' and categoria='Aportación de capital'),0)::bigint as aportaciones
  from meses m
 ),
 personas as(
  select p.persona,
   coalesce((select sum(importe) from public.zain_movimientos_generales g where g.anulado_at is null and g.persona=p.persona and g.tipo='gasto'),0)
   -coalesce((select sum(importe) from public.zain_movimientos_generales g where g.anulado_at is null and g.persona=p.persona and g.tipo='reembolso'),0)
   -coalesce((select sum(importe) from public.zain_movimientos_generales g where g.anulado_at is null and g.persona=p.persona and g.tipo='ingreso'),0) as generales,
   coalesce((select sum(case when p.persona='juan_pablo' then f.debe_jp else f.debe_garcia end) from public.zain_finanzas_estado f join public.zain_pedidos x on x.id=f.id where x.archivado_at is null),0) as pedidos
  from (values('juan_pablo'),('garcia')) p(persona)
 )
 select jsonb_build_object(
  'version_ventas',1,'anio',p_anio,
  'por_cobrar_pedidos',coalesce((select jsonb_agg(jsonb_build_object('id',id,'folio',folio,'mes',mes,'venta_total',venta_total,'cobrado',cobrado,'saldo',greatest(venta_total-cobrado,0)) order by created_at,id) from ped where vendido and venta_total>cobrado),'[]'::jsonb),
  'meses',(select jsonb_agg(to_jsonb(por_mes) order by mes) from por_mes),
  'categorias',coalesce((select jsonb_agg(jsonb_build_object('categoria',categoria,'total',total) order by total desc) from (select categoria,sum(neto)::bigint as total from gen where tipo='gasto' group by categoria) c),'[]'::jsonb),
  'personas',(select jsonb_object_agg(persona,jsonb_build_object('generales',generales::bigint,'pedidos',pedidos::bigint,'total',(generales+pedidos)::bigint)) from personas)
 );
$$;

revoke all on public.zain_finanzas_estado from public,anon,authenticated,service_role;
grant select on public.zain_finanzas_estado to service_role;
revoke all on function public.zain_finanzas_panel(text,text,boolean,boolean,integer),public.zain_finanzas_dashboard(integer) from public,anon,authenticated;
grant execute on function public.zain_finanzas_panel(text,text,boolean,boolean,integer),public.zain_finanzas_dashboard(integer) to service_role;
commit;
