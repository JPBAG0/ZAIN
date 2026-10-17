-- 17-oct-2026: movimientos generales (gastos, ingresos y reembolsos que no son de un pedido) y dashboard.
-- Privado: RLS sin políticas, solo service_role a través de la API del equipo. Reparto 50/50 JP/García.
begin;
create table public.zain_general_archivos(
 id uuid primary key,objeto text not null unique,nombre text not null,mime text not null,
 bytes integer not null check(bytes between 1 and 4194304),hash text not null,
 actor uuid not null references auth.users(id),created_at timestamptz not null default now()
);
create table public.zain_movimientos_generales(
 id uuid primary key,
 tipo text not null check(tipo in ('gasto','ingreso','reembolso')),
 categoria text not null check(length(categoria) between 1 and 60),
 persona text not null check(persona in ('juan_pablo','garcia','zain')),
 concepto text not null check(length(concepto) between 1 and 180),
 importe bigint not null check(importe between 1 and 100000000000),
 iva_recuperable bigint not null default 0 check(iva_recuperable>=0 and iva_recuperable<=importe),
 fecha date not null,
 comprobante uuid unique references public.zain_general_archivos(id),
 actor uuid not null references auth.users(id),created_at timestamptz not null default now(),
 anulado_at timestamptz,anulado_por uuid references auth.users(id),motivo text,
 check(tipo='gasto' or iva_recuperable=0),
 check(tipo<>'reembolso' or persona<>'zain'),
 check(anulado_at is null or (anulado_por is not null and length(motivo)>=5))
);
create index zain_movimientos_generales_fecha on public.zain_movimientos_generales(fecha desc,created_at desc);
alter table public.zain_general_archivos enable row level security;
alter table public.zain_movimientos_generales enable row level security;
revoke all on public.zain_general_archivos,public.zain_movimientos_generales from public,anon,authenticated,service_role;
grant select,insert on public.zain_general_archivos to service_role;
grant select,insert on public.zain_movimientos_generales to service_role;
grant update(anulado_at,anulado_por,motivo) on public.zain_movimientos_generales to service_role;

-- Dashboard anual. Pedidos por mes de solicitud (CDMX); excluye cancelados y papelera.
-- Venta = pedidos aceptados en adelante; las cotizaciones publicadas sin aceptar se reportan como cotizado.
-- Utilidad neta = utilidad de pedidos con costo conocido + ingresos operativos − gastos generales.
-- Las aportaciones de capital no son utilidad: se reportan aparte.
create function public.zain_finanzas_dashboard(p_anio integer)
returns jsonb language sql stable security invoker set search_path='' as $$
 with meses as(select generate_series(1,12) as mes),
 ped as(
  select extract(month from p.created_at at time zone 'America/Mexico_City')::integer as mes,f.venta,f.costo,f.utilidad,p.estado in ('aceptado','confirmado','produccion','entregado') as vendido
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
commit;
