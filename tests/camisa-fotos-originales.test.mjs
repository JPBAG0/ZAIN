import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import C from '../server/config-interno.cjs';
import Pub from '../js/config.js';
import {resolveInternal,projectPublic} from '../server/catalogo-gestion.mjs';
import {validateOrder} from '../server/pedidos.mjs';
const source=C.productos.find(p=>p.sku==='ZN-CM-016');
const editions=[{producto_id:source.id,version:1,cambios:{activo:true,proveedor:'PROVEEDOR INTERNO FICTICIO',sku_proveedor:'MODELO INTERNO FICTICIO'}}];
const cat=resolveInternal(C,editions),p=cat.productos.find(p=>p.sku===source.sku);
const request=items=>({id:'12345678-1234-4123-8123-123456789abc',token:'a'.repeat(64),items,files:[]});
const item=(cid,talla)=>({p:p.id,colorId:cid,color:cat.colores.find(c=>c.id===cid).nombre,tecnica:'Bordado',piezas:12,tallasDetalle:{[talla]:12},zona:'Pecho izquierdo',cm:8});

test('camisa utilitaria: siete fotografías por color, tallas verificadas y activación privada',()=>{
 assert.equal(source.activo,false);
 assert.equal(source.imagenIA,false);assert.equal(source.gramaje,140);
 assert.deepEqual(source.tallas,['XS','S','M','L','XL','2XL']);assert.deepEqual(source.tecnicas,['bordado']);
 assert.equal(source.colores.length,7);assert.deepEqual(Object.keys(source.fotosColor),source.colores);
 assert.equal(new Set(Object.values(source.fotosColor)).size,7);
 for(const file of Object.values(source.fotosColor)){assert.match(file,/^img\/productos\/zain\/zn-cm-016-c\d{2}\.webp$/);assert.ok(existsSync(new URL('../'+file,import.meta.url)));}
 assert.equal(source.foto,source.fotosColor[source.colores[0]]);
 assert.deepEqual(source.zonas.map(z=>z.nombre),['Pecho izquierdo','Pecho derecho']);
});

test('proyección pública de camisa conserva fotos y SKU propios sin información de compras',()=>{
 const result=projectPublic(Pub,cat,[],'https://fixture.invalid');const pub=result.productos.find(p=>p.sku===source.sku&&p.id===source.id);
 assert.ok(pub);assert.deepEqual(pub.fotosColor,source.fotosColor);assert.equal(pub.nombre,'Camisa utilitaria manga larga · Unisex');
 assert.equal(result.productos.filter(p=>p.sku===source.sku).length,1);
 for(const value of [pub,Pub.productosHistoricos.find(p=>p.sku===source.sku)]){
  assert.ok(!/playery|proveedorCompras|skuProveedor|INTERNO FICTICIO/i.test(JSON.stringify(value)));
 }
 assert.ok(!/playery/i.test(readFileSync(new URL('../js/config.js',import.meta.url),'utf8')));
});

test('42 combinaciones de talla/color validan; compras solo se guardan en snapshot interno',()=>{
 for(const cid of p.colores)for(const talla of p.tallas){
  const output=validateOrder(request([item(cid,talla)]),{catalogo:cat,snapshot:true}).items[0];
  assert.equal(output.sku,'ZN-CM-016');assert.equal(output.skuProveedor,'MODELO INTERNO FICTICIO');assert.deepEqual(output.tallasDetalle,{[talla]:12});
  const normal=validateOrder(request([item(cid,talla)]),{catalogo:cat}).items[0];assert.equal(normal.skuProveedor,undefined);
 }
 for(const patch of [{tecnica:'DTF'},{colorId:'zn-po-008-c01'},{tallasDetalle:{3:12}},{cm:9.5},{zona:'Espalda'}])assert.throws(()=>validateOrder(request([{...item(p.colores[0],'M'),...patch}]),{catalogo:cat}));
 const right={...item(p.colores[0],'M'),zona:'Pecho derecho'};assert.equal(validateOrder(request([right]),{catalogo:cat}).items[0].zona,'Pecho derecho');
 assert.throws(()=>validateOrder(request([item(p.colores[0],'M')]),{catalogo:C}));
});
