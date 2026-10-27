import {CATEGORIAS} from './finanzas-generales.mjs';
// Caja ZAIN y oficinas: saldos en vivo, transferencias entre socios y cajas, reparto pagado y quién recibió cada cobro.
// Solo equipo autorizado. Los saldos se calculan en la base (zain_caja_resumen) con los mismos movimientos.
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const MAX=100000000000,CAJAS=['zain','oficina_jp','oficina_garcia'],PERSONAS=['juan_pablo','garcia',...CAJAS];
const hoy=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Mexico_City'});
const fechaValida=f=>typeof f==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(f)&&new Date(f+'T12:00Z').toISOString().slice(0,10)===f&&f>='2000-01-01'&&f<=hoy();
export function validarCaja(b,fail){
 if(!UUID.test(b?.request||'')||!['transferencia','reparto'].includes(b.tipo))fail(400,'Elige transferencia o reparto.');
 if(!PERSONAS.includes(b.origen)||!PERSONAS.includes(b.destino)||b.origen===b.destino||!(CAJAS.includes(b.origen)||CAJAS.includes(b.destino)))fail(400,'Una transferencia va entre dos cajas, o entre un socio y una caja.');
 if(b.tipo==='reparto'&&(b.origen!=='zain'||CAJAS.includes(b.destino)))fail(400,'El reparto sale de la Caja ZAIN hacia un socio.');
 if(!Number.isSafeInteger(b.importe)||b.importe<1||b.importe>MAX)fail(400,'Revisa el importe.');
 if(!fechaValida(b.fecha))fail(400,'Revisa la fecha (no puede ser futura).');
 const concepto=typeof b.concepto==='string'?b.concepto.replace(/[\x00-\x1f\x7f]/g,' ').trim():'';
 if(!concepto||concepto.length>180)fail(400,'Escribe un concepto de hasta 180 caracteres.');
 return {id:b.request,tipo:b.tipo,origen:b.origen,destino:b.destino,concepto,importe:b.importe,fecha:b.fecha};
}
const TIPOS=['cobro','gasto','ingreso','reembolso','transferencia','reparto'];
// Libro flexible: valida forma y listas; la base valida pedido, cierre, fechas y saldos en una transacción.
export function validarLibro(b,fail){
 if(!['guardar','borrar'].includes(b?.modo))fail(400,'Operación inválida.');
 if(b.id!=null&&(!UUID.test(b.id)||!['pago','pedido','general','caja'].includes(b.origen)))fail(400,'Movimiento inválido.');
 if(b.modo==='borrar'){if(b.id==null)fail(400,'Indica qué movimiento borras.');return {modo:'borrar',origen:b.origen,id:b.id,datos:{}};}
 const v=b.datos;if(!v||typeof v!=='object'||Array.isArray(v)||!TIPOS.includes(v.tipo))fail(400,'Elige el tipo de movimiento.');
 if(b.id==null&&!UUID.test(v.request||''))fail(400,'Actualiza la página antes de guardar.');
 if(!Number.isSafeInteger(v.importe)||v.importe<1||v.importe>MAX)fail(400,'Revisa el importe.');
 if(!fechaValida(v.fecha))fail(400,'Revisa la fecha (no puede ser futura).');
 if(v.pedido_id!=null&&!UUID.test(v.pedido_id))fail(400,'Elige el pedido de la lista.');
 if(v.comprobante!=null&&(!UUID.test(v.comprobante)||v.tipo!=='gasto'))fail(400,'Solo los gastos llevan comprobante.');
 // Partida opcional de un gasto de pedido; la base valida que exista en la revisión publicada.
 if('partida' in v&&v.partida!==null&&(v.tipo!=='gasto'||v.pedido_id==null||!Number.isSafeInteger(v.partida)||v.partida<0||v.partida>19))fail(400,'Elige una partida de la cotización.');
 const general=v.pedido_id==null&&['gasto','ingreso'].includes(v.tipo);
 if(general&&!CATEGORIAS[v.tipo].includes(v.categoria))fail(400,'Elige una categoría de la lista.');
 const concepto=typeof v.concepto==='string'?v.concepto.replace(/[\x00-\x1f\x7f]/g,' ').trim():'';
 if(v.tipo!=='cobro'&&(!concepto||concepto.length>180))fail(400,'Escribe un concepto de hasta 180 caracteres.');
 return {modo:'guardar',origen:b.id==null?null:b.origen,id:b.id??null,datos:{...v,concepto}};
}
export function createCaja({sb,fail}){
 const leer=async()=>({caja:await sb('/rest/v1/rpc/zain_caja_resumen',{method:'POST',body:'{}'}),categorias:CATEGORIAS});
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
  operar:async(b,user)=>{
   const v=validarLibro(b,fail);
   const r=await sb('/rest/v1/rpc/zain_libro_operar',{method:'POST',body:JSON.stringify({p_modo:v.modo,p_origen:v.origen,p_id:v.id,p_datos:v.datos,p_actor:user.id})});
   if(!r||r.error)fail(409,r?.error||'No se pudo guardar. Actualiza la página.');
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
