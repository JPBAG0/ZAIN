// SDK real y autenticador virtual; Auth y negocio completamente simulados.
module.exports=async function verificarLlaves(page,{base,capturas}={}) {
 const assert=require('node:assert/strict'),errores=[],red=[],authCalls=[];
 const uid='12345678-1234-4123-8123-123456789abc';
 const jwt=()=>{const b=x=>Buffer.from(JSON.stringify(x)).toString('base64url');return b({alg:'HS256',typ:'JWT'})+'.'+b({sub:uid,email:'equipo@example.test',role:'authenticated',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600})+'.c2ludGV0aWNh';};
 const token=()=>({access_token:jwt(),refresh_token:'renovacion-sintetica',token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,user:{id:uid,email:'equipo@example.test',email_confirmed_at:'2026-10-22T12:00:00Z',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{}}});
 let llaves=[],denegado=false,falloAuth=null;
 page.on('pageerror',e=>errores.push(e.message));
 await page.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url());
  const json=(data,status=200)=>route.fulfill({status,json:data,headers:{'Access-Control-Allow-Origin':'*','X-Supabase-Api-Version':'2024-01-01'}});
  if(u.hostname==='auth.example.test'){
   authCalls.push({path:u.pathname,method:req.method()});
   if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'*'}});
   if(u.pathname.endsWith('/token'))return json(token());
   if(u.pathname.endsWith('/logout'))return route.fulfill({status:204});
   if(falloAuth&&u.pathname.includes('/passkeys'))return json({error_code:falloAuth,code:falloAuth,msg:'Error sintético'},400);
   if(u.pathname.endsWith('/passkeys/registration/options'))return json({challenge_id:'registro-prueba',options:{challenge:'Y2hhbGxlbmdlLXBydWViYS0xMjM0NTY3ODkw',rp:{id:'localhost',name:'Prueba aislada'},user:{id:Buffer.from(uid).toString('base64url'),name:'equipo@example.test',displayName:'Equipo de prueba'},pubKeyCredParams:[{type:'public-key',alg:-7}],authenticatorSelection:{residentKey:'required',userVerification:'required'},timeout:60000,attestation:'none',excludeCredentials:[]}});
   if(u.pathname.endsWith('/passkeys/registration/verify')){const body=req.postDataJSON();assert.equal(body.challenge_id,'registro-prueba');assert.ok(body.credential.response.attestationObject);llaves=[{id:'llave-prueba',friendly_name:'Autenticador de prueba',created_at:'2026-10-22T12:00:00Z'}];return json(llaves[0]);}
   if(u.pathname.endsWith('/passkeys/authentication/options'))return json({challenge_id:'entrada-prueba',options:{challenge:'Y2hhbGxlbmdlLWVudHJhZGEtMTIzNDU2Nzg5MA',rpId:'localhost',userVerification:'required',timeout:60000}});
   if(u.pathname.endsWith('/passkeys/authentication/verify')){const b=req.postDataJSON();assert.equal(b.challenge_id,'entrada-prueba');assert.ok(b.credential.response.signature);return json(token());}
   if(u.pathname.endsWith('/passkeys'))return json(llaves);
   if(u.pathname.endsWith('/passkeys/llave-prueba')&&req.method()==='PATCH'){llaves[0].friendly_name=req.postDataJSON().friendly_name;return json(llaves[0]);}
   if(u.pathname.endsWith('/passkeys/llave-prueba')&&req.method()==='DELETE'){llaves=[];return route.fulfill({status:204});}
   if(u.pathname.endsWith('/user'))return json(token().user);
   throw Error('Auth inesperado: '+u.pathname);
  }
  const op=u.searchParams.get('op');
  if(op){
   if(denegado&&op!=='config')return json({error:'Cuenta sin acceso al equipo.'},403);
   const data={config:{activo:true,supabaseUrl:'https://auth.example.test',publishableKey:'sb_publishable_sintetica'},lista:{pedidos:[],siguiente:false,equipo:{nombre:'Equipo sintético'}},resumen:{resumen:{activos:0}},'wa-estado':{habilitado:false},'avisos':{avisos:[]}};
   return json(data[op]||{productos:[],tecnicas:[],cotizaciones:[],activo:false,avisos:[]});
  }
  if(u.origin!==new URL(base).origin){red.push(u.hostname);return route.fulfill({status:200,body:''});}
  return route.continue();
 });
 const cdp=await page.context().newCDPSession(page);await cdp.send('WebAuthn.enable');
 const {authenticatorId}=await cdp.send('WebAuthn.addVirtualAuthenticator',{options:{protocol:'ctap2',transport:'internal',hasResidentKey:true,hasUserVerification:true,isUserVerified:true,automaticPresenceSimulation:true}});
 const entrar=async()=>{await page.locator('#correo').fill('equipo@example.test');await page.locator('#password').fill('clave-sintetica');await page.locator('#entrar').click();await page.locator('#trabajo').waitFor();};
 const esperarTexto=(s,t)=>page.waitForFunction(({s,t})=>document.querySelector(s)?.textContent.includes(t),{s,t});
 for(const ancho of [390,1280]){
  await page.setViewportSize({width:ancho,height:844});await page.goto(base+'/gestion-zain.html');await page.locator('#entrar:not([disabled])').waitFor();
  await entrar();await page.locator('#abrirLlaves').click();await esperarTexto('#llavesLista','Todavía');
  await page.locator('#registrarLlave').click();await esperarTexto('#llavesLista','Autenticador de prueba');
  await page.locator('#llavesLista input').fill('Celular de prueba');await page.getByRole('button',{name:'Guardar nombre',exact:true}).click();await esperarTexto('#llavesLista','Celular de prueba');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(capturas)await page.screenshot({path:capturas+'/llaves-zain-'+ancho+'.png'});
  await page.locator('#cerrarLlaves').click();await page.locator('#salir').click();await page.locator('#acceso').waitFor();await page.waitForFunction(()=>sessionStorage.getItem('zain-equipo')===null);
  await page.locator('#entrarLlave').click();await page.locator('#trabajo').waitFor();
  await page.locator('#abrirLlaves').click();await page.locator('#llavesLista input').waitFor();
  await page.locator('#registrarLlave').click();await esperarTexto('#llavesEstado','Confirma tu contraseña');
  await page.locator('#confirmarClaveLlave').fill('clave-sintetica');await page.getByRole('button',{name:'Confirmar identidad',exact:true}).click();await esperarTexto('#llavesEstado','Identidad confirmada');
  page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Quitar llave',exact:true}).click();await esperarTexto('#llavesLista','Todavía');
  await page.locator('#cerrarLlaves').click();await page.locator('#salir').click();await page.locator('#acceso').waitFor();
  // Baja simulada del lado servidor: entrada con llave sigue sujeta a permiso del equipo.
  denegado=true;await page.locator('#entrarLlave').click();await esperarTexto('#estadoPanel','Cuenta sin acceso');assert.equal(await page.locator('#trabajo').isVisible(),false);denegado=false;
  falloAuth='passkey_disabled';await page.locator('#entrarLlave:not([disabled])').click();await esperarTexto('#estadoPanel','aún no están habilitadas');falloAuth='webauthn_challenge_expired';await page.locator('#entrarLlave:not([disabled])').click();await esperarTexto('#estadoPanel','venció');falloAuth=null;
  await entrar();await page.reload();await page.locator('#trabajo').waitFor();await page.locator('#salir').click();await page.locator('#acceso').waitFor();
 }
 await cdp.send('WebAuthn.setAutomaticPresenceSimulation',{authenticatorId,enabled:false});
 await page.locator('#entrarLlave').click();await page.locator('#cancelarLlave').waitFor();await page.locator('#cancelarLlave').click();await esperarTexto('#estadoPanel','cancelada');
 await cdp.send('WebAuthn.setAutomaticPresenceSimulation',{authenticatorId,enabled:true});
 await entrar();await page.locator('#salir').click();
 await page.addInitScript(()=>Object.defineProperty(globalThis,'PublicKeyCredential',{value:undefined,configurable:true}));
 await page.reload();await page.locator('#entrar:not([disabled])').waitFor();assert.equal(await page.locator('#entrarLlave').isVisible(),false);await entrar();await page.locator('#trabajo').waitFor();
 assert.deepEqual(errores,[]);
 assert.ok(authCalls.some(x=>x.path.endsWith('/registration/verify')));assert.ok(authCalls.some(x=>x.path.endsWith('/authentication/verify')));
 return {anchos:[390,1280],alta:true,loginLlave:true,respaldoPassword:true,renombrar:true,baja:true,restauracion:true,permisoRevocado:true,passkeysDeshabilitadas:true,retoVencido:true,sinSoportePassword:true,cancelacion:true,errores,serviciosReales:0};
};
