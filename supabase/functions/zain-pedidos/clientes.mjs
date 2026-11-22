import {randomBytes,createHash} from 'node:crypto';
// Clientes de ZAIN (JP, 21-nov-2026): ficha de cada cliente con sus pedidos y cotizaciones, juntar fichas repetidas y
// duplicar un pedido (al mismo cliente o a otro). Las cotizaciones se duplican en su editor (botón Duplicar). Los datos viven solo en Supabase (privado del
// equipo); nunca van al Cerebro, a Git ni a los registros.
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ERRORES={
 zain_cliente_no_existe:[404,'Ese cliente ya no existe o se juntó con otro. Actualiza la lista.'],
 zain_cliente_mismo:[400,'Elige dos clientes distintos para juntarlos.'],
 zain_pedido_no_existe:[404,'El pedido no existe o todavía no termina de guardarse.'],
 zain_token:[400,'No se pudo preparar el pedido nuevo. Intenta de nuevo.']
};
const texto=(v,max)=>typeof v==='string'?v.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g,' ').replace(/[ \t]+/g,' ').trim().slice(0,max):'';
const linea=(v,max)=>texto(v,max).replace(/\s+/g,' ');
// Teléfono en dígitos con lada de país: 52 si vienen 10, igual que los pedidos y los chats de WhatsApp.
export const telefonoCliente=v=>{const d=typeof v==='string'?v.replace(/\D/g,''):'';return d.length===10?'52'+d:d.length>=11&&d.length<=15?d:'';};
const correoValido=c=>c===''||c.length<=254&&/^[^\s@<>"',;]{1,64}@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,24}$/.test(c);
export function validarCliente(b,fail){
 if(!b||typeof b!=='object'||Array.isArray(b))fail(400,'Revisa los datos del cliente.');
 const nombre=linea(b.nombre,180);
 if(nombre.length<2)fail(400,'Escribe el nombre del cliente o de la empresa.');
 const crudo=typeof b.telefono==='string'?b.telefono.replace(/\D/g,''):'';
 const telefono=telefonoCliente(b.telefono);
 if(crudo&&!telefono)fail(400,'Escribe el teléfono a 10 dígitos (o con lada de país).');
 const correo=linea(b.correo,254).toLowerCase();
 if(!correoValido(correo))fail(400,'Revisa el correo del cliente.');
 return {nombre,empresa:linea(b.empresa,180),telefono,correo,notas:texto(b.notas,2000)};
}
export function createClientes({sb,fail,bucket}){
 const rpc=(nombre,args)=>sb('/rest/v1/rpc/'+nombre,{method:'POST',body:JSON.stringify(args||{}),errores:ERRORES});
 const id=(v,que='el cliente')=>{if(!UUID.test(v||''))fail(400,'Revisa '+que+'.');return v.toLowerCase();};
 const fila=async x=>{const r=await sb('/rest/v1/zain_clientes?id=eq.'+id(x)+'&select=*&limit=1');if(!r[0])fail(404,ERRORES.zain_cliente_no_existe[1]);return r[0];};
 const activo=async x=>{const c=await fila(x);if(c.unido_a)fail(409,'Ese cliente se juntó con otro. Actualiza la lista.');return c;};
 // Copia un archivo dentro del mismo bucket. Si ya se copió (reintento), sigue.
 const copiar=async(bucketId,desde,hacia)=>{
  try{await sb('/storage/v1/object/copy',{method:'POST',body:JSON.stringify({bucketId,sourceKey:desde,destinationKey:hacia}),errores:{'already exists':[409,'ya existe'],Duplicate:[409,'ya existe']}});}
  catch(e){if(e.status!==409)throw e;}
 };
 return {
  lista:async()=>{await rpc('zain_clientes_sincronizar');return {clientes:await rpc('zain_clientes_lista')};},
  ficha:async x=>{const d=await rpc('zain_cliente_ficha',{p_id:id(x)});if(!d)fail(404,ERRORES.zain_cliente_no_existe[1]);return d;},
  // Nuevo (sin id o version 0) o edición con la versión que se leyó, para no pisar el cambio de un compañero.
  guardar:async(b,user)=>{
   const v=validarCliente(b,fail);
   if(!b.id){
    if(!b.forzar){
     const ya=await rpc('zain_cliente_buscar',{p_nombre:v.nombre,p_telefono:v.telefono});
     if(ya){const c=await fila(ya);fail(409,'Ya existe «'+c.nombre+'»'+(c.telefono?' (tel. …'+c.telefono.slice(-4)+')':'')+'. Ábrelo desde la lista o crea el cliente de todos modos.');}
    }
    const out=await sb('/rest/v1/zain_clientes',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({...v,creado_por:user.id,actor:user.id})});
    return {cliente:out[0]};
   }
   if(!Number.isSafeInteger(b.version)||b.version<1)fail(400,'Actualiza el cliente antes de guardar.');
   const out=await sb('/rest/v1/zain_clientes?id=eq.'+id(b.id)+'&version=eq.'+b.version+'&unido_a=is.null',{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({...v,version:b.version+1,actor:user.id,updated_at:new Date().toISOString()})});
   if(!out?.length){const c=await fila(b.id);fail(409,c.unido_a?'Ese cliente se juntó con otro. Actualiza la lista.':'Tu compañero cambió este cliente. Ábrelo de nuevo antes de guardar.');}
   return {cliente:out[0]};
  },
  unir:async(b,user)=>({cliente:await rpc('zain_clientes_unir',{p_origen:id(b?.origen),p_destino:id(b?.destino),p_actor:user.id})}),
  // Cambia el cliente de un pedido o de una cotización.
  asignar:async(b,user)=>{
   const c=await activo(b?.cliente_id);
   if(b.pedido_id)return {pedido:await rpc('zain_pedido_cliente',{p_pedido:id(b.pedido_id,'el pedido'),p_cliente:c.id,p_actor:user.id}),cliente:{id:c.id,nombre:c.nombre}};
   const cot=id(b.cotizacion_id,'la cotización');
   const out=await sb('/rest/v1/zain_cotizaciones_modelos?id=eq.'+cot,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({cliente_id:c.id,cliente:c.nombre.slice(0,180)})});
   if(!out?.length)fail(404,'Cotización no encontrada.');
   return {cotizacion:{id:out[0].id,folio:out[0].folio},cliente:{id:c.id,nombre:c.nombre}};
  },
  // Duplica un pedido con sus partidas, logos, diseño y la cotización del equipo como borrador.
  // «nuevo» lo genera el navegador para que un reintento no cree dos pedidos.
  duplicarPedido:async(b,user)=>{
   const origen=id(b?.origen,'el pedido'),nuevo=id(b?.nuevo,'el pedido nuevo'),c=await activo(b?.cliente_id);
   if(origen===nuevo)fail(400,'Revisa el pedido nuevo.');
   const [o]=await sb('/rest/v1/zain_pedidos?id=eq.'+origen+'&select=id,folio,archivos,guardado_at&limit=1');
   if(!o?.guardado_at)fail(404,ERRORES.zain_pedido_no_existe[1]);
   for(const a of Array.isArray(o.archivos)?o.archivos:[]){
    const ruta=typeof a?.path==='string'?a.path:'';
    if(!ruta.startsWith(origen+'/')||!/^[a-f0-9-]{36}\/[\w.-]{1,120}$/i.test(ruta))fail(409,'Un archivo del pedido no se puede copiar. Revisa el pedido original.');
    await copiar(bucket,ruta,nuevo+ruta.slice(36));
   }
   const token=randomBytes(32).toString('hex'),hash=createHash('sha256').update(token).digest('hex');
   return {pedido:await rpc('zain_pedido_duplicar',{p_origen:origen,p_id:nuevo,p_token_hash:hash,p_cliente:c.id,p_actor:user.id})};
  }
 };
}
