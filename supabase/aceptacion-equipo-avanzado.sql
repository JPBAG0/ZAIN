-- 24-nov-2026 (JP): el equipo registra la aceptación del cliente aunque el pedido ya esté en Confirmado, Producción o
-- Entregado. Caso real: un pedido pasó a producción sin anticipo antes de marcar la aceptación y se entregó; Cobro ya no
-- dejaba registrarla ni, por lo tanto, los pagos. zain_cotizacion_aceptar (la del enlace del cliente) no cambia.
-- Reglas: solo equipo activo; la revisión debe ser la publicada; no aplica a cancelados ni archivados; si el pedido aún
-- no avanzaba pasa a «aceptado» como antes; si ya avanzó conserva su estado. La vigencia no bloquea al equipo: el cliente
-- ya aceptó fuera del enlace. Posterior a confirmacion-cotizaciones.sql.
begin;

create or replace function public.zain_cotizacion_aceptar_equipo(p_id uuid,p_revision integer,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare pedido public.zain_pedidos; cot public.zain_cotizaciones; aceptada public.zain_cotizacion_aceptaciones; nuevo text;
begin
 if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then return null;end if;
 select * into pedido from public.zain_pedidos where id=p_id and guardado_at is not null and archivado_at is null for update;
 if not found or pedido.estado='cancelado' then return null;end if;
 select * into cot from public.zain_cotizaciones where pedido_id=p_id for update;
 if not found or cot.publicada is null or (cot.publicada->>'revision')::integer<>p_revision then return null;end if;
 select * into aceptada from public.zain_cotizacion_aceptaciones where pedido_id=p_id and revision=p_revision;
 if found then return jsonb_build_object('revision',p_revision,'aceptada_at',aceptada.aceptada_at);end if;
 insert into public.zain_cotizacion_aceptaciones(pedido_id,revision,documento) values(p_id,p_revision,cot.publicada) returning * into aceptada;
 nuevo=case when pedido.estado in ('nuevo','contactado','cotizado') then 'aceptado' else pedido.estado end;
 update public.zain_pedidos set estado=nuevo,version=version+1,updated_at=now() where id=p_id;
 insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,pedido.estado,nuevo,
  'Aceptación de la revisión '||p_revision||' registrada por el equipo (el cliente aceptó fuera de su enlace)'||case when nuevo<>'aceptado' then '; el pedido ya estaba en '||pedido.estado||' y conserva su estado.' else '.' end);
 return jsonb_build_object('revision',p_revision,'aceptada_at',aceptada.aceptada_at);
end;$$;
revoke all on function public.zain_cotizacion_aceptar_equipo(uuid,integer,uuid) from public,anon,authenticated;
grant execute on function public.zain_cotizacion_aceptar_equipo(uuid,integer,uuid) to service_role;

commit;
