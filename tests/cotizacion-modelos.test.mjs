import test from 'node:test';
import assert from 'node:assert/strict';
import {filasModelo,precioFila,aplicacionArea,comercial,textoComercial} from '../js/cotizacion-modelos.js';
const producto={sku:'ZN-TEST',tallas:['XS','S','M','L','XL','2XL'],colores:['Negro','Blanco']};
const cfg=bandas=>({prendas:[{sku:'ZN-TEST',prenda:null,otros:100,bandas}]});
test('agrupa tallas consecutivas y muestra todos los tramos sin pedir cantidades',()=>{
 const bandas=[{tallas:['XS','S','M','L','XL'],colores:[],costo:10000},{tallas:['2XL'],colores:[],costo:12000}];
 const filas=filasModelo(producto,cfg(bandas));assert.equal(filas.length,2);assert.equal(filas[0].talla,'XS a XL');assert.equal(filas[1].talla,'2XL');assert.equal(filas[0].volumen,'');
});
test('conserva colores y huecos de volumen como pendientes en vez de elegir una tarifa',()=>{
 const filas=filasModelo(producto,cfg([{tallas:[],colores:['Negro'],costo:10000,desdePiezas:1,hastaPiezas:119},{tallas:[],colores:['Negro'],costo:9000,desdePiezas:121,hastaPiezas:null}]));
 assert.equal(filas.find(f=>f.desde===120&&f.color==='Todos los colores').costo,null);
 assert.equal(filas.find(f=>f.desde===121&&f.color==='Negro').costo,9000);
 assert.ok(filas.filter(f=>f.color==='Blanco').every(f=>f.costo===null));
});
test('unitalla, cero explícito y modelo sin costos',()=>{
 assert.equal(filasModelo({sku:'X',tallas:[]},{prendas:[{sku:'X',prenda:0,otros:0} ]})[0].costo,0);
 assert.equal(filasModelo({sku:'X',tallas:[]},{prendas:[]})[0].talla,'Unitalla');
 assert.equal(filasModelo({sku:'X',tallas:[]},{prendas:[]})[0].costo,null);
});
test('margen bruto, redondeo exacto, precio directo y utilidad negativa',()=>{
 assert.equal(precioFila({costo:10000},{margen:4000}).precio,16667);
 assert.equal(precioFila({costo:10000},{margen:3000}).precio,14286);
 assert.equal(precioFila({costo:10000},{precio:9000}).utilidad,-1000);
 assert.equal(precioFila({costo:null},{precio:20000}).precio,20000);
 assert.equal(precioFila({costo:null},{precio:20000}).utilidad,null);
 assert.throws(()=>precioFila({costo:10000},{margen:10000}));
 assert.throws(()=>precioFila({costo:10000},{precio:NaN}));
});
test('área coincide con el motor en centavos y no inventa una dimensión pendiente',()=>{
 assert.equal(aplicacionArea(1000,500,25862),130);
 assert.equal(aplicacionArea(1000,null,25862),null);
 assert.equal(precioFila({costo:10000},{margen:3000,aplicacion:null}).precio,null);
});
test('exportación exige IVA y precio, cobra preparación una vez y excluye datos privados',()=>{
 const modelo={nombre:'Modelo',sku:'ZN-TEST',proveedor:'SECRETO',aplicacion:0,filas:[{talla:'S a XL',color:'Todos',volumen:'',costo:10000,otros:0,margen:4000,precio:null,fuente:'PRIVADA'},{talla:'2XL',costo:null,incluir:false}]};
 assert.throws(()=>comercial([modelo]));
 const q=comercial([modelo],{impuesto:1600,cargo:25000,concepto:'Ponchado logo'});
 assert.equal(q.partidas[0].precio,16667);assert.equal(q.cargo.importe,25000);
 const salida=JSON.stringify(q)+textoComercial(q);
 for(const k of ['SECRETO','PRIVADA','costo','margen','bandas','utilidad'])assert.ok(!salida.includes(k));
 assert.ok(!salida.includes('cantidad:'));assert.throws(()=>comercial([{...modelo,filas:[{...modelo.filas[0],margen:null}]}],{impuesto:0}));
});
