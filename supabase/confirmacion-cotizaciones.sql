begin;
-- La aceptación del cliente tiene su propio registro; no se atribuye a un usuario del equipo.
alter table public.zain_historial alter column actor drop not null;
alter table public.zain_pedidos drop constraint zain_pedidos_estado_check;
alter table public.zain_pedidos add constraint zain_pedidos_estado_check check(estado in ('nuevo','contactado','cotizado','aceptado','confirmado','produccion','entregado','cancelado'));
create table public.zain_cotizacion_aceptaciones(
 pedido_id uuid not null references public.zain_pedidos(id),revision integer not null check(revision>0),
 aceptada_at timestamptz not null default now(),documento jsonb not null check(jsonb_typeof(documento)='object'),
 primary key(pedido_id,revision)
);
create table public.zain_pagos(
 id uuid primary key,pedido_id uuid not null,revision integer not null,
 importe bigint not null check(importe>0 and importe<=100000000000),referencia text not null default '' check(length(referencia)<=300),
 actor uuid not null references auth.users(id),created_at timestamptz not null default now(),
 foreign key(pedido_id,revision) references public.zain_cotizacion_aceptaciones(pedido_id,revision)
);
create index zain_pagos_pedido_revision on public.zain_pagos(pedido_id,revision);
alter table public.zain_cotizacion_aceptaciones enable row level security;
alter table public.zain_pagos enable row level security;
revoke all on public.zain_cotizacion_aceptaciones,public.zain_pagos from public,anon,authenticated,service_role;
grant select,insert on public.zain_cotizacion_aceptaciones,public.zain_pagos to service_role;

-- La API valida el enlace de seguimiento. El consumidor público nunca ejecuta RPC directamente.
create function public.zain_cotizacion_aceptar(p_id uuid,p_revision integer)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare pedido public.zain_pedidos; cot public.zain_cotizaciones; aceptada public.zain_cotizacion_aceptaciones;
begin
 select * into pedido from public.zain_pedidos where id=p_id and guardado_at is not null and archivado_at is null for update;
 if not found or pedido.estado='cancelado' then return null;end if;
 select * into cot from public.zain_cotizaciones where pedido_id=p_id for update;
 if not found or cot.publicada is null or (cot.publicada->>'revision')::integer<>p_revision then return null;end if;
 select * into aceptada from public.zain_cotizacion_aceptaciones where pedido_id=p_id and revision=p_revision;
 if found then return jsonb_build_object('revision',p_revision,'aceptada_at',aceptada.aceptada_at);end if;
 if pedido.estado not in ('nuevo','contactado','cotizado') then return null;end if;
 if coalesce(cot.publicada->>'vigencia','')<>'' and (cot.publicada->>'vigencia')::date<(now() at time zone 'America/Mexico_City')::date then return null;end if;
 insert into public.zain_cotizacion_aceptaciones(pedido_id,revision,documento) values(p_id,p_revision,cot.publicada) returning * into aceptada;
 update public.zain_pedidos set estado='aceptado',version=version+1,updated_at=now() where id=p_id;
 insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,null,pedido.estado,'aceptado','El cliente aceptó la revisión '||p_revision||' desde su enlace. Anticipo pendiente de verificación.');
 return jsonb_build_object('revision',p_revision,'aceptada_at',aceptada.aceptada_at);
end;$$;

create function public.zain_registrar_pago(p_id uuid,p_revision integer,p_request uuid,p_importe bigint,p_referencia text,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
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
 objetivo=(total*porcentaje+5000)/10000;
 if recibido+p_importe>=objetivo and pedido.estado='aceptado' then
  update public.zain_pedidos set estado='confirmado',version=version+1,updated_at=now() where id=p_id;
  insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,pedido.estado,'confirmado','Anticipo verificado por el equipo; pedido listo para programar producción.');
 else
  update public.zain_pedidos set version=version+1,updated_at=now() where id=p_id;
  insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,pedido.estado,pedido.estado,'Pago verificado por el equipo y registrado en el seguimiento.');
 end if;
 return jsonb_build_object('registrado',true,'repetido',false);
