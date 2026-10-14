import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,createHmac} from 'node:crypto';
import C from '../server/config-interno.cjs';
import PublicC from '../js/config.js';
import {normalizeChanges,resolveInternal,projectPublic} from '../server/catalogo-gestion.mjs';
import {createHandler,validateOrder} from '../server/pedidos.mjs';
const id='12345678-1234-4123-8123-123456789abc',token='a'.repeat(64),uid='87654321-4321-4321-8321-cba987654321';
const fotoID='12345678-1234-4123-8123-123456789abc';
const item={p:'bolsa-expo',color:'Rojo',tecnica:'Serigrafía',piezas:100,zona:'Frente',cm:9,logo:'Sin logo',tieneLogo:false,tieneRender:false};
const body={id,token,items:[item],files:[]};
const env={SUPABASE_URL:'https://project.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_ficticia',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_ficticia',ZAIN_PEDIDOS_ENABLED:'true',ZAIN_CATALOGO_ENABLED:'true',ZAIN_SITE_URL:'https://zain.test'};
function setup({editions=[],member=true,existing=null,conflict=false}={}){
 const calls=[],saved={row:existing};
 const fetcher=async(url,opts={})=>{
  calls.push({url,opts});const data=opts.body&&typeof opts.body==='string'?JSON.parse(opts.body):{};
  if(url.includes('/auth/v1/user'))return Response.json({id:uid,email:'test@example.test',email_confirmed_at:'2026-10-14'});
  if(url.includes('/zain_accesos?'))return Response.json(member?[{nombre:'Prueba'}]:[]);
  if(url.includes('/zain_equipo?'))return Response.json([{user_id:uid,nombre:'Prueba',activo:true}]);
  if(url.includes('/zain_catalogo_ediciones?'))return Response.json(editions);
  if(url.includes('/zain_catalogo_fotos?'))return Response.json([]);
  if(url.includes('/rpc/zain_guardar_catalogo'))return Response.json(conflict?null:{version:1});
  if(url.includes('/zain_catalogo_fotos')&&opts.method==='POST')return Response.json(null);
  if(url.includes('/storage/v1/object/zain-catalogo-fotos/'))return Response.json({});
  if(url.includes('/zain_pedidos?'))return Response.json(saved.row?[saved.row]:[]);
  if(url.includes('/rpc/zain_crear_pedido')){
   saved.row={id,folio:'ZAIN-PRUEBA',token_hash:data.p_token_hash,consulta_nonce:fotoID,items:data.p_items,archivos:data.p_archivos,total:data.p_total,created_at:'2026-10-14T14:00:00Z',guardado_at:'2026-10-14T14:00:00Z',version:0,estado:'nuevo',notas_internas:'Privado'};
   return Response.json({folio:saved.row.folio});
  }
  throw Error('Ruta inesperada '+url);
 };
 const handler=createHandler(env,fetcher);
 const request=(op,b,auth=false,query='')=>handler(new Request('https://zain.test/api/pedidos?op='+op+query,{method:b?'POST':'GET',headers:{Origin:'https://zain.test',...(b?{'Content-Type':'application/json'}:{}),...(auth?{Authorization:'Bearer prueba'}:{})},body:b?JSON.stringify(b):undefined}));
 return {handler,request,calls,saved,editions};
}
test('edición restringida: render, SKU ZAIN, tallas y colores no son modificables',()=>{
 for(const key of ['foto','fotoRender','sku','codigoFabricante','colores','tallas','__proto__'])assert.throws(()=>normalizeChanges(JSON.parse('{"'+key+'":"x"}')),/protegido/);
 assert.deepEqual(normalizeChanges({activo:false,nombre:'  Nueva playera  ',sku_proveedor:'C0200'}),{activo:false,nombre:'Nueva playera',sku_proveedor:'C0200'});
 assert.throws(()=>normalizeChanges({nombre:''}),/vacío/);assert.throws(()=>normalizeChanges({gramaje:0}),/Gramaje/);assert.throws(()=>normalizeChanges({foto_id:'http://otra.test/a.jpg'}),/Foto/);
});
test('activar y ocultar conserva renders, referencias y colores sin exponer proveedor',()=>{
 const base=PublicC.productos.find(p=>p.id==='bolsa-expo');
 const resolved=resolveInternal(C,[{producto_id:'bolsa-expo',version:1,cambios:{activo:false,proveedor:'PROVEEDOR PRIVADO',sku_proveedor:'SKU PRIVADO',nombre:'Bolsa para eventos'}}]);
 const pub=projectPublic(PublicC,resolved,[],'https://project.supabase.co');
 assert.equal(pub.productos.length,38);const old=pub.productosHistoricos.find(p=>p.id==='bolsa-expo');assert.equal(old.foto,base.foto);assert.equal(old.sku,base.sku);assert.deepEqual(old.colores,base.colores);
 for(const word of ['Yazbek','yazbek','PROVEEDOR PRIVADO','SKU PRIVADO','codigoFabricante','skuProveedor','proveedorCompras'])assert.ok(!JSON.stringify(pub).includes(word),word);
 const p=projectPublic(PublicC,resolveInternal(C,[{producto_id:'playera',cambios:{activo:true}}]),[],'https://project.supabase.co');assert.ok(p.productos.some(p=>p.id==='playera'));
});
test('composición conserva aliases públicos y la edición aplica a todos los colores',()=>{
 let pub=projectPublic(PublicC,resolveInternal(C,[]),[],'https://project.supabase.co');
 for(const p of [...pub.productos,...pub.productosHistoricos])assert.deepEqual(p.composicionColor,([...PublicC.productos,...PublicC.productosHistoricos].find(x=>x.sku===p.sku)).composicionColor||{});
 const p=PublicC.productos.find(p=>p.prendaCatalogo&&Object.keys(p.composicionColor||{}).length);
 pub=projectPublic(PublicC,resolveInternal(C,[{producto_id:p.id,cambios:{composicion:'100% nueva fibra'}}]),[],'https://project.supabase.co');
 assert.deepEqual(pub.productos.find(x=>x.id===p.id).composicionColor,{});
});
test('fotos pertenecen al modelo y solo la imagen secundaria cambia',()=>{
 const before=PublicC.productos.find(p=>p.id==='bolsa-expo');
 const resolved=resolveInternal(C,[{producto_id:'bolsa-expo',cambios:{foto_id:fotoID}}]);
 const foreign={id:fotoID,producto_id:'otro',objeto:'bolsa-expo/'+fotoID+'.webp'};
 assert.equal(projectPublic(PublicC,resolved,[foreign],'https://project.supabase.co').productos.find(p=>p.id==='bolsa-expo').fotoModelo,before.fotoModelo);
 const after=projectPublic(PublicC,resolved,[{...foreign,producto_id:'bolsa-expo'}],'https://project.supabase.co').productos.find(p=>p.id==='bolsa-expo');
 assert.equal(after.foto,before.foto);assert.ok(after.fotoModelo.startsWith('https://project.supabase.co/storage/v1/object/public/zain-catalogo-fotos/'));
});
test('sin modelos activos no deja portada ni categorías obsoletas',()=>{
 const changes=C.productos.map(p=>({producto_id:p.idPublico||p.id,cambios:{activo:false}}));
 const pub=projectPublic(PublicC,resolveInternal(C,changes),[],'https://project.supabase.co');assert.equal(pub.productos.length,0);assert.equal(pub.productosHistoricos.length,44);assert.equal(pub.muestrasPortada.length,0);assert.equal(pub.categoriasCatalogo.length,0);
});
test('lectura pública no necesita login; guardar y subir foto exigen equipo',async()=>{
 const s=setup();const pub=await s.request('catalogo-publico');assert.equal(pub.status,200);assert.equal((await pub.json()).catalogo.productos.length,39);
 assert.equal((await s.request('catalogo-lista')).status,401);assert.equal((await s.request('catalogo-guardar',{id:'bolsa-expo',version:0,cambios:{activo:false}})).status,401);
 assert.equal((await s.request('catalogo-foto',{},false,'&id=bolsa-expo')).status,401);assert.ok(!s.calls.some(x=>x.opts.method==='POST'));
 assert.equal((await setup({member:false}).request('catalogo-lista',null,true)).status,403);
});
test('panel contiene ambos SKU y conflictos no sobrescriben cambios',async()=>{
 const s=setup();const list=(await(await s.request('catalogo-lista',null,true)).json()).productos;assert.equal(list.length,44);assert.ok(list.some(p=>p.skuProveedor==='C0200'&&p.proveedor==='Yazbek'));
 assert.equal((await s.request('catalogo-guardar',{id:'bolsa-expo',version:0,cambios:{fotoRender:'x'}},true)).status,400);
 const c=setup({conflict:true});assert.equal((await c.request('catalogo-guardar',{id:'bolsa-expo',version:0,cambios:{activo:false}},true)).status,409);
 assert.equal((await s.request('catalogo-guardar',{id:'bolsa-expo',version:0,cambios:{activo:false}},true)).status,200);
});
test('fotos rechazan MIME, contenido y cargas mayores a 4 MB',async()=>{
 const s=setup();const upload=(data,type)=>s.handler(new Request('https://zain.test/api/pedidos?op=catalogo-foto&id=bolsa-expo',{method:'POST',headers:{Authorization:'Bearer prueba','Content-Type':type},body:data}));
 assert.equal((await upload('<svg/>','image/svg+xml')).status,400);assert.equal((await upload('webp falso','image/webp')).status,400);assert.equal((await upload(Buffer.alloc(4*1024*1024+1),'image/webp')).status,413);
 assert.ok(!s.calls.some(x=>x.url.includes('/storage/')));
});
test('publicación oculta rechaza pedidos nuevos sin escribir la base',async()=>{
 const s=setup({editions:[{producto_id:'bolsa-expo',cambios:{activo:false}}]});
 const response=await s.request('crear',body);assert.equal(response.status,400);assert.ok(!s.calls.some(x=>x.url.includes('/rpc/zain_crear_pedido')));
});
test('pedido conserva nombre y SKU del momento de creación incluso tras editar/ocultar',async()=>{
 const s=setup({editions:[{producto_id:'bolsa-expo',cambios:{nombre:'Bolsa Evento',proveedor:'Distribuidor privado',sku_proveedor:'EX-100'}}]});
 assert.equal((await s.request('crear',body)).status,200);const p=s.saved.row.items[0];assert.equal(p.nombreZain,'Bolsa Evento');assert.equal(p.skuProveedor,'EX-100');
 s.editions[0].cambios={activo:false,nombre:'Nombre posterior',sku_proveedor:'OTRO'};
 assert.equal((await s.request('crear',body)).status,200);assert.equal(s.calls.filter(x=>x.url.includes('/rpc/zain_crear_pedido')).length,1);
 assert.equal((await s.request('crear',{...body,items:[{...item,piezas:150}]})).status,409);
 const read=createHmac('sha256',Buffer.from(s.saved.row.token_hash,'hex')).update('zain:consulta:v1:'+id+':'+fotoID).digest('hex');
 const out=await(await s.request('consulta',{id,token:read})).json();assert.equal(out.pedido.items[0].nombre,'Bolsa Evento');assert.ok(out.pedido.items[0].sku);assert.ok(!JSON.stringify(out).includes('EX-100'));assert.ok(!JSON.stringify(out).includes('Distribuidor privado'));
 const staff=await(await s.request('detalle',null,true,'&id='+id)).json();assert.equal(staff.pedido.items[0].skuProveedor,'EX-100');assert.equal(staff.pedido.items[0].nombre,'Bolsa Evento');assert.ok(!JSON.stringify(staff).includes('pedido_hash'));
});
test('folios anteriores se reintentan con contenido original y secreto correcto',async()=>{
 const checked=validateOrder(body),row={id,token_hash:createHash('sha256').update(token).digest('hex'),folio:'ZAIN-ANTERIOR',items:checked.items,archivos:checked.manifest};
 const s=setup({existing:row,editions:[{producto_id:'bolsa-expo',cambios:{activo:false}}]});
 assert.equal((await s.request('crear',body)).status,200);assert.equal((await s.request('crear',{...body,token:'b'.repeat(64)})).status,403);assert.ok(!s.calls.some(x=>x.url.includes('/rpc/zain_crear_pedido')));
});

test('técnicas editables: una o varias, sin IDs desconocidos ni duplicados',()=>{
 assert.deepEqual(normalizeChanges({tecnicas:['bordado','dtf','serigrafia']}),{tecnicas:['bordado','dtf','serigrafia']});
 for(const value of [[],null,'dtf',['láser'],['dtf','dtf'],['dtf','bordado','serigrafia','otra']])assert.throws(()=>normalizeChanges({tecnicas:value}),/técnica/);
});
test('técnicas cambiadas se reflejan en catálogo y portada con una opción válida',()=>{
 const first=PublicC.muestrasPortada[0],base=PublicC.productos.find(p=>p.id===first.p);
 const cat=resolveInternal(C,[{producto_id:first.p,cambios:{tecnicas:['dtf']}}]),pub=projectPublic(PublicC,cat,[],'https://project.supabase.co');
 const changed=pub.productos.find(p=>p.id===first.p);assert.deepEqual(changed.tecnicas,['dtf']);assert.equal(pub.muestrasPortada[0].t,'dtf');
 assert.ok(changed.tecnicasNota.includes('DTF'));assert.equal(changed.foto,base.foto);assert.deepEqual(PublicC.productos.find(p=>p.id===first.p).tecnicas,base.tecnicas);
});
test('servidor acepta la técnica asignada y rechaza la desactivada sin guardar',async()=>{
 const s=setup({editions:[{producto_id:'bolsa-expo',cambios:{tecnicas:['dtf']}}]});
 assert.equal((await s.request('crear',body)).status,400);assert.ok(!s.calls.some(x=>x.url.includes('/rpc/zain_crear_pedido')));
 const fresh={...body,items:[{...item,tecnica:'DTF'}]};assert.equal((await s.request('crear',fresh)).status,200);assert.equal(s.saved.row.items[0].tecnica,'DTF');
 s.editions[0].cambios.tecnicas=['serigrafia'];assert.equal((await s.request('crear',fresh)).status,200);assert.equal(s.saved.row.items[0].tecnica,'DTF');
});
test('editar técnicas exige equipo y usa control de versión existente',async()=>{
 const changes={id:'bolsa-expo',version:0,cambios:{tecnicas:['bordado','dtf']}};
 const s=setup();assert.equal((await s.request('catalogo-guardar',changes)).status,401);
 assert.equal((await s.request('catalogo-guardar',{...changes,cambios:{tecnicas:[]}},true)).status,400);
 assert.equal((await s.request('catalogo-guardar',changes,true)).status,200);
 const rpc=s.calls.find(x=>x.url.includes('/rpc/zain_guardar_catalogo'));assert.deepEqual(JSON.parse(rpc.opts.body).p_cambios.tecnicas,['bordado','dtf']);
});
