// Una capacidad por trabajo, únicamente en memoria. No usa .env ni API de imágenes.
import {randomBytes,createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
const origin='https://upzecgfgdtllxdhshhkd.supabase.co';
const api=origin+'/functions/v1/zain-pedidos';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
let ticket=null,job=null;
const digest=v=>createHash('sha256').update(v).digest('hex');
export function begin(){if(ticket)throw Error('Termina el trabajo anterior antes de tomar otro.');ticket=randomBytes(32).toString('hex');return digest(ticket);}
export function forget(){ticket=null;job=null;}
export async function attach(data,directory){
 if(!ticket||!data||!uuid.test(data.id)||!/^zn-np-\d{6}$/.test(data.producto_id)||typeof data.objeto!=='string'||!new RegExp('^'+data.producto_id+'/[a-f0-9-]{36}\\.webp$').test(data.objeto))throw Error('Trabajo local inválido.');
 if(job)throw Error('Ya hay un trabajo seleccionado.');
 job={id:data.id,producto:data.producto_id};
 const response=await fetch(origin+'/storage/v1/object/public/zain-catalogo-fotos/'+data.objeto,{signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error('No se pudo descargar la fotografía de referencia.');
 const reader=response.body.getReader(),chunks=[];let size=0;
 while(true){const r=await reader.read();if(r.done)break;size+=r.value.length;if(size>4*1024*1024){await reader.cancel();throw Error('Referencia demasiado grande.');}chunks.push(Buffer.from(r.value));}
 const input=Buffer.concat(chunks);checkWEBP(input);const target=resolve(directory,data.id,'referencia.webp');await mkdir(dirname(target),{recursive:true});await writeFile(target,input);
 return {id:job.id,nombre:String(data.nombre||'Prenda').slice(0,120),referencia:target};
}
export function checkWEBP(b){if(b.length<20||b.length>4*1024*1024||b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP'||b.readUInt32LE(4)+8!==b.length)throw Error('Se necesita un WEBP válido de hasta 4 MB.');}
async function call(op,extra={}){
 if(!job||!ticket)throw Error('No hay un trabajo local activo.');
 const r=await fetch(api+'?op='+op,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:job.id,ticket,...extra}),signal:AbortSignal.timeout(30000)});
 const d=await r.json();if(!r.ok)throw Error(d.error||'No se pudo completar el render local.');return d;
}
export async function upload(path){
 const bytes=await readFile(path);checkWEBP(bytes);
 const d=await call('render-local-subida',{size:bytes.length,type:'image/webp'});
 const u=new URL(d.url),expected='/storage/v1/object/upload/sign/zain-catalogo-fotos/'+job.producto+'/'+d.foto_id+'.webp';
 if(u.origin!==origin||u.pathname!==expected||!uuid.test(d.foto_id))throw Error('Destino de carga inválido.');
 const r=await fetch(u,{method:'PUT',headers:{'Content-Type':'image/webp','x-upsert':'false'},body:bytes,signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error('No se pudo guardar el render generado.');
 const result=await call('render-local-finalizar');forget();return {estado:result.estado||'revision'};
}
