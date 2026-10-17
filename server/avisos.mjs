// Avisos push al equipo (Web Push, RFC 8291/8292) sin dependencias: WebCrypto funciona igual en Node y Deno.
// Las llaves VAPID se generan una sola vez y viven en una tabla privada (solo service_role).
const subtle=globalThis.crypto.subtle,enc=new TextEncoder();
const b64u=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const deb64u=s=>Uint8Array.from(atob(String(s).replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(String(s).length/4)*4,'=')),c=>c.charCodeAt(0));
const unir=(...partes)=>{const out=new Uint8Array(partes.reduce((n,p)=>n+p.length,0));let i=0;for(const p of partes){out.set(p,i);i+=p.length;}return out;};
const hmac=async(llave,datos)=>new Uint8Array(await subtle.sign('HMAC',await subtle.importKey('raw',llave,{name:'HMAC',hash:'SHA-256'},false,['sign']),datos));
const ENDPOINT=/^https:\/\/([a-z0-9-]+\.)*(push\.apple\.com|fcm\.googleapis\.com|googleapis\.com|push\.services\.mozilla\.com|notify\.windows\.com)\//i;
const SUJETO='mailto:atencion.zain@gmail.com';

// Cifrado aes128gcm de un solo registro para la suscripción del navegador.
export async function cifrar(payload,p256dh,auth){
 const ua=deb64u(p256dh),secreto=deb64u(auth);
 if(ua.length!==65||secreto.length!==16)throw Error('Suscripción inválida.');
 const efimera=await subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
 const as=new Uint8Array(await subtle.exportKey('raw',efimera.publicKey));
 const uaKey=await subtle.importKey('raw',ua,{name:'ECDH',namedCurve:'P-256'},false,[]);
 const ecdh=new Uint8Array(await subtle.deriveBits({name:'ECDH',public:uaKey},efimera.privateKey,256));
 const ikm=await hmac(await hmac(secreto,ecdh),unir(enc.encode('WebPush: info\0'),ua,as,Uint8Array.of(1)));
 const salt=globalThis.crypto.getRandomValues(new Uint8Array(16)),prk=await hmac(salt,ikm);
 const cek=(await hmac(prk,enc.encode('Content-Encoding: aes128gcm\0\x01'))).slice(0,16),nonce=(await hmac(prk,enc.encode('Content-Encoding: nonce\0\x01'))).slice(0,12);
 const cifrado=new Uint8Array(await subtle.encrypt({name:'AES-GCM',iv:nonce},await subtle.importKey('raw',cek,'AES-GCM',false,['encrypt']),unir(enc.encode(payload),Uint8Array.of(2))));
 return unir(salt,Uint8Array.of(0,0,16,0,65),as,cifrado);
}

