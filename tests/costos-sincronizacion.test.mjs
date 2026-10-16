import test from 'node:test';
import assert from 'node:assert/strict';
import {inicial,generar,calcular,entrada,paraCliente} from '../js/cotizacion-core.js';
import {sincronizarCostos,vincularCostos} from '../server/cotizacion-costos.mjs';
const items=[{sku:'TEST',nombre:'Prenda',tecnica:'Bordado',piezas:40,cm:10,logoGeometria:{anchoPx:1000,altoPx:400,anchoCm:10},color:'Negro',tallasDetalle:{M:40}}];
const cfg=(version=1)=>({version,datos:{...inicial(),activo:false,prendas:[{sku:'TEST',prenda:10000,otros:0}],tecnicas:inicial().tecnicas.map(t=>({...t,tarifaCm2:10000,preparacion:0}))}});
test('costos vinculados siguen prendas y tarifas del panel, conservando precio, descuento y medidas',()=>{
 const c=cfg(),old=vincularCostos(generar(items,c.datos),1),v=entrada(old);v.partidas[0].precio=25000;v.partidas[0].descuento=1000;v.partidas[0].alto=600;v.impuesto=0;
 const manual={...calcular(items,v),origenCostos:old.origenCostos},next=cfg(2);next.datos.prendas[0].prenda=12000;next.datos.tecnicas[0].tarifaCm2=20000;
 const q=sincronizarCostos(items,manual,next),p=q.partidas[0];assert.equal(p.prenda,12000);assert.equal(p.tarifaCm2,20000);assert.equal(p.alto,600);assert.equal(p.aplicacion,12000);assert.equal(p.precioManual,25000);assert.equal(p.descuento,1000);assert.equal(q.origenCostos.version,2);
 assert.deepEqual(sincronizarCostos(items,q,next),q);
 const pub=JSON.stringify(paraCliente(q));assert.ok(!/origenCostos|tarifaCm2|12000|anchoPx/.test(pub));
});
test('un costo propio revisado permanece mientras los demás costos vinculados sí se actualizan',()=>{
 const c=cfg(),old=vincularCostos(generar(items,c.datos),1),v=entrada(old);v.partidas[0].tarifaCm2=30000;v.partidas[0].otros=100;v.partidas[0].margenObjetivo=4700;
 const q={...calcular(items,v),origenCostos:old.origenCostos},next=cfg(2);next.datos.prendas[0].prenda=13000;next.datos.tecnicas[0].tarifaCm2=20000;
 const out=sincronizarCostos(items,q,next).partidas[0];assert.equal(out.tarifaCm2,30000);assert.equal(out.prenda,13000);assert.equal(out.otros,100);assert.equal(out.margenObjetivo,4700);
});
test('borrador histórico recupera tarifa y bandas sin repetir captura ni inventar precio faltante',()=>{
 const c=cfg(),empty={...inicial(),activo:false},old=generar(items,empty);old.partidas[0].alto=550;old.partidas[0].descuento=500;
 c.datos.prendas[0]={sku:'TEST',prenda:null,otros:0,bandas:[{tallas:['M'],colores:['Negro'],costo:12345}]};c.datos.tecnicas[0].tarifaCm2=20000;
 const q=sincronizarCostos(items,old,c),p=q.partidas[0];assert.equal(p.modoPrenda,'tallas');assert.equal(p.costoPrendas,12345*40);assert.equal(p.tarifaCm2,20000);assert.equal(p.alto,550);assert.equal(p.descuento,500);
 const pending=cfg(2);pending.datos.prendas[0].prenda=null;const out=sincronizarCostos(items,vincularCostos(generar(items,cfg().datos),1),pending);assert.equal(out.partidas[0].costoPrendas,null);assert.equal(out.preparada,false);
});
test('bandas por talla vinculadas se actualizan, pero una banda revisada manualmente se conserva',()=>{
 const c=cfg();c.datos.prendas[0]={sku:'TEST',prenda:null,otros:0,bandas:[{tallas:['M'],colores:[],costo:10000}]};const old=vincularCostos(generar(items,c.datos),1),next=structuredClone(c);next.version=2;next.datos.prendas[0].bandas[0].costo=11000;
 assert.equal(sincronizarCostos(items,old,next).partidas[0].costoPrendas,440000);
 const v=entrada(old);v.partidas[0].bandas[0].costo=9000;const manual={...calcular(items,v),origenCostos:old.origenCostos};assert.equal(sincronizarCostos(items,manual,next).partidas[0].costoPrendas,360000);
});
