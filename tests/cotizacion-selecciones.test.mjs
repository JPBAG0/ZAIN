import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import C from '../js/config.js';
import {inicial,generar,calcular,entrada,paraCliente} from '../js/cotizacion-core.js';
import {itemsDe,itemCatalogo,modificarSelecciones,calcularSeleccion} from '../js/cotizacion-selecciones.js';
import {validarSelecciones} from '../server/cotizacion-selecciones.mjs';
import {createHandler,validateOrder} from '../server/pedidos.mjs';
const modulo=process.env.ZAIN_PGLITE_MODULE,uid=randomUUID(),id=randomUUID();let db;
const fail=(status,message)=>{throw Object.assign(Error(message),{status});};
const p=C.productos.find(p=>p.tallas?.length&&p.activo!==false),color=C.colores.find(c=>c.id===p.colores[0]),zona=p.zonas[0],talla=p.tallas[0],segunda=p.tallas[1];
const item=(cantidades,producto=p)=>itemCatalogo(producto,C.colores.find(c=>c.id===producto.colores[0]),'Solo prenda',producto.zonas[0],0,cantidades,12);
const cfg={...inicial(),activo:true,prendas:C.productos.filter(p=>p.sku).map(p=>({sku:p.sku,prenda:10000,otros:0})),rangos:[{desde:1,hasta:null,margen:3000}]};
const pedido=()=>({id,folio:'ZAIN-FICTICIO',estado:'cotizado',version:2,partidas_version:0,items:[item({[talla]:12})],archivos:[],guardado_at:new Date().toISOString(),archivado_at:null});
const inicialQ=(x=pedido())=>{const g=generar(x.items,cfg),e=entrada(g);e.impuesto=1600;e.partidas.forEach(v=>v.precio=20000);return calcular(x.items,e);};
const pub=q=>({...paraCliente(q),revision:1});
const filas=(x,q,cambios)=>cambios.map((s,i)=>({origen:s.origen,anterior:s.anterior??s.origen,item:s.item}));
test('cambiar cantidades conserva el precio escrito, cargos e IVA y no altera el pedido original',()=>{
 const x=pedido(),q=inicialQ(x);q.cargos=[{concepto:'Cargo revisado',importe:1000,costo:500}];const nueva=modificarSelecciones(x,q,[{origen:0,anterior:0,item:item({[talla]:8,[segunda]:5})}],cfg);
 assert.equal(nueva.partidas[0].piezas,13);assert.equal(nueva.partidas[0].precioManual,20000);assert.equal(nueva.impuesto,1600);assert.equal(nueva.cargos[0].importe,1000);assert.equal(x.items[0].piezas,12);assert.equal(nueva.total,302760);
});
test('quitar y duplicar mantiene los precios de cada partida y renumera el borrador',()=>{
 const x=pedido();x.items.push(item({[segunda]:12}));const q=inicialQ(x),e=entrada(q);e.partidas[1].precio=35000;const guardada=calcular(x.items,e),f={origen:1,anterior:1,item:x.items[1]};
 const nueva=modificarSelecciones(x,guardada,[f,{...f,item:{...f.item,piezas:13,tallasDetalle:{[segunda]:13},tallas:segunda+' 13'}}],cfg);assert.deepEqual(nueva.partidas.map(p=>p.indice),[0,1]);assert.deepEqual(nueva.partidas.map(p=>p.precioManual),[35000,35000]);assert.deepEqual(nueva.selecciones.map(s=>s.origen),[1,1]);assert.equal(x.items.length,2);
});
test('validación del servidor rechaza tallas, sumas y referencias ajenas; no acepta archivos aportados por el navegador',()=>{
 const x=pedido(),buena=[{origen:null,item:item({[talla]:12})}];assert.equal(validarSelecciones(buena,x,C,validateOrder,fail)[0].item.tieneLogo,false);
 for(const lista of [[],[{origen:99,item:x.items[0]}],[{origen:0,item:{...x.items[0],tallasDetalle:{INVENTADA:12}}}],[{origen:null,item:{...x.items[0],piezas:13}}]])assert.throws(()=>validarSelecciones(lista,x,C,validateOrder,fail),{status:400});
 const inyectada=validarSelecciones([{origen:null,item:{...buena[0].item,tieneLogo:true,tieneRender:true,logoGeometria:{anchoPx:100,altoPx:100,anchoCm:8}}}],x,C,validateOrder,fail);assert.equal(inyectada[0].item.tieneRender,false);assert.equal(inyectada[0].item.logoGeometria,undefined);
});
before(async()=>{if(!modulo)return;const {PGlite}=await import(modulo);db=new PGlite();await db.exec(`
create role anon;create role authenticated;create role service_role bypassrls;create schema auth;
create table auth.users(id uuid primary key);create table zain_equipo(user_id uuid primary key,activo boolean);
create table zain_pedidos(id uuid primary key,folio text,estado text,total integer,version integer default 1,items jsonb,archivos jsonb default '[]',created_at timestamptz default now(),guardado_at timestamptz default now(),archivado_at timestamptz,updated_at timestamptz default now(),cliente jsonb default '{}',token_hash text,consulta_nonce text);
create table zain_cotizaciones(pedido_id uuid primary key,version integer default 1,borrador jsonb,publicada jsonb,updated_at timestamptz default now(),actor uuid);
create table zain_cotizaciones_historial(pedido_id uuid,version integer,modo text,borrador jsonb,publicada jsonb,actor uuid,primary key(pedido_id,version));
create table zain_historial(pedido_id uuid,actor uuid,estado_anterior text,estado_nuevo text,notas text);
create table zain_pagos(id uuid,pedido_id uuid,revision integer,importe bigint);
`);await db.exec(await readFile(new URL('../supabase/cotizacion-partidas-editables.sql',import.meta.url),'utf8'));await db.exec(await readFile(new URL('../supabase/archivos-logos-extra.sql',import.meta.url),'utf8'));await db.query('insert into auth.users values($1)',[uid]);await db.query('insert into zain_equipo values($1,true)',[uid]);});
after(async()=>await db?.close());
const sqlTest=(nombre,fn)=>test(nombre,{skip:modulo?false:'Configura ZAIN_PGLITE_MODULE.'},async()=>{await db.exec('begin');try{await fn();}finally{await db.exec('rollback');}});
async function preparar(x=pedido()){
 const q=inicialQ(x);await db.query('insert into zain_pedidos(id,folio,estado,total,version,items,archivos) values($1,$2,$3,$4,$5,$6,$7)',[id,x.folio,x.estado,x.items.reduce((n,p)=>n+p.piezas,0),x.version,JSON.stringify(x.items),JSON.stringify(x.archivos)]);await db.query('insert into zain_cotizaciones(pedido_id,borrador,publicada) values($1,$2,$3)',[id,JSON.stringify(q),JSON.stringify(pub(q))]);return {x,q};
}
const rpc=async(modo,borrador,publicada=null,version=1,actor=uid)=>(await db.query('select zain_cotizacion_guardar($1,$2,$3,$4,$5,$6) as v',[id,version,modo,JSON.stringify(borrador),JSON.stringify(publicada),actor])).rows[0].v;
const leer=async()=>(await db.query('select * from zain_pedidos where id=$1',[id])).rows[0];
sqlTest('SQL: guardar tallas es privado; publicar actualiza pedido y archiva la selección anterior',async()=>{
 const {x,q}=await preparar(),nueva=modificarSelecciones(x,q,[{origen:0,anterior:0,item:item({[talla]:8,[segunda]:5})}],cfg);const guardada=await rpc('guardar',nueva);
 assert.equal((await leer()).total,12);assert.equal(guardada.publicada.partidas[0].piezas,12);assert.equal(guardada.borrador.partidas[0].piezas,13);
 const publicada=await rpc('publicar',nueva,paraCliente(nueva),guardada.version);assert.ok(publicada);assert.equal((await leer()).total,13);assert.equal(publicada.publicada.partidas[0].piezas,13);assert.equal(publicada.borrador.partidasVersion,1);assert.equal(publicada.borrador.selecciones[0].origen,0);
 const archivo=(await db.query('select * from zain_cotizacion_partidas_historial')).rows[0];assert.equal(archivo.total,12);assert.equal(archivo.items[0].piezas,12);assert.equal(publicada.publicada.selecciones,undefined);
});
sqlTest('SQL: retirar una partida conserva archivos originales y reasigna índices al publicar',async()=>{
 const x=pedido();x.items.push({...x.items[0]});x.items.forEach((p,i)=>{p.tieneLogo=true;p.tieneRender=true;});x.archivos=[{item:0,kind:'logo',path:id+'/primero.svg'},{item:1,kind:'logo',path:id+'/segundo.svg'},{item:1,kind:'render',path:id+'/segundo.png'}];const {q}=await preparar(x);
 const nueva=modificarSelecciones(x,q,[{origen:1,anterior:1,item:x.items[1]}],cfg),out=await rpc('publicar',nueva,paraCliente(nueva));assert.ok(out);const p=await leer();assert.equal(p.items.length,1);assert.deepEqual(p.archivos.map(f=>f.item),[0,0]);assert.deepEqual(p.archivos.map(f=>f.path),[id+'/segundo.svg',id+'/segundo.png']);const archivo=(await db.query('select archivos from zain_cotizacion_partidas_historial')).rows[0].archivos;assert.equal(archivo.length,3);
});
sqlTest('SQL: Confirmado/producción/entregado/cancelado bloquean guardar, publicar y retirar',async()=>{
 const {x,q}=await preparar(),nueva=modificarSelecciones(x,q,[{origen:0,anterior:0,item:item({[talla]:13})}],cfg);
 for(const estado of ['confirmado','produccion','entregado','cancelado']){await db.query('update zain_pedidos set estado=$1',[estado]);for(const modo of ['guardar','publicar','retirar'])assert.equal(await rpc(modo,nueva,paraCliente(nueva)),null);}
 assert.equal((await leer()).total,12);assert.equal((await db.query('select count(*)::int as n from zain_cotizacion_partidas_historial')).rows[0].n,0);
});
sqlTest('SQL: antes de Confirmado se puede revisar Aceptado; pagos y decisiones anteriores se conservan',async()=>{
 const {x,q}=await preparar({...pedido(),estado:'aceptado'}),nueva=modificarSelecciones(x,q,[{origen:0,anterior:0,item:item({[talla]:13})}],cfg);assert.ok(await rpc('publicar',nueva,paraCliente(nueva)));assert.equal((await leer()).estado,'cotizado');
});
sqlTest('SQL: versión de partidas ajena o cotización obsoleta no pisa cambios concurrentes',async()=>{
 const {x,q}=await preparar(),nueva=modificarSelecciones(x,q,[{origen:0,anterior:0,item:item({[talla]:13})}],cfg);assert.equal(await rpc('guardar',{...nueva,partidasVersion:99}),null);assert.equal(await rpc('guardar',nueva,null,99),null);await assert.rejects(rpc('guardar',nueva,null,1,randomUUID()),/Equipo no autorizado/);
});
sqlTest('SQL: archivo de selecciones queda privado y los pagos existentes impiden reemplazar importes publicados',async()=>{
 const {x,q}=await preparar(),nueva=modificarSelecciones(x,q,[{origen:0,anterior:0,item:item({[talla]:13})}],cfg);await db.query('insert into zain_pagos values($1,$2,1,1000)',[randomUUID(),id]);const d=await rpc('guardar',nueva);assert.ok(d);assert.equal(await rpc('publicar',nueva,paraCliente(nueva),d.version),null);assert.equal((await leer()).total,12);
 const acceso=(await db.query("select has_table_privilege('authenticated','zain_cotizacion_partidas_historial','SELECT') as lee,has_table_privilege('authenticated','zain_cotizacion_partidas_historial','INSERT') as escribe,has_function_privilege('authenticated','zain_cotizacion_guardar(uuid,integer,text,jsonb,jsonb,uuid)','EXECUTE') as rpc")).rows[0];assert.deepEqual(acceso,{lee:false,escribe:false,rpc:false});
});
function fixture({confirmarAlGuardar=false}={}){
 const llamadas=[];const fetcher=async(url,o={})=>{const u=new URL(url),b=o.body?JSON.parse(o.body):null;llamadas.push(u.pathname);let d;
  if(u.pathname==='/auth/v1/user')d={id:uid,email:'equipo@example.test',email_confirmed_at:'2026-10-23'};
  else if(u.pathname.includes('zain_accesos'))d=[{nombre:'Equipo ficticio',activo:true}];else if(u.pathname.includes('zain_equipo'))d=[{user_id:uid,activo:true,nombre:'Equipo ficticio'}];
  else if(u.pathname.includes('zain_precios_config'))d=[{version:1,datos:cfg}];
  else if(u.pathname.includes('zain_catalogo'))d=[];
  else if(u.pathname.includes('/rpc/zain_cotizacion_guardar')){if(confirmarAlGuardar)await db.query("update zain_pedidos set estado='confirmado'");d=await rpc(b.p_modo,b.p_borrador,b.p_publicada,b.p_version,b.p_actor);}
  else if(u.pathname.includes('zain_cotizaciones'))d=(await db.query('select * from zain_cotizaciones where pedido_id=$1',[id])).rows;
  else if(u.pathname.includes('zain_pedidos'))d=[await leer()];
  else throw Error('Ruta inesperada: '+u.pathname);return Response.json(d);
 };
 const handler=createHandler({SUPABASE_URL:'https://fixture.supabase.co',SUPABASE_SECRET_KEY:'ficticio',SUPABASE_PUBLISHABLE_KEY:'ficticio',ZAIN_PEDIDOS_ENABLED:'true',ZAIN_COTIZACIONES_ENABLED:'true',ZAIN_SITE_URL:'https://zain.test'},fetcher);
 return {llamadas,call:(op,b)=>handler(new Request('https://zain.test/api/pedidos?op='+op+(b?'':'&id='+id),{method:b?'POST':'GET',headers:{Authorization:'Bearer ficticio','Content-Type':'application/json'},body:b?JSON.stringify(b):undefined}))};
}
sqlTest('API: valida, guarda borrador sin tocar pedido y publica cantidades nuevas',async()=>{
 const {x,q}=await preparar(),api=fixture(),nueva=modificarSelecciones(x,q,[{origen:0,anterior:0,item:item({[talla]:8,[segunda]:5})}],cfg);
 let r=await api.call('cotizacion-guardar',{id,version:1,borrador:nueva});assert.equal(r.status,200,await r.clone().text());const d=(await r.json()).cotizacion;assert.equal((await leer()).total,12);r=await api.call('cotizacion-publicar',{id,version:d.version});assert.equal(r.status,200,await r.clone().text());const out=await r.json();assert.equal(out.pedido.total,13);assert.equal(out.cotizacion.publicada.partidas[0].piezas,13);
});
// 27-oct-2026: Confirmado ya no deja la cotización en solo lectura (ver editar-siempre-cierre-saldo.test.mjs); un cambio de estado
// a mitad del guardado sigue frenando esa escritura por la versión.
sqlTest('API: confirmar en paralelo frena la escritura en curso',async()=>{
 const {x,q}=await preparar(),api=fixture({confirmarAlGuardar:true}),nueva=modificarSelecciones(x,q,[{origen:0,anterior:0,item:item({[talla]:13})}],cfg);assert.equal((await api.call('cotizacion-guardar',{id,version:1,borrador:nueva})).status,409);assert.equal((await leer()).total,12);
});

