import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,createHmac} from 'node:crypto';
import {createHandler} from '../server/pedidos.mjs';
import {validarMovimiento,createGastos} from '../server/gastos.mjs';
const id='12345678-1234-4123-8123-123456789abc',uid='87654321-4321-4321-8321-cba987654321';
const fail=(status,message)=>{const e=Error(message);e.status=status;throw e;};
const datos=()=>({persona:'garcia',grupo:'extra',concepto:'Uber moto',importe:10000,iva_recuperable:0,fecha:'2026-10-16',comprobante:null});
function fixture({equipo=true}={}){
 const calls=[],row={id,folio:'ZAIN-FICTICIO',guardado_at:'2026-10-16',items:[{p:'no-real',nombre:'Prenda de ejemplo',color:'Negro',sku:'TEST',piezas:1}],archivos:[],estado:'cotizado',token_hash:createHash('sha256').update('a'.repeat(64)).digest('hex'),consulta_nonce:'fixture'};
 const fetcher=async(url,opt={})=>{calls.push({url,body:opt.body});let out;
 if(url.includes('/auth/v1/user'))out={id:uid,email:'fixture@example.test',email_confirmed_at:'2026-10-16'};
 else if(url.includes('/zain_accesos?'))out=equipo?[{nombre:'Prueba'}]:[];
 else if(url.includes('/zain_equipo?'))out=[{user_id:uid,nombre:'Equipo',activo:true}];
 else if(url.includes('/zain_pedidos?'))out=[row];
 else if(url.includes('/rpc/zain_finanzas_ver'))out={version:0,resumen:{venta:20000,costo:10000,utilidad:10000},movimientos:[]};
 else if(url.includes('/rpc/zain_finanzas_operar'))out=JSON.parse(opt.body).p_version===0?{version:1,resumen:{costo:20000},movimientos:[{concepto:'Uber moto'}]}:{error:'Tu compañero actualizó los gastos. Actualiza.'};
 else if(url.includes('/rpc/zain_finanzas_panel'))out={pedidos:[{id,items:row.items,finanzas:{venta:20000,costo:10000,utilidad:10000}}],siguiente:true,finanzas:{venta:100000000,costo:50000000,utilidad:50000000,cotizados:5000}};
 else throw Error('Ruta de prueba inesperada: '+url);return Response.json(out);};
 const handler=createHandler({SUPABASE_URL:'https://fixture.supabase.co',SUPABASE_SECRET_KEY:'fixture',SUPABASE_PUBLISHABLE_KEY:'fixture-public',ZAIN_SITE_URL:'https://zain.test',ZAIN_PEDIDOS_ENABLED:'true',ZAIN_GASTOS_ENABLED:'true'},fetcher);
 const token=createHmac('sha256',Buffer.from(row.token_hash,'hex')).update('zain:consulta:v1:'+id+':fixture').digest('hex');
 const call=(op,b,auth=false,params={})=>handler(new Request('https://zain.test/api/pedidos?'+new URLSearchParams({op,...params}),{method:b?'POST':'GET',headers:{Origin:'https://zain.test',...(auth?{Authorization:'Bearer solo-fixture'}:{}),...(b?{'Content-Type':'application/json'}:{})},body:b?JSON.stringify(b):undefined}));
 return {call,calls,token};
}
test('movimientos validan dinero, fecha, quién pagó y comprobante; proyectan solo campos permitidos',()=>{
 const b={modo:'gasto',request:id,version:0,datos:{...datos(),costo:111,actor:'FALSO'}};assert.deepEqual(validarMovimiento(b,fail),datos());
 for(const cambio of [{importe:0},{importe:-100},{importe:1.5},{persona:'otro'},{iva_recuperable:10001},{fecha:'2026-02-30'},{comprobante:'url-arbitraria'}])assert.throws(()=>validarMovimiento({...b,datos:{...b.datos,...cambio}},fail));
 assert.throws(()=>validarMovimiento({...b,modo:'reembolso',datos:{...datos(),verificado:false}},fail));assert.equal(validarMovimiento({...b,modo:'reembolso',datos:{...datos(),verificado:true}},fail).verificado,true);
});
test('gastos y resumen son privados para equipo: enlace de cliente y proveedor no autorizan acceso',async()=>{
 const f=fixture();for(const op of ['gastos','gastos-archivo','gastos-guardar','gastos-comprobante'])assert.equal((await f.call(op,op==='gastos'?null:{id,token:f.token},false,{id})).status,401);
 const proveedor=fixture({equipo:false});assert.equal((await proveedor.call('gastos',null,true,{id})).status,403);
 assert.equal((await f.call('gastos',null,true,{id})).status,200);
});
test('tabla utiliza resumen completo del servidor con filtros iguales a la lista, sin sumar una página',async()=>{
 const f=fixture(),out=await(await f.call('lista',null,true,{estado:'cotizado',q:'ZAIN-01!*',offset:'20',papelera:'true',periodo:'semana'})).json();
 assert.equal(out.finanzas.cotizados,5000);assert.equal(out.finanzas.venta,100000000);assert.equal(out.pedidos[0].finanzas.utilidad,10000);assert.equal(out.pedidos[0].items,undefined);
 const c=f.calls.find(c=>c.url.endsWith('/rpc/zain_finanzas_panel'));assert.deepEqual(JSON.parse(c.body),{p_estado:'cotizado',p_q:'ZAIN-01',p_papelera:true,p_semana:true,p_offset:20});
});
test('guardar usa versión, actor autenticado y solicitud idempotente; conflictos se explican sin sobrescribir',async()=>{
 const f=fixture(),b={id,version:0,request:id,modo:'gasto',datos:datos()};assert.equal((await f.call('gastos-guardar',b,true)).status,200);
 const c=f.calls.find(c=>c.url.endsWith('/rpc/zain_finanzas_operar'));assert.equal(JSON.parse(c.body).p_actor,uid);assert.equal(JSON.parse(c.body).p_request,id);
 const r=await f.call('gastos-guardar',{...b,version:1},true);assert.equal(r.status,409);assert.match((await r.json()).error,/compañero/);
});
test('consulta de cliente no recibe ni consulta costos reales, adelantos, comprobantes o reparto',async()=>{
 const f=fixture();const r=await f.call('consulta',{id,token:f.token});assert.equal(r.status,200);assert.ok(!JSON.stringify(await r.json()).includes('finanzas'));assert.ok(!f.calls.some(c=>c.url.includes('zain_finanzas')));
});
test('comprobante requiere movimiento del pedido y se firman solo rutas del almacenamiento propio',async()=>{
 const calls=[];const g=createGastos({row:async()=>({id}),fail,base:'https://fixture.supabase.co',serviceHeaders:{},fetcher:async()=>{throw Error('No debe subir');},sb:async path=>{calls.push(path);if(path.includes('/zain_pedido_movimientos?'))return [{comprobante:uid}];if(path.includes('/zain_gasto_archivos?'))return [{objeto:id+'/archivo.pdf'}];return {signedURL:'/object/sign/solo-fixture'};}});
 assert.match((await g.archivo({id,movimiento:id})).url,/^https:\/\/fixture.supabase.co\/storage\/v1\/object\/sign\//);assert.ok(calls.every(c=>!c.includes('public/zain-gastos')));
 const req=new Request('https://zain.test?op=gastos-comprobante&id='+id+'&archivo='+uid,{method:'POST',headers:{'Content-Type':'image/png'},body:'<html>archivo falso</html>'});await assert.rejects(()=>g.subir(req,new URL(req.url),{id:uid}),e=>e.status===400);
});