async function vapid(endpoint,llaves){
 const k=await subtle.importKey('jwk',{kty:'EC',crv:'P-256',x:llaves.x,y:llaves.y,d:llaves.d,ext:true},{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
 const cuerpo=b64u(enc.encode(JSON.stringify({typ:'JWT',alg:'ES256'})))+'.'+b64u(enc.encode(JSON.stringify({aud:new URL(endpoint).origin,exp:Math.floor(Date.now()/1000)+12*3600,sub:SUJETO})));
 return 'vapid t='+cuerpo+'.'+b64u(await subtle.sign({name:'ECDSA',hash:'SHA-256'},k,enc.encode(cuerpo)))+', k='+llaves.publica;
}

export function createAvisos({sb,fail,fetcher=fetch}){
 let cache=null;
 const llaves=async()=>{
  if(cache)return cache;
  let rows=await sb('/rest/v1/zain_push_llaves?id=eq.1&select=publica,x,y,d&limit=1');
  if(!rows?.length){
   const par=await subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']),jwk=await subtle.exportKey('jwk',par.privateKey);
   const publica=b64u(await subtle.exportKey('raw',par.publicKey));
   // Si otra instancia ya las creó, se conservan las suyas.
   await sb('/rest/v1/zain_push_llaves?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify({id:1,publica,x:jwk.x,y:jwk.y,d:jwk.d})});
   rows=await sb('/rest/v1/zain_push_llaves?id=eq.1&select=publica,x,y,d&limit=1');
  }
  if(!rows?.[0]?.publica)fail(503,'Los avisos todavía no están disponibles.');
  return cache=rows[0];
 };
 const validar=b=>{
  const s=b?.suscripcion,endpoint=s?.endpoint,p256dh=s?.keys?.p256dh,auth=s?.keys?.auth;
  if(typeof endpoint!=='string'||endpoint.length>1000||!ENDPOINT.test(endpoint))fail(400,'Este navegador no ofrece avisos compatibles.');
  if(!/^[A-Za-z0-9_-]{80,100}$/.test(p256dh||'')||!/^[A-Za-z0-9_-]{16,32}$/.test(auth||''))fail(400,'Suscripción inválida.');
  return {endpoint,p256dh,auth,dispositivo:typeof b.dispositivo==='string'?b.dispositivo.replace(/[\x00-\x1f\x7f]/g,'').slice(0,80):''};
 };
 async function enviarA(s,aviso,k){
  const r=await fetcher(s.endpoint,{method:'POST',headers:{Authorization:await vapid(s.endpoint,k),'Content-Encoding':'aes128gcm','Content-Type':'application/octet-stream',TTL:'86400',Urgency:'high'},body:await cifrar(JSON.stringify(aviso),s.p256dh,s.auth),signal:AbortSignal.timeout(8000)});
  // 404/410: el celular ya no existe o quitó el permiso; se olvida la suscripción.
  if(r.status===404||r.status===410){await sb('/rest/v1/zain_push?endpoint=eq.'+encodeURIComponent(s.endpoint),{method:'DELETE'});return false;}
  return r.ok;
 }
 // Nunca lanza: un aviso fallido no debe tumbar la solicitud del cliente.
 async function enviar(aviso,{usuario}={}){
  try{
   const subs=await sb('/rest/v1/zain_push?select=endpoint,p256dh,auth'+(usuario?'&user_id=eq.'+usuario:'')+'&limit=50');
   if(!subs?.length)return 0;
   const k=await llaves();let ok=0;
   for(const s of subs){try{if(await enviarA(s,aviso,k))ok++;}catch{console.warn('ZAIN: aviso push no entregado.');}}
   return ok;
  }catch{console.warn('ZAIN: no se pudieron enviar avisos.');return 0;}
 }
 return {
  clave:async()=>({publica:(await llaves()).publica}),
  suscribir:async(user,b)=>{const s=validar(b);await sb('/rest/v1/zain_push?on_conflict=endpoint',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({...s,user_id:user.id,actualizado:new Date().toISOString()})});return {activo:true};},
  quitar:async(user,b)=>{const endpoint=b?.endpoint;if(typeof endpoint!=='string'||endpoint.length>1000)fail(400,'Suscripción inválida.');await sb('/rest/v1/zain_push?endpoint=eq.'+encodeURIComponent(endpoint)+'&user_id=eq.'+user.id,{method:'DELETE'});return {activo:false};},
  probar:async user=>({enviados:await enviar({title:'ZAIN · avisos activos',body:'Así te llegará cada solicitud nueva y cada cotización aceptada.',url:'/gestion-zain',tag:'prueba'},{usuario:user.id})}),
  enviar,
  solicitud:x=>enviar({title:'Nueva solicitud '+(x.folio||''),body:[x.cliente?.nombre,(x.items||[]).reduce((n,p)=>n+(Number(p.piezas)||0),0).toLocaleString('es-MX')+' piezas',x.items?.[0]?.nombre+(x.items?.length>1?' y '+(x.items.length-1)+' más':'')].filter(Boolean).join(' · '),url:'/gestion-zain#'+x.id,tag:'pedido-'+x.id}),
  aceptada:x=>enviar({title:'Cotización aceptada '+(x.folio||''),body:(x.cliente?.nombre||'El cliente')+' aceptó su cotización. Falta registrar el anticipo.',url:'/gestion-zain#'+x.id,tag:'pedido-'+x.id})
 };
}
