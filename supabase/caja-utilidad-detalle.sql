-- 27-nov-2026 (JP): desglose de la tarjeta «Por repartir». Qué pedido cerrado le toca a cada socio, los gastos e
-- ingresos generales al 50/50 y lo ya repartido; y la utilidad que llevan los pedidos aprobados que faltan por cerrar
-- (venta menos el costo cotizado o los gastos ya registrados, el mayor). Usa las mismas reglas que zain_caja_resumen:
-- parte de JP = utilidad × reparto / 10000 (entero), García = el resto; generales: JP la mitad entera, García el resto.
-- Solo lectura. Privado: service_role a través de la API del equipo. Posterior a iva-oficinas-anticipo.
begin;
create or replace function public.zain_caja_utilidad_detalle()
returns jsonb language sql stable security invoker set search_path='' as $$
 with base as(
  select f.*,p.folio,p.estado as estado_pedido,to_jsonb(p)->'cliente'->>'nombre' as cliente,p.created_at as creado
  from public.zain_finanzas_estado f join public.zain_pedidos p on p.id=f.id
  where p.archivado_at is null and p.estado<>'cancelado'
 ),
 cerrados as(
  select b.*,(b.utilidad*b.reparto_bp/10000)::bigint as parte_jp from base b where b.cerrado_at is not null and b.utilidad is not null
 ),
 abiertos as(
  select b.*,case when b.utilidad is null then null else (b.utilidad*b.reparto_bp/10000)::bigint end as parte_jp from base b
  where b.cerrado_at is null and b.estado_pedido in ('aceptado','confirmado','produccion','entregado') and b.venta_total is not null
 ),
 generales as(
  select coalesce(sum(case when tipo='ingreso' then importe else 0 end),0)::bigint as ingresos,
   coalesce(sum(case when tipo='gasto' then importe-iva_recuperable else 0 end),0)::bigint as gastos,
   count(*) as movimientos
  from public.zain_movimientos_generales where anulado_at is null and tipo in ('gasto','ingreso') and categoria<>'Aportación de capital'
 ),
 repartos as(
  select id,destino,importe,concepto,fecha from public.zain_caja_movimientos where tipo='reparto' and anulado_at is null
 )
 select jsonb_build_object(
  'version',1,
  'cerrados',coalesce((select jsonb_agg(jsonb_build_object('id',id,'folio',folio,'cliente',cliente,'cerrado',(cerrado_at at time zone 'America/Mexico_City')::date,
    'venta',venta_total,'costo',costo,'utilidad',utilidad,'reparto_bp',reparto_bp,'juan_pablo',parte_jp,'garcia',utilidad-parte_jp) order by cerrado_at desc) from cerrados),'[]'::jsonb),
  'generales',(select jsonb_build_object('ingresos',ingresos,'gastos',gastos,'neto',ingresos-gastos,'movimientos',movimientos,
    'juan_pablo',(ingresos-gastos)/2,'garcia',(ingresos-gastos)-(ingresos-gastos)/2) from generales),
  'repartos',coalesce((select jsonb_agg(jsonb_build_object('id',id,'destino',destino,'importe',importe,'concepto',concepto,'fecha',fecha) order by fecha desc) from repartos),'[]'::jsonb),
  'por_cerrar',coalesce((select jsonb_agg(jsonb_build_object('id',id,'folio',folio,'cliente',cliente,'estado',estado_pedido,
    'venta',venta_total,'cobrado',cobrado,'por_cobrar',greatest(venta_total-cobrado,0),'gastos',base_real+extras,'costo_cotizado',base_estimada,
    'costo',costo,'utilidad',utilidad,'reparto_bp',reparto_bp,'juan_pablo',parte_jp,'garcia',utilidad-parte_jp) order by creado desc) from abiertos),'[]'::jsonb)
 );
$$;
revoke all on function public.zain_caja_utilidad_detalle() from public,anon,authenticated;
grant execute on function public.zain_caja_utilidad_detalle() to service_role;
commit;
