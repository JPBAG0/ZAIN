-- 23-oct-2026: Caja ZAIN tipo Tricount. Quién recibió cada cobro, transferencias entre socios y caja,
-- reparto de utilidades pagado y saldos en vivo calculados con los mismos movimientos.
-- Privado: RLS sin políticas, solo service_role a través de la API del equipo. Posterior a gastos-cierre,
-- finanzas-generales y confirmacion-cotizaciones. No reescribe movimientos ni pagos existentes.
begin;
-- Cobros: por omisión entraron a la Caja ZAIN; se corrige si los recibió un socio.
alter table public.zain_pagos add column recibio text not null default 'zain' check(recibio in ('juan_pablo','garcia','zain'));
grant update(recibio) on public.zain_pagos to service_role;

create table public.zain_caja_movimientos(
 id uuid primary key,
 tipo text not null check(tipo in ('transferencia','reparto')),
 origen text not null check(origen in ('juan_pablo','garcia','zain')),
 destino text not null check(destino in ('juan_pablo','garcia','zain')),
 concepto text not null check(length(concepto) between 1 and 180),
 importe bigint not null check(importe between 1 and 100000000000),
 fecha date not null,
 actor uuid not null references auth.users(id),created_at timestamptz not null default now(),
 anulado_at timestamptz,anulado_por uuid references auth.users(id),motivo text,
 check(origen<>destino and 'zain' in (origen,destino)),
 check(tipo<>'reparto' or (origen='zain' and destino<>'zain')),
 check(anulado_at is null or (anulado_por is not null and length(motivo)>=5))
);
create index zain_caja_movimientos_fecha on public.zain_caja_movimientos(fecha desc,created_at desc);
alter table public.zain_caja_movimientos enable row level security;
revoke all on public.zain_caja_movimientos from public,anon,authenticated,service_role;
grant select,insert on public.zain_caja_movimientos to service_role;
grant update(anulado_at,anulado_por,motivo) on public.zain_caja_movimientos to service_role;

-- Libro único. efecto_caja: cuánto sube o baja la Caja ZAIN. efecto_socio: cuánto cambia lo que ZAIN le debe
-- a ese socio (positivo = ZAIN le debe más). Los reembolsos salen de la caja. El dinero es real aunque el
-- pedido esté en papelera; en_papelera permite avisarlo.
create function public.zain_caja_libro()
returns table(id uuid,origen text,tipo text,persona text,destino text,concepto text,importe bigint,fecha date,created_at timestamptz,pedido_id uuid,folio text,en_papelera boolean,efecto_caja bigint,efecto_socio bigint)
language sql stable security invoker set search_path='' as $$
 select g.id,'pago',('cobro')::text,g.recibio,null::text,coalesce(nullif(g.referencia,''),'Pago del cliente'),g.importe,(g.created_at at time zone 'America/Mexico_City')::date,g.created_at,g.pedido_id,p.folio,p.archivado_at is not null,
  case when g.recibio='zain' then g.importe else 0 end,case when g.recibio='zain' then 0 else -g.importe end
 from public.zain_pagos g join public.zain_pedidos p on p.id=g.pedido_id
 union all
 select m.id,'pedido',m.tipo,m.persona,null,m.concepto,m.importe,m.fecha,m.created_at,m.pedido_id,p.folio,p.archivado_at is not null,
  case when m.tipo='reembolso' or m.persona='zain' then -m.importe else 0 end,
  case when m.persona='zain' then 0 when m.tipo='reembolso' then -m.importe else m.importe end
 from public.zain_pedido_movimientos m join public.zain_pedidos p on p.id=m.pedido_id where m.anulado_at is null
 union all
 select m.id,'general',m.tipo,m.persona,null,m.concepto,m.importe,m.fecha,m.created_at,null,null,false,
  case when m.tipo='reembolso' then -m.importe when m.persona<>'zain' then 0 when m.tipo='ingreso' then m.importe else -m.importe end,
  case when m.persona='zain' then 0 when m.tipo='gasto' then m.importe else -m.importe end
 from public.zain_movimientos_generales m where m.anulado_at is null
 union all
 select c.id,'caja',c.tipo,case when c.origen='zain' then c.destino else c.origen end,c.destino,c.concepto,c.importe,c.fecha,c.created_at,null,null,false,
  case when c.origen='zain' then -c.importe else c.importe end,
  case when c.tipo='reparto' then 0 when c.origen='zain' then -c.importe else c.importe end
 from public.zain_caja_movimientos c where c.anulado_at is null;