end;$$;
revoke all on function public.zain_cotizacion_aceptar(uuid,integer),public.zain_registrar_pago(uuid,integer,uuid,bigint,text,uuid) from public,anon,authenticated;
grant execute on function public.zain_cotizacion_aceptar(uuid,integer),public.zain_registrar_pago(uuid,integer,uuid,bigint,text,uuid) to service_role;
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
   select jsonb_agg(jsonb_build_object('indice',l->'indice','sku',l->'sku','nombre',l->'nombre','color',l->'color','tecnica',l->'tecnica','piezas',l->'piezas','tallas',l->'tallas','zona',l->'zona','cm',l->'cm','precio',l->'precio','descuento',l->'descuento','bruto',l->'bruto','rebaja',l->'rebaja','importe',l->'importe','preciosTalla',case when jsonb_typeof(l->'preciosTalla')='array' then (select jsonb_agg(jsonb_build_object('tallas',g->'tallas','piezas',g->'piezas','precio',g->'precio','importe',g->'importe')) from jsonb_array_elements(l->'preciosTalla') g) end,'cargo',case when jsonb_typeof(l->'cargo')='object' then jsonb_build_object('concepto',l->'cargo'->'concepto','importe',l->'cargo'->'importe') end) order by (l->>'indice')::integer) into lineas from jsonb_array_elements(p_publicada->'partidas') l;
   documento=jsonb_build_object('schema',1,'moneda','MXN','folio',pedido.folio,'revision',old.version+1,'publicada_at',now(),'destinatario',p_publicada->'destinatario','condiciones',p_publicada->'condiciones','plazo',p_publicada->'plazo','vigencia',p_publicada->'vigencia','impuesto',p_publicada->'impuesto','envio',p_publicada->'envio','bruto',p_publicada->'bruto','descuento',p_publicada->'descuento','subtotal',p_publicada->'subtotal','impuestos',p_publicada->'impuestos','total',p_publicada->'total','partidas',lineas,'pagos',case when jsonb_typeof(p_publicada->'pagos')='object' then jsonb_build_object('anticipo',p_publicada->'pagos'->'anticipo','instrucciones',p_publicada->'pagos'->'instrucciones') else null end);
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
create or replace function public.zain_actualizar_pedido(p_id uuid,p_version integer,p_estado text,p_notas text,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare old public.zain_pedidos; changed public.zain_pedidos;
begin
  if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
  select * into old from public.zain_pedidos where id=p_id and guardado_at is not null for update;
  if not found or old.version<>p_version then return null; end if;
  if p_estado='aceptado' and old.estado<>'aceptado' then return null;end if;
  if p_estado in ('nuevo','contactado','cotizado') and exists(select 1 from public.zain_cotizacion_aceptaciones a join public.zain_cotizaciones c on c.pedido_id=a.pedido_id and (c.publicada->>'revision')::integer=a.revision where a.pedido_id=p_id) then return null;end if;
  if p_estado in ('confirmado','produccion','entregado') and exists(select 1 from public.zain_cotizacion_aceptaciones a join public.zain_cotizaciones c on c.pedido_id=a.pedido_id and (c.publicada->>'revision')::integer=a.revision where a.pedido_id=p_id) then
   if (select coalesce(sum(p.importe),0) from public.zain_pagos p join public.zain_cotizaciones c on c.pedido_id=p.pedido_id and (c.publicada->>'revision')::integer=p.revision where p.pedido_id=p_id) < (select case when p_estado='entregado' then (publicada->>'total')::bigint else coalesce(((publicada->>'total')::bigint*(publicada->'pagos'->>'anticipo')::integer+5000)/10000,(publicada->>'total')::bigint+1) end from public.zain_cotizaciones where pedido_id=p_id) then return null;end if;
  end if;
  update public.zain_pedidos set estado=p_estado,notas_internas=p_notas,version=version+1,updated_at=now() where id=p_id returning * into changed;
  insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,old.estado,p_estado,p_notas);
  return to_jsonb(changed);
end;
$$;
create or replace function public.zain_panel_resumen()
returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object(
 'semana_desde',date_trunc('week',now() at time zone 'America/Mexico_City') at time zone 'America/Mexico_City',
 'solicitudes_semana',count(*) filter(where archivado_at is null and created_at >= (date_trunc('week',now() at time zone 'America/Mexico_City') at time zone 'America/Mexico_City')),
 'por_revisar',count(*) filter(where archivado_at is null and estado='nuevo'),
 'anticipos_pendientes',count(*) filter(where archivado_at is null and estado='aceptado'),
 'confirmados',count(*) filter(where archivado_at is null and estado='confirmado'),
 'produccion',count(*) filter(where archivado_at is null and estado='produccion'),
 'entregados',count(*) filter(where archivado_at is null and estado='entregado'),
 'activos',count(*) filter(where archivado_at is null),
 'papelera',count(*) filter(where archivado_at is not null)
 ) from public.zain_pedidos where guardado_at is not null;
$$;

create function public.zain_seguimiento_cotizacion(p_id uuid)
returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('revision',(c.publicada->>'revision')::integer,'aceptada_at',a.aceptada_at,
  'total',(c.publicada->>'total')::bigint,
  'anticipo',case when c.publicada->'pagos'->>'anticipo' is null then null else ((c.publicada->>'total')::bigint*(c.publicada->'pagos'->>'anticipo')::integer+5000)/10000 end,
  'recibido',p.recibido,'saldo',(c.publicada->>'total')::bigint-p.recibido)
 from public.zain_cotizaciones c
 left join public.zain_cotizacion_aceptaciones a on a.pedido_id=c.pedido_id and a.revision=(c.publicada->>'revision')::integer
 left join lateral(select coalesce(sum(importe),0)::bigint as recibido from public.zain_pagos where pedido_id=c.pedido_id and revision=(c.publicada->>'revision')::integer) p on true
 where c.pedido_id=p_id and c.publicada is not null;
$$;
revoke all on function public.zain_seguimiento_cotizacion(uuid) from public,anon,authenticated;
grant execute on function public.zain_seguimiento_cotizacion(uuid) to service_role;

commit;
