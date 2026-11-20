// Foto del artículo fuera de catálogo (JP, 20-nov-2026): se guarda en la carpeta de la cotización y se firma al abrirla.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createCotizacionesModelos,validarCotizacion,fotosDe} from '../server/cotizaciones-modelos.mjs';
import {validateOrder} from '../server/pedidos.mjs';
import {itemServicio,LIBRE} from '../js/cotizacion-servicio.js';
const fail=(status,message)=>{const e=new Error(message);e.status=status;throw e;};
const ID='11111111-1111-4111-8111-111111111111',OTRO='22222222-2222-4222-8222-222222222222',user={id:'33333333-3333-4333-8333-333333333333'};
const F1=ID+'/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.jpg',F2=ID+'/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.jpg';
const libre=foto=>({sku:LIBRE,concepto:'Playera gruesa oversize',tecnica:'',...(foto?{foto}:{})});
const cotizacion=(modelos,extra={})=>({id:ID,version:0,cliente:'Cliente',datos:{schema:1,modelos},comercial:null,desde:null,modelos:modelos.length,...extra});
function base(){
 const filas=new Map(),archivos=new Set(),firmadas=[],llamadas=[];let numero=0;
 const sb=async(path,o={})=>{
  llamadas.push(path);const body=o.body?JSON.parse(o.body):null,id=path.match(/id=eq\.([a-f0-9-]+)/)?.[1];
  if(path.startsWith('/storage/v1/object/list/'))return [...archivos].filter(a=>a.startsWith(body.prefix+'/')).map(a=>({name:a.split('/')[1]}));
  if(path.startsWith('/storage/v1/object/sign/')){const objeto=path.slice('/storage/v1/object/sign/zain-cotizaciones-logos/'.length);if(!archivos.has(objeto))throw Error('Object not found');firmadas.push(objeto);return {signedURL:'/object/sign/'+objeto+'?token=t'};}
  if(o.method==='POST'){if(filas.has(body.id))return [];const x={...body,folio:'COT-'+String(++numero).padStart(4,'0'),estado:body.estado||'borrador',version:1};filas.set(body.id,x);return [x];}
  if(o.method==='PATCH'){const x=filas.get(id),v=Number(path.match(/version=eq\.(\d+)/)[1]);if(!x||x.version!==v)return [];Object.assign(x,body);return [x];}
  if(path.includes('select=*'))return filas.has(id)?[filas.get(id)]:[];
  return [...filas.values()];
 };
 return {sb,filas,archivos,firmadas,llamadas};
}
const storageURL=raw=>new URL('/storage/v1'+raw,'https://ejemplo.supabase.co');

test('la foto solo se acepta en un artículo fuera de catálogo, en su carpeta y con tipo de imagen',()=>{
 assert.deepEqual(fotosDe(ID,{modelos:[libre({objeto:F1,mime:'image/jpeg'}),{sku:'ZN-PL-004'}]},fail),[F1]);
 assert.doesNotThrow(()=>validarCotizacion(cotizacion([libre({objeto:F1,mime:'image/jpeg'})]),fail));
 const malas=[
  {sku:'ZN-PL-004',foto:{objeto:F1,mime:'image/jpeg'}},
  libre({objeto:OTRO+'/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.jpg',mime:'image/jpeg'}),
  libre({objeto:F1,mime:'image/png'}),
  libre({objeto:ID+'/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.svg',mime:'image/svg+xml'}),
  libre({objeto:F1,mime:'image/jpeg',url:'https://otro.example/x.jpg'}),
  libre({objeto:'../'+F1,mime:'image/jpeg'}),
  libre('foto.jpg')
 ];
 for(const m of malas)assert.throws(()=>validarCotizacion(cotizacion([m]),fail),e=>e.status===400&&/foto/.test(e.message),JSON.stringify(m));
});

