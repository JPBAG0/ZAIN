import {normalizarGeometria} from './logo-medidas.js?v=1';
// Solo para logos raster históricos obtenidos mediante el acceso privado existente.
export async function estimarGeometria(url,cm){
 const u=new URL(url,location.href);if(u.origin!==location.origin&&u.protocol!=='https:')throw Error('Logo no disponible');
 const r=await fetch(u,{credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Logo no disponible');
 const blob=await r.blob();if(blob.size>15*1024*1024||!['image/png','image/jpeg','image/webp'].includes(blob.type))throw Error('Formato de logo no compatible');
 const original=await window.ZR.abrirArchivo(blob),{logo}=window.ZR.analizarLogo(original,true);
 return normalizarGeometria({anchoPx:logo.width,altoPx:logo.height,anchoCm:Math.round(cm*100)/100});
}
