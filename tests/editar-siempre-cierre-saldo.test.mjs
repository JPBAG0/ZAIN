import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';

// 27-oct-2026: el pedido se modifica en cualquier estado (salvo cancelado o cerrado) y se cierra aunque falte cobrar (PGlite real).
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
 for(const archivo of ['gastos-cierre','finanzas-costo-real','finanzas-generales','finanzas-dashboard-v2','cotizaciones-modelos','ventas-reales','gastos-editar','caja-zain','gastos-por-partida','libro-flexible','libro-comprobantes','iva-oficinas-anticipo','cotizacion-partidas-editables','archivos-logos-extra','editar-siempre-y-cierre-con-saldo','entregar-con-saldo','produccion-sin-anticipo'])
  await db.exec(await readFile(new URL('../supabase/'+archivo+'.sql',import.meta.url),'utf8'));
 await db.query('insert into auth.users values($1)',[actor]);await db.query('insert into zain_equipo values($1,true)',[actor]);
});
after(async()=>{await db?.close();});
const sqlTest=(nombre,fn)=>test(nombre,{skip:modulo?false:'Configura ZAIN_PGLITE_MODULE; consulta docs/CAJA.md.'},async()=>{
 await db.exec('begin');try{await fn();}finally{await db.exec('rollback');}
});
const fila=async(sql,p)=>(await db.query(sql,p)).rows[0];
// Pedido con la revisión 1 publicada (en zain_cotizaciones version 2), aceptada y con un pago.
async function pedido({estado='confirmado',total=11600,pago=6000}={}){
 const id=randomUUID(),doc={revision:1,subtotal:10000,total,pagos:{anticipo:5000}};
 await db.query(`insert into zain_pedidos(id,folio,estado,total,items,cliente) values($1,$2,$3,60,$4,'{}')`,[id,'ZAIN-T-'+id.slice(0,4),estado,JSON.stringify([{nombre:'Playera',piezas:60,tecnica:'Bordado'}])]);
 await db.query('insert into zain_cotizaciones(pedido_id,version,borrador,publicada) values($1,2,$2,$3)',[id,JSON.stringify({preparada:true,costo:4000}),JSON.stringify(doc)]);
 await db.query("insert into zain_cotizaciones_historial(pedido_id,version,modo,borrador,publicada) values($1,1,'publicar',$2,$3)",[id,JSON.stringify({costo:4000,partidas:[]}),JSON.stringify(doc)]);
 await db.query("insert into zain_cotizacion_aceptaciones(pedido_id,revision,documento) values($1,1,'{}')",[id]);
 if(pago)await db.query('insert into zain_pagos(id,pedido_id,revision,importe,actor) values($1,$2,1,$3,$4)',[randomUUID(),id,pago,actor]);
 return id;
}
const publicar=async(id,version,total)=>(await fila(`select zain_cotizacion_guardar($1,$2,'publicar',$3,$4,$5) as r`,[id,version,JSON.stringify({preparada:true,costo:4000}),JSON.stringify({subtotal:Math.round(total/1.16),total,impuesto:1600,pagos:{anticipo:5000},partidas:[]}),actor])).r;

sqlTest('pedido confirmado con pagos: se puede modificar y la nueva revisión hereda aceptación y pagos',async()=>{
 const a=await pedido();
 const out=await publicar(a,2,13920);
 assert.ok(out,'antes se bloqueaba al estar Confirmado o tener pagos');
 assert.equal(out.publicada.revision,3);
 assert.equal((await fila('select estado from zain_pedidos where id=$1',[a])).estado,'confirmado','no regresa a Cotizado');
 assert.equal((await fila('select revision from zain_pagos where pedido_id=$1',[a])).revision,3,'el pago pasa a la nueva revisión');
 assert.ok(await fila('select 1 from zain_cotizacion_aceptaciones where pedido_id=$1 and revision=3',[a]),'la aceptación pasa a la nueva revisión');
 const f=await fila('select venta_total,cobrado,vendido from zain_finanzas_estado where id=$1',[a]);
 assert.equal(Number(f.venta_total),13920);assert.equal(Number(f.cobrado),6000);assert.equal(f.vendido,true,'sigue contando como vendido');
 assert.match((await fila("select notas from zain_historial where pedido_id=$1 and notas like 'Pedido modificado%'",[a])).notas,/revisión 3/);
});

sqlTest('pedido cotizado sin pagos: publicar sigue igual (no hereda aceptación)',async()=>{
 const a=await pedido({estado:'cotizado',pago:0});
 const out=await publicar(a,2,11600);assert.ok(out);
 assert.equal((await fila('select count(*)::int n from zain_cotizacion_aceptaciones where pedido_id=$1 and revision=3',[a])).n,0,'el cliente vuelve a aceptar la revisión nueva');
});

sqlTest('cancelado o con cierre guardado: no se modifica; retirar con pagos sigue bloqueado',async()=>{
 const a=await pedido({estado:'cancelado'});assert.equal(await publicar(a,2,11600),null);
 const b=await pedido({estado:'entregado'});
 await db.query('insert into zain_pedido_cuentas(pedido_id,cerrado_at) values($1,now())',[b]);
 assert.equal(await publicar(b,2,11600),null,'con el cierre guardado hay que reabrirlo primero');
 const c=await pedido();
 assert.equal((await fila(`select zain_cotizacion_guardar($1,2,'retirar','{}',null,$2) as r`,[c,actor])).r,null);
});

