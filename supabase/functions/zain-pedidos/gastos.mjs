import {randomUUID,createHash} from 'node:crypto';
import {Buffer} from 'node:buffer';
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const MAX=100000000000,BUCKET='zain-gastos-comprobantes';
const entero=n=>Number.isSafeInteger(n)&&n>=0&&n<=MAX;
export function validarMovimiento(b,fail){
 if(!['gasto','reembolso','editar','anular','cerrar','reabrir','reparto'].includes(b.modo)||!UUID.test(b.request||'')||!Number.isSafeInteger(b.version)||b.version<0)fail(400,'Actualiza el pedido antes de guardar.');
 const v=b.datos;if(!v||typeof v!=='object'||Array.isArray(v))fail(400,'Faltan los datos del movimiento.');
 if(['gasto','reembolso','editar'].includes(b.modo)){
  if(b.modo==='editar'&&!UUID.test(v.movimiento||''))fail(400,'Indica qué gasto corriges.');
  if(!['juan_pablo','garcia','zain','oficina_jp','oficina_garcia'].includes(v.persona)||!['base','extra'].includes(v.grupo)||!entero(v.importe)||v.importe<1||!entero(v.iva_recuperable)||v.iva_recuperable>v.importe||typeof v.concepto!=='string'||!v.concepto.trim()||v.concepto.length>180||!/^\d{4}-\d{2}-\d{2}$/.test(v.fecha||'')||!Number.isFinite(Date.parse(v.fecha+'T12:00Z'))||new Date(v.fecha+'T12:00Z').toISOString().slice(0,10)!==v.fecha||v.fecha<'2000-01-01'||v.fecha>new Date().toLocaleDateString('en-CA',{timeZone:'America/Mexico_City'})||(v.comprobante!=null&&!UUID.test(v.comprobante)))fail(400,'Revisa concepto, importe, fecha y quién pagó.');
  if(b.modo==='reembolso'&&(!['juan_pablo','garcia'].includes(v.persona)||v.iva_recuperable!==0||v.verificado!==true))fail(400,'El reembolso es para quien adelantó dinero.');
  // Partida opcional de la revisión publicada (costo real contra cotizado); la base valida que exista.
  if('partida' in v&&b.modo!=='reembolso'&&v.partida!==null&&(!Number.isSafeInteger(v.partida)||v.partida<0||v.partida>19))fail(400,'Elige una partida de la cotización.');
  return {persona:v.persona,grupo:v.grupo,concepto:v.concepto.trim(),importe:v.importe,iva_recuperable:v.iva_recuperable,fecha:v.fecha,comprobante:v.comprobante||null,...(b.modo==='reembolso'?{verificado:true}:{}),...(b.modo==='editar'?{movimiento:v.movimiento}:{}),...('partida' in v&&b.modo!=='reembolso'?{partida:v.partida}:{})};
 }
 if(['anular','reabrir'].includes(b.modo)){
  if(typeof v.motivo!=='string'||v.motivo.trim().length<5||v.motivo.length>500||(b.modo==='anular'&&!UUID.test(v.movimiento||'')))fail(400,'Escribe un motivo de al menos cinco caracteres.');
  return {motivo:v.motivo.trim(),...(b.modo==='anular'?{movimiento:v.movimiento}:{})};
 }
 if(b.modo==='cerrar'){if(v.costos_completos!==true)fail(400,'Confirma que registraste todos los costos reales.');if(v.perdonar_saldo===true){if(typeof v.motivo!=='string'||v.motivo.trim().length<3||v.motivo.length>300)fail(400,'Escribe por qué no se cobrará el resto.');return {costos_completos:true,perdonar_saldo:true,motivo:v.motivo.trim()};}return {costos_completos:true};}
 if(v.juan_pablo_bp!==null&&(!Number.isSafeInteger(v.juan_pablo_bp)||v.juan_pablo_bp<0||v.juan_pablo_bp>10000))fail(400,'Revisa el porcentaje de reparto.');return {juan_pablo_bp:v.juan_pablo_bp};
}
export function createGastos({sb,row,fail,base,serviceHeaders,fetcher}){
 const leer=async id=>{await row(id);const v=await sb('/rest/v1/rpc/zain_finanzas_ver',{method:'POST',body:JSON.stringify({p_id:id})});if(!v)fail(404,'Pedido no disponible.');return v;};
 return {leer,guardar:async(b,user)=>{
  const datos=validarMovimiento(b,fail);await row(b.id);
  const out=await sb('/rest/v1/rpc/zain_finanzas_operar',{method:'POST',body:JSON.stringify({p_id:b.id,p_version:b.version,p_request:b.request,p_modo:b.modo,p_datos:datos,p_actor:user.id})});
  if(!out||out.error)fail(409,out?.error||'Actualiza antes de guardar.');return out;
 },panel:async filtros=>sb('/rest/v1/rpc/zain_finanzas_panel',{method:'POST',body:JSON.stringify(filtros)}),
 subir:async(request,url,user)=>{
  const id=url.searchParams.get('id'),archivo=url.searchParams.get('archivo');if(!UUID.test(archivo||''))fail(400,'Falta la referencia del comprobante.');
  const x=await row(id);if(x.archivado_at)fail(409,'Restaura el pedido antes de adjuntar un comprobante.');
  const type=request.headers.get('content-type'),tipos={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','application/pdf':'pdf'};if(!tipos[type])fail(400,'Usa JPG, PNG, WEBP o PDF de hasta 4 MB.');
  const chunks=[],reader=request.body?.getReader();if(!reader)fail(400,'Falta el comprobante.');let bytes=0;
  while(true){const v=await reader.read();if(v.done)break;bytes+=v.value.length;if(bytes>4194304){await reader.cancel();fail(413,'El comprobante puede pesar hasta 4 MB.');}chunks.push(v.value);}
  const data=Buffer.concat(chunks),hex=data.subarray(0,8).toString('hex');
  if(bytes<12||!(type==='image/jpeg'&&hex.startsWith('ffd8ff')||type==='image/png'&&hex==='89504e470d0a1a0a'||type==='application/pdf'&&data.subarray(0,5).toString()==='%PDF-'||type==='image/webp'&&data.subarray(0,4).toString()==='RIFF'&&data.subarray(8,12).toString()==='WEBP'))fail(400,'El formato del comprobante no coincide con el archivo.');
  const hash=createHash('sha256').update(data).digest('hex'),prev=await sb('/rest/v1/zain_gasto_archivos?id=eq.'+archivo+'&select=id,pedido_id,actor,hash,mime&limit=1');
  if(prev.length){if(prev[0].pedido_id!==id||prev[0].actor!==user.id||prev[0].hash!==hash||prev[0].mime!==type)fail(409,'La referencia del comprobante ya fue usada.');return {comprobante:archivo};}
  const objeto=id+'/'+randomUUID()+'.'+tipos[type],res=await fetcher(base+'/storage/v1/object/'+BUCKET+'/'+objeto,{method:'POST',headers:{...serviceHeaders,'Content-Type':type,'x-upsert':'false'},body:data,signal:AbortSignal.timeout(30000)});
  if(!res.ok)fail(502,'No se pudo guardar el comprobante. Intenta de nuevo.');
  await sb('/rest/v1/zain_gasto_archivos',{method:'POST',body:JSON.stringify({id:archivo,pedido_id:id,objeto,nombre:'Comprobante.'+tipos[type],mime:type,bytes,hash,actor:user.id})});return {comprobante:archivo};
 },archivo:async(b)=>{
  await row(b.id);if(!UUID.test(b.movimiento||''))fail(400,'Movimiento inválido.');
  const m=await sb('/rest/v1/zain_pedido_movimientos?pedido_id=eq.'+b.id+'&id=eq.'+b.movimiento+'&select=comprobante&limit=1');if(!m[0]?.comprobante)fail(404,'Este movimiento no tiene comprobante.');
  const a=await sb('/rest/v1/zain_gasto_archivos?id=eq.'+m[0].comprobante+'&pedido_id=eq.'+b.id+'&select=objeto&limit=1');if(!a.length)fail(404,'Comprobante no disponible.');
  const r=await sb('/storage/v1/object/sign/'+BUCKET+'/'+a[0].objeto,{method:'POST',body:JSON.stringify({expiresIn:120})});const signed=r.signedURL||r.signedUrl;if(!signed)fail(502,'No se pudo abrir el comprobante.');const path=/^https:\/\//.test(signed)||signed.startsWith('/storage/v1/')?signed:'/storage/v1/'+signed.replace(/^\//,'');const u=new URL(path,base);if(u.origin!==new URL(base).origin)fail(502,'No se pudo preparar el comprobante.');return {url:u.href};
 }};
}
