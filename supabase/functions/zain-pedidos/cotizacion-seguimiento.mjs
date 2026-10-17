import {anticipoDe} from './cotizacion-pagos.mjs';
export function seguimientoDe(publicada,aceptacion,pagos=[]){
 if(!publicada)return null;
 const aceptada=aceptacion?.revision===publicada.revision?aceptacion:null;
 const recibido=pagos.filter(p=>p.revision===publicada.revision).reduce((n,p)=>n+Number(p.importe),0);
 return {revision:publicada.revision,aceptada_at:aceptada?.aceptada_at||null,total:publicada.total,anticipo:anticipoDe(publicada.total,publicada.pagos),recibido,saldo:publicada.total-recibido};
}
export function createSeguimiento({sb,fail,quote}){
 const leer=async id=>sb('/rest/v1/rpc/zain_seguimiento_cotizacion',{method:'POST',body:JSON.stringify({p_id:id})});
 return {leer,aceptar:async(x,b)=>{
  if(b.acepto!==true||!Number.isSafeInteger(b.revision)||b.revision<1)fail(400,'Marca la aceptación de esta cotización y sus condiciones.');
  if(x.estado==='cancelado')fail(409,'Este pedido está cancelado. Contacta a ZAIN.');
  const out=await sb('/rest/v1/rpc/zain_cotizacion_aceptar',{method:'POST',body:JSON.stringify({p_id:x.id,p_revision:b.revision})});
  if(!out)fail(409,'La cotización cambió, venció o ya no está disponible. Actualiza antes de aceptarla.');
  return {aceptada:true,seguimiento:await leer(x.id)};
 },aceptarEquipo:async(x,b,user)=>{
  // El cliente aceptó por WhatsApp, en persona o pagando: lo registra el equipo y queda atribuido en el historial.
  if(b.acepto!==true||!Number.isSafeInteger(b.revision)||b.revision<1)fail(400,'Confirma que el cliente aceptó esta cotización.');
  if(x.estado==='cancelado')fail(409,'Este pedido está cancelado.');
  const out=await sb('/rest/v1/rpc/zain_cotizacion_aceptar',{method:'POST',body:JSON.stringify({p_id:x.id,p_revision:b.revision})});
  if(!out)fail(409,'No se pudo registrar: la cotización cambió, venció o el pedido ya avanzó. Actualiza la ficha.');
  // Si la nota no se guarda, la aceptación ya quedó registrada: no reportarla como fallida.
  try{await sb('/rest/v1/zain_historial',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({pedido_id:x.id,actor:user.id,estado_anterior:'aceptado',estado_nuevo:'aceptado',notas:'Aceptación de la revisión '+b.revision+' registrada por el equipo (el cliente aceptó fuera de su enlace).'})});}catch{}
  return {aceptada:true,seguimiento:await leer(x.id)};
 },pago:async(x,b,user)=>{
  if(!Number.isSafeInteger(b.revision)||b.revision<1||!Number.isSafeInteger(b.importe)||b.importe<=0||b.importe>100000000000||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(b.request||'')||typeof b.referencia!=='string'||b.referencia.length>300||b.verificado!==true)fail(400,'Confirma el importe recibido y verificado.');
  const out=await sb('/rest/v1/rpc/zain_registrar_pago',{method:'POST',body:JSON.stringify({p_id:x.id,p_revision:b.revision,p_request:b.request,p_importe:b.importe,p_referencia:b.referencia.trim(),p_actor:user.id})});
  if(!out)fail(409,'No se registró el pago. Actualiza: requiere una revisión aceptada, términos definidos y un importe que no exceda el saldo.');
  return {...out,seguimiento:await leer(x.id)};
 }};
}
