import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import C from '../server/config-interno.cjs';
import {configurar,inicial} from '../js/cotizacion-core.js';
// Catálogo → Prendas (22-nov-2026): parecidas de distintos proveedores y costo por pieza según la cantidad.
const ventana={};vm.runInNewContext(readFileSync(new URL('../js/catalogo-parecidas.js',import.meta.url),'utf8'),{window:ventana});
const P=ventana.ZAINParecidas;

test('cada prenda está en un solo grupo de parecidas y los grupos solo usan SKU que existen',()=>{
 const skus=new Set(C.productos.map(p=>p.sku)),vistos=new Map();
 for(const [grupo,lista] of Object.entries(P.GRUPOS))for(const sku of lista){
  assert.ok(skus.has(sku),grupo+': '+sku+' no existe');
  assert.ok(!vistos.has(sku),sku+' está en '+vistos.get(sku)+' y en '+grupo);vistos.set(sku,grupo);
 }
 for(const p of C.productos)if(p.categoria!=='Bolsas')assert.ok(vistos.has(p.sku),p.sku+' ('+p.nombre+') no tiene grupo');
 assert.equal(P.grupoDe({sku:'ZN-BO-001',categoria:'Bolsas'}),'Bolsas');
 assert.equal(P.grupoDe({sku:'ZN-XX-999',categoria:'Playeras'}),'Playeras');
});
test('los grupos juntan prendas de distintas categorías cuando son casi iguales',()=>{
 assert.equal(P.grupoDe({sku:'ZN-CH-009'}),'Chaleco softshell');assert.equal(P.grupoDe({sku:'ZN-CE-001'}),'Chaleco softshell');
 assert.equal(P.grupoDe({sku:'ZN-DE-004'}),'Playera deportiva');assert.equal(P.grupoDe({sku:'ZN-PL-008'}),'Playera deportiva');
 for(const sku of ['ZN-CH-009','ZN-CH-010'])assert.equal(C.productos.find(p=>p.sku===sku).categoria,'Chalecos',sku);
});
test('el costo por pieza toma el tramo de la cantidad y la talla más barata, más otros',()=>{
 const c={sku:'ZN-PL-012',prenda:null,otros:100,bandas:[
  {tallas:['S','M','L','XL'],colores:[],costo:7622,desdePiezas:1,hastaPiezas:11},{tallas:['S','M','L','XL'],colores:[],costo:5326,desdePiezas:12,hastaPiezas:35},{tallas:['S','M','L','XL'],colores:[],costo:4806,desdePiezas:36,hastaPiezas:null},
  {tallas:['2XL'],colores:[],costo:9471,desdePiezas:1,hastaPiezas:11},{tallas:['2XL'],colores:[],costo:6781,desdePiezas:12,hastaPiezas:null}]};
 assert.equal(P.costoPara(c,1),7722);assert.equal(P.costoPara(c,12),5426);assert.equal(P.costoPara(c,500),4906);
 assert.deepEqual(JSON.parse(JSON.stringify(P.tramos(c).map(t=>[t.desde,t.hasta,t.costo,t.mayor]))),[[1,11,7722,9571],[12,35,5426,6881],[36,null,4906,6881]]);
 // Sin tramos de cantidad (lista publicista): vale para cualquier cantidad.
 const sin={sku:'X',prenda:null,otros:0,bandas:[{tallas:['S'],colores:[],costo:5092},{tallas:['2XL'],colores:[],costo:6269}]};
 assert.equal(P.costoPara(sin,1),5092);assert.equal(P.costoPara(sin,999),5092);
 // Costo fijo y prendas sin costo.
 assert.equal(P.costoPara({sku:'G',prenda:3944,otros:0},50),3944);
 assert.equal(P.costoPara({sku:'G',prenda:null,otros:0},50),null);assert.equal(P.costoPara(undefined,50),null);
 // Un hueco entre tramos (120 piezas en una lista 12–119 / 121+) no inventa costo.
 const hueco={sku:'W',prenda:null,otros:0,bandas:[{tallas:[],colores:[],costo:30013,desdePiezas:12,hastaPiezas:119},{tallas:[],colores:[],costo:23581,desdePiezas:121,hastaPiezas:null}]};
 assert.equal(P.costoPara(hueco,120),null);assert.equal(P.costoPara(hueco,121),23581);
});
test('los costos por talla y cantidad de una prenda pasan la validación del cotizador',()=>{
 const prenda={sku:'ZN-PL-014',prenda:null,otros:0,fuente:'Lista de prueba',bandas:[
  {tallas:['XS','S','M','L','XL'],colores:[],costo:12302,desdePiezas:1,hastaPiezas:11},{tallas:['XS','S','M','L','XL'],colores:[],costo:7751,desdePiezas:12,hastaPiezas:35},
  {tallas:['2XL'],colores:[],costo:14954,desdePiezas:1,hastaPiezas:11},{tallas:['2XL'],colores:[],costo:9420,desdePiezas:12,hastaPiezas:null}]};
 const datos=configurar({...inicial(),prendas:[prenda]});
 assert.equal(datos.prendas[0].bandas.length,4);assert.equal(P.costoPara(datos.prendas[0],24),7751);
});
