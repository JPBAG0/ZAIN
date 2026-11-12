// Artículo fuera de catálogo (JP, 11-nov-2026): algo que ZAIN consigue por fuera, con concepto, costo y precio escritos a mano.
import test from 'node:test';
import assert from 'node:assert/strict';
import {armarPedido} from '../js/cotizacion-modelos-pedido.js';
import {productoLibre,filasServicio,itemServicio,LIBRE,COLOR_LIBRE,SERVICIO} from '../js/cotizacion-servicio.js';
import {precioFila,comercial} from '../js/cotizacion-modelos.js';
import {createHandler,validateOrder} from '../server/pedidos.mjs';
import {validarSelecciones} from '../server/cotizacion-selecciones.mjs';
import {generar,calcular,entrada,paraCliente,inicial} from '../js/cotizacion-core.js';
import C from '../server/config-interno.cjs';
const id='12345678-1234-4123-8123-123456789abc',token='a'.repeat(64),staffID='87654321-4321-4321-8321-cba987654321';
const fail=(status,m)=>{const e=Error(m);e.status=status;throw e;};
// Como lo arma la pantalla de Cotizaciones: un renglón «Por pieza» con el costo escrito y su precio visto.
const libre=(extra={})=>({nombre:'Termo de acero 500 ml',producto:productoLibre(),tecnica:'',zonaDatos:undefined,ancho:800,ubicacion:'',logoNombre:null,
 filas:filasServicio().map(f=>({...f,costo:9000,incluir:true,visto:15000})),...extra});
const armar=(m,piezas,folio='COT-PRUEBA')=>armarPedido({modelos:[m],lineas:[{modelo:0,colorId:'',cantidades:{'':piezas}}],colores:C.colores,escala:C.escalaMaxLogo,folio});
const ok={catalogo:C,snapshot:true,servicio:true};

