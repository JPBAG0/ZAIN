import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('../js/acceso-seguro.js',import.meta.url),'utf8');
const user={id:'usuario-prueba',email:'equipo@example.test'};
const session={access_token:'token-sintetico',refresh_token:'renovacion-sintetica',expires_at:2000000000,user};
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
function fixture({supported=true,throwStorage=false,aislarPestana=false}={}){
 const disk=new Map(),calls=[],hooks={};let notify=()=>{},options;
 const storage={getItem:k=>{if(throwStorage)throw Error();return disk.get(k)||null;},setItem:(k,v)=>{if(throwStorage)throw Error();disk.set(k,v);},removeItem:k=>disk.delete(k)};
 const publish=s=>{options.auth.storage.setItem(options.auth.storageKey,JSON.stringify(s));notify('SIGNED_IN',s);return {data:{session:s},error:null};};
 const auth={onAuthStateChange:fn=>{notify=fn;},getSession:async()=>({data:{session:JSON.parse(options.auth.storage.getItem(options.auth.storageKey)||'null')}}),
 signInWithPassword:async args=>{calls.push(['password',args.email]);if(hooks.password)await hooks.password;return publish(session);},
 signInWithPasskey:async args=>{calls.push(['passkey',args.options.signal]);if(hooks.passkey)await hooks.passkey;return publish(session);},
 refreshSession:async()=>{calls.push(['refresh']);if(hooks.refresh)await hooks.refresh;return publish({...session,access_token:'renovado'});},
 signOut:async()=>{calls.push(['logout',options.auth.storage.getItem(options.auth.storageKey)]);options.auth.storage.removeItem(options.auth.storageKey);notify('SIGNED_OUT',null);return {error:null};},
 registerPasskey:async args=>{calls.push(['registro',args.options.signal]);return {data:{id:'llave-prueba'}};},
 passkey:{list:async()=>({data:[{id:'llave-prueba'}]}),delete:async args=>{calls.push(['quitar',args]);return {data:{}};},update:async args=>{calls.push(['nombre',args]);return {data:{}};}}};
 const ctx={AbortController,AbortSignal,Date,Map,Promise,Error,JSON,isSecureContext:true,PublicKeyCredential:supported?function(){}:undefined,navigator:{credentials:{}},fetch:()=>{throw Error('Red no permitida');}};
 vm.createContext(ctx);vm.runInContext(code,ctx);
 const access=ctx.AccesoSeguro.crear({url:'https://auth.example.test',key:'publica-sintetica',storage,storageKey:'zain-equipo',autoRefreshToken:false,aislarPestana,createClient:(_u,_k,o)=>{options=o;return {auth};}});
 return {access,disk,calls,hooks,options,session,publish};
}
test('restaura sesión anterior por pestaña y usa un solo SDK sin detectar tokens en URL',async()=>{
 const f=fixture();f.disk.set('zain-equipo',JSON.stringify(session));assert.equal((await f.access.restaurar()).user.id,user.id);
 assert.equal(f.options.auth.storageKey,'zain-equipo');assert.equal(f.options.auth.autoRefreshToken,false);assert.equal(f.options.auth.detectSessionInUrl,false);assert.equal(f.options.auth.experimental.passkey,true);
});
test('contraseña, alta, listado, nombre y baja usan la identidad actual',async()=>{
 const f=fixture();await f.access.password(user.email,'clave-ficticia');await f.access.administrar('registrar');assert.equal((await f.access.llaves())[0].id,'llave-prueba');
 await f.access.administrar('nombre','llave-prueba','  Celular  ');await f.access.administrar('quitar','llave-prueba');
 assert.equal(f.calls.find(x=>x[0]==='nombre')[1].friendlyName,'Celular');assert.equal(f.calls.find(x=>x[0]==='quitar')[1].passkeyId,'llave-prueba');
});
test('entrada con llave exige confirmar contraseña antes de administrar',async()=>{
 const f=fixture();await f.access.entrarLlave();await assert.rejects(f.access.administrar('registrar'),{code:'reciente'});
 await f.access.confirmar('clave-ficticia');await f.access.administrar('registrar');
});
test('refresh concurrente comparte una sola renovación',async()=>{
 const f=fixture(),d=deferred();await f.access.password(user.email,'clave');f.hooks.refresh=d.promise;
 const a=f.access.renovar(),b=f.access.renovar();d.resolve();assert.equal((await a).access_token,'renovado');await b;assert.equal(f.calls.filter(x=>x[0]==='refresh').length,1);
});
test('cerrar durante el login descarta la respuesta tardía y nunca restaura almacenamiento',async()=>{
 const f=fixture(),d=deferred();f.hooks.password=d.promise;const p=f.access.password(user.email,'clave');await Promise.resolve();const caught=assert.rejects(p,{code:'cerrada'});
 const close=f.access.cerrar();assert.equal(f.disk.has('zain-equipo'),false);d.resolve();await caught;await close;assert.equal(f.access.sesion,null);assert.equal(f.disk.has('zain-equipo'),false);
 assert.ok(f.calls.find(x=>x[0]==='logout')[1]);
});
test('cerrar durante refresh conserva revocación y descarta la sesión tardía',async()=>{
 const f=fixture(),d=deferred();await f.access.password(user.email,'clave');f.hooks.refresh=d.promise;const p=f.access.renovar();const caught=assert.rejects(p,{code:'cerrada'});
 const close=f.access.cerrar();assert.equal(f.disk.has('zain-equipo'),false);d.resolve();await caught;await close;assert.equal(f.disk.has('zain-equipo'),false);assert.equal(f.access.sesion,null);
 assert.ok(f.calls.find(x=>x[0]==='logout')[1]);
});
test('no admite ceremonias simultáneas y entrega AbortSignal al navegador',async()=>{
 const f=fixture(),d=deferred();f.hooks.passkey=d.promise;const p=f.access.entrarLlave();await Promise.resolve();await assert.rejects(f.access.entrarLlave(),{code:'ocupada'});
 f.access.cancelar();assert.equal(f.calls[0][1].aborted,true);d.resolve();await p;
});
test('navegador sin soporte conserva entrada por contraseña',async()=>{
 const f=fixture({supported:false});assert.equal(f.access.soporte(),false);await assert.rejects(f.access.entrarLlave(),{code:'sin_soporte'});await f.access.password(user.email,'clave');assert.ok(f.access.sesion);
});
test('almacenamiento bloqueado no rompe la sesión en memoria',async()=>{
 const f=fixture({throwStorage:true});await f.access.password(user.email,'clave');assert.equal((await f.access.restaurar()).user.id,user.id);await f.access.cerrar();assert.equal(f.access.sesion,null);
});
test('errores de deshabilitación, retos y cancelación tienen mensajes seguros',()=>{
 const f=fixture();assert.match(f.access.mensaje({code:'passkey_disabled'}),/contraseña/);assert.match(f.access.mensaje({code:'webauthn_challenge_expired'}),/venció/);
 assert.match(f.access.mensaje({originalError:{name:'NotAllowedError'}}),/cancelada/);assert.ok(!f.access.mensaje({message:'dato privado'}).includes('dato privado'));
});

test('ZAIN aísla el canal del SDK por pestaña sin cambiar la sesión histórica',async()=>{
 const a=fixture({aislarPestana:true}),b=fixture({aislarPestana:true});assert.notEqual(a.options.auth.storageKey,b.options.auth.storageKey);
 await a.access.password(user.email,'clave');assert.ok(a.disk.has('zain-equipo'));assert.equal(a.disk.has(a.options.auth.storageKey),false);
 assert.equal((await a.access.restaurar()).user.id,user.id);
});
test('borrar la sesión desde otra pestaña no recupera la copia en memoria',async()=>{
 const f=fixture();await f.access.password(user.email,'clave');f.disk.delete('zain-equipo');assert.equal(await f.access.restaurar(),null);
});
