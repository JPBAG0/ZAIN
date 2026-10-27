-- 26-oct-2026: tres cambios que pidió JP. Posterior a libro-comprobantes.sql y gastos-por-partida.sql.
-- 1) Todo con IVA. La venta del pedido (`venta`) pasa a ser el total cobrado con IVA, así que utilidad y margen
--    salen de venta con IVA menos costos con IVA. El IVA cobrado queda aparte (`iva_cobrado`) por si piden factura;
--    `venta_sin_iva` conserva el subtotal anterior.
-- 2) Cajas Oficina JP y Oficina García, independientes de Caja ZAIN y de los socios: pagan gastos, reciben cobros
--    e ingresos y transfieren entre cajas. Los reembolsos y el reparto siguen saliendo de la Caja ZAIN.
-- 3) Anticipo aceptado: si el cliente depositó menos del anticipo pactado, el equipo puede aceptar lo recibido
--    como anticipo de esa revisión y el pedido avanza a Confirmado. Además, el libro de Finanzas guarda la partida
--    de un gasto de pedido.
begin;

-- Personas y cajas.
alter table public.zain_pedido_movimientos drop constraint zain_pedido_movimientos_persona_check,
 add constraint zain_pedido_movimientos_persona_check check(persona in ('juan_pablo','garcia','zain','oficina_jp','oficina_garcia')),
 drop constraint zain_pedido_movimientos_check1,
 add constraint zain_pedido_movimientos_check1 check(tipo='gasto' or (iva_recuperable=0 and persona in ('juan_pablo','garcia')));
alter table public.zain_movimientos_generales drop constraint zain_movimientos_generales_persona_check,
 add constraint zain_movimientos_generales_persona_check check(persona in ('juan_pablo','garcia','zain','oficina_jp','oficina_garcia')),
 drop constraint zain_movimientos_generales_check2,
 add constraint zain_movimientos_generales_check2 check(tipo<>'reembolso' or persona in ('juan_pablo','garcia'));
alter table public.zain_pagos drop constraint zain_pagos_recibio_check,
 add constraint zain_pagos_recibio_check check(recibio in ('juan_pablo','garcia','zain','oficina_jp','oficina_garcia'));
alter table public.zain_caja_movimientos drop constraint zain_caja_movimientos_origen_check,drop constraint zain_caja_movimientos_destino_check,
 drop constraint zain_caja_movimientos_check,drop constraint zain_caja_movimientos_check1,
 add constraint zain_caja_movimientos_origen_check check(origen in ('juan_pablo','garcia','zain','oficina_jp','oficina_garcia')),
 add constraint zain_caja_movimientos_destino_check check(destino in ('juan_pablo','garcia','zain','oficina_jp','oficina_garcia')),
 add constraint zain_caja_movimientos_check check(origen<>destino and (origen in ('zain','oficina_jp','oficina_garcia') or destino in ('zain','oficina_jp','oficina_garcia'))),
 add constraint zain_caja_movimientos_check1 check(tipo<>'reparto' or (origen='zain' and destino in ('juan_pablo','garcia')));

-- Anticipo aceptado por revisión publicada.
alter table public.zain_pedido_cuentas add column anticipo_aceptado bigint check(anticipo_aceptado>0),add column anticipo_revision integer;
grant update(anticipo_aceptado,anticipo_revision) on public.zain_pedido_cuentas to service_role;

create or replace view public.zain_finanzas_estado with(security_invoker=true) as
with datos as(
 select p.id,p.estado,p.archivado_at,(q.publicada->>'revision')::integer as revision,
  (q.publicada->>'subtotal')::bigint as venta_sin_iva,(q.publicada->>'total')::bigint as venta_total,
  (q.publicada->'pagos'->>'anticipo')::integer as anticipo_bp,(h.borrador->>'costo')::bigint as base_estimada,
  c.version,c.cerrado_at,case when c.pedido_id is null then 5000 else c.reparto_bp end as reparto_bp,
  case when c.anticipo_revision=(q.publicada->>'revision')::integer then c.anticipo_aceptado end as anticipo_aceptado,
  coalesce(m.base_real,0)::bigint as base_real,coalesce(m.extras,0)::bigint as extras,coalesce(m.gastos,0)::bigint as gastos_pagados,
  coalesce(m.jp,0)::bigint as jp,coalesce(m.ga,0)::bigint as ga,coalesce(m.rjp,0)::bigint as rjp,coalesce(m.rga,0)::bigint as rga,
  coalesce(pg.recibido,0)::bigint as cobrado
 from public.zain_pedidos p
 left join public.zain_cotizaciones q on q.pedido_id=p.id
 left join public.zain_cotizaciones_historial h on h.pedido_id=p.id and h.version=(q.publicada->>'revision')::integer and h.modo='publicar'
 left join public.zain_pedido_cuentas c on c.pedido_id=p.id
 left join lateral(
  select sum(importe-iva_recuperable) filter(where tipo='gasto' and grupo='base') as base_real,
   sum(importe-iva_recuperable) filter(where tipo='gasto' and grupo='extra') as extras,
   sum(importe) filter(where tipo='gasto') as gastos,
   sum(importe) filter(where tipo='gasto' and persona='juan_pablo') as jp,
   sum(importe) filter(where tipo='gasto' and persona='garcia') as ga,
   sum(importe) filter(where tipo='reembolso' and persona='juan_pablo') as rjp,
   sum(importe) filter(where tipo='reembolso' and persona='garcia') as rga
  from public.zain_pedido_movimientos where pedido_id=p.id and anulado_at is null) m on true
 left join lateral(select sum(importe) as recibido from public.zain_pagos where pedido_id=p.id and revision=(q.publicada->>'revision')::integer) pg on true
 where p.guardado_at is not null
),costos as(
 select *,case when cerrado_at is not null then base_real+extras
  when base_estimada is not null then greatest(base_estimada,base_real)+extras
  when base_real>0 then base_real+extras end as costo,
  case when anticipo_bp is null then venta_total
   when anticipo_bp between 0 and 10000 then least((venta_total*anticipo_bp+5000)/10000,coalesce(anticipo_aceptado,venta_total)) end as anticipo_requerido
 from datos
)
select id,estado,archivado_at,revision,
 venta_total as venta,venta_total,base_estimada,version,cerrado_at,reparto_bp,base_real,extras,gastos_pagados,jp,ga,rjp,rga,cobrado,costo,
 case when venta_total is null or costo is null then null else venta_total-costo end as utilidad,
 cerrado_at is null as provisional,jp-rjp as debe_jp,ga-rga as debe_garcia,anticipo_requerido,
 archivado_at is null and estado in ('confirmado','produccion','entregado') and venta_total is not null and anticipo_requerido is not null and cobrado>=anticipo_requerido as vendido,
 archivado_at is null and estado in ('nuevo','contactado','cotizado','aceptado') and (cobrado=0 or anticipo_requerido is null or cobrado<anticipo_requerido) as en_negociacion,
 venta_sin_iva,venta_total-venta_sin_iva as iva_cobrado,anticipo_aceptado,
 case when anticipo_bp between 0 and 10000 then (venta_total*anticipo_bp+5000)/10000 end as anticipo_pactado
