import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {validarCliente,telefonoCliente,createClientes} from '../server/clientes.mjs';

// Clientes (21-nov-2026): ficha por cliente, ligar pedidos y cotizaciones, juntar repetidos y duplicar (PGlite real).
const modulo=process.env.ZAIN_PGLITE_MODULE,actor=randomUUID();
let db;
before(async()=>{
 if(!modulo)return;
 const {PGlite}=await import(modulo);db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;create schema storage;create table auth.users(id uuid primary key);
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table public.zain_equipo(user_id uuid primary key,activo boolean);
 create table public.zain_pedidos(id uuid primary key,folio text not null unique,token_hash text not null default repeat('0',64),created_at timestamptz not null default now(),guardado_at timestamptz,
  estado text not null default 'nuevo',items jsonb not null default '[]',archivos jsonb not null default '[]',total integer not null default 1,notas_internas text not null default '',version integer not null default 0,
  updated_at timestamptz not null default now(),archivado_at timestamptz,cliente jsonb not null default '{}',partidas_version integer not null default 0);
 create table public.zain_cotizaciones(pedido_id uuid primary key,version int not null default 1,borrador jsonb not null,publicada jsonb,updated_at timestamptz not null default now(),actor uuid);
 create table public.zain_historial(id bigint generated always as identity primary key,pedido_id uuid not null,actor uuid,created_at timestamptz not null default now(),estado_anterior text not null,estado_nuevo text not null,notas text not null);
 create table public.zain_limites(clave text primary key,valor bigint not null default 0,vence timestamptz not null default now());`);
 for(const archivo of ['cotizaciones-modelos','clientes'])await db.exec(await readFile(new URL('../supabase/'+archivo+'.sql',import.meta.url),'utf8'));
 await db.query('insert into auth.users values($1)',[actor]);
});
after(async()=>{await db?.close();});
const sqlTest=(nombre,fn)=>test(nombre,{skip:modulo?false:'Configura ZAIN_PGLITE_MODULE; consulta docs/CAJA.md.'},async()=>{
 await db.exec('begin');try{await fn();}finally{await db.exec('rollback');}
});
const uno=async(sql,p)=>(await db.query(sql,p)).rows[0];
// Un error esperado aborta la transacción de la prueba: se aísla con un savepoint.
const falla=async(sql,p,error)=>{await db.exec('savepoint esperado');await assert.rejects(db.query(sql,p),error);await db.exec('rollback to savepoint esperado');};
let orden=0;
const todos=async(sql,p)=>(await db.query(sql,p)).rows;
async function pedido({nombre='',telefono='',estado='nuevo',guardado=true,total=null,archivado=false,items=[{nombre:'Playera',piezas:12,pedido_hash:'h'}],archivos=[]}={}){
 const id=randomUUID(),cliente={...(nombre?{nombre}:{}),...(telefono?{telefono}:{})};
 await db.query(`insert into zain_pedidos(id,folio,estado,guardado_at,cliente,items,archivos,archivado_at,total,created_at) values($1,$2,$3,$4,$5,$6,$7,$8,12,now()+make_interval(secs=>$9))`,
  [id,'ZAIN-'+id.slice(0,8).toUpperCase(),estado,guardado?new Date():null,JSON.stringify(cliente),JSON.stringify(items),JSON.stringify(archivos.map(a=>({...a,path:id+'/'+a.path}))),archivado?new Date():null,++orden]);
 if(total!=null)await db.query('insert into zain_cotizaciones(pedido_id,borrador,publicada) values($1,$2,$3)',[id,JSON.stringify({costo:100,vigencia:'2026-11-30',selecciones:[{origen:0}],partidasVersion:2,destinatario:nombre}),JSON.stringify({total})]);
 return id;
}
async function cotizacion(cliente){
 const id=randomUUID();
 await db.query(`insert into zain_cotizaciones_modelos(id,cliente,datos,creado_por,actor) values($1,$2,'{"modelos":[]}',$3,$3)`,[id,cliente,actor]);
 return id;
}
const sincronizar=async()=>(await uno('select public.zain_clientes_sincronizar() n')).n;
const clienteDe=async id=>(await uno('select cliente_id from zain_pedidos where id=$1',[id])).cliente_id;

test('validarCliente limpia nombre, teléfono y correo',()=>{
 const fail=(s,m)=>{const e=new Error(m);e.status=s;throw e;};
 assert.deepEqual(validarCliente({nombre:'  Constructora   del Bajío ',telefono:'33 1234 5678',correo:' Compras@Bajio.MX '},fail),
  {nombre:'Constructora del Bajío',empresa:'',telefono:'523312345678',correo:'compras@bajio.mx',notas:''});
 assert.throws(()=>validarCliente({nombre:'A'},fail),/nombre/);
 assert.throws(()=>validarCliente({nombre:'Ana',telefono:'12345'},fail),/teléfono/);
 assert.throws(()=>validarCliente({nombre:'Ana',correo:'ana@'},fail),/correo/);
 assert.equal(telefonoCliente('+52 1 33 1234 5678'),'5213312345678');
});

sqlTest('sincronizar liga por teléfono y por nombre sin acentos, y no repite',async()=>{
 const a=await pedido({nombre:'Andrea López',telefono:'523311112222'});
 const b=await pedido({nombre:'Drea',telefono:'3311112222'}); // mismo teléfono con otro nombre: misma persona
 const c=await pedido({nombre:'andrea lopez'});              // mismo nombre sin teléfono: misma ficha
 const d=await pedido({nombre:'Andrea López',telefono:'523399998888'}); // mismo nombre, otro teléfono: otra persona
 const e=await pedido({nombre:'Contacto de WhatsApp'}),f=await pedido({nombre:'Contacto de WhatsApp'});
 const sinGuardar=await pedido({nombre:'Andrea López',guardado:false});
 const cot=await cotizacion('ANDREA  LÓPEZ');
 assert.equal(await sincronizar(),7);
 assert.equal(await clienteDe(a),await clienteDe(b));
 assert.equal(await clienteDe(a),await clienteDe(c));
 assert.notEqual(await clienteDe(a),await clienteDe(d));
 assert.notEqual(await clienteDe(e),await clienteDe(f),'«Contacto de WhatsApp» no junta a desconocidos');
 assert.equal(await clienteDe(sinGuardar),null,'una carga incompleta no crea cliente');
 assert.equal((await uno('select cliente_id from zain_cotizaciones_modelos where id=$1',[cot])).cliente_id,await clienteDe(a));
 assert.equal(await sincronizar(),0,'la segunda vuelta no hace nada');
 assert.equal((await uno('select count(*)::int n from zain_clientes')).n,4);
});

sqlTest('la lista cuenta pedidos, cerrados y lo vendido solo de pedidos confirmados o después',async()=>{
 await pedido({nombre:'Taller Ríos',estado:'entregado',total:116000});
 await pedido({nombre:'Taller Ríos',estado:'produccion',total:58000});
 await pedido({nombre:'Taller Ríos',estado:'cotizado',total:99999});
 await pedido({nombre:'Taller Ríos',estado:'entregado',total:50000,archivado:true});
 await cotizacion('Taller Rios');
 await sincronizar();
 const [x]=(await uno('select public.zain_clientes_lista() l')).l;
 assert.equal(x.nombre,'Taller Ríos');
 assert.equal(x.pedidos,4);assert.equal(x.cerrados,2);assert.equal(x.cotizaciones,1);assert.equal(x.vendido,174000);
 const ficha=(await uno('select public.zain_cliente_ficha($1) f',[x.id])).f;
 assert.equal(ficha.pedidos.length,4);assert.equal(ficha.cotizaciones.length,1);
 assert.equal(ficha.pedidos.filter(p=>p.archivado).length,1);
 assert.equal(ficha.cliente.creado_por,undefined,'la ficha no expone quién la creó');
});

sqlTest('juntar dos fichas mueve pedidos y cotizaciones y la ficha vieja ya no aparece',async()=>{
 const a=await pedido({nombre:'Constructora Bajío'}),b=await pedido({nombre:'Ing. Pérez',telefono:'523300001111'});
 const cot=await cotizacion('Ing. Pérez');
 await sincronizar();
 const destino=await clienteDe(a),origen=await clienteDe(b);
 await db.query("update zain_clientes set notas='Factura a nombre de la constructora' where id=$1",[origen]);
 await uno('select public.zain_clientes_unir($1,$2,$3)',[origen,destino,actor]);
 assert.equal(await clienteDe(b),destino);
 assert.equal((await uno('select cliente_id from zain_cotizaciones_modelos where id=$1',[cot])).cliente_id,destino);
 const d=await uno('select * from zain_clientes where id=$1',[destino]);
 assert.equal(d.telefono,'523300001111');assert.match(d.notas,/constructora/);assert.equal(d.version,2);
 const lista=(await uno('select public.zain_clientes_lista() l')).l;
 assert.deepEqual(lista.map(x=>x.id),[destino]);
 // Un pedido nuevo con el nombre de la ficha vieja cae en la ficha que la absorbió.
 const c=await pedido({nombre:'ing. perez'});await sincronizar();
 assert.equal(await clienteDe(c),destino);
 await falla('select public.zain_clientes_unir($1,$1,$2)',[destino,actor],/zain_cliente_mismo/);
 await falla('select public.zain_clientes_unir($1,$2,$3)',[origen,destino,actor],/zain_cliente_no_existe/);
});

sqlTest('cambiar el cliente de un pedido conserva el nombre que escribió y deja historial',async()=>{
 const p=await pedido({nombre:'Pepe'});await sincronizar();
 const {id:nuevo}=await uno("insert into zain_clientes(nombre,telefono) values('Distribuidora Jalisco','523312341234') returning id");
 await uno('select public.zain_pedido_cliente($1,$2,$3)',[p,nuevo,actor]);
 const x=await uno('select cliente,cliente_id from zain_pedidos where id=$1',[p]);
 assert.equal(x.cliente_id,nuevo);
 assert.deepEqual(x.cliente,{nombre:'Distribuidora Jalisco',escrito:'Pepe',telefono:'523312341234'});
 assert.match((await uno('select notas from zain_historial where pedido_id=$1',[p])).notas,/Distribuidora Jalisco/);
});

sqlTest('al cambiar el cliente, la cotización toma el nombre nuevo si traía el anterior',async()=>{
 const a=await pedido({nombre:'Contacto de WhatsApp',total:1000}),b=await pedido({nombre:'Pepe',total:1000});await sincronizar();
 await db.query("update zain_cotizaciones set borrador=borrador||'{\"destinatario\":\"Lic. Ramos\"}' where pedido_id=$1",[b]);
 const {id:nuevo}=await uno("insert into zain_clientes(nombre) values('Constructora Ríos') returning id");
 for(const p of [a,b])await uno('select public.zain_pedido_cliente($1,$2,$3)',[p,nuevo,actor]);
 const q=async p=>await uno("select version,borrador->>'destinatario' d from zain_cotizaciones where pedido_id=$1",[p]);
 assert.deepEqual(await q(a),{version:2,d:'Constructora Ríos'});
 assert.deepEqual(await q(b),{version:1,d:'Lic. Ramos'},'un nombre escrito a mano se respeta');
});

sqlTest('duplicar un pedido copia partidas, archivos y la cotización como borrador para otro cliente',async()=>{
 const o=await pedido({nombre:'Escuela Norte',estado:'entregado',total:116000,archivos:[{item:0,kind:'logo',name:'logo.png',size:1000,type:'image/png',path:'0-logo.png'},{item:0,kind:'render',name:'r.png',size:500,type:'image/png',path:'0-render.png'}]});
 await sincronizar();
 const {id:otro}=await uno("insert into zain_clientes(nombre) values('Escuela Sur') returning id");
 await db.query("insert into zain_limites(clave,valor) values('capacidad',10)");
 const nuevo=randomUUID(),hash='a'.repeat(64);
 const r=(await uno('select public.zain_pedido_duplicar($1,$2,$3,$4,$5) r',[o,nuevo,hash,otro,actor])).r;
 assert.equal(r.folio,'ZAIN-'+nuevo.replace(/-/g,'').slice(0,12).toUpperCase());
 const x=await uno('select * from zain_pedidos where id=$1',[nuevo]);
 assert.equal(x.estado,'nuevo');assert.equal(x.cliente_id,otro);assert.deepEqual(x.cliente,{nombre:'Escuela Sur'});
 assert.ok(x.guardado_at);assert.match(x.notas_internas,/^Duplicado de ZAIN-/);
 assert.deepEqual(x.items,[{nombre:'Playera',piezas:12}],'sin la huella de la solicitud pública');
 assert.deepEqual(x.archivos.map(a=>a.path),[nuevo+'/0-logo.png',nuevo+'/0-render.png']);
 const q=await uno('select * from zain_cotizaciones where pedido_id=$1',[nuevo]);
 assert.equal(q.publicada,null);
 assert.deepEqual(q.borrador,{costo:100,vigencia:'',destinatario:'Escuela Sur'});
 assert.equal((await uno("select valor::int v from zain_limites where clave='capacidad'")).v,1510);
 // Reintento con el mismo id y cliente: el mismo pedido. Con otro cliente: conflicto.
 assert.equal((await uno('select public.zain_pedido_duplicar($1,$2,$3,$4,$5) r',[o,nuevo,hash,otro,actor])).r.id,nuevo);
 await falla('select public.zain_pedido_duplicar($1,$2,$3,$4,$5)',[o,nuevo,hash,await clienteDe(o),actor],/zain_conflict/);
 // El original no cambia.
 assert.equal((await uno('select estado from zain_pedidos where id=$1',[o])).estado,'entregado');
});

sqlTest('duplicar no acepta un cliente unido, un pedido sin guardar ni un token inválido',async()=>{
 const o=await pedido({nombre:'Ana'}),sin=await pedido({nombre:'Ana',guardado:false});await sincronizar();
 const {id:b}=await uno("insert into zain_clientes(nombre) values('Ana B') returning id");
 await uno('select public.zain_clientes_unir($1,$2,$3)',[b,await clienteDe(o),actor]);
 await falla('select public.zain_pedido_duplicar($1,$2,$3,$4,$5)',[o,randomUUID(),'a'.repeat(64),b,actor],/zain_cliente_no_existe/);
 await falla('select public.zain_pedido_duplicar($1,$2,$3,$4,$5)',[sin,randomUUID(),'a'.repeat(64),await clienteDe(o),actor],/zain_pedido_no_existe/);
 await falla('select public.zain_pedido_duplicar($1,$2,$3,$4,$5)',[o,randomUUID(),'xyz',await clienteDe(o),actor],/zain_token/);
});

// Servidor sin red: Supabase simulado para comprobar qué se copia y qué se manda a la base.
function simulado(){
 const llamadas=[];const respuestas=[];
 const sb=async(ruta,op={})=>{llamadas.push({ruta,cuerpo:op.body?JSON.parse(op.body):null,metodo:op.method||'GET'});const r=respuestas.shift();if(r instanceof Error)throw r;return typeof r==='function'?r(ruta,op):r;};
 const fail=(s,m)=>{const e=new Error(m);e.status=s;throw e;};
 return {llamadas,respuestas,api:createClientes({sb,fail,bucket:'zain-pedidos'})};
}
const user={id:randomUUID()};

test('duplicar pedido copia cada archivo a la carpeta nueva antes de crear el pedido',async()=>{
 const {llamadas,respuestas,api}=simulado(),origen=randomUUID(),nuevo=randomUUID(),cliente=randomUUID();
 respuestas.push([{id:cliente,nombre:'Escuela Sur',unido_a:null}],
  [{id:origen,folio:'ZAIN-X',guardado_at:'2026-11-01',archivos:[{path:origen+'/0-logo.png'},{path:origen+'/0-render.png'}]}],
  {},Object.assign(new Error('ya existe'),{status:409}),{id:nuevo,folio:'ZAIN-Y'});
 const r=await api.duplicarPedido({origen,nuevo,cliente_id:cliente},user);
 assert.deepEqual(r.pedido,{id:nuevo,folio:'ZAIN-Y'});
 const copias=llamadas.filter(l=>l.ruta==='/storage/v1/object/copy').map(l=>l.cuerpo);
 assert.deepEqual(copias,[{bucketId:'zain-pedidos',sourceKey:origen+'/0-logo.png',destinationKey:nuevo+'/0-logo.png'},{bucketId:'zain-pedidos',sourceKey:origen+'/0-render.png',destinationKey:nuevo+'/0-render.png'}]);
 const rpc=llamadas.at(-1);assert.equal(rpc.ruta,'/rest/v1/rpc/zain_pedido_duplicar');assert.match(rpc.cuerpo.p_token_hash,/^[0-9a-f]{64}$/);
});

test('duplicar pedido rechaza una ruta de archivo ajena al pedido',async()=>{
 const {respuestas,api}=simulado(),origen=randomUUID(),cliente=randomUUID();
 respuestas.push([{id:cliente,nombre:'X',unido_a:null}],[{id:origen,folio:'ZAIN-X',guardado_at:'2026-11-01',archivos:[{path:randomUUID()+'/0-logo.png'}]}]);
 await assert.rejects(api.duplicarPedido({origen,nuevo:randomUUID(),cliente_id:cliente},user),/no se puede copiar/);
});
