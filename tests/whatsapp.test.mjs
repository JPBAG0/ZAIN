import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {secretoValido,validarEntrante,rutaMedia} from '../server/whatsapp.mjs';
import {createHandler} from '../server/pedidos.mjs';
import C from '../server/config-interno.cjs';
const modulo=process.env.ZAIN_PGLITE_MODULE;let db;
const uid=randomUUID(),runner=randomUUID(),secreto='s'.repeat(40),fail=(status,message)=>{const e=new Error(message);e.status=status;throw e;};
const recibido=(x={})=>({jid:'15555550101@s.whatsapp.net',wa_id:'FICTICIO1',direccion:'entrante',tipo:'texto',texto:'Hola de prueba',fecha:new Date().toISOString(),...x});
before(async()=>{if(!modulo)return;const {PGlite}=await import(modulo);db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema storage;
 create table auth.users(id uuid primary key,email text);
 create function auth.uid() returns uuid language sql stable as $$select (coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb->>'sub')::uuid$$;
 create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
 grant usage on schema auth to authenticated,anon;grant execute on function auth.uid(),auth.jwt() to authenticated,anon;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid default gen_random_uuid(),bucket_id text);alter table storage.objects enable row level security;
 grant usage on schema storage to anon,authenticated;grant select,insert,update,delete on storage.objects to anon,authenticated;
 create policy global_historica on storage.objects for all to anon,authenticated using(true) with check(true);
 insert into storage.objects(bucket_id) values('zain-wa-media'),('otro-bucket');
 create table zain_equipo(user_id uuid primary key,activo boolean);create table zain_accesos(email text primary key,activo boolean,nombre text);
 create table zain_pedidos(id uuid primary key,folio text,token_hash text,items jsonb,archivos jsonb,total integer check(total>0),version integer default 1,estado text default 'nuevo',created_at timestamptz default now(),guardado_at timestamptz,archivado_at timestamptz,cliente jsonb default '{}',notas_internas text default '',consulta_nonce text default 'ficticio');
 create table zain_historial(pedido_id uuid,actor uuid,estado_anterior text,estado_nuevo text,notas text,created_at timestamptz default now());
 create table zain_cotizaciones_historial(pedido_id uuid,modo text,created_at timestamptz);
 create table zain_cotizacion_aceptaciones(pedido_id uuid,revision int,documento jsonb,aceptada_at timestamptz);
 create table zain_pagos(pedido_id uuid,importe bigint,created_at timestamptz);
 create table zain_cotizaciones(pedido_id uuid primary key,publicada jsonb);
 create function zain_crear_pedido(p_id uuid,p_token_hash text,p_items jsonb,p_archivos jsonb,p_total integer,p_bytes bigint,p_capacity bigint,p_client text) returns jsonb language plpgsql as $$begin insert into public.zain_pedidos(id,folio,token_hash,items,archivos,total) values(p_id,'ZAIN-FICTICIO',p_token_hash,p_items,p_archivos,p_total);return jsonb_build_object('folio','ZAIN-FICTICIO');end;$$;`);
 await db.exec(await readFile(new URL('../supabase/whatsapp-manual.sql',import.meta.url),'utf8'));
 await db.exec(await readFile(new URL('../supabase/whatsapp-adjuntos.sql',import.meta.url),'utf8'));
 await db.exec('create table zain_cotizaciones_modelos(id uuid primary key,version integer,estado text)');
 await db.query('insert into auth.users values($1,$2)',[uid,'equipo@example.test']);await db.query('insert into zain_equipo values($1,true)',[uid]);await db.query("insert into zain_accesos values('equipo@example.test',true,'Equipo ficticio')");
});
after(async()=>await db?.close());
const op=async(modo,datos={},actor=null)=>(await db.query('select zain_wa_operar($1,$2,$3) as v',[modo,JSON.stringify(datos),actor])).rows[0].v;
const sqlTest=(n,fn)=>test(n,{skip:modulo?false:'Configura ZAIN_PGLITE_MODULE para probar SQL/RLS.'},async()=>{await db.exec('begin');try{await fn();}finally{await db.exec('rollback');}});
const recibir=async(x={})=>op('recibir',validarEntrante(recibido(x),fail));
const conectar=async()=>op('estado',{ejecutor:runner,estado:'conectado',numero:'15555550999'});
const encolar=async(chat,id=randomUUID(),texto='Respuesta manual de prueba')=>op('encolar',{id,chat_id:chat,texto,autor_email:'equipo@example.test',mensaje_wa_id:'3EB0'+createHash('sha256').update(id).digest('hex').slice(0,28).toUpperCase()},uid);
test('secreto constante, vacío/incorrecto denegados; recepción solo directa reciente',()=>{
 assert.ok(secretoValido(secreto,secreto));assert.equal(secretoValido('x',secreto),false);assert.equal(secretoValido('',''),false);
 assert.ok(validarEntrante(recibido(),fail));assert.equal(validarEntrante(recibido({jid:'123456789@lid'}),fail).telefono,null);
 for(const x of [{jid:'12345@g.us'},{jid:'status@broadcast'},{fecha:'2000-01-01'},{direccion:'saliente'},{media_path:'ajeno/archivo'}])assert.throws(()=>validarEntrante(recibido(x),fail),{status:400});
 assert.match(rutaMedia('15555550101@s.whatsapp.net','FICTICIO1','image/png'),/^[a-f0-9]{64}\/[a-f0-9]{64}\.png$/);
});
sqlTest('SQL: entrante idempotente; celular visible y deduplicado; no cola automática',async()=>{
 const a=await recibir();assert.equal(a.nuevo,true);assert.equal((await db.query('select ultimo_mensaje from zain_wa_chats')).rows[0].ultimo_mensaje,'Hola de prueba');assert.equal((await recibir()).nuevo,false);
 await recibir({wa_id:'CELULAR',direccion:'persona-desde-cel',texto:'Desde celular'});
 const c=(await db.query('select * from zain_wa_chats')).rows[0];assert.equal(c.entrantes,1);assert.equal(c.no_leidos,1);
 assert.equal((await db.query('select count(*)::int as n from zain_wa_mensajes')).rows[0].n,2);
 assert.equal((await db.query('select count(*)::int as n from zain_wa_salida')).rows[0].n,0);
});
sqlTest('SQL: leído por secuencia no pierde mensajes concurrentes ni duplica lecturas',async()=>{
 const c=(await recibir()).id;const hasta=(await db.query('select max(secuencia) as n from zain_wa_mensajes')).rows[0].n;
 await recibir({wa_id:'NUEVO'});await op('leido',{chat_id:c,hasta},uid);await op('leido',{chat_id:c,hasta},uid);
 assert.equal((await db.query('select no_leidos from zain_wa_chats')).rows[0].no_leidos,1);
});
sqlTest('SQL: no iniciar chats ni falsificar actor; reintento manual idempotente',async()=>{
 const c=(await recibir({direccion:'persona-desde-cel'})).id;assert.ok((await encolar(c)).error);
 await recibir({wa_id:'ENTRANTE'});const id=randomUUID(),a=await encolar(c,id);assert.equal(a.estado,'pendiente');assert.equal((await encolar(c,id)).id,id);
 assert.ok((await encolar(c,id,'Otros datos')).error);
 await assert.rejects(op('encolar',{id:randomUUID(),chat_id:c,texto:'Hola'},randomUUID()),/Equipo no autorizado/);
});
sqlTest('SQL: reserva exclusiva, doble puente rechazado y acuse no duplica mensaje',async()=>{
 const c=(await recibir()).id;await conectar();assert.ok((await op('estado',{ejecutor:randomUUID(),estado:'conectado'})).error);
 await encolar(c);const job=await op('tomar',{ejecutor:runner});assert.ok(job.lease);assert.equal(job.autor_email,undefined);assert.equal(await op('tomar',{ejecutor:runner}),null);
 assert.ok((await op('iniciar',{...job,ejecutor:runner,lease:randomUUID()})).error);
 assert.equal((await op('iniciar',{...job,ejecutor:runner})).ok,true);
 for(let i=0;i<2;i++)await op('terminar',{...job,ejecutor:runner,estado:'enviada',wa_id:job.mensaje_wa_id});
 assert.equal((await db.query("select count(*)::int as n from zain_wa_mensajes where direccion='saliente'")).rows[0].n,1);
});
sqlTest('SQL: caída después de iniciar se vuelve incierta y no se reenvía',async()=>{
 const c=(await recibir()).id;await conectar();await encolar(c);const job=await op('tomar',{ejecutor:runner});await op('iniciar',{...job,ejecutor:runner});
 await db.query("update zain_wa_salida set lease_hasta=now()-interval '1 second' where id=$1",[job.id]);
 assert.equal(await op('tomar',{ejecutor:runner}),null);assert.equal((await db.query('select estado from zain_wa_salida')).rows[0].estado,'incierto');
});
sqlTest('SQL: reservas sin iniciar se recuperan; vencidos y autor revocado no salen',async()=>{
 const c=(await recibir()).id;await conectar();await encolar(c);const a=await op('tomar',{ejecutor:runner});await db.query("update zain_wa_salida set lease_hasta=now()-interval '1 second'");
 const b=await op('tomar',{ejecutor:runner});assert.equal(a.id,b.id);assert.notEqual(a.lease,b.lease);
 await db.exec("update zain_accesos set activo=false");assert.ok((await op('iniciar',{...b,ejecutor:runner})).error);
 assert.equal((await db.query('select estado from zain_wa_salida')).rows[0].estado,'error');
});
sqlTest('SQL: desvincular impide salida y elimina QR sin borrar historial',async()=>{
 const c=(await recibir()).id;await conectar();await encolar(c);await op('desvincular',{},uid);assert.equal(await op('tomar',{ejecutor:runner}),null);
 await op('desvinculado',{ejecutor:runner});assert.equal((await db.query('select estado from zain_wa_salida')).rows[0].estado,'error');
 assert.equal((await db.query('select count(*)::int as n from zain_wa_mensajes')).rows[0].n,1);
 await assert.rejects(db.exec('update zain_wa_estado set bot_automatico=true'),/check constraint/);
});
sqlTest('SQL: crear pedido validado, enlazar e historial; motivos agregados en embudo',async()=>{
 const c=(await recibir()).id,id=randomUUID();const p={chat_id:c,id,token_hash:'a'.repeat(64),client:'fixture',items:[{sku:'FICTICIO',piezas:12}],total:12};
 const r=await op('crear_pedido',p,uid);assert.equal(r.pedido_id,id);assert.equal((await op('crear_pedido',{...p,id:randomUUID()},uid)).pedido_id,id);
 const pedido=(await db.query('select * from zain_pedidos')).rows[0];assert.equal(pedido.estado,'nuevo');assert.ok(pedido.guardado_at);assert.equal(pedido.cliente.telefono,'15555550101');
 const motivo={id:randomUUID(),pedido_id:id,motivo:'precio'};await op('motivo',motivo,uid);await op('motivo',motivo,uid);assert.ok((await op('motivo',{...motivo,motivo:'tiempo'},uid)).error);
 const hoy=new Date().toLocaleDateString('en-CA',{timeZone:'America/Mexico_City'});
 const resumen=(await db.query('select zain_embudo($1,$1) as v',[hoy])).rows[0].v;assert.equal(resumen.motivos_no_venta.precio,1);
});
sqlTest('RLS: anon y otro usuario sin lectura; staff sí; tampoco staff inserta cola directamente',async()=>{
 await recibir();await db.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({sub:randomUUID(),email:'otro@example.test'})]);await db.exec('set local role authenticated');
 for(const table of ['zain_wa_chats','zain_wa_mensajes','zain_wa_salida','zain_wa_estado','zain_wa_no_venta','zain_wa_config'])assert.equal((await db.query('select count(*)::int as n from '+table)).rows[0].n,0,table);
 await db.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({sub:uid,email:'equipo@example.test'})]);assert.equal((await db.query('select count(*)::int as n from zain_wa_chats')).rows[0].n,1);
 await db.exec('reset role');
 const p=(await db.query("select has_function_privilege('authenticated','zain_wa_operar(text,jsonb,uuid)','EXECUTE') as rpc,has_table_privilege('authenticated','zain_wa_salida','INSERT') as cola,has_table_privilege('anon','zain_wa_estado','SELECT') as qr")).rows[0];assert.deepEqual(p,{rpc:false,cola:false,qr:false});
 assert.equal((await db.query("select public from storage.buckets where id='zain-wa-media'")).rows[0].public,false);
});
function apiFixture(){
 const calls=[],archivos=new Map();
 const fetcher=async(url,o={})=>{
  const u=new URL(url),body=o.body?JSON.parse(o.body):{};calls.push({url,body});let d;
  if(u.pathname.startsWith('/storage/v1/object/authenticated/zain-wa-media/')){const data=archivos.get(u.pathname.split('/zain-wa-media/')[1]);return new Response(data||'',{status:data?200:404});}
  if(u.pathname==='/auth/v1/user')d={id:uid,email:'equipo@example.test',email_confirmed_at:'2026-10-22'};
  else if(url.includes('/zain_accesos?'))d=[{nombre:'Equipo'}];else if(url.includes('/zain_equipo?'))d=[{user_id:uid,nombre:'Equipo',activo:true}];
  else if(url.includes('/rpc/zain_wa_operar'))d=await op(body.p_modo,body.p_datos,body.p_actor);
  else if(url.includes('/zain_wa_estado?'))d=(await db.query('select * from zain_wa_estado')).rows;
  else if(url.includes('/zain_wa_chats?'))d=(await db.query('select * from zain_wa_chats where id=$1',[u.searchParams.get('id')?.slice(3)])).rows;
  else if(url.includes('/zain_wa_config?'))d=(await db.query('select * from zain_wa_config')).rows;
  else if(url.includes('/zain_wa_mensajes?'))d=[];
  else if(url.includes('/zain_push?'))d=[];
  else if(url.includes('/zain_wa_salida?')&&u.searchParams.has('id'))d=(await db.query('select * from zain_wa_salida where id=$1',[u.searchParams.get('id').slice(3)])).rows;
  else if(url.includes('/zain_cotizaciones_modelos?'))d=(await db.query('select * from zain_cotizaciones_modelos where id=$1',[u.searchParams.get('id').slice(3)])).rows;
  else if(url.includes('/zain_wa_salida?')&&!u.searchParams.has('cotizacion_revision'))d=(await db.query("select id,texto,adjunto,estado,error,created_at from zain_wa_salida where chat_id=$1 and estado<>'enviada'",[u.searchParams.get('chat_id')?.slice(3)])).rows;
  else if(url.includes('/zain_wa_salida?'))d=(await db.query("select estado,terminado_at from zain_wa_salida where chat_id=$1 and cotizacion_revision=$2 and estado in ('pendiente','preparando','enviando','enviada','incierto') order by created_at desc limit 1",[u.searchParams.get('chat_id')?.slice(3),Number(u.searchParams.get('cotizacion_revision')?.slice(3))])).rows;
  else if(url.includes('/zain_cotizaciones?'))d=(await db.query('select publicada from zain_cotizaciones where pedido_id=$1',[u.searchParams.get('pedido_id')?.slice(3)])).rows;
  else if(url.includes('/zain_pedidos?'))d=(await db.query('select * from zain_pedidos where id=$1',[u.searchParams.get('id')?.slice(3)])).rows;
  else if(url.includes('/storage/v1/object/sign/'))d={signedURL:u.pathname.replace('/storage/v1','')+'?token=ficticio'};
  else if(url.includes('/storage/v1/object/upload/sign/'))d={url:'/object/upload/sign/ficticio?token=ficticio'};
  else throw Error('Ruta inesperada en fixture: '+u.pathname);
  return Response.json(d);
 };
 const handler=createHandler({SUPABASE_URL:'https://fixture.supabase.co',SUPABASE_SECRET_KEY:'ficticio',SUPABASE_PUBLISHABLE_KEY:'ficticio',ZAIN_PEDIDOS_ENABLED:'true',ZAIN_WA_ENABLED:'true',ZAIN_WA_SECRETO:secreto,ZAIN_AVISOS_ENABLED:'true',ZAIN_SITE_URL:'https://zain.test'},fetcher);
 const call=(op,b,{staff=true,bridge=false,secret=secreto}={})=>handler(new Request('https://zain.test/api/pedidos?op='+op,{method:b?'POST':'GET',headers:{'Content-Type':'application/json',...(staff?{Authorization:'Bearer ficticio'}:{}),...(bridge?{'x-puente':secret}:{})},body:b?JSON.stringify(b):undefined}));
 return {call,calls,archivos};
}
sqlTest('API: secreto no da permisos de equipo; staff no puede simular entradas; QR privado',async()=>{
 const f=apiFixture();assert.equal((await f.call('wa-estado',null,{staff:false})).status,401);
 assert.equal((await f.call('wa-puente',{accion:'recibir',...recibido()},{bridge:true,secret:'mal'})).status,401);
 assert.equal((await f.call('wa-puente',{accion:'encolar'},{bridge:true})).status,404);
 assert.equal((await f.call('wa-enviar',{id:randomUUID(),chat_id:randomUUID(),texto:'Hola'},{staff:false,bridge:true})).status,401);
 assert.equal((await f.call('wa-puente',{accion:'recibir',...recibido()},{staff:false,bridge:true})).status,200);
 const pushAntes=f.calls.filter(x=>x.url.includes('/zain_push?')).length;assert.equal(pushAntes,1);await f.call('wa-puente',{accion:'recibir',...recibido()},{staff:false,bridge:true});assert.equal(f.calls.filter(x=>x.url.includes('/zain_push?')).length,pushAntes);
 const c=(await db.query('select id from zain_wa_chats')).rows[0].id;
 assert.equal((await f.call('wa-enviar',{id:randomUUID(),chat_id:c,texto:'Hola {fecha}'})).status,400);
 const r=await f.call('wa-enviar',{id:randomUUID(),chat_id:c,texto:'Respuesta humana'});assert.equal(r.status,200);
 assert.equal((await r.json()).salida.actor,uid);
 assert.equal((await f.call('wa-desvincular',{confirmar:false})).status,400);
});
sqlTest('API: medios firmados solo para mensaje exacto; creación pasa validación del catálogo',async()=>{
 const f=apiFixture();assert.equal((await f.call('wa-puente',{accion:'media',...recibido(),mime:'image/png',bytes:100},{bridge:true})).status,200);
 assert.equal((await f.call('wa-puente',{accion:'recibir',...recibido({media_path:'otro/archivo',mime:'image/png'})},{bridge:true})).status,400);
 const c=(await recibir()).id;
 assert.equal((await f.call('wa-crear-pedido',{chat_id:c,id:randomUUID(),sku:'INEXISTENTE'})).status,400);
 const p=C.productos.find(p=>p.id==='bolsa-expo');const creado=await f.call('wa-crear-pedido',{chat_id:c,id:randomUUID(),sku:p.sku,color_id:p.colores[0],tecnica:p.tecnicas[0],zona:p.zonas[0].id,piezas:100});assert.equal(creado.status,200,JSON.stringify(await creado.clone().json()));
});

sqlTest('Storage: política histórica permisiva no abre archivos de WhatsApp',async()=>{
 for(const role of ['anon','authenticated']){await db.exec('set local role '+role);assert.deepEqual((await db.query('select bucket_id from storage.objects')).rows,[{bucket_id:'otro-bucket'}]);await db.exec('savepoint denegado');await assert.rejects(db.query("insert into storage.objects(bucket_id) values('zain-wa-media')"),/row-level security/);await db.exec('rollback to savepoint denegado;reset role');}
});

sqlTest('SQL: una decisión humana vencida no se manda',async()=>{const c=(await recibir()).id;await conectar();await encolar(c);await db.exec("update zain_wa_salida set vence_at=now()-interval '1 second'");assert.equal(await op('tomar',{ejecutor:runner}),null);assert.equal((await db.query('select estado from zain_wa_salida')).rows[0].estado,'error');});

sqlTest('API: cotización sin enviar prepara enlace; seguimiento requiere envío confirmado y 48h sin respuesta',async()=>{
 const f=apiFixture(),c=(await recibir()).id,pedidoId=randomUUID();await op('crear_pedido',{chat_id:c,id:pedidoId,token_hash:'a'.repeat(64),client:'fixture',items:[{sku:'FICTICIO',piezas:12}],total:12},uid);
 await db.query('insert into zain_cotizaciones values($1,$2)',[pedidoId,JSON.stringify({revision:1})]);
 const hilo=async()=>{const r=await f.call('wa-hilo&id='+c);assert.equal(r.status,200);return r.json();};
 let d=await hilo();assert.equal(d.cotizacion.revision,1);assert.match(d.cotizacion.texto,/https:\/\/zain.test\/mi-pedido#/);assert.equal(d.seguimiento,false);assert.equal((await db.query('select count(*)::int as n from zain_wa_salida')).rows[0].n,0);
 const salida=await encolar(c);await db.query("update zain_wa_salida set cotizacion_revision=1,estado='enviada',terminado_at=now()-interval '49 hours' where id=$1",[salida.id]);await db.exec("update zain_wa_chats set ultimo_entrante=now()-interval '50 hours'");
 d=await hilo();assert.equal(d.cotizacion,null);assert.equal(d.seguimiento,true);
 await db.exec('update zain_wa_chats set ultimo_entrante=now()');assert.equal((await hilo()).seguimiento,false);
 await db.exec("update zain_cotizaciones set publicada='{\"revision\":2}'");assert.equal((await hilo()).cotizacion.revision,2);
 assert.equal((await f.call('wa-enviar',{id:randomUUID(),chat_id:c,texto:'Enlace anterior',cotizacion_revision:1})).status,409);
});

const pdfFicticio=Buffer.from('%PDF-1.4\nPDF SINTETICO\n%%EOF\n');
const archivoFicticio=(cambios={})=>({nombre:'Cotizacion-FICTICIA.pdf',mime:'application/pdf',bytes:pdfFicticio.length,hash:createHash('sha256').update(pdfFicticio).digest('hex'),...cambios});
sqlTest('API y SQL: adjunto privado sin texto, cola humana idempotente y acuse conserva el archivo',async()=>{
 const f=apiFixture(),chat=(await recibir()).id,id=randomUUID();
 const r=await f.call('wa-adjunto-subida',{id,chat_id:chat,adjunto:archivoFicticio()});assert.equal(r.status,200);const {adjunto}=await r.json();
 assert.equal((await db.query('select count(*)::int as n from zain_wa_salida')).rows[0].n,0);
 f.archivos.set(adjunto.ruta,pdfFicticio);const datos={id,chat_id:chat,texto:'',adjunto};
 for(let i=0;i<2;i++)assert.equal((await f.call('wa-enviar',datos)).status,200);
 assert.equal((await db.query('select count(*)::int as n from zain_wa_salida')).rows[0].n,1);
 assert.equal((await f.call('wa-enviar',{...datos,adjunto:{...adjunto,nombre:'Otra.pdf'}})).status,409);
 await conectar();const job=await op('tomar',{ejecutor:runner});assert.equal(job.adjunto.ruta,adjunto.ruta);
 const puente=(accion,extra={})=>f.call('wa-puente',{accion,ejecutor:runner,id,lease:job.lease,...extra},{bridge:true,staff:false});
 assert.equal((await puente('adjunto',{lease:randomUUID()})).status,409);assert.equal((await puente('adjunto')).status,200);
 await op('iniciar',{...job,ejecutor:runner});await recibir({wa_id:job.mensaje_wa_id,direccion:'persona-desde-cel',tipo:'documento',texto:''});await op('terminar',{...job,ejecutor:runner,estado:'enviada',wa_id:job.mensaje_wa_id});
 const m=(await db.query("select tipo,media_path,mime,texto from zain_wa_mensajes where direccion='saliente'")).rows[0];assert.deepEqual(m,{tipo:'documento',media_path:adjunto.ruta,mime:'application/pdf',texto:''});
});
sqlTest('API: adjuntos requieren usuario, chat entrante, tamaño/tipo y pertenencia al envío',async()=>{
 const f=apiFixture(),chat=(await recibir()).id,id=randomUUID(),datos={id,chat_id:chat,adjunto:archivoFicticio()};
 assert.equal((await f.call('wa-adjunto-subida',datos,{staff:false})).status,401);
 for(const cambio of [{bytes:8388609},{mime:'text/html'},{nombre:'../archivo.pdf'},{hash:'inventado'}])assert.equal((await f.call('wa-adjunto-subida',{...datos,adjunto:archivoFicticio(cambio)})).status,400);
 const {adjunto}=await (await f.call('wa-adjunto-subida',datos)).json();
 assert.equal((await f.call('wa-enviar',{...datos,texto:'PDF',adjunto})).status,409,'No encolar sin subida terminada');
 assert.equal((await f.call('wa-enviar',{...datos,texto:'PDF',adjunto:{...adjunto,ruta:'salida/otra-cuenta/archivo.pdf'}})).status,400);
 f.archivos.set(adjunto.ruta,Buffer.alloc(pdfFicticio.length));assert.equal((await f.call('wa-enviar',{...datos,texto:'PDF',adjunto})).status,409,'Contenido/hash incorrecto');
 assert.equal((await db.query('select count(*)::int as n from zain_wa_salida')).rows[0].n,0);
});
sqlTest('API: una cotización actualizada después de elegirla requiere preparar su PDF otra vez',async()=>{
 const f=apiFixture(),chat=(await recibir()).id,id=randomUUID(),modelo=randomUUID();await db.query("insert into zain_cotizaciones_modelos values($1,1,'enviada')",[modelo]);
 const datos={id,chat_id:chat,adjunto:archivoFicticio({origen:{tipo:'modelo',id:modelo,version:1}})};
 const r=await f.call('wa-adjunto-subida',datos);assert.equal(r.status,200);const {adjunto}=await r.json();f.archivos.set(adjunto.ruta,pdfFicticio);
 await db.query('update zain_cotizaciones_modelos set version=2 where id=$1',[modelo]);
 assert.equal((await f.call('wa-enviar',{id,chat_id:chat,texto:'Cotización',adjunto})).status,409);
 assert.equal((await db.query('select count(*)::int as n from zain_wa_salida')).rows[0].n,0);
});
sqlTest('SQL: un adjunto no puede usar la carpeta de otro autor y el fallo previo no es un envío incierto',async()=>{
 const chat=(await recibir()).id,id=randomUUID(),a={...archivoFicticio(),ruta:'salida/'+randomUUID()+'/'+id+'-'+archivoFicticio().hash+'.pdf',tipo:'documento'};
 const datos={id,chat_id:chat,texto:'',adjunto:a,autor_email:'equipo@example.test',mensaje_wa_id:'3EB0'+createHash('sha256').update(id).digest('hex').slice(0,28).toUpperCase()};
 assert.ok((await op('encolar',datos,uid)).error);a.ruta='salida/'+uid+'/'+id+'-'+a.hash+'.pdf';await op('encolar',datos,uid);await conectar();const job=await op('tomar',{ejecutor:runner});await op('terminar',{...job,ejecutor:runner,estado:'error'});assert.equal((await db.query('select estado from zain_wa_salida')).rows[0].estado,'error');
});