from costos;

-- Anticipo que hace avanzar el pedido: el pactado, o lo que el equipo aceptó para esta revisión si es menor.
create function public.zain_anticipo_requerido(p_id uuid)
returns bigint language sql stable security invoker set search_path='' as $$
 select anticipo_requerido from public.zain_finanzas_estado where id=p_id;
$$;

create function public.zain_anticipo_aceptar(p_id uuid,p_revision integer,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare pedido public.zain_pedidos;cot public.zain_cotizaciones;f public.zain_finanzas_estado;
begin
 if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado';end if;
 select * into pedido from public.zain_pedidos where id=p_id and guardado_at is not null and archivado_at is null for update;
 if not found or pedido.estado='cancelado' then return jsonb_build_object('error','Este pedido no está activo.');end if;
 select * into cot from public.zain_cotizaciones where pedido_id=p_id for update;
 if cot.publicada is null or (cot.publicada->>'revision')::integer is distinct from p_revision then return jsonb_build_object('error','La cotización cambió. Actualiza la ficha.');end if;
 if not exists(select 1 from public.zain_cotizacion_aceptaciones where pedido_id=p_id and revision=p_revision) then return jsonb_build_object('error','Primero registra la aceptación de la cotización.');end if;
 select * into f from public.zain_finanzas_estado where id=p_id;
 if f.cobrado<=0 then return jsonb_build_object('error','Primero registra el pago que recibiste.');end if;
 if f.anticipo_requerido is null or f.cobrado>=f.anticipo_requerido then return jsonb_build_object('error','El anticipo ya está cubierto.');end if;
 insert into public.zain_pedido_cuentas(pedido_id) values(p_id) on conflict do nothing;
 update public.zain_pedido_cuentas set anticipo_aceptado=f.cobrado,anticipo_revision=p_revision,version=version+1 where pedido_id=p_id;
 if pedido.estado='aceptado' then
  update public.zain_pedidos set estado='confirmado',version=version+1,updated_at=now() where id=p_id;
 else
  update public.zain_pedidos set version=version+1,updated_at=now() where id=p_id;
 end if;
 insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas)
  values(p_id,p_actor,pedido.estado,case when pedido.estado='aceptado' then 'confirmado' else pedido.estado end,
   'Anticipo aceptado por el equipo: '||to_char(f.cobrado/100.0,'FM999,999,990.00')||' de '||to_char(f.anticipo_requerido/100.0,'FM999,999,990.00')||' pactado.');
 return jsonb_build_object('ok',true);
end;$$;

create or replace function public.zain_seguimiento_cotizacion(p_id uuid)
returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('revision',(c.publicada->>'revision')::integer,'aceptada_at',a.aceptada_at,
  'total',(c.publicada->>'total')::bigint,
  'anticipo',case when c.publicada->'pagos'->>'anticipo' is null then null else f.anticipo_requerido end,
  'anticipo_pactado',f.anticipo_pactado,'anticipo_aceptado',f.anticipo_aceptado,
  'recibido',p.recibido,'saldo',(c.publicada->>'total')::bigint-p.recibido)
 from public.zain_cotizaciones c
 left join public.zain_cotizacion_aceptaciones a on a.pedido_id=c.pedido_id and a.revision=(c.publicada->>'revision')::integer
 left join lateral(select coalesce(sum(importe),0)::bigint as recibido from public.zain_pagos where pedido_id=c.pedido_id and revision=(c.publicada->>'revision')::integer) p on true
 left join public.zain_finanzas_estado f on f.id=c.pedido_id
 where c.pedido_id=p_id and c.publicada is not null;
