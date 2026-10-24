import test from 'node:test';
import assert from 'node:assert/strict';
import {inicial,configurar,generar} from '../js/cotizacion-core.js';
// 24-oct-2026: los talleres cobran bordado y serigrafía fijo por pieza; el DTF, película por cm² más aplicado.
const cfg=()=>{const c=inicial();c.prendas=[{sku:'ZN-PO-008',prenda:14427,otros:100}];c.tecnicas=[{tecnica:'Bordado',tarifaCm2:0,preparacion:25000,porPieza:5000},{tecnica:'Serigrafía',tarifaCm2:0,preparacion:20000,porPieza:4000},{tecnica:'DTF',tarifaCm2:25862,preparacion:0,porPieza:1500}];return c;};
const item=(tecnica)=>({sku:'ZN-PO-008',tecnica,piezas:20,cm:9,talla:'M',color:'negro'});
test('el costo fijo por pieza de la técnica se conserva y se suma a Otros',()=>{
 assert.deepEqual(configurar(cfg()).tecnicas.map(t=>t.porPieza),[5000,4000,1500]);
 for(const [tec,fijo] of [['Bordado',5000],['Serigrafía',4000],['DTF',1500]])assert.equal(generar([item(tec)],cfg()).partidas[0].otros,100+fijo,tec);
 assert.equal(generar([{...item('Solo prenda')}],cfg()).partidas[0].otros,100);
});
test('sin costo fijo capturado la técnica sigue igual que antes',()=>{
 const c=cfg();c.tecnicas=c.tecnicas.map(({porPieza,...t})=>t);
 assert.ok(configurar(c).tecnicas.every(t=>!('porPieza' in t)));assert.equal(generar([item('Bordado')],c).partidas[0].otros,100);
});
