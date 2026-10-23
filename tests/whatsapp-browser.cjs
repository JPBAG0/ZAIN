module.exports=async function verificarWhatsApp(page,{base='http://127.0.0.1:8085',capturas}={}){
 const assert=require('node:assert/strict'),path=require('node:path');const C=require('../server/config-interno.cjs');
 const QR=require(path.resolve(__dirname,'../../../../Aplicaciones/zain-whatsapp/node_modules/qrcode'));
 const qr1=await QR.toDataURL('QR FICTICIO SIN SESIÓN 1'),qr2=await QR.toDataURL('QR FICTICIO SIN SESIÓN 2');
 const chat1='11111111-1111-4111-8111-111111111111',chat2='22222222-2222-4222-8222-222222222222',pedido='33333333-3333-4333-8333-333333333333';
 const errores=[],escrituras=[];let estado='esperando-qr',qr=qr1,salidas=[],motivos={},creados=0;
 const chats=[{id:chat1,jid:'15555550101@s.whatsapp.net',telefono:'15555550101',nombre:'Contacto ficticio A',pedido_id:null,entrantes:1,no_leidos:1,ultima_fecha:new Date().toISOString(),ultimo_mensaje:'Mensaje de prueba'},{id:chat2,jid:'15555550102@s.whatsapp.net',telefono:'15555550102',nombre:'Contacto ficticio B',pedido_id:null,entrantes:1,no_leidos:0,ultima_fecha:new Date().toISOString(),ultimo_mensaje:'Segundo chat de prueba'}];
 const mensajes=[{id:'44444444-4444-4444-8444-444444444441',secuencia:1,wa_id:'A1',direccion:'entrante',tipo:'texto',texto:'<img src=x onerror="window.inyeccion=true"> Prueba sin HTML',fecha:new Date().toISOString()},
 {id:'44444444-4444-4444-8444-444444444442',secuencia:2,wa_id:'A2',direccion:'persona-desde-cel',tipo:'texto',texto:'Mensaje enviado desde el celular de prueba',fecha:new Date().toISOString()},
 {id:'44444444-4444-4444-8444-444444444443',secuencia:3,wa_id:'A3',direccion:'entrante',tipo:'imagen',texto:'Imagen ficticia',media_path:'fixture/imagen.png',mime:'image/png',fecha:new Date().toISOString()},
 {id:'44444444-4444-4444-8444-444444444444',secuencia:4,wa_id:'A4',direccion:'entrante',tipo:'audio',texto:'Audio de prueba',media_path:'fixture/audio.wav',mime:'audio/wav',fecha:new Date().toISOString()}];
 const audio=Buffer.alloc(44+32000);audio.write('RIFF',0);audio.writeUInt32LE(audio.length-8,4);audio.write('WAVEfmt ',8);audio.writeUInt32LE(16,16);audio.writeUInt16LE(1,20);audio.writeUInt16LE(1,22);audio.writeUInt32LE(16000,24);audio.writeUInt32LE(32000,28);audio.writeUInt16LE(2,32);audio.writeUInt16LE(16,34);audio.write('data',36);audio.writeUInt32LE(32000,40);
 await page.addInitScript(()=>sessionStorage.setItem('zain-equipo',JSON.stringify({access_token:'ficticio',refresh_token:'renovacion-ficticia',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id:'12345678-1234-4123-8123-123456789abc',email:'equipo@example.test'}})));page.on('pageerror',e=>errores.push(e.message));
 await page.context().route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url()),op=u.searchParams.get('op'),b=req.postDataJSON?.()||{};
  if(op){let d;if(req.method()!=='GET')escrituras.push({op,b});
   const c=chats.find(c=>c.id===(u.searchParams.get('id')||b.chat_id))||chats[0];
   const f={version_ventas:1,cotizados:0,vendidos:0,vendido:0,venta:0,costo:0,utilidad:0,por_cobrar:0,en_negociacion:0,negociacion_pedidos:0,cotizaciones_modelos:0,por_cobrar_pedidos:[]};
   if(op==='config')d={activo:true,supabaseUrl:'https://fixture.invalid',publishableKey:'ficticia'};
   else if(op==='lista')d={pedidos:[],siguiente:false,finanzas:f,equipo:{nombre:'Equipo ficticio'}};
   else if(op==='resumen')d={resumen:{activos:0}};
   else if(op==='wa-estado')d={habilitado:true,estado,qr:estado==='esperando-qr'?qr:null,numero:'15555550999',ultima_senal:new Date().toISOString(),qr_expira:new Date(Date.now()+20000).toISOString()};
   else if(op==='wa-plantillas')d={plantillas:C.seguimientoWhatsApp};
   else if(op==='wa-plantillas-guardar')d={ok:true};
   else if(op==='wa-motivos')d={motivos};
   else if(op==='wa-chats')d={chats,siguiente:false};
   else if(op==='wa-hilo')d={chat:c,mensajes:c.id===chat1?mensajes:[{...mensajes[0],id:'55555555-5555-4555-8555-555555555555',texto:'Solo chat B'}],salidas:c.id===chat1?salidas:[],plantillas:C.seguimientoWhatsApp,anteriores:false,...(c.pedido_id?{pedido:{id:pedido,folio:'ZAIN-FICTICIO',estado:'cotizado'},cotizacion:{revision:1,texto:'Cotización de prueba https://zain.test/mi-pedido#'+pedido+'/ficticio'},seguimiento:true}:{})};
   else if(op==='wa-leido'){c.no_leidos=0;d={ok:true};}
   else if(op==='wa-enviar'){salidas=[{id:b.id,texto:b.texto,estado:'pendiente',created_at:new Date().toISOString()}];d={salida:salidas[0]};}
   else if(op==='wa-desvincular'){estado='desconectado';d={ok:true};}
   else if(op==='wa-archivo')d=b.id.endsWith('3')?{url:base+'/fixture/imagen.png',mime:'image/png'}:{url:base+'/fixture/audio.wav',mime:'audio/wav'};
   else if(op==='wa-pedidos')d={pedidos:[{id:pedido,folio:'ZAIN-FICTICIO',estado:'cotizado'}]};
   else if(op==='wa-ligar'){c.pedido_id=pedido;d={pedido_id:pedido,folio:'ZAIN-FICTICIO'};}
   else if(op==='wa-motivo'){motivos[b.motivo]=(motivos[b.motivo]||0)+1;d={ok:true};}
   else if(op==='wa-catalogo')d={productos:[{sku:'ZN-BO-005',nombre:'Bolsa de prueba',colores:[{id:'rojo',nombre:'Rojo'}],tecnicas:[{id:'serigrafia',nombre:'Serigrafía'}],zonas:[{id:'frente',nombre:'Frente'}],tallas:[],minimo:100,paso:50}]};
   else if(op==='wa-crear-pedido'){creados++;c.pedido_id=pedido;d={pedido_id:pedido,folio:'ZAIN-FICTICIO'};}
   else if(op==='wa-por-pedido')d={chats:[{id:chat1,nombre:'Contacto ficticio A',no_leidos:0}]};
   else d={activo:false,productos:[],cotizaciones:[]};
   await route.fulfill({json:d});return;
  }
  if(u.pathname==='/fixture/imagen.png'){await route.fulfill({contentType:'image/png',body:Buffer.from(qr1.split(',')[1],'base64')});return;}
  if(u.pathname==='/fixture/audio.wav'){await route.fulfill({contentType:'audio/wav',body:audio});return;}
  if(!['127.0.0.1','localhost'].includes(u.hostname)||u.pathname.startsWith('/_vercel/')){await route.fulfill({body:''});return;}const fs=require('node:fs/promises');const local=path.resolve(__dirname,'..','.'+u.pathname);if(!local.startsWith(path.resolve(__dirname,'..')+path.sep)){await route.abort();return;}try{const tipos={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};await route.fulfill({contentType:tipos[path.extname(local)]||'application/octet-stream',body:await fs.readFile(local)});}catch{await route.fulfill({status:404,body:''});}
 });
 const ancho=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Sin desbordamiento horizontal');
 const resultados=[];
 for(const width of [390,1280]){
  estado='esperando-qr';qr=qr1;salidas=[];for(const c of chats)c.pedido_id=null;
  await page.setViewportSize({width,height:width===390?844:800});await page.goto(base+'/gestion-zain.html');await page.locator('#verWhatsApp').waitFor();await page.locator('#verWhatsApp').click();await page.locator('.wa-qr').waitFor();assert.equal(await page.locator('#seccionPedidos').isVisible(),false);
  assert.equal(await page.locator('.wa-qr').getAttribute('src'),qr1);qr=qr2;await page.waitForFunction(q=>document.querySelector('.wa-qr')?.src===q,qr2);await ancho();
  await page.evaluate(()=>scrollTo(0,0));if(capturas)await page.screenshot({path:path.join(capturas,'qr-fixture-'+width+'.png'),fullPage:true});
  estado='conectado';await page.locator('#waDesvincular').waitFor();page.once('dialog',d=>d.accept());await page.locator('#waDesvincular').click();await page.getByText('Desconectado',{exact:true}).waitFor();
  estado='conectado';await page.locator('#verChats').click();await page.locator('[data-chat="'+chat1+'"]').click();await page.locator('#waResponder').waitFor();assert.match(await page.locator('#waMensajes').innerText(),/desde el celular/);assert.equal(await page.evaluate(()=>window.inyeccion),undefined);
  await page.locator('[data-archivo-wa$="3"]').click();await page.locator('.wa-imagen').evaluate(e=>e.decode());await page.locator('[data-archivo-wa$="4"]').click();await page.locator('audio').waitFor();await page.locator('audio').evaluate(a=>a.play());
  await page.locator('audio').evaluate(a=>window.audioPrueba=a);await page.waitForTimeout(3400);assert.equal(await page.locator('audio').evaluate(a=>a===window.audioPrueba),true);
  await page.locator('[data-wa-ligar]').click();await page.locator('[data-wa-elegir-pedido]').click();await page.locator('#waAcciones summary').click();await page.locator('[data-wa-cotizacion]').waitFor();
  const enviosAntes=escrituras.filter(x=>x.op==='wa-enviar').length;await page.locator('[data-wa-cotizacion]').click();assert.match(await page.locator('#waTexto').inputValue(),/mi-pedido#/);assert.equal(escrituras.filter(x=>x.op==='wa-enviar').length,enviosAntes);
  await page.locator('[data-wa-plantilla="3"]').click();assert.match(await page.locator('#waTexto').inputValue(),/Queremos mejorar/);await page.locator('#waTexto').fill('Respuesta ficticia decidida por una persona.');await page.locator('#waEnviar').click();await page.locator('#waEnvioEstado').getByText(/En cola/).waitFor();assert.equal(escrituras.filter(x=>x.op==='wa-enviar').length,enviosAntes+1);
  await page.locator('#waAcciones details').evaluate(e=>e.open=true);await page.locator('[data-wa-motivo]').click();await page.locator('#waMotivoEstado').getByText('Motivo registrado.').waitFor();await ancho();
  await page.evaluate(()=>scrollTo(0,0));if(capturas)await page.screenshot({path:path.join(capturas,'chats-fixture-'+width+'.png'),fullPage:true});
  await page.locator('#waConversaciones').evaluate(e=>e.open=true);await page.locator('[data-chat="'+chat2+'"]').click();await page.locator('[data-wa-crear]').click();await page.locator('#waCantidad').waitFor();assert.equal(await page.locator('#waCantidad').inputValue(),'100');await page.locator('#waCrear button').click();await page.locator('[data-wa-abrir-pedido]').waitFor();
  await page.locator('#verWhatsApp').click();await page.locator('#seccionWhatsApp details summary').click();await page.locator('#waPlantillas textarea').first().waitFor();assert.equal(await page.locator('#waPlantillas textarea').count(),5);await page.locator('#waPlantillas button').click();await page.getByText('Plantillas guardadas.',{exact:true}).waitFor();
  await page.locator('#salir').click();assert.equal(await page.locator('#acceso').isVisible(),true);assert.ok(!(await page.locator('#seccionChats').textContent()).includes('Contacto ficticio'));assert.equal(await page.locator('#waTexto').inputValue(),'');
  await page.evaluate(()=>{window.audioPrueba=null;sessionStorage.setItem('zain-equipo',JSON.stringify({access_token:'ficticio',refresh_token:'renovacion-ficticia',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id:'12345678-1234-4123-8123-123456789abc',email:'equipo@example.test'}}));});resultados.push({ancho:width,qrRenovado:true,desvincular:true,medios:true,audioConservado:true,colaManual:true,vincular:true,crearPedido:true,limpiezaAlSalir:true});
 }
 assert.deepEqual(errores,[]);return {resultados,errores,enviosSimulados:escrituras.filter(x=>x.op==='wa-enviar').length,pedidosSimulados:creados,serviciosRealesContactados:0};
};
