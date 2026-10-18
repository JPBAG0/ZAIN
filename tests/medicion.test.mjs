import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';
const code=readFileSync(new URL('../js/medicion.js',import.meta.url),'utf8');
const id='12345678-1234-4123-8123-123456789abc';
function setup({saved=null,path='/',active=true,published=true,tag='AW-123456789',blocked=false,storageFails=false}={}){
  const events=[],scripts=[],storage=new Map(saved?[['zain-consentimiento-medicion',JSON.stringify(saved)]]:[]),elements=new Map();let reloads=0;
  const el=s=>{if(!elements.has(s))elements.set(s,{hidden:true,handlers:{},addEventListener(t,f){this.handlers[t]=f;},focus(){}});return elements.get(s);};
  const location={origin:'https://zain.test',pathname:path,href:'https://zain.test'+path+'?email=privado%40ejemplo.test&token=secreto&gclid=ABC123#folio-secreto',hostname:'zain.test',reload(){reloads++;}};
  const document={referrer:'https://otro.test/persona?nombre=privado#token',cookie:'',querySelector:el,querySelectorAll:()=>[],addEventListener(){},createElement:()=>({}),head:{appendChild(s){scripts.push(s);}}};
  const context={window:{ZAIN:{whatsapp:'525662923967',privacidadPublicada:published,medicion:{activa:active,origenes:['https://zain.test'],googleAdsId:tag,etiquetaSolicitud:'prueba_sol',etiquetaWhatsApp:'prueba_wa'}},gtag(...args){events.push(args);if(!blocked&&args[0]==='event')queueMicrotask(()=>args[2].event_callback());}},document,location,localStorage:{getItem:k=>{if(storageFails)throw Error('Bloqueado');return storage.get(k)||null;},setItem:(k,v)=>storage.set(k,v)},URL,Date,Promise,TextEncoder,crypto:webcrypto,setTimeout,clearTimeout,queueMicrotask};
  vm.runInNewContext(code,context);return {api:context.window.ZAINMedicion,events,scripts,el,storage,reloads:()=>reloads};
}
const consent=allow=>({version:1,allow,fecha:Date.now()});
const conversions=a=>a.events.filter(x=>x[0]==='event');
test('sin elección o con almacenamiento bloqueado mide desde la entrada y no muestra banner',async()=>{
  for(const opts of [{},{storageFails:true}]){const a=setup(opts);assert.equal(a.scripts.length,1);assert.equal(a.el('#medicionPreferencias').hidden,true);assert.equal(a.el('#medicionCambiar').hidden,false);assert.equal(await a.api.solicitud(id,100),true);assert.equal(await a.api.whatsapp(),true);assert.equal(conversions(a).length,2);}
});
test('una oposición guardada no carga Google ni envía conversiones',async()=>{
  const a=setup({saved:consent(false)});assert.equal(await a.api.solicitud(id,100),false);assert.equal(await a.api.whatsapp(),false);assert.equal(a.scripts.length,0);assert.equal(a.events.length,0);assert.equal(a.el('#medicionPreferencias').hidden,true);
});
test('configuración incompleta, desactivada y páginas privadas no miden incluso con elección guardada',async()=>{
  for(const opts of [{active:false},{published:false},{tag:'AW-invalido'},{path:'/gestion-zain'},{path:'/mi-pedido'},{path:'/pedidos'}]){const a=setup({...opts,saved:consent(true)});await a.api.solicitud(id,100);assert.equal(a.scripts.length,0);assert.equal(conversions(a).length,0);}
});
test('al cargar comunica denied antes de granted, con personalización siempre desactivada',()=>{
  const a=setup();assert.equal(a.scripts.length,1);assert.deepEqual(Array.from(a.events[0].slice(0,2)),['consent','default']);assert.equal(a.events[0][2].ad_storage,'denied');const update=a.events.find(x=>x[0]==='consent'&&x[1]==='update');assert.equal(update[2].ad_storage,'granted');assert.equal(update[2].ad_personalization,'denied');
});
test('quien se opuso puede volver a permitir desde el pie de página',()=>{
  const a=setup({saved:consent(false)});assert.equal(a.scripts.length,0);a.el('#medicionPermitir').handlers.click();assert.equal(a.scripts.length,1);assert.equal(JSON.parse(a.storage.get('zain-consentimiento-medicion')).allow,true);assert.equal(a.el('#medicionPreferencias').hidden,true);
});
test('misma solicitud y llamadas concurrentes emiten una sola conversión sin identidad ni contenido',async()=>{
  const a=setup({saved:consent(true)});await Promise.all([a.api.solicitud(id,100),a.api.solicitud(id,100)]);await a.api.solicitud(id,100);const c=conversions(a);assert.equal(c.length,1);assert.equal(c[0][2].send_to,'AW-123456789/prueba_sol');assert.match(c[0][2].transaction_id,/^[a-f0-9]{64}$/);assert.equal(c[0][2].piezas,100);
  const s=JSON.stringify(a.events);for(const p of [id,'privado','secreto','folio','email=','token='])assert.ok(!s.includes(p),p);assert.ok(s.includes('gclid=ABC123'));assert.ok(!s.includes('value'));assert.ok(!s.includes('currency'));
});
test('otra solicitud tiene otra conversión y el identificador deduplica entre recargas',async()=>{
  const a=setup({saved:consent(true)}),b=setup({saved:consent(true)});await a.api.solicitud(id,100);await b.api.solicitud(id,100);assert.equal(conversions(a)[0][2].transaction_id,conversions(b)[0][2].transaction_id);await a.api.solicitud('87654321-4321-4321-8321-cba987654321',150);assert.equal(conversions(a).length,2);assert.notEqual(conversions(a)[0][2].transaction_id,conversions(a)[1][2].transaction_id);
});
test('solicitud y WhatsApp son acciones distintas; doble clic inmediato no duplica WhatsApp',async()=>{
  const a=setup({saved:consent(true)});await a.api.solicitud(id,100);await a.api.whatsapp('pedido');await a.api.whatsapp('pedido');assert.equal(conversions(a).length,2);assert.equal(conversions(a)[1][2].send_to,'AW-123456789/prueba_wa');assert.equal(conversions(a)[1][2].origen,'pedido');
});
test('bloqueador o etiqueta sin respuesta no detiene la navegación: espera acotada',async()=>{
  const a=setup({saved:consent(true),blocked:true}),start=Date.now();await a.api.whatsapp();assert.ok(Date.now()-start<1200);
});
test('retirar permiso guarda rechazo y conserva carrito/archivos; nuevas conversiones quedan bloqueadas',async()=>{
  const a=setup({saved:consent(true)});a.storage.set('zain-pedido','carrito');a.el('#medicionRechazar').handlers.click();assert.equal(a.reloads(),1);assert.equal(a.storage.get('zain-pedido'),'carrito');assert.equal(JSON.parse(a.storage.get('zain-consentimiento-medicion')).allow,false);assert.equal(await a.api.solicitud(id,100),false);
});
test('oposiciones vencidas o con versión vieja vuelven a la medición por defecto',()=>{
  for(const saved of [{version:0,allow:false,fecha:Date.now()},{version:1,allow:false,fecha:Date.now()-181*86400000}]){const a=setup({saved});assert.equal(a.scripts.length,1);assert.equal(a.el('#medicionPreferencias').hidden,true);}
});
