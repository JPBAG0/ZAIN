import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import C from '../server/config-interno.cjs';
import Pub from '../js/config.js';
import {resolveInternal,projectPublic} from '../server/catalogo-gestion.mjs';
import {validateOrder} from '../server/pedidos.mjs';
import {inicial,configurar,generar,calcular,entrada,paraCliente} from '../js/cotizacion-core.js';
const keep=new Set(['ZN-PL-004','ZN-PL-005']);
const edits=C.productos.map(p=>({producto_id:p.idPublico||p.id,version:1,cambios:{activo:p.catalogo2026||keep.has(p.sku)||p.grupo==='bolsas',...(p.catalogo2026?{proveedor:'Proveedor ficticio',sku_proveedor:'REF-PRIVADA-'+p.sku}: {})}}));
const cat=resolveInternal(C,edits),publica=projectPublic(Pub,cat,[],'https://p.test');
const request=items=>({id:'12345678-1234-4123-8123-123456789abc',token:'a'.repeat(64),items,files:[]});
const selection=(p,cid,talla)=>({p:p.id,colorId:cid,color:cat.colores.find(c=>c.id===cid).nombre,tecnica:cat.tecnicas.find(t=>t.id===p.tecnicas[0]).nombre,piezas:5,tallasDetalle:{[talla]:5},zona:p.zonas[0].nombre,cm:8});
test('gama nueva conserva premium y13bolsas, publica38 referencias (incluye gorras, chaleco y camisa utilitaria) y mantiene29 históricas',()=>{
 assert.equal(publica.productos.length,38);assert.equal(publica.productosHistoricos.length,29);assert.equal(publica.productos.filter(p=>p.catalogo2026).length,23);assert.equal(publica.productos.filter(p=>p.grupo==='bolsas').length,13);assert.equal(publica.muestrasPortada.length,7);
 assert.ok([...keep].every(sku=>publica.productos.some(p=>p.sku===sku)));
 assert.equal(new Set([...publica.productos,...publica.productosHistoricos].map(p=>p.sku)).size,67);
 for(const m of publica.muestrasPortada){const p=publica.productos.find(p=>p.id===m.p);assert.ok(p&&p.colores.includes(m.c)&&p.tecnicas.includes(m.t));}
 assert.ok(publica.categoriasCatalogo.includes('Chalecos'));
});
test('configuración y proyección pública excluyen nuevos datos de compras',()=>{
 for(const text of [JSON.stringify(Pub),JSON.stringify(publica)])assert.ok(!/Proveedor ficticio|REF-PRIVADA|skuProveedor|proveedorCompras|Playerytees|Wusstek/i.test(text));
 for(const p of publica.productos.filter(p=>p.catalogo2026)){assert.match(p.foto,/img\/productos\/zain\/zn-/);assert.ok(readFileSync(new URL('../'+p.foto,import.meta.url)).length>1000);assert.ok(!p.fabricante);}
 assert.equal(publica.productos.filter(p=>p.catalogo2026&&p.fotoModelo).length,12);
});
test('todas las variantes nuevas guardan talla/color canónicos y referencia privada solo en snapshot',()=>{
 for(const p of cat.productos.filter(p=>p.catalogo2026))for(const cid of p.colores)for(const talla of p.tallas){
  const out=validateOrder(request([{...selection(p,cid,talla),composicion:'FALSA',gramaje:999,sku:'OTRO'}]),{catalogo:cat,snapshot:true}).items[0];
  assert.equal(out.sku,p.sku);assert.equal(out.skuProveedor,'REF-PRIVADA-'+p.sku);assert.equal(out.composicion,p.composicionColor[cid]||p.composicion);assert.deepEqual(out.tallasDetalle,{[talla]:5});assert.equal(out.gramaje,p.gramaje);
 }
});
test('rechaza color, talla, técnica y cantidades ajenas; ocultar nueva referencia bloquea altas',()=>{
 const p=cat.productos.find(p=>p.catalogo2026),item=selection(p,p.colores[0],'M');
 for(const diff of [{colorId:'otro'},{tallasDetalle:{XXXX:5}},{tallasDetalle:{M:4}},{tecnica:'Técnica inventada'}])assert.throws(()=>validateOrder(request([{...item,...diff}]),{catalogo:cat}));
 const hidden=structuredClone(cat);hidden.productos.find(x=>x.id===p.id).activo=false;assert.throws(()=>validateOrder(request([item]),{catalogo:hidden}));
});
const bands=[{tallas:['S','M'],colores:[],desdePiezas:1,hastaPiezas:11,costo:10000},{tallas:['S','M'],colores:[],desdePiezas:12,hastaPiezas:119,costo:8000},{tallas:['S','M'],colores:[],desdePiezas:121,hastaPiezas:null,costo:6000}];
const pricing=()=>({...inicial(),activo:true,rangos:[{desde:1,hasta:null,margen:4000}],prendas:[{sku:'ZN-CH-002',prenda:null,otros:0,bandas:structuredClone(bands)}],tecnicas:inicial().tecnicas.map(t=>({...t,tarifaCm2:0}))});
const order=n=>({sku:'ZN-CH-002',nombreZain:'Modelo de prueba',tecnica:'Bordado',color:'Negro',piezas:n,tallasDetalle:{M:n},cm:8});
function quote(n){const item=order(n),v=entrada(generar([item],pricing()));v.partidas[0].alto=500;v.impuesto=0;return calcular([item],v);}
test('cantidad por partida elige tramo de compra y deja borde ambiguo pendiente',()=>{
 for(const [n,cost] of [[1,10000],[11,10000],[12,8000],[119,8000],[121,6000],[9999,6000]])assert.equal(quote(n).partidas[0].costoPrendas,n*cost);
 const q=quote(120);assert.equal(q.preparada,false);assert.equal(q.costo,null);assert.throws(()=>paraCliente(q));
 const v=entrada(q);v.partidas[0].modoPrenda='unitario';v.partidas[0].prenda=7000;assert.equal(calcular([order(120)],v).costo,840000);
});
test('no agrega partidas distintas para alcanzar descuento de compra por cantidad',()=>{
 const q=generar([order(6),order(6)],pricing());assert.deepEqual(q.partidas.map(p=>p.costoPrendas),[60000,60000]);
});
test('solapes de cantidad se rechazan; campos de rango se conservan en borrador privado',()=>{
 const c=pricing();c.prendas[0].bandas[1].desdePiezas=11;assert.throws(()=>configurar(c));
 const q=quote(12);assert.equal(entrada(q).partidas[0].bandas[1].desdePiezas,12);assert.equal(calcular([order(12)],entrada(q)).total,q.total);
 assert.ok(!JSON.stringify(paraCliente(q)).includes('desdePiezas'));
});

