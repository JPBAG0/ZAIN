import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import C from '../server/config-interno.cjs';
import Pub from '../js/config.js';
import {normalizeNewProduct,expandCatalog} from '../server/catalogo-altas.mjs';
import {resolveInternal,projectPublic} from '../server/catalogo-gestion.mjs';
import {createHandler,validateOrder} from '../server/pedidos.mjs';
import {supplierItem} from '../server/talleres.mjs';
import {begin,forget,checkWEBP} from '../server/render-local-worker.mjs';
const oid='12345678-1234-4123-8123-123456789abc',uid='87654321-4321-4321-8321-cba987654321',tid='abcdefab-1234-4123-8123-abcdefabcdef',jid='abcdefff-1234-4123-8123-abcdefabcdef';
const createInput=()=>({nombre:'Modelo propio',categoria:C.categoriasCatalogo[0],descripcion:'Prenda',especificaciones:'Detalle',silueta:'Caballero',proveedor:'Proveedor secreto',sku_proveedor:'INTERNO-X',colores:[{nombre:'Negro',hex:'#111111'}],tallas:['M','G'],tecnicas:['bordado','dtf'],minimoPiezas:10,pasoPiezas:5,anchoFrente:40,modoRender:'reutilizar',plantilla:Pub.productos[0].id,request_id:oid});
function custom(published=false,active=false){
 const datos=normalizeNewProduct(createInput(),C.categoriasCatalogo,C.productos);
 const expanded=expandCatalog(C,[{id:'zn-np-000001',sku:'ZN-NP-000001',datos,publicado_at:published?'2026-10-14':null}],[],[],Pub,'https://p.supabase.co');
 return resolveInternal(expanded,[{producto_id:'zn-np-000001',version:2,cambios:{activo:active}}]);
}
test('altas rechazan campos protegidos, colores/técnicas/tallas ambiguos y URL de render arbitraria',()=>{
 const b=createInput();assert.throws(()=>normalizeNewProduct({...b,id:'admin'},C.categoriasCatalogo,C.productos));
 assert.throws(()=>normalizeNewProduct({...b,foto:'https://otro.test'},C.categoriasCatalogo,C.productos));
 assert.throws(()=>normalizeNewProduct({...b,colores:[...b.colores,...b.colores]},C.categoriasCatalogo,C.productos));
 assert.throws(()=>normalizeNewProduct({...b,tallas:['M','m']},C.categoriasCatalogo,C.productos));
 assert.throws(()=>normalizeNewProduct({...b,tecnicas:['bordado','bordado']},C.categoriasCatalogo,C.productos));
 assert.throws(()=>normalizeNewProduct({...b,plantilla:'desconocido'},C.categoriasCatalogo,C.productos));
 const bags=normalizeNewProduct({...b,categoria:'Bolsas',minimoPiezas:1,pasoPiezas:1},C.categoriasCatalogo,C.productos);assert.equal(bags.minimoPiezas,100);assert.equal(bags.pasoPiezas,50);
});
test('borradores no salen al cliente; publicado conserva SKU y colores sin datos de compras',()=>{
 assert.ok(!projectPublic(Pub,custom(),[],'https://p.supabase.co').productos.some(p=>p.id==='zn-np-000001'));
 const view=projectPublic(Pub,custom(true,true),[],'https://p.supabase.co'),p=view.productos.find(p=>p.id==='zn-np-000001');
 assert.equal(p.sku,'ZN-NP-000001');assert.equal(view.colores.find(c=>c.id===p.colores[0]).nombre,'Negro');
 const text=JSON.stringify(p);assert.ok(!text.includes('INTERNO-X'));assert.ok(!text.includes('Proveedor secreto'));assert.ok(!text.includes('plantilla'));assert.ok(!text.includes('modoRender'));
});
test('pedido de nuevo modelo valida su color, técnica, talla y cantidades; conserva SKU para compras',()=>{
 const cat=custom(true,true),p=cat.productos.at(-1),body={id:oid,token:'a'.repeat(64),items:[{p:p.id,color:'Negro',colorId:p.colores[0],tecnica:'DTF',piezas:10,cm:5,zona:p.zonas[0].nombre,tallasDetalle:{M:10}}]};
 const valid=validateOrder(body,{catalogo:cat,snapshot:true}).items[0];assert.equal(valid.sku,'ZN-NP-000001');assert.equal(valid.skuProveedor,'INTERNO-X');
 assert.throws(()=>validateOrder({...body,items:[{...body.items[0],colorId:C.colores[0].id}]},{catalogo:cat}));
 assert.throws(()=>validateOrder({...body,items:[{...body.items[0],piezas:11}]},{catalogo:cat}));
 assert.throws(()=>validateOrder({...body,items:[{...body.items[0],tallasDetalle:{M:9}}]},{catalogo:cat}));
});
const env={SUPABASE_URL:'https://p.supabase.co',SUPABASE_SECRET_KEY:'test-secret',SUPABASE_PUBLISHABLE_KEY:'test-public',ZAIN_PEDIDOS_ENABLED:'true',ZAIN_CATALOGO_ENABLED:'true',ZAIN_CATALOGO_ALTAS_ENABLED:'true',ZAIN_TALLERES_ENABLED:'true',ZAIN_SITE_URL:'https://zain.test'};
function supplierFixture({own=true,confirmed=true,active=true,linked=true,emailConfirmed=true,versionConflict=false}={}){
 const calls=[],order={id:oid,folio:'ZAIN-PRUEBA',guardado_at:'2026-10-14',archivado_at:null,estado:confirmed?'confirmado':'cancelado',total:600,notas_internas:'SECRETO',items:[{nombre:'Proveedor referencia',nombreZain:'Polo profesional',sku:'ZN-PO-001',skuProveedor:'PRIVADO',tecnica:'Bordado',piezas:100,color:'Azul'},{nombre:'Otro modelo',tecnica:'DTF',piezas:500}],archivos:[{item:0,kind:'logo',type:'image/png',name:'logo.png',path:oid+'/0-logo.png'},{item:1,kind:'logo',type:'image/png',name:'otro.png',path:oid+'/1-logo.png'}]};
 const task={id:jid,pedido_id:oid,indice:0,taller_id:tid,tecnica:'Bordado',estado:'pendiente',version:1,created_at:'2026-10-14'};
 const fetcher=async(url,o={})=>{
  calls.push({url,o});
  if(url.includes('/auth/v1/user'))return Response.json({id:uid,email:'taller@example.test',email_confirmed_at:emailConfirmed?'2026-10-14':null,user_metadata:{admin:true}});
  if(url.includes('/zain_talleres?'))return Response.json(active?[{id:tid,nombre:'Taller',tecnica:'Bordado',user_id:linked?uid:oid}]:[]);
  if(url.includes('/rpc/zain_vincular_taller'))return Response.json({id:tid,nombre:'Taller',tecnica:'Bordado'});
  if(url.includes('/zain_partidas_taller?'))return Response.json(own?[task]:[]);
  if(url.includes('/zain_pedidos?'))return Response.json([order]);
  if(url.includes('/object/sign/'))return Response.json({signedURL:'/storage/v1/object/sign/zain-pedidos/'+oid+'/0-logo.png?token=falso'});
  if(url.includes('/rpc/zain_actualizar_partida'))return Response.json(versionConflict?null:{estado:'listo',version:2});
  if(url.includes('/zain_accesos?'))return Response.json([]);
  throw Error('Ruta inesperada '+url);
 };
 const h=createHandler(env,fetcher),call=(op,b,auth=true)=>h(new Request('https://zain.test/api/pedidos?op='+op,{method:b?'POST':'GET',headers:{...(auth?{Authorization:'Bearer fixture'}:{}),...(b?{'Content-Type':'application/json'}:{})},body:b?JSON.stringify(b):undefined}));
 return {call,calls,order,task};
}
test('taller de bordado recibe solo su partida; no ve compras, otras técnicas, total ni notas internas',async()=>{
 const f=supplierFixture(),r=await f.call('taller-lista'),body=await r.json();assert.equal(r.status,200);
 assert.equal(body.trabajos.length,1);assert.equal(body.trabajos[0].item.piezas,100);assert.equal(body.trabajos[0].archivos.length,1);
 const s=JSON.stringify(body);for(const forbidden of ['PRIVADO','SECRETO','Otro modelo','pedido_id','500','600','token_hash'])assert.ok(!s.includes(forbidden),forbidden);
 assert.equal((await f.call('resumen')).status,403);assert.equal((await f.call('talleres-lista')).status,403);
});
test('rol proveedor requiere sesión, correo confirmado, acceso activo y vínculo con ese usuario',async()=>{
 assert.equal((await supplierFixture().call('taller-lista',null,false)).status,401);
 for(const cfg of [{active:false},{linked:false},{emailConfirmed:false}])assert.equal((await supplierFixture(cfg).call('taller-lista')).status,403);
});
test('archivo de taller usa índice asignado y no índice enviado por el navegador',async()=>{
 const f=supplierFixture();assert.equal((await f.call('taller-archivo',{id:jid,kind:'logo',item:1})).status,200);
 assert.ok(f.calls.find(c=>c.url.includes('/object/sign/')).url.endsWith('/0-logo.png'));
 assert.equal((await supplierFixture({own:false}).call('taller-archivo',{id:jid,kind:'logo'})).status,404);
 assert.equal((await supplierFixture({confirmed:false}).call('taller-archivo',{id:jid,kind:'logo'})).status,404);
});
test('taller actualiza solamente su avance con versión; no modifica estado del cliente',async()=>{
 const f=supplierFixture();assert.equal((await f.call('taller-actualizar',{id:jid,version:1,estado:'listo'})).status,200);
 assert.equal(f.order.estado,'confirmado');assert.ok(!f.calls.some(c=>c.url.includes('zain_actualizar_pedido')));
 assert.equal((await f.call('taller-actualizar',{id:jid,version:1,estado:'entregado'})).status,400);
 assert.equal((await supplierFixture({versionConflict:true}).call('taller-actualizar',{id:jid,version:1,estado:'listo'})).status,409);
 f.order.archivado_at='2026-10-14';assert.equal((await f.call('taller-archivo',{id:jid,kind:'logo'})).status,404);
});
test('proyección de taller rechaza técnica ajena y pedidos no confirmados',()=>{
 const f=supplierFixture();assert.equal(supplierItem(f.order,{...f.task,indice:1},'Bordado'),null);
 f.order.estado='nuevo';assert.equal(supplierItem(f.order,f.task,'Bordado'),null);
});
test('receptor local conserva capacidad en memoria y rechaza formatos mal declarados',()=>{
 const hash=begin();assert.match(hash,/^[a-f0-9]{64}$/);assert.throws(begin);forget();assert.notEqual(begin(),hash);forget();assert.throws(()=>checkWEBP(Buffer.from('not-webp')));
});
test('ticket de render inválido, vencido o de otra tarea no firma una subida',async()=>{
 const token='a'.repeat(64),calls=[];
 for(const cfg of [{hash:'x'.repeat(64),date:new Date().toISOString()},{hash:createHash('sha256').update(token).digest('hex'),date:'2000-01-01T00:00:00Z'}]){
  const handler=createHandler(env,async(url)=>{calls.push(url);if(url.includes('/zain_render_cola?'))return Response.json([{id:jid,producto_id:'zn-np-000001',estado:'generando',worker_hash:cfg.hash,worker_at:cfg.date}]);throw Error('No debe llamar otras rutas');});
  const r=await handler(new Request('https://zain.test/api/pedidos?op=render-local-subida',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:jid,ticket:token,size:100,type:'image/webp'})}));assert.equal(r.status,403);
 }
 assert.ok(!calls.some(x=>x.includes('/object/upload/')));
});