$$;

create or replace function public.zain_registrar_pago(p_id uuid,p_revision integer,p_request uuid,p_importe bigint,p_referencia text,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $function$
declare pedido public.zain_pedidos;cot public.zain_cotizaciones;previo public.zain_pagos;total bigint;recibido bigint;objetivo bigint;porcentaje integer;
begin
 if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado';end if;
 select * into pedido from public.zain_pedidos where id=p_id and guardado_at is not null and archivado_at is null for update;
 if not found or pedido.estado='cancelado' then return null;end if;
 select * into cot from public.zain_cotizaciones where pedido_id=p_id for update;
 if not found or cot.publicada is null or (cot.publicada->>'revision')::integer<>p_revision then return null;end if;
 if not exists(select 1 from public.zain_cotizacion_aceptaciones where pedido_id=p_id and revision=p_revision) then return null;end if;
 total=(cot.publicada->>'total')::bigint;porcentaje=(cot.publicada->'pagos'->>'anticipo')::integer;
 if total is null or porcentaje is null or porcentaje<0 or porcentaje>10000 or p_importe is null or p_importe<=0 or p_importe>100000000000 or p_request is null or length(coalesce(p_referencia,''))>300 then return null;end if;
 select * into previo from public.zain_pagos where id=p_request;
 if found then
  if previo.pedido_id<>p_id or previo.revision<>p_revision or previo.importe<>p_importe or previo.referencia<>coalesce(p_referencia,'') then return null;end if;
  return jsonb_build_object('registrado',true,'repetido',true);
 end if;
 select coalesce(sum(importe),0) into recibido from public.zain_pagos where pedido_id=p_id and revision=p_revision;
 if recibido+p_importe>total then return null;end if;
 insert into public.zain_pagos(id,pedido_id,revision,importe,referencia,actor) values(p_request,p_id,p_revision,p_importe,coalesce(p_referencia,''),p_actor);
 objetivo=public.zain_anticipo_requerido(p_id);
 if recibido+p_importe>=objetivo and pedido.estado='aceptado' then
  update public.zain_pedidos set estado='confirmado',version=version+1,updated_at=now() where id=p_id;
  insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,pedido.estado,'confirmado','Anticipo verificado por el equipo; pedido listo para programar producción.');
 else
  update public.zain_pedidos set version=version+1,updated_at=now() where id=p_id;
  insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,pedido.estado,pedido.estado,'Pago verificado por el equipo y registrado en el seguimiento.');
 end if;
 return jsonb_build_object('registrado',true,'repetido',false);
end;$function$;

create or replace function public.zain_actualizar_pedido(p_id uuid,p_version integer,p_estado text,p_notas text,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $function$
declare old public.zain_pedidos; changed public.zain_pedidos;
begin
  if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
  select * into old from public.zain_pedidos where id=p_id and guardado_at is not null for update;
  if not found or old.version<>p_version then return null; end if;
  if p_estado='aceptado' and old.estado<>'aceptado' then return null;end if;
  if p_estado in ('nuevo','contactado','cotizado') and exists(select 1 from public.zain_cotizacion_aceptaciones a join public.zain_cotizaciones c on c.pedido_id=a.pedido_id and (c.publicada->>'revision')::integer=a.revision where a.pedido_id=p_id) then return null;end if;
  if p_estado in ('confirmado','produccion','entregado') and exists(select 1 from public.zain_cotizacion_aceptaciones a join public.zain_cotizaciones c on c.pedido_id=a.pedido_id and (c.publicada->>'revision')::integer=a.revision where a.pedido_id=p_id) then
   if (select coalesce(sum(p.importe),0) from public.zain_pagos p join public.zain_cotizaciones c on c.pedido_id=p.pedido_id and (c.publicada->>'revision')::integer=p.revision where p.pedido_id=p_id) < (select case when p_estado='entregado' then (publicada->>'total')::bigint else coalesce(public.zain_anticipo_requerido(p_id),(publicada->>'total')::bigint+1) end from public.zain_cotizaciones where pedido_id=p_id) then return null;end if;
  end if;
  update public.zain_pedidos set estado=p_estado,notas_internas=p_notas,version=version+1,updated_at=now() where id=p_id returning * into changed;
  insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,old.estado,p_estado,p_notas);
  return to_jsonb(changed);
end;
$function$;

