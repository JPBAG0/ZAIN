begin;
create table public.zain_pedido_cuentas(
 pedido_id uuid primary key references public.zain_pedidos(id),version integer not null default 0,
 cerrado_at timestamptz,cierre jsonb,reparto_bp integer default 5000 check(reparto_bp between 0 and 10000)
);
create table public.zain_gasto_archivos(
 id uuid primary key,pedido_id uuid not null references public.zain_pedidos(id),objeto text not null unique,
 nombre text not null,mime text not null,bytes integer not null check(bytes between 1 and 4194304),hash text not null,
 actor uuid not null references auth.users(id),created_at timestamptz not null default now()
);
create table public.zain_pedido_movimientos(
 id uuid primary key,pedido_id uuid not null references public.zain_pedidos(id),tipo text not null check(tipo in ('gasto','reembolso')),
 grupo text not null check(grupo in ('base','extra')),persona text not null check(persona in ('juan_pablo','garcia','zain')),
 concepto text not null check(length(concepto) between 1 and 180),importe bigint not null check(importe between 1 and 100000000000),
 iva_recuperable bigint not null default 0 check(iva_recuperable>=0 and iva_recuperable<=importe),fecha date not null,
 comprobante uuid unique references public.zain_gasto_archivos(id),actor uuid not null references auth.users(id),created_at timestamptz not null default now(),
 anulado_at timestamptz,anulado_por uuid references auth.users(id),motivo text,
 check(tipo='gasto' or (iva_recuperable=0 and persona<>'zain'))
);
create index zain_pedido_movimientos_por_pedido on public.zain_pedido_movimientos(pedido_id,created_at desc,id);
create index zain_gasto_archivos_por_pedido on public.zain_gasto_archivos(pedido_id);
create table public.zain_finanzas_eventos(
 request uuid primary key,pedido_id uuid not null references public.zain_pedidos(id),modo text not null,datos jsonb not null,antes jsonb,
 actor uuid not null references auth.users(id),created_at timestamptz not null default now(),version integer not null
);
create index zain_finanzas_eventos_por_pedido on public.zain_finanzas_eventos(pedido_id,created_at desc);
alter table public.zain_pedido_cuentas enable row level security;
alter table public.zain_pedido_movimientos enable row level security;
alter table public.zain_gasto_archivos enable row level security;
alter table public.zain_finanzas_eventos enable row level security;
revoke all on public.zain_pedido_cuentas,public.zain_pedido_movimientos,public.zain_gasto_archivos,public.zain_finanzas_eventos from public,anon,authenticated,service_role;
grant select,insert,update on public.zain_pedido_cuentas,public.zain_pedido_movimientos to service_role;
grant select,insert on public.zain_gasto_archivos,public.zain_finanzas_eventos to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('zain-gastos-comprobantes','zain-gastos-comprobantes',false,4194304,array['image/jpeg','image/png','image/webp','application/pdf']);

-- Costo de la revisión PUBLICADA, no el borrador que el equipo puede seguir editando.
create view public.zain_finanzas_estado with(security_invoker=true) as
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
  when base_estimada is not null then greatest(base_estimada,base_real)+extras else null end::bigint as costo
 from datos
)
select *,case when venta is null or costo is null then null else venta-costo end::bigint as utilidad,
 (cerrado_at is null) as provisional,(jp-rjp)::bigint as debe_jp,(ga-rga)::bigint as debe_garcia
from costos;
revoke all on public.zain_finanzas_estado from public,anon,authenticated,service_role;
grant select on public.zain_finanzas_estado to service_role;

create function public.zain_finanzas_ver(p_id uuid) returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('resumen',to_jsonb(f),'version',coalesce(f.version,0),'cierre',c.cierre,
 'movimientos',coalesce((select jsonb_agg(to_jsonb(m)-'actor'-'anulado_por' order by m.created_at desc,m.id) from public.zain_pedido_movimientos m where m.pedido_id=p_id),'[]'::jsonb))
 from public.zain_finanzas_estado f left join public.zain_pedido_cuentas c on c.pedido_id=f.id where f.id=p_id;
$$;

