-- Adjuntos manuales de Chats. Aplicar después de whatsapp-manual.sql; no modifica mensajes anteriores.
begin;
alter table public.zain_wa_salida add column adjunto jsonb;
alter table public.zain_wa_salida drop constraint zain_wa_salida_texto_check;
alter table public.zain_wa_salida add constraint zain_wa_salida_texto_check check(length(texto)<=4000 and (length(texto)>0 or adjunto is not null));
alter table public.zain_wa_salida add constraint zain_wa_salida_adjunto_check check(adjunto is null or (
 jsonb_typeof(adjunto)='object' and adjunto ?& array['ruta','nombre','mime','bytes','hash','tipo']
 and adjunto->>'mime' in ('application/pdf','image/jpeg','image/png','image/webp','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
 and adjunto->>'tipo' in ('imagen','documento') and (adjunto->>'bytes')::integer between 12 and 8388608
 and adjunto->>'hash' ~ '^[a-f0-9]{64}$' and length(adjunto->>'nombre') between 1 and 160));
update storage.buckets set allowed_mime_types=allowed_mime_types||array['application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] where id='zain-wa-media';
create or replace function public.zain_wa_operar(p_modo text,p_datos jsonb,p_actor uuid default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare c public.zain_wa_chats;s public.zain_wa_salida;e public.zain_wa_estado;m public.zain_wa_mensajes;ped public.zain_pedidos;r jsonb;es_nuevo boolean;wa text;direc text;limite bigint;
begin
 if p_modo in ('encolar','leido','ligar','crear_pedido','desvincular','motivo','plantillas') and not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado';end if;
 if p_modo='estado' then
  select * into e from public.zain_wa_estado where id=1 for update;
  if e.ejecutor is not null and e.ejecutor<>(p_datos->>'ejecutor')::uuid and e.lease_hasta>now() then return jsonb_build_object('error','Otro puente tiene la sesión.');end if;
  update public.zain_wa_estado set ejecutor=(p_datos->>'ejecutor')::uuid,lease_hasta=now()+interval '40 seconds',ultima_senal=now(),
   estado=p_datos->>'estado',qr=case when p_datos->>'estado'='esperando-qr' then p_datos->>'qr' end,
   qr_expira=case when p_datos->>'estado'='esperando-qr' then least((p_datos->>'qr_expira')::timestamptz,now()+interval '25 seconds') end,
   numero=case when p_datos->>'estado'='conectado' then p_datos->>'numero' end where id=1 returning * into e;
  return jsonb_build_object('desvincular',e.desvincular);
 elsif p_modo='desvincular' then
  update public.zain_wa_estado set desvincular=true,qr=null,qr_expira=null where id=1;return '{"ok":true}';
 elsif p_modo='desvinculado' then
  update public.zain_wa_estado set desvincular=false,estado='desconectado',qr=null,numero=null where id=1 and ejecutor=(p_datos->>'ejecutor')::uuid;
  update public.zain_wa_salida set estado='error',error='Desvinculado antes del envío',terminado_at=now() where estado in ('pendiente','preparando');return '{"ok":true}';
 elsif p_modo='recibir' then
  insert into public.zain_wa_chats(jid,telefono,nombre,ultima_fecha) values(p_datos->>'jid',p_datos->>'telefono',coalesce(p_datos->>'nombre',''),(p_datos->>'fecha')::timestamptz)
   on conflict(jid) do nothing;
  select * into c from public.zain_wa_chats where jid=p_datos->>'jid' for update;
  direc=p_datos->>'direccion';
  if direc='persona-desde-cel' and exists(select 1 from public.zain_wa_salida where mensaje_wa_id=p_datos->>'wa_id' and chat_id=c.id) then direc='saliente';end if;
  insert into public.zain_wa_mensajes(chat_id,wa_id,direccion,tipo,texto,media_path,mime,fecha)
   values(c.id,p_datos->>'wa_id',direc,p_datos->>'tipo',coalesce(p_datos->>'texto',''),p_datos->>'media_path',p_datos->>'mime',(p_datos->>'fecha')::timestamptz)
   on conflict(chat_id,wa_id) do nothing returning * into m;
  es_nuevo=found;
  if es_nuevo then
   update public.zain_wa_chats set nombre=case when coalesce(p_datos->>'nombre','')<>'' and direc='entrante' then p_datos->>'nombre' else nombre end,
    telefono=coalesce(telefono,p_datos->>'telefono'),entrantes=entrantes+case when direc='entrante' then 1 else 0 end,
    no_leidos=no_leidos+case when direc='entrante' then 1 else 0 end,
    ultimo_entrante=case when direc='entrante' then greatest(ultimo_entrante,m.fecha) else ultimo_entrante end,
    ultimo_saliente=case when direc<>'entrante' then greatest(ultimo_saliente,m.fecha) else ultimo_saliente end,
    ultimo_mensaje=case when m.fecha>=ultima_fecha then left(m.texto,160) else ultimo_mensaje end,ultima_fecha=greatest(ultima_fecha,m.fecha) where id=c.id;
  end if;
  return jsonb_build_object('id',c.id,'nuevo',es_nuevo,'entrante',direc='entrante');
 elsif p_modo='encolar' then
  select * into c from public.zain_wa_chats where id=(p_datos->>'chat_id')::uuid for update;
  if not found or c.entrantes<1 then return jsonb_build_object('error','Solo puedes responder a quien ya escribió.');end if;
  select * into s from public.zain_wa_salida where id=(p_datos->>'id')::uuid;
  if found then
   if s.actor<>p_actor or s.chat_id<>c.id or s.texto<>p_datos->>'texto' or s.adjunto is distinct from nullif(p_datos->'adjunto','null'::jsonb) then return jsonb_build_object('error','La solicitud ya existe con otros datos.');end if;
   return to_jsonb(s);
  end if;
  if nullif(p_datos->'adjunto','null'::jsonb) is not null and ((p_datos->'adjunto'->>'ruta') is distinct from ('salida/'||p_actor::text||'/'||(p_datos->>'id')||'-'||(p_datos->'adjunto'->>'hash')||'.'||case p_datos->'adjunto'->>'mime' when 'application/pdf' then 'pdf' when 'image/jpeg' then 'jpg' when 'image/png' then 'png' when 'image/webp' then 'webp' when 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' then 'docx' when 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' then 'xlsx' end)) then return jsonb_build_object('error','Archivo ajeno al envío.');end if;
  insert into public.zain_wa_salida(id,chat_id,actor,autor_email,texto,mensaje_wa_id,cotizacion_revision,adjunto) values((p_datos->>'id')::uuid,c.id,p_actor,p_datos->>'autor_email',p_datos->>'texto',p_datos->>'mensaje_wa_id',(p_datos->>'cotizacion_revision')::integer,nullif(p_datos->'adjunto','null'::jsonb)) returning * into s;
  if c.pedido_id is not null then insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas)
   select id,p_actor,estado,estado,'Envío manual de WhatsApp puesto en cola.' from public.zain_pedidos where id=c.pedido_id;end if;
  return to_jsonb(s);
 elsif p_modo='tomar' then
  select * into e from public.zain_wa_estado where id=1 for update;
  if e.ejecutor<>(p_datos->>'ejecutor')::uuid or e.lease_hasta<now() or e.estado<>'conectado' or e.desvincular then return 'null';end if;
  update public.zain_wa_salida set estado='incierto',error='Confirmar en el celular; no se reintenta automáticamente.' where estado='enviando' and lease_hasta<now();
  update public.zain_wa_salida set estado='pendiente',lease=null where estado='preparando' and lease_hasta<now();
  update public.zain_wa_salida set estado='error',error='Envío vencido; requiere una nueva decisión humana.' where estado in ('pendiente','preparando') and vence_at<now();
  select * into s from public.zain_wa_salida where estado='pendiente' and vence_at>now() order by created_at,id limit 1 for update skip locked;
  if not found then return 'null';end if;
  update public.zain_wa_salida set estado='preparando',lease=gen_random_uuid(),lease_hasta=now()+interval '90 seconds',ejecutor=e.ejecutor where id=s.id returning * into s;
  return (to_jsonb(s)-'autor_email')||jsonb_build_object('jid',(select jid from public.zain_wa_chats where id=s.chat_id));
 elsif p_modo in ('iniciar','terminar') then
  select * into s from public.zain_wa_salida where id=(p_datos->>'id')::uuid for update;
  if not found or s.lease is distinct from (p_datos->>'lease')::uuid or s.ejecutor is distinct from (p_datos->>'ejecutor')::uuid then return jsonb_build_object('error','Reserva de envío inválida.');end if;
  if p_modo='iniciar' then
   if s.estado<>'preparando' or s.lease_hasta<now() or s.vence_at<now() or exists(select 1 from public.zain_wa_estado where id=1 and (desvincular or estado<>'conectado' or lease_hasta<now() or ejecutor is distinct from s.ejecutor)) then return jsonb_build_object('error','El envío ya no está autorizado.');end if;
   if not exists(select 1 from public.zain_equipo where user_id=s.actor and activo) or not exists(select 1 from public.zain_accesos where email=s.autor_email and activo) then update public.zain_wa_salida set estado='error',error='El autor ya no tiene acceso.' where id=s.id;return jsonb_build_object('error','El autor ya no tiene acceso.');end if;
   update public.zain_wa_salida set estado='enviando' where id=s.id;return '{"ok":true}';
  end if;
  if p_datos->>'estado'='error' and s.estado='preparando' then update public.zain_wa_salida set estado='error',error='No se pudo preparar el archivo; decide un nuevo envío.',terminado_at=now() where id=s.id;return '{"ok":true}';end if;
  if s.estado not in ('enviando','incierto','enviada') then return jsonb_build_object('error','Envío sin iniciar.');end if;
  if p_datos->>'estado'='enviada' and p_datos->>'wa_id'=s.mensaje_wa_id then
   update public.zain_wa_salida set estado='enviada',terminado_at=now(),error=null where id=s.id;
   select * into c from public.zain_wa_chats where id=s.chat_id for update;
   insert into public.zain_wa_mensajes(chat_id,wa_id,direccion,tipo,texto,media_path,mime,fecha) values(c.id,s.mensaje_wa_id,'saliente',coalesce(s.adjunto->>'tipo','texto'),s.texto,s.adjunto->>'ruta',s.adjunto->>'mime',now()) on conflict(chat_id,wa_id) do update set media_path=coalesce(zain_wa_mensajes.media_path,excluded.media_path),mime=coalesce(zain_wa_mensajes.mime,excluded.mime);
   update public.zain_wa_chats set ultimo_mensaje=left(s.texto,160),ultima_fecha=now(),ultimo_saliente=now() where id=c.id;
  elsif s.estado<>'enviada' then update public.zain_wa_salida set estado='incierto',error='Resultado incierto; revisar celular antes de decidir otro envío.' where id=s.id;end if;
  return '{"ok":true}';
 elsif p_modo='plantillas' then
  update public.zain_wa_config set plantillas=p_datos->'plantillas' where id=1;return '{"ok":true}';
 elsif p_modo='leido' then
  select * into c from public.zain_wa_chats where id=(p_datos->>'chat_id')::uuid for update;
  select greatest(c.leido_hasta,coalesce(max(secuencia),0)) into limite from public.zain_wa_mensajes where chat_id=c.id and secuencia<=(p_datos->>'hasta')::bigint;
  update public.zain_wa_chats set leido_hasta=limite,no_leidos=(select count(*) from public.zain_wa_mensajes where chat_id=c.id and direccion='entrante' and secuencia>limite) where id=c.id;
  return '{"ok":true}';
 elsif p_modo in ('ligar','crear_pedido') then
  select * into c from public.zain_wa_chats where id=(p_datos->>'chat_id')::uuid for update;
  if not found or c.entrantes<1 then return jsonb_build_object('error','Chat inválido.');end if;
  if p_modo='crear_pedido' then
   if c.pedido_id is not null then return jsonb_build_object('pedido_id',c.pedido_id);end if;
   r=public.zain_crear_pedido((p_datos->>'id')::uuid,p_datos->>'token_hash',p_datos->'items','[]',(p_datos->>'total')::integer,0,838860800,p_datos->>'client');
   if r is null or r ? 'error' then return coalesce(r,jsonb_build_object('error','No se pudo crear el pedido.'));end if;
   update public.zain_pedidos set guardado_at=now(),cliente=jsonb_build_object('nombre',coalesce(nullif(c.nombre,''),'Contacto de WhatsApp'),'telefono',c.telefono),notas_internas='Creado desde chat. Logo y condiciones por definir.' where id=(p_datos->>'id')::uuid and guardado_at is null;
   p_datos=p_datos||jsonb_build_object('pedido_id',p_datos->>'id');
  end if;
  select * into ped from public.zain_pedidos where id=(p_datos->>'pedido_id')::uuid and archivado_at is null and guardado_at is not null;
  if not found then return jsonb_build_object('error','Pedido no disponible.');end if;
  update public.zain_wa_chats set pedido_id=ped.id where id=c.id;
  update public.zain_pedidos set cliente=cliente||jsonb_build_object('telefono',c.telefono) where id=ped.id and c.telefono is not null and coalesce(cliente->>'telefono','')='';
  insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(ped.id,p_actor,ped.estado,ped.estado,'Chat de WhatsApp vinculado por el equipo.');
  return jsonb_build_object('pedido_id',ped.id,'folio',ped.folio);
 elsif p_modo='motivo' then
  select * into ped from public.zain_pedidos where id=(p_datos->>'pedido_id')::uuid and archivado_at is null;
  if not found then return jsonb_build_object('error','Pedido no disponible.');end if;
  if exists(select 1 from public.zain_wa_no_venta where id=(p_datos->>'id')::uuid and (pedido_id<>ped.id or actor<>p_actor or motivo<>p_datos->>'motivo')) then return jsonb_build_object('error','La solicitud ya existe con otros datos.');end if;
  insert into public.zain_wa_no_venta(id,pedido_id,actor,motivo) values((p_datos->>'id')::uuid,ped.id,p_actor,p_datos->>'motivo') on conflict(id) do nothing;
  if found then insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(ped.id,p_actor,ped.estado,ped.estado,'Motivo de no venta: '||(p_datos->>'motivo'));end if;
  return '{"ok":true}';
 end if;
 raise exception 'Operación WhatsApp desconocida';
end;$$;

revoke all on function public.zain_wa_operar(text,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.zain_wa_operar(text,jsonb,uuid) to service_role;
commit;
