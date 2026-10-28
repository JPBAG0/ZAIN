-- 27-oct-2026 (JP): pasar un pedido a Confirmado o Producción sin recibir anticipo.
-- zain_pedido_cuentas.sin_anticipo_revision marca la revisión publicada; con ella el anticipo requerido es 0, el pedido
-- cuenta como vendido y el total queda por cobrar. Si la cotización se modifica después, la marca pasa a la revisión nueva.
-- Posterior a editar-siempre-y-cierre-con-saldo.sql y entregar-con-saldo.sql.
begin;

alter table public.zain_pedido_cuentas add column sin_anticipo_revision integer;
grant update(sin_anticipo_revision) on public.zain_pedido_cuentas to service_role;

create or replace view public.zain_finanzas_estado with(security_invoker=true) as
with datos as(
 select p.id,p.estado,p.archivado_at,(q.publicada->>'revision')::integer as revision,
  (q.publicada->>'subtotal')::bigint-case when c.cerrado_at is not null and coalesce(c.saldo_condonado,0)>0 and (q.publicada->>'total')::bigint>0 then round(c.saldo_condonado::numeric*(q.publicada->>'subtotal')::bigint/(q.publicada->>'total')::bigint)::bigint else 0 end as venta_sin_iva,
  (q.publicada->>'total')::bigint-case when c.cerrado_at is not null then coalesce(c.saldo_condonado,0) else 0 end as venta_total,
  (q.publicada->>'total')::bigint as venta_cotizada,(case when c.cerrado_at is not null then coalesce(c.saldo_condonado,0) else 0 end)::bigint as saldo_condonado,
  (q.publicada->'pagos'->>'anticipo')::integer as anticipo_bp,(h.borrador->>'costo')::bigint as base_estimada,
  c.version,c.cerrado_at,case when c.pedido_id is null then 5000 else c.reparto_bp end as reparto_bp,
  case when c.anticipo_revision=(q.publicada->>'revision')::integer then c.anticipo_aceptado end as anticipo_aceptado,
  coalesce(c.sin_anticipo_revision=(q.publicada->>'revision')::integer,false) as sin_anticipo,
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
  case when sin_anticipo and venta_total is not null then 0 when anticipo_bp is null then venta_total
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
 venta_cotizada,saldo_condonado,sin_anticipo
from costos;

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
     update public.zain_pedido_cuentas set sin_anticipo_revision=old.version+1 where pedido_id=p_id and sin_anticipo_revision=previa;
    end if;
    -- Un pedido ya confirmado sigue confirmado aunque el nuevo total suba el anticipo: lo cobrado queda como anticipo aceptado.
    if pedido.estado in ('confirmado','produccion','entregado') and exists(select 1 from public.zain_pagos where pedido_id=p_id and revision=old.version+1) then
     insert into public.zain_pedido_cuentas(pedido_id) values(p_id) on conflict do nothing;
     update public.zain_pedido_cuentas c set anticipo_aceptado=s.cobrado,anticipo_revision=old.version+1,version=c.version+1
      from (select sum(importe)::bigint as cobrado from public.zain_pagos where pedido_id=p_id and revision=old.version+1) s
      where c.pedido_id=p_id and (c.anticipo_revision is distinct from old.version+1 or c.anticipo_aceptado<s.cobrado);
    end if;
    update public.zain_pedido_cuentas set sin_anticipo_revision=old.version+1 where pedido_id=p_id and sin_anticipo_revision=previa;
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

drop function public.zain_actualizar_pedido(uuid,integer,text,text,uuid);
create function public.zain_actualizar_pedido(p_id uuid,p_version integer,p_estado text,p_notas text,p_actor uuid,p_sin_anticipo boolean default false)
returns jsonb language plpgsql security invoker set search_path='' as $function$
declare old public.zain_pedidos; changed public.zain_pedidos; cobrado bigint; requerido bigint; revision integer;
begin
  if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
  select * into old from public.zain_pedidos where id=p_id and guardado_at is not null for update;
  if not found or old.version<>p_version then return null; end if;
  if p_estado='aceptado' and old.estado<>'aceptado' then return jsonb_build_object('error','Aceptado se marca solo cuando se acepta la cotización.');end if;
  if p_estado in ('nuevo','contactado','cotizado') and exists(select 1 from public.zain_cotizacion_aceptaciones a join public.zain_cotizaciones c on c.pedido_id=a.pedido_id and (c.publicada->>'revision')::integer=a.revision where a.pedido_id=p_id) then return jsonb_build_object('error','La cotización ya está aceptada; no se puede regresar a ese estado.');end if;
  -- Pasar a producción sin anticipo (decisión del equipo): queda marcado en la revisión publicada.
  if p_sin_anticipo then
   if p_estado not in ('confirmado','produccion') or old.estado in ('produccion','entregado','cancelado') then return jsonb_build_object('error','Solo se puede pasar sin anticipo a Confirmado o Producción.');end if;
   select (publicada->>'revision')::integer into revision from public.zain_cotizaciones where pedido_id=p_id;
   if revision is null then return jsonb_build_object('error','Primero publica la cotización con el precio.');end if;
   insert into public.zain_pedido_cuentas(pedido_id) values(p_id) on conflict do nothing;
   update public.zain_pedido_cuentas set sin_anticipo_revision=revision,version=version+1 where pedido_id=p_id;
  end if;
  if p_estado in ('confirmado','produccion','entregado') and exists(select 1 from public.zain_cotizacion_aceptaciones a join public.zain_cotizaciones c on c.pedido_id=a.pedido_id and (c.publicada->>'revision')::integer=a.revision where a.pedido_id=p_id) then
   select coalesce(sum(p.importe),0) into cobrado from public.zain_pagos p join public.zain_cotizaciones c on c.pedido_id=p.pedido_id and (c.publicada->>'revision')::integer=p.revision where p.pedido_id=p_id;
   select coalesce(public.zain_anticipo_requerido(p_id),(publicada->>'total')::bigint) into requerido from public.zain_cotizaciones where pedido_id=p_id;
   if cobrado<requerido then return jsonb_build_object('error','Falta cobrar el anticipo: llevan $'||to_char(cobrado/100.0,'FM999,999,990.00')||' de $'||to_char(requerido/100.0,'FM999,999,990.00')||'. Regístralo en Cobro o acepta lo recibido como anticipo.');end if;
  end if;
  update public.zain_pedidos set estado=p_estado,notas_internas=p_notas,version=version+1,updated_at=now() where id=p_id returning * into changed;
  insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,old.estado,p_estado,case when p_sin_anticipo then 'Pasó sin anticipo por decisión del equipo. ' else '' end||coalesce(p_notas,''));
  return to_jsonb(changed);
end;
$function$;
revoke all on function public.zain_actualizar_pedido(uuid,integer,text,text,uuid,boolean) from public,anon,authenticated;
grant execute on function public.zain_actualizar_pedido(uuid,integer,text,text,uuid,boolean) to service_role;

revoke all on function public.zain_cotizacion_guardar(uuid,integer,text,jsonb,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.zain_cotizacion_guardar(uuid,integer,text,jsonb,jsonb,uuid) to service_role;
commit;
