import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash,createHmac } from 'node:crypto';
import {createHandler,validateOrder} from '../server/pedidos.mjs';
const id='12345678-1234-4123-8123-123456789abc',token='a'.repeat(64),staffID='87654321-4321-4321-8321-cba987654321';
const item={p:'bolsa-expo',color:'Rojo',tecnica:'Serigrafía',piezas:100,zona:'Frente',cm:9,logo:'archivo «logo.svg»',tieneLogo:true,tieneRender:true};
const files=[{item:0,kind:'logo',type:'image/svg+xml',size:90,name:'logo.svg'},{item:0,kind:'render',type:'image/png',size:1000,name:'render.png'}];
const env={SUPABASE_URL:'https://project.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_prueba_no_real',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_prueba_no_real',ZAIN_PEDIDOS_ENABLED:'true',ZAIN_SITE_URL:'https://zain.test'};
const json=x=>Response.json(x);
function setup({member=true,stored=true}={}) {
  const calls=[],checked=validateOrder({id,token,items:[item],files});
  const row={id,folio:'ZAIN-PRUEBA',token_hash:createHash('sha256').update(token).digest('hex'),consulta_nonce:'87654321-1234-4123-8123-123456789abc',items:checked.items,archivos:checked.manifest,created_at:new Date().toISOString(),guardado_at:null,total:100,version:0,estado:'nuevo',notas_internas:'PRIVADO DEL EQUIPO'};
  const fake=async(url,opts={})=>{
    calls.push({url,opts});
    if(url.includes('/auth/v1/user'))return opts.headers.Authorization==='Bearer valid-user'?json({id:staffID,email:'equipo@example.test',email_confirmed_at:'2026-10-13'}):json({error:'bad'});
    if(url.includes('/zain_accesos?'))return json(member?[{nombre:'Prueba'}]:[]);
    if(url.includes('/zain_equipo?'))return json(member?[{user_id:staffID,nombre:'Prueba',activo:true}]:[]);
    if(url.includes('/rpc/zain_crear_pedido'))return json({folio:row.folio});
    if(url.includes('/rpc/zain_actualizar_pedido'))return json(null);
    if(url.includes('/zain_pedidos?'))return opts.method==='PATCH'?json(null):json([row]);
    if(url.includes('/object/list/'))return json(stored?checked.manifest.map(f=>({name:f.path.split('/')[1],metadata:{size:f.size,mimetype:f.type}})):[]);
    if(url.includes('/object/upload/sign/'))return json({url:'/object/upload/sign/zain-pedidos/'+url.split('/zain-pedidos/')[1]+'?token=signed-test'});
    if(url.includes('/object/sign/'))return json({signedURL:'/object/sign/zain-pedidos/render.png?token=signed-test'});
    throw Error('Ruta inesperada '+url);
  };
  const handler=createHandler(env,fake);
  const request=(op,body,authorization,origin='https://zain.test')=>handler(new Request('https://zain.test/api/pedidos?op='+op,{method:body?'POST':'GET',headers:{Origin:origin,...(body?{'Content-Type':'application/json'}:{}),...(authorization?{Authorization:authorization}:{})},body:body?JSON.stringify(body):undefined}));
  return {request,calls,row};
}
test('mínimos por selección y colores/técnicas reales',()=>{
  assert.equal(validateOrder({id,token,items:[item],files}).total,100);
  assert.throws(()=>validateOrder({id,token,items:[{...item,piezas:125}],files}),/cantidades/);
  assert.throws(()=>validateOrder({id,token,items:[{...item,color:'Color inventado'}],files}),/Color/);
  assert.throws(()=>validateOrder({id,token,items:[{...item,tecnica:'Bordado'}],files}),/Técnica/);
});
test('rechaza archivos faltantes, HTML y exceso de tamaño',()=>{
  assert.throws(()=>validateOrder({id,token,items:[item],files:[]}),/Faltan/);
  assert.throws(()=>validateOrder({id,token,items:[item],files:[{...files[0],type:'text/html'}]}),/válido/);
  assert.throws(()=>validateOrder({id,token,items:[item],files:[{...files[0],size:16000000}]}),/15 MB/);
});
test('config pública no expone secretos',async()=>{
  const {request}=setup();const r=await request('config'),body=await r.text();assert.equal(r.status,200);assert.ok(body.includes('sb_publishable'));assert.ok(!body.includes('sb_secret'));assert.equal(r.headers.get('cache-control'),'no-store');
});
test('anónimo y usuario fuera del equipo no consultan pedidos',async()=>{
  const a=setup();assert.equal((await a.request('lista')).status,401);assert.equal((await a.request('archivo',{id,item:0,kind:'render'})).status,401);
  const b=setup({member:false});assert.equal((await b.request('detalle',null,'Bearer valid-user')).status,403);
});
test('un token del cliente no permite modificar otra solicitud',async()=>{
  const {request,calls}=setup();assert.equal((await request('finalizar',{id,token:'b'.repeat(64)})).status,403);assert.ok(!calls.some(x=>x.opts.method==='PATCH'));
});
test('no marca guardado si falta un archivo',async()=>{
  const {request,calls}=setup({stored:false});assert.equal((await request('finalizar',{id,token})).status,409);assert.ok(!calls.some(x=>x.opts.method==='PATCH'));
});
test('confirmación solo tras verificar todos los originales y renders',async()=>{
  const {request,calls}=setup();const r=await request('finalizar',{id,token});assert.equal(r.status,200);assert.ok((await r.json()).url.startsWith('https://zain.test/mi-pedido#'));assert.ok(calls.some(x=>x.opts.method==='PATCH'));
});
test('URLs firmadas incluyen la ruta correcta y reintentos omiten archivos existentes',async()=>{
  const a=setup({stored:false});const r=await a.request('subidas',{id,token});assert.equal(r.status,200);const body=await r.json();assert.ok(body.files.every(f=>f.url.startsWith('https://project.supabase.co/storage/v1/object/upload/sign/')));
  const b=setup();const done=await b.request('subidas',{id,token});assert.ok((await done.json()).files.every(f=>f.subido));
});
test('conflicto entre compañeros no sobrescribe una versión nueva',async()=>{
  const {request}=setup();assert.equal((await request('actualizar',{id,estado:'cotizado',version:0,notas:'Prueba'},'Bearer valid-user')).status,409);
});
test('otro sitio no puede usar la API desde su navegador',async()=>{
  const {request,calls}=setup();assert.equal((await request('config',null,null,'https://intruso.test')).status,403);assert.equal(calls.length,0);
});
test('sin configuración no anuncia guardado ni permite escrituras',async()=>{
  const h=createHandler({},()=>{throw Error('No debe llamar Supabase');});assert.deepEqual(await(await h(new Request('https://zain.test/api/pedidos'))).json(),{activo:false});assert.equal((await h(new Request('https://zain.test/api/pedidos?op=crear',{method:'POST'}))).status,503);
});

const consultaToken=x=>createHmac('sha256',Buffer.from(x.token_hash,'hex')).update('zain:consulta:v1:'+x.id+':'+x.consulta_nonce).digest('hex');
test('consulta exige enlace independiente y pedido con carga completa',async()=>{
  const {request,row}=setup();const read=consultaToken(row);
  assert.notEqual(read,token);assert.equal((await request('consulta',{id,token:read})).status,404);
  row.guardado_at=new Date().toISOString();
  for(const wrong of [token,'b'.repeat(64),'',undefined])assert.equal((await request('consulta',{id,token:wrong})).status,404);
  assert.equal((await request('consulta',{id,token:read})).status,200);
});
test('consulta devuelve solo datos del cliente, sin hashes, rutas ni notas internas',async()=>{
  const {request,row}=setup();row.guardado_at=new Date().toISOString();row.items[0].secreto='NO PUBLICAR';
  const r=await request('consulta',{id,token:consultaToken(row)}),s=await r.text(),body=JSON.parse(s);
  assert.equal(body.pedido.total,100);assert.equal(body.pedido.estado,'nuevo');
  for(const value of ['token_hash','consulta_nonce',row.token_hash,row.consulta_nonce,'notas_internas','PRIVADO DEL EQUIPO','NO PUBLICAR','path','version'])assert.ok(!s.includes(value),value);
});
test('enlace de consulta no lista pedidos, no escribe y no autoriza cargas',async()=>{
  const {request,row,calls}=setup();row.guardado_at=new Date().toISOString();const read=consultaToken(row);
  assert.equal((await request('finalizar',{id,token:read})).status,403);
  assert.equal((await request('subidas',{id,token:read})).status,403);
  assert.equal((await request('actualizar',{id,token:read,estado:'confirmado',version:0})).status,401);
  assert.equal((await request('lista')).status,401);
  assert.ok(!calls.some(c=>c.opts.method==='PATCH'||c.url.includes('actualizar_pedido')));
});
test('otro pedido o nonce no acepta un enlace válido para esta solicitud',async()=>{
  const {request,row}=setup();row.guardado_at=new Date().toISOString();const read=consultaToken(row);
  row.id=staffID;assert.equal((await request('consulta',{id:staffID,token:read})).status,404);
  row.id=id;row.consulta_nonce=staffID;assert.equal((await request('consulta',{id,token:read})).status,404);
});
test('archivos de consulta solo se firman tras validar el enlace y su manifiesto',async()=>{
  const {request,row,calls}=setup();row.guardado_at=new Date().toISOString();const read=consultaToken(row);
  assert.equal((await request('archivo-consulta',{id,token,item:0,kind:'render'})).status,404);
  assert.equal((await request('archivo-consulta',{id,token:read,item:1,kind:'render'})).status,404);
  assert.ok(!calls.some(c=>c.url.includes('/object/sign/')));
  const data=await(await request('archivo-consulta',{id,token:read,item:0,kind:'render'})).json();assert.ok(data.url.includes('/storage/v1/object/sign/'));
});
test('equipo puede recuperar enlace de pedidos existentes sin exponer permiso de carga',async()=>{
  const {request,row}=setup();row.guardado_at=new Date().toISOString();
  assert.equal((await request('enlace',{id})).status,401);
  const a=await(await request('enlace',{id},'Bearer valid-user')).json(),b=await(await request('enlace',{id},'Bearer valid-user')).json();
  assert.deepEqual(a,b);assert.equal(a.folio,row.folio);assert.ok(a.url.endsWith(consultaToken(row)));assert.ok(!a.url.endsWith(token));
  const privateRow=await(await request('detalle&id='+id,null,'Bearer valid-user')).json();assert.equal(privateRow.pedido.folio,row.folio);for(const field of ['consulta_nonce','token_hash'])assert.ok(!JSON.stringify(privateRow).includes(field));
});
test('guarda nombre y fecha del cliente sin bloquear la solicitud',async()=>{
  const {request,calls}=setup();
  const r=await request('crear',{id,token,items:[item],files,cliente:{nombre:'  Taller\n Ejemplo  SA ',fecha:'2026-11-20',extra:'no'}});
  assert.equal(r.status,200);
  const patch=calls.find(x=>x.opts.method==='PATCH'&&x.url.includes('/zain_pedidos?'));
  assert.ok(patch.url.includes('guardado_at=is.null'));
  assert.deepEqual(JSON.parse(patch.opts.body),{cliente:{nombre:'Taller Ejemplo SA',fecha:'2026-11-20'}});
});
test('sin nombre válido no escribe datos del cliente',async()=>{
  for(const cliente of [undefined,{nombre:'A'},{nombre:42},['x']]){
    const {request,calls}=setup();
    assert.equal((await request('crear',{id,token,items:[item],files,cliente})).status,200);
    assert.ok(!calls.some(x=>x.opts.method==='PATCH'));
  }
});
test('una fecha inválida se descarta y conserva el nombre',async()=>{
  const {request,calls}=setup();
  await request('crear',{id,token,items:[item],files,cliente:{nombre:'Ana',fecha:'mañana'}});
  assert.deepEqual(JSON.parse(calls.find(x=>x.opts.method==='PATCH').opts.body),{cliente:{nombre:'Ana'}});
});
