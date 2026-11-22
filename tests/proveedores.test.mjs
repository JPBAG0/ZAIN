import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {createProveedores,validarDatos,MAX_BYTES} from '../server/proveedores.mjs';

// Catálogos y listas de precios de proveedores (21-nov-2026): servidor con Supabase simulado y SQL con PGlite.
const fail=(s,m)=>{const e=new Error(m);e.status=s;throw e;};
const user={id:randomUUID()};
function simulado(){
 const llamadas=[],respuestas=[];
 const sb=async(ruta,op={})=>{llamadas.push({ruta,metodo:op.method||'GET',cuerpo:op.body&&op.body!=='{}'?JSON.parse(op.body):null});const r=respuestas.shift();return typeof r==='function'?r(ruta,op):r;};
 return {llamadas,respuestas,api:createProveedores({sb,fail,storageURL:u=>new URL(u.startsWith('http')?u:'https://ficticio.invalid/storage/v1/'+u.replace(/^\//,''))})};
}

test('validarDatos limpia y exige proveedor, nombre y tipo',()=>{
 assert.deepEqual(validarDatos({proveedor:'  Player   y Tees ',tipo:'precios',titulo:' Lista 2026 ',nota:''},fail),{proveedor:'Player y Tees',tipo:'precios',titulo:'Lista 2026',nota:''});
 assert.throws(()=>validarDatos({proveedor:'P',tipo:'catalogo',titulo:'Catálogo'},fail),/proveedor/);
 assert.throws(()=>validarDatos({proveedor:'Dimeo',tipo:'catalogo',titulo:''},fail),/nombre del archivo/);
 assert.throws(()=>validarDatos({proveedor:'Dimeo',tipo:'factura',titulo:'Algo'},fail),/catálogo, lista de precios/);
});

test('la subida solo acepta PDF, Excel o imagen de hasta 50 MB y nombra el objeto con el id',async()=>{
 const {llamadas,respuestas,api}=simulado(),id=randomUUID();
 await assert.rejects(api.subida({id,mime:'application/zip',bytes:10}),/PDF, un Excel/);
 await assert.rejects(api.subida({id,mime:'application/pdf',bytes:MAX_BYTES+1}),/50 MB/);
 respuestas.push({url:'/object/upload/sign/zain-proveedores/'+id+'.pdf?token=x'});
 const r=await api.subida({id,mime:'application/pdf',bytes:1000});
 assert.equal(r.objeto,id+'.pdf');assert.equal(llamadas[0].ruta,'/storage/v1/object/upload/sign/zain-proveedores/'+id+'.pdf');
 assert.match(r.url,/^https:\/\/ficticio\.invalid\/storage\/v1\/object\/upload\/sign\//);
});

test('guardar comprueba que el archivo llegó completo antes de registrarlo',async()=>{
 const {llamadas,respuestas,api}=simulado(),id=randomUUID(),b={id,proveedor:'Dimeo',tipo:'catalogo',titulo:'Gildan',nota:'',objeto:id+'.pdf',mime:'application/pdf',bytes:2048};
 respuestas.push([]);await assert.rejects(api.guardar(b,user),/todavía no termina de subir/);
 respuestas.push([{name:id+'.pdf',metadata:{size:100}}]);await assert.rejects(api.guardar(b,user),/no llegó completo/);
 await assert.rejects(api.guardar({...b,objeto:randomUUID()+'.pdf'},user),/Vuelve a subir/);
 respuestas.push([{name:id+'.pdf',metadata:{size:2048}}],(ruta,op)=>[{...JSON.parse(op.body),version:1}]);
 const r=await api.guardar(b,user);
 assert.equal(r.archivo.proveedor,'Dimeo');assert.equal(r.archivo.creado_por,user.id);
 assert.match(llamadas.at(-1).ruta,/zain_proveedores_archivos\?on_conflict=id/);
});

test('abrir firma un enlace de 60 minutos y no abre archivos quitados',async()=>{
 const {llamadas,respuestas,api}=simulado(),id=randomUUID();
 respuestas.push([{id,objeto:id+'.pdf',mime:'application/pdf',titulo:'Catálogo 2026',proveedor:'Playerytees',archivado_at:null}],{signedURL:'/object/sign/zain-proveedores/'+id+'.pdf?token=t'});
 const r=await api.abrir({id});
 assert.equal(llamadas[1].cuerpo.expiresIn,3600);assert.match(r.url,/object\/sign\/zain-proveedores\//);assert.equal(r.titulo,'Catálogo 2026');
 respuestas.push([{id,objeto:id+'.pdf',archivado_at:'2026-11-21'}]);
 await assert.rejects(api.abrir({id}),/ya no está/);
});

test('quitar archiva sin borrar el archivo',async()=>{
 const {llamadas,respuestas,api}=simulado(),id=randomUUID();
 respuestas.push([{id}]);await api.archivar({id},user);
 assert.equal(llamadas[0].metodo,'PATCH');assert.ok(llamadas[0].cuerpo.archivado_at);
 assert.ok(!llamadas.some(l=>l.metodo==='DELETE'||/storage\/v1\/object\/zain-proveedores/.test(l.ruta)),'no se borra nada en Storage');
});

const modulo=process.env.ZAIN_PGLITE_MODULE;let db;
before(async()=>{
 if(!modulo)return;
 const {PGlite}=await import(modulo);db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema storage;
 create table auth.users(id uuid primary key);create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
 await db.exec(await readFile(new URL('../supabase/proveedores-archivos.sql',import.meta.url),'utf8'));
});
after(async()=>{await db?.close();});
test('SQL: bucket privado de 50 MB y la tabla rechaza objetos o tipos raros',{skip:modulo?false:'Configura ZAIN_PGLITE_MODULE; consulta docs/CAJA.md.'},async()=>{
 const b=(await db.query("select public,file_size_limit from storage.buckets where id='zain-proveedores'")).rows[0];
 assert.deepEqual({...b,file_size_limit:Number(b.file_size_limit)},{public:false,file_size_limit:52428800});
 const id=randomUUID(),fila=(o={})=>({id:randomUUID(),proveedor:'Dimeo',tipo:'catalogo',titulo:'Gildan',objeto:randomUUID()+'.pdf',mime:'application/pdf',bytes:10,...o});
 const insertar=x=>db.query('insert into zain_proveedores_archivos(id,proveedor,tipo,titulo,objeto,mime,bytes) values($1,$2,$3,$4,$5,$6,$7)',[x.id,x.proveedor,x.tipo,x.titulo,x.objeto,x.mime,x.bytes]);
 await insertar(fila({id}));
 await assert.rejects(insertar(fila({objeto:'../otro.pdf'})));
 await assert.rejects(insertar(fila({tipo:'factura'})));
 await assert.rejects(insertar(fila({bytes:52428801})));
 // Volver a aplicar el SQL no duplica ni falla.
 await db.exec(await readFile(new URL('../supabase/proveedores-archivos.sql',import.meta.url),'utf8'));
 assert.equal((await db.query('select count(*)::int n from zain_proveedores_archivos')).rows[0].n,1);
});