test('la vista recibe el precio del formulario sin volver a reinterpretar el borrador',()=>{const x=pedido(),q=inicialQ(x),v=entrada(q);v.partidas[0].precio=21000;assert.equal(calcularSeleccion(x,v).partidas[0].precioManual,21000);});
test('redistribuir o quitar tallas conserva el precio escrito (parejo) y permite corregirlo después',()=>{
 const x=pedido();x.items=[item({[talla]:6,[segunda]:6})];const c={...cfg,prendas:[{sku:p.sku,prenda:null,otros:0,bandas:[{tallas:[talla],colores:[],costo:10000},{tallas:[segunda],colores:[],costo:20000}]}]};const v=entrada(generar(x.items,c));v.impuesto=0;v.partidas[0].precio=20000;const q=calcular(x.items,v),precioMayor=20000;
 const nueva=modificarSelecciones(x,q,[{origen:0,anterior:0,item:item({[segunda]:12})}],c);assert.equal(nueva.total,precioMayor*12);
 const corregido=entrada(nueva);corregido.partidas[0].precio+=1000;assert.equal(calcular(itemsDe(x,nueva),corregido).total,(precioMayor+1000)*12);
});
test('editar tallas conserva logo, render y color con zona ajustada y colores sin código',()=>{
 const tec=C.tecnicas.find(t=>p.tecnicas.includes(t.id)).nombre,otro=C.colores.find(c=>c.id===p.colores[1]);
 const viejo={...itemCatalogo(p,otro,tec,zona,8,{[talla]:12},12),zona:zona.nombre+' (posición ajustada)',colorId:null,colorCodigo:undefined,tieneLogo:true,tieneRender:true,logo:'archivo «logo.png»',logoGeometria:{anchoCm:8}};
 const nuevo=itemCatalogo(p,otro,tec,zona,8,{[talla]:9},9,viejo);
 assert.equal(nuevo.tieneRender,true);assert.equal(nuevo.tieneLogo,true);assert.equal(nuevo.logo,'archivo «logo.png»');assert.equal(nuevo.zona,viejo.zona);assert.deepEqual(nuevo.logoGeometria,viejo.logoGeometria);
 const recolor=itemCatalogo(p,color,tec,zona,8,{[talla]:9},9,viejo);
 assert.equal(recolor.tieneRender,false);assert.equal(recolor.tieneLogo,true);assert.equal(recolor.logo,'archivo «logo.png»');assert.equal('logoGeometria' in recolor,false);
 const pedido={id,items:[viejo],archivos:[{item:0,kind:'logo',path:'a'},{item:0,kind:'render',path:'b'}]};
 const [s]=validarSelecciones([{origen:0,item:{...nuevo,logo:'Logo pendiente de confirmar'}}],pedido,{productos:C.productos,productosHistoricos:C.productosHistoricos},(b)=>({items:b.items}),fail);
 assert.equal(s.item.tieneRender,true);assert.equal(s.item.logo,'archivo «logo.png»');assert.equal(s.item.zona,viejo.zona);
});

