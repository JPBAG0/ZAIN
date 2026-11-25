// Cotización rápida con prendas del catálogo (25-nov-2026): costo propuesto y precio con margen.
import test from 'node:test';
import assert from 'node:assert/strict';
import {costoCatalogo,descripcionCatalogo,MEDIDA_INICIAL} from '../js/cotizacion-rapida-catalogo.js';
const producto={sku:'ZN-PL-900',tallas:['S','M','XL','2XL'],colores:['Negro','Blanco']};
const config={prendas:[{sku:'ZN-PL-900',otros:0,bandas:[
 {tallas:['S','M','XL'],colores:[],costo:10000,desdePiezas:1,hastaPiezas:49},{tallas:['S','M','XL'],colores:[],costo:8000,desdePiezas:50,hastaPiezas:null},
 {tallas:['2XL'],colores:[],costo:12000,desdePiezas:1,hastaPiezas:49},{tallas:['2XL'],colores:[],costo:9500,desdePiezas:50,hastaPiezas:null}]}],
 tecnicas:[{tecnica:'Bordado',tarifaCm2:null,preparacion:25000,porPieza:4000},{tecnica:'Serigrafía',tarifaCm2:null,preparacion:0},{tecnica:'DTF',tarifaCm2:500000,preparacion:0,porPieza:500}]};

test('prenda sola: costo del tramo de la cantidad en las tallas base y precio con margen a peso cerrado',()=>{
 const a=costoCatalogo(producto,config,{cantidad:10,color:'Negro',margen:3500});
 assert.equal(a.prenda,10000);assert.equal(a.personalizacion,0);assert.equal(a.costo,10000);
 assert.equal(a.sugerido,15400,'100 / 0.65 = 153.85, hacia arriba a 154');
 assert.equal(a.tallas,'S a XL');assert.match(a.volumen,/1 a 49/);assert.equal(a.variasTallas,true,'avisa que 2XL cuesta distinto');
 assert.equal(costoCatalogo(producto,config,{cantidad:80,margen:3500}).prenda,8000,'el tramo cambia con la cantidad');
 assert.equal(costoCatalogo(producto,config,{margen:3500}).prenda,10000,'sin cantidad usa el primer tramo');
});
test('personalización: fija por pieza o por cm² con la medida del logo',()=>{
 const b=costoCatalogo(producto,config,{cantidad:10,tecnica:'bordado',margen:3500});
 assert.equal(b.personalizacion,4000);assert.equal(b.costo,14000);assert.equal(b.porArea,false);
 const d=costoCatalogo(producto,config,{cantidad:10,tecnica:'dtf',ancho:MEDIDA_INICIAL,alto:MEDIDA_INICIAL,margen:3500});
 assert.equal(d.porArea,true);assert.equal(d.personalizacion,5000+500,'10 × 10 cm a $0.50/cm² + $5 de aplicado');
 const s=costoCatalogo(producto,config,{cantidad:10,tecnica:'serigrafia',margen:3500});
 assert.equal(s.personalizacion,null);assert.equal(s.costo,null);assert.equal(s.sugerido,null,'sin tarifa no inventa el costo');
});
test('sin costo de la prenda o sin margen no hay precio sugerido',()=>{
 const x=costoCatalogo({sku:'OTRA',tallas:['M'],colores:[]},config,{cantidad:5,margen:3500});
 assert.equal(x.prenda,null);assert.equal(x.sugerido,null);
 assert.equal(costoCatalogo(producto,config,{cantidad:5}).sugerido,null);
});
test('descripción propuesta',()=>{
 assert.equal(descripcionCatalogo({colorNombre:'Negro',tecnica:'bordado'}),'Negro · Bordado');
 assert.equal(descripcionCatalogo({colorNombre:'Blanco'}),'Blanco · Sin personalización');
});