create or replace function public.zain_finanzas_operar(p_id uuid,p_version integer,p_request uuid,p_modo text,p_datos jsonb,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $function$
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
 if p_modo not in ('gasto','reembolso','anular','editar','cerrar','reabrir','reparto') or p_request is null or p_version is null then return jsonb_build_object('error','Operación inválida.');end if;
 insert into public.zain_pedido_cuentas(pedido_id) values(p_id) on conflict do nothing;
 select * into cuenta from public.zain_pedido_cuentas where pedido_id=p_id for update;
 if cuenta.version<>p_version then return jsonb_build_object('error','Tu compañero actualizó los gastos. Pulsa Actualizar para verlos antes de guardar.');end if;
 if cuenta.cerrado_at is not null and p_modo not in ('reabrir','reembolso') then return jsonb_build_object('error','El cierre está guardado. Reabre con un motivo para corregir costos.');end if;
 if ped.estado='cancelado' and p_modo in ('gasto','cerrar') then return jsonb_build_object('error','Este pedido está cancelado.');end if;
 if p_modo in ('gasto','reembolso','editar') then
  persona=p_datos->>'persona';importe=(p_datos->>'importe')::bigint;iva=coalesce((p_datos->>'iva_recuperable')::bigint,0);grupo=p_datos->>'grupo';comp=(p_datos->>'comprobante')::uuid;
  if persona not in ('juan_pablo','garcia','zain','oficina_jp','oficina_garcia') or importe is null or importe<1 or importe>100000000000 or iva<0 or iva>importe or length(trim(coalesce(p_datos->>'concepto','')))=0 or length(p_datos->>'concepto')>180 or grupo not in ('base','extra') or (p_datos->>'fecha')::date>(now() at time zone 'America/Mexico_City')::date then return jsonb_build_object('error','Revisa el concepto, la fecha, el importe y quién pagó.');end if;
  if comp is not null and not exists(select 1 from public.zain_gasto_archivos where id=comp and pedido_id=p_id and actor=p_actor) then return jsonb_build_object('error','El comprobante no pertenece a este pedido y usuario.');end if;
 end if;
 if p_modo in ('gasto','reembolso') then
  select * into f from public.zain_finanzas_estado where id=p_id;
  if p_modo='gasto' and f.gastos_pagados+importe>100000000000 then return jsonb_build_object('error','Revisa el total acumulado de gastos.');end if;
  tipo=p_modo;
  if tipo='reembolso' then
   deuda=case persona when 'juan_pablo' then f.debe_jp when 'garcia' then f.debe_garcia else -1 end;
   if importe>deuda or iva<>0 or (p_datos->>'verificado')::boolean is distinct from true then return jsonb_build_object('error','El reembolso no puede superar lo pendiente para esa persona.');end if;
  end if;
  insert into public.zain_pedido_movimientos(id,pedido_id,tipo,grupo,persona,concepto,importe,iva_recuperable,fecha,comprobante,actor)
   values(p_request,p_id,tipo,grupo,persona,trim(p_datos->>'concepto'),importe,iva,(p_datos->>'fecha')::date,comp,p_actor);
 elsif p_modo='editar' then
  select * into mov from public.zain_pedido_movimientos where id=(p_datos->>'movimiento')::uuid and pedido_id=p_id and anulado_at is null for update;
  if not found or mov.tipo<>'gasto' then return jsonb_build_object('error','Solo se pueden editar gastos vigentes. Un reembolso se corrige anulándolo.');end if;
  -- Lo ya reembolsado a una persona no puede quedar sin respaldo al bajar el importe o cambiar quién pagó.
  if mov.persona in ('juan_pablo','garcia') and (persona<>mov.persona or importe<mov.importe) then
   select * into f from public.zain_finanzas_estado where id=p_id;deuda=case mov.persona when 'juan_pablo' then f.debe_jp else f.debe_garcia end;
   if deuda-(mov.importe-case when persona=mov.persona then importe else 0 end)<0 then return jsonb_build_object('error','Ese gasto ya fue reembolsado. Corrige primero el reembolso.');end if;
  end if;
  anterior=to_jsonb(mov)-'actor'-'anulado_por'-'editado_por';
  update public.zain_pedido_movimientos set grupo=p_datos->>'grupo',persona=p_datos->>'persona',concepto=trim(p_datos->>'concepto'),importe=(p_datos->>'importe')::bigint,iva_recuperable=coalesce((p_datos->>'iva_recuperable')::bigint,0),fecha=(p_datos->>'fecha')::date,comprobante=coalesce(comp,mov.comprobante),editado_at=now(),editado_por=p_actor where id=mov.id;
 elsif p_modo='anular' then
  select * into mov from public.zain_pedido_movimientos where id=(p_datos->>'movimiento')::uuid and pedido_id=p_id and anulado_at is null for update;
  if not found or length(trim(coalesce(p_datos->>'motivo','')))<5 then return jsonb_build_object('error','Indica qué movimiento corriges y el motivo.');end if;
  if mov.tipo='gasto' and mov.persona in ('juan_pablo','garcia') then
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
 insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,ped.estado,ped.estado,case p_modo when 'cerrar' then 'Cierre de costos reales revisado.' when 'reabrir' then 'Cierre reabierto: '||(p_datos->>'motivo') when 'reembolso' then 'Reembolso verificado registrado; no aumenta los costos.' when 'editar' then 'Gasto corregido: '||trim(p_datos->>'concepto') else 'Registro interno de gastos actualizado.' end);
 return public.zain_finanzas_ver(p_id);
end;$function$;

