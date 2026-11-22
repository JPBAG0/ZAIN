import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import C from '../server/config-interno.cjs';
import Pub from '../js/config.js';
import {normalizeChanges,resolveInternal} from '../server/catalogo-gestion.mjs';
import {createHandler,validateOrder} from '../server/pedidos.mjs';
// Catálogo mayoreo en Gestión (22-nov-2026): 98 prendas con render de Codex, ocultas en la página y «solo para cotizar».
// Las 98 del catálogo mayoreo; las de catálogos de proveedores (soloGestion) se prueban en catalogo-proveedores.
const solo=C.productos.filter(p=>p.soloCotizar&&!p.soloGestion),color=id=>C.colores.find(c=>c.id===id);
const archivo=r=>existsSync(new URL('../'+r,import.meta.url));
const id='12345678-1234-4123-8123-123456789abc',token='a'.repeat(64),uid='87654321-4321-4321-8321-cba987654321';

test('las 98 prendas existen ocultas, con SKU propio, render, colores y zonas válidas',()=>{
 assert.equal(solo.length,98);
 assert.equal(new Set(C.productos.map(p=>p.sku)).size,C.productos.length,'SKU únicos');
 for(const p of solo){
  assert.equal(p.activo,false,p.sku);assert.match(p.sku,/^ZN-(PL|DE|PO|CM|SU|CH|PA|IN|GO)-\d{3}$/);assert.equal(p.id,p.sku.toLowerCase());
  assert.ok(archivo(p.foto),p.foto);
  assert.ok(p.colores.length>0&&p.colores.every(c=>color(c)&&/^#[0-9a-f]{6}$/.test(color(c).hex)),p.sku+' colores');
  for(const [c,f] of Object.entries(p.fotosColor||{})){assert.ok(p.colores.includes(c));assert.ok(archivo(f),f);}
  for(const c of p.coloresSinRender||[])assert.ok(p.colores.includes(c)&&!p.fotosColor?.[c]);
  assert.ok(p.tecnicas.length&&p.tecnicas.every(t=>['bordado','serigrafia','dtf'].includes(t)));
  assert.equal(p.categoria==='Gorras',p.tallas.length===0,p.sku+' tallas');
  assert.ok(p.pxPorCm>0&&p.zonas.length&&p.zonas.every(z=>z.x>0&&z.x<1000&&z.y>0&&z.y<1000&&z.max>0));
  assert.equal(p.minimoPiezas,1);assert.equal(p.pasoPiezas,1);
  assert.ok(Pub.productosHistoricos.some(x=>x.sku===p.sku)&&!Pub.productos.some(x=>x.sku===p.sku),p.sku+' oculta en la página');
 }
 assert.deepEqual([...new Set(solo.map(p=>p.categoria))].sort(),['Camisas','Chalecos','Chamarras','Deportivas','Gorras','Infantil','Pantalones','Playeras','Polos','Sudaderas']);
});
test('la página pública no lleva proveedores, códigos ni páginas de sus catálogos',()=>{
 const texto=JSON.stringify(Pub);
 assert.ok(!/Gildan|Playerytees|Player y Tees|Wusstek|Yazbek|subdistribuidor|\bR77\d\d\b|\b64000\b|paginaProveedor|skuProveedor|proveedorCompras/i.test(texto));
 for(const p of solo)assert.ok(!('proveedorCompras' in p)&&!('skuProveedor' in p)&&!('fabricante' in p),p.sku);
});
test('la página del catálogo del proveedor es una referencia privada editable',()=>{
 assert.deepEqual(normalizeChanges({pagina_proveedor:'  p. 18 '}),{pagina_proveedor:'p. 18'});
 assert.throws(()=>normalizeChanges({pagina_proveedor:'x'.repeat(61)}),/pagina_proveedor/);
 const p=solo[0],cat=resolveInternal(C,[{producto_id:p.id,version:1,cambios:{proveedor:'Proveedor ficticio',sku_proveedor:'REF-1',pagina_proveedor:'p. 18'}}]);
 const r=cat.productos.find(x=>x.id===p.id);assert.equal(r.paginaProveedor,'p. 18');assert.equal(r.skuProveedor,'REF-1');
});
test('un pedido del público no acepta prendas solo para cotizar; el equipo sí',()=>{
 const p=solo.find(x=>x.tallas.length),c=color(p.colores[0]);
 const item={p:p.id,colorId:c.id,color:c.nombre,tecnica:C.tecnicas.find(t=>t.id===p.tecnicas[0]).nombre,piezas:3,tallasDetalle:{[p.tallas[0]]:3},zona:p.zonas[0].nombre,cm:8,tieneLogo:false,tieneRender:false};
 const pedido={id,token,items:[item],files:[]};
 assert.throws(()=>validateOrder(pedido),/cantidades y mínimos/);
 const x=validateOrder(pedido,{allowHistoricos:true}).items[0];assert.equal(x.p,p.id);assert.equal(x.piezas,3);
});

function setup(){
 const calls=[],saved={row:null};
 const fetcher=async(url,opts={})=>{
  calls.push({url,opts});const data=opts.body&&typeof opts.body==='string'?JSON.parse(opts.body):{};
  if(url.includes('/auth/v1/user'))return Response.json({id:uid,email:'test@example.test',email_confirmed_at:'2026-10-14'});
  if(url.includes('/zain_accesos?'))return Response.json([{nombre:'Prueba'}]);
  if(url.includes('/zain_equipo?'))return Response.json([{user_id:uid,nombre:'Prueba',activo:true}]);
  if(url.includes('/zain_catalogo_ediciones?'))return Response.json([]);
  if(url.includes('/zain_catalogo_fotos?'))return Response.json([]);
  if(url.includes('/zain_productos_gestion?'))return Response.json([]);
  if(url.includes('/zain_pedidos?'))return Response.json(saved.row?[saved.row]:[]);
  if(url.includes('/rpc/zain_crear_pedido')){saved.row={id,folio:'ZAIN-PRUEBA',items:data.p_items,archivos:data.p_archivos,total:data.p_total,created_at:'2026-11-22T12:00:00Z',guardado_at:'2026-11-22T12:00:00Z',version:0,estado:'nuevo'};return Response.json({folio:saved.row.folio});}
  return Response.json([]);
 };
 const handler=createHandler({SUPABASE_URL:'https://project.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_ficticia',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_ficticia',ZAIN_PEDIDOS_ENABLED:'true',ZAIN_CATALOGO_ENABLED:'true',ZAIN_SITE_URL:'https://zain.test'},fetcher);
 const request=(op,b,auth=false)=>handler(new Request('https://zain.test/api/pedidos?op='+op,{method:'POST',headers:{Origin:'https://zain.test','Content-Type':'application/json',...(auth?{Authorization:'Bearer prueba'}:{})},body:JSON.stringify(b)}));
 return {request,calls,saved};
}
test('servidor: «crear» con una prenda solo para cotizar exige la sesión del equipo',async()=>{
 const p=solo.find(x=>x.tallas.length),c=color(p.colores[0]);
 const item={p:p.id,colorId:c.id,color:c.nombre,tecnica:C.tecnicas.find(t=>t.id===p.tecnicas[0]).nombre,piezas:3,tallasDetalle:{[p.tallas[0]]:3},zona:p.zonas[0].nombre,cm:8,logo:'Sin logo',tieneLogo:false,tieneRender:false};
 const publico=setup(),r1=await publico.request('crear',{id,token,items:[item],files:[]});
 assert.equal(r1.status,401);assert.ok(!publico.calls.some(x=>x.url.includes('/rpc/zain_crear_pedido')),'sin sesión no se escribe nada');
 const equipo=setup(),r2=await equipo.request('crear',{id,token,items:[item],files:[]},true);
 assert.equal(r2.status,200);assert.equal(equipo.saved.row.items[0].sku,p.sku);
});
