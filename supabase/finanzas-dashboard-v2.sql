-- 17-oct-2026: dashboard con por cobrar (total con impuesto − pagos verificados) y pedidos entregados por mes.
create or replace function public.zain_finanzas_dashboard(p_anio integer)
returns jsonb language sql stable security invoker set search_path='' as $$
 with meses as(select generate_series(1,12) as mes),
 ped as(
  select extract(month from p.created_at at time zone 'America/Mexico_City')::integer as mes,f.venta,f.costo,f.utilidad,f.venta_total,f.cobrado,p.estado='entregado' as entregado,p.estado in ('aceptado','confirmado','produccion','entregado') as vendido
  from public.zain_pedidos p join public.zain_finanzas_estado f on f.id=p.id
  where p.archivado_at is null and p.estado<>'cancelado' and f.venta is not null
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
   coalesce((select sum(venta) from ped where ped.mes=m.mes and not vendido),0)::bigint as cotizado,
   coalesce((select sum(greatest(venta_total-cobrado,0)) from ped where ped.mes=m.mes and vendido),0)::bigint as por_cobrar,
   (select count(*) from ped where ped.mes=m.mes and entregado)::integer as entregados,
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
  'anio',p_anio,
  'meses',(select jsonb_agg(to_jsonb(por_mes) order by mes) from por_mes),
  'categorias',coalesce((select jsonb_agg(jsonb_build_object('categoria',categoria,'total',total) order by total desc) from (select categoria,sum(neto)::bigint as total from gen where tipo='gasto' group by categoria) c),'[]'::jsonb),
  'personas',(select jsonb_object_agg(persona,jsonb_build_object('generales',generales::bigint,'pedidos',pedidos::bigint,'total',(generales+pedidos)::bigint)) from personas)
 );
$$;
revoke all on function public.zain_finanzas_dashboard(integer) from public,anon,authenticated;
grant execute on function public.zain_finanzas_dashboard(integer) to service_role;