sqlTest('SQL: publicar partidas editadas conserva los logos adicionales de la partida de origen',async()=>{
 const x=pedido();x.items.push({...x.items[0]});x.items.forEach(p=>{p.tieneLogo=true;p.tieneRender=true;});x.archivos=[{item:0,kind:'logo',path:id+'/0-logo.svg'},{item:1,kind:'logo',path:id+'/1-logo.svg'},{item:1,kind:'logo-2',path:id+'/1-logo-2.png'},{item:1,kind:'render',path:id+'/1-render.png'}];const {q}=await preparar(x);
 const nueva=modificarSelecciones(x,q,[{origen:1,anterior:1,item:x.items[1]}],cfg),out=await rpc('publicar',nueva,paraCliente(nueva));assert.ok(out);
 const p=await leer();assert.deepEqual(p.archivos.map(f=>[f.item,f.kind]),[[0,'logo'],[0,'logo-2'],[0,'render']]);
});
test('validateOrder acepta logos adicionales logo-2 a logo-13 y rechaza otros tipos',()=>{
 const it={...itemCatalogo(p,color,C.tecnicas.find(t=>p.tecnicas.includes(t.id)).nombre,zona,8,{[talla]:12},12),tieneLogo:true,tieneRender:false};
 const base={id,token:'a'.repeat(64),items:[it],files:[{item:0,kind:'logo',type:'image/png',size:10,name:'a.png'}]};
 const ok=validateOrder({...base,files:[...base.files,{item:0,kind:'logo-2',type:'image/png',size:10,name:'espalda.png'},{item:0,kind:'logo-13',type:'image/svg+xml',size:10,name:'manga.svg'}]},{snapshot:true});
 assert.deepEqual(ok.manifest.map(f=>f.path.split('/')[1]),['0-logo.png','0-logo-2.png','0-logo-13.svg']);
 for(const kind of ['logo-1','logo-14','extra','logo-2x'])assert.throws(()=>validateOrder({...base,files:[...base.files,{item:0,kind,type:'image/png',size:10,name:'x.png'}]},{snapshot:true}),/archivo válido/);
 assert.throws(()=>validateOrder({...base,files:[...base.files,{item:0,kind:'logo-2',type:'image/png',size:10},{item:0,kind:'logo-2',type:'image/png',size:10}]},{snapshot:true}),/duplicados/);
});