test('cotizador: el costo escrito da el precio sugerido y la utilidad',()=>{
 const [f]=libre().filas,r=precioFila(f,{margen:4000,aplicacion:0,redondeo:100});
 assert.equal(r.costo,9000);assert.equal(r.sugerido,15000);assert.equal(r.utilidad,6000);
 // Sin costo no hay sugerido, pero el precio escrito a mano sí vale.
 const sinCosto=precioFila({...f,costo:null},{margen:4000,precio:20000,aplicacion:0,redondeo:100});
 assert.equal(sinCosto.sugerido,null);assert.equal(sinCosto.precio,20000);assert.equal(sinCosto.utilidad,null);
});
test('armarPedido: sin personalización va como «Solo prenda», sin logo ni medida, con costo y precio',()=>{
 const r=armar(libre({logoNombre:'logo.png'}),40);
 assert.deepEqual(r.errores,[]);const [s]=r.selecciones;
 assert.equal(s.precio,15000);assert.equal(s.costo,9000);assert.equal(r.subtotal,40*15000);
 assert.deepEqual({p:s.item.p,servicio:s.item.servicio,libre:s.item.libre,nombre:s.item.nombre,color:s.item.color,tecnica:s.item.tecnica,cm:s.item.cm,zona:s.item.zona,tieneLogo:s.item.tieneLogo,logo:s.item.logo,sku:s.item.sku},
  {p:LIBRE,servicio:true,libre:true,nombre:'Termo de acero 500 ml',color:COLOR_LIBRE,tecnica:'Solo prenda',cm:0,zona:'',tieneLogo:false,logo:'Sin personalización',sku:''});
 assert.match(s.item.notas,/COT-PRUEBA.*fuera de catálogo/);
});
test('armarPedido: con personalización lleva técnica, ubicación, ancho y logo; el costo pendiente viaja como null',()=>{
 const r=armar(libre({tecnica:'Bordado',ubicacion:'Frente',logoNombre:'logo.png',filas:libre().filas.map(f=>({...f,costo:null}))}),12);
 assert.deepEqual(r.errores,[]);const [s]=r.selecciones;
 assert.equal(s.costo,null);assert.equal(s.item.tecnica,'Bordado');assert.equal(s.item.zona,'Frente');assert.equal(s.item.cm,8);assert.equal(s.item.tieneLogo,true);assert.equal(s.item.p,LIBRE);
 assert.match(armar(libre({tecnica:'Bordado',ancho:null}),12).errores[0],/ancho del logo/);
 assert.match(armar({...libre(),filas:libre().filas.map(f=>({...f,visto:null}))},5).errores[0],/no tiene precio cotizado/);
});
test('documento comercial: no enseña costo y dice «Artículo especial · Sin personalización»',()=>{
 const m={...libre(),libre:true,servicio:true,sku:LIBRE,margen:4000,aplicacion:0,filas:libre().filas.map(f=>({...f,margen:4000,precio:null}))};
 const q=comercial([m],{folio:'COT-1',destinatario:'',impuesto:1600,redondeo:100});
 assert.equal(q.partidas[0].sku,'');assert.equal(q.partidas[0].color,'Artículo especial');assert.equal(q.partidas[0].personalizacion,'Sin personalización');assert.equal(q.partidas[0].precio,15000);
 assert.ok(!JSON.stringify(q).includes('9000'),'el costo no sale en el documento');
});
test('validateOrder: solo el equipo crea artículos fuera de catálogo',()=>{
 const items=armar(libre(),40).selecciones.map(s=>s.item);
 assert.throws(()=>validateOrder({id,token,items,files:[]},{catalogo:C}),/cantidades/);
 const x=validateOrder({id,token,items,files:[]},ok);
 assert.equal(x.total,40);assert.equal(x.manifest.length,0);
 assert.deepEqual({p:x.items[0].p,servicio:x.items[0].servicio,libre:x.items[0].libre,nombre:x.items[0].nombre,color:x.items[0].color,tecnica:x.items[0].tecnica,cm:x.items[0].cm,sku:x.items[0].sku},
  {p:LIBRE,servicio:true,libre:true,nombre:'Termo de acero 500 ml',color:COLOR_LIBRE,tecnica:'Solo prenda',cm:0,sku:''});
 assert.throws(()=>validateOrder({id,token,items:[{...items[0],color:'Prenda del cliente'}],files:[]},ok),/Color/);
 assert.throws(()=>validateOrder({id,token,items:[{...items[0],cm:8}],files:[]},ok),/tamaño del logo/);
 assert.throws(()=>validateOrder({id,token,items:[{...items[0],tieneLogo:true}],files:[]},ok),/tamaño del logo/);
 assert.throws(()=>validateOrder({id,token,items:[{...items[0],tecnica:'Láser'}],files:[]},ok),/Técnica/);
 assert.throws(()=>validateOrder({id,token,items:[{...items[0],piezas:0}],files:[]},ok),/piezas/);
 assert.equal(validateOrder({id,token,items:[{...items[0],nombre:' ',nombreZain:''}],files:[]},ok).items[0].nombre,'Artículo fuera de catálogo');
 // Con personalización se revisa como la partida sin prenda: técnica válida, medida y archivo del logo.
 const conLogo=armar(libre({tecnica:'Bordado',logoNombre:'logo.png'}),12).selecciones.map(s=>s.item),files=[{item:0,kind:'logo',type:'image/png',size:2000,name:'logo.png'}];
 assert.equal(validateOrder({id,token,items:conLogo,files},ok).items[0].tieneLogo,true);
 assert.throws(()=>validateOrder({id,token,items:conLogo,files:[]},ok),/Faltan/);
 assert.throws(()=>validateOrder({id,token,items:[{...conLogo[0],cm:0}],files},ok),/tamaño del logo/);
 // La partida sin prenda sigue sin aceptar «Solo prenda».
 assert.throws(()=>validateOrder({id,token,items:[{...items[0],p:SERVICIO,color:'Prenda del cliente'}],files:[]},ok),/Técnica/);
});
test('cotización del pedido: el costo queda pendiente hasta escribirlo y el precio es el cotizado',()=>{
 const [item]=validateOrder({id,token,items:armar(libre(),40).selecciones.map(s=>s.item),files:[]},ok).items;
 const q=generar([item],{...inicial(),activo:true}),p=q.partidas[0];
 assert.equal(p.prenda,null);assert.equal(p.costo,null);assert.equal(p.aplicacion,0);
 // Pasar a pedido escribe el costo y el precio cotizados.
 const e=entrada(q),final=calcular([item],{...e,partidas:e.partidas.map(x=>({...x,prenda:9000,precio:15000})),impuesto:1600});
 assert.equal(final.partidas[0].costoPrendas,40*9000);assert.equal(final.partidas[0].costo,40*9000);assert.equal(final.partidas[0].importe,40*15000);
 const cliente=paraCliente(final);assert.equal(cliente.partidas[0].nombre,'Termo de acero 500 ml');assert.equal(cliente.partidas[0].sku,'');
 assert.ok(!JSON.stringify(cliente).includes('360000'),'el cliente no ve el costo');
});
test('Partidas y tallas: un artículo fuera de catálogo se agrega y se edita en un pedido',()=>{
 const base=armar(libre(),40).selecciones.map(s=>s.item),pedido={id,items:validateOrder({id,token,items:base,files:[]},ok).items,archivos:[]};
 const cambio=itemServicio({libre:true,nombre:'Termo de acero 750 ml',tecnica:'Solo prenda',cm:0,piezas:60,anterior:pedido.items[0]});
 const r=validarSelecciones([{origen:0,item:cambio},{origen:null,item:itemServicio({libre:true,nombre:'Mandil de gabardina',tecnica:'Bordado',ubicacion:'Pecho',cm:9,piezas:15})}],pedido,C,validateOrder,fail);
 assert.equal(r[0].item.piezas,60);assert.equal(r[0].item.nombre,'Termo de acero 750 ml');assert.equal(r[0].item.libre,true);assert.equal(r[0].item.cm,0);
 assert.equal(r[1].item.p,LIBRE);assert.equal(r[1].item.tecnica,'Bordado');assert.equal(r[1].item.cm,9);assert.equal(r[1].item.tieneLogo,false);
});
test('crear: sin sesión del equipo no se crea un pedido con artículo fuera de catálogo',async()=>{
 const items=armar(libre(),40).selecciones.map(s=>s.item),calls=[];
 const fake=async(url,opts={})=>{calls.push(url);
  if(url.includes('/auth/v1/user'))return opts.headers.Authorization==='Bearer valid-user'?Response.json({id:staffID,email:'equipo@example.test',email_confirmed_at:'2026-10-13'}):Response.json({error:'bad'},{status:401});
  if(url.includes('/zain_accesos?'))return Response.json([{nombre:'Prueba'}]);
  if(url.includes('/zain_equipo?'))return Response.json([{user_id:staffID,nombre:'Prueba',activo:true}]);
  if(url.includes('/rpc/zain_crear_pedido'))return Response.json({folio:'ZAIN-PRUEBA',items:JSON.parse(opts.body).p_items});
  if(url.includes('/zain_pedidos?'))return Response.json(null);
  throw Error('Ruta inesperada '+url);};
 const h=createHandler({SUPABASE_URL:'https://project.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_prueba_no_real',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_prueba_no_real',ZAIN_PEDIDOS_ENABLED:'true',ZAIN_SITE_URL:'https://zain.test'},fake);
 const crear=auth=>h(new Request('https://zain.test/api/pedidos?op=crear',{method:'POST',headers:{Origin:'https://zain.test','Content-Type':'application/json',...(auth?{Authorization:auth}:{})},body:JSON.stringify({id,token,items,files:[],cliente:{nombre:'Cliente de prueba'}})}));
 assert.equal((await crear()).status,401);assert.ok(!calls.some(u=>u.includes('zain_crear_pedido')));
 const r=await crear('Bearer valid-user');assert.equal(r.status,200);assert.ok(calls.some(u=>u.includes('zain_crear_pedido')));
});
