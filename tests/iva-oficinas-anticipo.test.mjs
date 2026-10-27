import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';

// 26-oct-2026: todo con IVA, cajas Oficina JP y Oficina García, anticipo aceptado y partida desde el libro (PGlite real).
const modulo=process.env.ZAIN_PGLITE_MODULE,actor=randomUUID();
let db;
before(async()=>{
 if(!modulo)return;
 const {PGlite}=await import(modulo);db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;create schema storage;create table auth.users(id uuid primary key);
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table public.zain_equipo(user_id uuid primary key,activo boolean);
 create table public.zain_pedidos(id uuid primary key,folio text,estado text,total integer,version integer default 1,items jsonb,cliente jsonb,notas_internas text,created_at timestamptz default now(),updated_at timestamptz,guardado_at timestamptz default now(),archivado_at timestamptz);
 create table public.zain_cotizaciones(pedido_id uuid primary key,version int,borrador jsonb,publicada jsonb);
 create table public.zain_cotizaciones_historial(pedido_id uuid,version integer,modo text,borrador jsonb,publicada jsonb,primary key(pedido_id,version));
 create table public.zain_cotizacion_aceptaciones(pedido_id uuid not null,revision integer not null,aceptada_at timestamptz not null default now(),documento jsonb not null,primary key(pedido_id,revision));
 create table public.zain_pagos(id uuid primary key,pedido_id uuid,revision int,importe bigint,referencia text default '',actor uuid,created_at timestamptz default now(),foreign key(pedido_id,revision) references public.zain_cotizacion_aceptaciones(pedido_id,revision));
 create table public.zain_historial(pedido_id uuid,actor uuid,estado_anterior text,estado_nuevo text,notas text);`);
 for(const archivo of ['gastos-cierre','finanzas-costo-real','finanzas-generales','finanzas-dashboard-v2','cotizaciones-modelos','ventas-reales','gastos-editar','caja-zain','gastos-por-partida','libro-flexible','libro-comprobantes','iva-oficinas-anticipo'])
  await db.exec(await readFile(new URL('../supabase/'+archivo+'.sql',import.meta.url),'utf8'));
 await db.query('insert into auth.users values($1)',[actor]);await db.query('insert into zain_equipo values($1,true)',[actor]);
});
after(async()=>{await db?.close();});
const sqlTest=(nombre,fn)=>test(nombre,{skip:modulo?false:'Configura ZAIN_PGLITE_MODULE; consulta docs/CAJA.md.'},async()=>{
 await db.exec('begin');try{await fn();}finally{await db.exec('rollback');}
});
async function pedido({estado='cotizado',publicada=true,total=11600,folio='ZAIN-F'}={}){
 const id=randomUUID();
 await db.query(`insert into zain_pedidos(id,folio,estado,total,items,cliente) values($1,$2,$3,10,'[]',$4)`,[id,folio+'-'+id.slice(0,4),estado,JSON.stringify({nombre:'Cliente ficticio'})]);
 const doc=publicada?{revision:1,subtotal:10000,total,pagos:{anticipo:5000}}:null;
 await db.query('insert into zain_cotizaciones values($1,2,$2,$3)',[id,'{}',JSON.stringify(doc)]);
 if(publicada)await db.query("insert into zain_cotizaciones_historial values($1,1,'publicar',$2,$3)",[id,JSON.stringify({costo:4000,partidas:[]}),JSON.stringify(doc)]);
 return id;
}
const operar=async(modo,origen,id,datos)=>(await db.query('select zain_libro_operar($1,$2,$3,$4,$5) as r',[modo,origen,id,JSON.stringify(datos),actor])).rows[0].r;
const nuevo=datos=>operar('guardar',null,null,{request:randomUUID(),fecha:'2026-10-20',...datos});
const fila=async(sql,p)=>(await db.query(sql,p)).rows[0];
const resumen=async()=>(await db.query('select zain_caja_resumen() as r')).rows[0].r;
const estado=async id=>fila('select * from zain_finanzas_estado where id=$1',[id]);
const conPartidas=id=>db.query('update zain_cotizaciones_historial set borrador=$2 where pedido_id=$1',[id,JSON.stringify({costo:4000,partidas:[{nombre:'Polo',costo:3000},{nombre:'Camisa',costo:1000}]})]);

sqlTest('venta, utilidad y margen con IVA; el IVA cobrado queda aparte',async()=>{
 const a=await pedido({estado:'entregado'});
 await nuevo({tipo:'cobro',pedido_id:a,importe:11600,persona:'zain'});
 await nuevo({tipo:'gasto',pedido_id:a,importe:5000,persona:'garcia',grupo:'base',concepto:'Playeras'});
 const f=await estado(a);
 assert.deepEqual([f.venta,f.venta_total,f.venta_sin_iva,f.iva_cobrado].map(Number),[11600,11600,10000,1600]);
 assert.equal(Number(f.costo),5000,'antes del cierre, el mayor entre cotizado (4000) y real (5000)');
 assert.equal(Number(f.utilidad),6600,'venta con IVA menos costos con IVA');
 assert.equal(Number((await resumen()).iva_cobrado),1600);
});

sqlTest('Oficina JP y Oficina García: saldos propios, separados de Caja ZAIN y de los socios',async()=>{
 const a=await pedido();
 assert.equal((await nuevo({tipo:'cobro',pedido_id:a,importe:6000,persona:'oficina_jp'})).ok,true);
 assert.equal((await nuevo({tipo:'gasto',pedido_id:a,importe:1500,persona:'oficina_garcia',grupo:'base',concepto:'Bordado'})).ok,true);
 assert.equal((await nuevo({tipo:'gasto',importe:300,persona:'oficina_jp',categoria:'Flete',concepto:'Envío'})).ok,true);
 let r=await nuevo({tipo:'transferencia',importe:2000,origen_persona:'oficina_jp',destino_persona:'zain',concepto:'Depósito a la caja'});assert.equal(r.ok,true,JSON.stringify(r));
 r=await nuevo({tipo:'transferencia',importe:500,origen_persona:'oficina_jp',destino_persona:'oficina_garcia',concepto:'Entre oficinas'});assert.equal(r.ok,true,JSON.stringify(r));
 r=await nuevo({tipo:'transferencia',importe:100,origen_persona:'garcia',destino_persona:'oficina_garcia',concepto:'García deja efectivo'});assert.equal(r.ok,true,JSON.stringify(r));
 const s=await resumen();
 assert.deepEqual(Object.fromEntries(Object.entries(s.cajas).map(([k,v])=>[k,Number(v)])),{zain:2000,oficina_jp:3200,oficina_garcia:-900});
 assert.equal(Number(s.caja),2000,'«caja» sigue siendo la Caja ZAIN');
 assert.deepEqual([Number(s.socios.juan_pablo),Number(s.socios.garcia)],[0,100],'las oficinas no le deben ni le cobran a los socios');
 assert.match((await nuevo({tipo:'transferencia',importe:100,origen_persona:'juan_pablo',destino_persona:'garcia',concepto:'Entre socios'})).error,/dos cajas|una caja/);
 assert.ok((await nuevo({tipo:'reembolso',importe:100,persona:'oficina_jp',concepto:'No'})).error,'el reembolso es solo para socios');
 assert.ok((await nuevo({tipo:'reparto',importe:100,persona:'oficina_jp',concepto:'No'})).error,'el reparto es solo para socios');
});

sqlTest('anticipo menor al pactado: el equipo lo acepta y el pedido pasa a Confirmado',async()=>{
 const a=await pedido();
 await nuevo({tipo:'cobro',pedido_id:a,importe:4000,persona:'zain'});
 assert.equal((await fila('select estado from zain_pedidos where id=$1',[a])).estado,'aceptado','4000 no cubre el 50% de 11600');
 const aceptar=rev=>db.query('select zain_anticipo_aceptar($1,$2,$3) as r',[a,rev,actor]).then(x=>x.rows[0].r);
 assert.ok((await aceptar(2)).error,'revisión ajena');
 assert.equal((await aceptar(1)).ok,true);
 assert.equal((await fila('select estado from zain_pedidos where id=$1',[a])).estado,'confirmado');
 const f=await estado(a);assert.deepEqual([f.anticipo_requerido,f.anticipo_aceptado,f.anticipo_pactado].map(Number),[4000,4000,5800]);assert.equal(f.vendido,true);
 const s=(await db.query('select zain_seguimiento_cotizacion($1) as s',[a])).rows[0].s;assert.deepEqual([s.anticipo,s.anticipo_pactado,s.anticipo_aceptado],[4000,5800,4000]);
 assert.match((await aceptar(1)).error,/ya está cubierto/);
 assert.match((await fila("select notas from zain_historial where pedido_id=$1 and estado_nuevo='confirmado'",[a])).notas,/Anticipo aceptado por el equipo: 40\.00 de 58\.00/);
 const b=await pedido({folio:'ZAIN-SIN-PAGO'});
 await db.query("insert into zain_cotizacion_aceptaciones(pedido_id,revision,documento) values($1,1,'{}')",[b]);await db.query("update zain_pedidos set estado='aceptado' where id=$1",[b]);
 assert.match((await db.query('select zain_anticipo_aceptar($1,1,$2) as r',[b,actor])).rows[0].r.error,/Primero registra el pago/);
});

sqlTest('el libro de Finanzas guarda la partida del gasto, la valida y la conserva al corregir sin elegirla',async()=>{
 const a=await pedido();await conPartidas(a);
 const r=await nuevo({tipo:'gasto',pedido_id:a,importe:2500,persona:'zain',grupo:'base',partida:0,concepto:'Polos'});assert.equal(r.ok,true,JSON.stringify(r));
 const partida=async()=>(await fila('select partida from zain_pedido_movimientos where id=$1',[r.id])).partida;
 assert.equal(await partida(),0);
 assert.match((await nuevo({tipo:'gasto',pedido_id:a,importe:100,persona:'zain',grupo:'base',partida:5,concepto:'X'})).error,/partida/);
 const editar=extra=>operar('guardar','pedido',r.id,{tipo:'gasto',pedido_id:a,importe:2600,persona:'zain',grupo:'base',fecha:'2026-10-20',concepto:'Polos',...extra});
 assert.equal((await editar({})).ok,true);assert.equal(await partida(),0,'sin la clave partida no se toca');
 assert.equal((await editar({partida:1})).ok,true);assert.equal(await partida(),1);
 assert.equal((await editar({partida:null})).ok,true);assert.equal(await partida(),null,'null la deja sin partida');
});

sqlTest('pestaña Gastos acepta oficinas como quien pagó; reembolsos y respaldo siguen siendo de socios',async()=>{
 const a=await pedido();
 const ver=async()=>(await db.query('select zain_finanzas_ver($1) as v',[a])).rows[0].v;
 const op=async(modo,datos)=>(await db.query('select zain_finanzas_operar($1,$2,$3,$4,$5,$6) as v',[a,(await ver()).version,randomUUID(),modo,JSON.stringify(datos),actor])).rows[0].v;
 const out=await op('gasto',{persona:'oficina_garcia',grupo:'base',importe:900,iva_recuperable:0,concepto:'Taller',fecha:'2026-10-20',comprobante:null});
 assert.equal(out.error,undefined,JSON.stringify(out));assert.equal(Number(out.resumen.debe_garcia),0,'pagar con la oficina no genera deuda con García');
 assert.equal((await op('anular',{movimiento:out.movimientos[0].id,motivo:'Se capturó dos veces'})).error,undefined,'anular un gasto de oficina no exige respaldo de reembolso');
});

sqlTest('pestaña Cobro: con anticipo parcial aceptado, el cambio manual de estado ya no se bloquea',async()=>{
 const a=await pedido();
 await db.query("insert into zain_cotizacion_aceptaciones(pedido_id,revision,documento) values($1,1,'{}')",[a]);await db.query("update zain_pedidos set estado='aceptado' where id=$1",[a]);
 const pago=await fila('select zain_registrar_pago($1,1,$2,3000,$3,$4) as r',[a,randomUUID(),'Transferencia',actor]);assert.equal(pago.r.registrado,true);
 const version=async()=>(await fila('select version from zain_pedidos where id=$1',[a])).version;
 assert.equal((await fila("select zain_actualizar_pedido($1,$2,'confirmado','',$3) as r",[a,await version(),actor])).r,null,'sin aceptar el monto, 3000 no alcanza');
 assert.equal((await fila('select zain_anticipo_aceptar($1,1,$2) as r',[a,actor])).r.ok,true);
 assert.equal((await fila('select estado from zain_pedidos where id=$1',[a])).estado,'confirmado');
 assert.ok((await fila("select zain_actualizar_pedido($1,$2,'produccion','',$3) as r",[a,await version(),actor])).r,'con el monto aceptado avanza a producción');
});
