import test from 'node:test';
import assert from 'node:assert/strict';
import {armarPedido} from '../js/cotizacion-modelos-pedido.js';
const colores=[{id:'negro',nombre:'Negro'},{id:'blanco',nombre:'Blanco'}];
const zona={id:'pecho',nombre:'Pecho izquierdo',max:9};
const polo={id:'polo-1',sku:'ZN-PO-008',nombre:'Polo corporativo · Caballero',tallas:['S','M','L','XL','2XL'],colores:['negro','blanco'],minimoPiezas:1,pasoPiezas:1};
const fila=(tallas,desde,hasta,visto,extra={})=>({tallas,color:'Todos los colores',colores:['Todos los colores'],desde,hasta,incluir:true,visto,...extra});
const modelo={nombre:'Polo corporativo · Caballero',producto:polo,tecnica:'Bordado',zonaDatos:zona,ancho:800,logoNombre:'acme.svg',logoGeometria:{anchoPx:400,altoPx:200,anchoCm:8},
 filas:[fila(['S','M','L','XL'],1,49,29400),fila(['2XL'],1,49,33300),fila(['S','M','L','XL'],50,null,27000),fila(['2XL'],50,null,30500)]};
test('agrupa por renglón cotizado y elige el tramo con el total del modelo y color',()=>{
 const r=armarPedido({modelos:[modelo],lineas:[{modelo:0,colorId:'negro',cantidades:{S:10,M:20,L:10,'2XL':5}}],colores,escala:1.3,folio:'COT-0001'});
 assert.deepEqual(r.errores,[]);assert.equal(r.selecciones.length,2);
 const [a,b]=r.selecciones;assert.equal(a.precio,29400);assert.deepEqual(a.item.tallasDetalle,{S:10,M:20,L:10});assert.equal(a.item.tallas,'S 10 · M 20 · L 10');assert.equal(a.item.piezas,40);
 assert.equal(b.precio,33300);assert.equal(b.item.piezas,5);assert.equal(a.item.cm,8);assert.equal(a.item.zona,'Pecho izquierdo');assert.equal(a.item.colorId,'negro');assert.match(a.item.notas,/COT-0001/);
 assert.equal(r.subtotal,40*29400+5*33300);
 const grande=armarPedido({modelos:[modelo],lineas:[{modelo:0,colorId:'negro',cantidades:{M:45,'2XL':5}}],colores,escala:1.3});
 assert.deepEqual(grande.selecciones.map(s=>s.precio),[27000,30500]);
});
test('no inventa precios: talla excluida, tramo sin precio, color y técnica',()=>{
 const sin2xl={...modelo,filas:modelo.filas.map(f=>f.tallas.includes('2XL')?{...f,incluir:false}:f)};
 assert.match(armarPedido({modelos:[sin2xl],lineas:[{modelo:0,colorId:'negro',cantidades:{'2XL':3}}],colores}).errores[0],/2XL no tiene precio cotizado para 3 piezas/);
 assert.match(armarPedido({modelos:[{...modelo,tecnica:''}],lineas:[{modelo:0,colorId:'negro',cantidades:{S:3}}],colores}).errores[0],/elige Bordado/);
 assert.match(armarPedido({modelos:[modelo],lineas:[{modelo:0,colorId:'rojo',cantidades:{S:3}}],colores}).errores[0],/elige un color/);
 assert.match(armarPedido({modelos:[modelo],lineas:[{modelo:0,colorId:'negro',cantidades:{XS:3}}],colores}).errores[0],/no existen/);
 assert.match(armarPedido({modelos:[modelo],lineas:[{modelo:0,colorId:'negro',cantidades:{}}],colores}).errores[0],/al menos una cantidad/);
});
test('respeta el máximo del logo de pedidos y los mínimos de bolsas',()=>{
 assert.match(armarPedido({modelos:[{...modelo,ancho:1200}],lineas:[{modelo:0,colorId:'negro',cantidades:{S:3}}],colores,escala:1.3}).errores[0],/excede/);
 const bolsa={...modelo,producto:{id:'bolsa',sku:'ZN-BO-001',nombre:'Bolsa',tallas:[],colores:['negro'],minimoPiezas:100,pasoPiezas:50},filas:[fila([],1,null,1500)]};
 assert.match(armarPedido({modelos:[bolsa],lineas:[{modelo:0,colorId:'negro',cantidades:{'':120}}],colores}).errores[0],/mínimo es 100 y luego de 50/);
 const ok=armarPedido({modelos:[bolsa],lineas:[{modelo:0,colorId:'negro',cantidades:{'':150}}],colores});
 assert.deepEqual(ok.errores,[]);assert.equal(ok.selecciones[0].item.tallasDetalle,undefined);assert.equal(ok.selecciones[0].item.piezas,150);
});
test('colores con precio distinto y varios colores del mismo modelo',()=>{
 const porColor={...modelo,filas:[fila(['S','M','L','XL','2XL'],1,null,30000,{color:'Negro',colores:['Negro']}),fila(['S','M','L','XL','2XL'],1,null,28000,{color:'Blanco',colores:['Blanco']})]};
 const r=armarPedido({modelos:[porColor],lineas:[{modelo:0,colorId:'negro',cantidades:{S:2}},{modelo:0,colorId:'blanco',cantidades:{S:3,M:1}}],colores});
 assert.deepEqual(r.selecciones.map(s=>[s.item.color,s.precio,s.item.piezas]),[['Negro',30000,2],['Blanco',28000,4]]);
});
