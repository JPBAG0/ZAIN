-- WhatsApp manual (22-oct-2026). Después de pedidos, accesos, cliente y embudo-analista.
-- Sin DELETE, sin mensajes automáticos. Todas las escrituras pasan por la Edge autorizada.
begin;
create schema if not exists zain_privado;
revoke all on schema zain_privado from public,anon;
grant usage on schema zain_privado to authenticated;
-- Necesario para consultar autorizaciones que los usuarios no pueden leer directamente.
create or replace function zain_privado.wa_equipo() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.zain_equipo e where e.user_id=(select auth.uid()) and e.activo)
 and exists(select 1 from public.zain_accesos a where a.email=lower((select auth.jwt()->>'email')) and a.activo)
$$;
revoke all on function zain_privado.wa_equipo() from public,anon;
grant execute on function zain_privado.wa_equipo() to authenticated;
create table public.zain_wa_chats(
 id uuid primary key default gen_random_uuid(),jid text not null unique check(jid ~ '^[0-9]{5,20}@(s.whatsapp.net|lid)$'),
 telefono text,nombre text not null default '',pedido_id uuid references public.zain_pedidos(id),
 entrantes integer not null default 0,no_leidos integer not null default 0,leido_hasta bigint not null default 0,
 ultimo_mensaje text not null default '',ultima_fecha timestamptz not null default now(),ultimo_entrante timestamptz,ultimo_saliente timestamptz
);
create table public.zain_wa_mensajes(
 id uuid primary key default gen_random_uuid(),secuencia bigint generated always as identity unique,chat_id uuid not null references public.zain_wa_chats(id),wa_id text not null check(length(wa_id) between 1 and 150),
 direccion text not null check(direccion in ('entrante','saliente','persona-desde-cel')),
 tipo text not null check(tipo in ('texto','imagen','audio','video','documento','sticker')),
 texto text not null default '' check(length(texto)<=4000),media_path text,mime text,fecha timestamptz not null,
 unique(chat_id,wa_id)
);
create index zain_wa_mensajes_hilo on public.zain_wa_mensajes(chat_id,fecha desc,id desc);
create index zain_wa_chats_lista on public.zain_wa_chats(ultima_fecha desc,id);
create index zain_wa_chats_pedido on public.zain_wa_chats(pedido_id) where pedido_id is not null;
create table public.zain_wa_salida(
 id uuid primary key,chat_id uuid not null references public.zain_wa_chats(id),actor uuid not null references auth.users(id),autor_email text not null,
 texto text not null check(length(texto) between 1 and 4000),cotizacion_revision integer,estado text not null default 'pendiente' check(estado in ('pendiente','preparando','enviando','enviada','error','incierto')),
 created_at timestamptz not null default now(),vence_at timestamptz not null default now()+interval '15 minutes',
 lease uuid,lease_hasta timestamptz,ejecutor uuid,mensaje_wa_id text,terminado_at timestamptz,error text
);
create index zain_wa_salida_cola on public.zain_wa_salida(created_at) where estado in ('pendiente','preparando','enviando');
create table public.zain_wa_estado(
 id integer primary key check(id=1),estado text not null default 'desconectado' check(estado in ('iniciando','esperando-qr','conectado','reconectando','desconectado','error')),
 qr text check(qr is null or (length(qr)<40000 and qr ~ '^data:image/png;base64,')),qr_expira timestamptz,numero text,
 ultima_senal timestamptz,ejecutor uuid,lease_hasta timestamptz,desvincular boolean not null default false,bot_automatico boolean not null default false check(bot_automatico=false)
);
insert into public.zain_wa_estado(id) values(1);
create table public.zain_wa_no_venta(
 id uuid primary key,pedido_id uuid not null references public.zain_pedidos(id),actor uuid not null references auth.users(id),
 motivo text not null check(motivo in ('precio','tiempo','calidad','otro')),created_at timestamptz not null default now()
);
create table public.zain_wa_config(id integer primary key check(id=1),plantillas jsonb not null check(jsonb_typeof(plantillas)='array' and jsonb_array_length(plantillas)=5));
insert into public.zain_wa_config values(1,$plantillas$[{"id": "amable", "nombre": "Seguimiento amable", "texto": "Hola {nombre}, soy {vendedor} de ZAIN. ¿Pudiste revisar la cotización de {prenda}? Si te late, ¿la apartamos para entregarte el {fecha A} o el {fecha B}?"}, {"id": "lo-pienso", "nombre": "Lo pienso o lo consulto", "texto": "Sí, claro, así estás más seguro. Para ayudarte, ¿qué es lo que te falta definir, el precio, los tiempos o el diseño? Si quieres te mando fotos de trabajos parecidos para enseñárselas a quien decide. El precio te lo respeto hasta el {fecha}."}, {"id": "precio", "nombre": "Está caro", "texto": "Sí, te entiendo. Fuera del precio, ¿hay algo más que te detenga? Lo que incluye es {beneficio confirmado}; sale a ${precio_por_persona} por persona de tu equipo. Si ajustamos {cantidad o técnica}, ¿lo cerramos así?"}, {"id": "retroalimentacion", "nombre": "Pedir retroalimentación", "texto": "{nombre}, gracias por considerarnos. Queremos mejorar en lo que hacemos y nos ayudaría mucho saber qué nos faltó: ¿fue el precio, el tiempo de entrega, el diseño u otra cosa? Con una palabra nos basta."}, {"id": "postventa", "nombre": "Post venta", "texto": "Hola {nombre}, ¿qué tal les quedaron los {prenda}? Nos encantaría ver una foto del equipo con ellos y, si te animas, compartirla en nuestra sección de clientes. Para tu próximo pedido aquí estamos."}]$plantillas$);
alter table public.zain_wa_config enable row level security;
create policy wa_config_equipo on public.zain_wa_config for select to authenticated using((select zain_privado.wa_equipo()));
revoke all on public.zain_wa_config from public,anon,authenticated,service_role;
grant select on public.zain_wa_config to authenticated;
grant select,insert,update on public.zain_wa_config to service_role;
-- Solo lectura del equipo. Encolar, vincular y marcar leídos requieren una operación humana autenticada en la Edge.
alter table public.zain_wa_chats enable row level security;
alter table public.zain_wa_mensajes enable row level security;
alter table public.zain_wa_salida enable row level security;
alter table public.zain_wa_estado enable row level security;
alter table public.zain_wa_no_venta enable row level security;
create policy wa_chats_equipo on public.zain_wa_chats for select to authenticated using((select zain_privado.wa_equipo()));
create policy wa_mensajes_equipo on public.zain_wa_mensajes for select to authenticated using((select zain_privado.wa_equipo()));
create policy wa_salida_equipo on public.zain_wa_salida for select to authenticated using((select zain_privado.wa_equipo()));
create policy wa_estado_equipo on public.zain_wa_estado for select to authenticated using((select zain_privado.wa_equipo()));
create policy wa_motivo_equipo on public.zain_wa_no_venta for select to authenticated using((select zain_privado.wa_equipo()));
revoke all on public.zain_wa_chats,public.zain_wa_mensajes,public.zain_wa_salida,public.zain_wa_estado,public.zain_wa_no_venta from public,anon,authenticated,service_role;
grant select on public.zain_wa_chats,public.zain_wa_mensajes,public.zain_wa_salida,public.zain_wa_estado,public.zain_wa_no_venta to authenticated;
grant usage,select on sequence public.zain_wa_mensajes_secuencia_seq to service_role;
grant select,insert,update on public.zain_wa_chats,public.zain_wa_mensajes,public.zain_wa_salida,public.zain_wa_estado,public.zain_wa_no_venta to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('zain-wa-media','zain-wa-media',false,8388608,array['image/jpeg','image/png','image/webp','audio/ogg','audio/mpeg','audio/mp4','audio/wav','application/pdf','video/mp4'])
 on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

