import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,createHmac} from 'node:crypto';
import {createHandler} from '../server/pedidos.mjs';
const id='12345678-1234-4123-8123-123456789abc',staff='87654321-4321-4321-8321-cba987654321';
const env={SUPABASE_URL:'https://p.supabase.co',SUPABASE_SECRET_KEY:'test-secret',SUPABASE_PUBLISHABLE_KEY:'test-public',ZAIN_PEDIDOS_ENABLED:'true',ZAIN_SITE_URL:'https://zain.test'};
function fixture({archived=false,conflict=false}={}){
 const row={id,folio:'ZAIN-PRUEBA',guardado_at:'2026-10-14',created_at:'2026-10-14',consulta_nonce:'prueba',token_hash:createHash('sha256').update('a'.repeat(64)).digest('hex'),version:3,estado:'nuevo',total:100,archivado_at:archived?'2026-10-14':null,items:[{p:'bolsa-expo',nombre:'Bolsa Expo',color:'Rojo'}],archivos:[]};
 const calls=[];
 const fetcher=async(url,o={})=>{
  calls.push({url,o});
  if(url.includes('/auth/v1/user'))return Response.json({id:staff,email:'staff@example.test',email_confirmed_at:'2026-10-13'});
  if(url.includes('/zain_accesos?'))return Response.json([{nombre:'Equipo'}]);
  if(url.includes('/zain_equipo?'))return Response.json([{user_id:staff,nombre:'Equipo',activo:true}]);
  if(url.includes('/rpc/zain_panel_resumen'))return Response.json({solicitudes_semana:78,por_revisar:32,confirmados:4,produccion:9,entregados:21,activos:100,papelera:12,semana_desde:'2026-10-12T06:00:00+00:00'});
  if(url.includes('/rpc/zain_archivar_pedido')){
   if(conflict)return Response.json(null);
   const b=JSON.parse(o.body);row.archivado_at=b.p_archivar?'2026-10-14':null;row.version++;return Response.json(row);
  }
  if(url.includes('/zain_pedidos?'))return Response.json(url.includes('&limit=21')?Array.from({length:21},()=>row):[row]);
  if(url.includes('/zain_historial?'))return Response.json([]);
  throw Error('Ruta inesperada '+url);
 };
 const h=createHandler(env,fetcher);
 const call=(op,body,auth=true)=>h(new Request('https://zain.test/api/pedidos?op='+op,{method:body?'POST':'GET',headers:{Origin:'https://zain.test',...(body?{'Content-Type':'application/json'}:{}),...(auth?{Authorization:'Bearer staff-test'}:{})},body:body?JSON.stringify(body):undefined}));
 return {call,calls,row};
}
test('resumen y papelera requieren equipo autorizado; consulta del cliente no los autoriza',async()=>{
 const f=fixture();
 assert.equal((await f.call('resumen',null,false)).status,401);
 assert.equal((await f.call('archivar',{id,version:3,archivar:true,folio:'ZAIN-PRUEBA'},false)).status,401);
 assert.ok(!f.calls.some(c=>c.url.includes('/rpc/')));
});
test('resumen no depende de la primera página y lista usa 20 más centinela sin notas privadas',async()=>{
 const f=fixture(),res=await(await f.call('resumen')).json();assert.equal(res.resumen.activos,100);
 const list=await(await f.call('lista')).json();assert.equal(list.pedidos.length,20);assert.equal(list.siguiente,true);
 const url=f.calls.find(c=>c.url.includes('&limit=21')).url;assert.match(url,/archivado_at=is.null/);assert.ok(!url.includes('notas_internas'));
 assert.equal(list.pedidos[0].resumen,'Bolsa Expo');assert.ok(!('items' in list.pedidos[0]));
});
test('filtros de papelera y semana se aplican en el servidor',async()=>{
 const f=fixture();await f.call('lista&papelera=true&periodo=semana&offset=20');
 const url=f.calls.find(c=>c.url.includes('&limit=21')).url;
 assert.match(url,/archivado_at=not.is.null/);assert.ok(url.includes('created_at=gte.'));assert.ok(url.includes('offset=20'));
});
test('eliminar exige folio y versión; restaura sin borrar filas ni archivos',async()=>{
 const f=fixture();
 assert.equal((await f.call('archivar',{id,version:3,archivar:true,folio:'otro'})).status,400);
 assert.equal((await f.call('archivar',{id,version:3,archivar:'true',folio:'ZAIN-PRUEBA'})).status,400);
 assert.ok(!f.calls.some(c=>c.url.includes('/rpc/zain_archivar')));
 assert.equal((await f.call('archivar',{id,version:3,archivar:true,folio:'ZAIN-PRUEBA'})).status,200);
 const rpc=f.calls.find(c=>c.url.includes('/rpc/zain_archivar'));assert.equal(JSON.parse(rpc.o.body).p_actor,staff);assert.equal(f.row.version,4);
 assert.equal((await f.call('archivar',{id,version:4,archivar:false})).status,200);assert.equal(f.row.archivado_at,null);
 assert.ok(!f.calls.some(c=>c.o.method==='DELETE'||c.url.includes('/storage/')));
});
test('conflicto de versión en papelera se devuelve para evitar sobreescrituras',async()=>{
 const f=fixture({conflict:true});assert.equal((await f.call('archivar',{id,version:3,archivar:true,folio:'ZAIN-PRUEBA'})).status,409);
});
test('pedido retirado no se consulta con un enlace de cliente todavía válido',async()=>{
 const f=fixture({archived:true}),token=createHmac('sha256',Buffer.from(f.row.token_hash,'hex')).update('zain:consulta:v1:'+id+':prueba').digest('hex');
 assert.equal((await f.call('consulta',{id,token},false)).status,404);
 assert.equal((await f.call('enlace',{id})).status,409);
 assert.equal((await f.call('detalle&id='+id)).status,200);
});

