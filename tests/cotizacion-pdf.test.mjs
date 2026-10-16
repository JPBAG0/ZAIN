import test from 'node:test';
import assert from 'node:assert/strict';
import {datosPDF} from '../js/cotizacion-pdf.js';
import {documento} from '../js/cotizacion-vista.js';
test('PDF del borrador usa solo campos comerciales sin serializar costos o referencias de compras',()=>{
 const q={destinatario:'Niño y niña',total:15000,costo:987654321,margen:4000,origenCostos:{version:8},proveedor:'PRIVADO',partidas:[{indice:0,sku:'ZN-PL-004',nombre:'Prenda de prueba',precio:15000,importe:15000,piezas:1,skuProveedor:'PROVEEDOR-TEST',tarifaCm2:20000,costoPrendas:10000,bandas:[{costo:10000}]}]};
 const out=datosPDF(q);assert.equal(out.destinatario,'Niño y niña');assert.equal(out.total,15000);assert.equal(out.partidas[0].sku,'ZN-PL-004');
 for(const key of ['costo','margen','origenCostos','proveedor'])assert.ok(!(key in out));for(const key of ['skuProveedor','tarifaCm2','costoPrendas','bandas'])assert.ok(!(key in out.partidas[0]));assert.ok(!JSON.stringify(out).includes('PRIVADO'));
});
test('un render que falló muestra reintento y no se presenta una prenda de referencia como diseño del cliente',()=>{
 globalThis.window={ZAIN:{productos:[{sku:'TEST',foto:'https://example.test/modelo.png'}]}};
 const h=documento({partidas:[{indice:0,sku:'TEST',nombre:'Prenda',piezas:1}],bruto:null,total:null},{imagenes:{0:{error:true}}});
 assert.match(h,/Actualiza para reintentar/);assert.ok(!h.includes('modelo.png'));assert.ok(!h.includes('Preparando diseño'));delete globalThis.window;
});