$$;

-- Saldos y reparto. Utilidad cerrada = pedidos con cierre (fuera de papelera y cancelados) según su reparto,
-- más el neto de movimientos generales 50/50 (sin aportaciones de capital). Provisional = vendidos sin cierre.
create function public.zain_caja_resumen()
returns jsonb language sql stable security invoker set search_path='' as $$
 with libro as(select * from public.zain_caja_libro()),
 cerrados as(
  select f.utilidad,f.reparto_bp from public.zain_finanzas_estado f join public.zain_pedidos p on p.id=f.id
  where f.cerrado_at is not null and p.archivado_at is null and p.estado<>'cancelado' and f.utilidad is not null
 ),
 generales as(
  select coalesce(sum(case when tipo='ingreso' then importe else -(importe-iva_recuperable) end),0)::bigint as neto
  from public.zain_movimientos_generales where anulado_at is null and tipo in ('gasto','ingreso') and categoria<>'Aportación de capital'
 ),
 toca as(
  select coalesce(sum(utilidad*reparto_bp/10000),0)::bigint+(select neto from generales)/2 as jp,
   coalesce(sum(utilidad-utilidad*reparto_bp/10000),0)::bigint+(select neto from generales)-(select neto from generales)/2 as ga
  from cerrados
 ),
 repartido as(
  select coalesce(sum(importe) filter(where destino='juan_pablo'),0)::bigint as jp,coalesce(sum(importe) filter(where destino='garcia'),0)::bigint as ga
  from public.zain_caja_movimientos where tipo='reparto' and anulado_at is null
 )
 select jsonb_build_object(
  'version',1,
  'caja',(select coalesce(sum(efecto_caja),0)::bigint from libro),
  'socios',jsonb_build_object(
   'juan_pablo',(select coalesce(sum(efecto_socio),0)::bigint from libro where persona='juan_pablo'),
   'garcia',(select coalesce(sum(efecto_socio),0)::bigint from libro where persona='garcia')),
  'utilidad',jsonb_build_object(
   'cerrada',(select coalesce(sum(utilidad),0)::bigint from cerrados)+(select neto from generales),
   'provisional',(select coalesce(sum(f.utilidad),0)::bigint from public.zain_finanzas_estado f where f.vendido and f.cerrado_at is null and f.utilidad is not null),
   'pedidos_cerrados',(select count(*) from cerrados),
   'toca',(select jsonb_build_object('juan_pablo',jp,'garcia',ga) from toca),
   'repartido',(select jsonb_build_object('juan_pablo',jp,'garcia',ga) from repartido),
   'por_repartir',(select jsonb_build_object('juan_pablo',t.jp-r.jp,'garcia',t.ga-r.ga) from toca t,repartido r)),
  'papelera',(select count(distinct pedido_id) from libro where en_papelera),
  'libro',coalesce((select jsonb_agg(to_jsonb(l) order by l.fecha desc,l.created_at desc) from (select * from libro order by fecha desc,created_at desc limit 400) l),'[]'::jsonb)
 );
$$;
revoke all on function public.zain_caja_libro(),public.zain_caja_resumen() from public,anon,authenticated;
grant execute on function public.zain_caja_libro(),public.zain_caja_resumen() to service_role;
commit;