create function public.zain_finanzas_operar(p_id uuid,p_version integer,p_request uuid,p_modo text,p_datos jsonb,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare ped public.zain_pedidos;cuenta public.zain_pedido_cuentas;prev public.zain_finanzas_eventos;f public.zain_finanzas_estado;
 anterior jsonb;mov public.zain_pedido_movimientos;deuda bigint;persona text;importe bigint;iva bigint;grupo text;tipo text;comp uuid;
begin
 if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado';end if;
 select * into ped from public.zain_pedidos where id=p_id and guardado_at is not null and archivado_at is null for update;
 if not found then return jsonb_build_object('error','El pedido fue retirado. Restaura y actualiza antes de continuar.');end if;
 select * into prev from public.zain_finanzas_eventos where request=p_request;
 if found then
  if prev.pedido_id<>p_id or prev.modo<>p_modo or prev.datos<>p_datos then return jsonb_build_object('error','La solicitud ya se utilizó con otros datos.');end if;
  return public.zain_finanzas_ver(p_id);
 end if;
 if p_modo not in ('gasto','reembolso','anular','cerrar','reabrir','reparto') or p_request is null or p_version is null then return jsonb_build_object('error','Operación inválida.');end if;
 insert into public.zain_pedido_cuentas(pedido_id) values(p_id) on conflict do nothing;
 select * into cuenta from public.zain_pedido_cuentas where pedido_id=p_id for update;
 if cuenta.version<>p_version then return jsonb_build_object('error','Tu compañero actualizó los gastos. Pulsa Actualizar para verlos antes de guardar.');end if;
 if cuenta.cerrado_at is not null and p_modo not in ('reabrir','reembolso') then return jsonb_build_object('error','El cierre está guardado. Reabre con un motivo para corregir costos.');end if;
 if ped.estado='cancelado' and p_modo in ('gasto','cerrar') then return jsonb_build_object('error','Este pedido está cancelado.');end if;
 if p_modo in ('gasto','reembolso') then
  select * into f from public.zain_finanzas_estado where id=p_id;
  if p_modo='gasto' and f.gastos_pagados+(p_datos->>'importe')::bigint>100000000000 then return jsonb_build_object('error','Revisa el total acumulado de gastos.');end if;
  tipo=p_modo;persona=p_datos->>'persona';importe=(p_datos->>'importe')::bigint;iva=coalesce((p_datos->>'iva_recuperable')::bigint,0);grupo=p_datos->>'grupo';comp=(p_datos->>'comprobante')::uuid;
  if persona not in ('juan_pablo','garcia','zain') or importe is null or importe<1 or importe>100000000000 or iva<0 or iva>importe or length(trim(coalesce(p_datos->>'concepto','')))=0 or length(p_datos->>'concepto')>180 or grupo not in ('base','extra') or (p_datos->>'fecha')::date>(now() at time zone 'America/Mexico_City')::date then return jsonb_build_object('error','Revisa el concepto, la fecha, el importe y quién pagó.');end if;
  if tipo='reembolso' then
   select * into f from public.zain_finanzas_estado where id=p_id;deuda=case persona when 'juan_pablo' then f.debe_jp when 'garcia' then f.debe_garcia else -1 end;
   if importe>deuda or iva<>0 or (p_datos->>'verificado')::boolean is distinct from true then return jsonb_build_object('error','El reembolso no puede superar lo pendiente para esa persona.');end if;
  end if;
  if comp is not null and not exists(select 1 from public.zain_gasto_archivos where id=comp and pedido_id=p_id and actor=p_actor) then return jsonb_build_object('error','El comprobante no pertenece a este pedido y usuario.');end if;
  insert into public.zain_pedido_movimientos(id,pedido_id,tipo,grupo,persona,concepto,importe,iva_recuperable,fecha,comprobante,actor)
   values(p_request,p_id,tipo,grupo,persona,trim(p_datos->>'concepto'),importe,iva,(p_datos->>'fecha')::date,comp,p_actor);
 elsif p_modo='anular' then
  select * into mov from public.zain_pedido_movimientos where id=(p_datos->>'movimiento')::uuid and pedido_id=p_id and anulado_at is null for update;
  if not found or length(trim(coalesce(p_datos->>'motivo','')))<5 then return jsonb_build_object('error','Indica qué movimiento corriges y el motivo.');end if;
  if mov.tipo='gasto' and mov.persona<>'zain' then
   select * into f from public.zain_finanzas_estado where id=p_id;deuda=case mov.persona when 'juan_pablo' then f.debe_jp else f.debe_garcia end;
   if deuda<mov.importe then return jsonb_build_object('error','Ese gasto ya fue reembolsado. Corrige primero el reembolso.');end if;
  end if;
  update public.zain_pedido_movimientos set anulado_at=now(),anulado_por=p_actor,motivo=p_datos->>'motivo' where id=mov.id;
 elsif p_modo='cerrar' then
  select * into f from public.zain_finanzas_estado where id=p_id;
  if ped.estado<>'entregado' or f.venta_total is null or f.cobrado<f.venta_total or (p_datos->>'costos_completos')::boolean is distinct from true or (f.base_estimada>0 and f.base_real=0) then return jsonb_build_object('error','Para cerrar: pedido entregado, venta cobrada y costos base reales registrados y revisados.');end if;
  update public.zain_pedido_cuentas set cerrado_at=now() where pedido_id=p_id;
  select * into f from public.zain_finanzas_estado where id=p_id;
  update public.zain_pedido_cuentas set cierre=to_jsonb(f) where pedido_id=p_id;
 elsif p_modo='reabrir' then
  if cuenta.cerrado_at is null or length(trim(coalesce(p_datos->>'motivo','')))<5 then return jsonb_build_object('error','Indica un motivo para reabrir el cierre.');end if;
  -- El cierre anterior sigue en el evento para auditoría.
  anterior=cuenta.cierre;
  update public.zain_pedido_cuentas set cerrado_at=null,cierre=null where pedido_id=p_id;
 elsif p_modo='reparto' then
  if p_datos->>'juan_pablo_bp' is not null and ((p_datos->>'juan_pablo_bp')::integer not between 0 and 10000) then return jsonb_build_object('error','Revisa los porcentajes de reparto.');end if;
  update public.zain_pedido_cuentas set reparto_bp=(p_datos->>'juan_pablo_bp')::integer where pedido_id=p_id;
 end if;
 update public.zain_pedido_cuentas set version=version+1 where pedido_id=p_id returning * into cuenta;
 insert into public.zain_finanzas_eventos(request,pedido_id,modo,datos,antes,actor,version) values(p_request,p_id,p_modo,p_datos,anterior,p_actor,cuenta.version);
 insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,ped.estado,ped.estado,case p_modo when 'cerrar' then 'Cierre de costos reales revisado.' when 'reabrir' then 'Cierre reabierto: '||(p_datos->>'motivo') when 'reembolso' then 'Reembolso verificado registrado; no aumenta los costos.' else 'Registro interno de gastos actualizado.' end);
 return public.zain_finanzas_ver(p_id);