test('guardar exige que la foto ya esté subida; al editar solo revisa las fotos nuevas',async()=>{
 const b=base(),api=createCotizacionesModelos({sb:b.sb,fail,storageURL});
 await assert.rejects(api.guardar(cotizacion([libre({objeto:F1,mime:'image/jpeg'})]),user),e=>e.status===409&&/foto/.test(e.message));
 b.archivos.add(F1);
 const a=(await api.guardar(cotizacion([libre({objeto:F1,mime:'image/jpeg'})]),user)).cotizacion;assert.equal(a.version,1);
 // Editar sin cambiar la foto no vuelve a listar la carpeta.
 const antes=b.llamadas.filter(p=>p.includes('/object/list/')).length;
 assert.equal((await api.guardar(cotizacion([libre({objeto:F1,mime:'image/jpeg'})],{version:1}),user)).cotizacion.version,2);
 assert.equal(b.llamadas.filter(p=>p.includes('/object/list/')).length,antes);
 // Una foto nueva sin subir se rechaza; ya subida, se guarda.
 await assert.rejects(api.guardar(cotizacion([libre({objeto:F2,mime:'image/jpeg'})],{version:2}),user),{status:409});
 b.archivos.add(F2);
 assert.equal((await api.guardar(cotizacion([libre({objeto:F2,mime:'image/jpeg'})],{version:2}),user)).cotizacion.datos.modelos[0].foto.objeto,F2);
});

test('abrir firma las fotos guardadas y no falla si una ya no existe',async()=>{
 const b=base(),api=createCotizacionesModelos({sb:b.sb,fail,storageURL});b.archivos.add(F1);b.archivos.add(F2);
 await api.guardar(cotizacion([libre({objeto:F1,mime:'image/jpeg'}),libre({objeto:F2,mime:'image/jpeg'}),libre({objeto:F1,mime:'image/jpeg'})]),user);
 b.archivos.delete(F2);
 const {cotizacion:x}=await api.leer(ID);
 assert.deepEqual(Object.keys(x.fotosUrl),[F1]);assert.match(x.fotosUrl[F1],/^https:\/\/ejemplo\.supabase\.co\/storage\/v1\/object\/sign\//);
 assert.equal(b.firmadas.filter(o=>o===F1).length,1,'la misma foto se firma una vez');
 // Una cotización sin fotos sigue abriendo igual.
 b.filas.get(ID).datos={schema:1,modelos:[]};assert.deepEqual((await api.leer(ID)).cotizacion.fotosUrl,{});
});

test('pedido: el artículo libre con foto lleva su imagen como render, con o sin personalización',()=>{
 const id='12345678-1234-4123-8123-123456789abc',token='a'.repeat(64),ok={servicio:true,snapshot:true};
 const simple={...itemServicio({libre:true,nombre:'Playera gruesa oversize',tecnica:'Solo prenda',cm:0,piezas:30}),tieneRender:true};
 const render=[{item:0,kind:'render',type:'image/png',size:90000,name:'foto.png'}];
 const x=validateOrder({id,token,items:[simple],files:render},ok);
 assert.equal(x.items[0].tieneRender,true);assert.equal(x.items[0].tieneLogo,false);
 assert.throws(()=>validateOrder({id,token,items:[simple],files:[]},ok),/Faltan/);
 assert.throws(()=>validateOrder({id,token,items:[simple],files:[{...render[0],type:'image/jpeg'}]},ok),/archivo válido/);
 // Sin personalización sigue sin aceptar logo ni medida.
 assert.throws(()=>validateOrder({id,token,items:[{...simple,tieneLogo:true}],files:render},ok),/tamaño del logo/);
 const conLogo={...itemServicio({libre:true,nombre:'Polo waffle',tecnica:'Bordado',cm:8,piezas:30,logoNombre:'logo.png'}),tieneRender:true};
 const y=validateOrder({id,token,items:[conLogo],files:[...render,{item:0,kind:'logo',type:'image/png',size:2000,name:'logo.png'}]},ok);
 assert.equal(y.items[0].tieneRender,true);assert.equal(y.items[0].tieneLogo,true);
 // El catálogo público sigue sin poder crear estas partidas.
 assert.throws(()=>validateOrder({id,token,items:[simple],files:render}),/cantidades/);
});
