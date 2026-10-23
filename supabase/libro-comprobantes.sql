-- 23-oct-2026: comprobantes en el libro flexible. Un gasto (general o de pedido) puede adjuntar su comprobante al
-- registrarse o corregirse, y el libro lo devuelve para «Ver comprobante». Con esto la sección anterior de
-- movimientos generales deja de ser necesaria en Finanzas. Posterior a libro-flexible.sql.
begin;
grant update(comprobante) on public.zain_movimientos_generales,public.zain_pedido_movimientos to service_role;
create or replace function public.zain_libro_operar(p_modo text,p_origen text,p_id uuid,p_datos jsonb,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
#variable_conflict use_variable
declare
 d jsonb:=coalesce(p_datos,'{}'::jsonb);tipo text:=d->>'tipo';ped uuid;destino text;nuevo uuid;antes jsonb;
 importe bigint;iva bigint;fecha date;concepto text;persona text;grupo text;categoria text;origen_c text;destino_c text;
 pedido public.zain_pedidos;cot public.zain_cotizaciones;rev integer;cuenta public.zain_pedido_cuentas;viejo_ped uuid;
 creado timestamptz;cobrado bigint;objetivo bigint;comp uuid:=nullif(p_datos->>'comprobante','')::uuid;
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
  if persona not in ('juan_pablo','garcia','zain') then return jsonb_build_object('error','Indica quién pagó o recibió el dinero.');end if;
  if tipo='reembolso' and persona='zain' then return jsonb_build_object('error','El reembolso es para el socio que adelantó dinero.');end if;
  if iva<0 or iva>importe or (tipo<>'gasto' and iva<>0) then return jsonb_build_object('error','Revisa el impuesto recuperable.');end if;
  if grupo not in ('base','extra') then return jsonb_build_object('error','Elige si es material o gasto extra.');end if;
  if ped is not null then
   select * into pedido from public.zain_pedidos where id=ped and guardado_at is not null for update;
   if not found then return jsonb_build_object('error','No encontramos ese pedido.');end if;
   if pedido.archivado_at is not null then return jsonb_build_object('error','Ese pedido está en la papelera. Restáuralo antes de asignarle movimientos.');end if;
  end if;
  if destino='pago' and ped is null then return jsonb_build_object('error','Elige el pedido (folio) al que corresponde el cobro.');end if;
  if destino='pedido' then
   insert into public.zain_pedido_cuentas(pedido_id) values(ped) on conflict do nothing;
   select * into cuenta from public.zain_pedido_cuentas where pedido_id=ped for update;
   if cuenta.cerrado_at is not null then return jsonb_build_object('error','Ese pedido ya está cerrado. Reabre su cierre en la pestaña Gastos para agregarle movimientos.');end if;
  end if;
  if destino='caja' then
   if tipo='reparto' then origen_c='zain';destino_c=persona;
   else origen_c=d->>'origen_persona';destino_c=d->>'destino_persona';end if;
   if origen_c is null or destino_c is null or origen_c=destino_c or 'zain' not in (origen_c,destino_c) or (tipo='reparto' and destino_c='zain') then return jsonb_build_object('error','Una transferencia va entre un socio y la Caja ZAIN.');end if;
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
   update public.zain_pedido_movimientos set grupo=grupo,persona=persona,concepto=concepto,importe=importe,iva_recuperable=iva,fecha=fecha,comprobante=coalesce(comp,comprobante),editado_at=now(),editado_por=p_actor where id=p_id;
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
  objetivo=((cot.publicada->>'total')::bigint*coalesce((cot.publicada->'pagos'->>'anticipo')::integer,10000)+5000)/10000;
  if pedido.estado='aceptado' and cobrado>=objetivo then
   update public.zain_pedidos set estado='confirmado',version=version+1,updated_at=now() where id=ped;
   insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(ped,p_actor,'aceptado','confirmado','Anticipo cubierto con un cobro registrado en Finanzas.');
  else
   update public.zain_pedidos set version=version+1,updated_at=now() where id=ped;
   insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(ped,p_actor,pedido.estado,pedido.estado,'Cobro registrado desde Finanzas: '||to_char(importe/100.0,'FM999,999,990.00'));
  end if;
 elsif destino='pedido' then
  insert into public.zain_pedido_movimientos(id,pedido_id,tipo,grupo,persona,concepto,importe,iva_recuperable,fecha,comprobante,actor)
   values(nuevo,ped,tipo,case when tipo='reembolso' then 'extra' else grupo end,persona,concepto,importe,iva,fecha,comp,p_actor);
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

drop function public.zain_caja_libro();
create function public.zain_caja_libro()
returns table(id uuid,origen text,tipo text,persona text,destino text,origen_persona text,concepto text,importe bigint,iva_recuperable bigint,categoria text,grupo text,fecha date,created_at timestamptz,pedido_id uuid,folio text,en_papelera boolean,efecto_caja bigint,efecto_socio bigint,comprobante uuid)
language sql stable security invoker set search_path='' as $$
 select g.id,'pago','cobro',g.recibio,null::text,null::text,coalesce(nullif(g.referencia,''),'Pago del cliente'),g.importe,0::bigint,null::text,null::text,coalesce(g.fecha,(g.created_at at time zone 'America/Mexico_City')::date),g.created_at,g.pedido_id,p.folio,p.archivado_at is not null,
  case when g.recibio='zain' then g.importe else 0 end,case when g.recibio='zain' then 0 else -g.importe end,null::uuid
 from public.zain_pagos g join public.zain_pedidos p on p.id=g.pedido_id
 union all
 select m.id,'pedido',m.tipo,m.persona,null,null,m.concepto,m.importe,m.iva_recuperable,null,m.grupo,m.fecha,m.created_at,m.pedido_id,p.folio,p.archivado_at is not null,
  case when m.tipo='reembolso' or m.persona='zain' then -m.importe else 0 end,
  case when m.persona='zain' then 0 when m.tipo='reembolso' then -m.importe else m.importe end,m.comprobante
 from public.zain_pedido_movimientos m join public.zain_pedidos p on p.id=m.pedido_id where m.anulado_at is null
 union all
 select m.id,'general',m.tipo,m.persona,null,null,m.concepto,m.importe,m.iva_recuperable,m.categoria,null,m.fecha,m.created_at,null,null,false,
  case when m.tipo='reembolso' then -m.importe when m.persona<>'zain' then 0 when m.tipo='ingreso' then m.importe else -m.importe end,
  case when m.persona='zain' then 0 when m.tipo='gasto' then m.importe else -m.importe end,m.comprobante
 from public.zain_movimientos_generales m where m.anulado_at is null
 union all
 select c.id,'caja',c.tipo,case when c.origen='zain' then c.destino else c.origen end,c.destino,c.origen,c.concepto,c.importe,0,null,null,c.fecha,c.created_at,null,null,false,
  case when c.origen='zain' then -c.importe else c.importe end,
  case when c.tipo='reparto' then 0 when c.origen='zain' then -c.importe else c.importe end,null::uuid
 from public.zain_caja_movimientos c where c.anulado_at is null;
$$;

create or replace function public.zain_caja_resumen()
returns jsonb language sql stable security invoker set search_path='' as $$
 with libro as(select * from public.zain_caja_libro()),
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
  'version',2,
  'caja',(select coalesce(sum(efecto_caja),0)::bigint from libro),
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
  'papelera',(select count(distinct pedido_id) from libro where en_papelera),
  'pedidos',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'folio',p.folio,'cliente',to_jsonb(p)->'cliente'->>'nombre','estado',p.estado,'total',f.venta_total,'cobrado',f.cobrado,'publicada',f.revision is not null) order by p.created_at desc)
   from public.zain_pedidos p left join public.zain_finanzas_estado f on f.id=p.id where p.guardado_at is not null and p.archivado_at is null and p.estado<>'cancelado'),'[]'::jsonb),
  'libro',coalesce((select jsonb_agg(to_jsonb(l) order by l.fecha desc,l.created_at desc) from (select * from libro order by fecha desc,created_at desc limit 500) l),'[]'::jsonb)
 );
$$;
revoke all on function public.zain_libro_operar(text,text,uuid,jsonb,uuid),public.zain_caja_libro(),public.zain_caja_resumen() from public,anon,authenticated;
grant execute on function public.zain_libro_operar(text,text,uuid,jsonb,uuid),public.zain_caja_libro(),public.zain_caja_resumen() to service_role;
commit;
