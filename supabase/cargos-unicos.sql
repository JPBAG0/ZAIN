-- Cargos únicos (ponchado por logo) en la cotización publicada — 20-oct-2026.
-- Solo reemplaza zain_cotizacion_guardar (misma firma: conserva permisos). Se puede ejecutar más de una vez.
create or replace function public.zain_cotizacion_guardar(p_id uuid,p_version integer,p_modo text,p_borrador jsonb,p_publicada jsonb,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare pedido public.zain_pedidos; old public.zain_cotizaciones; changed public.zain_cotizaciones; documento jsonb; lineas jsonb;
begin
 if p_modo not in ('iniciar','guardar','publicar','retirar') then raise exception 'Operacion invalida'; end if;
 if p_modo<>'iniciar' and not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
 select * into pedido from public.zain_pedidos where id=p_id and guardado_at is not null and archivado_at is null for update;
 if not found then return null; end if;
 select * into old from public.zain_cotizaciones where pedido_id=p_id for update;
 if p_modo='iniciar' then
  if found then return to_jsonb(old); end if;
  if p_version<>0 then return null; end if;
  insert into public.zain_cotizaciones(pedido_id,borrador) values(p_id,p_borrador) returning * into changed;
 else
  if not found or old.version<>p_version then return null; end if;
  if p_modo in ('publicar','retirar') and (pedido.estado in ('confirmado','produccion','entregado') or exists(select 1 from public.zain_pagos where pedido_id=p_id)) then return null;end if;
  documento=old.publicada;
  if p_modo='publicar' then
   if pedido.estado='cancelado' or (p_borrador->>'preparada')::boolean is distinct from true or p_publicada is null then return null; end if;
   -- Segunda proyección explícita: nunca publicar costos, recargos ni referencias de compras.
   select jsonb_agg(jsonb_build_object('indice',l->'indice','sku',l->'sku','nombre',l->'nombre','color',l->'color','tecnica',l->'tecnica','piezas',l->'piezas','tallas',l->'tallas','zona',l->'zona','cm',l->'cm','precio',l->'precio','descuento',l->'descuento','bruto',l->'bruto','rebaja',l->'rebaja','importe',l->'importe','preciosTalla',case when jsonb_typeof(l->'preciosTalla')='array' then (select jsonb_agg(jsonb_build_object('tallas',g->'tallas','piezas',g->'piezas','precio',g->'precio','importe',g->'importe')) from jsonb_array_elements(l->'preciosTalla') g) end) order by (l->>'indice')::integer) into lineas from jsonb_array_elements(p_publicada->'partidas') l;
   documento=jsonb_build_object('schema',1,'moneda','MXN','folio',pedido.folio,'revision',old.version+1,'publicada_at',now(),'destinatario',p_publicada->'destinatario','condiciones',p_publicada->'condiciones','plazo',p_publicada->'plazo','vigencia',p_publicada->'vigencia','impuesto',p_publicada->'impuesto','envio',p_publicada->'envio','cargos',case when jsonb_typeof(p_publicada->'cargos')='array' then (select coalesce(jsonb_agg(jsonb_build_object('concepto',c->'concepto','importe',c->'importe')),'[]'::jsonb) from jsonb_array_elements(p_publicada->'cargos') c) else '[]'::jsonb end,'bruto',p_publicada->'bruto','descuento',p_publicada->'descuento','subtotal',p_publicada->'subtotal','impuestos',p_publicada->'impuestos','total',p_publicada->'total','partidas',lineas,'pagos',case when jsonb_typeof(p_publicada->'pagos')='object' then jsonb_build_object('anticipo',p_publicada->'pagos'->'anticipo','instrucciones',p_publicada->'pagos'->'instrucciones') else null end);
   -- Publicar una cotización no confirma producción ni pago.
   if pedido.estado in ('nuevo','contactado','aceptado') then
    update public.zain_pedidos set estado='cotizado',version=version+1,updated_at=now() where id=p_id;
    insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,pedido.estado,'cotizado','Cotización revisada y publicada para el cliente.');
   end if;
  elsif p_modo='retirar' then
   documento=null;
   if pedido.estado='aceptado' then
    update public.zain_pedidos set estado='contactado',version=version+1,updated_at=now() where id=p_id;
    insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,'aceptado','contactado','Cotización retirada para revisión; la aceptación anterior queda en el historial.');
   end if;
  end if;
  update public.zain_cotizaciones set borrador=case when p_modo='retirar' then old.borrador else p_borrador end,publicada=documento,version=version+1,updated_at=now(),actor=p_actor where pedido_id=p_id returning * into changed;
 end if;
 insert into public.zain_cotizaciones_historial(pedido_id,version,modo,borrador,publicada,actor) values(p_id,changed.version,p_modo,changed.borrador,changed.publicada,p_actor);
 return to_jsonb(changed);
end;
$$;