create or replace function public.zain_libro_operar(p_modo text,p_origen text,p_id uuid,p_datos jsonb,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
#variable_conflict use_variable
declare
 d jsonb:=coalesce(p_datos,'{}'::jsonb);tipo text:=d->>'tipo';ped uuid;destino text;nuevo uuid;antes jsonb;
 importe bigint;iva bigint;fecha date;concepto text;persona text;grupo text;categoria text;origen_c text;destino_c text;
 pedido public.zain_pedidos;cot public.zain_cotizaciones;rev integer;cuenta public.zain_pedido_cuentas;viejo_ped uuid;
 creado timestamptz;cobrado bigint;objetivo bigint;comp uuid:=nullif(p_datos->>'comprobante','')::uuid;
 partida integer;con_partida boolean:=coalesce(p_datos,'{}'::jsonb) ? 'partida';total_partidas integer;
begin
 if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado';end if;
 if p_modo not in ('guardar','borrar') or (p_id is null)<>(p_origen is null) or (p_origen is not null and p_origen not in ('pago','pedido','general','caja')) then return jsonb_build_object('error','Operación inválida.');end if;
 -- Estado anterior del registro que se corrige o borra.
 if p_id is not null then
  if p_origen='pago' then select to_jsonb(x) into antes from public.zain_pagos x where id=p_id;
  elsif p_origen='pedido' then select to_jsonb(x) into antes from public.zain_pedido_movimientos x where id=p_id and anulado_at is null;
  elsif p_origen='general' then select to_jsonb(x) into antes from public.zain_movimientos_generales x where id=p_id and anulado_at is null;
  else select to_jsonb(x) into antes from public.zain_caja_movimientos x where id=p_id and anulado_at is null;end if;
  if antes is null then return jsonb_build_object('error','Ese movimiento ya no existe o ya se borró. Actualiza la página.');end if;
  if p_origen='pedido' and exists(select 1 from public.zain_pedido_cuentas where pedido_id=(antes->>'pedido_id')::uuid and cerrado_at is not null) then
   return jsonb_build_object('error','Ese pedido ya está cerrado. Reabre su cierre en la pestaña Gastos para cambiar sus movimientos.');end if;
 end if;

 if p_modo='guardar' then
  ped=nullif(d->>'pedido_id','')::uuid;
  destino=case tipo when 'cobro' then 'pago' when 'gasto' then case when ped is null then 'general' else 'pedido' end when 'ingreso' then 'general'
   when 'reembolso' then case when ped is null then 'general' else 'pedido' end when 'transferencia' then 'caja' when 'reparto' then 'caja' end;
  if destino is null then return jsonb_build_object('error','Elige el tipo de movimiento.');end if;
  importe=(d->>'importe')::bigint;iva=coalesce((d->>'iva_recuperable')::bigint,0);fecha=(d->>'fecha')::date;
  concepto=trim(coalesce(d->>'concepto',''));persona=coalesce(d->>'persona','zain');grupo=coalesce(nullif(d->>'grupo',''),'base');categoria=coalesce(nullif(d->>'categoria',''),'Otros');
  if importe is null or importe<1 or importe>100000000000 then return jsonb_build_object('error','Revisa el importe.');end if;
  if fecha is null or fecha>(now() at time zone 'America/Mexico_City')::date then return jsonb_build_object('error','Revisa la fecha (no puede ser futura).');end if;
  if destino<>'pago' and (length(concepto)<1 or length(concepto)>180) then return jsonb_build_object('error','Escribe un concepto de hasta 180 caracteres.');end if;
  if persona not in ('juan_pablo','garcia','zain','oficina_jp','oficina_garcia') then return jsonb_build_object('error','Indica quién pagó o recibió el dinero.');end if;
  if tipo='reembolso' and persona not in ('juan_pablo','garcia') then return jsonb_build_object('error','El reembolso es para el socio que adelantó dinero.');end if;
  if iva<0 or iva>importe or (tipo<>'gasto' and iva<>0) then return jsonb_build_object('error','Revisa el impuesto recuperable.');end if;
  if grupo not in ('base','extra') then return jsonb_build_object('error','Elige si es material o gasto extra.');end if;
  if ped is not null then
   select * into pedido from public.zain_pedidos where id=ped and guardado_at is not null for update;
   if not found then return jsonb_build_object('error','No encontramos ese pedido.');end if;
   if pedido.archivado_at is not null then return jsonb_build_object('error','Ese pedido está en la papelera. Restáuralo antes de asignarle movimientos.');end if;
  end if;
  if destino='pago' and ped is null then return jsonb_build_object('error','Elige el pedido (folio) al que corresponde el cobro.');end if;
  if con_partida and tipo='gasto' and destino='pedido' then
   partida=nullif(d->>'partida','')::integer;
   if partida is not null then
    select jsonb_array_length(coalesce(h.borrador->'partidas','[]'::jsonb)) into total_partidas
    from public.zain_cotizaciones c join public.zain_cotizaciones_historial h on h.pedido_id=c.pedido_id and h.version=(c.publicada->>'revision')::integer and h.modo='publicar'
    where c.pedido_id=ped;
    if total_partidas is null or partida<0 or partida>=total_partidas then return jsonb_build_object('error','Elige una partida de la cotización publicada.');end if;
   end if;
  else con_partida=false;end if;
  if destino='pedido' then
   insert into public.zain_pedido_cuentas(pedido_id) values(ped) on conflict do nothing;
   select * into cuenta from public.zain_pedido_cuentas where pedido_id=ped for update;
   if cuenta.cerrado_at is not null then return jsonb_build_object('error','Ese pedido ya está cerrado. Reabre su cierre en la pestaña Gastos para agregarle movimientos.');end if;
  end if;
  if destino='caja' then
   if tipo='reparto' then origen_c='zain';destino_c=persona;
   else origen_c=d->>'origen_persona';destino_c=d->>'destino_persona';end if;
   if origen_c is null or destino_c is null or origen_c=destino_c or origen_c not in ('juan_pablo','garcia','zain','oficina_jp','oficina_garcia') or destino_c not in ('juan_pablo','garcia','zain','oficina_jp','oficina_garcia')
    or not (origen_c in ('zain','oficina_jp','oficina_garcia') or destino_c in ('zain','oficina_jp','oficina_garcia')) or (tipo='reparto' and destino_c not in ('juan_pablo','garcia')) then
    return jsonb_build_object('error','Una transferencia va entre dos cajas, o entre un socio y una caja.');end if;
  end if;
  if comp is not null then
   if tipo<>'gasto' or destino not in ('general','pedido') then return jsonb_build_object('error','Solo los gastos llevan comprobante.');end if;
   if destino='general' and not exists(select 1 from public.zain_general_archivos where id=comp and actor=p_actor) then return jsonb_build_object('error','Vuelve a adjuntar el comprobante.');end if;
   if destino='pedido' and not exists(select 1 from public.zain_gasto_archivos where id=comp and pedido_id=ped and actor=p_actor) then return jsonb_build_object('error','Vuelve a adjuntar el comprobante.');end if;
  end if;
  -- Un comprobante pertenece a su registro: no se mueve entre gastos generales y de pedido ni entre pedidos.
  if p_id is not null and antes->>'comprobante' is not null and not (destino=p_origen and (destino<>'pedido' or (antes->>'pedido_id')::uuid=ped)) then
   return jsonb_build_object('error','Este gasto tiene comprobante y no se puede mover a otro pedido o a generales. Bórralo y regístralo de nuevo con su comprobante.');end if;
  -- Reintento de la misma solicitud nueva: no duplica.
  if p_id is null then
   nuevo=(d->>'request')::uuid;if nuevo is null then return jsonb_build_object('error','Falta la referencia de la solicitud.');end if;
   if exists(select 1 from public.zain_pagos where id=nuevo) or exists(select 1 from public.zain_pedido_movimientos where id=nuevo) or exists(select 1 from public.zain_movimientos_generales where id=nuevo) or exists(select 1 from public.zain_caja_movimientos where id=nuevo) then return jsonb_build_object('ok',true,'repetido',true);end if;
  end if;
 end if;

 -- Corrección en el mismo lugar (mismo tipo de registro y, para gastos de pedido, mismo pedido).
 if p_modo='guardar' and p_id is not null and destino=p_origen and destino<>'pago' and (destino<>'pedido' or (antes->>'pedido_id')::uuid=ped) then
  if destino='pedido' then
   if (antes->>'tipo')<>tipo then return jsonb_build_object('error','Para cambiar entre gasto y reembolso, borra este y registra uno nuevo.');end if;
   update public.zain_pedido_movimientos set grupo=grupo,persona=persona,concepto=concepto,importe=importe,iva_recuperable=iva,fecha=fecha,comprobante=coalesce(comp,comprobante),editado_at=now(),editado_por=p_actor,
    partida=case when con_partida then partida else zain_pedido_movimientos.partida end where id=p_id;
   update public.zain_pedido_cuentas set version=version+1 where pedido_id=ped;
  elsif destino='general' then
   update public.zain_movimientos_generales set tipo=tipo,categoria=categoria,persona=persona,concepto=concepto,importe=importe,iva_recuperable=iva,fecha=fecha,comprobante=coalesce(comp,comprobante),editado_at=now(),editado_por=p_actor,anterior=antes where id=p_id;
  else
   update public.zain_caja_movimientos set origen=origen_c,destino=destino_c,concepto=concepto,importe=importe,fecha=fecha where id=p_id;
  end if;
  insert into public.zain_libro_historial(modo,origen,registro,antes,despues,actor) values('editar',p_origen,p_id,antes,d,p_actor);
  return jsonb_build_object('ok',true,'id',p_id);
 end if;

 -- Quitar el registro anterior (borrar, o corregir moviéndolo a otro tipo de registro o pedido).
 if p_id is not null then
  if p_origen='pago' then
   viejo_ped=(antes->>'pedido_id')::uuid;creado=(antes->>'created_at')::timestamptz;
   delete from public.zain_pagos where id=p_id;
   update public.zain_pedidos set version=version+1,updated_at=now() where id=viejo_ped;
   insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas)
    select viejo_ped,p_actor,estado,estado,case when p_modo='borrar' then 'Cobro borrado desde Finanzas: ' else 'Cobro corregido desde Finanzas: ' end||to_char((antes->>'importe')::bigint/100.0,'FM999,999,990.00') from public.zain_pedidos where id=viejo_ped;
  elsif p_origen='pedido' then
   update public.zain_pedido_movimientos set anulado_at=now(),anulado_por=p_actor,motivo=case when p_modo='borrar' then 'Borrado desde Finanzas' else 'Corregido desde Finanzas' end where id=p_id;
   update public.zain_pedido_cuentas set version=version+1 where pedido_id=(antes->>'pedido_id')::uuid;
  elsif p_origen='general' then
   update public.zain_movimientos_generales set anulado_at=now(),anulado_por=p_actor,motivo=case when p_modo='borrar' then 'Borrado desde Finanzas' else 'Corregido desde Finanzas' end where id=p_id;
  else
   update public.zain_caja_movimientos set anulado_at=now(),anulado_por=p_actor,motivo=case when p_modo='borrar' then 'Borrado desde Finanzas' else 'Corregido desde Finanzas' end where id=p_id;
  end if;
  if p_modo='borrar' then
   insert into public.zain_libro_historial(modo,origen,registro,antes,despues,actor) values('borrar',p_origen,p_id,antes,null,p_actor);
   return jsonb_build_object('ok',true);
  end if;
  -- Un cobro corregido conserva su id y su hora de registro; los demás movimientos movidos reciben un id nuevo.
  nuevo=case when p_origen='pago' and destino='pago' then p_id else gen_random_uuid() end;
 end if;

 if destino='pago' then
  select * into cot from public.zain_cotizaciones where pedido_id=ped for update;
  rev=(cot.publicada->>'revision')::integer;
  if rev is null then return jsonb_build_object('error','Ese pedido no tiene cotización publicada. Publícala antes de registrar el cobro.');end if;
  if not exists(select 1 from public.zain_cotizacion_aceptaciones where pedido_id=ped and revision=rev) then
   insert into public.zain_cotizacion_aceptaciones(pedido_id,revision,documento) values(ped,rev,cot.publicada||jsonb_build_object('aceptada_por','equipo','actor',p_actor));
   if pedido.estado in ('nuevo','contactado','cotizado') then
    update public.zain_pedidos set estado='aceptado',version=version+1,updated_at=now() where id=ped;
    insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(ped,p_actor,pedido.estado,'aceptado','El equipo registró un cobro: la revisión '||rev||' queda aceptada.');
    pedido.estado='aceptado';
   end if;
  end if;
  insert into public.zain_pagos(id,pedido_id,revision,importe,referencia,actor,recibio,fecha,created_at)
   values(nuevo,ped,rev,importe,left(concepto,300),p_actor,persona,fecha,coalesce(creado,now()));
  select coalesce(sum(x.importe),0) into cobrado from public.zain_pagos x where x.pedido_id=ped and x.revision=rev;
  objetivo=coalesce(public.zain_anticipo_requerido(ped),(cot.publicada->>'total')::bigint);
  if pedido.estado='aceptado' and cobrado>=objetivo then
   update public.zain_pedidos set estado='confirmado',version=version+1,updated_at=now() where id=ped;
   insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(ped,p_actor,'aceptado','confirmado','Anticipo cubierto con un cobro registrado en Finanzas.');
  else
   update public.zain_pedidos set version=version+1,updated_at=now() where id=ped;
   insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(ped,p_actor,pedido.estado,pedido.estado,'Cobro registrado desde Finanzas: '||to_char(importe/100.0,'FM999,999,990.00'));
  end if;
 elsif destino='pedido' then
  insert into public.zain_pedido_movimientos(id,pedido_id,tipo,grupo,persona,concepto,importe,iva_recuperable,fecha,comprobante,actor,partida)
   values(nuevo,ped,tipo,case when tipo='reembolso' then 'extra' else grupo end,persona,concepto,importe,iva,fecha,comp,p_actor,case when con_partida then partida end);
  update public.zain_pedido_cuentas set version=version+1 where pedido_id=ped;
 elsif destino='general' then
  insert into public.zain_movimientos_generales(id,tipo,categoria,persona,concepto,importe,iva_recuperable,fecha,comprobante,actor)
   values(nuevo,tipo,case when tipo='reembolso' then 'Reembolso' else categoria end,persona,concepto,importe,iva,fecha,comp,p_actor);
 else
  insert into public.zain_caja_movimientos(id,tipo,origen,destino,concepto,importe,fecha,actor) values(nuevo,tipo,origen_c,destino_c,concepto,importe,fecha,p_actor);
 end if;
 insert into public.zain_libro_historial(modo,origen,registro,antes,despues,actor) values(case when p_id is null then 'crear' else 'editar' end,destino,nuevo,antes,d,p_actor);
 return jsonb_build_object('ok',true,'id',nuevo);
