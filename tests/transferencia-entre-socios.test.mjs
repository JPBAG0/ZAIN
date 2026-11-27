import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';

// 27-nov-2026: transferencia directa de un socio a otro (JP le pasa a García dinero del negocio). PGlite real.
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
 for(const archivo of ['gastos-cierre','finanzas-costo-real','finanzas-generales','finanzas-dashboard-v2','cotizaciones-modelos','ventas-reales','gastos-editar','caja-zain','gastos-por-partida','libro-flexible','libro-comprobantes','iva-oficinas-anticipo','cotizacion-partidas-editables','archivos-logos-extra','editar-siempre-y-cierre-con-saldo','entregar-con-saldo','produccion-sin-anticipo','transferencia-entre-socios'])
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
const resumen=async()=>(await db.query('select zain_caja_resumen() as r')).rows[0].r;
const fila=async(sql,p)=>(await db.query(sql,p)).rows[0];
sqlTest('JP le pasa dinero a García: baja lo que JP tiene del negocio y lo que ZAIN le debe a García; cajas y resultado no cambian',async()=>{
 const a=await pedido();
 assert.equal((await nuevo({tipo:'cobro',pedido_id:a,importe:6000,persona:'juan_pablo'})).ok,true);
 assert.equal((await nuevo({tipo:'gasto',pedido_id:a,importe:4000,persona:'garcia',grupo:'base',concepto:'Playeras'})).ok,true);
 let s=await resumen();
 assert.deepEqual([Number(s.socios.juan_pablo),Number(s.socios.garcia)],[-6000,4000]);
 const antes={caja:Number(s.caja),cajas:JSON.stringify(s.cajas)};
 const r=await nuevo({tipo:'transferencia',importe:4000,origen_persona:'juan_pablo',destino_persona:'garcia',concepto:'Le pagué a García lo que puso'});
 assert.equal(r.ok,true,JSON.stringify(r));
 s=await resumen();
 assert.deepEqual([Number(s.socios.juan_pablo),Number(s.socios.garcia)],[-2000,0],'JP tiene 2,000 del negocio y a García ya no se le debe');
 assert.equal(Number(s.caja),antes.caja);assert.equal(JSON.stringify(s.cajas),antes.cajas);
 const m=s.libro.find(x=>x.origen==='caja');
 assert.deepEqual([m.origen_persona,m.destino,Number(m.efecto_caja),Number(m.efecto_socio)],['juan_pablo','garcia',0,0],'en el libro solo mueve dinero');
 // Al revés y corregir: García → JP y editar el importe.
 const e=await operar('guardar','caja',m.id,{tipo:'transferencia',importe:1000,fecha:'2026-10-20',origen_persona:'garcia',destino_persona:'juan_pablo',concepto:'Corrección'});
 assert.equal(e.ok,true,JSON.stringify(e));s=await resumen();
 assert.deepEqual([Number(s.socios.juan_pablo),Number(s.socios.garcia)],[-7000,5000],'García entrega: a él se le debe más; JP recibe');
 // Borrar regresa todo; mismo origen y destino se rechaza.
 assert.equal((await operar('borrar','caja',m.id,{})).ok,true);s=await resumen();
 assert.deepEqual([Number(s.socios.juan_pablo),Number(s.socios.garcia)],[-6000,4000]);
 assert.ok((await nuevo({tipo:'transferencia',importe:100,origen_persona:'garcia',destino_persona:'garcia',concepto:'No'})).error);
 // Identidad contable: caja − deudas con socios = cobros − gastos (las oficinas en 0).
 assert.equal(Number(s.caja)-Number(s.socios.juan_pablo)-Number(s.socios.garcia),6000-4000);
});
