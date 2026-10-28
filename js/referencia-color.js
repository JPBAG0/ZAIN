// Foto de referencia del modelo pintada del color de la partida (sin logo).
// Antes la cotización usaba la foto base blanca y una playera negra salía blanca (pedido de Drea, 27-oct-2026).
const listas=new Map(),pendientes=new Map();
const productos=()=>{const C=globalThis.window?.ZAIN;return [...(C?.productos||[]),...(C?.productosHistoricos||[])];};
const llave=(sku,color)=>sku+'|'+String(color||'').replace(/ · \d+$/,'').trim().toLocaleLowerCase('es-MX');
// El color del pedido viene como nombre ("Negro · 415" o "Negro"); se busca entre los colores del modelo.
export function colorDe(producto,nombre,colores=globalThis.window?.ZAIN?.colores){
 const buscado=String(nombre||'').replace(/ · \d+$/,'').trim().toLocaleLowerCase('es-MX');
 if(!producto||!buscado||!colores)return null;
 return (producto.colores||[]).map(id=>colores.find(c=>c.id===id)).find(c=>c&&c.nombre.trim().toLocaleLowerCase('es-MX')===buscado)||null;
}
// Gestión puede llevar horas abierta: un modelo dado de alta después no está en su config.js, pero sí en el catálogo en vivo.
let vivo;
const catalogoVivo=()=>vivo||(vivo=fetch((globalThis.window?.ZAIN?.pedidosApi||'/api/pedidos')+'?op=catalogo-publico',{credentials:'omit',signal:AbortSignal.timeout(15000)}).then(r=>r.ok?r.json():null).then(x=>({productos:[...(x?.catalogo?.productos||[]),...(x?.catalogo?.productosHistoricos||[])],colores:x?.catalogo?.colores||[]})).catch(()=>{vivo=null;return {productos:[],colores:[]};}));
const cargar=src=>new Promise((ok,mal)=>{const img=new Image();img.crossOrigin='anonymous';const reloj=setTimeout(()=>fin(Error('Imagen no disponible')),15000);function fin(e){clearTimeout(reloj);img.onload=img.onerror=null;e?mal(e):ok(img);}img.onload=()=>fin();img.onerror=()=>fin(Error('Imagen no disponible'));img.src=src;});
async function pintar(sku,nombre){
 let p=productos().find(x=>x.sku===sku),c=colorDe(p,nombre),colores=globalThis.window?.ZAIN?.colores||[];const ZR=globalThis.window?.ZR;
 if(!p?.foto||!c){const v=await catalogoVivo();p=v.productos.find(x=>x.sku===sku);colores=v.colores;c=colorDe(p,nombre,colores);}
 if(!p?.foto||!c)return null;
 if(p.fotosColor?.[c.id])return new URL(p.fotosColor[c.id],location.href).href;
 if(!ZR?.tenir)return null;
 const img=await cargar(new URL(p.foto,location.href).href),C=globalThis.window.ZAIN;
 const base=p.fotoColor?(C?.colores||[]).concat(colores).find(x=>x.id===p.fotoColor)?.hex||null:null;
 const lienzo=ZR.tenir(img,c.hex,1000,base,p.acabadosFijos||null);
 const blob=await new Promise((ok,mal)=>lienzo.toBlob(b=>b?ok(b):mal(Error('Imagen no disponible')),'image/png'));
 return URL.createObjectURL(blob);
}
// Ya pintada (síncrono, para el editor y la vista); si no, null y se usa la foto base.
export const referenciaLista=(sku,color)=>listas.get(llave(sku,color))||null;
export function referenciaTenida(sku,color){
 const k=llave(sku,color);if(listas.has(k))return Promise.resolve(listas.get(k));
 if(!pendientes.has(k))pendientes.set(k,pintar(sku,color).catch(()=>null).then(src=>{pendientes.delete(k);if(src)listas.set(k,src);return src;}));
 return pendientes.get(k);
}
// Prepara todas las partidas; nunca tarda más de `espera` ms para no frenar la ficha.
export async function prepararReferencias(partidas,espera=4000){
 const tareas=Promise.all((partidas||[]).filter(p=>p?.sku&&p?.color).map(p=>referenciaTenida(p.sku,p.color)));
 await Promise.race([tareas,new Promise(ok=>setTimeout(ok,espera))]);
}
