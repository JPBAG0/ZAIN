import {randomUUID,createHash} from 'node:crypto';
import {Buffer} from 'node:buffer';
// Movimientos generales del negocio (no ligados a un pedido) y dashboard anual. Solo equipo autorizado.
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const MAX=100000000000,BUCKET='zain-gastos-comprobantes';
export const CATEGORIAS={
 gasto:['Marketing y publicidad','Software y suscripciones','Muestras y material de prueba','Flete','Equipo y herramientas','Comisiones bancarias','Otros'],
 ingreso:['Venta sin pedido','Aportación de capital','Otros ingresos'],
 reembolso:['Reembolso']
};
const hoy=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Mexico_City'});
const fechaValida=f=>typeof f==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(f)&&Number.isFinite(Date.parse(f+'T12:00Z'))&&new Date(f+'T12:00Z').toISOString().slice(0,10)===f&&f>='2000-01-01'&&f<=hoy();
export function validarGeneral(b,fail){
 const entero=n=>Number.isSafeInteger(n)&&n>=0&&n<=MAX;
 if(!UUID.test(b?.request||'')||!CATEGORIAS[b.tipo])fail(400,'Elige si es gasto, ingreso o reembolso.');
 if(!CATEGORIAS[b.tipo].includes(b.categoria))fail(400,'Elige una categoría de la lista.');
 if(!['juan_pablo','garcia','zain','oficina_jp','oficina_garcia'].includes(b.persona)||(b.tipo==='reembolso'&&!['juan_pablo','garcia'].includes(b.persona)))fail(400,b.tipo==='reembolso'?'El reembolso es para quien adelantó dinero.':'Indica quién pagó o recibió el dinero.');
 if(typeof b.concepto!=='string'||!b.concepto.trim()||b.concepto.length>180)fail(400,'Escribe un concepto de hasta 180 caracteres.');
 if(!entero(b.importe)||b.importe<1)fail(400,'Revisa el importe.');
 const iva=b.iva_recuperable??0;if(!entero(iva)||iva>b.importe||(b.tipo!=='gasto'&&iva!==0))fail(400,'Revisa el impuesto recuperable.');
 if(!fechaValida(b.fecha))fail(400,'Revisa la fecha (no puede ser futura).');
 if(b.comprobante!=null&&!UUID.test(b.comprobante))fail(400,'Comprobante inválido.');
 if(b.tipo==='reembolso'&&b.verificado!==true)fail(400,'Confirma que ya entregaste o transferiste el reembolso.');
 return {id:b.request,tipo:b.tipo,categoria:b.categoria,persona:b.persona,concepto:b.concepto.replace(/[\x00-\x1f\x7f]/g,' ').trim(),importe:b.importe,iva_recuperable:iva,fecha:b.fecha,comprobante:b.comprobante||null};
}
export function createGenerales({sb,fail,base,serviceHeaders,fetcher}){
 const campos='id,tipo,categoria,persona,concepto,importe,iva_recuperable,fecha,comprobante,created_at,anulado_at,motivo,editado_at';
 const leer=async anio=>{
  if(!Number.isSafeInteger(anio)||anio<2020||anio>2100)fail(400,'Año inválido.');
  const [dashboard,movimientos]=await Promise.all([
   sb('/rest/v1/rpc/zain_finanzas_dashboard',{method:'POST',body:JSON.stringify({p_anio:anio})}),
   sb('/rest/v1/zain_movimientos_generales?fecha=gte.'+anio+'-01-01&fecha=lte.'+anio+'-12-31&select='+campos+'&order=fecha.desc,created_at.desc&limit=500')
  ]);
  return {anio,dashboard,movimientos,categorias:CATEGORIAS};
 };
 return {leer,
  guardar:async(b,user)=>{
   const v=validarGeneral(b,fail);
   if(v.comprobante){const a=await sb('/rest/v1/zain_general_archivos?id=eq.'+v.comprobante+'&actor=eq.'+user.id+'&select=id&limit=1');if(!a.length)fail(400,'Vuelve a adjuntar el comprobante.');}
   // El id es la solicitud: reintentar la misma no duplica el movimiento.
   const prev=await sb('/rest/v1/zain_movimientos_generales?id=eq.'+v.id+'&select=id,importe,tipo,actor&limit=1');
   if(prev.length){if(prev[0].importe!==v.importe||prev[0].tipo!==v.tipo||prev[0].actor!==user.id)fail(409,'Esa solicitud ya se registró con otros datos.');}
   else await sb('/rest/v1/zain_movimientos_generales',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({...v,actor:user.id})});
   return leer(Number(v.fecha.slice(0,4)));
  },
  editar:async(b,user)=>{
   // Corrige un movimiento vigente; la versión previa va al historial zain_general_ediciones.
   if(!UUID.test(b?.id||''))fail(400,'Movimiento inválido.');
   const m=(await sb('/rest/v1/zain_movimientos_generales?id=eq.'+b.id+'&select='+campos+',actor&limit=1'))[0];if(!m)fail(404,'Movimiento no encontrado.');if(m.anulado_at)fail(409,'Ese movimiento está anulado.');
   const v=validarGeneral({...b,request:b.id,tipo:m.tipo,...(m.tipo==='reembolso'?{verificado:true}:{})},fail);
   if(v.comprobante&&v.comprobante!==m.comprobante){const a=await sb('/rest/v1/zain_general_archivos?id=eq.'+v.comprobante+'&actor=eq.'+user.id+'&select=id&limit=1');if(!a.length)fail(400,'Vuelve a adjuntar el comprobante.');}
   // Edición atómica: guarda la versión previa en un historial de solo agregar y no pisa cambios concurrentes.
   const ok=await sb('/rest/v1/rpc/zain_general_editar',{method:'POST',body:JSON.stringify({p_id:b.id,p_editado_at:m.editado_at??null,p_datos:{categoria:v.categoria,persona:v.persona,concepto:v.concepto,importe:v.importe,iva_recuperable:v.iva_recuperable,fecha:v.fecha,comprobante:v.comprobante},p_actor:user.id})});
   if(ok!==true)fail(409,'Alguien cambió este movimiento. Actualiza antes de editar.');
   return leer(Number(v.fecha.slice(0,4)));
  },
  anular:async(b,user)=>{
   if(!UUID.test(b?.id||'')||typeof b.motivo!=='string'||b.motivo.trim().length<5||b.motivo.length>500)fail(400,'Escribe un motivo de al menos cinco caracteres.');
   const m=await sb('/rest/v1/zain_movimientos_generales?id=eq.'+b.id+'&select=id,fecha,anulado_at&limit=1');if(!m.length)fail(404,'Movimiento no encontrado.');
   if(!m[0].anulado_at)await sb('/rest/v1/zain_movimientos_generales?id=eq.'+b.id+'&anulado_at=is.null',{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({anulado_at:new Date().toISOString(),anulado_por:user.id,motivo:b.motivo.trim()})});
   return leer(Number(m[0].fecha.slice(0,4)));
  },
  subir:async(request,url,user)=>{
   const archivo=url.searchParams.get('archivo');if(!UUID.test(archivo||''))fail(400,'Falta la referencia del comprobante.');
   const type=request.headers.get('content-type'),tipos={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','application/pdf':'pdf'};if(!tipos[type])fail(400,'Usa JPG, PNG, WEBP o PDF de hasta 4 MB.');
   const chunks=[],reader=request.body?.getReader();if(!reader)fail(400,'Falta el comprobante.');let bytes=0;
   while(true){const r=await reader.read();if(r.done)break;bytes+=r.value.length;if(bytes>4194304){await reader.cancel();fail(413,'El comprobante puede pesar hasta 4 MB.');}chunks.push(r.value);}
   const data=Buffer.concat(chunks),hex=data.subarray(0,8).toString('hex');
   if(bytes<12||!(type==='image/jpeg'&&hex.startsWith('ffd8ff')||type==='image/png'&&hex==='89504e470d0a1a0a'||type==='application/pdf'&&data.subarray(0,5).toString()==='%PDF-'||type==='image/webp'&&data.subarray(0,4).toString()==='RIFF'&&data.subarray(8,12).toString()==='WEBP'))fail(400,'El formato del comprobante no coincide con el archivo.');
   const hash=createHash('sha256').update(data).digest('hex'),prev=await sb('/rest/v1/zain_general_archivos?id=eq.'+archivo+'&select=id,actor,hash,mime&limit=1');
   if(prev.length){if(prev[0].actor!==user.id||prev[0].hash!==hash||prev[0].mime!==type)fail(409,'La referencia del comprobante ya fue usada.');return {comprobante:archivo};}
   const objeto='generales/'+randomUUID()+'.'+tipos[type],res=await fetcher(base+'/storage/v1/object/'+BUCKET+'/'+objeto,{method:'POST',headers:{...serviceHeaders,'Content-Type':type,'x-upsert':'false'},body:data,signal:AbortSignal.timeout(30000)});
   if(!res.ok)fail(502,'No se pudo guardar el comprobante. Intenta de nuevo.');
   await sb('/rest/v1/zain_general_archivos',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({id:archivo,objeto,nombre:'Comprobante.'+tipos[type],mime:type,bytes,hash,actor:user.id})});
   return {comprobante:archivo};
  },
  archivo:async b=>{
   if(!UUID.test(b?.id||''))fail(400,'Movimiento inválido.');
   const m=await sb('/rest/v1/zain_movimientos_generales?id=eq.'+b.id+'&select=comprobante&limit=1');if(!m[0]?.comprobante)fail(404,'Este movimiento no tiene comprobante.');
   const a=await sb('/rest/v1/zain_general_archivos?id=eq.'+m[0].comprobante+'&select=objeto&limit=1');if(!a.length)fail(404,'Comprobante no disponible.');
   const r=await sb('/storage/v1/object/sign/'+BUCKET+'/'+a[0].objeto,{method:'POST',body:JSON.stringify({expiresIn:120})});const signed=r.signedURL||r.signedUrl;if(!signed)fail(502,'No se pudo abrir el comprobante.');
   const path=/^https:\/\//.test(signed)||signed.startsWith('/storage/v1/')?signed:'/storage/v1/'+signed.replace(/^\//,'');const u=new URL(path,base);if(u.origin!==new URL(base).origin)fail(502,'No se pudo preparar el comprobante.');return {url:u.href};
  }};
}