-- Restringe incluso políticas históricas globales; el acceso va por URLs firmadas de la Edge.
create policy wa_media_solo_servidor on storage.objects as restrictive for all to anon,authenticated using(bucket_id<>'zain-wa-media') with check(bucket_id<>'zain-wa-media');

create function public.zain_wa_operar(p_modo text,p_datos jsonb,p_actor uuid default null)
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
   if s.actor<>p_actor or s.chat_id<>c.id or s.texto<>p_datos->>'texto' then return jsonb_build_object('error','La solicitud ya existe con otros datos.');end if;
   return to_jsonb(s);
  end if;
  insert into public.zain_wa_salida(id,chat_id,actor,autor_email,texto,mensaje_wa_id,cotizacion_revision) values((p_datos->>'id')::uuid,c.id,p_actor,p_datos->>'autor_email',p_datos->>'texto',p_datos->>'mensaje_wa_id',(p_datos->>'cotizacion_revision')::integer) returning * into s;
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
  if s.estado not in ('enviando','incierto','enviada') then return jsonb_build_object('error','Envío sin iniciar.');end if;
  if p_datos->>'estado'='enviada' and p_datos->>'wa_id'=s.mensaje_wa_id then
   update public.zain_wa_salida set estado='enviada',terminado_at=now(),error=null where id=s.id;
   select * into c from public.zain_wa_chats where id=s.chat_id for update;
   insert into public.zain_wa_mensajes(chat_id,wa_id,direccion,tipo,texto,fecha) values(c.id,s.mensaje_wa_id,'saliente','texto',s.texto,now()) on conflict(chat_id,wa_id) do nothing;
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
create function public.zain_wa_resumen_motivos(p_desde date,p_hasta date) returns jsonb language sql stable security invoker set search_path='' as $$
 select coalesce(jsonb_object_agg(motivo,total),'{}'::jsonb) from(select motivo,count(*) as total from public.zain_wa_no_venta where (created_at at time zone 'America/Mexico_City')::date between p_desde and p_hasta group by motivo) m
