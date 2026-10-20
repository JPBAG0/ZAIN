import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import C from '../server/config-interno.cjs';
import Pub from '../js/config.js';
import {resolveInternal,projectPublic} from '../server/catalogo-gestion.mjs';
import {validateOrder} from '../server/pedidos.mjs';
// Alta del 20-oct-2026: seis gorras (solo bordado) y el chaleco acolchado; se publican ocultas.
const nuevos=['ZN-GO-002','ZN-GO-003','ZN-GO-004','ZN-GO-005','ZN-GO-006','ZN-GO-007','ZN-CE-002'];
const prod=sku=>C.productos.find(p=>p.sku===sku);
const color=id=>C.colores.find(c=>c.id===id);
const request=items=>({id:'12345678-1234-4123-8123-123456789abc',token:'a'.repeat(64),items,files:[]});
const activar=()=>resolveInternal(C,nuevos.map(sku=>({producto_id:prod(sku).id,version:1,cambios:{activo:true,proveedor:'Proveedor ficticio',sku_proveedor:'REF-'+sku}})));
const pedido=(p,cid,extra={})=>({p:p.id,colorId:cid,color:color(cid).nombre,tecnica:'Bordado',piezas:12,zona:p.zonas[0].nombre,cm:8,...extra});

test('las siete referencias nuevas existen ocultas con SKU propio y render en el sitio',()=>{
 for(const sku of nuevos){
  const p=prod(sku);assert.ok(p,sku);assert.equal(p.activo,false);assert.ok(p.catalogo2026);
  assert.deepEqual(p.tecnicas,['bordado']);assert.ok(readFileSync(new URL('../'+p.foto,import.meta.url)).length>1000);
  assert.ok(Pub.productosHistoricos.some(x=>x.sku===sku)&&!Pub.productos.some(x=>x.sku===sku));
 }
 assert.equal(C.productos.filter(p=>p.categoria==='Gorras'&&p.catalogo2026).length,6);
 assert.equal(prod('ZN-CE-002').categoria,'Chalecos');
});
test('gorras: frente y lateral con alto máximo; sin tallas y unitalla en las premium',()=>{
 for(const sku of nuevos.slice(0,6)){
  const p=prod(sku);assert.deepEqual(p.zonas.map(z=>z.id),['frente','lateral']);assert.deepEqual(p.tallas,[]);
  for(const z of p.zonas){assert.ok(z.orientativa&&z.maxAlto>0&&z.maxAlto<z.max);assert.ok(z.x>0&&z.x<1000&&z.y>0&&z.y<1000);}
 }
 for(const sku of ['ZN-GO-005','ZN-GO-006','ZN-GO-007'])assert.match(prod(sku).medidas,/58 cm/);
});
test('trucker: cada combinación tiene foto propia y muestra de dos tonos; las demás se tiñen',()=>{
 for(const sku of ['ZN-GO-004','ZN-GO-006']){
  const p=prod(sku);assert.deepEqual(Object.keys(p.fotosColor),p.colores);
  for(const f of Object.values(p.fotosColor))assert.ok(existsSync(new URL('../'+f,import.meta.url)),f);
  // el lateral va sobre la malla: color de malla para el contraste del logo y trama atenuada
  const lat=p.zonas.find(z=>z.id==='lateral');assert.equal(lat.superficie,'malla');assert.ok(lat.textura<1);
  for(const id of p.colores)assert.match(color(id).hexMalla,/^#[0-9a-f]{6}$/);
 }
 assert.equal(prod('ZN-GO-004').colores.length,4);assert.equal(prod('ZN-GO-006').colores.length,6);
 for(const sku of ['ZN-GO-002','ZN-GO-003','ZN-GO-005','ZN-GO-007']){const p=prod(sku);assert.ok(!p.fotosColor);assert.ok(p.colores.every(id=>!color(id).hex2));}
 assert.deepEqual([14,9,9,6],['ZN-GO-002','ZN-GO-003','ZN-GO-005','ZN-GO-007'].map(s=>prod(s).colores.length));
 for(const p of nuevos.map(prod))for(const id of p.colores){const c=color(id);assert.match(c.hex,/^#[0-9a-f]{6}$/);if(c.hex2)assert.match(c.hex2,/^#[0-9a-f]{6}$/);}
});
test('ni el catálogo público ni la proyección muestran proveedor, modelos o códigos de compra',()=>{
 const publica=projectPublic(Pub,activar(),[],'https://p.test');
 const nuevosPub=publica.productos.filter(p=>nuevos.includes(p.sku));assert.equal(nuevosPub.length,7);
 const texto=JSON.stringify([Pub.productosHistoricos.filter(p=>nuevos.includes(p.sku)),nuevosPub,Pub.colores.filter(c=>/^zn-(go-00[2-7]|ce-002)-/.test(c.id))]);
 assert.ok(!/00574|00579|00582|P8610|R77\d\d|8000U|X-?Flex|Farmer|Champion|Basic|\bRadian\b|Player|Proveedor ficticio|REF-ZN/i.test(texto));
 assert.ok(publica.categoriasCatalogo.includes('Gorras'));
 for(const p of nuevosPub.filter(p=>p.fotosColor))for(const f of Object.values(p.fotosColor))assert.match(f,/^img\/productos\/zain\/zn-go-00[46]-c\d\d\.webp$/);
});
test('pedido de gorra sin tallas valida color, zona y tamaño; guarda la referencia privada solo en snapshot',()=>{
 const cat=activar(),p=cat.productos.find(x=>x.sku==='ZN-GO-006');
 const out=validateOrder(request([pedido(p,p.colores[3])]),{catalogo:cat,snapshot:true}).items[0];
 assert.equal(out.sku,'ZN-GO-006');assert.equal(out.skuProveedor,'REF-ZN-GO-006');assert.equal(out.color,'Negro / Gris oxford');assert.match(out.detalleMedidas,/58 cm/);
 assert.equal(validateOrder(request([pedido(p,p.colores[0],{zona:'Lateral izquierdo',cm:5})]),{catalogo:cat}).items[0].zona,'Lateral izquierdo');
 for(const diff of [{cm:10.5},{zona:'Pecho izquierdo'},{tecnica:'DTF'},{colorId:'zn-go-004-c01'}])assert.throws(()=>validateOrder(request([pedido(p,p.colores[0],diff)]),{catalogo:cat}));
 assert.throws(()=>validateOrder(request([pedido(prod('ZN-GO-002'),prod('ZN-GO-002').colores[0])]),{catalogo:resolveInternal(C,[])}));
});
test('chaleco acolchado: tallas XS–2XL en cm, cinco colores y foto de modelo',()=>{
 const p=prod('ZN-CE-002');assert.deepEqual(p.tallas,['XS','S','M','L','XL','2XL']);assert.equal(p.colores.length,5);
 assert.deepEqual(p.tablaTallas.M,{ancho:55.88,largo:66.04});assert.ok(readFileSync(new URL('../'+p.fotoModelo,import.meta.url)).length>1000);
 const cat=activar(),q=cat.productos.find(x=>x.sku==='ZN-CE-002');
 const out=validateOrder(request([{...pedido(q,q.colores[0]),tallasDetalle:{M:6,L:6}}]),{catalogo:cat}).items[0];
 assert.deepEqual(out.tallasDetalle,{M:6,L:6});assert.throws(()=>validateOrder(request([{...pedido(q,q.colores[0]),tallasDetalle:{M:5}}]),{catalogo:cat}));
});
