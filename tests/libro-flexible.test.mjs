import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';

// Libro flexible de finanzas: crear, corregir, mover de pedido y borrar con zain_libro_operar real en PGlite.
const modulo=process.env.ZAIN_PGLITE_MODULE,actor=randomUUID();
let db;
before(async()=>{
 if(!modulo)return;
 const {PGlite}=await import(modulo);db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;create schema storage;create table auth.users(id uuid primary key);
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table public.zain_equipo(user_id uuid primary key,activo boolean);
 create table public.zain_pedidos(id uuid primary key,folio text,estado text,total integer,version integer default 1,items jsonb,cliente jsonb,created_at timestamptz default now(),updated_at timestamptz,guardado_at timestamptz default now(),archivado_at timestamptz);
 create table public.zain_cotizaciones(pedido_id uuid primary key,version int,borrador jsonb,publicada jsonb);
 create table public.zain_cotizaciones_historial(pedido_id uuid,version integer,modo text,borrador jsonb,publicada jsonb,primary key(pedido_id,version));
 create table public.zain_cotizacion_aceptaciones(pedido_id uuid not null,revision integer not null,aceptada_at timestamptz not null default now(),documento jsonb not null,primary key(pedido_id,revision));
 create table public.zain_pagos(id uuid primary key,pedido_id uuid,revision int,importe bigint,referencia text default '',actor uuid,created_at timestamptz default now(),foreign key(pedido_id,revision) references public.zain_cotizacion_aceptaciones(pedido_id,revision));
 create table public.zain_historial(pedido_id uuid,actor uuid,estado_anterior text,estado_nuevo text,notas text);`);
 for(const archivo of ['gastos-cierre','finanzas-costo-real','finanzas-generales','finanzas-dashboard-v2','cotizaciones-modelos','ventas-reales','gastos-editar','caja-zain','gastos-por-partida','libro-flexible','libro-comprobantes'])
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

sqlTest('cobro por folio: el equipo acepta la revisión, confirma con el anticipo y actualiza el saldo',async()=>{
 const a=await pedido();
 let r=await nuevo({tipo:'cobro',pedido_id:a,importe:5800,persona:'zain',concepto:'Anticipo por transferencia'});assert.equal(r.ok,true,JSON.stringify(r));
 assert.equal((await fila('select estado from zain_pedidos where id=$1',[a])).estado,'confirmado');
 const ac=await fila('select documento from zain_cotizacion_aceptaciones where pedido_id=$1',[a]);assert.equal(ac.documento.aceptada_por,'equipo');
 assert.equal(Number((await fila('select cobrado from zain_finanzas_estado where id=$1',[a])).cobrado),5800);
 const s=await resumen();assert.equal(Number(s.caja),5800);assert.ok(s.pedidos.some(p=>p.id===a&&Number(p.cobrado)===5800));
});

sqlTest('corregir un cobro: cambia importe y lo mueve a otro pedido conservando su id',async()=>{
 const a=await pedido(),b=await pedido({folio:'ZAIN-G'});
 const r=await nuevo({tipo:'cobro',pedido_id:a,importe:3000,persona:'zain'});
 const e=await operar('guardar','pago',r.id,{tipo:'cobro',pedido_id:b,importe:4000,persona:'garcia',fecha:'2026-10-21',concepto:'Efectivo'});assert.equal(e.ok,true,JSON.stringify(e));
 assert.equal(e.id,r.id);
 const p=await fila('select pedido_id,importe,recibio,fecha::text from zain_pagos where id=$1',[r.id]);
 assert.deepEqual([p.pedido_id,Number(p.importe),p.recibio,p.fecha],[b,4000,'garcia','2026-10-21']);
 assert.equal(Number((await fila('select cobrado from zain_finanzas_estado where id=$1',[a])).cobrado),0);
 assert.equal(Number((await fila('select cobrado from zain_finanzas_estado where id=$1',[b])).cobrado),4000);
 const s=await resumen();assert.equal(Number(s.caja),0);assert.equal(Number(s.socios.garcia),-4000);
});

sqlTest('gasto general: corregir concepto, moverlo a un pedido y borrarlo; todo queda en el historial',async()=>{
 const a=await pedido();
 const r=await nuevo({tipo:'gasto',importe:1200,persona:'juan_pablo',concepto:'Uber',categoria:'Flete'});
 let e=await operar('guardar','general',r.id,{tipo:'gasto',importe:1500,persona:'juan_pablo',concepto:'Uber al taller',categoria:'Flete',fecha:'2026-10-20'});assert.equal(e.id,r.id);
 assert.equal((await fila('select concepto from zain_movimientos_generales where id=$1',[r.id])).concepto,'Uber al taller');
 e=await operar('guardar','general',r.id,{tipo:'gasto',pedido_id:a,grupo:'extra',importe:1500,persona:'juan_pablo',concepto:'Uber al taller',fecha:'2026-10-20'});assert.equal(e.ok,true,JSON.stringify(e));
 assert.notEqual(e.id,r.id);
 assert.ok((await fila('select anulado_at from zain_movimientos_generales where id=$1',[r.id])).anulado_at);
 const m=await fila('select pedido_id,grupo,importe from zain_pedido_movimientos where id=$1',[e.id]);assert.deepEqual([m.pedido_id,m.grupo,Number(m.importe)],[a,'extra',1500]);
 assert.equal(Number((await fila('select debe_jp from zain_finanzas_estado where id=$1',[a])).debe_jp),1500);
 const b=await operar('borrar','pedido',e.id,{});assert.equal(b.ok,true);
 assert.equal(Number((await fila('select debe_jp from zain_finanzas_estado where id=$1',[a])).debe_jp),0);
 assert.equal(Number((await fila('select count(*) n from zain_libro_historial')).n),4);
 assert.equal((await resumen()).libro.length,0);
});

sqlTest('transferencia y reparto se crean, corrigen y borran; la misma solicitud no duplica',async()=>{
 const request=randomUUID();
 const r=await operar('guardar',null,null,{request,tipo:'transferencia',origen_persona:'juan_pablo',destino_persona:'zain',importe:2000,fecha:'2026-10-20',concepto:'Depósito'});
 assert.equal((await operar('guardar',null,null,{request,tipo:'transferencia',origen_persona:'juan_pablo',destino_persona:'zain',importe:2000,fecha:'2026-10-20',concepto:'Depósito'})).repetido,true);
 await operar('guardar','caja',r.id,{tipo:'transferencia',origen_persona:'zain',destino_persona:'garcia',importe:500,fecha:'2026-10-20',concepto:'Préstamo'});
 let s=await resumen();assert.equal(Number(s.caja),-500);assert.equal(Number(s.socios.garcia),-500);
 const rp=await nuevo({tipo:'reparto',persona:'juan_pablo',importe:300,concepto:'Reparto'});
 assert.equal(Number((await resumen()).utilidad.repartido.juan_pablo),300);
 await operar('borrar','caja',rp.id,{});assert.equal(Number((await resumen()).utilidad.repartido.juan_pablo),0);
});

sqlTest('errores claros: cobro sin pedido, pedido sin cotización publicada, pedido cerrado y registro inexistente',async()=>{
 assert.match((await nuevo({tipo:'cobro',importe:100,persona:'zain'})).error,/pedido/);
 const sin=await pedido({publicada:false});
 assert.match((await nuevo({tipo:'cobro',pedido_id:sin,importe:100,persona:'zain'})).error,/publicada/);
 const c=await pedido({estado:'entregado'});await db.query("insert into zain_pedido_cuentas(pedido_id,cerrado_at,cierre) values($1,now(),'{}')",[c]);
 assert.match((await nuevo({tipo:'gasto',pedido_id:c,importe:100,persona:'zain',concepto:'X'})).error,/cerrado/);
 assert.match((await operar('borrar','general',randomUUID(),{})).error,/ya no existe/);
 assert.match((await nuevo({tipo:'gasto',importe:100,persona:'zain',concepto:'X',fecha:'2999-01-01'})).error,/fecha/);
});

test('validarLibro: tipos, folio, categorías de movimientos generales y borrar con id',async()=>{
 const {validarLibro}=await import('../server/caja.mjs');
 const fail=(status,message)=>{throw Object.assign(Error(message),{status});};
 const base={modo:'guardar',datos:{request:randomUUID(),tipo:'gasto',importe:100,fecha:'2026-10-20',concepto:'Flete',categoria:'Flete',persona:'zain'}};
 assert.equal(validarLibro(base,fail).datos.concepto,'Flete');
 assert.throws(()=>validarLibro({...base,datos:{...base.datos,categoria:'Inventada'}},fail),/categoría/);
 assert.equal(validarLibro({...base,datos:{...base.datos,categoria:undefined,pedido_id:randomUUID()}},fail).datos.tipo,'gasto');
 assert.throws(()=>validarLibro({...base,datos:{...base.datos,tipo:'otro'}},fail),/tipo/);
 assert.throws(()=>validarLibro({...base,datos:{...base.datos,pedido_id:'abc'}},fail),/pedido/);
 assert.throws(()=>validarLibro({modo:'borrar'},fail),/borras/);
 assert.deepEqual(validarLibro({modo:'borrar',origen:'pago',id:base.datos.request},fail).modo,'borrar');
 assert.throws(()=>validarLibro({modo:'guardar',origen:'otro',id:randomUUID(),datos:base.datos},fail),/inválido/);
 assert.equal(validarLibro({...base,datos:{...base.datos,tipo:'cobro',concepto:'',pedido_id:randomUUID()}},fail).datos.concepto,'');
});

sqlTest('comprobantes: un gasto adjunta el suyo, el libro lo devuelve, editar lo conserva y no se mueve entre registros',async()=>{
 const a=await pedido(),b=await pedido({folio:'ZAIN-H'}),cg=randomUUID(),cp=randomUUID();
 await db.query("insert into zain_general_archivos(id,objeto,nombre,mime,bytes,hash,actor) values($1,'generales/x.pdf','Comprobante.pdf','application/pdf',10,'h',$2)",[cg,actor]);
 await db.query("insert into zain_gasto_archivos(id,pedido_id,objeto,nombre,mime,bytes,hash,actor) values($1,$2,'p/x.pdf','Comprobante.pdf','application/pdf',10,'h',$3)",[cp,a,actor]);
 const r=await nuevo({tipo:'gasto',importe:900,persona:'zain',concepto:'Anuncios',categoria:'Marketing y publicidad',comprobante:cg});assert.equal(r.ok,true,JSON.stringify(r));
 let l=(await resumen()).libro.find(m=>m.id===r.id);assert.equal(l.comprobante,cg);
 await operar('guardar','general',r.id,{tipo:'gasto',importe:950,persona:'zain',concepto:'Anuncios octubre',categoria:'Marketing y publicidad',fecha:'2026-10-20'});
 l=(await resumen()).libro.find(m=>m.id===r.id);assert.equal(l.comprobante,cg);assert.equal(Number(l.importe),950);
 assert.match((await operar('guardar','general',r.id,{tipo:'gasto',pedido_id:a,importe:950,persona:'zain',concepto:'X',fecha:'2026-10-20'})).error,/comprobante/);
 assert.match((await nuevo({tipo:'gasto',pedido_id:b,importe:100,persona:'zain',concepto:'X',comprobante:cp})).error,/comprobante/);
 const g=await nuevo({tipo:'gasto',pedido_id:a,importe:100,persona:'zain',concepto:'Playeras',comprobante:cp});assert.equal(g.ok,true,JSON.stringify(g));
 assert.equal((await fila('select comprobante from zain_pedido_movimientos where id=$1',[g.id])).comprobante,cp);
 assert.match((await nuevo({tipo:'ingreso',importe:100,persona:'zain',concepto:'X',categoria:'Otros ingresos',comprobante:cg})).error,/Solo los gastos/);
});
