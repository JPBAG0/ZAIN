// Navegador con SDK real y API aislada. Valida el contrato de crear y los importes con el servidor real.
module.exports=async function verificarConversion(page,{base,capturas}={}){
 const assert=require('node:assert/strict'),{pathToFileURL}=require('node:url'),path=require('node:path');
 const root=path.resolve(__dirname,'..'),C=require('../server/config-interno.cjs');
 const {default:publico}=await import(pathToFileURL(path.join(root,'js/config.js')));
 const {inicial,generar,calcular}=await import(pathToFileURL(path.join(root,'js/cotizacion-core.js')));
 const {validateOrder}=await import(pathToFileURL(path.join(root,'server/pedidos.mjs')));
 const producto=publico.productos.find(p=>p.tallas?.length&&p.activo!==false);
 const config={...inicial(),activo:true,prendas:[{sku:producto.sku,prenda:10000,otros:0}],rangos:[{desde:1,hasta:null,margen:3000}]};
 const session={access_token:'acceso-sintetico',refresh_token:'renovacion-sintetica',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id:'12345678-1234-4123-8123-123456789abc',email:'equipo@example.test'}};
 await page.addInitScript(s=>sessionStorage.setItem('zain-equipo',JSON.stringify(s)),session);
 const errores=[],red=[],operaciones=[];page.on('pageerror',e=>errores.push(e.message));
 let guardada=null,pedido=null,cotizacion=null,esperado=null;
 await page.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url()),op=u.searchParams.get('op');
  const json=d=>route.fulfill({json:d});
  if(op){
   const b=req.method()==='POST'?req.postDataJSON():null;operaciones.push(op);
   if(op==='config')return json({activo:true,supabaseUrl:'https://auth.example.test',publishableKey:'sb_publishable_ficticia'});
   if(op==='lista')return json({pedidos:[],siguiente:false,equipo:{nombre:'Equipo de prueba'}});
   if(op==='resumen')return json({resumen:{activos:0}});
   if(op==='precios-config')return json({config:{version:1,datos:config}});
   if(op==='catalogo-lista')return json({productos:[{...producto,activo:true}]});
   if(op==='catalogo-publico')return json({catalogo:publico});
   if(op==='cm-lista')return json({cotizaciones:guardada?[{...guardada,desde:20000,modelos:1,updated_at:new Date().toISOString()}]:[]});
   if(op==='cm-guardar'){guardada={...b,folio:'COT-9001',estado:b.estado||'borrador',version:(guardada?.version||0)+1};return json({cotizacion:guardada});}
   if(op==='crear'){esperado=validateOrder(b,{snapshot:true});assert.equal(b.files.length,0);assert.equal(esperado.items[0].tieneLogo,false);pedido={id:b.id,folio:'ZAIN-SINTETICO',items:esperado.items,archivos:[],estado:'nuevo',total:esperado.total,created_at:new Date().toISOString(),guardado_at:new Date().toISOString(),version:1};return json({id:b.id,folio:pedido.folio});}
   if(op==='subidas')return json({files:[]});
   if(op==='finalizar')return json({id:pedido.id,folio:pedido.folio,url:base+'/mi-pedido#solo-sintetico'});
   if(op==='cotizacion'){cotizacion={version:1,borrador:generar(pedido.items,config),publicada:null};return json({cotizacion});}
   if(op==='cotizacion-guardar'){cotizacion={version:2,borrador:calcular(pedido.items,b.borrador),publicada:null};assert.equal(cotizacion.borrador.total,278400);return json({cotizacion});}
   if(op==='cotizacion-publicar'){cotizacion={...cotizacion,version:3,publicada:{revision:3,total:cotizacion.borrador.total}};return json({cotizacion});}
   if(op==='cm-convertir'){assert.equal(b.pedido_id,pedido.id);guardada={...guardada,estado:'convertida',pedido_id:pedido.id,version:guardada.version+1};return json({cotizacion:guardada,pedido:{id:pedido.id,folio:pedido.folio}});}
   return json({productos:[],cotizaciones:[],avisos:[],habilitado:false});
  }
  if(u.origin!==new URL(base).origin){red.push(u.hostname);return route.fulfill({status:200,body:''});}
  return route.continue();
 });
 const resultados=[];
 for(const width of [390,1280])for(const personalizada of [false,true]){
  guardada=null;pedido=null;cotizacion=null;esperado=null;
  await page.setViewportSize({width,height:844});await page.goto(base+'/gestion-zain.html');await page.locator('#trabajo').waitFor();await page.locator('#verCotizaciones').click();await page.locator('#cmCampos:not([disabled])').waitFor({state:'attached'});
  assert.equal(await page.locator('#cmForm').isVisible(),false);await page.locator('#cmNueva').click();assert.equal(await page.locator('#cmGuardadas').isVisible(),false);
  await page.locator('#cmDestinatario').fill('Empresa de prueba');await page.locator('#cmModelo').selectOption(producto.sku);await page.locator('#cmAgregar').click();
  if(personalizada){await page.locator('[data-campo=tecnica]').selectOption(producto.tecnicas[0]);await page.locator('.cm-mas summary').click();await page.locator('[data-campo=alto]').fill('8');}
  for(const campo of await page.locator('[data-campo=precio]').all()){await campo.fill('200');await campo.dispatchEvent('input');}
  await page.locator('#cmPasar').click();await page.locator('#cmConvertir').waitFor();await page.locator('#cvLineas [data-talla]').first().fill('12');await page.locator('#cvLineas [data-talla]').first().dispatchEvent('input');
  assert.equal(await page.locator('#cvCrear').isDisabled(),false);assert.equal(await page.locator('#cvErrores').textContent(),'');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(capturas&&personalizada)await page.screenshot({path:capturas+'/conversion-corregida-'+width+'.png',fullPage:true});
  await page.locator('#cvCrear').click();await page.locator('#cvResultado:not([hidden])').waitFor();
  assert.equal(guardada.estado,'convertida');assert.equal(pedido.total,12);assert.equal(pedido.items[0].tecnica,personalizada?C.tecnicas.find(t=>t.id===producto.tecnicas[0]).nombre:'Solo prenda');assert.equal(cotizacion.borrador.total,278400);
  resultados.push({width,personalizada,logoPendiente:personalizada,totalConIVA:278400,convertida:true});
 }
 assert.deepEqual(errores,[]);assert.ok(red.every(h=>h==='fonts.googleapis.com'),'Solo fuentes externas bloqueadas');assert.ok(operaciones.includes('cm-convertir'));
 return {resultados,errores,serviciosReales:0};
};