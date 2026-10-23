import {Buffer} from 'node:buffer';
import {createHash,timingSafeEqual,randomUUID} from 'node:crypto';
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const MIME={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','audio/ogg':'ogg','audio/mpeg':'mp3','audio/mp4':'m4a','audio/wav':'wav','application/pdf':'pdf','video/mp4':'mp4'};
const hash=s=>createHash('sha256').update(s).digest('hex');
export const rutaMedia=(jid,id,mime)=>MIME[mime]?hash(jid)+'/'+hash(id)+'.'+MIME[mime]:null;
export function secretoValido(recibido,secreto){
 if(typeof secreto!=='string'||secreto.length<32||typeof recibido!=='string')return false;
 return timingSafeEqual(Buffer.from(hash(recibido)),Buffer.from(hash(secreto)));
}
export function validarEntrante(b,fail,ahora=Date.now()){
 if(!b||typeof b.jid!=='string'||!/^\d{5,20}@(s\.whatsapp\.net|lid)$/.test(b.jid)||typeof b.wa_id!=='string'||!/^[A-Za-z0-9_-]{1,150}$/.test(b.wa_id))fail(400,'Mensaje inválido.');
 if(!['entrante','persona-desde-cel'].includes(b.direccion)||!['texto','imagen','audio','documento','video','sticker'].includes(b.tipo))fail(400,'Tipo de mensaje inválido.');
 const t=Date.parse(b.fecha);if(!Number.isFinite(t)||t<ahora-120000||t>ahora+60000)fail(400,'Mensaje fuera de la ventana de recepción.');
 const texto=typeof b.texto==='string'?b.texto.slice(0,4000):'',nombre=typeof b.nombre==='string'?b.nombre.replace(/[\x00-\x1f\x7f]/g,'').slice(0,120):'';
 const telefono=b.jid.endsWith('@s.whatsapp.net')?b.jid.split('@')[0]:null;
 if(b.media_path&&b.media_path!==rutaMedia(b.jid,b.wa_id,b.mime))fail(400,'Archivo ajeno al mensaje.');
 return {jid:b.jid,wa_id:b.wa_id,direccion:b.direccion,tipo:b.tipo,texto,nombre,telefono,fecha:new Date(t).toISOString(),...(b.media_path?{media_path:b.media_path,mime:b.mime}:{})};
}
export function createWhatsApp({sb,fail,row,storageURL,secreto,habilitado,receipt,crearDatos,catalogo,plantillas,base,serviceHeaders,fetcher=fetch}){
 const id=v=>{if(!UUID.test(v||''))fail(400,'Identificador inválido.');return v;};
 const operar=async(modo,datos,actor=null)=>{const r=await sb('/rest/v1/rpc/zain_wa_operar',{method:'POST',body:JSON.stringify({p_modo:modo,p_datos:datos,p_actor:actor})});if(r?.error)fail(409,r.error);return r;};
 const chat=async v=>{const x=await sb('/rest/v1/zain_wa_chats?id=eq.'+id(v)+'&select=*&limit=1');if(!x[0])fail(404,'Chat no encontrado.');return x[0];};

 const TIPOS_SALIDA={'application/pdf':'pdf','image/jpeg':'jpg','image/png':'png','image/webp':'webp','application/vnd.openxmlformats-officedocument.wordprocessingml.document':'docx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'xlsx'};
 const validarAdjunto=(a,actor,salida)=>{
  if(!a||typeof a!=='object'||Array.isArray(a)||!TIPOS_SALIDA[a.mime]||!Number.isSafeInteger(a.bytes)||a.bytes<12||a.bytes>8388608||typeof a.nombre!=='string'||a.nombre.length>160||!a.nombre.trim()||/[\x00-\x1f\x7f/\\]/.test(a.nombre)||!new RegExp('\\.'+(a.mime==='image/jpeg'?'jpe?g':TIPOS_SALIDA[a.mime])+'$','i').test(a.nombre)||!/^[a-f0-9]{64}$/.test(a.hash||''))fail(400,'Adjunta PDF, JPG, PNG, WEBP, Word o Excel de hasta 8 MB.');
  const ruta='salida/'+actor+'/'+salida+'-'+a.hash+'.'+TIPOS_SALIDA[a.mime];
  if(a.ruta!=null&&a.ruta!==ruta)fail(400,'El archivo no pertenece a este envío.');
  const origen=a.origen==null?null:a.origen;
  if(origen&&(!['modelo','pedido'].includes(origen.tipo)||!UUID.test(origen.id||'')||!Number.isSafeInteger(origen.version)||origen.version<1||a.mime!=='application/pdf'))fail(400,'Referencia de cotización inválida.');
  return {ruta,nombre:a.nombre.trim(),mime:a.mime,bytes:a.bytes,hash:a.hash,tipo:a.mime.startsWith('image/')?'imagen':'documento',...(origen?{origen:{tipo:origen.tipo,id:origen.id,version:origen.version}}:{})};
 };
 async function revisarOrigen(a,c){
  if(!a?.origen)return;
  const o=a.origen;
  if(o.tipo==='modelo'){
   const q=(await sb('/rest/v1/zain_cotizaciones_modelos?id=eq.'+o.id+'&select=version,estado&limit=1'))[0];
   if(!q||q.version!==o.version||!['enviada','autorizada'].includes(q.estado))fail(409,'La cotización cambió o no está lista para enviar. Prepárala otra vez.');
  }else{
   if(c.pedido_id!==o.id)fail(409,'La cotización no corresponde al pedido ligado a este chat.');
   const q=(await sb('/rest/v1/zain_cotizaciones?pedido_id=eq.'+o.id+'&select=publicada&limit=1'))[0]?.publicada;
   if(q?.revision!==o.version)fail(409,'La cotización cambió; prepara el PDF otra vez.');
  }
 }
 async function comprobarArchivo(a){
  const res=await fetcher(base+'/storage/v1/object/authenticated/zain-wa-media/'+a.ruta,{headers:serviceHeaders,signal:AbortSignal.timeout(30000)});
  if(!res.ok||!res.body)fail(409,'El archivo no terminó de subir. Intenta enviar otra vez.');
  const partes=[];let bytes=0;
  for await(const chunk of res.body){bytes+=chunk.length;if(bytes>8388608||bytes>a.bytes)fail(413,'El archivo supera el tamaño permitido.');partes.push(chunk);}
  const data=Buffer.concat(partes),hex=data.subarray(0,8).toString('hex');
  const valido=a.mime==='application/pdf'?data.subarray(0,5).toString()==='%PDF-':a.mime==='image/jpeg'?hex.startsWith('ffd8ff'):a.mime==='image/png'?hex==='89504e470d0a1a0a':a.mime==='image/webp'?data.subarray(0,4).toString()==='RIFF'&&data.subarray(8,12).toString()==='WEBP':hex.startsWith('504b0304');
  if(bytes!==a.bytes||createHash('sha256').update(data).digest('hex')!==a.hash||!valido)fail(409,'El contenido del archivo no coincide. Vuelve a seleccionarlo.');
 }
 async function puente(req,b){
  if(!habilitado||!secreto||secreto.length<32)fail(503,'Puente pendiente de configurar.');
  if(!secretoValido(req.headers.get('x-puente'),secreto))fail(401,'Puente no autorizado.');
  if(!b||typeof b!=='object'||Array.isArray(b))fail(400,'Solicitud inválida.');
  const ejec=()=>id(b.ejecutor);
  if(b.accion==='estado'){
   ejec();if(!['iniciando','esperando-qr','conectado','reconectando','desconectado','error'].includes(b.estado))fail(400,'Estado inválido.');
   if(b.qr&&(!/^data:image\/png;base64,[a-zA-Z0-9+/=]+$/.test(b.qr)||b.qr.length>39000))fail(400,'QR inválido.');
   if(b.estado==='esperando-qr'&&(!b.qr||!Number.isFinite(Date.parse(b.qr_expira))))fail(400,'QR incompleto.');
   if(b.numero&&!/^\d{8,15}$/.test(b.numero))fail(400,'Número inválido.');
   return operar('estado',{ejecutor:b.ejecutor,estado:b.estado,qr:b.qr||null,qr_expira:b.qr_expira||null,numero:b.numero||null});
  }
  if(['tomar','desvinculado'].includes(b.accion))return operar(b.accion,{ejecutor:ejec()});
  if(['iniciar','terminar'].includes(b.accion)){
   const datos={id:id(b.id),lease:id(b.lease),ejecutor:ejec()};
   if(b.accion==='terminar'){if(!['enviada','incierto','error'].includes(b.estado))fail(400,'Resultado inválido.');datos.estado=b.estado;datos.wa_id=typeof b.wa_id==='string'?b.wa_id.slice(0,150):null;}
   return operar(b.accion,datos);
  }
  if(b.accion==='adjunto'){
   const salida=(await sb('/rest/v1/zain_wa_salida?id=eq.'+id(b.id)+'&select=adjunto,lease,ejecutor,lease_hasta,estado&limit=1'))[0];
   if(!salida?.adjunto||salida.lease!==id(b.lease)||salida.ejecutor!==ejec()||salida.estado!=='preparando'||Date.parse(salida.lease_hasta)<Date.now())fail(409,'Reserva de archivo vencida.');
   const r=await sb('/storage/v1/object/sign/zain-wa-media/'+salida.adjunto.ruta,{method:'POST',body:JSON.stringify({expiresIn:120})});
   return {url:storageURL(r.signedURL||r.signedUrl).href};
  }
  if(b.accion==='recibir')return operar('recibir',validarEntrante(b,fail));
  if(b.accion==='media'){
   if(!Number.isSafeInteger(b.bytes)||b.bytes<1||b.bytes>8388608)fail(400,'Archivo de hasta 8 MB.');
   const v=validarEntrante({...b,direccion:'entrante',tipo:'imagen',texto:''},fail),ruta=rutaMedia(v.jid,v.wa_id,b.mime);
   if(!ruta)fail(415,'Archivo no admitido.');
   const r=await sb('/storage/v1/object/upload/sign/zain-wa-media/'+ruta,{method:'POST',body:'{}'});
   return {ruta,url:storageURL(r.url||r.signedURL).href};
  }
  fail(404,'Operación de puente desconocida.');
 }
 async function sugerencias(c){
  const guardadas=(await sb('/rest/v1/zain_wa_config?id=eq.1&select=plantillas&limit=1'))[0]?.plantillas||plantillas;
  if(!c.pedido_id)return {plantillas:guardadas};
  const p=await row(c.pedido_id);if(p.archivado_at||p.estado==='cancelado')return {plantillas:guardadas,pedido:{id:p.id,folio:p.folio,estado:p.estado}};
  const q=(await sb('/rest/v1/zain_cotizaciones?pedido_id=eq.'+p.id+'&select=publicada&limit=1'))[0]?.publicada;
  let cotizacion=null,seguimiento=false;
  if(q){
   const enviadas=await sb('/rest/v1/zain_wa_salida?chat_id=eq.'+c.id+'&cotizacion_revision=eq.'+q.revision+'&estado=in.(pendiente,preparando,enviando,enviada,incierto)&select=estado,terminado_at&order=created_at.desc&limit=1');
   if(!enviadas.length)cotizacion={revision:q.revision,texto:'Hola, tu cotización de ZAIN está lista: '+receipt(p).url};
   const envio=enviadas[0];seguimiento=envio?.estado==='enviada'&&Date.now()-Date.parse(envio.terminado_at)>=172800000&&(!c.ultimo_entrante||Date.parse(c.ultimo_entrante)<=Date.parse(envio.terminado_at));
  }
  return {plantillas:guardadas,pedido:{id:p.id,folio:p.folio,estado:p.estado},cotizacion,seguimiento};
 }
 async function equipo(op,b,user,url){
  if(b!==null&&(!b||typeof b!=='object'||Array.isArray(b)))fail(400,'Solicitud inválida.');
  if(op==='wa-estado'){
   if(!habilitado)return {habilitado:false,estado:'desconectado'};
   const e=(await sb('/rest/v1/zain_wa_estado?id=eq.1&select=estado,qr,qr_expira,numero,ultima_senal,desvincular&limit=1'))[0]||{};
   if(Date.now()-Date.parse(e.ultima_senal||0)>30000||Date.parse(e.qr_expira||0)<Date.now())e.qr=null;
   return {habilitado:true,...e,bot_automatico:false};
  }
  if(!habilitado)fail(503,'WhatsApp pendiente de habilitar.');
  if(op==='wa-chats'){
   const offset=Math.max(0,Math.min(100000,Number(url.searchParams.get('offset'))||0));
   const filas=await sb('/rest/v1/zain_wa_chats?select=*&order=no_leidos.desc,ultima_fecha.desc,id&limit=51&offset='+offset);
   return {chats:filas.slice(0,50),siguiente:filas.length>50};
  }
  if(op==='wa-hilo'){
   const c=await chat(url.searchParams.get('id')),offset=Math.max(0,Number(url.searchParams.get('offset'))||0);
   const mensajes=await sb('/rest/v1/zain_wa_mensajes?chat_id=eq.'+c.id+'&select=id,secuencia,wa_id,direccion,tipo,texto,media_path,mime,fecha&order=fecha.desc,id.desc&limit=51&offset='+offset);
   const salidas=await sb('/rest/v1/zain_wa_salida?chat_id=eq.'+c.id+'&estado=neq.enviada&select=id,texto,adjunto,estado,error,created_at&order=created_at.desc&limit=30');
   return {chat:c,mensajes:mensajes.slice(0,50).reverse(),anteriores:mensajes.length>50,salidas,...await sugerencias(c)};
  }
  if(op==='wa-archivo'){
   const m=(await sb('/rest/v1/zain_wa_mensajes?id=eq.'+id(b.id)+'&select=chat_id,media_path,mime&limit=1'))[0];if(!m?.media_path)fail(404,'Archivo no disponible.');
   const r=await sb('/storage/v1/object/sign/zain-wa-media/'+m.media_path,{method:'POST',body:JSON.stringify({expiresIn:120})});return {url:storageURL(r.signedURL||r.signedUrl).href,mime:m.mime};
  }
  if(op==='wa-adjunto-subida'){
   const c=await chat(b.chat_id);id(b.id);if(c.entrantes<1)fail(409,'Solo puedes responder a quien ya escribió.');
   const adjunto=validarAdjunto(b.adjunto,user.id,b.id);await revisarOrigen(adjunto,c);
   const r=await sb('/storage/v1/object/upload/sign/zain-wa-media/'+adjunto.ruta,{method:'POST',body:'{}'});
   return {adjunto,url:storageURL(r.url||r.signedURL).href};
  }
  if(op==='wa-enviar'){
   const c=await chat(b.chat_id);id(b.id);
   const adjunto=b.adjunto==null?null:validarAdjunto(b.adjunto,user.id,b.id);
   if(typeof b.texto!=='string'||(!b.texto.trim()&&!adjunto)||b.texto.length>4000||/\{[^}]+\}/.test(b.texto))fail(400,'Completa el mensaje y los campos de la plantilla antes de enviar.');
   if(adjunto){await revisarOrigen(adjunto,c);await comprobarArchivo(adjunto);}
   if(b.cotizacion_revision!=null){const q=(await sb('/rest/v1/zain_cotizaciones?pedido_id=eq.'+id(c.pedido_id)+'&select=publicada&limit=1'))[0]?.publicada;if(q?.revision!==b.cotizacion_revision||!b.texto.includes(receipt(await row(c.pedido_id)).url))fail(409,'La cotización cambió; prepara el enlace otra vez.');}
   return {salida:await operar('encolar',{id:b.id,chat_id:c.id,autor_email:user.email,texto:b.texto.trim(),...(adjunto?{adjunto}:{}),cotizacion_revision:b.cotizacion_revision??(adjunto?.origen?.tipo==='pedido'?adjunto.origen.version:null),mensaje_wa_id:'3EB0'+hash(b.id).slice(0,28).toUpperCase()},user.id)};
  }
  if(op==='wa-leido'){if(!Number.isSafeInteger(b.hasta)||b.hasta<0)fail(400,'Contador inválido.');return operar('leido',{chat_id:id(b.chat_id),hasta:b.hasta},user.id);}
  if(op==='wa-desvincular'){if(b.confirmar!==true)fail(400,'Confirma la desvinculación.');return operar('desvincular',{},user.id);}
  if(op==='wa-ligar')return operar('ligar',{chat_id:id(b.chat_id),pedido_id:id(b.pedido_id)},user.id);
  if(op==='wa-pedidos'){
   const c=await chat(url.searchParams.get('chat_id')),q=(url.searchParams.get('q')||'').trim();
   if(q&&!/^ZAIN-[A-Za-z0-9-]{1,50}$/i.test(q)&&!/^\+?[0-9]{8,15}$/.test(q))fail(400,'Busca un folio ZAIN o un teléfono completo con código de país.');
   const filtro=q?(/^\+?[0-9]{8,15}$/.test(q)?'cliente->>telefono=eq.'+encodeURIComponent(q.replace(/^\+/,'')):'folio=ilike.'+encodeURIComponent(q+'*')):c.telefono?'cliente->>telefono=eq.'+encodeURIComponent(c.telefono):null;
   if(!filtro)return {pedidos:[]};return {pedidos:await sb('/rest/v1/zain_pedidos?'+filtro+'&guardado_at=not.is.null&archivado_at=is.null&select=id,folio,estado&order=created_at.desc&limit=25')};
  }
  if(op==='wa-plantillas')return {plantillas:(await sb('/rest/v1/zain_wa_config?id=eq.1&select=plantillas&limit=1'))[0]?.plantillas||plantillas};
  if(op==='wa-plantillas-guardar'){if(!Array.isArray(b.plantillas)||b.plantillas.length!==5||new Set(b.plantillas.map(p=>p.id)).size!==5||b.plantillas.some(p=>!['amable','lo-pienso','precio','retroalimentacion','postventa'].includes(p.id)||typeof p.nombre!=='string'||p.nombre.length>80||typeof p.texto!=='string'||!p.texto.trim()||p.texto.length>1600))fail(400,'Revisa las cinco plantillas.');return operar('plantillas',{plantillas:b.plantillas.map(({id,nombre,texto})=>({id,nombre,texto}))},user.id);}
  if(op==='wa-catalogo')return {productos:await catalogo()};
  if(op==='wa-crear-pedido'){const c=await chat(b.chat_id);return operar('crear_pedido',{chat_id:c.id,...await crearDatos(b)},user.id);}
  if(op==='wa-motivo'){if(!['precio','tiempo','calidad','otro'].includes(b.motivo))fail(400,'Motivo inválido.');return operar('motivo',{id:id(b.id),pedido_id:id(b.pedido_id),motivo:b.motivo},user.id);}
  if(op==='wa-motivos'){
   const hoy=new Date().toLocaleDateString('en-CA',{timeZone:'America/Mexico_City'}),desde=new Date(hoy+'T12:00:00Z');desde.setUTCDate(desde.getUTCDate()-((desde.getUTCDay()+6)%7));
   return {desde:desde.toISOString().slice(0,10),hasta:hoy,motivos:await sb('/rest/v1/rpc/zain_wa_resumen_motivos',{method:'POST',body:JSON.stringify({p_desde:desde.toISOString().slice(0,10),p_hasta:hoy})})};
  }
  if(op==='wa-por-pedido')return {chats:await sb('/rest/v1/zain_wa_chats?pedido_id=eq.'+id(url.searchParams.get('id'))+'&select=id,nombre,no_leidos&limit=20')};
  fail(404,'Operación WhatsApp desconocida.');
 }
 return {puente,equipo};
}
