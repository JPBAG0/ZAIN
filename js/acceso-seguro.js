/* Acceso nativo de Supabase. No contiene secretos ni implementa WebAuthn propio. */
(() => {
'use strict';
const mensaje = error => {
 const code=error?.code||error?.name;
 const mensajes={passkey_disabled:'Las llaves aún no están habilitadas. Entra con tu contraseña.',
 webauthn_credential_exists:'Esta llave ya está registrada.',too_many_passkeys:'Alcanzaste el límite de llaves. Revisa las que ya tienes.',
 webauthn_credential_not_found:'No encontramos esta llave. Usa tu contraseña para registrar una.',
 webauthn_challenge_expired:'La solicitud venció. Inténtalo de nuevo.',webauthn_challenge_not_found:'La solicitud ya no es válida. Inténtalo de nuevo.',
 webauthn_verification_failed:'No se pudo verificar la llave. Usa tu contraseña o vuelve a intentarlo.',
 NotAllowedError:'Operación cancelada o sin llave disponible. Puedes entrar con contraseña.',AbortError:'Operación cancelada.',
 SecurityError:'La llave no está disponible en esta dirección. Usa la dirección habitual de la app.',
 invalid_credentials:'Revisa tu correo y contraseña.',email_not_confirmed:'Confirma tu correo antes de entrar.',
 user_banned:'Esta cuenta no tiene acceso.',sin_soporte:'Este navegador no admite llaves. Puedes usar tu contraseña.',
 ocupada:'Espera a que termine la operación anterior.',cerrada:'Sesión cerrada. Vuelve a entrar.',
 reciente:'Confirma tu contraseña para administrar tus llaves.',sin_permiso:'Tu cuenta no tiene acceso a esta aplicación.'};
 return mensajes[code]||mensajes[error?.originalError?.name]||'No se pudo completar la operación. Inténtalo de nuevo o usa tu contraseña.';
};
const fallo=code=>Object.assign(new Error(mensaje({code})),{code});
function crear({url,key,storage,storageKey,autoRefreshToken=true,aislarPestana=false,createClient=globalThis.supabase.createClient}) {
 let sesion=null,epoca=0,ocupada=null,cierre=null,abortador=null,renovando=null,reciente=0;
 let cerrando=false,copiaCierre=null,escuchar=()=>{};
 const memoria=new Map();let sinDisco=false;
 // Auth usa BroadcastChannel con su storageKey. Una clave interna única mantiene ZAIN por pestaña,
 // mientras el adaptador conserva el formato y nombre históricos de sessionStorage.
 const claveSDK=aislarPestana?storageKey+':'+(globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random()):storageKey;
 const traducir=k=>k.startsWith(claveSDK)?storageKey+k.slice(claveSDK.length):k;
 const leer=k=>{if(sinDisco)return memoria.get(k)??null;try{return storage.getItem(k);}catch{sinDisco=true;return memoria.get(k)??null;}};
 const quitar=k=>{memoria.delete(k);try{storage.removeItem(k);}catch{}};
 const puente={getItem:k=>{k=traducir(k);return cerrando?(k===storageKey?copiaCierre:null):leer(k);},
 setItem:(k,v)=>{k=traducir(k);if(cerrando){if(k===storageKey)copiaCierre=v;return;}memoria.set(k,v);try{if(!sinDisco)storage.setItem(k,v);}catch{sinDisco=true;}},removeItem:k=>quitar(traducir(k))};
 const client=createClient(url,key,{auth:{storage:puente,storageKey:claveSDK,persistSession:true,autoRefreshToken,detectSessionInUrl:false,experimental:{passkey:true}},
 global:{fetch:(input,init={})=>fetch(input,{...init,signal:init.signal||AbortSignal.timeout(15000)})}});
 client.auth.onAuthStateChange((_evento,s)=>{if(!cerrando){sesion=s;escuchar(s);}});
 const comprobar=e=>{if(e!==epoca||cerrando)throw fallo('cerrada');};
 const datos=r=>{if(r.error)throw r.error;return r.data;};
 async function exclusiva(fn){
  if(ocupada||cerrando)throw fallo('ocupada');
  const e=epoca;abortador=new AbortController();
  const tarea=Promise.resolve().then(()=>fn(abortador.signal)).then(r=>{comprobar(e);return r;});
  ocupada=tarea;
  try{return await tarea;}finally{if(ocupada===tarea){ocupada=null;abortador=null;}}
 }
 const guardar=d=>{if(cerrando)throw fallo('cerrada');if(!d?.session)throw fallo('cerrada');sesion=d.session;return sesion;};
 const soporte=()=>globalThis.isSecureContext===true&&!!globalThis.PublicKeyCredential&&!!globalThis.navigator?.credentials;
 async function cerrar(){
  if(cierre)return cierre;
  epoca++;reciente=0;cerrando=true;abortador?.abort();
  // Conserva solo en memoria lo necesario para revocar; una respuesta tardía no vuelve al disco.
  copiaCierre=sesion?JSON.stringify(sesion):leer(storageKey);sesion=null;quitar(storageKey);escuchar(null);
  cierre=(async()=>{try{await Promise.all([ocupada?.catch(()=>{}),renovando?.catch(()=>{})]);const r=await client.auth.signOut({scope:'local'});if(r.error)throw r.error;}
   finally{quitar(storageKey);copiaCierre=null;sesion=null;reciente=0;cerrando=false;cierre=null;}})();
  return cierre;
 }
 return {client,soporte,mensaje,get sesion(){return sesion;},get ocupada(){return !!ocupada||cerrando;},
  escuchar(fn){escuchar=fn;},
  async restaurar(){const e=epoca,d=datos(await client.auth.getSession());comprobar(e);sesion=d.session;return sesion;},
  password(email,password){return exclusiva(async()=>{const d=datos(await client.auth.signInWithPassword({email,password}));const s=guardar(d);reciente=Date.now();return s;});},
  entrarLlave(){return exclusiva(async signal=>{if(!soporte())throw fallo('sin_soporte');reciente=0;return guardar(datos(await client.auth.signInWithPasskey({options:{signal}})));});},
  renovar(){if(cerrando)return Promise.reject(fallo('cerrada'));if(renovando)return renovando;const e=epoca;
   renovando=(async()=>{const d=datos(await client.auth.refreshSession());comprobar(e);return guardar(d);})().finally(()=>renovando=null);return renovando;},
  cancelar(){abortador?.abort();},esperarCierre:()=>cierre?.catch(()=>{}),cerrar,
  confirmar(password){return exclusiva(async()=>{
   const previa=sesion;if(!previa?.user?.email)throw fallo('cerrada');
   const d=datos(await client.auth.signInWithPassword({email:previa.user.email,password}));
   if(d.session?.user?.id!==previa.user.id){reciente=0;throw fallo('cerrada');}
   guardar(d);reciente=Date.now();
  });},
  async llaves(){const e=epoca,d=datos(await client.auth.passkey.list());comprobar(e);return d||[];},
  administrar(accion,id,nombre){return exclusiva(async signal=>{
   if(!sesion||Date.now()-reciente>300000||!reciente)throw fallo('reciente');
   if(accion==='registrar'){if(!soporte())throw fallo('sin_soporte');return datos(await client.auth.registerPasskey({options:{signal}}));}
   if(accion==='quitar')return datos(await client.auth.passkey.delete({passkeyId:id}));
   if(accion==='nombre')return datos(await client.auth.passkey.update({passkeyId:id,friendlyName:nombre.trim().slice(0,120)}));
   throw Error('Operación desconocida');
  });}
 };
}
globalThis.AccesoSeguro={crear,mensaje};
})();
