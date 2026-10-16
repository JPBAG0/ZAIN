import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,createHmac} from 'node:crypto';
import {inicial,configurar,generar,calcular,entrada,paraCliente,decimal,decimalTarifa} from '../js/cotizacion-core.js';
import {createHandler} from '../server/pedidos.mjs';
const id='12345678-1234-4123-8123-123456789abc',uid='87654321-4321-4321-8321-cba987654321';
const items=[{p:'bolsa-expo',sku:'ZN-BL-001',nombreZain:'Bolsa Expo',nombre:'PROVEEDOR PRIVADO',tecnica:'Serigrafía',piezas:100,color:'Rojo',tallas:'',zona:'Frente',cm:14}];
const cfg=()=>({...inicial(),activo:true,costos:[{sku:'ZN-BL-001',tecnica:'Serigrafía',prenda:10000,aplicacion:1000,otros:500,preparacion:10000}]});
const listo=()=>{const q=generar(items,cfg());return calcular(items,{...entrada(q),impuesto:1600});};
const areaCfg=()=>({...inicial(),activo:true,rangos:[{desde:1,hasta:null,margen:4000}],prendas:[{sku:items[0].sku,prenda:10000,otros:0}],tecnicas:inicial().tecnicas.map(t=>({...t,tarifaCm2:decimalTarifa('0.0200'),preparacion:1000}))});
function areaLista(tecnica='DTF'){
 const pedido=[{...items[0],tecnica,piezas:10,cm:10}],q=generar(pedido,areaCfg()),v=entrada(q);v.partidas[0].alto=500;v.impuesto=0;
 return {pedido,q:calcular(pedido,v)};
}
test('tarifa por cm² admite seis decimales sin perder valores subcentavo',()=>{
 assert.equal(decimalTarifa('0.005'),5000);assert.equal(decimalTarifa('0.000001'),1);assert.equal(decimalTarifa('1.2345'),1234500);assert.equal(decimalTarifa('.025862'.replace(/^\./,'0.')),25862);
 for(const v of ['0.0000001','-0.1','1e2','NaN',''])assert.throws(()=>decimalTarifa(v));
});
test('tarifas guardadas antes en diezmilésimas se leen ×100 sin cambiar el costo',()=>{
 const c=areaCfg(),legacy={...c,costeo:'area_tallas_volumen_v3',tecnicas:c.tecnicas.map(t=>({...t,tarifaCm2:300}))};
 assert.deepEqual(configurar(legacy).tecnicas.map(t=>t.tarifaCm2),[30000,30000,30000]);assert.equal(configurar(configurar(legacy)).tecnicas[0].tarifaCm2,30000);
 const {pedido,q}=areaLista(),viejo={...q,schema:5,partidas:q.partidas.map(p=>({...p,tarifaCm2:p.tarifaCm2/100}))};
 const v=entrada(viejo);assert.equal(v.partidas[0].tarifaCm2,q.partidas[0].tarifaCm2);assert.equal(entrada(v).partidas[0].tarifaCm2,q.partidas[0].tarifaCm2);
 assert.equal(calcular(pedido,v).partidas[0].aplicacion,q.partidas[0].aplicacion);
});
test('las tres técnicas comparten costo de prenda pero tienen tarifas propias',()=>{
 const c=areaCfg();c.tecnicas[0].tarifaCm2=10;c.tecnicas[1].tarifaCm2=20;c.tecnicas[2].tarifaCm2=50;
 const pedido=c.tecnicas.map(t=>({...items[0],tecnica:t.tecnica,piezas:1})),q=generar(pedido,c);
 assert.deepEqual(q.partidas.map(p=>p.prenda),[10000,10000,10000]);assert.deepEqual(q.partidas.map(p=>p.tarifaCm2),[10,20,50]);assert.ok(q.partidas.every(p=>p.modo==='area'));
});
test('área rectangular, aplicación por pieza, preparación única y margen sobre costo completo',()=>{
 for(const t of ['DTF','Bordado','Serigrafía']){const {q}=areaLista(t),p=q.partidas[0];assert.equal(p.ancho,1000);assert.equal(p.alto,500);assert.equal(p.area,500000);assert.equal(p.aplicacion,100);assert.equal(p.costoUnitario,10100);assert.equal(p.costo,102000);assert.equal(p.precio,17000);assert.equal(q.total,170000);assert.equal(q.margen,4000);}
});
test('ancho conocido no supone un cuadrado; faltan altura o tarifa y se bloquea publicación',()=>{
 const pedido=[{...items[0],tecnica:'DTF'}],q=generar(pedido,areaCfg());assert.equal(q.partidas[0].ancho,1400);assert.equal(q.partidas[0].alto,null);assert.equal(q.partidas[0].aplicacion,null);assert.equal(q.preparada,false);
 for(const diff of [{alto:null},{tarifaCm2:null},{prenda:null}]){const {q:base,pedido:ps}=areaLista(),v=entrada(base);Object.assign(v.partidas[0],diff,{precio:99999});const pending=calcular(ps,v);assert.equal(pending.preparada,false);assert.throws(()=>paraCliente(pending));}
});
test('área y aplicación recibidas no se confían: recalcula y redondea una vez a centavos',()=>{
 const {pedido,q}=areaLista(),v=entrada(q);Object.assign(v.partidas[0],{ancho:101,alto:101,tarifaCm2:5000,area:1,aplicacion:99999});const p=calcular(pedido,v).partidas[0];assert.equal(p.area,10201);assert.equal(p.aplicacion,1);
 for(const diff of [{ancho:0},{alto:-1},{ancho:20001},{alto:NaN},{tarifaCm2:1.5},{modo:'inventado'},{tarifaCm2:Number.MAX_SAFE_INTEGER}])assert.throws(()=>calcular(pedido,{...v,partidas:[{...v.partidas[0],...diff}]}));
});
test('cero en tarifa es explícito y se distingue de costo desconocido',()=>{
 const {q,pedido}=areaLista(),v=entrada(q);v.partidas[0].tarifaCm2=0;const p=calcular(pedido,v);assert.equal(p.partidas[0].aplicacion,0);assert.equal(p.preparada,true);
});
test('la configuración valida SKU y técnica únicos, montos y límite de precisión interna',()=>{
 const c=areaCfg();for(const diff of [{prendas:[...c.prendas,...c.prendas]},{tecnicas:[c.tecnicas[0],c.tecnicas[0],c.tecnicas[2]]},{tecnicas:c.tecnicas.slice(1)},{prendas:[{...c.prendas[0],prenda:-1}]},{tecnicas:c.tecnicas.map(t=>({...t,tarifaCm2:0.5}))}])assert.throws(()=>configurar({...c,...diff}));
});
test('configuración y borradores previos conservan aplicación fija; migración de SKU expresa cambia solo solicitudes nuevas',()=>{
 const anterior=cfg(),q=generar(items,anterior);assert.equal(q.partidas[0].modo,'fijo');assert.equal(q.partidas[0].aplicacion,1000);
 const nueva={...areaCfg(),costos:anterior.costos};assert.equal(generar(items,nueva).partidas[0].modo,'area');
 const legacy={...listo(),schema:2,partidas:listo().partidas.map(({modo,ancho,alto,tarifaCm2,area,...p})=>p)};const old=calcular(items,entrada(legacy));assert.equal(old.total,legacy.total);assert.equal(old.partidas[0].modo,'fijo');
});
test('cliente recibe una partida con prenda y técnica sumadas, sin medidas de costeo o tarifas',()=>{
 const {q}=areaLista(),pub=paraCliente(q);assert.equal(pub.partidas.length,1);assert.equal(pub.partidas[0].precio,17000);assert.equal(pub.partidas[0].tecnica,'DTF');
 for(const k of ['ancho','alto','area','tarifaCm2','aplicacion','prenda','preparacion','modo','margenObjetivo','costo'])assert.ok(!JSON.stringify(pub).includes('"'+k+'"'),k);
});
test('decimal conserva centavos y rechaza negativos, NaN, exponentes y exceso de precisión',()=>{assert.equal(decimal('1.15'),115);assert.equal(decimal('0'),0);for(const n of ['NaN','-1','1.111','1e3','Infinity',''])assert.throws(()=>decimal(n));});
test('los rangos cubren cantidades sin traslapes ni huecos; cero piezas no es rango comercial',()=>{for(const rangos of [[{desde:0,hasta:null,recargo:5000}],[{desde:1,hasta:10,recargo:5000},{desde:10,hasta:null,recargo:4500}],[{desde:1,hasta:10,recargo:5000},{desde:12,hasta:null,recargo:4500}],[{desde:1,hasta:10,recargo:5000}]])assert.throws(()=>configurar({...cfg(),rangos}));});
test('costos desconocidos nunca se vuelven cero y un precio manual no permite publicarlos',()=>{const q=generar(items,inicial());assert.equal(q.costo,null);assert.equal(q.total,null);assert.equal(q.preparada,false);assert.throws(()=>paraCliente(q));const manual=calcular(items,{...entrada(q),impuesto:0,partidas:[{...entrada(q).partidas[0],precio:15000}]});assert.equal(manual.preparada,false);assert.equal(manual.costo,null);});
test('preparación se reparte y margen bruto se calcula sobre venta; tasas calculadas sobre totales',()=>{const q=listo();assert.equal(q.costo,1160000);assert.equal(q.partidas[0].precio,15467);assert.equal(q.subtotal,1546700);assert.equal(q.impuestos,247472);assert.equal(q.total,1794172);assert.equal(q.utilidad,386700);assert.equal(q.margen,2500);});
test('cambio de rango se aplica por partida sin sumar diseños, técnicas o productos',()=>{const x=[{...items[0],piezas:14},{...items[0],piezas:15}];const q=generar(x,cfg());assert.equal(q.partidas[0].margenObjetivo,4000);assert.equal(q.partidas[1].margenObjetivo,3500);});
test('margen bruto de 40% divide por 0.6; 30% divide por 0.7; cero vende al costo',()=>{
 for(const [margen,esperado] of [[4000,16667],[3000,14286],[0,10000]]){
  const config={...cfg(),rangos:[{desde:1,hasta:null,margen}],costos:[{...cfg().costos[0],prenda:10000,aplicacion:0,otros:0,preparacion:0}]};
  const q=generar([{...items[0],piezas:1}],config);assert.equal(q.partidas[0].precio,esperado);
 }
});
test('margen 100%, negativo, NaN o fuera de rango se rechaza sin divisiones por cero',()=>{
 for(const margen of [10000,10001,-1,NaN,Infinity,'4000'])assert.throws(()=>configurar({...cfg(),rangos:[{desde:1,hasta:null,margen}]}));
 const q=listo();assert.throws(()=>calcular(items,{...entrada(q),partidas:[{...entrada(q).partidas[0],margenObjetivo:10000}]}));
});
test('un descuento adicional reduce el margen final sobre la venta sin cambiar el objetivo',()=>{
 const c={...cfg(),rangos:[{desde:1,hasta:null,margen:4000}],costos:[{...cfg().costos[0],prenda:6000,aplicacion:0,otros:0,preparacion:0}]};
 const q=generar([{...items[0],piezas:10}],c),v=entrada(q);v.partidas[0].descuento=1000;v.impuesto=0;
 const result=calcular([{...items[0],piezas:10}],v);assert.equal(result.margen,3333);assert.equal(result.partidas[0].margenObjetivo,4000);assert.equal(result.total,90000);
});
test('configuración histórica se convierte y exige revisión; borrador anterior conserva precio exacto',()=>{
 const old=configurar({activo:true,rangos:[{desde:1,hasta:null,recargo:5000}],costos:cfg().costos});assert.equal(old.activo,false);assert.equal(old.rangos[0].margen,3333);
 const legacy={...listo(),schema:1,partidas:[{...listo().partidas[0],recargo:5000,margenObjetivo:undefined,precio:17400,precioManual:null}]};
 const migrated=calcular(items,entrada(legacy));assert.equal(migrated.partidas[0].precio,17400);assert.equal(migrated.partidas[0].precioManual,17400);assert.equal(migrated.partidas[0].margenObjetivo,3333);
});
test('descuentos, precio manual, flete, impuesto cero y redondeo medio centavo',()=>{const q=listo(),v=entrada(q);v.partidas[0].precio=15001;v.partidas[0].descuento=500;v.envio=15000;v.costoEnvio=10000;v.impuesto=0;const r=calcular(items,v);assert.equal(r.partidas[0].bruto,1500100);assert.equal(r.partidas[0].rebaja,75005);assert.equal(r.subtotal,1440095);assert.equal(r.total,1440095);assert.equal(r.costo,1170000);const x=calcular([{...items[0],piezas:1}],{...v,partidas:[{...v.partidas[0],precio:1,descuento:5000}]});assert.equal(x.partidas[0].rebaja,1);});
test('no se confía en importes, piezas ni campos de compras enviados por el navegador',()=>{const q=listo(),v={...entrada(q),total:1,costo:0,partidas:[{...entrada(q).partidas[0],piezas:999,skuProveedor:'SECRETO',importe:1}]};const r=calcular(items,v);assert.equal(r.partidas[0].piezas,100);assert.equal(r.total,q.total);const pub=paraCliente(r);for(const k of ['costo','prenda','aplicacion','preparacion','recargo','margen','utilidad','margenObjetivo','skuProveedor','fabricante'])assert.ok(!JSON.stringify(pub).includes('"'+k+'"'),k);});
test('no se aceptan montos negativos, descuentos mayores a 100%, índices alterados o desborde',()=>{const q=listo();for(const diff of [{precio:-1},{descuento:10001},{indice:2},{precio:Number.MAX_SAFE_INTEGER}])assert.throws(()=>calcular(items,{...entrada(q),partidas:[{...entrada(q).partidas[0],...diff}]}));});
function fixture({member=true,archived=false,conflict=false,quote=null,pricing=cfg()}={}){
 const calls=[],row={id,folio:'ZAIN-FICTICIO',created_at:'2026-10-15',guardado_at:'2026-10-15',archivado_at:archived?'2026-10-15':null,estado:'nuevo',version:1,token_hash:createHash('sha256').update('a'.repeat(64)).digest('hex'),consulta_nonce:'nonce',total:100,items,archivos:[]};
 let saved=quote;
 const fetcher=async(url,options={})=>{calls.push(url);if(url.includes('/auth/v1/user'))return Response.json({id:uid,email:'staff@example.test',email_confirmed_at:'2026-10-15'});if(url.includes('/zain_accesos?'))return Response.json(member?[{nombre:'Equipo'}]:[]);if(url.includes('/zain_equipo?'))return Response.json([{user_id:uid,nombre:'Equipo',activo:true}]);if(url.includes('/zain_pedidos?'))return Response.json([row]);if(url.includes('/zain_precios_config?'))return Response.json([{version:0,datos:pricing}]);
 if(url.includes('/zain_cotizaciones?'))return Response.json(saved?[url.includes('select=publicada&')?{publicada:saved.publicada}:saved]:[]);
 if(url.includes('/rpc/zain_cotizacion_guardar')){const b=JSON.parse(options.body);if(conflict)return Response.json(null);if(b.p_modo==='iniciar'){saved||={version:1,borrador:b.p_borrador,publicada:null};}else{assert.equal(b.p_actor,uid);saved={...saved,version:saved.version+1,borrador:b.p_borrador,publicada:b.p_modo==='publicar'?{...b.p_publicada,folio:row.folio,revision:saved.version+1}:b.p_modo==='retirar'?null:saved.publicada};}return Response.json(saved);}
 throw Error('Ruta inesperada '+url);};
 const h=createHandler({SUPABASE_URL:'https://p.supabase.co',SUPABASE_SECRET_KEY:'test-secret',SUPABASE_PUBLISHABLE_KEY:'test-public',ZAIN_SITE_URL:'https://zain.test',ZAIN_PEDIDOS_ENABLED:'true',ZAIN_COTIZACIONES_ENABLED:'true'},fetcher);
 const call=(op,b,auth=true)=>h(new Request('https://zain.test/api/pedidos?op='+op,{method:b?'POST':'GET',headers:{Origin:'https://zain.test',...(auth?{Authorization:'Bearer test'}:{}),...(b?{'Content-Type':'application/json'}:{})},body:b?JSON.stringify(b):undefined}));
 const token=createHmac('sha256',Buffer.from(row.token_hash,'hex')).update('zain:consulta:v1:'+id+':nonce').digest('hex');return {call,calls,row,token};
}
test('anónimo, cliente y usuario ajeno no leen costos ni editan cotizaciones',async()=>{for(const op of ['precios-config','cotizacion&id='+id]){const f=fixture();assert.equal((await f.call(op,null,false)).status,401);const other=fixture({member:false});assert.equal((await other.call(op)).status,403);}const f=fixture();assert.equal((await f.call('cotizacion-publicar',{id,version:1},false)).status,401);assert.ok(!f.calls.some(s=>s.includes('/zain_cotizaciones')));});
test('borrador automático no se filtra por consulta del cliente; solo la proyección publicada',async()=>{const f=fixture();const got=await(await f.call('cotizacion&id='+id)).json();assert.equal(got.cotizacion.version,1);assert.equal((await(await f.call('consulta',{id,token:f.token},false)).json()).pedido.cotizacion,null);const response=await f.call('cotizacion-guardar',{id,version:1,borrador:entrada(listo())});assert.equal(response.status,200);assert.equal((await f.call('cotizacion-publicar',{id,version:2})).status,200);const pub=await(await f.call('consulta',{id,token:f.token},false)).json();assert.equal(pub.pedido.cotizacion.total,listo().total);assert.ok(!JSON.stringify(pub).includes('PROVEEDOR PRIVADO'));assert.ok(!JSON.stringify(pub).includes('"costo"'));});
test('editar el siguiente borrador conserva la revisión publicada hasta volver a publicar',async()=>{const original={...paraCliente(listo()),folio:'ZAIN-FICTICIO',revision:2},f=fixture({quote:{version:2,borrador:listo(),publicada:original}});const b=entrada(listo());b.partidas[0].precio=18000;assert.equal((await f.call('cotizacion-guardar',{id,version:2,borrador:b})).status,200);const v=await(await f.call('consulta',{id,token:f.token},false)).json();assert.equal(v.pedido.cotizacion.total,original.total);assert.equal((await f.call('cotizacion-retirar',{id,version:3})).status,200);assert.equal((await(await f.call('consulta',{id,token:f.token},false)).json()).pedido.cotizacion,null);});
test('versiones en conflicto, pedido archivado, cancelado y borrador incompleto no se publican',async()=>{const a=fixture({archived:true});assert.equal((await a.call('cotizacion&id='+id)).status,409);const f=fixture({quote:{version:2,borrador:generar(items,inicial()),publicada:null}});assert.equal((await f.call('cotizacion-publicar',{id,version:1})).status,409);assert.equal((await f.call('cotizacion-publicar',{id,version:2})).status,400);const g=fixture({quote:{version:2,borrador:listo(),publicada:null},conflict:true});assert.equal((await g.call('cotizacion-publicar',{id,version:2})).status,409);const z=fixture({quote:{version:2,borrador:listo(),publicada:null}});z.row.estado='cancelado';assert.equal((await z.call('cotizacion-publicar',{id,version:2})).status,409);});
test('pestañas anteriores no pueden borrar tarifas o guardar el esquema de costos previo',async()=>{
 const f=fixture({quote:{version:1,borrador:listo(),publicada:null}});
 assert.equal((await f.call('precios-guardar',{version:0,datos:{...cfg(),costeo:undefined}})).status,409);
 assert.equal((await f.call('cotizacion-guardar',{id,version:1,borrador:{...entrada(listo()),schema:2}})).status,409);
});
test('abrir para revisión carga costos guardados aunque preparación automática esté desactivada',async()=>{
 const f=fixture({pricing:{...areaCfg(),activo:false}}),r=await(await f.call('cotizacion&id='+id)).json(),p=r.cotizacion.borrador.partidas[0];
 assert.equal(p.prenda,10000);assert.equal(p.tarifaCm2,20000);assert.equal(p.preparacion,1000);assert.equal(p.modo,'area');
});
test('guardar y publicar área en servidor conserva solo el precio combinado en consulta de cliente',async()=>{
 const f=fixture({quote:{version:1,borrador:generar(items,areaCfg()),publicada:null}}),draft=entrada(generar(items,areaCfg()));draft.partidas[0].alto=500;draft.impuesto=0;
 const saved=await(await f.call('cotizacion-guardar',{id,version:1,borrador:draft})).json();assert.equal(saved.cotizacion.borrador.partidas[0].aplicacion,140);
 assert.equal((await f.call('cotizacion-publicar',{id,version:2})).status,200);
 const response=await(await f.call('consulta',{id,token:f.token},false)).json(),p=response.pedido.cotizacion.partidas;
 assert.equal(p.length,1);assert.equal(p[0].precio,saved.cotizacion.borrador.partidas[0].precio);
 for(const k of ['tarifaCm2','ancho','alto','area','prenda','aplicacion','margenObjetivo'])assert.ok(!JSON.stringify(response).includes('"'+k+'"'),k);
});

