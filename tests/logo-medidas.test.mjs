import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizarGeometria,medidasLogo} from '../js/logo-medidas.js';
import {inicial,generar,calcular,entrada,paraCliente} from '../js/cotizacion-core.js';
import {validateOrder} from '../server/pedidos.mjs';
import C from '../server/config-interno.cjs';
const geometry={anchoPx:1000,altoPx:400,anchoCm:10};
const item={sku:'TEST',nombre:'Prenda',tecnica:'DTF',piezas:10,color:'Negro',cm:10,logoGeometria:geometry};
const cfg={...inicial(),activo:true,prendas:[{sku:'TEST',prenda:10000,otros:0}],tecnicas:inicial().tecnicas.map(t=>({...t,tarifaCm2:50}))};
test('proporción horizontal, cuadrada y vertical calcula alto con el ancho efectivo',()=>{
 assert.deepEqual(medidasLogo(10,geometry),{ancho:1000,alto:400});
 assert.deepEqual(medidasLogo(10,{anchoPx:500,altoPx:500,anchoCm:10}),{ancho:1000,alto:1000});
 assert.deepEqual(medidasLogo(10,{anchoPx:200,altoPx:1000,anchoCm:2.1}),{ancho:210,alto:1050});
});
test('redondea una sola vez a centésimas y no inventa medidas inválidas',()=>{
 assert.deepEqual(medidasLogo(11.5,{anchoPx:813,altoPx:267,anchoCm:11.5}),{ancho:1150,alto:378});
 for(const g of [null,{},[],{...geometry,altoPx:0},{...geometry,altoPx:Infinity},{...geometry,anchoPx:1.5},{...geometry,anchoCm:'10'},{...geometry,anchoCm:0},{...geometry,anchoCm:10.001}])assert.equal(normalizarGeometria(g),null);
 assert.equal(medidasLogo(9,geometry),null);assert.equal(medidasLogo(10,{anchoPx:1,altoPx:10000,anchoCm:10}),null);
});
test('borrador nuevo usa la proporción y calcula área y técnica; histórico sigue pendiente',()=>{
 const q=generar([item],cfg);assert.equal(q.partidas[0].ancho,1000);assert.equal(q.partidas[0].alto,400);assert.equal(q.partidas[0].aplicacion,20);
 assert.equal(generar([{...item,logoGeometria:undefined}],cfg).partidas[0].alto,null);
 assert.equal(generar([{...item,cm:0}],cfg).partidas[0].alto,null);
});
test('la revisión manual prevalece, publicaciones solo incluyen los datos comerciales',()=>{
 const input=entrada(generar([item],cfg));input.partidas[0].alto=650;input.impuesto=0;
 const q=calcular([item],input);assert.equal(q.partidas[0].alto,650);assert.equal(calcular([item],entrada(q)).partidas[0].alto,650);
 const pub=JSON.stringify(paraCliente(q));for(const key of ['logoGeometria','altoPx','anchoPx','tarifaCm2','alto'])assert.ok(!pub.includes('"'+key+'"'));
});
const product=C.productos.find(p=>p.sku==='ZN-PO-008'),col=C.colores.find(c=>c.id===product.colores[0]);
function body(g=geometry){return {id:'12345678-1234-4123-8123-123456789abc',token:'a'.repeat(64),items:[{p:product.id,color:col.nombre,colorId:col.id,colorCodigo:col.codigo,zona:product.zonas[0].nombre,cm:10,piezas:5,tallasDetalle:{M:5},tecnica:'Bordado',tieneRender:true,logoGeometria:g}],files:[{item:0,kind:'render',type:'image/png',size:100,name:'render.png'}]};}
test('servidor guarda solo geometría normalizada de diseño y rechaza datos inconsistentes',()=>{
 const b=body();assert.deepEqual(validateOrder(b,{allowHistoricos:true}).items[0].logoGeometria,geometry);
 for(const g of [{...geometry,altoPx:-1},{...geometry,anchoCm:11},[],{...geometry,anchoPx:'1000'}])assert.throws(()=>validateOrder(body(g),{allowHistoricos:true}),/medidas/);
 const absent=body();delete absent.items[0].logoGeometria;assert.ok(!('logoGeometria' in validateOrder(absent,{allowHistoricos:true}).items[0]));
 const noRender=body();noRender.items[0].tieneRender=false;assert.throws(()=>validateOrder(noRender,{allowHistoricos:true}),/medidas/);
});