end;$$;

-- Libro: efecto_caja es el cambio en el conjunto de cajas (ZAIN y oficinas); efecto_socio, lo que ZAIN le debe al socio.
create or replace function public.zain_caja_libro()
returns table(id uuid,origen text,tipo text,persona text,destino text,origen_persona text,concepto text,importe bigint,iva_recuperable bigint,categoria text,grupo text,fecha date,created_at timestamptz,pedido_id uuid,folio text,en_papelera boolean,efecto_caja bigint,efecto_socio bigint,comprobante uuid)
language sql stable security invoker set search_path='' as $$
 select g.id,'pago','cobro',g.recibio,null::text,null::text,coalesce(nullif(g.referencia,''),'Pago del cliente'),g.importe,0::bigint,null::text,null::text,coalesce(g.fecha,(g.created_at at time zone 'America/Mexico_City')::date),g.created_at,g.pedido_id,p.folio,p.archivado_at is not null,
  case when g.recibio in ('zain','oficina_jp','oficina_garcia') then g.importe else 0 end,case when g.recibio in ('zain','oficina_jp','oficina_garcia') then 0 else -g.importe end,null::uuid
 from public.zain_pagos g join public.zain_pedidos p on p.id=g.pedido_id
 union all
 select m.id,'pedido',m.tipo,m.persona,null,null,m.concepto,m.importe,m.iva_recuperable,null,m.grupo,m.fecha,m.created_at,m.pedido_id,p.folio,p.archivado_at is not null,
  case when m.tipo='reembolso' or m.persona in ('zain','oficina_jp','oficina_garcia') then -m.importe else 0 end,
  case when m.persona in ('zain','oficina_jp','oficina_garcia') then 0 when m.tipo='reembolso' then -m.importe else m.importe end,m.comprobante
 from public.zain_pedido_movimientos m join public.zain_pedidos p on p.id=m.pedido_id where m.anulado_at is null
 union all
 select m.id,'general',m.tipo,m.persona,null,null,m.concepto,m.importe,m.iva_recuperable,m.categoria,null,m.fecha,m.created_at,null,null,false,
  case when m.tipo='reembolso' then -m.importe when m.persona not in ('zain','oficina_jp','oficina_garcia') then 0 when m.tipo='ingreso' then m.importe else -m.importe end,
  case when m.persona in ('zain','oficina_jp','oficina_garcia') then 0 when m.tipo='gasto' then m.importe else -m.importe end,m.comprobante
 from public.zain_movimientos_generales m where m.anulado_at is null
 union all
 select c.id,'caja',c.tipo,case when c.origen in ('zain','oficina_jp','oficina_garcia') then c.destino else c.origen end,c.destino,c.origen,c.concepto,c.importe,0,null,null,c.fecha,c.created_at,null,null,false,
  case when c.destino in ('zain','oficina_jp','oficina_garcia') then c.importe else 0 end-case when c.origen in ('zain','oficina_jp','oficina_garcia') then c.importe else 0 end,
  case when c.tipo='reparto' then 0 when c.origen in ('juan_pablo','garcia') then c.importe when c.destino in ('juan_pablo','garcia') then -c.importe else 0 end,null::uuid
 from public.zain_caja_movimientos c where c.anulado_at is null;
