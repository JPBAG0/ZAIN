// Pasar a pedido una cotización «sin prenda» (el cliente entrega las prendas), 2-nov-2026.
import test from 'node:test';
import assert from 'node:assert/strict';
import {armarPedido} from '../js/cotizacion-modelos-pedido.js';
import {productoServicio,filasServicio,itemServicio,SERVICIO,COLOR_SERVICIO} from '../js/cotizacion-servicio.js';
import {createHandler,validateOrder} from '../server/pedidos.mjs';
import {validarSelecciones} from '../server/cotizacion-selecciones.mjs';
import {generar,calcular,entrada,paraCliente,inicial} from '../js/cotizacion-core.js';
import C from '../server/config-interno.cjs';
const id='12345678-1234-4123-8123-123456789abc',token='a'.repeat(64),staffID='87654321-4321-4321-8321-cba987654321';
const fail=(status,m)=>{const e=Error(m);e.status=status;throw e;};
// Como lo arma la pantalla de Cotizaciones: un renglón «Por pieza» con su precio visto.
const servicio=(extra={})=>({nombre:'Personalización cases',producto:productoServicio(),tecnica:'Serigrafía',zonaDatos:undefined,ancho:800,ubicacion:'Frente del estuche',logoNombre:null,
 filas:filasServicio().map(f=>({...f,incluir:true,visto:1800})),...extra});
const armar=(m,piezas,folio='COT-PRUEBA')=>armarPedido({modelos:[m],lineas:[{modelo:0,colorId:'',cantidades:{'':piezas}}],colores:C.colores,escala:C.escalaMaxLogo,folio});

