import {randomUUID} from 'node:crypto';
// Cotizaciones por modelo y talla guardadas por el equipo. Nunca se borran: «descartada» las archiva.
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const BUCKET='zain-cotizaciones-logos',MAX_JSON=300000,MAX_LOGO=15*1024*1024;
const TIPOS={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/svg+xml':'svg'};
// «convertida» solo la pone la conversión a pedido.
export const ESTADOS=['borrador','enviada','autorizada','convertida','descartada'];
const ESTADOS_MANUALES=ESTADOS.filter(estado=>estado!=='convertida');
const CAMPOS='id,folio,estado,cliente,desde,modelos,pedido_id,version,created_at,updated_at';
const objetoValido=(id,objeto)=>typeof objeto==='string'&&objeto.startsWith(id+'/')&&/^[a-f0-9-]{36}\/[a-f0-9-]{36}\.(png|jpg|webp|svg)$/.test(objeto);
export function validarCotizacion(b,fail){
 if(!b||typeof b!=='object'||Array.isArray(b)||!UUID.test(b.id||''))fail(400,'Cotización inválida.');
 if(!Number.isSafeInteger(b.version)||b.version<0)fail(400,'Actualiza la cotización antes de guardar.');
 const objeto=v=>v&&typeof v==='object'&&!Array.isArray(v);
 if(!objeto(b.datos)||JSON.stringify(b.datos).length>MAX_JSON)fail(400,'La cotización es demasiado grande o está incompleta.');
 if(b.comercial!=null&&(!objeto(b.comercial)||JSON.stringify(b.comercial).length>MAX_JSON))fail(400,'Revisa los precios de la cotización.');
 if(b.desde!=null&&(!Number.isSafeInteger(b.desde)||b.desde<0))fail(400,'Revisa los precios de la cotización.');
 if(!Number.isSafeInteger(b.modelos)||b.modelos<0||b.modelos>20)fail(400,'La cotización admite hasta 20 modelos.');
 if(b.estado!=null&&!ESTADOS_MANUALES.includes(b.estado))fail(400,'Estado inválido: usa Convertir en pedido para marcarla convertida.');
 let logo=null;
 if(b.logo!=null){
  if(!objeto(b.logo)||!objetoValido(b.id,b.logo.objeto)||!TIPOS[b.logo.mime]||typeof b.logo.nombre!=='string'||b.logo.nombre.length>200)fail(400,'Vuelve a subir el logo.');
  logo={objeto:b.logo.objeto,mime:b.logo.mime,nombre:b.logo.nombre.replace(/[\u0000-\u001f\u007f]/g,'').trim()||'logo.'+TIPOS[b.logo.mime]};
 }
 const cliente=typeof b.cliente==='string'?b.cliente.replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,180):'';
 return {cliente,datos:b.datos,comercial:b.comercial??null,desde:b.desde??null,modelos:b.modelos,logo,...(b.estado?{estado:b.estado}:{})};
}
export function createCotizacionesModelos({sb,fail,storageURL,row}){
 const fila=async id=>{if(!UUID.test(id||''))fail(400,'Cotización inválida.');const r=await sb('/rest/v1/zain_cotizaciones_modelos?id=eq.'+id+'&select=*&limit=1');if(!r[0])fail(404,'Cotización no encontrada.');return r[0];};
 const logoSubido=async(id,objeto)=>{
  const lista=await sb('/storage/v1/object/list/'+BUCKET,{method:'POST',body:JSON.stringify({prefix:id,limit:100,offset:0})});
  if(!lista.some(s=>s.name===objeto.split('/')[1]))fail(409,'El logo todavía no termina de subir. Intenta guardar de nuevo.');
 };
 const actualizar=async(id,version,cambios,user)=>{
  const out=await sb('/rest/v1/zain_cotizaciones_modelos?id=eq.'+id+'&version=eq.'+version+'&estado=neq.convertida',{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({...cambios,version:version+1,actor:user.id,updated_at:new Date().toISOString()})});
  if(!out?.length){const x=await fila(id);fail(409,x.estado==='convertida'?'Esta cotización ya es un pedido; edita la cotización desde Pedidos.':'Tu compañero cambió esta cotización. Ábrela de nuevo antes de guardar.');}
  return out[0];
 };
 return {
  lista:async()=>({cotizaciones:await sb('/rest/v1/zain_cotizaciones_modelos?select='+CAMPOS+'&order=updated_at.desc&limit=300')}),
  leer:async id=>{
   const x=await fila(id);let logoUrl=null;
   if(x.logo?.objeto){const d=await sb('/storage/v1/object/sign/'+BUCKET+'/'+x.logo.objeto,{method:'POST',body:JSON.stringify({expiresIn:300})});logoUrl=storageURL(d.signedURL||d.signedUrl).href;}
   return {cotizacion:{...x,logoUrl}};
  },
  guardar:async(b,user)=>{
   const v=validarCotizacion(b,fail);
   if(b.version===0){
    if(v.logo)await logoSubido(b.id,v.logo.objeto);
    const out=await sb('/rest/v1/zain_cotizaciones_modelos?on_conflict=id',{method:'POST',headers:{Prefer:'return=representation,resolution=ignore-duplicates'},body:JSON.stringify({id:b.id,...v,creado_por:user.id,actor:user.id})});
    if(out?.length)return {cotizacion:out[0]};
    // Reintento del mismo guardado (p. ej. se cortó la red): devolver lo ya creado.
    const x=await fila(b.id);if(x.version!==1||x.creado_por!==user.id||JSON.stringify(x.datos)!==JSON.stringify(v.datos))fail(409,'Esta cotización ya existe. Ábrela de nuevo antes de guardar.');return {cotizacion:x};
   }
   const old=await fila(b.id);if(v.logo&&old.logo?.objeto!==v.logo.objeto)await logoSubido(b.id,v.logo.objeto);
   return {cotizacion:await actualizar(b.id,b.version,v,user)};
  },
  estado:async(b,user)=>{
   if(!UUID.test(b?.id||'')||!Number.isSafeInteger(b.version)||b.version<1||!ESTADOS_MANUALES.includes(b.estado))fail(400,'Revisa el estado de la cotización; convertida requiere un pedido.');
   return {cotizacion:await actualizar(b.id,b.version,{estado:b.estado},user)};
  },
  // El pedido ya se creó con el flujo normal de solicitudes; aquí solo se liga y se cierra la cotización.
  convertir:async(b,user)=>{
   if(!UUID.test(b?.id||'')||!Number.isSafeInteger(b.version)||b.version<1||!UUID.test(b.pedido_id||''))fail(400,'Revisa la cotización y el pedido.');
   const x=await row(b.pedido_id);if(!x.guardado_at||x.archivado_at)fail(409,'El pedido todavía no termina de guardarse.');
   return {cotizacion:await actualizar(b.id,b.version,{estado:'convertida',pedido_id:x.id},user),pedido:{id:x.id,folio:x.folio}};
  },
  logoSubida:async b=>{
   if(!UUID.test(b?.id||'')||!TIPOS[b.mime]||!Number.isSafeInteger(b.bytes)||b.bytes<1||b.bytes>MAX_LOGO)fail(400,'Sube un logo PNG, JPG, WEBP o SVG de hasta 15 MB.');
   const objeto=b.id+'/'+randomUUID()+'.'+TIPOS[b.mime],d=await sb('/storage/v1/object/upload/sign/'+BUCKET+'/'+objeto,{method:'POST',body:'{}'});
   return {objeto,url:storageURL(d.url).href};
  }
 };
}
