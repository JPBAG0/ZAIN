// Vista comercial de una ficha histórica: conserva los píxeles del diseño.
// No modifica ni reemplaza archivos guardados, prendas o logos originales.
const cache=new Map();let remotos;
globalThis.addEventListener?.('zain:equipo-salio',()=>cache.clear());
const canvas=(w,h=w)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const cargar=src=>new Promise((ok,mal)=>{const img=new Image();img.crossOrigin='anonymous';img.referrerPolicy='no-referrer';img.onload=()=>ok(img);img.onerror=()=>mal(Error('Imagen no disponible'));img.src=src;});
async function producto(sku){
 const C=window.ZAIN,local=[...(C?.productos||[]),...(C?.productosHistoricos||[])].find(p=>p.sku===sku);if(local)return local;
 if(!remotos)remotos=fetch((C?.pedidosApi||'/api/pedidos')+'?op=catalogo-publico',{credentials:'omit',signal:AbortSignal.timeout(15000)}).then(r=>r.ok?r.json():null).then(x=>[...(x?.catalogo?.productos||[]),...(x?.catalogo?.productosHistoricos||[])]).catch(()=>[]);
 return (await remotos).find(p=>p.sku===sku);
}
async function limpiar(src,sku){
 const img=await cargar(src),w=img.naturalWidth,h=img.naturalHeight;if(w!==h||w>4096)return src;
 const comoPNG=()=>{const c=canvas(w,h);c.getContext('2d').drawImage(img,0,0);return c.toDataURL('image/png');};
 const probe=canvas(1),pg=probe.getContext('2d',{willReadFrequently:true});
 // Reconocer exclusivamente el formato emitido por renderFinal: fondo fijo y
 // prenda en x6%, y2%, ancho/alto88%. Nunca adivinar una silueta por su color.
 for(const [x,y] of [[0,0],[w-1,0],[0,h-1],[w-1,h-1]]){pg.clearRect(0,0,1,1);pg.drawImage(img,x,y,1,1,0,0,1,1);const d=pg.getImageData(0,0,1,1).data;if(d[3]<254||Math.abs(d[0]-233)>2||Math.abs(d[1]-233)>2||Math.abs(d[2]-230)>2)return comoPNG();}
 const p=await producto(sku);if(!p?.foto)return comoPNG();const mask=await cargar(new URL(p.foto,location.href).href);
 const S=1000,output=canvas(S),g=output.getContext('2d',{willReadFrequently:true}),alpha=canvas(S),ag=alpha.getContext('2d',{willReadFrequently:true});
 g.drawImage(img,w*.06,h*.02,w*.88,h*.88,0,0,S,S);ag.drawImage(mask,0,0,S,S);
 const d=g.getImageData(0,0,S,S),m=ag.getImageData(0,0,S,S).data;
 // Una plantilla sin alpha no es una máscara válida. Mantener la vista original.
 if(m[3]>0||m[(S*S-1)*4+3]>0)return comoPNG();
 for(let i=0;i<d.data.length;i+=4){const a=m[i+3]/255;if(!a){d.data[i]=d.data[i+1]=d.data[i+2]=d.data[i+3]=0;continue;}if(a<.99)for(let k=0;k<3;k++)d.data[i+k]=Math.max(0,Math.min(255,(d.data[i+k]-(1-a)*(k===2?230:233))/a));d.data[i+3]=m[i+3];}
 g.putImageData(d,0,0);return output.toDataURL('image/png');
}
export async function prepararImagenes(q,imagenes){
 const result={};
 for(const p of q.partidas){const v=imagenes?.[p.indice];if(!v?.src)continue;if(v.referencia){result[p.indice]=v;continue;}const key=p.sku+'|'+v.src;if(!cache.has(key)){cache.set(key,limpiar(v.src,p.sku).catch(()=>v.src));if(cache.size>32)cache.delete(cache.keys().next().value);}result[p.indice]={...v,src:await cache.get(key)};}
 return result;
}
