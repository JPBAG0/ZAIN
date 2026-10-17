import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,createHmac} from 'node:crypto';
import {createHandler} from '../server/pedidos.mjs';
import {seguimientoDe} from '../server/cotizacion-seguimiento.mjs';
import {pagosIniciales,normalizarPagos,anticipoDe} from '../js/cotizacion-pagos.js';
import {inicial,generar,entrada,calcular,paraCliente} from '../js/cotizacion-core.js';
import {datosPDF} from '../js/cotizacion-pdf.js';
const id='12345678-1234-4123-8123-123456789abc',uid='87654321-4321-4321-8321-cba987654321';
const items=[{sku:'TEST',nombre:'Playera',color:'Negro',tecnica:'Bordado',piezas:5,cm:10}];
function fixture(){
 const row={id,folio:'ZAIN-FICTICIO',created_at:'2026-10-15',guardado_at:'2026-10-15',estado:'cotizado',version:1,token_hash:createHash('sha256').update('a'.repeat(64)).digest('hex'),consulta_nonce:'nonce',total:5,items,archivos:[]};
 let publicada={revision:4,total:20001,pagos:pagosIniciales()},aceptacion=null,pagos=[],aceptarCalls=0;const historial=[];
 const calls=[];const fetcher=async(url,options={})=>{
  calls.push(url);let out;
  if(url.includes('/auth/v1/user'))out={id:uid,email:'staff@example.test',email_confirmed_at:'2026-10-15'};
  else if(url.includes('/zain_accesos?'))out=[{nombre:'Equipo'}];else if(url.includes('/zain_equipo?'))out=[{user_id:uid,nombre:'Equipo',activo:true}];
  else if(url.includes('/zain_pedidos?'))out=[row];else if(url.includes('/zain_cotizaciones?'))out=[{version:8,publicada}];
  else if(url.includes('/rpc/zain_seguimiento_cotizacion'))out=seguimientoDe(publicada,aceptacion,pagos);
  else if(url.includes('/rpc/zain_cotizacion_aceptar')){const b=JSON.parse(options.body);if(b.p_revision!==publicada.revision||row.estado==='cancelado')out=null;else {aceptacion||={revision:publicada.revision,aceptada_at:'2026-10-16T16:00:00Z'};row.estado='aceptado';aceptarCalls++;out=aceptacion;}}
  else if(url.includes('/rpc/zain_registrar_pago')){const b=JSON.parse(options.body);if(!aceptacion||b.p_revision!==publicada.revision)out=null;else if(pagos.some(p=>p.id===b.p_request))out={registrado:true,repetido:true};else{pagos.push({id:b.p_request,revision:publicada.revision,importe:b.p_importe});out={registrado:true};if(pagos.reduce((n,p)=>n+p.importe,0)>=anticipoDe(publicada.total,publicada.pagos))row.estado='confirmado';}}
  else if(url.endsWith('/rest/v1/zain_historial')){historial.push(JSON.parse(options.body));out=null;}
  else throw Error('Ruta inesperada');return Response.json(out);
 };
 const handler=createHandler({SUPABASE_URL:'https://p.supabase.co',SUPABASE_SECRET_KEY:'test-secret',SUPABASE_PUBLISHABLE_KEY:'test-public',ZAIN_SITE_URL:'https://zain.test',ZAIN_PEDIDOS_ENABLED:'true',ZAIN_COTIZACIONES_ENABLED:'true',ZAIN_CONFIRMACION_ENABLED:'true'},fetcher);
 const token=createHmac('sha256',Buffer.from(row.token_hash,'hex')).update('zain:consulta:v1:'+id+':nonce').digest('hex');
 const call=(op,b,auth=false)=>handler(new Request('https://zain.test/api/pedidos?op='+op,{method:b?'POST':'GET',headers:{Origin:'https://zain.test',...(auth?{Authorization:'Bearer test'}:{}),...(b?{'Content-Type':'application/json'}:{})},body:b?JSON.stringify(b):undefined}));
 return {call,token,row,calls,pagos,publicada,historial,get aceptacion(){return aceptacion;}};
}
test('términos de pago se validan y anticipo redondea en centavos sin recargo ni pérdida de saldo',()=>{
 assert.equal(anticipoDe(20001,pagosIniciales()),10001);assert.equal(20001-anticipoDe(20001,pagosIniciales()),10000);assert.equal(anticipoDe(10000,null),null);
 for(const anticipo of [-1,10001,50.5,NaN,'5000'])assert.throws(()=>normalizarPagos({anticipo,instrucciones:''}));
});
test('borrador nuevo propone50%, histórico sin términos no recibe condiciones retroactivas y cliente no recibe extras',()=>{
 const q=generar(items,inicial());assert.equal(q.pagos.anticipo,5000);const input={...entrada(q),pagos:undefined};assert.equal(calcular(items,input).pagos,null);
 const v=entrada(q);v.impuesto=0;Object.assign(v.partidas[0],{prenda:10000,modo:'fijo',aplicacion:0});v.pagos={anticipo:3000,instrucciones:'Pago por acordar',proveedor:'NO-MOSTRAR'};
 const p=paraCliente(calcular(items,v));assert.deepEqual(p.pagos,{anticipo:3000,instrucciones:'Pago por acordar'});assert.ok(!JSON.stringify(p).includes('NO-MOSTRAR'));
 const pdf=datosPDF({...p,pagos:v.pagos});assert.deepEqual(pdf.pagos,p.pagos);assert.ok(!JSON.stringify(pdf).includes('NO-MOSTRAR'));
});
test('aceptar exige enlace válido, consentimiento y revisión actual; no autoriza un pago',async()=>{
 const f=fixture();assert.equal((await f.call('cotizacion-aceptar',{id,token:'b'.repeat(64),revision:4,acepto:true})).status,404);assert.ok(!f.aceptacion);
 assert.equal((await f.call('cotizacion-aceptar',{id,token:f.token,revision:4,acepto:false})).status,400);
 assert.equal((await f.call('cotizacion-aceptar',{id,token:f.token,revision:3,acepto:true})).status,409);
 const accepted=await f.call('cotizacion-aceptar',{id,token:f.token,revision:4,acepto:true});assert.equal(accepted.status,200);assert.equal(f.row.estado,'aceptado');assert.equal(f.pagos.length,0);
 const consulta=await(await f.call('consulta',{id,token:f.token})).json();assert.ok(consulta.pedido.seguimiento.aceptada_at);assert.equal(consulta.pedido.seguimiento.recibido,0);assert.ok(!JSON.stringify(consulta).includes('token_hash'));
 assert.equal((await f.call('cotizacion-pago',{id,revision:4,importe:10001,request:id,referencia:'',verificado:true})).status,401);
});
test('equipo registra solo pagos verificados y reintento conserva solicitud; sumas de la revisión exacta',async()=>{
 const f=fixture();await f.call('cotizacion-aceptar',{id,token:f.token,revision:4,acepto:true});const pago={id,revision:4,importe:10001,request:id,referencia:'Verificado internamente',verificado:true};
 assert.equal((await f.call('cotizacion-pago',{...pago,verificado:false},true)).status,400);
 assert.equal((await f.call('cotizacion-pago',pago,true)).status,200);assert.equal(f.row.estado,'confirmado');assert.equal((await f.call('cotizacion-pago',pago,true)).status,200);assert.equal(f.pagos.length,1);
 const d=await(await f.call('consulta',{id,token:f.token})).json();assert.equal(d.pedido.seguimiento.recibido,10001);assert.equal(d.pedido.seguimiento.saldo,10000);assert.ok(!JSON.stringify(d).includes('Verificado internamente'));
 f.publicada.revision=5;assert.equal((await f.call('cotizacion-aceptar',{id,token:f.token,revision:4,acepto:true})).status,409);
});
test('equipo registra la aceptación hecha por WhatsApp: exige sesión y confirmación, queda atribuida y permite cobrar',async()=>{
 const f=fixture(),b={id,revision:4,acepto:true};
 assert.equal((await f.call('cotizacion-aceptar-equipo',b)).status,401);
 assert.equal((await f.call('cotizacion-aceptar-equipo',{...b,acepto:false},true)).status,400);
 assert.equal((await f.call('cotizacion-aceptar-equipo',{...b,revision:3},true)).status,409);
 const r=await f.call('cotizacion-aceptar-equipo',b,true);assert.equal(r.status,200);assert.equal(f.row.estado,'aceptado');
 assert.equal(f.historial.length,1);assert.equal(f.historial[0].actor,uid);assert.match(f.historial[0].notas,/registrada por el equipo/);
 assert.equal((await f.call('cotizacion-pago',{id,revision:4,importe:20001,request:id,referencia:'',verificado:true},true)).status,200);assert.equal(f.row.estado,'confirmado');
});
