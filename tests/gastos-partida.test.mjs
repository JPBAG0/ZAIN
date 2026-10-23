import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {validarMovimiento} from '../server/gastos.mjs';

// Costo real contra cotizado por partida, con zain_finanzas_operar real en PGlite y datos ficticios.
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
 for(const archivo of ['gastos-cierre','finanzas-costo-real','finanzas-generales','finanzas-dashboard-v2','cotizaciones-modelos','ventas-reales','gastos-editar','caja-zain','gastos-por-partida'])
  await db.exec(await readFile(new URL('../supabase/'+archivo+'.sql',import.meta.url),'utf8'));
 await db.query('insert into auth.users values($1)',[actor]);await db.query('insert into zain_equipo values($1,true)',[actor]);
});
after(async()=>{await db?.close();});
const sqlTest=(nombre,fn)=>test(nombre,{skip:modulo?false:'Configura ZAIN_PGLITE_MODULE; consulta docs/CAJA.md.'},async()=>{
 await db.exec('begin');try{await fn();}finally{await db.exec('rollback');}
});
async function pedido(){
 const id=randomUUID(),doc={revision:1,subtotal:30000,total:34800,pagos:{anticipo:5000}};
 await db.query(`insert into zain_pedidos(id,folio,estado,total,items) values($1,'ZAIN-F',$2,20,'[]')`,[id,'produccion']);
 await db.query('insert into zain_cotizaciones values($1,2,$2,$3)',[id,'{}',JSON.stringify(doc)]);
 const borrador={costo:20000,partidas:[{nombre:'Polo',color:'Azul marino',piezas:10,costo:12000},{nombre:'Gorra',color:'Negro',piezas:10,costo:6000}]};
 await db.query("insert into zain_cotizaciones_historial values($1,1,'publicar',$2,$3)",[id,JSON.stringify(borrador),JSON.stringify(doc)]);
 return id;
}
const operar=async(id,modo,datos)=>{const v=(await db.query('select zain_finanzas_ver($1) as v',[id])).rows[0].v;return (await db.query('select zain_finanzas_operar($1,$2,$3,$4,$5,$6) as r',[id,v.version,randomUUID(),modo,JSON.stringify(datos),actor])).rows[0].r;};
const gasto=(extra={})=>({concepto:'Playeras',persona:'zain',grupo:'base',importe:13000,iva_recuperable:0,fecha:'2026-10-20',comprobante:null,...extra});

sqlTest('el gasto guarda su partida, la edición la cambia y ver devuelve el costo cotizado',async()=>{
 const id=await pedido();
 let r=await operar(id,'gasto',gasto({partida:0}));
 const m=r.movimientos[0];assert.equal(m.partida,0);
 assert.equal(Number(r.cotizado.total),20000);assert.equal(r.cotizado.partidas.length,2);assert.equal(Number(r.cotizado.partidas[1].costo),6000);assert.equal(r.cotizado.partidas[0].nombre,'Polo');
 r=await operar(id,'editar',{...gasto({partida:1}),movimiento:m.id});assert.equal(r.movimientos[0].partida,1);
 // Un cliente anterior sin la clave «partida» no la borra.
 r=await operar(id,'editar',{...gasto({importe:12500}),movimiento:m.id});assert.equal(r.movimientos[0].partida,1);assert.equal(Number(r.movimientos[0].importe),12500);
 r=await operar(id,'editar',{...gasto({partida:null}),movimiento:m.id});assert.equal(r.movimientos[0].partida,null);
});

sqlTest('una partida que no existe en la revisión publicada se rechaza sin guardar nada',async()=>{
 const id=await pedido();
 await assert.rejects(operar(id,'gasto',gasto({partida:5})),/Partida inválida/);
});

test('validarMovimiento acepta partida opcional y la omite en reembolsos',()=>{
 const base={modo:'gasto',request:randomUUID(),version:0,datos:gasto()};
 assert.equal('partida' in validarMovimiento(base,fail),false);
 assert.equal(validarMovimiento({...base,datos:gasto({partida:2})},fail).partida,2);
 assert.equal(validarMovimiento({...base,datos:gasto({partida:null})},fail).partida,null);
 assert.throws(()=>validarMovimiento({...base,datos:gasto({partida:20})},fail),/partida/);
 assert.throws(()=>validarMovimiento({...base,datos:gasto({partida:'1'})},fail),/partida/);
 const re=validarMovimiento({modo:'reembolso',request:randomUUID(),version:0,datos:{...gasto({persona:'garcia',grupo:'extra',partida:1}),verificado:true}},fail);
 assert.equal('partida' in re,false);
});
