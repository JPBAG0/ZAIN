// «Para hoy» de Gestión (JP, 11-nov-2026): qué toca hacer con cada pedido activo.
import test from 'node:test';
import assert from 'node:assert/strict';
import {agrupar,hace,saldo,GRUPOS} from '../js/para-hoy.js';
import {filasHoy,createHandler} from '../server/pedidos.mjs';
const ahora=Date.parse('2026-11-11T18:00:00Z'),antes=h=>new Date(ahora-h*3600000).toISOString();
const p=(estado,horas,extra={})=>({id:estado+horas,folio:'ZAIN-'+estado.toUpperCase()+horas,estado,total:20,created_at:antes(horas+5),desde:antes(horas),cliente:'Cliente '+estado,resumen:'Polo',venta_total:null,cobrado:null,anticipo_requerido:null,...extra});
const grupo=(g,k)=>g.find(x=>x.clave===k);

test('hace: horas y días en español',()=>{
 assert.equal(hace(antes(0.5),ahora),'hace menos de 1 h');assert.equal(hace(antes(5),ahora),'hace 5 h');
 assert.equal(hace(antes(30),ahora),'hace 1 día');assert.equal(hace(antes(24*6+3),ahora),'hace 6 días');
});
test('saldo: nada por cobrar sin cotización publicada y nunca negativo',()=>{
 assert.equal(saldo({venta_total:null,cobrado:500}),null);assert.equal(saldo({venta_total:10000,cobrado:4000}),6000);
 assert.equal(saldo({venta_total:10000,cobrado:12000}),0);assert.equal(saldo({venta_total:'10000',cobrado:null}),10000);
});
test('agrupar: cada estado cae en su grupo, con su pestaña y su texto',()=>{
 const g=agrupar([p('nuevo',2),p('contactado',30),p('cotizado',72,{venta_total:580000}),p('aceptado',10,{venta_total:580000,anticipo_requerido:290000,cobrado:100000}),
  p('confirmado',5,{venta_total:200000,cobrado:100000}),p('produccion',48,{venta_total:200000,cobrado:200000}),p('entregado',100,{venta_total:300000,cobrado:120000})],ahora);
 assert.deepEqual(g.map(x=>x.clave),GRUPOS.map(x=>x[0]));
 assert.deepEqual(g.map(x=>x.filas.length),[2,1,1,2,1]);
 // Lo más viejo primero y marcado como urgente.
 assert.deepEqual(grupo(g,'cotizar').filas.map(f=>[f.id,f.urgente,f.pestana]),[['contactado30',true,'cotizacion'],['nuevo2',false,'cotizacion']]);
 assert.equal(grupo(g,'respuesta').filas[0].detalle,'Cotizada hace 3 días · $5,800.00');assert.equal(grupo(g,'respuesta').filas[0].urgente,true);
 assert.equal(grupo(g,'anticipo').filas[0].detalle,'Aceptada hace 10 h · falta $1,900.00');assert.equal(grupo(g,'anticipo').total,190000);
 assert.deepEqual(grupo(g,'entregar').filas.map(f=>f.detalle),['En producción hace 2 días','Confirmado hace 5 h · por cobrar $1,000.00']);
 const c=grupo(g,'cobrar');
 assert.equal(c.filas[0].detalle,'Entregado hace 4 días · falta cobrar $1,800.00');assert.equal(c.filas[0].pestana,'cobro');assert.equal(c.filas[0].urgente,true);assert.equal(c.total,180000);
});
test('agrupar: un entregado ya pagado, o cerrado sin cobrar el resto, no aparece; el cancelado tampoco',()=>{
 const g=agrupar([p('entregado',50,{venta_total:300000,cobrado:300000}),p('entregado',60,{venta_total:120000,cobrado:120000}),p('entregado',70),p('cancelado',5)],ahora);
 assert.equal(g.reduce((n,x)=>n+x.filas.length,0),0);
 // Sin nombre de cliente se muestra el folio.
 assert.equal(agrupar([p('nuevo',1,{cliente:''})],ahora)[0].filas[0].titulo,'ZAIN-NUEVO1');
});
test('filasHoy: fecha de entrada al estado actual, dinero de la vista y solo el nombre del cliente',()=>{
 const pedidos=[{id:'a',folio:'ZAIN-A',estado:'cotizado',total:12,created_at:'2026-11-01T10:00:00Z',cliente:{nombre:'Empresa A',telefono:'3300000000',correo:'a@example.test'},items:[{nombreZain:'Polo clásico'},{nombre:'Gorra'},{nombre:'Bolsa'}]},
  {id:'b',folio:'ZAIN-B',estado:'nuevo',total:5,created_at:'2026-11-10T10:00:00Z',cliente:null,items:null}];
 const historial=[{pedido_id:'a',estado_anterior:'cotizado',estado_nuevo:'cotizado',created_at:'2026-11-09T10:00:00Z'},{pedido_id:'a',estado_anterior:'aceptado',estado_nuevo:'cotizado',created_at:'2026-11-07T10:00:00Z'},{pedido_id:'a',estado_anterior:'nuevo',estado_nuevo:'cotizado',created_at:'2026-11-02T10:00:00Z'}];
 const r=filasHoy(pedidos,historial,[{id:'a',venta_total:580000,cobrado:0,anticipo_requerido:290000}]);
 assert.deepEqual(r[0],{id:'a',folio:'ZAIN-A',estado:'cotizado',total:12,created_at:'2026-11-01T10:00:00Z',cliente:'Empresa A',resumen:'Polo clásico / Gorra',desde:'2026-11-07T10:00:00Z',venta_total:580000,cobrado:0,anticipo_requerido:290000});
 assert.deepEqual(r[1],{id:'b',folio:'ZAIN-B',estado:'nuevo',total:5,created_at:'2026-11-10T10:00:00Z',cliente:'',resumen:'',desde:'2026-11-10T10:00:00Z',venta_total:null,cobrado:null,anticipo_requerido:null});
 assert.ok(!JSON.stringify(r).includes('3300000000')&&!JSON.stringify(r).includes('example.test'),'sin teléfono ni correo');
});
test('op hoy: solo el equipo, y pide pedidos activos sin cancelados ni papelera',async()=>{
 const staffID='87654321-4321-4321-8321-cba987654321',calls=[];
 const fake=async(url,opts={})=>{calls.push(url);
  if(url.includes('/auth/v1/user'))return opts.headers.Authorization==='Bearer valid-user'?Response.json({id:staffID,email:'equipo@example.test',email_confirmed_at:'2026-10-13'}):Response.json({error:'bad'},{status:401});
  if(url.includes('/zain_accesos?'))return Response.json([{nombre:'Prueba'}]);
  if(url.includes('/zain_equipo?'))return Response.json([{user_id:staffID,nombre:'Prueba',activo:true}]);
  if(url.includes('/zain_pedidos?'))return Response.json([{id:'a',folio:'ZAIN-A',estado:'entregado',total:3,created_at:'2026-11-01T10:00:00Z',cliente:{nombre:'Empresa A'},items:[]}]);
  if(url.includes('/zain_historial?'))return Response.json([]);
  if(url.includes('/zain_finanzas_estado?'))return Response.json([{id:'a',venta_total:300000,cobrado:100000,anticipo_requerido:150000}]);
  throw Error('Ruta inesperada '+url);};
 const h=createHandler({SUPABASE_URL:'https://project.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_prueba_no_real',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_prueba_no_real',ZAIN_PEDIDOS_ENABLED:'true',ZAIN_GASTOS_ENABLED:'true',ZAIN_SITE_URL:'https://zain.test'},fake);
 const pedir=auth=>h(new Request('https://zain.test/api/pedidos?op=hoy',{headers:{Origin:'https://zain.test',...(auth?{Authorization:auth}:{})}}));
 assert.equal((await pedir()).status,401);assert.ok(!calls.some(u=>u.includes('zain_pedidos')));
 const r=await pedir('Bearer valid-user');assert.equal(r.status,200);
 const d=await r.json();assert.equal(d.pedidos[0].venta_total,300000);assert.equal(d.pedidos[0].cliente,'Empresa A');
 const consulta=calls.find(u=>u.includes('/zain_pedidos?'));assert.match(consulta,/archivado_at=is\.null/);assert.match(consulta,/estado=neq\.cancelado/);
 assert.equal(agrupar(d.pedidos).find(g=>g.clave==='cobrar').total,200000);
});