$$;

-- Igual que antes más el saldo de cada caja. «caja» sigue siendo la Caja ZAIN.
create or replace function public.zain_caja_resumen()
returns jsonb language sql stable security invoker set search_path='' as $$
 with libro as(select * from public.zain_caja_libro()),
 flujos as(
  select recibio as cuenta,importe as monto from public.zain_pagos
  union all select case when tipo='reembolso' then 'zain' else persona end,-importe from public.zain_pedido_movimientos where anulado_at is null
  union all select case when tipo='reembolso' then 'zain' else persona end,case when tipo='ingreso' then importe else -importe end from public.zain_movimientos_generales where anulado_at is null
  union all select origen,-importe from public.zain_caja_movimientos where anulado_at is null
  union all select destino,importe from public.zain_caja_movimientos where anulado_at is null
 ),
 cajas as(select cuenta,coalesce(sum(monto),0)::bigint as saldo from flujos where cuenta in ('zain','oficina_jp','oficina_garcia') group by cuenta),
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
  'version',3,
  'caja',coalesce((select saldo from cajas where cuenta='zain'),0),
  'cajas',jsonb_build_object('zain',coalesce((select saldo from cajas where cuenta='zain'),0),'oficina_jp',coalesce((select saldo from cajas where cuenta='oficina_jp'),0),'oficina_garcia',coalesce((select saldo from cajas where cuenta='oficina_garcia'),0)),
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
  'iva_cobrado',(select coalesce(sum(f.iva_cobrado),0)::bigint from public.zain_finanzas_estado f where f.vendido),
  'papelera',(select count(distinct pedido_id) from libro where en_papelera),
  'pedidos',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'folio',p.folio,'cliente',to_jsonb(p)->'cliente'->>'nombre','estado',p.estado,'total',f.venta_total,'cobrado',f.cobrado,'publicada',f.revision is not null) order by p.created_at desc)
   from public.zain_pedidos p left join public.zain_finanzas_estado f on f.id=p.id where p.guardado_at is not null and p.archivado_at is null and p.estado<>'cancelado'),'[]'::jsonb),
  'libro',coalesce((select jsonb_agg(to_jsonb(l) order by l.fecha desc,l.created_at desc) from (select * from libro order by fecha desc,created_at desc limit 500) l),'[]'::jsonb)
 );
