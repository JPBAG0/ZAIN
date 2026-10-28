import test from 'node:test';
import assert from 'node:assert/strict';
import {inicial,configurar,generar,entrada,calcular,paraCliente} from '../js/cotizacion-core.js';
const bandas=[{tallas:['CH','M','G'],colores:['Blanco'],costo:7001},{tallas:['CH','M','G'],colores:['Azul marino'],costo:8002},{tallas:['EG'],colores:[],costo:9003}];
const item={sku:'ZN-PL-099',nombreZain:'Playera de prueba',color:'Blanco',tecnica:'DTF',piezas:3,tallasDetalle:{M:2,EG:1},tallas:'M 2 · EG 1',cm:10};
const cfg=()=>({...inicial(),activo:true,rangos:[{desde:1,hasta:null,margen:4000}],prendas:[{sku:item.sku,prenda:null,otros:10,bandas:structuredClone(bandas),fuente:'Lista privada de ejemplo'}],tecnicas:inicial().tecnicas.map(t=>({...t,tarifaCm2:5000,preparacion:101}))});
function listo(x=item,c=cfg()){const input=entrada(generar([x],c));input.impuesto=0;input.partidas[0].alto=500;return calcular([x],input);}
test('sumar cada talla con su costo exacto evita redondear el promedio antes de multiplicar',()=>{
 const q=listo(),p=q.partidas[0];assert.equal(p.costoPrendas,23005);assert.equal(p.aplicacion,25);assert.equal(p.costo,23211);assert.equal(p.sugerido,11783);assert.equal(p.preciosTalla[1].precio,15120);assert.equal(q.subtotal,38686);assert.equal(p.detalleCostosTalla[1].importe,9003);
});
test('la misma talla aplica la banda de color correspondiente y una talla grande su propia banda',()=>{
 assert.equal(listo({...item,color:'Azul marino'}).partidas[0].costoPrendas,25007);
 assert.equal(listo({...item,color:'Azul marino · 123'}).partidas[0].costoPrendas,25007);
});
test('talla, color o detalle faltantes dejan el costo pendiente; el precio manual permite publicar sin inventar costos',()=>{
 for(const x of [{...item,tallasDetalle:undefined},{...item,tallasDetalle:{}},{...item,tallasDetalle:{M:2,'2EG':1}},{...item,color:'Rojo'}]){
  const q=listo(x),v=entrada(q);v.partidas[0].precio=99999;const r=calcular([x],v);assert.equal(r.costo,null);assert.equal(r.utilidad,null);assert.equal(r.preparada,true);assert.equal(paraCliente(r).partidas[0].precio,99999);
  v.partidas[0].precio=null;assert.equal(calcular([x],v).preparada,false);
 }
});
test('cantidades por talla alteradas, fraccionarias o con distinta suma no calculan',()=>{
 for(const counts of [{M:2},{M:0,EG:3},{M:-1,EG:4},{M:1.5,EG:1.5},{M:Infinity}])assert.throws(()=>listo({...item,tallasDetalle:counts}));
});
test('cero en una banda es explícito y nulo sigue pendiente',()=>{
 const c=cfg();c.prendas[0].bandas.forEach(b=>b.costo=0);assert.equal(listo(item,c).partidas[0].costoPrendas,0);assert.equal(listo(item,c).preparada,true);
 c.prendas[0].bandas[0].costo=null;assert.equal(listo(item,c).preparada,false);
});
test('las bandas rechazan solapes, tallas repetidas y costos inválidos',()=>{
 for(const changed of [[...bandas,bandas[0]],[...bandas,{tallas:['M'],colores:[],costo:1}],[{tallas:['M','M'],colores:[],costo:1}],[{tallas:['M'],colores:[],costo:-1}]]){
  const c=cfg();c.prendas[0].bandas=changed;assert.throws(()=>configurar(c));
 }
});
test('guardar otro costo actual no cambia una cotización que conserva sus bandas',()=>{
 const q=listo(),c=cfg();c.prendas[0].bandas.forEach(b=>b.costo*=2);assert.notEqual(listo(item,c).costo,q.costo);assert.equal(calcular([item],entrada(q)).total,q.total);
});
test('la proyección al cliente mantiene una partida y excluye bandas, costos y fuente',()=>{
 const q=listo(),out=paraCliente(q);assert.equal(out.partidas.length,1);assert.equal(out.total,q.total);
 for(const key of ['bandas','detalleCostosTalla','modoPrenda','costoPrendas','fuente','costo','prenda'])assert.ok(!JSON.stringify(out).includes('"'+key+'"'));
});
test('tallas con distinto costo se cobran por grupo dentro de la misma partida',()=>{
 const x={...item,piezas:12,tallasDetalle:{CH:1,M:5,G:5,EG:1},tallas:'CH 1 · M 5 · G 5 · EG 1'},q=listo(x),p=q.partidas[0];
 assert.deepEqual(p.preciosTalla.map(g=>[g.tallas,g.piezas]),[['CH a G',11],['EG',1]]);
 assert.equal(p.precio,p.preciosTalla[0].precio);assert.equal(p.sugerido,p.preciosTalla[0].precio);
 assert.ok(p.preciosTalla[1].precio>p.precio);assert.equal(p.bruto,p.preciosTalla.reduce((n,g)=>n+g.importe,0));
 // El cobro por grupo cubre el costo con el margen pedido.
 assert.ok(q.margen>=3999);
 const out=paraCliente(q).partidas[0];assert.deepEqual(Object.keys(out.preciosTalla[0]).sort(),['importe','piezas','precio','tallas']);
});
// 27-oct-2026 (JP): el sugerido varía por talla, pero un precio escrito a mano es el mismo para todas.
test('el sugerido conserva la diferencia de tallas grandes; un precio escrito a mano es parejo',()=>{
 const x={...item,piezas:12,tallasDetalle:{M:11,EG:1},tallas:'M 11 · EG 1'},q=listo(x),v=entrada(q);
 assert.ok(q.partidas[0].preciosTalla[1].precio>q.partidas[0].preciosTalla[0].precio,'el sugerido cobra más la talla grande');v.partidas[0].precio=20000;
 const p=calcular([x],v).partidas[0];assert.deepEqual(p.preciosTalla,[]);assert.equal(p.bruto,12*20000);
 v.partidas[0].precio=0;assert.equal(calcular([x],v).partidas[0].importe,0,'precio 0: toda la partida en 0');
});
test('si todas las tallas cuestan igual queda un solo precio',()=>{
 const x={...item,piezas:3,tallasDetalle:{CH:1,M:2},tallas:'CH 1 · M 2'};assert.deepEqual(listo(x).partidas[0].preciosTalla,[]);assert.ok(!('preciosTalla' in paraCliente(listo(x)).partidas[0]));
});
