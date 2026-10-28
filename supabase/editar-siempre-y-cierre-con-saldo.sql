-- 27-oct-2026 (JP): dos cambios en Gestión. Posterior a iva-oficinas-anticipo.sql y cotizacion-partidas-editables.sql.
-- 1) Todo el pedido se puede modificar (técnica, partidas, tallas, precios) en cualquier estado salvo cancelado o con el
--    cierre de Finanzas guardado. Si el pedido ya estaba confirmado o tiene pagos, la nueva revisión hereda la aceptación
--    y los pagos (zain_pagos.revision se mueve) y el estado no cambia. Las revisiones anteriores siguen en
--    zain_cotizaciones_historial y zain_cotizacion_partidas_historial.
-- 2) Cerrar un pedido aunque falte cobrar algo: el equipo marca «Cerrar sin cobrar el resto» con un motivo. El saldo queda
--    en zain_pedido_cuentas.saldo_condonado; la venta del pedido pasa a ser lo cobrado (utilidad real) y la vista conserva
--    venta_cotizada y saldo_condonado para el registro. Reabrir el cierre lo regresa a 0.
begin;

alter table public.zain_pedido_cuentas add column saldo_condonado bigint not null default 0 check(saldo_condonado>=0);
grant update(saldo_condonado) on public.zain_pedido_cuentas to service_role;

create or replace view public.zain_finanzas_estado with(security_invoker=true) as
with datos as(
 select p.id,p.estado,p.archivado_at,(q.publicada->>'revision')::integer as revision,
  (q.publicada->>'subtotal')::bigint-case when c.cerrado_at is not null and coalesce(c.saldo_condonado,0)>0 and (q.publicada->>'total')::bigint>0 then round(c.saldo_condonado::numeric*(q.publicada->>'subtotal')::bigint/(q.publicada->>'total')::bigint)::bigint else 0 end as venta_sin_iva,
  (q.publicada->>'total')::bigint-case when c.cerrado_at is not null then coalesce(c.saldo_condonado,0) else 0 end as venta_total,
  (q.publicada->>'total')::bigint as venta_cotizada,(case when c.cerrado_at is not null then coalesce(c.saldo_condonado,0) else 0 end)::bigint as saldo_condonado,
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
 case when anticipo_bp between 0 and 10000 then (venta_total*anticipo_bp+5000)/10000 end as anticipo_pactado,
 venta_cotizada,saldo_condonado
from costos;

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
  if ped.estado<>'entregado' or f.venta_total is null or (p_datos->>'costos_completos')::boolean is distinct from true or (f.base_estimada>0 and f.base_real=0) then return jsonb_build_object('error','Para cerrar: pedido entregado y costos base reales registrados y revisados.');end if;
  -- 27-oct-2026 (JP): se puede cerrar con saldo pendiente si el equipo decide no cobrarlo; queda como saldo perdonado.
  if f.cobrado<f.venta_total and ((p_datos->>'perdonar_saldo')::boolean is distinct from true or length(trim(coalesce(p_datos->>'motivo','')))<3) then return jsonb_build_object('error','Falta cobrar $'||to_char((f.venta_total-f.cobrado)/100.0,'FM999,999,990.00')||'. Marca «Cerrar sin cobrar el resto» y escribe el motivo.');end if;
  update public.zain_pedido_cuentas set cerrado_at=now(),saldo_condonado=greatest(f.venta_total-f.cobrado,0) where pedido_id=p_id;
  select * into f from public.zain_finanzas_estado where id=p_id;
  update public.zain_pedido_cuentas set cierre=to_jsonb(f) where pedido_id=p_id;
 elsif p_modo='reabrir' then
  if cuenta.cerrado_at is null or length(trim(coalesce(p_datos->>'motivo','')))<5 then return jsonb_build_object('error','Indica un motivo para reabrir el cierre.');end if;
  -- El cierre anterior sigue en el evento para auditoría.
  anterior=cuenta.cierre;
  update public.zain_pedido_cuentas set cerrado_at=null,cierre=null,saldo_condonado=0 where pedido_id=p_id;
 elsif p_modo='reparto' then
  if p_datos->>'juan_pablo_bp' is not null and ((p_datos->>'juan_pablo_bp')::integer not between 0 and 10000) then return jsonb_build_object('error','Revisa los porcentajes de reparto.');end if;
  update public.zain_pedido_cuentas set reparto_bp=(p_datos->>'juan_pablo_bp')::integer where pedido_id=p_id;
 end if;
 update public.zain_pedido_cuentas set version=version+1 where pedido_id=p_id returning * into cuenta;
 insert into public.zain_finanzas_eventos(request,pedido_id,modo,datos,antes,actor,version) values(p_request,p_id,p_modo,p_datos,anterior,p_actor,cuenta.version);
 insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,ped.estado,ped.estado,case p_modo when 'cerrar' then 'Cierre de costos reales revisado.'||case when cuenta.saldo_condonado>0 then ' Saldo perdonado: $'||to_char(cuenta.saldo_condonado/100.0,'FM999,999,990.00')||' ('||trim(p_datos->>'motivo')||').' else '' end when 'reabrir' then 'Cierre reabierto: '||(p_datos->>'motivo') when 'reembolso' then 'Reembolso verificado registrado; no aumenta los costos.' when 'editar' then 'Gasto corregido: '||trim(p_datos->>'concepto') else 'Registro interno de gastos actualizado.' end);
 return public.zain_finanzas_ver(p_id);
