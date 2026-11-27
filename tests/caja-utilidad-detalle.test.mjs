import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';

// 27-nov-2026: desglose de «Por repartir» por pedido y socio, y utilidad de pedidos aprobados sin cerrar (PGlite real).
const modulo=process.env.ZAIN_PGLITE_MODULE,actor=randomUUID();
let db;
before(async()=>{
 if(!modulo)return;
 const {PGlite}=await import(modulo);db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;create schema storage;create table auth.users(id uuid primary key);
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table public.zain_equipo(user_id uuid primary key,activo boolean);
 create table public.zain_pedidos(id uuid primary key,folio text,estado text,total integer,version integer default 1,items jsonb,archivos jsonb default '[]',cliente jsonb,notas_internas text,created_at timestamptz default now(),updated_at timestamptz,guardado_at timestamptz default now(),archivado_at timestamptz);
 create table public.zain_cotizaciones(pedido_id uuid primary key,version int,borrador jsonb,publicada jsonb,updated_at timestamptz,actor uuid);
 create table public.zain_cotizaciones_historial(pedido_id uuid,version integer,modo text,borrador jsonb,publicada jsonb,actor uuid,primary key(pedido_id,version));
 create table public.zain_cotizacion_aceptaciones(pedido_id uuid not null,revision integer not null,aceptada_at timestamptz not null default now(),documento jsonb not null,primary key(pedido_id,revision));
 create table public.zain_pagos(id uuid primary key,pedido_id uuid,revision int,importe bigint,referencia text default '',actor uuid,created_at timestamptz default now(),foreign key(pedido_id,revision) references public.zain_cotizacion_aceptaciones(pedido_id,revision));
 create table public.zain_historial(pedido_id uuid,actor uuid,estado_anterior text,estado_nuevo text,notas text);`);
 for(const archivo of ['gastos-cierre','finanzas-costo-real','finanzas-generales','finanzas-dashboard-v2','cotizaciones-modelos','ventas-reales','gastos-editar','caja-zain','gastos-por-partida','libro-flexible','libro-comprobantes','iva-oficinas-anticipo','caja-utilidad-detalle'])
  await db.exec(await readFile(new URL('../supabase/'+archivo+'.sql',import.meta.url),'utf8'));
 await db.query('insert into auth.users values($1)',[actor]);await db.query('insert into zain_equipo values($1,true)',[actor]);
});
after(async()=>{await db?.close();});
const sqlTest=(nombre,fn)=>test(nombre,{skip:modulo?false:'Configura ZAIN_PGLITE_MODULE; consulta docs/CAJA.md.'},async()=>{
 await db.exec('begin');try{await fn();}finally{await db.exec('rollback');}
});
const fila=async(sql,p)=>(await db.query(sql,p)).rows[0];
async function pedido({estado='entregado',total=11600,costo=4000,pago=0,cliente='Cliente prueba'}={}){
 const id=randomUUID(),doc={revision:1,subtotal:Math.round(total/1.16),total,pagos:{anticipo:5000}};
 await db.query(`insert into zain_pedidos(id,folio,estado,total,items,cliente) values($1,$2,$3,10,'[]',$4)`,[id,'ZAIN-U-'+id.slice(0,4),estado,JSON.stringify({nombre:cliente})]);
 await db.query('insert into zain_cotizaciones(pedido_id,version,borrador,publicada) values($1,2,$2,$3)',[id,JSON.stringify({costo}),JSON.stringify(doc)]);
 await db.query("insert into zain_cotizaciones_historial(pedido_id,version,modo,borrador,publicada) values($1,1,'publicar',$2,$3)",[id,JSON.stringify({costo}),JSON.stringify(doc)]);
 await db.query("insert into zain_cotizacion_aceptaciones(pedido_id,revision,documento) values($1,1,'{}')",[id]);
 if(pago)await db.query('insert into zain_pagos(id,pedido_id,revision,importe,actor) values($1,$2,1,$3,$4)',[randomUUID(),id,pago,actor]);
 return id;
}
const mov=(pedido_id,importe,grupo='base')=>db.query("insert into zain_pedido_movimientos(id,pedido_id,tipo,grupo,persona,concepto,importe,fecha,actor) values($1,$2,'gasto',$3,'zain','Mov',$4,'2026-11-20',$5)",[randomUUID(),pedido_id,grupo,importe,actor]);
const cerrar=(id,bp=5000)=>db.query("insert into zain_pedido_cuentas(pedido_id,cerrado_at,cierre,reparto_bp) values($1,now(),'{}',$2)",[id,bp]);

sqlTest('el desglose por pedido y socio suma exactamente lo que dice la tarjeta Por repartir',async()=>{
 const a=await pedido({total:11600,pago:11600,cliente:'Taller A'}),b=await pedido({total:23201,pago:23201});
 await mov(a,4000);await mov(b,9000);await mov(b,500,'extra');
 await cerrar(a,5000);await cerrar(b,7000);
 await db.query("insert into zain_movimientos_generales(id,tipo,categoria,persona,concepto,importe,fecha,actor) values($1,'gasto','Software y suscripciones','zain','Gen',301,'2026-11-20',$2)",[randomUUID(),actor]);
 await db.query("insert into zain_movimientos_generales(id,tipo,categoria,persona,concepto,importe,fecha,actor) values($1,'ingreso','Aportación de capital','zain','Capital',9999,'2026-11-20',$2)",[randomUUID(),actor]);
 await db.query("insert into zain_caja_movimientos(id,tipo,origen,destino,concepto,importe,fecha,actor) values($1,'reparto','zain','juan_pablo','Reparto',1000,'2026-11-21',$2)",[randomUUID(),actor]);
 const d=(await fila('select zain_caja_utilidad_detalle() d')).d,r=(await fila('select zain_caja_resumen() r')).r;
 assert.equal(d.cerrados.length,2);
 const ca=d.cerrados.find(x=>x.id===a),cb=d.cerrados.find(x=>x.id===b);
 assert.equal(ca.cliente,'Taller A');assert.equal(Number(ca.utilidad),7600);assert.equal(Number(ca.juan_pablo),3800);assert.equal(Number(ca.garcia),3800);
 assert.equal(Number(cb.utilidad),23201-9500);assert.equal(Number(cb.juan_pablo),Math.trunc(13701*7000/10000));assert.equal(Number(cb.juan_pablo)+Number(cb.garcia),13701);
 assert.equal(Number(d.generales.neto),-301,'la aportación de capital no cuenta');assert.equal(Number(d.generales.juan_pablo)+Number(d.generales.garcia),-301);
 assert.equal(d.repartos.length,1);
 for(const k of ['juan_pablo','garcia']){
  const toca=d.cerrados.reduce((s,x)=>s+Number(x[k]),0)+Number(d.generales[k]),rep=d.repartos.filter(x=>x.destino===k).reduce((s,x)=>s+Number(x.importe),0);
  assert.equal(Number(r.utilidad.toca[k]),toca,'toca '+k);assert.equal(Number(r.utilidad.por_repartir[k]),toca-rep,'por repartir '+k);
 }
 assert.equal(d.por_cerrar.length,0);
});

sqlTest('por cerrar: solo aprobados sin cierre, con gastos registrados, lo que falta cobrar y la utilidad que llevan',async()=>{
 const conf=await pedido({estado:'confirmado',total:20000,costo:8000,pago:10000});
 const acep=await pedido({estado:'aceptado',total:5000,costo:2000});
 await pedido({estado:'cotizado',total:9000});
 const cerrado=await pedido({estado:'entregado',pago:11600});await cerrar(cerrado);
 const papelera=await pedido({estado:'produccion'});await db.query('update zain_pedidos set archivado_at=now() where id=$1',[papelera]);
 await mov(conf,3000);await mov(conf,9000);await mov(conf,700,'extra');
 const d=(await fila('select zain_caja_utilidad_detalle() d')).d;
 assert.deepEqual(d.por_cerrar.map(x=>x.id).sort(),[conf,acep].sort(),'ni cotizados, ni cerrados, ni en papelera');
 const c=d.por_cerrar.find(x=>x.id===conf);
 assert.equal(Number(c.gastos),12700);assert.equal(Number(c.por_cobrar),10000);
 // Ya se gastó más que el costo cotizado de material (12,000 > 8,000): la utilidad usa lo registrado.
 assert.equal(Number(c.costo),12700);assert.equal(Number(c.utilidad),7300);assert.equal(Number(c.juan_pablo)+Number(c.garcia),7300);
 const e=d.por_cerrar.find(x=>x.id===acep);
 assert.equal(Number(e.gastos),0);assert.equal(Number(e.costo),2000,'sin gastos todavía: el costo cotizado');assert.equal(Number(e.utilidad),3000);assert.equal(e.estado,'aceptado');
});
