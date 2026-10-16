// La URL proviene siempre del acceso ya autorizado al pedido.
export async function cargarRender(obtener,{signal}={}){
 for(let intento=0;intento<2;intento++){
  let src;
  try{
   if(signal?.aborted)throw new DOMException('Cancelado','AbortError');
   const data=await obtener(),u=new URL(data.url,location.href);
   if(!['https:','http:'].includes(u.protocol))throw Error('Imagen no disponible.');
   const timeout=new AbortController(),cancelar=()=>timeout.abort();signal?.addEventListener('abort',cancelar,{once:true});
   const reloj=setTimeout(cancelar,25000);let blob;
   try{const r=await fetch(u.href,{credentials:'omit',cache:'no-store',signal:timeout.signal});if(!r.ok)throw Error('Imagen no disponible.');blob=await r.blob();}finally{clearTimeout(reloj);signal?.removeEventListener('abort',cancelar);}
   if(!['image/png','image/jpeg','image/webp'].includes(blob.type.split(';')[0])||!blob.size||blob.size>12*1024*1024)throw Error('Formato de imagen no disponible.');
   src=URL.createObjectURL(blob);const imagen=new Image();imagen.referrerPolicy='no-referrer';
   await new Promise((ok,mal)=>{const reloj=setTimeout(()=>fin(Error('La imagen tardó demasiado.')),15000);const fin=e=>{clearTimeout(reloj);imagen.onload=imagen.onerror=null;signal?.removeEventListener('abort',abortar);e?mal(e):ok();};const abortar=()=>fin(new DOMException('Cancelado','AbortError'));signal?.addEventListener('abort',abortar,{once:true});imagen.onload=()=>fin();imagen.onerror=()=>fin(Error('No se pudo abrir la imagen.'));imagen.src=src;});
   if(signal?.aborted)throw new DOMException('Cancelado','AbortError');
   return {src,imagen,liberar:()=>{URL.revokeObjectURL(src);imagen.removeAttribute('src');}};
  }catch(e){if(src)URL.revokeObjectURL(src);if(signal?.aborted)throw e;if(intento===1)throw Error('No se pudo cargar el diseño. Pulsa Actualizar para reintentar.');}
 }
}
