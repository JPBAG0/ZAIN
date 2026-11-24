import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';

// 24-nov-2026: el equipo registra la aceptación aunque el pedido ya esté en Producción o Entregado (PGlite real).
const modulo=process.env.ZAIN_PGLITE_MODULE,actor=randomUUID(),ajeno=randomUUID();
let db;
before(async()=>{
 if(!modulo)return;
 const {PGlite}=await import(modulo);db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create table public.zain_equipo(user_id uuid primary key,activo boolean);
 create table public.zain_pedidos(id uuid primary key,estado text,version integer default 1,updated_at timestamptz,guardado_at timestamptz default now(),archivado_at timestamptz);
 create table public.zain_cotizaciones(pedido_id uuid primary key,publicada jsonb);
 create table public.zain_cotizacion_aceptaciones(pedido_id uuid not null,revision integer not null,aceptada_at timestamptz not null default now(),documento jsonb not null,primary key(pedido_id,revision));
 create table public.zain_historial(pedido_id uuid,actor uuid,estado_anterior text,estado_nuevo text,notas text);`);
 await db.exec(await readFile(new URL('../supabase/aceptacion-equipo-avanzado.sql',import.meta.url),'utf8'));
 await db.query('insert into zain_equipo values($1,true),($2,false)',[actor,ajeno]);
});
after(async()=>{await db?.close();});
const sqlTest=(nombre,fn)=>test(nombre,{skip:modulo?false:'Configura ZAIN_PGLITE_MODULE; consulta docs/CAJA.md.'},async()=>{
 await db.exec('begin');try{await fn();}finally{await db.exec('rollback');}
});
const fila=async(sql,p)=>(await db.query(sql,p)).rows[0];
async function pedido(estado,vigencia=''){
 const id=randomUUID();await db.query('insert into zain_pedidos(id,estado) values($1,$2)',[id,estado]);
 await db.query('insert into zain_cotizaciones values($1,$2)',[id,JSON.stringify({revision:10,total:565010,vigencia})]);return id;
}
const aceptar=async(id,rev=10,quien=actor)=>(await fila('select zain_cotizacion_aceptar_equipo($1,$2,$3) as r',[id,rev,quien])).r;

sqlTest('pedido en producción o entregado: registra la aceptación y conserva el estado',async()=>{
 for(const estado of ['produccion','entregado','confirmado']){
  const id=await pedido(estado,'2026-01-01');
  const r=await aceptar(id);assert.equal(r.revision,10,estado+' (vigencia vencida no bloquea al equipo)');
  assert.equal((await fila('select estado from zain_pedidos where id=$1',[id])).estado,estado);
  assert.equal((await fila('select (documento->>\'total\')::int t from zain_cotizacion_aceptaciones where pedido_id=$1',[id])).t,565010);
  const h=await fila('select actor,notas from zain_historial where pedido_id=$1',[id]);assert.equal(h.actor,actor);assert.match(h.notas,/conserva su estado/);
  assert.equal((await aceptar(id)).revision,10,'repetir es idempotente');assert.equal((await fila('select count(*)::int n from zain_historial where pedido_id=$1',[id])).n,1);
 }
});
sqlTest('pedido cotizado pasa a aceptado como antes',async()=>{
 const id=await pedido('cotizado');assert.ok(await aceptar(id));
 assert.equal((await fila('select estado from zain_pedidos where id=$1',[id])).estado,'aceptado');
});
sqlTest('rechaza revisión vieja, cancelado, archivado y usuario fuera del equipo',async()=>{
 assert.equal(await aceptar(await pedido('produccion'),9),null);
 assert.equal(await aceptar(await pedido('cancelado')),null);
 const a=await pedido('produccion');await db.query('update zain_pedidos set archivado_at=now() where id=$1',[a]);assert.equal(await aceptar(a),null);
 assert.equal(await aceptar(await pedido('produccion'),10,ajeno),null);
 assert.equal((await fila('select count(*)::int n from zain_cotizacion_aceptaciones')).n,0);
});
sqlTest('solo service_role puede ejecutarla',async()=>{
 const p=await fila("select has_function_privilege('anon','zain_cotizacion_aceptar_equipo(uuid,integer,uuid)','EXECUTE') a,has_function_privilege('authenticated','zain_cotizacion_aceptar_equipo(uuid,integer,uuid)','EXECUTE') u");
 assert.deepEqual(p,{a:false,u:false});
});
