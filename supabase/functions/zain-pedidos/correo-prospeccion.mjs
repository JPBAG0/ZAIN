// Vigilante de la prospección por correo (28-oct-2026): Brevo avisa cada evento de las campañas
// y el equipo recibe un push al momento (clic, rebote, spam, baja) más un resumen 3 veces al día.
import {secretoValido} from './whatsapp.mjs';
const EVENTOS=new Set(['delivered','opened','unique_opened','click','soft_bounce','hard_bounce','spam','unsubscribe','invalid_email','blocked']);
const NOMBRE={unique_opened:'opened',invalid_email:'hard_bounce',blocked:'hard_bounce'};
const CORREO=/^[^\s@<>"']{1,64}@[a-z0-9.-]{1,190}\.[a-z]{2,24}$/i;
const limpio=(s,n)=>typeof s==='string'?s.replace(/[\x00-\x1f\x7f]/g,'').slice(0,n):'';
// Versión A/B según el nombre de la campaña («L1 jue-29 A con imagenes»).
export const version=campana=>(/\s([AB])\s/.exec(' '+campana+' ')||[])[1]||'';
// Medianoche de hoy en Guadalajara (UTC-6 todo el año desde 2022).
export function inicioDelDia(ahora=Date.now()){
 const dia=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Mexico_City'}).format(ahora);
 return new Date(dia+'T00:00:00-06:00').toISOString();
}
export function normalizar(e){
 const evento=NOMBRE[e?.event]||e?.event,email=String(e?.email||'').trim().toLowerCase();
 if(!EVENTOS.has(e?.event)||!CORREO.test(email))return null;
 const campana_id=Number.isSafeInteger(Number(e.camp_id))&&Number(e.camp_id)>0?Number(e.camp_id):0;
 const url=limpio(e.URL||e.url,500);
 // El clic en «date de baja» ya llega como evento unsubscribe; no cuenta como interés.
 if(evento==='click'&&/unsub|desuscri|baja/i.test(url))return null;
 const t=Number(e.ts_event)*1000,fecha=Number.isFinite(t)&&t>0?new Date(t).toISOString():new Date().toISOString();
 return {evento,email,campana_id,campana:limpio(e['campaign name']||e.campaign_name,160),url,fecha};
}
export function aviso(x){
 const v=version(x.campana),de=x.email+(v?' (versión '+v+')':'');
 if(x.evento==='click'){
  const wa=/wa\.me|whatsapp/i.test(x.url);
  return {title:wa?'🔥 Clic en «Cotizar por WhatsApp»':'🔥 Clic en el correo de prospección',body:de+(wa?' abrió el WhatsApp de ZAIN. Atiende su mensaje o escríbele.':' abrió un enlace del correo. Buen momento para escribirle.'),url:'/gestion-zain',tag:'correo-'+x.email};
 }
 if(x.evento==='hard_bounce')return {title:'Rebote de correo',body:de+' no existe o no recibe correos. Brevo ya no le volverá a enviar.',url:'/gestion-zain',tag:'correo-rebote'};
 if(x.evento==='spam')return {title:'⚠️ Queja de spam',body:de+' marcó el correo como spam. Si llegan 2 o más, conviene pausar los envíos.',url:'/gestion-zain',tag:'correo-spam'};
 if(x.evento==='unsubscribe')return {title:'Baja de correos',body:de+' pidió no recibir más correos. Brevo ya no le escribirá.',url:'/gestion-zain',tag:'correo-baja'};
 return null;
}
export function resumen(filas){
 if(!filas.length)return null;
 const unicos=(ev,v)=>new Set(filas.filter(f=>f.evento===ev&&(v==null||version(f.campana)===v)).map(f=>f.email)).size;
 const rebotes=unicos('hard_bounce')+unicos('soft_bounce'),entregados=unicos('delivered');
 const linea=v=>v+': '+unicos('opened',v)+' abrieron · '+unicos('click',v)+' clics';
 const partes=[entregados+' entregados',unicos('opened')+' abrieron',unicos('click')+' clics',rebotes+' rebotes'];
 if(unicos('spam'))partes.push(unicos('spam')+' spam');
 if(unicos('unsubscribe'))partes.push(unicos('unsubscribe')+' bajas');
 const versiones=['A','B'].filter(v=>filas.some(f=>version(f.campana)===v));
 return {title:'Prospección por correo · hoy',body:partes.join(' · ')+(versiones.length?'\n'+versiones.map(linea).join(' | '):''),url:'/gestion-zain',tag:'correo-resumen'};
}
export function createCorreo({sb,fail,avisos,secreto,habilitado}){
 // La clave va en un encabezado (x-zain-clave, o «Authorization: Bearer» desde Brevo); la URL (?k=) queda
 // solo de respaldo por si la pantalla de Brevo no ofrece autenticación.
 const autorizar=(url,headers)=>{
  if(!habilitado)fail(404,'No disponible.');
  const bearer=(/^Bearer\s+(\S+)$/i.exec(headers?.get('authorization')||'')||[])[1];
  if(!secretoValido(headers?.get('x-zain-clave')||bearer||url.searchParams.get('k')||'',secreto))fail(401,'No autorizado.');
 };
 return {
  // Brevo manda un evento por llamada (o una lista si se activa el envío por lotes).
  async evento(url,body,headers){
   autorizar(url,headers);
   const filas=(Array.isArray(body)?body:[body]).slice(0,200).map(normalizar).filter(Boolean);
   if(!filas.length)return {guardados:0,avisos:[]};
   // Un renglón por correo, campaña y evento: los repetidos (otro clic, otra apertura) se ignoran y no repiten aviso.
   const nuevos=await sb('/rest/v1/zain_correo_eventos?on_conflict=evento,email,campana_id',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=representation'},body:JSON.stringify(filas)})||[];
   return {guardados:nuevos.length,avisos:nuevos.map(aviso).filter(Boolean)};
  },
  async resumen(url,headers){
   autorizar(url,headers);
   const filas=await sb('/rest/v1/zain_correo_eventos?recibido=gte.'+encodeURIComponent(inicioDelDia())+'&select=evento,email,campana&limit=10000')||[];
   const r=resumen(filas);
   return {aviso:r,enviados:r?await avisos.enviar(r):0};
  }
 };
}
