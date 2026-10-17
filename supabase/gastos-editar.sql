-- 17-oct-2026: corregir (editar) gastos en lugar de solo anularlos. La versión anterior queda en
-- zain_finanzas_eventos.antes (pedidos) o en "anterior" (generales). Mismos permisos: solo service_role.
alter table public.zain_pedido_movimientos add column if not exists editado_at timestamptz,add column if not exists editado_por uuid references auth.users(id);
alter table public.zain_movimientos_generales add column if not exists editado_at timestamptz,add column if not exists editado_por uuid references auth.users(id),add column if not exists anterior jsonb;
grant update(categoria,persona,concepto,importe,iva_recuperable,fecha,comprobante,editado_at,editado_por,anterior) on public.zain_movimientos_generales to service_role;

create or replace function public.zain_finanzas_ver(p_id uuid)
 returns jsonb language sql stable set search_path to '' as $function$
 select jsonb_build_object('resumen',to_jsonb(f),'version',coalesce(f.version,0),'cierre',c.cierre,
 'movimientos',coalesce((select jsonb_agg(to_jsonb(m)-'actor'-'anulado_por'-'editado_por' order by m.created_at desc,m.id) from public.zain_pedido_movimientos m where m.pedido_id=p_id),'[]'::jsonb))
 from public.zain_finanzas_estado f left join public.zain_pedido_cuentas c on c.pedido_id=f.id where f.id=p_id;
$function$;

create or replace function public.zain_finanzas_operar(p_id uuid, p_version integer, p_request uuid, p_modo text, p_datos jsonb, p_actor uuid)
 returns jsonb language plpgsql set search_path to '' as $function$
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
  if persona not in ('juan_pablo','garcia','zain') or importe is null or importe<1 or importe>100000000000 or iva<0 or iva>importe or length(trim(coalesce(p_datos->>'concepto','')))=0 or length(p_datos->>'concepto')>180 or grupo not in ('base','extra') or (p_datos->>'fecha')::date>(now() at time zone 'America/Mexico_City')::date then return jsonb_build_object('error','Revisa el concepto, la fecha, el importe y quién pagó.');end if;
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
  if mov.persona<>'zain' and (persona<>mov.persona or importe<mov.importe) then
   select * into f from public.zain_finanzas_estado where id=p_id;deuda=case mov.persona when 'juan_pablo' then f.debe_jp else f.debe_garcia end;
   if deuda-(mov.importe-case when persona=mov.persona then importe else 0 end)<0 then return jsonb_build_object('error','Ese gasto ya fue reembolsado. Corrige primero el reembolso.');end if;
  end if;
  anterior=to_jsonb(mov)-'actor'-'anulado_por'-'editado_por';
  update public.zain_pedido_movimientos set grupo=p_datos->>'grupo',persona=p_datos->>'persona',concepto=trim(p_datos->>'concepto'),importe=(p_datos->>'importe')::bigint,iva_recuperable=coalesce((p_datos->>'iva_recuperable')::bigint,0),fecha=(p_datos->>'fecha')::date,comprobante=coalesce(comp,mov.comprobante),editado_at=now(),editado_por=p_actor where id=mov.id;
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
 insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,ped.estado,ped.estado,case p_modo when 'cerrar' then 'Cierre de costos reales revisado.' when 'reabrir' then 'Cierre reabierto: '||(p_datos->>'motivo') when 'reembolso' then 'Reembolso verificado registrado; no aumenta los costos.' when 'editar' then 'Gasto corregido: '||trim(p_datos->>'concepto') else 'Registro interno de gastos actualizado.' end);
 return public.zain_finanzas_ver(p_id);
end;$function$;
