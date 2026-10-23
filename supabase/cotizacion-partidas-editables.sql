-- Edición de partidas de cotización antes de Confirmado/cancelado. Históricos intactos.
begin;
alter table public.zain_pedidos add column partidas_version integer not null default 0 check(partidas_version>=0);
create table public.zain_cotizacion_partidas_historial(
 pedido_id uuid not null references public.zain_pedidos(id),version_cotizacion integer not null,
 items jsonb not null check(jsonb_typeof(items)='array'),archivos jsonb not null check(jsonb_typeof(archivos)='array'),
 total integer not null,pedido_version integer not null,actor uuid not null references auth.users(id),created_at timestamptz not null default now(),
 primary key(pedido_id,version_cotizacion)
);
alter table public.zain_cotizacion_partidas_historial enable row level security;
revoke all on public.zain_cotizacion_partidas_historial from public,anon,authenticated,service_role;
grant select,insert on public.zain_cotizacion_partidas_historial to service_role;
create or replace function public.zain_cotizacion_guardar(p_id uuid,p_version integer,p_modo text,p_borrador jsonb,p_publicada jsonb,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare pedido public.zain_pedidos; old public.zain_cotizaciones; changed public.zain_cotizaciones; documento jsonb; lineas jsonb; seleccionados jsonb; ficheros jsonb; total_nuevo integer;
begin
 if p_modo not in ('iniciar','guardar','publicar','retirar') then raise exception 'Operacion invalida'; end if;
 if p_modo<>'iniciar' and not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
 select * into pedido from public.zain_pedidos where id=p_id and guardado_at is not null and archivado_at is null for update;
 if not found then return null; end if;
 select * into old from public.zain_cotizaciones where pedido_id=p_id for update;
 if p_modo='iniciar' then
  if found then return to_jsonb(old); end if;
  if pedido.estado not in ('nuevo','contactado','cotizado','aceptado') then return null;end if;
  if p_version<>0 then return null; end if;
  insert into public.zain_cotizaciones(pedido_id,borrador) values(p_id,p_borrador) returning * into changed;
 else
  if not found or old.version<>p_version then return null; end if;
  if pedido.estado not in ('nuevo','contactado','cotizado','aceptado') then return null;end if;
  if p_borrador ? 'selecciones' and (jsonb_typeof(p_borrador->'selecciones')<>'array' or jsonb_array_length(p_borrador->'selecciones') not between 1 and 20 or (p_borrador->>'partidasVersion')::integer is distinct from pedido.partidas_version) then return null;end if;
  if p_modo in ('publicar','retirar') and (pedido.estado in ('confirmado','produccion','entregado') or exists(select 1 from public.zain_pagos where pedido_id=p_id)) then return null;end if;
  documento=old.publicada;
  if p_modo='publicar' then
   if pedido.estado='cancelado' or (p_borrador->>'preparada')::boolean is distinct from true or p_publicada is null then return null; end if;
   if p_borrador ? 'selecciones' then
    if exists(select 1 from jsonb_array_elements(p_borrador->'selecciones') s where jsonb_typeof(s->'item') is distinct from 'object' or coalesce((s->'item'->>'piezas')::integer,0) not between 1 and 9999 or (s->>'origen')::integer<0 or (s->>'origen')::integer>=jsonb_array_length(pedido.items)) then return null;end if;
    select jsonb_agg(jsonb_set(s->'item','{indice}',to_jsonb(n-1)) order by n),sum((s->'item'->>'piezas')::integer) into seleccionados,total_nuevo from jsonb_array_elements(p_borrador->'selecciones') with ordinality a(s,n);
    select coalesce(jsonb_agg(f||jsonb_build_object('item',n-1) order by n,f->>'kind'),'[]'::jsonb) into ficheros
     from jsonb_array_elements(p_borrador->'selecciones') with ordinality a(s,n)
     cross join lateral jsonb_array_elements(pedido.archivos) f
     where (f->>'item')::integer=(s->>'origen')::integer and case f->>'kind' when 'logo' then (s->'item'->>'tieneLogo')::boolean when 'render' then (s->'item'->>'tieneRender')::boolean else false end;
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
  if p_modo='publicar' and p_borrador ? 'selecciones' then
   select jsonb_set(jsonb_set(p_borrador,'{selecciones}',jsonb_agg(jsonb_build_object('origen',n-1,'item',s->'item') order by n)),'{partidasVersion}',to_jsonb((select partidas_version from public.zain_pedidos where id=p_id))) into p_borrador from jsonb_array_elements(p_borrador->'selecciones') with ordinality a(s,n);
  end if;
  update public.zain_cotizaciones set borrador=case when p_modo='retirar' then old.borrador else p_borrador end,publicada=documento,version=version+1,updated_at=now(),actor=p_actor where pedido_id=p_id returning * into changed;
 end if;
 insert into public.zain_cotizaciones_historial(pedido_id,version,modo,borrador,publicada,actor) values(p_id,changed.version,p_modo,changed.borrador,changed.publicada,p_actor);
 return to_jsonb(changed);
end;
$$;

revoke all on function public.zain_cotizacion_guardar(uuid,integer,text,jsonb,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.zain_cotizacion_guardar(uuid,integer,text,jsonb,jsonb,uuid) to service_role;
commit;