$$;

revoke all on public.zain_finanzas_estado from public,anon,authenticated,service_role;
grant select on public.zain_finanzas_estado to service_role;
revoke all on function public.zain_anticipo_requerido(uuid),public.zain_anticipo_aceptar(uuid,integer,uuid),public.zain_seguimiento_cotizacion(uuid),
 public.zain_registrar_pago(uuid,integer,uuid,bigint,text,uuid),public.zain_actualizar_pedido(uuid,integer,text,text,uuid),
 public.zain_finanzas_operar(uuid,integer,uuid,text,jsonb,uuid),public.zain_libro_operar(text,text,uuid,jsonb,uuid),
 public.zain_caja_libro(),public.zain_caja_resumen() from public,anon,authenticated;
grant execute on function public.zain_anticipo_requerido(uuid),public.zain_anticipo_aceptar(uuid,integer,uuid),public.zain_seguimiento_cotizacion(uuid),
 public.zain_registrar_pago(uuid,integer,uuid,bigint,text,uuid),public.zain_actualizar_pedido(uuid,integer,text,text,uuid),
 public.zain_finanzas_operar(uuid,integer,uuid,text,jsonb,uuid),public.zain_libro_operar(text,text,uuid,jsonb,uuid),
 public.zain_caja_libro(),public.zain_caja_resumen() to service_role;
commit;
