-- 27-oct-2026 (JP): «Marcar como entregado» no hacía nada en un pedido al que le faltaban $18 por cobrar.
-- Entregado exigía el cobro completo; ahora basta el anticipo (igual que Confirmado y Producción) y el saldo
-- sigue por cobrar o se perdona al cerrar. Si falta el anticipo, la función devuelve el motivo en lugar de null
-- (null queda solo para el conflicto de versión). Posterior a iva-oficinas-anticipo.sql.
begin;
create or replace function public.zain_actualizar_pedido(p_id uuid,p_version integer,p_estado text,p_notas text,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $function$
declare old public.zain_pedidos; changed public.zain_pedidos; cobrado bigint; requerido bigint;
begin
  if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
  select * into old from public.zain_pedidos where id=p_id and guardado_at is not null for update;
  if not found or old.version<>p_version then return null; end if;
  if p_estado='aceptado' and old.estado<>'aceptado' then return jsonb_build_object('error','Aceptado se marca solo cuando se acepta la cotización.');end if;
  if p_estado in ('nuevo','contactado','cotizado') and exists(select 1 from public.zain_cotizacion_aceptaciones a join public.zain_cotizaciones c on c.pedido_id=a.pedido_id and (c.publicada->>'revision')::integer=a.revision where a.pedido_id=p_id) then return jsonb_build_object('error','La cotización ya está aceptada; no se puede regresar a ese estado.');end if;
  if p_estado in ('confirmado','produccion','entregado') and exists(select 1 from public.zain_cotizacion_aceptaciones a join public.zain_cotizaciones c on c.pedido_id=a.pedido_id and (c.publicada->>'revision')::integer=a.revision where a.pedido_id=p_id) then
   select coalesce(sum(p.importe),0) into cobrado from public.zain_pagos p join public.zain_cotizaciones c on c.pedido_id=p.pedido_id and (c.publicada->>'revision')::integer=p.revision where p.pedido_id=p_id;
   select coalesce(public.zain_anticipo_requerido(p_id),(publicada->>'total')::bigint) into requerido from public.zain_cotizaciones where pedido_id=p_id;
   if cobrado<requerido then return jsonb_build_object('error','Falta cobrar el anticipo: llevan $'||to_char(cobrado/100.0,'FM999,999,990.00')||' de $'||to_char(requerido/100.0,'FM999,999,990.00')||'. Regístralo en Cobro o acepta lo recibido como anticipo.');end if;
  end if;
  update public.zain_pedidos set estado=p_estado,notas_internas=p_notas,version=version+1,updated_at=now() where id=p_id returning * into changed;
  insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,old.estado,p_estado,p_notas);
  return to_jsonb(changed);
end;
$function$;
revoke all on function public.zain_actualizar_pedido(uuid,integer,text,text,uuid) from public,anon,authenticated;
grant execute on function public.zain_actualizar_pedido(uuid,integer,text,text,uuid) to service_role;
commit;
