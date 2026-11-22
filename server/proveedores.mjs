// Catálogos y listas de precios de proveedores (JP, 21-nov-2026) en Gestión → Catálogo. Bucket privado
// «zain-proveedores»; cada archivo se sube con firma directa al bucket y se abre con un enlace firmado de 60 minutos.
// Nunca se borran: «Quitar» los archiva.
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const BUCKET='zain-proveedores';
export const MAX_BYTES=50*1024*1024;
export const TIPOS_ARCHIVO={'application/pdf':'pdf','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'xlsx','image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
export const TIPOS=['catalogo','precios','otro'];
const CAMPOS='id,proveedor,tipo,titulo,objeto,mime,bytes,nota,version,created_at,updated_at';
const linea=(v,max)=>typeof v==='string'?v.replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max):'';
export function validarDatos(b,fail){
 if(!b||typeof b!=='object'||Array.isArray(b))fail(400,'Revisa los datos del archivo.');
 const proveedor=linea(b.proveedor,80),titulo=linea(b.titulo,120),nota=linea(b.nota,300);
 if(proveedor.length<2)fail(400,'Escribe el nombre del proveedor.');
 if(titulo.length<2)fail(400,'Escribe el nombre del archivo (por ejemplo «Catálogo 2026»).');
 if(!TIPOS.includes(b.tipo))fail(400,'Elige si es catálogo, lista de precios u otro.');
 return {proveedor,tipo:b.tipo,titulo,nota};
}
export function createProveedores({sb,fail,storageURL}){
 const id=v=>{if(!UUID.test(v||''))fail(400,'Revisa el archivo.');return v.toLowerCase();};
 const fila=async x=>{const r=await sb('/rest/v1/zain_proveedores_archivos?id=eq.'+id(x)+'&select=*&limit=1');if(!r[0])fail(404,'Ese archivo ya no está en la lista.');return r[0];};
 return {
  lista:async()=>({archivos:await sb('/rest/v1/zain_proveedores_archivos?archivado_at=is.null&select='+CAMPOS+'&order=proveedor.asc,tipo.asc,titulo.asc&limit=500')}),
  // Firma la subida directa al bucket. El nombre del objeto es el id del archivo más su extensión.
  subida:async b=>{
   const ext=TIPOS_ARCHIVO[b?.mime];
   if(!ext)fail(400,'Sube un PDF, un Excel (.xlsx) o una imagen.');
   if(!Number.isSafeInteger(b.bytes)||b.bytes<1||b.bytes>MAX_BYTES)fail(400,'El archivo pesa más de 50 MB. Pídeme que lo comprima antes de subirlo.');
   const objeto=id(b.id)+'.'+ext,d=await sb('/storage/v1/object/upload/sign/'+BUCKET+'/'+objeto,{method:'POST',body:'{}'});
   return {objeto,url:storageURL(d.url).href};
  },
  // Registra el archivo ya subido. Un reintento con el mismo id devuelve lo guardado.
  guardar:async(b,user)=>{
   const v=validarDatos(b,fail),archivo=id(b.id),ext=TIPOS_ARCHIVO[b.mime];
   if(!ext||b.objeto!==archivo+'.'+ext)fail(400,'Vuelve a subir el archivo.');
   if(!Number.isSafeInteger(b.bytes)||b.bytes<1||b.bytes>MAX_BYTES)fail(400,'Vuelve a subir el archivo.');
   const lista=await sb('/storage/v1/object/list/'+BUCKET,{method:'POST',body:JSON.stringify({prefix:'',search:archivo,limit:5,offset:0})});
   const subido=(lista||[]).find(o=>o.name===b.objeto);
   if(!subido)fail(409,'El archivo todavía no termina de subir. Intenta guardar de nuevo.');
   if(Number(subido.metadata?.size)!==b.bytes)fail(409,'El archivo no llegó completo. Vuelve a subirlo.');
   const out=await sb('/rest/v1/zain_proveedores_archivos?on_conflict=id',{method:'POST',headers:{Prefer:'return=representation,resolution=ignore-duplicates'},
    body:JSON.stringify({id:archivo,...v,objeto:b.objeto,mime:b.mime,bytes:b.bytes,creado_por:user.id,actor:user.id})});
   return {archivo:out?.[0]||await fila(archivo)};
  },
  editar:async(b,user)=>{
   const v=validarDatos(b,fail);
   if(!Number.isSafeInteger(b.version)||b.version<1)fail(400,'Actualiza la lista antes de guardar.');
   const out=await sb('/rest/v1/zain_proveedores_archivos?id=eq.'+id(b.id)+'&version=eq.'+b.version+'&archivado_at=is.null',{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({...v,version:b.version+1,actor:user.id,updated_at:new Date().toISOString()})});
   if(!out?.length)fail(409,'Tu compañero cambió este archivo. Actualiza la lista.');
   return {archivo:out[0]};
  },
  abrir:async b=>{
   const x=await fila(b?.id);if(x.archivado_at)fail(404,'Ese archivo ya no está en la lista.');
   const d=await sb('/storage/v1/object/sign/'+BUCKET+'/'+x.objeto,{method:'POST',body:JSON.stringify({expiresIn:3600})});
   return {url:storageURL(d.signedURL||d.signedUrl).href,mime:x.mime,titulo:x.titulo,proveedor:x.proveedor};
  },
  archivar:async(b,user)=>{
   const out=await sb('/rest/v1/zain_proveedores_archivos?id=eq.'+id(b?.id)+'&archivado_at=is.null',{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({archivado_at:new Date().toISOString(),actor:user.id,updated_at:new Date().toISOString()})});
   if(!out?.length)fail(404,'Ese archivo ya no está en la lista.');
   return {ok:true};
  }
 };
}
