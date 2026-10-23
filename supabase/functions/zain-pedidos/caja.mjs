// Caja ZAIN: saldos en vivo, transferencias entre socios y caja, reparto pagado y quién recibió cada cobro.
// Solo equipo autorizado. Los saldos se calculan en la base (zain_caja_resumen) con los mismos movimientos.
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const MAX=100000000000,PERSONAS=['juan_pablo','garcia','zain'];
const hoy=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Mexico_City'});
const fechaValida=f=>typeof f==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(f)&&new Date(f+'T12:00Z').toISOString().slice(0,10)===f&&f>='2000-01-01'&&f<=hoy();
export function validarCaja(b,fail){
 if(!UUID.test(b?.request||'')||!['transferencia','reparto'].includes(b.tipo))fail(400,'Elige transferencia o reparto.');
 if(!PERSONAS.includes(b.origen)||!PERSONAS.includes(b.destino)||b.origen===b.destino||![b.origen,b.destino].includes('zain'))fail(400,'Una transferencia va entre un socio y la Caja ZAIN.');
 if(b.tipo==='reparto'&&b.origen!=='zain')fail(400,'El reparto sale de la Caja ZAIN hacia un socio.');
 if(!Number.isSafeInteger(b.importe)||b.importe<1||b.importe>MAX)fail(400,'Revisa el importe.');
 if(!fechaValida(b.fecha))fail(400,'Revisa la fecha (no puede ser futura).');
 const concepto=typeof b.concepto==='string'?b.concepto.replace(/[\x00-\x1f\x7f]/g,' ').trim():'';
 if(!concepto||concepto.length>180)fail(400,'Escribe un concepto de hasta 180 caracteres.');
 return {id:b.request,tipo:b.tipo,origen:b.origen,destino:b.destino,concepto,importe:b.importe,fecha:b.fecha};
}
export function createCaja({sb,fail}){
 const leer=async()=>({caja:await sb('/rest/v1/rpc/zain_caja_resumen',{method:'POST',body:'{}'})});
 return {leer,
  guardar:async(b,user)=>{
   const v=validarCaja(b,fail);
   // El id es la solicitud: reintentar la misma no duplica el movimiento.
   const prev=await sb('/rest/v1/zain_caja_movimientos?id=eq.'+v.id+'&select=id,importe,tipo,actor&limit=1');
   if(prev.length){if(prev[0].importe!==v.importe||prev[0].tipo!==v.tipo||prev[0].actor!==user.id)fail(409,'Esa solicitud ya se registró con otros datos.');}
   else await sb('/rest/v1/zain_caja_movimientos',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({...v,actor:user.id})});
   return leer();
  },
  anular:async(b,user)=>{
   if(!UUID.test(b?.id||'')||typeof b.motivo!=='string'||b.motivo.trim().length<5||b.motivo.length>500)fail(400,'Escribe un motivo de al menos cinco caracteres.');
   const m=await sb('/rest/v1/zain_caja_movimientos?id=eq.'+b.id+'&select=id,anulado_at&limit=1');if(!m.length)fail(404,'Movimiento no encontrado.');
   if(!m[0].anulado_at)await sb('/rest/v1/zain_caja_movimientos?id=eq.'+b.id+'&anulado_at=is.null',{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({anulado_at:new Date().toISOString(),anulado_por:user.id,motivo:b.motivo.trim()})});
   return leer();
  },
  receptor:async b=>{
   // Corrige quién recibió un cobro ya verificado; no cambia importe, revisión ni estado del pedido.
   if(!UUID.test(b?.id||'')||!PERSONAS.includes(b.recibio))fail(400,'Indica quién recibió el pago.');
   const p=await sb('/rest/v1/zain_pagos?id=eq.'+b.id+'&select=id&limit=1');if(!p.length)fail(404,'Pago no encontrado.');
   await sb('/rest/v1/zain_pagos?id=eq.'+b.id,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({recibio:b.recibio})});
   return leer();
  }};
}
