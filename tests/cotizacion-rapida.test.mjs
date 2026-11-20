// Cotización rápida (JP, 20-nov-2026): partidas libres con cantidad, precio y descuento escritos a mano.
import test from 'node:test';
import assert from 'node:assert/strict';
import {comercialRapida,documentoRapida,textosPDF,textoRapida,importeLinea,normalizarTextos,TEXTOS} from '../js/cotizacion-rapida.js';
const termo={concepto:'Termo de acero 500 ml',descripcion:'Tampografía a 1 tinta',cantidad:100,precio:8500,descuento:1000,costo:5200};
const taza={concepto:'Taza de cerámica 11 oz',descripcion:'Tampografía a 1 tinta',cantidad:50,precio:6000,descuento:0};

test('importes, descuento, cargo, IVA y total en centavos',()=>{
 assert.equal(importeLinea(termo),765000);assert.equal(importeLinea({...taza,cantidad:null}),null);
 const q=comercialRapida([termo,taza],{folio:'COT-0100',destinatario:'Cafetería',impuesto:1600,anticipo:5000,concepto:'Pantalla de tampografía',cargo:35000,vigencia:'2026-12-05'});
 assert.equal(q.tipo,'rapida');assert.equal(q.bruto,850000+300000);assert.equal(q.descuento,85000);
 assert.equal(q.subtotal,765000+300000+35000);assert.equal(q.impuestos,176000);assert.equal(q.total,1100000+176000);
 assert.deepEqual(q.partidas.map(p=>p.importe),[765000,300000]);assert.equal(q.cargos[0].concepto,'Pantalla de tampografía');
 assert.ok(!JSON.stringify(q).includes('5200'),'el costo privado no sale en lo comercial');
});

test('sin cantidad la partida es precio por pieza y la cotización queda sin total',()=>{
 const q=comercialRapida([{...termo,cantidad:null},taza],{impuesto:0});
 assert.equal(q.partidas[0].piezas,null);assert.equal(q.partidas[0].importe,null);assert.equal(q.total,null);assert.equal(q.subtotal,null);
 const d=documentoRapida(q);assert.equal(d.partidas[0].piezas,null);assert.equal(d.partidas[0].precio,8500);assert.equal(d.envio,null);
});

test('valida concepto, cantidad, descuento, IVA y número de partidas',()=>{
 assert.throws(()=>comercialRapida([]),/al menos una partida/);
 assert.throws(()=>comercialRapida([{...termo,concepto:'  '}]),/concepto/);
 assert.throws(()=>comercialRapida([{...termo,cantidad:1.5}]),/cantidad/);
 assert.throws(()=>comercialRapida([{...termo,descuento:12000}]),/descuento/);
 assert.throws(()=>comercialRapida([termo],{impuesto:null}),/IVA/);
 assert.throws(()=>comercialRapida(Array.from({length:21},()=>taza)),/20 partidas/);
});

test('documento para el PDF: la descripción va como subtítulo y no hay chips de catálogo',()=>{
 const d=documentoRapida(comercialRapida([termo],{impuesto:1600,anticipo:5000}),{publicada_at:'2026-11-20T18:00:00Z'});
 assert.deepEqual(d.partidas[0],{indice:0,sku:'',nombre:'Termo de acero 500 ml',color:'Tampografía a 1 tinta',tecnica:'',zona:'',cm:'',tallas:'',piezas:100,precio:8500,descuento:1000,importe:765000});
 assert.deepEqual(d.pagos,{anticipo:5000,instrucciones:''});assert.equal(d.publicada_at,'2026-11-20T18:00:00Z');
});

test('textos del PDF editables; títulos vacíos regresan a los de siempre',()=>{
 assert.deepEqual(normalizarTextos({}),TEXTOS);
 const t=normalizarTextos({titulo1:'Hola Cafetería,',titulo2:'  ',notas:'Precios sujetos a existencia.\n\nEntrega en Guadalajara.',pasos:false});
 assert.equal(t.titulo1,'Hola Cafetería,');assert.equal(t.titulo2,TEXTOS.titulo2);assert.equal(t.pasos,false);
 const p=textosPDF({textos:t,impuesto:1600,anticipo:5000,plazo:'8 días'});
 assert.equal(p.pasos,null);assert.deepEqual(p.notas,['Precios sujetos a existencia.','Entrega en Guadalajara.']);assert.equal(p.sinEnvio,true);assert.match(p.etiqueta,/más IVA/);
 assert.equal(textosPDF({textos:{},impuesto:0,anticipo:null}).pasos.length,4);
});

test('texto para copiar con partidas, descuento y total',()=>{
 const x=textoRapida(comercialRapida([termo,taza],{folio:'COT-0100',destinatario:'Cafetería',impuesto:1600,anticipo:5000}));
 assert.match(x,/COT-0100/);assert.match(x,/100 pzas × \$85\.00 − 10% = \$7,650\.00/);assert.match(x,/Total: \$12,354\.00/);assert.match(x,/Anticipo 50%/);
});
