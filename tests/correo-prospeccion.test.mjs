import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizar,aviso,resumen,version,inicioDelDia,createCorreo} from '../server/correo-prospeccion.mjs';
import {createHandler} from '../server/pedidos.mjs';
const SECRETO='s'.repeat(48),fail=(s,m)=>{throw Object.assign(Error(m),{status:s});};
const brevo=(event,extra={})=>({event,email:'Contacto@Plasser.mx',camp_id:3,'campaign name':'L1 jue-29 A con imagenes',ts_event:1793287800,...extra});

test('normaliza eventos de Brevo y descarta lo que no sirve',()=>{
 const x=normalizar(brevo('click',{URL:'https://wa.me/5213300000000?text=Hola'}));
 assert.deepEqual({...x,fecha:undefined},{evento:'click',email:'contacto@plasser.mx',campana_id:3,campana:'L1 jue-29 A con imagenes',url:'https://wa.me/5213300000000?text=Hola',fecha:undefined});
 assert.match(x.fecha,/^2026-/);
 assert.equal(normalizar(brevo('unique_opened')).evento,'opened');
 assert.equal(normalizar(brevo('invalid_email')).evento,'hard_bounce');
 assert.equal(normalizar(brevo('click',{URL:'https://xyz.r.brevosend.com/unsubscribe/abc'})),null,'el clic de baja no es interés');
 assert.equal(normalizar(brevo('list_addition')),null);
 assert.equal(normalizar(brevo('click',{email:'no es correo'})),null);
 assert.equal(normalizar(brevo('opened',{camp_id:'x'})).campana_id,0);
});

test('avisos al momento solo para clic, rebote, spam y baja',()=>{
 const x=normalizar(brevo('click',{URL:'https://wa.me/52133'}));
 const a=aviso(x);assert.match(a.title,/WhatsApp/);assert.match(a.body,/contacto@plasser\.mx \(versión A\)/);assert.equal(a.tag,'correo-contacto@plasser.mx');
 assert.match(aviso({...x,url:'https://zain.com.mx/?utm_source=correo'}).title,/Clic en el correo/);
 assert.match(aviso(normalizar(brevo('spam'))).title,/spam/);
 assert.match(aviso(normalizar(brevo('hard_bounce'))).title,/Rebote/);
 assert.match(aviso(normalizar(brevo('unsubscribe'))).title,/Baja/);
 assert.equal(aviso(normalizar(brevo('opened'))),null);
 assert.equal(aviso(normalizar(brevo('delivered'))),null);
});

test('resumen del día cuenta correos únicos y separa A/B',()=>{
 assert.equal(resumen([]),null);
 const A='L1 jue-29 A con imagenes',B='L1 jue-29 B solo texto',f=(evento,email,campana)=>({evento,email,campana});
 const r=resumen([f('delivered','a@x.mx',A),f('delivered','b@x.mx',B),f('delivered','c@x.mx',B),f('opened','a@x.mx',A),f('opened','b@x.mx',B),f('click','b@x.mx',B),f('hard_bounce','d@x.mx',A),f('unsubscribe','c@x.mx',B)]);
 assert.equal(r.body,'3 entregados · 2 abrieron · 1 clics · 1 rebotes · 1 bajas\nA: 1 abrieron · 0 clics | B: 1 abrieron · 1 clics');
 assert.equal(version('L1 mar-3 B solo texto'),'B');assert.equal(version('Otra campaña'),'');
 assert.equal(inicioDelDia(Date.parse('2026-10-29T05:30:00Z')),'2026-10-28T06:00:00.000Z','antes de medianoche local sigue siendo ayer');
 assert.equal(inicioDelDia(Date.parse('2026-10-29T15:30:00Z')),'2026-10-29T06:00:00.000Z');
});

test('webhook: exige la clave, guarda sin duplicar y avisa solo lo nuevo',async()=>{
 const db=[],enviados=[];
 const sb=async(path,o={})=>{
  if(path.startsWith('/rest/v1/zain_correo_eventos?on_conflict=evento,email,campana_id')){
   assert.match(o.headers.Prefer,/ignore-duplicates/);
   const nuevos=JSON.parse(o.body).filter(x=>!db.some(y=>y.evento===x.evento&&y.email===x.email&&y.campana_id===x.campana_id));db.push(...nuevos);return nuevos;
  }
  if(path.startsWith('/rest/v1/zain_correo_eventos?recibido=gte.'))return db;
  throw Error('Ruta inesperada '+path);
 };
 const correo=createCorreo({sb,fail,avisos:{enviar:async a=>{enviados.push(a);return 2;}},secreto:SECRETO,habilitado:true});
 const u=k=>new URL('https://zain.test/api?op=correo-evento'+(k?'&k='+k:''));
 await assert.rejects(correo.evento(u(),brevo('click')),e=>e.status===401);
 await assert.rejects(correo.evento(u('x'.repeat(48)),brevo('click')),e=>e.status===401);
 const d=await correo.evento(u(SECRETO),[brevo('delivered'),brevo('click',{URL:'https://wa.me/1'})]);
 assert.equal(d.guardados,2);assert.equal(d.avisos.length,1);
 const otra=await correo.evento(u(SECRETO),brevo('click',{URL:'https://wa.me/1'}));
 assert.equal(otra.guardados,0);assert.equal(otra.avisos.length,0,'el segundo clic no repite aviso');
 const r=await correo.resumen(u(SECRETO));assert.equal(r.enviados,2);assert.match(enviados[0].body,/^1 entregados · 0 abrieron · 1 clics/);
 await assert.rejects(createCorreo({sb,fail,avisos:{},secreto:SECRETO,habilitado:false}).evento(u(SECRETO),brevo('click')),e=>e.status===404);
});

test('la Edge recibe el webhook de Brevo sin origen ni sesión',async()=>{
 const pedidos=[];
 const fake=async(url,o={})=>{
  if(url.includes('/zain_correo_eventos?on_conflict')){pedidos.push(JSON.parse(o.body));return Response.json(JSON.parse(o.body));}
  if(url.includes('/zain_push?select'))return Response.json([]);
  throw Error('Ruta inesperada '+url);
 };
 const env={SUPABASE_URL:'https://project.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_prueba_no_real',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_prueba_no_real',ZAIN_PEDIDOS_ENABLED:'true',ZAIN_AVISOS_ENABLED:'true',ZAIN_CORREO_ENABLED:'true',ZAIN_BREVO_SECRETO:SECRETO,ZAIN_SITE_URL:'https://zain.test'};
 const h=createHandler(env,fake);
 const post=(k,body)=>h(new Request('https://zain.test/api/pedidos?op=correo-evento&k='+k,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));
 assert.equal((await post('mala'.repeat(12),brevo('click'))).status,401);
 const r=await post(SECRETO,brevo('click',{URL:'https://wa.me/1'}));
 assert.equal(r.status,200);assert.deepEqual(await r.json(),{guardados:1});assert.equal(pedidos.length,1);
 assert.equal((await h(new Request('https://zain.test/api/pedidos?op=correo-evento&k='+SECRETO))).status,405);
});
