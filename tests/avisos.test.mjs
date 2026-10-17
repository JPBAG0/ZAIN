import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {cifrar,createAvisos} from '../server/avisos.mjs';
import {createHandler,validateOrder} from '../server/pedidos.mjs';
const subtle=globalThis.crypto.subtle,enc=new TextEncoder();
const b64u=b=>Buffer.from(b).toString('base64url'),deb64u=s=>new Uint8Array(Buffer.from(s,'base64url'));
const hmac=async(k,d)=>new Uint8Array(await subtle.sign('HMAC',await subtle.importKey('raw',k,{name:'HMAC',hash:'SHA-256'},false,['sign']),d));
const unir=(...p)=>new Uint8Array(Buffer.concat(p.map(x=>Buffer.from(x))));
// Navegador simulado: sus llaves y el descifrado que haría el celular (RFC 8291).
async function navegador(){
 const par=await subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']),auth=globalThis.crypto.getRandomValues(new Uint8Array(16));
 const ua=new Uint8Array(await subtle.exportKey('raw',par.publicKey));
 const descifrar=async body=>{
  const salt=body.slice(0,16),rs=Buffer.from(body.slice(16,20)).readUInt32BE(0),len=body[20],as=body.slice(21,21+len),datos=body.slice(21+len);
  const asKey=await subtle.importKey('raw',as,{name:'ECDH',namedCurve:'P-256'},false,[]);
  const ecdh=new Uint8Array(await subtle.deriveBits({name:'ECDH',public:asKey},par.privateKey,256));
  const ikm=await hmac(await hmac(auth,ecdh),unir(enc.encode('WebPush: info\0'),ua,as,[1])),prk=await hmac(salt,ikm);
  const cek=(await hmac(prk,enc.encode('Content-Encoding: aes128gcm\0\x01'))).slice(0,16),nonce=(await hmac(prk,enc.encode('Content-Encoding: nonce\0\x01'))).slice(0,12);
  const plano=new Uint8Array(await subtle.decrypt({name:'AES-GCM',iv:nonce},await subtle.importKey('raw',cek,'AES-GCM',false,['decrypt']),datos));
  assert.equal(rs,4096);assert.equal(plano.at(-1),2);
  return new TextDecoder().decode(plano.slice(0,-1));
 };
 return {keys:{p256dh:b64u(ua),auth:b64u(auth)},descifrar};
}
async function verificarVapid(header,publica,endpoint){
 const [,t,k]=header.match(/^vapid t=([^,]+), k=(.+)$/);assert.equal(k,publica);
 const [h,p,firma]=t.split('.'),datos=JSON.parse(Buffer.from(p,'base64url'));
 assert.equal(datos.aud,new URL(endpoint).origin);assert.match(datos.sub,/^mailto:/);assert.ok(datos.exp>Date.now()/1000);
 const llave=await subtle.importKey('raw',deb64u(publica),{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
 assert.ok(await subtle.verify({name:'ECDSA',hash:'SHA-256'},llave,deb64u(firma),enc.encode(h+'.'+p)));
}

test('el aviso cifrado se descifra igual que en el celular',async()=>{
 const n=await navegador(),texto=JSON.stringify({title:'Nueva solicitud ZAIN-1',body:'ZurichTec · 600 piezas · ñ'});
 assert.equal(await n.descifrar(await cifrar(texto,n.keys.p256dh,n.keys.auth)),texto);
 await assert.rejects(cifrar(texto,'corta',n.keys.auth));
});

test('llaves VAPID se crean una vez, firma válida y suscripciones vencidas se borran',async()=>{
 const n=await navegador(),db={llaves:null,push:[{endpoint:'https://web.push.apple.com/abc',...n.keys,email:'equipo@zain.test'},{endpoint:'https://web.push.apple.com/revocado',...n.keys,email:'ex@zain.test'}]},enviados=[];
 const sb=async(path,o={})=>{
  if(path.startsWith('/rest/v1/zain_push_llaves?id=eq.1'))return db.llaves?[db.llaves]:[];
  if(path.startsWith('/rest/v1/zain_push_llaves?on_conflict')){db.llaves??=JSON.parse(o.body);return null;}
  if(path.startsWith('/rest/v1/zain_push?select')){assert.match(path,/zain_equipo\.activo=eq\.true/);return db.push;}
  if(path.startsWith('/rest/v1/zain_accesos?activo=eq.true'))return [{email:'equipo@zain.test'}];
  if(o.method==='DELETE'){db.push=db.push.filter(s=>!path.includes(encodeURIComponent(s.endpoint)));return null;}
  throw Error('Ruta inesperada '+path);
 };
 let estado=201;
 const fetcher=async(url,o)=>{enviados.push({url,o});return new Response(null,{status:estado});};
 const avisos=createAvisos({sb,fail:(s,m)=>{throw Object.assign(Error(m),{status:s});},fetcher});
 const {publica}=await avisos.clave();
 assert.equal(await avisos.solicitud({id:'x',folio:'ZAIN-1',cliente:{nombre:'ZurichTec'},items:[{nombre:'Bolsa',piezas:300},{nombre:'Bolsa',piezas:300}]}),1);
 const {url,o}=enviados[0];
 assert.equal(o.headers['Content-Encoding'],'aes128gcm');await verificarVapid(o.headers.Authorization,publica,url);
 const aviso=JSON.parse(await n.descifrar(o.body));
 assert.equal(aviso.title,'Nueva solicitud ZAIN-1');assert.equal(aviso.body,'ZurichTec · 600 piezas · Bolsa y 1 más');assert.equal(aviso.url,'/gestion-zain#x');
 assert.equal(enviados.length,1,'el acceso revocado no recibe avisos');
 estado=410;assert.equal(await avisos.aceptada({id:'x',folio:'ZAIN-1'}),0);assert.deepEqual(db.push.map(s=>s.endpoint),['https://web.push.apple.com/revocado']);
 assert.equal((await avisos.clave()).publica,publica);
});

test('suscripción: solo servicios push reales y sesión del equipo',async()=>{
 const avisos=createAvisos({sb:async()=>null,fail:(s,m)=>{throw Object.assign(Error(m),{status:s});}});
 const keys={p256dh:'B'.repeat(87),auth:'a'.repeat(22)};
 await assert.rejects(avisos.suscribir({id:'u'},{suscripcion:{endpoint:'https://evil.test/x',keys}}),/compatibles/);
 await assert.rejects(avisos.suscribir({id:'u'},{suscripcion:{endpoint:'https://fcm.googleapis.com/fcm/send/x',keys:{...keys,auth:'<script>'}}}),/inválida/);
 assert.deepEqual(await avisos.suscribir({id:'u'},{suscripcion:{endpoint:'https://fcm.googleapis.com/fcm/send/x',keys}}),{activo:true});
});

test('finalizar avisa una sola vez y la API de avisos exige sesión',async()=>{
 const id='12345678-1234-4123-8123-123456789abc',token='a'.repeat(64),n=await navegador();
 const checked=validateOrder({id,token,items:[{p:'bolsa-expo',color:'Rojo',tecnica:'Serigrafía',piezas:100,zona:'Frente',cm:9}],files:[]});
 const fila={id,folio:'ZAIN-PRUEBA',token_hash:createHash('sha256').update(token).digest('hex'),consulta_nonce:'87654321-1234-4123-8123-123456789abc',items:checked.items,archivos:[],created_at:new Date().toISOString(),guardado_at:null,cliente:{nombre:'Cliente Prueba'}};
 let marcados=0;const push=[];
 const par=await subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign']),jwk=await subtle.exportKey('jwk',par.privateKey),llaves={publica:b64u(await subtle.exportKey('raw',par.publicKey)),x:jwk.x,y:jwk.y,d:jwk.d};
 const fake=async(url,o={})=>{
  if(url.startsWith('https://web.push.apple.com/')){push.push(url);return new Response(null,{status:201});}
  if(url.includes('/zain_pedidos?')&&o.method==='PATCH'){marcados++;return Response.json(marcados===1?[{...fila,guardado_at:'ahora'}]:[]);}
  if(url.includes('/zain_pedidos?'))return Response.json([fila]);
  if(url.includes('/object/list/'))return Response.json([]);
  if(url.includes('/zain_push_llaves?id=eq.1'))return Response.json([llaves]);
  if(url.includes('/zain_push?select'))return Response.json([{endpoint:'https://web.push.apple.com/abc',...n.keys,email:'equipo@zain.test'}]);
  if(url.includes('/zain_accesos?activo=eq.true'))return Response.json([{email:'equipo@zain.test'}]);
  if(url.includes('/auth/v1/user'))return Response.json({error:'sin sesión'},{status:401});
  throw Error('Ruta inesperada '+url);
 };
 const h=createHandler({SUPABASE_URL:'https://project.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_prueba_no_real',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_prueba_no_real',ZAIN_PEDIDOS_ENABLED:'true',ZAIN_AVISOS_ENABLED:'true',ZAIN_SITE_URL:'https://zain.test'},fake);
 const finalizar=()=>h(new Request('https://zain.test/api/pedidos?op=finalizar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,token})}));
 assert.equal((await finalizar()).status,200);fila.guardado_at='ahora';
 // El reintento ya no marca la solicitud: no repite el aviso.
 assert.equal((await finalizar()).status,200);
 assert.equal(marcados,1);assert.equal(push.length,1);
 assert.equal((await h(new Request('https://zain.test/api/pedidos?op=avisos-clave'))).status,401);
});