end;$function$;

CREATE OR REPLACE FUNCTION public.zain_cotizacion_guardar(p_id uuid, p_version integer, p_modo text, p_borrador jsonb, p_publicada jsonb, p_actor uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare pedido public.zain_pedidos; old public.zain_cotizaciones; changed public.zain_cotizaciones; documento jsonb; lineas jsonb; seleccionados jsonb; ficheros jsonb; total_nuevo integer; previa integer; seguir boolean;
begin
 if p_modo not in ('iniciar','guardar','publicar','retirar') then raise exception 'Operacion invalida'; end if;
 if p_modo<>'iniciar' and not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
 select * into pedido from public.zain_pedidos where id=p_id and guardado_at is not null and archivado_at is null for update;
 if not found then return null; end if;
 select * into old from public.zain_cotizaciones where pedido_id=p_id for update;
 if p_modo='iniciar' then
  if found then return to_jsonb(old); end if;
  if pedido.estado='cancelado' then return null;end if;
  if p_version<>0 then return null; end if;
  insert into public.zain_cotizaciones(pedido_id,borrador) values(p_id,p_borrador) returning * into changed;
 else
  if not found or old.version<>p_version then return null; end if;
  if pedido.estado='cancelado' or exists(select 1 from public.zain_pedido_cuentas where pedido_id=p_id and cerrado_at is not null) then return null;end if;
  if p_borrador ? 'selecciones' and (jsonb_typeof(p_borrador->'selecciones')<>'array' or jsonb_array_length(p_borrador->'selecciones') not between 1 and 20 or (p_borrador->>'partidasVersion')::integer is distinct from pedido.partidas_version) then return null;end if;
  if p_modo='retirar' and (pedido.estado in ('confirmado','produccion','entregado') or exists(select 1 from public.zain_pagos where pedido_id=p_id)) then return null;end if;
  -- 27-oct-2026 (JP): todo el pedido se puede modificar en Gestión. Si ya estaba confirmado o tiene pagos, la nueva
  -- revisión hereda la aceptación y los pagos, y el estado no regresa a Cotizado.
  previa=(old.publicada->>'revision')::integer;
  seguir=p_modo='publicar' and previa is not null and (pedido.estado in ('confirmado','produccion','entregado') or exists(select 1 from public.zain_pagos where pedido_id=p_id and revision=previa));
  documento=old.publicada;
  if p_modo='publicar' then
   if pedido.estado='cancelado' or (p_borrador->>'preparada')::boolean is distinct from true or p_publicada is null then return null; end if;
   if p_borrador ? 'selecciones' then
    if exists(select 1 from jsonb_array_elements(p_borrador->'selecciones') s where jsonb_typeof(s->'item') is distinct from 'object' or coalesce((s->'item'->>'piezas')::integer,0) not between 1 and 9999 or (s->>'origen')::integer<0 or (s->>'origen')::integer>=jsonb_array_length(pedido.items)) then return null;end if;
    select jsonb_agg(jsonb_set(s->'item','{indice}',to_jsonb(n-1)) order by n),sum((s->'item'->>'piezas')::integer) into seleccionados,total_nuevo from jsonb_array_elements(p_borrador->'selecciones') with ordinality a(s,n);
    select coalesce(jsonb_agg(f||jsonb_build_object('item',n-1) order by n,f->>'kind'),'[]'::jsonb) into ficheros
     from jsonb_array_elements(p_borrador->'selecciones') with ordinality a(s,n)
     cross join lateral jsonb_array_elements(pedido.archivos) f
     where (f->>'item')::integer=(s->>'origen')::integer and case f->>'kind' when 'logo' then (s->'item'->>'tieneLogo')::boolean when 'render' then (s->'item'->>'tieneRender')::boolean else true end;
    if seleccionados is distinct from pedido.items or ficheros is distinct from pedido.archivos then
     insert into public.zain_cotizacion_partidas_historial(pedido_id,version_cotizacion,items,archivos,total,pedido_version,actor) values(p_id,old.version+1,pedido.items,pedido.archivos,pedido.total,pedido.version,p_actor);
     update public.zain_pedidos set items=seleccionados,archivos=ficheros,total=total_nuevo,version=version+1,partidas_version=partidas_version+1,updated_at=now() where id=p_id;
     insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,pedido.estado,pedido.estado,'Partidas y tallas revisadas al publicar la cotización; selección anterior conservada en Archivo.');
    end if;
   end if;
   -- Segunda proyección explícita: nunca publicar costos, recargos ni referencias de compras.
   select jsonb_agg(jsonb_build_object('indice',l->'indice','sku',l->'sku','nombre',l->'nombre','color',l->'color','tecnica',l->'tecnica','piezas',l->'piezas','tallas',l->'tallas','zona',l->'zona','cm',l->'cm','precio',l->'precio','descuento',l->'descuento','bruto',l->'bruto','rebaja',l->'rebaja','importe',l->'importe','preciosTalla',case when jsonb_typeof(l->'preciosTalla')='array' then (select jsonb_agg(jsonb_build_object('tallas',g->'tallas','piezas',g->'piezas','precio',g->'precio','importe',g->'importe')) from jsonb_array_elements(l->'preciosTalla') g) end) order by (l->>'indice')::integer) into lineas from jsonb_array_elements(p_publicada->'partidas') l;
   documento=jsonb_build_object('schema',1,'moneda','MXN','folio',pedido.folio,'revision',old.version+1,'publicada_at',now(),'destinatario',p_publicada->'destinatario','condiciones',p_publicada->'condiciones','plazo',p_publicada->'plazo','vigencia',p_publicada->'vigencia','impuesto',p_publicada->'impuesto','envio',p_publicada->'envio','cargos',case when jsonb_typeof(p_publicada->'cargos')='array' then (select coalesce(jsonb_agg(jsonb_build_object('concepto',c->'concepto','importe',c->'importe')),'[]'::jsonb) from jsonb_array_elements(p_publicada->'cargos') c) else '[]'::jsonb end,'bruto',p_publicada->'bruto','descuento',p_publicada->'descuento','subtotal',p_publicada->'subtotal','impuestos',p_publicada->'impuestos','total',p_publicada->'total','partidas',lineas,'pagos',case when jsonb_typeof(p_publicada->'pagos')='object' then jsonb_build_object('anticipo',p_publicada->'pagos'->'anticipo','instrucciones',p_publicada->'pagos'->'instrucciones') else null end);
   -- Publicar una cotización no confirma producción ni pago.
   if seguir then
    if exists(select 1 from public.zain_cotizacion_aceptaciones where pedido_id=p_id and revision=previa) then
     insert into public.zain_cotizacion_aceptaciones(pedido_id,revision,aceptada_at,documento) values(p_id,old.version+1,now(),documento||jsonb_build_object('aceptada_por','equipo','revision_anterior',previa)) on conflict do nothing;
     update public.zain_pagos set revision=old.version+1 where pedido_id=p_id and revision=previa;
     update public.zain_pedido_cuentas set anticipo_revision=old.version+1 where pedido_id=p_id and anticipo_revision=previa;
    end if;
    -- Un pedido ya confirmado sigue confirmado aunque el nuevo total suba el anticipo: lo cobrado queda como anticipo aceptado.
    if pedido.estado in ('confirmado','produccion','entregado') and exists(select 1 from public.zain_pagos where pedido_id=p_id and revision=old.version+1) then
     insert into public.zain_pedido_cuentas(pedido_id) values(p_id) on conflict do nothing;
     update public.zain_pedido_cuentas c set anticipo_aceptado=s.cobrado,anticipo_revision=old.version+1,version=c.version+1
      from (select sum(importe)::bigint as cobrado from public.zain_pagos where pedido_id=p_id and revision=old.version+1) s
      where c.pedido_id=p_id and (c.anticipo_revision is distinct from old.version+1 or c.anticipo_aceptado<s.cobrado);
    end if;
    insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,pedido.estado,pedido.estado,'Pedido modificado por el equipo (revisión '||(old.version+1)||'); la aceptación y los pagos pasan a la nueva revisión.');
   elsif pedido.estado in ('nuevo','contactado','aceptado') then
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
  if p_modo='publicar' and p_borrador ? 'selecciones' then
   select jsonb_set(jsonb_set(p_borrador,'{selecciones}',jsonb_agg(jsonb_build_object('origen',n-1,'item',s->'item') order by n)),'{partidasVersion}',to_jsonb((select partidas_version from public.zain_pedidos where id=p_id))) into p_borrador from jsonb_array_elements(p_borrador->'selecciones') with ordinality a(s,n);
  end if;
  update public.zain_cotizaciones set borrador=case when p_modo='retirar' then old.borrador else p_borrador end,publicada=documento,version=version+1,updated_at=now(),actor=p_actor where pedido_id=p_id returning * into changed;
 end if;
 insert into public.zain_cotizaciones_historial(pedido_id,version,modo,borrador,publicada,actor) values(p_id,changed.version,p_modo,changed.borrador,changed.publicada,p_actor);
 return to_jsonb(changed);
end;
$function$;

revoke all on function public.zain_cotizacion_guardar(uuid,integer,text,jsonb,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.zain_cotizacion_guardar(uuid,integer,text,jsonb,jsonb,uuid) to service_role;
commit;
