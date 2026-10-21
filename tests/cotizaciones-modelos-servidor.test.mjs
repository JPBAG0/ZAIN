import test from 'node:test';
import assert from 'node:assert/strict';
import {createCotizacionesModelos,validarCotizacion} from '../server/cotizaciones-modelos.mjs';
const fail=(status,message)=>{const e=new Error(message);e.status=status;throw e;};
const ID='11111111-1111-4111-8111-111111111111',OTRO='22222222-2222-4222-8222-222222222222',user={id:'33333333-3333-4333-8333-333333333333'},otro={id:'44444444-4444-4444-8444-444444444444'};
// Base en memoria que entiende las rutas que usa el módulo.
function base(){
 const filas=new Map(),archivos=new Set(),llamadas=[];let numero=0;
 const sb=async(path,o={})=>{
  llamadas.push(path);const body=o.body?JSON.parse(o.body):null,id=path.match(/id=eq\.([a-f0-9-]+)/)?.[1];
  if(path.startsWith('/storage/v1/object/list/'))return [...archivos].filter(a=>a.startsWith(body.prefix+'/')).map(a=>({name:a.split('/')[1]}));
  if(path.startsWith('/storage/v1/object/upload/sign/'))return {url:'/object/upload/sign/x?token=t'};
  if(path.startsWith('/storage/v1/object/sign/'))return {signedURL:'/object/sign/x?token=t'};
  if(o.method==='POST'){if(filas.has(body.id))return [];const x={...body,numero:++numero,folio:'COT-'+String(numero).padStart(4,'0'),estado:body.estado||'borrador',version:1};filas.set(body.id,x);return [x];}
  if(o.method==='PATCH'){const x=filas.get(id),v=Number(path.match(/version=eq\.(\d+)/)[1]);if(!x||x.version!==v||x.estado==='convertida')return [];Object.assign(x,body);return [x];}
  if(path.includes('select=*'))return filas.has(id)?[filas.get(id)]:[];
  return [...filas.values()];
 };
 return {sb,filas,archivos,llamadas};
}
const storageURL=raw=>new URL('/storage/v1'+raw,'https://ejemplo.supabase.co');
const nueva=(extra={})=>({id:ID,version:0,cliente:'  Constructora  del Bajío ',datos:{schema:1,modelos:[]},comercial:null,desde:12000,modelos:1,...extra});
test('crea con folio consecutivo, reintento idempotente y no pisa cambios de otro',async()=>{
 const b=base(),api=createCotizacionesModelos({sb:b.sb,fail,storageURL});
 const a=(await api.guardar(nueva(),user)).cotizacion;assert.equal(a.folio,'COT-0001');assert.equal(a.cliente,'Constructora del Bajío');assert.equal(a.creado_por,user.id);
 assert.equal((await api.guardar(nueva(),user)).cotizacion.folio,'COT-0001');
 await assert.rejects(api.guardar(nueva({datos:{schema:1,otra:true}}),user),{status:409});
 const v2=(await api.guardar(nueva({version:1,datos:{schema:1,modelos:[1]}}),user)).cotizacion;assert.equal(v2.version,2);
 await assert.rejects(api.guardar(nueva({version:1}),otro),{status:409});
 assert.equal((await api.guardar({...nueva(),id:OTRO},user)).cotizacion.folio,'COT-0002');
});
test('estados permitidos; convertida no se edita desde aquí',async()=>{
 const b=base(),api=createCotizacionesModelos({sb:b.sb,fail,storageURL});await api.guardar(nueva(),user);
 assert.equal((await api.estado({id:ID,version:1,estado:'enviada'},user)).cotizacion.estado,'enviada');
 await assert.rejects(api.estado({id:ID,version:2,estado:'convertida'},user),{status:400});
 b.filas.get(ID).estado='convertida';
 await assert.rejects(api.guardar(nueva({version:2}),user),e=>e.status===409&&/Pedidos/.test(e.message));
});
test('el logo solo se acepta en su carpeta, con tipo permitido y ya subido',async()=>{
 const b=base(),api=createCotizacionesModelos({sb:b.sb,fail,storageURL});
 await assert.rejects(api.logoSubida({id:ID,mime:'application/pdf',bytes:10}),{status:400});
 await assert.rejects(api.logoSubida({id:ID,mime:'image/png',bytes:16*1024*1024}),{status:400});
 const s=await api.logoSubida({id:ID,mime:'image/png',bytes:2000});assert.match(s.objeto,new RegExp('^'+ID+'/[a-f0-9-]{36}\\.png$'));assert.match(s.url,/^https:\/\/ejemplo\.supabase\.co\/storage\/v1\//);
 const logo={objeto:s.objeto,mime:'image/png',nombre:'acme.png'};
 await assert.rejects(api.guardar(nueva({logo}),user),{status:409});
 b.archivos.add(s.objeto);const x=(await api.guardar(nueva({logo}),user)).cotizacion;assert.equal(x.logo.objeto,s.objeto);
 assert.throws(()=>validarCotizacion(nueva({logo:{...logo,objeto:OTRO+'/'+s.objeto.split('/')[1]}}),fail),{status:400});
 assert.match((await api.leer(ID)).cotizacion.logoUrl,/^https:\/\/ejemplo\.supabase\.co\/storage\/v1\/object\/sign\//);
});
test('valida tamaño, modelos, precios y estado',()=>{
 for(const malo of [{id:'x'},{version:-1},{datos:[]},{datos:{x:'a'.repeat(300001)}},{modelos:21},{desde:-1},{comercial:'texto'},{estado:'convertida'}])assert.throws(()=>validarCotizacion(nueva(malo),fail),{status:400});
 assert.equal(validarCotizacion(nueva({cliente:'a'.repeat(300)}),fail).cliente.length,180);
});
test('convertir liga el pedido guardado y bloquea cambios posteriores',async()=>{
 const b=base(),pedidos={[OTRO]:{id:OTRO,folio:'ZAIN-ABC',guardado_at:'2026-10-21',archivado_at:null}};
 const row=async id=>{if(!pedidos[id])fail(404,'Solicitud no encontrada.');return pedidos[id];};
 const api=createCotizacionesModelos({sb:b.sb,fail,storageURL,row});await api.guardar(nueva(),user);
 await assert.rejects(api.convertir({id:ID,version:1,pedido_id:'55555555-5555-4555-8555-555555555555'},user),{status:404});
 pedidos[OTRO].guardado_at=null;await assert.rejects(api.convertir({id:ID,version:1,pedido_id:OTRO},user),{status:409});pedidos[OTRO].guardado_at='2026-10-21';
 const r=await api.convertir({id:ID,version:1,pedido_id:OTRO},user);assert.equal(r.cotizacion.estado,'convertida');assert.equal(r.cotizacion.pedido_id,OTRO);assert.equal(r.pedido.folio,'ZAIN-ABC');
 await assert.rejects(api.convertir({id:ID,version:2,pedido_id:OTRO},user),{status:409});
 await assert.rejects(api.estado({id:ID,version:2,estado:'borrador'},user),{status:409});
});