sqlTest('cerrar con saldo pendiente: pide motivo, registra el saldo perdonado y la venta queda en lo cobrado',async()=>{
 const a=await pedido({estado:'entregado',total:68800,pago:65000});
 const ver=async()=>(await db.query('select zain_finanzas_ver($1) as v',[a])).rows[0].v;
 const op=async(modo,datos)=>(await db.query('select zain_finanzas_operar($1,$2,$3,$4,$5,$6) as v',[a,(await ver()).version,randomUUID(),modo,JSON.stringify(datos),actor])).rows[0].v;
 assert.equal((await op('gasto',{persona:'zain',grupo:'base',importe:30000,iva_recuperable:0,concepto:'Playeras',fecha:'2026-10-20',comprobante:null})).error,undefined);
 assert.match((await op('cerrar',{costos_completos:true})).error,/Falta cobrar \$38\.00/);
 assert.match((await op('cerrar',{costos_completos:true,perdonar_saldo:true,motivo:''})).error,/motivo/);
 const out=await op('cerrar',{costos_completos:true,perdonar_saldo:true,motivo:'Redondeo con el cliente'});
 assert.equal(out.error,undefined,JSON.stringify(out));
 let f=await fila('select venta_total,venta_cotizada,saldo_condonado,cobrado,utilidad from zain_finanzas_estado where id=$1',[a]);
 assert.equal(Number(f.venta_total),65000);assert.equal(Number(f.venta_cotizada),68800);assert.equal(Number(f.saldo_condonado),3800);
 assert.equal(Number(f.utilidad),35000,'la utilidad sale de lo realmente cobrado');
 assert.match((await fila("select notas from zain_historial where pedido_id=$1 and notas like 'Cierre%'",[a])).notas,/Saldo perdonado: \$38\.00 \(Redondeo con el cliente\)/);
 assert.equal(Number(f.venta_total)-Number(f.cobrado),0,'ya no aparece por cobrar');
 assert.equal((await op('reabrir',{motivo:'Corregir costos'})).error,undefined);
 f=await fila('select venta_total,saldo_condonado from zain_finanzas_estado where id=$1',[a]);
 assert.equal(Number(f.venta_total),68800);assert.equal(Number(f.saldo_condonado),0,'reabrir regresa el saldo a pendiente');
});

sqlTest('cerrar con todo cobrado no cambia',async()=>{
 const a=await pedido({estado:'entregado',total:11600,pago:11600});
 const ver=async()=>(await db.query('select zain_finanzas_ver($1) as v',[a])).rows[0].v;
 const op=async(modo,datos)=>(await db.query('select zain_finanzas_operar($1,$2,$3,$4,$5,$6) as v',[a,(await ver()).version,randomUUID(),modo,JSON.stringify(datos),actor])).rows[0].v;
 await op('gasto',{persona:'zain',grupo:'base',importe:4000,iva_recuperable:0,concepto:'Playeras',fecha:'2026-10-20',comprobante:null});
 assert.equal((await op('cerrar',{costos_completos:true})).error,undefined);
 const f=await fila('select venta_total,saldo_condonado from zain_finanzas_estado where id=$1',[a]);
 assert.equal(Number(f.venta_total),11600);assert.equal(Number(f.saldo_condonado),0);
});

sqlTest('pasar a producción sin anticipo: cuenta como vendido, todo queda por cobrar y sobrevive a una revisión',async()=>{
 const a=await pedido({estado:'cotizado',pago:0});
 await db.query('delete from zain_cotizacion_aceptaciones where pedido_id=$1',[a]);
 const version=async()=>(await fila('select version from zain_pedidos where id=$1',[a])).version;
 const r=(await fila("select zain_actualizar_pedido($1,$2,'produccion','',$3,true) as r",[a,await version(),actor])).r;
 assert.equal(r?.estado,'produccion',JSON.stringify(r));
 let f=await fila('select vendido,anticipo_requerido,cobrado,venta_total,sin_anticipo from zain_finanzas_estado where id=$1',[a]);
 assert.equal(f.vendido,true);assert.equal(Number(f.anticipo_requerido),0);assert.equal(f.sin_anticipo,true);
 assert.match((await fila("select notas from zain_historial where pedido_id=$1 and estado_nuevo='produccion'",[a])).notas,/sin anticipo/);
 assert.ok(await publicar(a,2,13920));
 f=await fila('select vendido,sin_anticipo from zain_finanzas_estado where id=$1',[a]);assert.equal(f.sin_anticipo,true,'la marca pasa a la revisión nueva');assert.equal(f.vendido,true);
 assert.equal((await fila("select zain_actualizar_pedido($1,$2,'entregado','',$3) as r",[a,await version(),actor])).r?.estado,'entregado','se puede entregar sin cobro');
});

sqlTest('sin la marca, producción sigue pidiendo anticipo',async()=>{
 const a=await pedido({estado:'aceptado',pago:0});
 const v=(await fila('select version from zain_pedidos where id=$1',[a])).version;
 assert.match((await fila("select zain_actualizar_pedido($1,$2,'produccion','',$3) as r",[a,v,actor])).r?.error||'',/Falta cobrar el anticipo/);
});