test('abrir borrador histórico sincroniza tarifas una vez y mantiene la publicación del cliente',async()=>{
 const pricing=areaCfg();pricing.activo=false;pricing.tecnicas[1].tarifaCm2=2000000;
 const old=generar(items,inicial()),draft=entrada(old);draft.partidas[0].alto=500;draft.partidas[0].precio=19000;draft.partidas[0].descuento=500;
 const publicada={...paraCliente(listo()),revision:1},f=fixture({pricing,quote:{version:1,borrador:calcular(items,draft),publicada}});
 const first=await(await f.call('cotizacion&id='+id)).json();assert.equal(first.cotizacion.version,2);assert.equal(first.cotizacion.borrador.partidas[0].tarifaCm2,2000000);assert.equal(first.cotizacion.borrador.partidas[0].alto,500);assert.equal(first.cotizacion.borrador.partidas[0].precioManual,19000);
 const second=await(await f.call('cotizacion&id='+id)).json();assert.equal(second.cotizacion.version,2);assert.deepEqual(second.cotizacion.publicada,publicada);
 const client=await(await f.call('consulta',{id,token:f.token},false)).json();assert.equal(client.pedido.cotizacion.total,publicada.total);assert.ok(!JSON.stringify(client).includes('origenCostos'));
});
test('actualizar costos conserva cambios de la revisión y usa control de versión',async()=>{
 const pricing=areaCfg(),f=fixture({pricing}),first=await(await f.call('cotizacion&id='+id)).json();const v=entrada(first.cotizacion.borrador);v.partidas[0].alto=500;v.partidas[0].precio=18000;v.partidas[0].descuento=300;pricing.tecnicas[1].tarifaCm2=2000000;
 const result=await f.call('cotizacion-costos',{id,version:1,borrador:v});assert.equal(result.status,200);const r=await result.json();assert.equal(r.cotizacion.borrador.partidas[0].tarifaCm2,2000000);assert.equal(r.cotizacion.borrador.partidas[0].precioManual,18000);assert.equal(r.cotizacion.borrador.partidas[0].descuento,300);assert.equal((await f.call('cotizacion-costos',{id,version:1,borrador:v})).status,409);
});
test('el costo por área sube al siguiente centavo: 40 cm² × $0.025862 = $1.03448 → $1.04',()=>{
 const {pedido,q}=areaLista(),v=entrada(q);Object.assign(v.partidas[0],{ancho:1000,alto:400,tarifaCm2:decimalTarifa('0.025862')});
 assert.equal(calcular(pedido,v).partidas[0].aplicacion,104);
 Object.assign(v.partidas[0],{ancho:1000,alto:1000,tarifaCm2:decimalTarifa('0.02')});assert.equal(calcular(pedido,v).partidas[0].aplicacion,200);
});
