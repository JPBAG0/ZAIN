import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {validarCaja,createCaja} from '../server/caja.mjs';

// Caja ZAIN: saldos tipo Tricount calculados en SQL real (PGlite) con datos ficticios.
const modulo=process.env.ZAIN_PGLITE_MODULE,actor=randomUUID();
const fail=(status,message)=>{throw Object.assign(Error(message),{status});};
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
 create table public.zain_pagos(id uuid primary key,pedido_id uuid,revision int,importe bigint,referencia text default '',created_at timestamptz default now());
 create table public.zain_historial(pedido_id uuid,actor uuid,estado_anterior text,estado_nuevo text,notas text);`);
 for(const archivo of ['gastos-cierre','finanzas-costo-real','finanzas-generales','finanzas-dashboard-v2','cotizaciones-modelos','ventas-reales','caja-zain'])
  await db.exec(await readFile(new URL('../supabase/'+archivo+'.sql',import.meta.url),'utf8'));
 await db.query('insert into auth.users values($1)',[actor]);
});
after(async()=>{await db?.close();});
const sqlTest=(nombre,fn)=>test(nombre,{skip:modulo?false:'Configura ZAIN_PGLITE_MODULE; consulta docs/CAJA.md.'},async()=>{
 await db.exec('begin');try{await fn();}finally{await db.exec('rollback');}
});
async function pedido({estado='entregado',subtotal=10000,total=11600,costo=4000,archivado=false}={}){
 const id=randomUUID();
 await db.query(`insert into zain_pedidos(id,folio,estado,total,items,archivado_at) values($1,$2,$3,10,'[]',$4)`,[id,'ZAIN-F-'+id.slice(0,6),estado,archivado?new Date().toISOString():null]);
 const doc={revision:1,subtotal,total,pagos:{anticipo:5000}};
 await db.query('insert into zain_cotizaciones values($1,2,$2,$3)',[id,'{}',JSON.stringify(doc)]);
 await db.query("insert into zain_cotizaciones_historial values($1,1,'publicar',$2,$3)",[id,JSON.stringify({costo}),JSON.stringify(doc)]);
 return id;
}
const pago=(pedido_id,importe,recibio='zain')=>db.query('insert into zain_pagos(id,pedido_id,revision,importe,recibio) values($1,$2,1,$3,$4)',[randomUUID(),pedido_id,importe,recibio]);
const mov=(pedido_id,tipo,persona,importe,grupo='base')=>db.query("insert into zain_pedido_movimientos(id,pedido_id,tipo,grupo,persona,concepto,importe,fecha,actor) values($1,$2,$3,$4,$5,'Mov',$6,'2026-10-20',$7)",[randomUUID(),pedido_id,tipo,grupo,persona,importe,actor]);
const general=(tipo,categoria,persona,importe)=>db.query("insert into zain_movimientos_generales(id,tipo,categoria,persona,concepto,importe,fecha,actor) values($1,$2,$3,$4,'Gen',$5,'2026-10-20',$6)",[randomUUID(),tipo,categoria,persona,importe,actor]);
const caja=(tipo,origen,destino,importe)=>db.query("insert into zain_caja_movimientos(id,tipo,origen,destino,concepto,importe,fecha,actor) values($1,$2,$3,$4,'Caja',$5,'2026-10-21',$6)",[randomUUID(),tipo,origen,destino,importe,actor]);
const resumen=async()=>(await db.query('select zain_caja_resumen() as r')).rows[0].r;

sqlTest('saldos de caja y socios cuadran como Tricount y el reparto descuenta lo pagado',async()=>{
 const a=await pedido(),b=await pedido({estado:'produccion'});
 await pago(a,11600);await mov(a,'gasto','garcia',4000);await mov(a,'reembolso','garcia',1000);
 await db.query("insert into zain_pedido_cuentas(pedido_id,cerrado_at,cierre,reparto_bp) values($1,now(),'{}',5000)",[a]);
 await pago(b,3000,'juan_pablo');
 await general('gasto','Software y suscripciones','juan_pablo',500);
 await general('ingreso','Aportación de capital','zain',2000);
 await caja('transferencia','juan_pablo','zain',3000);
 await caja('reparto','zain','juan_pablo',2000);
 const r=await resumen();
 assert.equal(Number(r.caja),11600-1000+2000+3000-2000);
 assert.equal(Number(r.socios.juan_pablo),500-3000+3000);
 assert.equal(Number(r.socios.garcia),4000-1000);
 // Identidad contable: caja − deudas con socios = ingresos − gastos − repartos.
 assert.equal(Number(r.caja)-Number(r.socios.juan_pablo)-Number(r.socios.garcia),(11600+3000+2000)-(4000+500)-2000);
 assert.equal(Number(r.utilidad.cerrada),6000-500);
 assert.deepEqual(Object.fromEntries(Object.entries(r.utilidad.toca).map(([k,v])=>[k,Number(v)])),{juan_pablo:2750,garcia:2750});
 assert.deepEqual(Object.fromEntries(Object.entries(r.utilidad.por_repartir).map(([k,v])=>[k,Number(v)])),{juan_pablo:750,garcia:2750});
 assert.equal(r.libro.length,8);
});

sqlTest('anulados no cuentan y los pedidos en papelera se avisan',async()=>{
 const a=await pedido({archivado:true});await pago(a,600);
 await db.query("insert into zain_caja_movimientos(id,tipo,origen,destino,concepto,importe,fecha,actor,anulado_at,anulado_por,motivo) values($1,'reparto','zain','garcia','X',100,'2026-10-21',$2,now(),$2,'Duplicado')",[randomUUID(),actor]);
 const r=await resumen();
 assert.equal(Number(r.caja),600);assert.equal(Number(r.papelera),1);assert.equal(r.libro.length,1);
});

sqlTest('la base rechaza transferencias sin caja y repartos hacia la caja',async()=>{
 await assert.rejects(db.query("insert into zain_caja_movimientos(id,tipo,origen,destino,concepto,importe,fecha,actor) values($1,'transferencia','juan_pablo','garcia','X',1,'2026-10-21',$2)",[randomUUID(),actor]));
 await db.exec('rollback');await db.exec('begin');
 await assert.rejects(db.query("insert into zain_caja_movimientos(id,tipo,origen,destino,concepto,importe,fecha,actor) values($1,'reparto','garcia','zain','X',1,'2026-10-21',$2)",[randomUUID(),actor]));
});

test('validarCaja exige caja en un extremo, reparto desde caja, importe y fecha válidos',()=>{
 const base={request:randomUUID(),tipo:'transferencia',origen:'juan_pablo',destino:'zain',importe:5000,fecha:'2026-10-20',concepto:'Depósito de cobro'};
 assert.equal(validarCaja(base,fail).importe,5000);
 assert.throws(()=>validarCaja({...base,destino:'garcia'},fail),/Caja ZAIN/);
 assert.throws(()=>validarCaja({...base,tipo:'reparto'},fail),/reparto/);
 assert.throws(()=>validarCaja({...base,importe:0},fail),/importe/);
 assert.throws(()=>validarCaja({...base,fecha:'2999-01-01'},fail),/fecha/);
 assert.throws(()=>validarCaja({...base,concepto:'  '},fail),/concepto/);
});

test('guardar es idempotente con la misma solicitud y receptor valida la persona',async()=>{
 const llamadas=[];let existe=null;
 const sb=async(path,o={})=>{llamadas.push([path,o.method||'GET']);if(path.startsWith('/rest/v1/zain_caja_movimientos?id=eq.'))return existe?[existe]:[];if(path.startsWith('/rest/v1/zain_pagos?id=eq.')&&!o.method)return [{id:'x'}];if(path.includes('zain_caja_resumen'))return {version:1};return null;};
 const c=createCaja({sb,fail}),user={id:actor},b={request:randomUUID(),tipo:'reparto',origen:'zain',destino:'garcia',importe:100,fecha:'2026-10-20',concepto:'Reparto octubre'};
 await c.guardar(b,user);assert.equal(llamadas.filter(([p,m])=>p==='/rest/v1/zain_caja_movimientos'&&m==='POST').length,1);
 existe={id:b.request,importe:100,tipo:'reparto',actor};await c.guardar(b,user);assert.equal(llamadas.filter(([p,m])=>p==='/rest/v1/zain_caja_movimientos'&&m==='POST').length,1);
 await assert.rejects(c.guardar({...b,importe:200},user),/otros datos/);
 await assert.rejects(c.receptor({id:randomUUID(),recibio:'otro'}),/recibió/);
 const r=await c.receptor({id:randomUUID(),recibio:'garcia'});assert.equal(r.caja.version,1);
});