$$;
revoke all on function public.zain_wa_resumen_motivos(date,date) from public,anon,authenticated;
grant execute on function public.zain_wa_resumen_motivos(date,date) to service_role;

create or replace function public.zain_embudo_base_wa(p_desde date, p_hasta date, p_corte date default '2026-10-16')
returns jsonb
language sql
stable
set search_path = ''
as $$
with
lim as (
  select (p_desde::timestamp at time zone 'America/Mexico_City') as d0,
         ((p_hasta + 1)::timestamp at time zone 'America/Mexico_City') as d1,
         (p_corte::timestamp at time zone 'America/Mexico_City') as corte
),
base as (
  -- No cuenta: nota con NO COTIZAR/prueba, o en la papelera (igual que Finanzas de Gestión ZAIN).
  select p.*, (coalesce(p.notas_internas, '') ~* '(no cotizar|prueba)' or p.archivado_at is not null) as es_prueba
  from public.zain_pedidos p, lim
  where p.guardado_at is not null and p.created_at >= lim.corte
),
r as (
  select b.id, b.folio, b.estado, b.created_at, b.archivado_at,
    (select min(h.created_at) from public.zain_cotizaciones_historial h where h.pedido_id = b.id and h.modo = 'publicar') as cotizada_at,
    (select min(a.aceptada_at) from public.zain_cotizacion_aceptaciones a where a.pedido_id = b.id) as aceptada_at,
    (select min(h.created_at) from public.zain_historial h where h.pedido_id = b.id
       and h.estado_nuevo in ('confirmado', 'produccion', 'entregado') and h.estado_anterior is distinct from h.estado_nuevo) as confirmado_at,
    (select min(h.created_at) from public.zain_historial h where h.pedido_id = b.id
       and h.estado_nuevo = 'entregado' and h.estado_anterior is distinct from h.estado_nuevo) as entregado_at,
    (select (a.documento->>'total')::bigint from public.zain_cotizacion_aceptaciones a
       where a.pedido_id = b.id order by a.revision desc limit 1) as total_aceptado,
    (select coalesce(sum(g.importe), 0) from public.zain_pagos g where g.pedido_id = b.id) as cobrado_total,
    greatest(b.created_at,
      (select max(h.created_at) from public.zain_historial h where h.pedido_id = b.id),
      (select max(h.created_at) from public.zain_cotizaciones_historial h where h.pedido_id = b.id),
      (select max(a.aceptada_at) from public.zain_cotizacion_aceptaciones a where a.pedido_id = b.id),
      (select max(g.created_at) from public.zain_pagos g where g.pedido_id = b.id)) as ultimo_mov
  from base b
  where not b.es_prueba
),
pagos as (
  select g.created_at, g.importe from public.zain_pagos g join r on r.id = g.pedido_id
),
dias as (
  select d::date as fecha from generate_series(p_desde, p_hasta, interval '1 day') d
),
local as (
  select r.*,
    (r.created_at at time zone 'America/Mexico_City')::date as dia_sol,
    (r.cotizada_at at time zone 'America/Mexico_City')::date as dia_cot,
    (r.aceptada_at at time zone 'America/Mexico_City')::date as dia_acep,
    greatest(coalesce(r.total_aceptado, 0) - r.cobrado_total, 0) as saldo,
    extract(epoch from (now() - r.ultimo_mov)) / 3600 as horas
  from r
),
seg as (
  select folio,
    case when cotizada_at is null and estado in ('nuevo', 'contactado') then 'por cotizar'
         when cotizada_at is not null and aceptada_at is null then 'cotización sin respuesta'
         when aceptada_at is not null and saldo > 0 then 'saldo pendiente' end as etapa,
    round(horas)::int as horas_sin_mover, round(saldo / 100.0, 2) as saldo_mxn
  from local
  where estado <> 'cancelado' and archivado_at is null and horas > 48
)
select jsonb_build_object(
  'ventana', jsonb_build_object('desde', p_desde, 'hasta', p_hasta, 'zona', 'America/Mexico_City'),
  'corte', p_corte,
  'generado', now(),
  'periodo', (select jsonb_build_object(
      'solicitudes', count(*) filter (where created_at >= lim.d0 and created_at < lim.d1),
      'cotizaciones_enviadas', count(*) filter (where cotizada_at >= lim.d0 and cotizada_at < lim.d1),
      'aceptadas', count(*) filter (where aceptada_at >= lim.d0 and aceptada_at < lim.d1),
      'confirmados', count(*) filter (where confirmado_at >= lim.d0 and confirmado_at < lim.d1),
      'entregados', count(*) filter (where entregado_at >= lim.d0 and entregado_at < lim.d1),
      'cancelados_de_las_solicitudes', count(*) filter (where created_at >= lim.d0 and created_at < lim.d1 and estado = 'cancelado'),
      'venta_aceptada_mxn', round(coalesce(sum(total_aceptado) filter (where aceptada_at >= lim.d0 and aceptada_at < lim.d1), 0) / 100.0, 2),
      'cobrado_mxn', round(coalesce((select sum(importe) from pagos where created_at >= lim.d0 and created_at < lim.d1), 0) / 100.0, 2),
      'horas_mediana_solicitud_a_cotizacion', round((percentile_cont(0.5) within group (order by extract(epoch from (cotizada_at - created_at)) / 3600)
         filter (where cotizada_at >= lim.d0 and cotizada_at < lim.d1))::numeric, 1)
    ) from local, lim group by lim.d0, lim.d1),
  'por_dia', (select coalesce(jsonb_agg(jsonb_build_object(
      'fecha', d.fecha,
      'solicitudes', (select count(*) from local where dia_sol = d.fecha),
      'cotizaciones_enviadas', (select count(*) from local where dia_cot = d.fecha),
      'aceptadas', (select count(*) from local where dia_acep = d.fecha),
      'cobrado_mxn', round(coalesce((select sum(importe) from pagos where (created_at at time zone 'America/Mexico_City')::date = d.fecha), 0) / 100.0, 2)
    ) order by d.fecha), '[]'::jsonb) from dias d),
  'ahora', (select jsonb_build_object(
      'por_cotizar', count(*) filter (where cotizada_at is null and estado in ('nuevo', 'contactado') and archivado_at is null),
      'cotizadas_sin_aceptar', count(*) filter (where cotizada_at is not null and aceptada_at is null and estado <> 'cancelado' and archivado_at is null),
      'en_produccion', count(*) filter (where estado in ('confirmado', 'produccion') and archivado_at is null),
      'pedidos_con_saldo', count(*) filter (where saldo > 0 and estado <> 'cancelado'),
      'saldo_por_cobrar_mxn', round(coalesce(sum(saldo) filter (where estado <> 'cancelado'), 0) / 100.0, 2)
    ) from local),
  'seguimiento_48h', (select coalesce(jsonb_agg(jsonb_build_object('folio', folio, 'etapa', etapa, 'horas_sin_mover', horas_sin_mover, 'saldo_mxn', saldo_mxn)
      order by horas_sin_mover desc), '[]'::jsonb) from seg where etapa is not null),
  'excluidos_como_prueba', (select count(*) from base where es_prueba)
);
$$;
revoke all on function public.zain_embudo_base_wa(date,date,date) from public,anon,authenticated;
grant execute on function public.zain_embudo_base_wa(date,date,date) to service_role;
create or replace function public.zain_embudo(p_desde date,p_hasta date,p_corte date default '2026-10-16') returns jsonb language sql stable security invoker set search_path='' as $$
 select public.zain_embudo_base_wa(p_desde,p_hasta,p_corte)||jsonb_build_object('motivos_no_venta',public.zain_wa_resumen_motivos(p_desde,p_hasta))
$$;
revoke all on function public.zain_embudo(date,date,date) from public,anon,authenticated;
grant execute on function public.zain_embudo(date,date,date) to service_role;
commit;
