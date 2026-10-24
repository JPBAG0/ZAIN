import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';

// Folio de cotizaciones por modelo: como los pedidos, sin consecutivo; las existentes conservan el suyo.
const modulo=process.env.ZAIN_PGLITE_MODULE;
test('SQL: folio COT- derivado del id, fijo al actualizar y sin tocar los folios anteriores',{skip:modulo?false:'Configura ZAIN_PGLITE_MODULE.'},async()=>{
 const {PGlite}=await import(modulo),db=new PGlite();
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
  create schema auth;create schema storage;create table auth.users(id uuid primary key);
  create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
  create table public.zain_pedidos(id uuid primary key);`);
  await db.exec(await readFile(new URL('../supabase/cotizaciones-modelos.sql',import.meta.url),'utf8'));
  const uid=randomUUID();await db.query('insert into auth.users values($1)',[uid]);
  const alta=id=>db.query(`insert into zain_cotizaciones_modelos(id,datos,creado_por,actor) values($1,'{}',$2,$2) returning folio`,[id,uid]);
  const vieja=randomUUID();assert.equal((await alta(vieja)).rows[0].folio,'COT-0001');
  await db.exec(await readFile(new URL('../supabase/cotizaciones-folio.sql',import.meta.url),'utf8'));
  const id='24780811-e891-42ee-bf7b-ef4eef39f066',f=(await alta(id)).rows[0].folio;
  assert.equal(f,'COT-24780811E891');
  await db.query(`update zain_cotizaciones_modelos set folio='COT-0009',estado='enviada' where id=$1`,[id]);
  const filas=(await db.query('select id,folio,estado from zain_cotizaciones_modelos order by numero')).rows;
  assert.deepEqual(filas.map(r=>r.folio),['COT-0001','COT-24780811E891']);assert.equal(filas[1].estado,'enviada');
  await assert.rejects(db.query(`insert into zain_cotizaciones_modelos(id,datos,creado_por,actor) values($1,'{}',$2,$2)`,['24780811-e891-0000-8000-000000000000',uid]),/unique|duplic/i);
 }finally{await db.close();}
});