test('modelos 2026: el pedido guarda colorId y una partida guardada sin colorId se acepta por el nombre del color',async()=>{
  const {validateOrder}=await import('../server/pedidos.mjs');const C=(await import('../server/config-interno.cjs')).default;
  const p=[...C.productos,...C.productosHistoricos].find(x=>x.sku==='ZN-PO-013'),col=C.colores.find(c=>c.id===p.colores[0]);
  const base={p:p.id,color:col.nombre,tecnica:'Bordado',piezas:2,tallasDetalle:{M:2},zona:'Pecho izquierdo',cm:8,tieneLogo:false,tieneRender:false};
  const body=x=>({id:'12345678-1234-4123-8123-123456789abc',token:'a'.repeat(64),items:[x],files:[]});
  assert.equal(validateOrder(body({...base,colorId:col.id}),{allowHistoricos:true,snapshot:true}).items[0].colorId,col.id);
  assert.equal(validateOrder(body(base),{allowHistoricos:true,snapshot:true}).items[0].colorId,col.id);
  assert.throws(()=>validateOrder(body({...base,colorId:'zn-po-011-c01'}),{allowHistoricos:true,snapshot:true}),/Color de producto inválido/);
  assert.throws(()=>validateOrder(body({...base,color:'Morado'}),{allowHistoricos:true,snapshot:true}),/Color de producto inválido/);
});