test('armarPedido: una partida por piezas, sin color, tallas ni render, con el precio cotizado',()=>{
 const r=armar(servicio(),302);
 assert.deepEqual(r.errores,[]);assert.equal(r.selecciones.length,1);
 const [s]=r.selecciones;assert.equal(s.precio,1800);assert.equal(r.subtotal,302*1800);assert.equal(r.piezas,302);
 assert.equal(s.item.p,SERVICIO);assert.equal(s.item.servicio,true);assert.equal(s.item.sku,'');assert.equal(s.item.color,COLOR_SERVICIO);
 assert.equal(s.item.nombre,'Personalización cases');assert.equal(s.item.zona,'Frente del estuche');assert.equal(s.item.cm,8);assert.equal(s.item.tallas,'');
 assert.equal(s.item.tieneLogo,false);assert.equal(s.item.tieneRender,false);assert.match(s.item.notas,/COT-PRUEBA.*entrega las prendas.*Logo pendiente/);
 const conLogo=armar(servicio({logoNombre:'drea.png'}),10).selecciones[0].item;assert.equal(conLogo.tieneLogo,true);assert.equal(conLogo.tieneRender,false);assert.equal(conLogo.logo,'archivo «drea.png»');
});
test('armarPedido: nunca inventa precio ni medidas',()=>{
 assert.match(armar({...servicio(),filas:servicio().filas.map(f=>({...f,visto:null}))},5).errores[0],/no tiene precio cotizado para 5 piezas/);
 assert.match(armar({...servicio(),filas:servicio().filas.map(f=>({...f,incluir:false}))},5).errores[0],/no tiene precio cotizado/);
 assert.match(armar(servicio({tecnica:''}),5).errores[0],/elige la personalización/);
 assert.match(armar(servicio({ancho:null}),5).errores[0],/ancho del logo/);
 assert.match(armar(servicio({ancho:20100}),5).errores[0],/ancho del logo/);
 assert.match(armar(servicio(),10000).errores[0],/revisa las piezas/);
});
test('validateOrder: solo el equipo crea partidas sin prenda y se revisan como cualquier partida',()=>{
 const items=armar(servicio({logoNombre:'drea.png'}),302).selecciones.map(s=>s.item),files=[{item:0,kind:'logo',type:'image/png',size:2000,name:'drea.png'}];
 assert.throws(()=>validateOrder({id,token,items,files},{catalogo:C}),/cantidades/);
 const x=validateOrder({id,token,items,files},{catalogo:C,snapshot:true,servicio:true});
 assert.equal(x.total,302);assert.equal(x.manifest.length,1);
 assert.deepEqual({p:x.items[0].p,servicio:x.items[0].servicio,nombre:x.items[0].nombre,nombreZain:x.items[0].nombreZain,sku:x.items[0].sku,color:x.items[0].color,tecnica:x.items[0].tecnica,zona:x.items[0].zona,cm:x.items[0].cm,tieneLogo:x.items[0].tieneLogo},
  {p:SERVICIO,servicio:true,nombre:'Personalización cases',nombreZain:'Personalización cases',sku:'',color:COLOR_SERVICIO,tecnica:'Serigrafía',zona:'Frente del estuche',cm:8,tieneLogo:true});
 const ok={catalogo:C,servicio:true};
 assert.throws(()=>validateOrder({id,token,items,files:[]},ok),/Faltan/);
 assert.throws(()=>validateOrder({id,token,items:[{...items[0],color:'Negro'}],files},ok),/Color/);
 assert.throws(()=>validateOrder({id,token,items:[{...items[0],tecnica:'Solo prenda'}],files},ok),/Técnica/);
 assert.throws(()=>validateOrder({id,token,items:[{...items[0],cm:0}],files},ok),/tamaño del logo/);
 assert.throws(()=>validateOrder({id,token,items:[{...items[0],piezas:0}],files},ok),/piezas/);
 assert.throws(()=>validateOrder({id,token,items:[{...items[0],logoGeometria:{anchoPx:10,altoPx:10,anchoCm:8}}],files},ok),/medidas del diseño/);
 // Un nombre vacío vuelve al genérico.
 assert.equal(validateOrder({id,token,items:[{...items[0],nombre:'  ',nombreZain:''}],files},ok).items[0].nombre,'Personalización sobre prenda del cliente');
});
test('cotización del pedido: la prenda cuesta cero y el precio escrito es el cotizado',()=>{
 const cfg={...inicial(),activo:true,tecnicas:inicial().tecnicas.map(t=>t.tecnica==='Serigrafía'?{...t,tarifaCm2:null,porPieza:500,preparacion:0}:t)};
 const [item]=validateOrder({id,token,items:armar(servicio(),302).selecciones.map(s=>s.item),files:[]},{catalogo:C,snapshot:true,servicio:true}).items;
 const q=generar([item],cfg),p=q.partidas[0];
 assert.equal(p.prenda,0);assert.equal(p.costoPrendas,0);assert.equal(p.sku,'');assert.equal(p.color,COLOR_SERVICIO);
 // Sin tarifa por cm² la aplicación queda pendiente, pero nunca suma una prenda.
 assert.equal(p.costo,null);
 const conTarifa=generar([item],{...cfg,tecnicas:cfg.tecnicas.map(t=>t.tecnica==='Serigrafía'?{...t,tarifaCm2:10000}:t)}).partidas[0];
 assert.equal(conTarifa.prenda,0);assert.ok(conTarifa.costo>0);assert.equal(conTarifa.costo,302*(conTarifa.aplicacion+500));
 const final=calcular([item],{...entrada(q),partidas:entrada(q).partidas.map(x=>({...x,precio:1800})),impuesto:0});
 assert.equal(final.partidas[0].importe,302*1800);assert.equal(final.total,302*1800);
 const cliente=paraCliente(final);assert.equal(cliente.partidas[0].nombre,'Personalización cases');assert.equal(cliente.partidas[0].sku,'');
 // Un modelo del catálogo con «servicio» por error no se queda sin costo de prenda.
 assert.equal(generar([{...item,p:'otro',servicio:true}],cfg).partidas[0].prenda,null);
});
test('Partidas y tallas: la partida sin prenda pasa la validación del servidor y conserva su logo',()=>{
 const items=armar(servicio({logoNombre:'drea.png'}),302).selecciones.map(s=>s.item);
 const pedido={id,items:validateOrder({id,token,items,files:[{item:0,kind:'logo',type:'image/png',size:2000,name:'drea.png'}]},{catalogo:C,snapshot:true,servicio:true}).items,archivos:[{item:0,kind:'logo',type:'image/png',size:2000,name:'drea.png',path:id+'/0-logo.png'}]};
 const cambio=itemServicio({nombre:'Personalización cases',tecnica:'Serigrafía',ubicacion:'Frente',cm:7,piezas:310,anterior:pedido.items[0]});
 const r=validarSelecciones([{origen:0,item:cambio}],pedido,C,validateOrder,fail);
 assert.equal(r[0].item.piezas,310);assert.equal(r[0].item.cm,7);assert.equal(r[0].item.tieneLogo,true);assert.equal(r[0].item.logo,'archivo «drea.png»');assert.equal(r[0].item.servicio,true);
 // Una partida nueva sin prenda también se acepta (sin logo del pedido).
 const nueva=validarSelecciones([{origen:0,item:cambio},{origen:null,item:itemServicio({nombre:'',tecnica:'DTF',cm:10,piezas:5})}],pedido,C,validateOrder,fail);
 assert.equal(nueva[1].item.tieneLogo,false);assert.equal(nueva[1].item.nombre,'Personalización sobre prenda del cliente');
});
test('crear: sin sesión del equipo no se crea un pedido sin prenda',async()=>{
 const items=armar(servicio(),302).selecciones.map(s=>s.item),calls=[];
 const fake=async(url,opts={})=>{calls.push(url);
  if(url.includes('/auth/v1/user'))return opts.headers.Authorization==='Bearer valid-user'?Response.json({id:staffID,email:'equipo@example.test',email_confirmed_at:'2026-10-13'}):Response.json({error:'bad'},{status:401});
  if(url.includes('/zain_accesos?'))return Response.json([{nombre:'Prueba'}]);
  if(url.includes('/zain_equipo?'))return Response.json([{user_id:staffID,nombre:'Prueba',activo:true}]);
  if(url.includes('/rpc/zain_crear_pedido'))return Response.json({folio:'ZAIN-PRUEBA',items:JSON.parse(opts.body).p_items});
  if(url.includes('/zain_pedidos?'))return Response.json(null);
  throw Error('Ruta inesperada '+url);};
 const h=createHandler({SUPABASE_URL:'https://project.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_prueba_no_real',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_prueba_no_real',ZAIN_PEDIDOS_ENABLED:'true',ZAIN_SITE_URL:'https://zain.test'},fake);
 const crear=auth=>h(new Request('https://zain.test/api/pedidos?op=crear',{method:'POST',headers:{Origin:'https://zain.test','Content-Type':'application/json',...(auth?{Authorization:auth}:{})},body:JSON.stringify({id,token,items,files:[],cliente:{nombre:'Drea Producciones'}})}));
 assert.equal((await crear()).status,401);assert.ok(!calls.some(u=>u.includes('zain_crear_pedido')));
 const r=await crear('Bearer valid-user');assert.equal(r.status,200);assert.equal((await r.json()).folio,'ZAIN-PRUEBA');assert.ok(calls.some(u=>u.includes('zain_crear_pedido')));
});
