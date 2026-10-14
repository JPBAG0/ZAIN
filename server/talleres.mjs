// Proveedor: identidad verificada y acceso limitado a la partida asignada.
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function supplierItem(x,t,tech){
 const p=x.items[t.indice];
 if(x.archivado_at||!x.guardado_at||!['confirmado','produccion','entregado'].includes(x.estado)||!p||p.tecnica!==tech||t.tecnica!==tech)return null;
 const keys=['sku','color','tecnica','piezas','zona','cm','tallas','tallasEtq','medidas','detalleMedidas','logo','colorLogo','pantone','silueta','renderOrientativo'];
 const item=Object.fromEntries(keys.filter(k=>p[k]!==undefined).map(k=>[k,p[k]]));
 // Notas del cliente y nombre interno pueden contener información de compras.
 item.nombre=p.nombreZain||'Prenda personalizada';
 return {id:t.id,folio:x.folio,created_at:t.created_at,estado:t.estado,version:t.version,item,
 archivos:x.archivos.filter(f=>f.item===t.indice).map(({kind,name,type})=>({kind,name,type}))};
}
export function createWorkshop({sb,identity,row,signedFile,jsonBody,fail,response}){
 const auth=async req=>{
  const u=await identity(req),rows=await sb('/rest/v1/zain_talleres?email=eq.'+encodeURIComponent(u.email.toLowerCase())+'&activo=eq.true&select=id,nombre,tecnica,user_id&limit=1'),t=rows[0];
  if(!t||(t.user_id&&t.user_id!==u.id))fail(403,'Esta cuenta no tiene acceso a un taller de ZAIN.');
  const linked=await sb('/rest/v1/rpc/zain_vincular_taller',{method:'POST',body:JSON.stringify({p_id:t.id,p_user:u.id,p_email:u.email.toLowerCase()})});
  if(!linked)fail(403,'Esta cuenta no tiene acceso a un taller de ZAIN.');return {...linked,user:u.id};
 };
 const assigned=async(id,t)=>{
  if(!UUID.test(id||''))fail(400,'Partida inválida.');
  const rows=await sb('/rest/v1/zain_partidas_taller?id=eq.'+id+'&taller_id=eq.'+t.id+'&select=*&limit=1'),task=rows[0];
  if(!task)fail(404,'Trabajo no encontrado.');
  const x=await row(task.pedido_id),view=supplierItem(x,task,t.tecnica);
  if(!view)fail(404,'Trabajo no encontrado.');return {task,x,view};
 };
 return async(req,url,op)=>{
  const t=await auth(req);
  if(req.method==='GET'&&op==='taller-lista'){
   const offset=Number(url.searchParams.get('offset')||0);if(!Number.isSafeInteger(offset)||offset<0||offset>100000)fail(400,'Página inválida.');
   const tasks=await sb('/rest/v1/zain_partidas_taller?taller_id=eq.'+t.id+'&select=*&order=created_at.desc,id.desc&limit=21&offset='+offset),views=[];
   for(const task of tasks.slice(0,20)){try{const x=await row(task.pedido_id),v=supplierItem(x,task,t.tecnica);if(v)views.push(v);}catch(e){if(e.status!==404)throw e;}}
   return response(200,{taller:{nombre:t.nombre,tecnica:t.tecnica},trabajos:views,siguiente:tasks.length>20,offset});
  }
  if(req.method==='POST'&&op==='taller-archivo'){
   const b=await jsonBody(req),{task,x}=await assigned(b.id,t);
   if(!['logo','render'].includes(b.kind))fail(400,'Archivo inválido.');
   return response(200,await signedFile(x,{item:task.indice,kind:b.kind,descarga:b.descarga===true}));
  }
  if(req.method==='POST'&&op==='taller-actualizar'){
   const b=await jsonBody(req);await assigned(b.id,t);
   if(!Number.isSafeInteger(b.version)||b.version<0||!['aceptado','en_proceso','listo'].includes(b.estado))fail(400,'Revisa el estado del trabajo.');
   const out=await sb('/rest/v1/rpc/zain_actualizar_partida',{method:'POST',body:JSON.stringify({p_id:b.id,p_version:b.version,p_estado:b.estado,p_taller:t.id,p_actor:t.user})});
   if(!out)fail(409,'El trabajo cambió. Actualiza antes de guardar.');return response(200,{trabajo:out});
  }
  fail(404,'Operación de taller no encontrada.');
 };
}
