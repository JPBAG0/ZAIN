import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {ESTADOS,validarCotizacion} from '../server/cotizaciones-modelos.mjs';
import {createHandler} from '../server/pedidos.mjs';

// Herramienta de QA externa al sitio: no introduce dependencias ni build en ZAIN.
const modulo=process.env.ZAIN_PGLITE_MODULE;
let db;
before(async()=>{
 if(!modulo)return;
 const {PGlite}=await import(modulo);db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;create schema storage;create table auth.users(id uuid primary key);
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table public.zain_equipo(user_id uuid primary key,activo boolean);
 create table public.zain_pedidos(id uuid primary key,folio text,estado text,total integer,version integer default 1,items jsonb,created_at timestamptz default now(),guardado_at timestamptz default now(),archivado_at timestamptz);
 create table public.zain_cotizaciones(pedido_id uuid primary key,version int,borrador jsonb,publicada jsonb);
 create table public.zain_cotizaciones_historial(pedido_id uuid,version integer,modo text,borrador jsonb,publicada jsonb,primary key(pedido_id,version));
 create table public.zain_pagos(id uuid,pedido_id uuid,revision int,importe bigint);
 create table public.zain_historial(pedido_id uuid,actor uuid,estado_anterior text,estado_nuevo text,notas text);`);
 for(const archivo of ['gastos-cierre','finanzas-costo-real','finanzas-generales','finanzas-dashboard-v2','cotizaciones-modelos','ventas-reales'])
  await db.exec(await readFile(new URL('../supabase/'+archivo+'.sql',import.meta.url),'utf8'));
});
after(async()=>{await db?.close();});
const sqlTest=(nombre,fn)=>test(nombre,{skip:modulo?false:'Configura ZAIN_PGLITE_MODULE; consulta docs/VENTAS-REALES.md.'},async()=>{
 await db.exec('begin');try{await fn();}finally{await db.exec('rollback');}
});
async function pedido({estado='confirmado',cobrado=5800,total=11600,subtotal=10000,anticipo=5000,archivado=false,publicada=true,costo=4000,fecha='2026-10-22T12:00:00Z',guardado=true}={}){
 const id=randomUUID(),folio='ZAIN-FICTICIO-'+id.slice(0,8);
 await db.query(`insert into zain_pedidos(id,folio,estado,total,items,created_at,archivado_at,guardado_at) values($1,$2,$3,12,'[]',$4,$5,$6)`,[id,folio,estado,fecha,archivado?fecha:null,guardado?fecha:null]);
 const doc=publicada?{revision:1,subtotal,total,...(anticipo===null?{}:{pagos:{anticipo}})}:null;
 await db.query('insert into zain_cotizaciones values($1,2,$2,$3)',[id,JSON.stringify({costo:999999}),JSON.stringify(doc)]);
 if(publicada)await db.query("insert into zain_cotizaciones_historial values($1,1,'publicar',$2,$3)",[id,JSON.stringify({costo}),JSON.stringify(doc)]);
 if(cobrado)await db.query('insert into zain_pagos values($1,$2,1,$3)',[randomUUID(),id,cobrado]);
 return id;
}
const dashboard=async()=> (await db.query('select zain_finanzas_dashboard(2026) as d')).rows[0].d;
const panel=async(estado='',offset=0,papelera=false,q='',semana=false)=>(await db.query('select zain_finanzas_panel($1,$2,$3,$4,$5) as d',[estado,q,papelera,semana,offset])).rows[0].d;

for(const estado of ['nuevo','contactado','cotizado','aceptado','confirmado','produccion','entregado','cancelado']){
 for(const cobrado of [0,5800])sqlTest(`SQL: ${estado}, cobrado ${cobrado}: venta y negociación separadas`,async()=>{
  await pedido({estado,cobrado});
  const vendido=['confirmado','produccion','entregado'].includes(estado)&&cobrado>=5800;
  const negociacion=['nuevo','contactado','cotizado','aceptado'].includes(estado)&&cobrado<5800;
  const p=(await panel()).finanzas,m=(await dashboard()).meses[9];
  assert.equal(p.vendido,vendido?11600:0);assert.equal(p.venta,vendido?10000:0);
  assert.equal(p.por_cobrar,vendido?5800:0);assert.equal(p.en_negociacion,negociacion?11600:0);
  assert.equal(p.vendidos,vendido?1:0);assert.equal(p.negociacion_pedidos,negociacion?1:0);
  assert.equal(m.ventas,p.venta);assert.equal(m.vendido,p.vendido);assert.equal(m.por_cobrar,p.por_cobrar);assert.equal(m.en_negociacion,p.en_negociacion);
  assert.equal(m.costo_pedidos,vendido?4000:0);assert.equal(m.utilidad_pedidos,vendido?6000:0);
  assert.equal(m.entregados,estado==='entregado'&&vendido?1:0);
 });
}
sqlTest('SQL: anticipo parcial, revisión ajena, cobro completo y términos históricos',async()=>{
 await pedido({estado:'aceptado',cobrado:2000});
 const parcial=await pedido({cobrado:5799});
 await db.query('insert into zain_pagos values($1,$2,2,11600)',[randomUUID(),parcial]);
 await pedido({cobrado:11600});await pedido({anticipo:null,cobrado:5800});await pedido({anticipo:null,cobrado:11600});
 const p=(await panel()).finanzas;
 assert.equal(p.vendidos,2);assert.equal(p.vendido,23200);assert.equal(p.por_cobrar,0);assert.equal(p.en_negociacion,11600);assert.equal(p.sin_anticipo,2);
 assert.equal(p.por_cobrar_pedidos.length,0);
});
sqlTest('SQL: 0% explícito y redondeo de centavos del anticipo',async()=>{
 await pedido({anticipo:0,cobrado:0});await pedido({anticipo:3333,total:101,subtotal:87,cobrado:33});
 await pedido({anticipo:3333,total:101,subtotal:87,cobrado:34});
 const p=(await panel()).finanzas;assert.equal(p.vendidos,2);assert.equal(p.vendido,11701);assert.equal(p.por_cobrar,11667);
});
sqlTest('SQL: cancelados y papelera con pagos no aumentan ninguna cifra',async()=>{
 await pedido({estado:'cancelado',cobrado:11600});await pedido({archivado:true});
 await pedido({archivado:true,estado:'aceptado',cobrado:0});
 for(const papelera of [false,true]){
  const p=(await panel('',0,papelera)).finanzas;assert.equal(p.vendido,0);assert.equal(p.por_cobrar,0);assert.equal(p.en_negociacion,0);assert.equal(p.venta,0);
 }
 const m=(await dashboard()).meses[9];assert.equal(m.ventas,0);assert.equal(m.en_negociacion,0);
});
sqlTest('SQL: solicitudes sin cotización cuentan casos sin inventar importes; carga incompleta fuera',async()=>{
 await pedido({estado:'nuevo',publicada:false,cobrado:0});await pedido({guardado:false});
 const p=(await panel()).finanzas,m=(await dashboard()).meses[9];
 assert.equal(p.negociacion_pedidos,1);assert.equal(p.negociacion_sin_importe,1);assert.equal(p.en_negociacion,0);assert.equal(p.vendido,0);
 assert.equal(m.negociacion_sin_importe,1);
});
sqlTest('SQL: todos los estados de modelos; convertida cuenta únicamente mediante su pedido',async()=>{
 const uid=randomUUID(),id=await pedido({estado:'aceptado',cobrado:0});await db.query('insert into auth.users values($1)',[uid]);
 for(const estado of ESTADOS)await db.query(`insert into zain_cotizaciones_modelos(id,estado,datos,desde,modelos,creado_por,actor,pedido_id,created_at) values($1,$2,'{}',999999,1,$3,$3,$4,'2026-10-22T12:00:00Z')`,[randomUUID(),estado,uid,estado==='convertida'?id:null]);
 // Defensa contra una cotización ligada cuyo estado todavía no se actualizó.
 await db.query(`insert into zain_cotizaciones_modelos(id,estado,datos,creado_por,actor,pedido_id,created_at) values($1,'autorizada','{}',$2,$2,$3,'2026-10-22T12:00:00Z')`,[randomUUID(),uid,id]);
 const p=(await panel()).finanzas,m=(await dashboard()).meses[9];
 assert.equal(p.cotizaciones_modelos,2);assert.equal(m.cotizaciones_modelos,2);assert.equal(p.en_negociacion,11600);assert.equal(p.vendido,0);
 assert.equal((await panel('aceptado')).finanzas.cotizaciones_modelos,0);
 assert.equal((await panel('',0,true)).finanzas.cotizaciones_modelos,0);
 assert.equal((await panel('',0,false,'COT-')).finanzas.negociacion_pedidos,0);
});
sqlTest('SQL: resumen y cobranza de todas las páginas, filtros, zona CDMX y costos pendientes',async()=>{
 for(let i=0;i<24;i++)await pedido({estado:i%2?'confirmado':'aceptado',cobrado:i%2?5800:0});
 await pedido({costo:null});await pedido({fecha:'2026-01-01T01:00:00Z'}); // CDMX: 31-dic-2025.
 const a=await panel(),b=await panel('',20),f=a.finanzas,d=await dashboard();
 assert.equal(a.pedidos.length,20);assert.equal(a.siguiente,true);assert.equal(b.pedidos.length,6);assert.deepEqual(f,b.finanzas);
 assert.equal(f.vendidos,14);assert.equal(f.por_cobrar_pedidos.length,14);assert.equal(f.por_cobrar,f.por_cobrar_pedidos.reduce((s,p)=>s+p.saldo,0));
 assert.equal(f.costo,null);assert.equal(f.pendientes,1);assert.equal(f.utilidad,null);
 assert.equal(d.meses[9].pedidos,13);assert.equal(d.meses[9].pedidos_sin_costo,1);assert.equal(d.por_cobrar_pedidos.length,13);
 assert.equal((await panel('aceptado')).finanzas.vendido,0);assert.equal((await panel('confirmado')).finanzas.en_negociacion,0);
 assert.equal((await panel('',0,false,'INEXISTENTE')).finanzas.vendido,0);
 // La semana se prueba con fechas relativas para que siga siendo válida al retomar.
 const reloj=(await db.query("select now() as actual,now()-interval '8 days' as anterior")).rows[0];
 for(const [etiqueta,fecha] of Object.entries(reloj)){
  const id=await pedido({fecha:new Date(fecha).toISOString()});
  await db.query('update zain_pedidos set folio=$2 where id=$1',[id,'ZAIN-SEMANA-'+etiqueta]);
 }
 assert.equal((await panel('',0,false,'ZAIN-SEMANA-',true)).finanzas.vendidos,1);
});
sqlTest('SQL: permisos privados, security invoker e instalación repetible sin modificar registros',async()=>{
 const id=await pedido();const antes=await db.query('select * from zain_pedidos where id=$1',[id]);
 // Repetir sus definiciones dentro de la transacción aislada de este caso.
 const sql=await readFile(new URL('../supabase/ventas-reales.sql',import.meta.url),'utf8');
 await db.exec(sql.replace(/^begin;$/m,'').replace(/^commit;$/m,''));
 assert.deepEqual((await db.query('select * from zain_pedidos where id=$1',[id])).rows,antes.rows);
 const roles=(await db.query(`select has_table_privilege('anon','zain_finanzas_estado','SELECT') as anon,
 has_function_privilege('authenticated','zain_finanzas_dashboard(integer)','EXECUTE') as dashboard,
 has_function_privilege('anon','zain_finanzas_panel(text,text,boolean,boolean,integer)','EXECUTE') as panel,
 has_function_privilege('service_role','zain_finanzas_dashboard(integer)','EXECUTE') as servicio`)).rows[0];
 assert.deepEqual(roles,{anon:false,dashboard:false,panel:false,servicio:true});
 assert.ok((await db.query(`select reloptions from pg_class where oid='zain_finanzas_estado'::regclass`)).rows[0].reloptions.includes('security_invoker=true'));
 assert.equal((await db.query(`select count(*)::int as n from pg_proc where proname in ('zain_finanzas_dashboard','zain_finanzas_panel') and prosecdef`)).rows[0].n,0);
});
sqlTest('API del equipo → RPC SQL real: conserva las cifras y la cobranza completa',async()=>{
 const uid=randomUUID();await pedido();await pedido({estado:'aceptado',cobrado:0});
 const fetcher=async(url,opciones={})=>{
  let datos;
  if(url.includes('/auth/v1/user'))datos={id:uid,email:'equipo@example.test',email_confirmed_at:'2026-10-22'};
  else if(url.includes('/zain_accesos?'))datos=[{nombre:'Equipo ficticio'}];
  else if(url.includes('/zain_equipo?'))datos=[{user_id:uid,activo:true}];
  else if(url.includes('/rpc/zain_finanzas_panel')){
   const b=JSON.parse(opciones.body);datos=(await db.query('select zain_finanzas_panel($1,$2,$3,$4,$5) as v',[b.p_estado,b.p_q,b.p_papelera,b.p_semana,b.p_offset])).rows[0].v;
  }else if(url.includes('/rpc/zain_finanzas_dashboard'))datos=(await db.query('select zain_finanzas_dashboard($1) as v',[JSON.parse(opciones.body).p_anio])).rows[0].v;
  else if(url.includes('/zain_pedidos?'))datos=[];
  else if(url.includes('/zain_movimientos_generales?'))datos=[];
  else throw Error('Ruta inesperada en fixture: '+url);
  return Response.json(datos);
 };
 const handler=createHandler({SUPABASE_URL:'https://ficticio.supabase.co',SUPABASE_SECRET_KEY:'ficticia',SUPABASE_PUBLISHABLE_KEY:'ficticia',ZAIN_SITE_URL:'https://zain.test',ZAIN_PEDIDOS_ENABLED:'true',ZAIN_GASTOS_ENABLED:'true'},fetcher);
 const llamar=(op,sesion=true)=>handler(new Request('https://zain.test/api/pedidos?op='+op,{headers:{Origin:'https://zain.test',...(sesion?{Authorization:'Bearer ficticio'}:{})}}));
 assert.equal((await llamar('lista',false)).status,401);
 const respuesta=await llamar('lista');assert.equal(respuesta.status,200);const lista=await respuesta.json();
 assert.equal(lista.finanzas.vendido,11600);assert.equal(lista.finanzas.en_negociacion,11600);assert.equal(lista.finanzas.por_cobrar_pedidos[0].saldo,5800);
 assert.ok(lista.pedidos.find(p=>p.estado==='aceptado').finanzas.en_negociacion);
 const general=await llamar('generales&anio=2026');assert.equal(general.status,200);
 const d=(await general.json()).dashboard;assert.equal(d.meses[9].vendido,lista.finanzas.vendido);assert.deepEqual(d.por_cobrar_pedidos.map(p=>p.saldo),[5800]);
});
test('convertida existe en servidor y Edge, reservada a convertir con pedido válido',async()=>{
 assert.ok(ESTADOS.includes('convertida'));
 const edge=await import('../supabase/functions/zain-pedidos/cotizaciones-modelos.mjs');assert.deepEqual(edge.ESTADOS,ESTADOS);
 const fallo=(status,message)=>{const e=new Error(message);e.status=status;throw e;};
 assert.throws(()=>validarCotizacion({id:randomUUID(),version:0,datos:{},modelos:1,estado:'convertida'},fallo),{status:400});
});
