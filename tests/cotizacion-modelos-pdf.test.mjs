import test from 'node:test';
import assert from 'node:assert/strict';
import {adaptarModelos} from '../js/cotizacion-modelos-pdf.js';
test('membrete existente recibe precios por talla sin inventar piezas ni total',()=>{
 const filas=Array.from({length:13},(_,i)=>({modelo:0,nombre:'Modelo',sku:'ZN-TEST',tallas:'Talla '+i,color:'Todos los colores',volumen:'',personalizacion:'Bordado',zona:'Pecho izquierdo',medidas:'8 × 4 cm',precio:10000+i,costo:123456,proveedor:'PRIVADO'}));
 const a=adaptarModelos({destinatario:'Ejemplo',impuesto:1600,partidas:filas,cargo:{concepto:'Ponchado',importe:25000},notas:'Condiciones'},[{src:'data:image/png;base64,AAAA',nota:'Vista negra'}]);
 assert.equal(a.cotizacion.partidas.length,3);assert.equal(a.cotizacion.partidas.flatMap(p=>p.preciosTalla).length,13);
 assert.ok(a.cotizacion.partidas.every(p=>p.piezas===null&&p.importe===null));
 assert.equal(a.cotizacion.total,null);assert.equal(a.cotizacion.cargos.length,1);assert.equal(Object.keys(a.imagenes).length,3);
 assert.ok(!JSON.stringify(a).includes('PRIVADO'));assert.ok(!JSON.stringify(a).includes('123456'));
});
test('cada modelo conserva su propio diseño y sus referencias de talla, color y compra',()=>{
 const fila={tallas:'XS a XL',color:'Negro',volumen:'1–49 piezas',personalizacion:'Solo prenda',precio:10000};
 const a=adaptarModelos({partidas:[{...fila,modelo:0,nombre:'A',sku:'A'},{...fila,modelo:1,nombre:'B',sku:'B'}],impuesto:0},[{src:'A',nota:'Vista A'},{src:'B',nota:'Vista B'}]);
 assert.equal(a.imagenes[1].src,'B');assert.equal(a.imagenes[0].referencia,true);
 assert.match(a.cotizacion.partidas[0].preciosTalla[0].tallas,/XS a XL.*Negro.*1–49 piezas/);
});