end;$$;

create function public.zain_finanzas_panel(p_estado text,p_q text,p_papelera boolean,p_semana boolean,p_offset integer)
returns jsonb language sql stable security invoker set search_path='' as $$
 with filtrados as materialized(
 select p.id,p.folio,p.created_at,p.guardado_at,p.archivado_at,p.estado,p.total,p.version,p.items,to_jsonb(f) as finanzas
 from public.zain_pedidos p join public.zain_finanzas_estado f on f.id=p.id
 where (p.archivado_at is not null)=p_papelera and (coalesce(p_estado,'')='' or p.estado=p_estado)
 and (coalesce(p_q,'')='' or p.folio ilike '%'||p_q||'%')
 and (not p_semana or p.created_at>=date_trunc('week',now() at time zone 'America/Mexico_City') at time zone 'America/Mexico_City')
 ), pagina as(select * from filtrados order by case when p_papelera then archivado_at end desc,created_at desc,id desc limit 20 offset greatest(0,least(p_offset,100000)))
 select jsonb_build_object('pedidos',coalesce((select jsonb_agg(to_jsonb(p) order by case when p_papelera then p.archivado_at end desc,p.created_at desc,p.id desc) from pagina p),'[]'::jsonb),
 'siguiente',(select count(*)>p_offset+20 from filtrados),
 'finanzas',jsonb_build_object('pedidos',(select count(*) from filtrados),'cotizados',(select count(*) from filtrados where estado<>'cancelado' and finanzas->>'venta' is not null),
 'venta',(select coalesce(sum((finanzas->>'venta')::bigint),0) from filtrados where estado<>'cancelado' and finanzas->>'venta' is not null),
 'costo',(select case when count(*) filter(where finanzas->>'costo' is null)>0 then null else coalesce(sum((finanzas->>'costo')::bigint),0) end from filtrados where estado<>'cancelado' and finanzas->>'venta' is not null),
 'utilidad',(select case when count(*) filter(where finanzas->>'utilidad' is null)>0 then null else coalesce(sum((finanzas->>'utilidad')::bigint),0) end from filtrados where estado<>'cancelado' and finanzas->>'venta' is not null),
 'pendientes',(select count(*) from filtrados where estado<>'cancelado' and finanzas->>'venta' is not null and finanzas->>'costo' is null),
 'provisionales',(select count(*) from filtrados where estado<>'cancelado' and finanzas->>'venta' is not null and (finanzas->>'provisional')::boolean)))
$$;
revoke all on function public.zain_finanzas_ver(uuid),public.zain_finanzas_operar(uuid,integer,uuid,text,jsonb,uuid),public.zain_finanzas_panel(text,text,boolean,boolean,integer) from public,anon,authenticated;
grant execute on function public.zain_finanzas_ver(uuid),public.zain_finanzas_operar(uuid,integer,uuid,text,jsonb,uuid),public.zain_finanzas_panel(text,text,boolean,boolean,integer) to service_role;
commit;
