import {referenciaTenida} from './referencia-color.js?v=2';
// Derivados comerciales en memoria; originales intactos y sin base64 persistente.
const cache=new Map();let remotos,epoca=0,cola=Promise.resolve();
function liberar(key,valor){valor.then(src=>{if(src.startsWith('blob:')&&!key.endsWith('|'+src))URL.revokeObjectURL(src);});}
export function liberarImagenes(){epoca++;for(const [key,valor] of cache)liberar(key,valor);cache.clear();}
globalThis.addEventListener?.('zain:equipo-salio',liberarImagenes);
globalThis.addEventListener?.('zain:imagenes-liberar',liberarImagenes);
const canvas=(w,h=w)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const cargar=src=>new Promise((ok,mal)=>{const img=new Image();img.crossOrigin='anonymous';img.referrerPolicy='no-referrer';const reloj=setTimeout(()=>fin(Error('Imagen no disponible')),15000);function fin(e){clearTimeout(reloj);img.onload=img.onerror=null;e?mal(e):ok(img);}img.onload=()=>fin();img.onerror=()=>fin(Error('Imagen no disponible'));img.src=src;});
async function producto(sku){
 const C=window.ZAIN,local=[...(C?.productos||[]),...(C?.productosHistoricos||[])].find(p=>p.sku===sku);if(local)return local;
 if(!remotos)remotos=fetch((C?.pedidosApi||'/api/pedidos')+'?op=catalogo-publico',{credentials:'omit',signal:AbortSignal.timeout(15000)}).then(r=>r.ok?r.json():null).then(x=>[...(x?.catalogo?.productos||[]),...(x?.catalogo?.productosHistoricos||[])]).catch(()=>[]);
 return (await remotos).find(p=>p.sku===sku);
}
async function limpiar(src,sku){
 let img,mask;const lienzos=[];const crear=(w,h=w)=>{const c=canvas(w,h);lienzos.push(c);return c;};
 try{
  img=await cargar(src);const w=img.naturalWidth,h=img.naturalHeight;if(w!==h||w>4096)return src;
  const probe=crear(1),pg=probe.getContext('2d',{willReadFrequently:true});
  for(const [x,y] of [[0,0],[w-1,0],[0,h-1],[w-1,h-1]]){pg.clearRect(0,0,1,1);pg.drawImage(img,x,y,1,1,0,0,1,1);const d=pg.getImageData(0,0,1,1).data;if(d[3]<254||Math.abs(d[0]-233)>2||Math.abs(d[1]-233)>2||Math.abs(d[2]-230)>2)return src;}
  const p=await producto(sku);if(!p?.foto)return src;mask=await cargar(new URL(p.foto,location.href).href);
  const S=1000,output=crear(S),g=output.getContext('2d',{willReadFrequently:true}),alpha=crear(S),ag=alpha.getContext('2d',{willReadFrequently:true});
  g.drawImage(img,w*.06,h*.02,w*.88,h*.88,0,0,S,S);ag.drawImage(mask,0,0,S,S);
  const d=g.getImageData(0,0,S,S),m=ag.getImageData(0,0,S,S).data;if(m[3]>0||m[(S*S-1)*4+3]>0)return src;
  for(let i=0;i<d.data.length;i+=4){const a=m[i+3]/255;if(!a){d.data[i]=d.data[i+1]=d.data[i+2]=d.data[i+3]=0;continue;}if(a<.99)for(let k=0;k<3;k++)d.data[i+k]=Math.max(0,Math.min(255,(d.data[i+k]-(1-a)*(k===2?230:233))/a));d.data[i+3]=m[i+3];}
  g.putImageData(d,0,0);const blob=await new Promise((ok,mal)=>output.toBlob(b=>b?ok(b):mal(Error('Imagen no disponible')),'image/png'));return URL.createObjectURL(blob);
 }finally{for(const c of lienzos)c.width=c.height=0;if(img)img.removeAttribute('src');if(mask)mask.removeAttribute('src');}
}
// Diseño con frente y espalda lado a lado (2:1): la cotización le da todo el ancho de la tarjeta.
const proporciones=new Map();
const esAncha=src=>{if(!proporciones.has(src)){proporciones.set(src,cargar(src).then(img=>{const a=img.naturalWidth/img.naturalHeight>1.4;img.removeAttribute('src');return a;}).catch(()=>false));if(proporciones.size>48)proporciones.delete(proporciones.keys().next().value);}return proporciones.get(src);};
export async function prepararImagenes(q,imagenes){
 const result={},turn=epoca;
 for(const p of q.partidas){const v=imagenes?.[p.indice];if(v?.error||v?.pendiente){result[p.indice]=v;continue;}if(!v?.src){const ref=await referenciaTenida(p.sku,p.color);if(turn!==epoca)return result;if(ref)result[p.indice]={src:ref,referencia:true};continue;}if(v.referencia){result[p.indice]=v;continue;}const key=p.sku+'|'+v.src;if(!cache.has(key)){const tarea=cola.then(()=>turn===epoca?limpiar(v.src,p.sku):v.src).catch(()=>v.src);cola=tarea.then(()=>{});cache.set(key,tarea);if(cache.size>24){const old=cache.keys().next().value;liberar(old,cache.get(old));cache.delete(old);}}const src=await cache.get(key);if(turn!==epoca)return result;const ancha=await esAncha(src);if(turn!==epoca)return result;result[p.indice]={...v,src,...(ancha?{ancha:true}:{})};}
 return result;
}
