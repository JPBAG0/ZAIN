// Navegador aislado: archivos y destinatarios ficticios, nunca contacta WhatsApp real.
module.exports=async function verificarAdjuntos(page,{base,capturas}={}){
 const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),{pathToFileURL}=require('node:url'),{createHash}=require('node:crypto');
 const {default:C}=await import(pathToFileURL(path.resolve(__dirname,'../js/config.js'))),producto=C.productos.find(p=>p.foto&&p.colores?.length&&p.pxPorCm&&p.zonas?.length&&p.tecnicas?.includes('bordado')&&p.activo!==false);
 const uid='12345678-1234-4123-8123-123456789abc',chatA='11111111-1111-4111-8111-111111111111',chatB='22222222-2222-4222-8222-222222222222',modelo='33333333-3333-4333-8333-333333333333',pedidoId='44444444-4444-4444-8444-444444444444';
 const chats=[{id:chatA,nombre:'Equipo de prueba A',pedido_id:pedidoId,entrantes:1,ultima_fecha:new Date().toISOString()},{id:chatB,nombre:'Equipo de prueba B',entrantes:1,ultima_fecha:new Date().toISOString()}],errores=[],llamadas=[],subidas=new Map(),cola=new Map();let fallarUnaVez=true,retener=false,liberarSubida;
 const q={id:modelo,version:7,folio:'COT-FICTICIA',estado:'enviada',cliente:'Equipo de prueba',datos:{modelos:[{sku:producto.sku,tecnica:'',color:producto.colores[0],zona:producto.zonas?.[0]?.id,ancho:'8'}]},comercial:{impuesto:1600,destinatario:'Equipo de prueba',vigencia:'2026-11-20',plazo:'Por acordar',anticipo:5000,notas:'Documento de prueba sin datos reales.',cargo:null,partidas:[{modelo:0,nombre:producto.nombreComercial||producto.nombre,sku:producto.sku,tallas:'CH a XG',color:'Todos los colores',personalizacion:'Solo prenda',precio:10000}]}};
 await page.addInitScript(s=>sessionStorage.setItem('zain-equipo',JSON.stringify(s)),{access_token:'ficticio',refresh_token:'renovacion-ficticia',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id:uid,email:'equipo@example.test'}});
 page.on('pageerror',e=>errores.push(e.message));
 await page.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url()),op=u.searchParams.get('op');
  if(u.pathname==='/fixture/logo.svg')return route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="400" height="180"><rect x="20" y="20" width="360" height="140" rx="20" fill="#2a3bff"/><text x="200" y="110" fill="white" font-family="Arial" font-size="45" text-anchor="middle">PRUEBA</text></svg>'});
  if(u.pathname.startsWith('/fixture/subida/')){if(retener)await new Promise(r=>liberarSubida=r);const id=u.pathname.split('/').at(-1),data=req.postDataBuffer();if(subidas.has(id))return route.fulfill({status:409,json:{error:'Ya existe'}});subidas.set(id,data);return route.fulfill({json:{ok:true}});}
  if(op){const b=req.method()==='GET'?{}:req.postDataJSON();llamadas.push({op,b});let d;
   if(op==='config')d={activo:true,supabaseUrl:'https://fixture.invalid',publishableKey:'ficticia'};
   else if(op==='lista')d={pedidos:[],finanzas:{version_ventas:1,vendidos:0,vendido:0,por_cobrar:0,en_negociacion:0,por_cobrar_pedidos:[]},equipo:{nombre:'Equipo ficticio'}};
   else if(op==='resumen')d={resumen:{activos:0}};
   else if(op==='wa-chats')d={chats,siguiente:false};
   else if(op==='wa-hilo')d={chat:chats.find(c=>c.id===u.searchParams.get('id')),mensajes:[],salidas:[...cola.values()].filter(s=>s.chat_id===u.searchParams.get('id')),plantillas:[],anteriores:false,...(u.searchParams.get('id')===chatA?{pedido:{id:pedidoId,folio:'ZAIN-PEDIDO-FICTICIO'}}:{})};
   else if(op==='cm-lista')d={cotizaciones:[q]};else if(op==='cm-leer')d={cotizacion:q};else if(op==='catalogo-publico')d={catalogo:C};
   else if(op==='detalle')d={pedido:{id:pedidoId,folio:'ZAIN-PEDIDO-FICTICIO',archivos:[{item:0,kind:'render'}]}};
   else if(op==='archivo')d={url:base+'/'+producto.foto};
   else if(op==='cotizacion')d={cotizacion:{publicada:{revision:3,publicada_at:'2026-10-22T12:00:00Z',destinatario:'Equipo de prueba',vigencia:'2026-11-20',plazo:'Por acordar',condiciones:'Cotización publicada de prueba',pagos:{anticipo:5000,instrucciones:'Coordina con ZAIN el anticipo.'},cargos:[],partidas:[{indice:0,sku:producto.sku,nombre:producto.nombreComercial||producto.nombre,color:'Color de prueba',tecnica:'Solo prenda',piezas:12,precio:10000,importe:120000,tallas:'M 12',descuento:0}],bruto:120000,descuento:0,envio:0,subtotal:120000,impuesto:1600,impuestos:19200,total:139200}}};
   else if(op==='wa-adjunto-subida')d={adjunto:{...b.adjunto,tipo:b.adjunto.mime.startsWith('image/')?'imagen':'documento',ruta:'salida/'+uid+'/'+b.id+'-'+b.adjunto.hash+'.'+(b.adjunto.mime==='image/png'?'png':'pdf')},url:base+'/fixture/subida/'+b.id};
   else if(op==='wa-enviar'){const data=subidas.get(b.id);if(b.adjunto){assert.ok(data);assert.equal(createHash('sha256').update(data).digest('hex'),b.adjunto.hash);}cola.set(b.id,{...b,estado:'pendiente'});if(fallarUnaVez){fallarUnaVez=false;return route.fulfill({status:502,json:{error:'Respuesta perdida de prueba; vuelve a intentar.'}});}d={salida:cola.get(b.id)};}
   else d={ok:true,productos:[],plantillas:[]};return route.fulfill({json:d});
  }
  if(!['127.0.0.1','localhost'].includes(u.hostname))return route.fulfill({status:200,body:''});await route.continue();
 });
 const resultados=[];
 for(const width of [390,1280]){
  if(width===1280){q.logoUrl=base+'/fixture/logo.svg';q.datos.modelos[0].tecnica='bordado';q.comercial.partidas[0].personalizacion='Bordado';q.comercial.partidas[0].zona=producto.zonas[0].nombre;q.comercial.partidas[0].medidas='8 × 4 cm';}
  cola.clear();subidas.clear();fallarUnaVez=true;await page.setViewportSize({width,height:width===390?844:900});await page.goto(base+'/gestion-zain.html');await page.locator('#verChats').click();await page.locator('[data-chat="'+chatA+'"]').click();
  await page.locator('#waAdjuntar').click();await page.locator('#waMenuAdjuntos').waitFor();
  const antes=llamadas.filter(x=>x.op==='wa-enviar').length;
  const pdf=Buffer.from('%PDF-1.4\nARCHIVO DE PRUEBA\n%%EOF\n');await page.locator('#waArchivo').setInputFiles({name:'Cotizacion-prueba.pdf',mimeType:'application/pdf',buffer:pdf});await page.locator('#waAdjunto').getByText('Cotizacion-prueba.pdf',{exact:true}).waitFor();
  assert.equal(llamadas.filter(x=>x.op==='wa-enviar').length,antes);assert.equal(await page.locator('#waAdjunto a').getAttribute('href').then(s=>s.startsWith('blob:')),true);
  await page.locator('#waEnviar').click();await page.locator('#waEnvioEstado').getByText(/Respuesta perdida/).waitFor();await page.locator('#waEnviar').click();await page.locator('#waEnvioEstado').getByText(/En cola/).waitFor();
  const intentos=llamadas.filter(x=>x.op==='wa-enviar').slice(-2);assert.equal(intentos[0].b.id,intentos[1].b.id);assert.equal(cola.size,1);assert.equal(intentos[1].b.chat_id,chatA);assert.equal(intentos[1].b.texto,'');assert.equal(await page.locator('#waAdjunto').isVisible(),false);
  await page.locator('#waArchivo').setInputFiles({name:'Exceso.pdf',mimeType:'application/pdf',buffer:Buffer.alloc(8388609)});await page.locator('#waEnvioEstado').getByText(/hasta 8 MB/).waitFor();
  await page.locator('#waAdjuntar').click();await page.locator('#waElegirCotizacion').click();await page.locator('[data-wa-pdf-modelo]').click();await page.locator('#waAdjunto').getByText('Cotizacion-COT-FICTICIA.pdf',{exact:true}).waitFor();
  assert.equal(cola.size,1,'Preparar PDF no envía');const url=await page.locator('#waAdjunto a').getAttribute('href'),bytes=await page.evaluate(async u=>Array.from(new Uint8Array(await (await fetch(u)).arrayBuffer())),url);assert.equal(Buffer.from(bytes).subarray(0,5).toString(),'%PDF-');
  if(capturas){await fs.writeFile(path.join(capturas,'cotizacion-adjunta-ficticia.pdf'),Buffer.from(bytes));await page.locator('#waResponder').screenshot({path:path.join(capturas,'adjunto-'+width+'.png')});}
  await page.locator('#waEnviar').click();await page.locator('#waEnvioEstado').getByText(/En cola/).waitFor();const enviado=llamadas.filter(x=>x.op==='wa-enviar').at(-1).b;assert.equal(enviado.adjunto.origen.id,modelo);assert.equal(enviado.adjunto.origen.version,7);
  await page.locator('#waAdjuntar').click();await page.locator('#waElegirCotizacion').click();await page.locator('[data-wa-pdf-pedido]').click();await page.locator('#waAdjunto').getByText('Cotizacion-ZAIN-PEDIDO-FICTICIO.pdf',{exact:true}).waitFor({timeout:8000}).catch(async()=>{throw Error('PDF del pedido: '+await page.locator('#waDialogoError').innerText());});
  await page.locator('#waEnviar').click();await page.locator('#waEnvioEstado').getByText(/En cola/).waitFor();const pedidoEnviado=llamadas.filter(x=>x.op==='wa-enviar').at(-1).b;assert.deepEqual(pedidoEnviado.adjunto.origen,{tipo:'pedido',id:pedidoId,version:3});
  await page.locator('#waArchivo').setInputFiles({name:'Cambio-de-chat.pdf',mimeType:'application/pdf',buffer:pdf});await page.locator('#waAdjunto').getByText('Cambio-de-chat.pdf',{exact:true}).waitFor();retener=true;const previos=llamadas.filter(x=>x.op==='wa-enviar').length;await page.locator('#waEnviar').click();await page.waitForFunction(()=>document.querySelector('#waEnvioEstado').textContent.includes('Subiendo'));
  await page.locator('#waConversaciones').evaluate(e=>e.open=true);await page.locator('[data-chat="'+chatB+'"]').click();await page.locator('#waCabecera').getByText('Equipo de prueba B',{exact:true}).waitFor();while(!liberarSubida)await new Promise(r=>setTimeout(r,10));retener=false;liberarSubida();liberarSubida=null;await page.locator('#waEnvioEstado').getByText(/Cambiaste de chat/).waitFor();assert.equal(llamadas.filter(x=>x.op==='wa-enviar').length,previos);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#salir').click();assert.equal(await page.locator('#waAdjunto').textContent(),'');resultados.push({ancho:width,archivo:true,pdfDirecto:true,pdfConLogo:width===1280,pdfPedidoPublicado:true,sinEnvioAlElegir:true,reintentoIdempotente:true,cambioChatProtegido:true,limpiezaAlSalir:true});
 }
 assert.deepEqual(errores,[]);return {resultados,errores,serviciosRealesContactados:0};
};
