// Navegador con API aislada: foto del artículo fuera de catálogo (JP, 20-nov-2026).
// Subir la foto, verla, guardarla, reabrir la cotización, descargar el PDF y pasar a pedido con la foto como imagen de la partida.
module.exports=async function verificarFotoLibre(page,{base,capturas,foto}={}){
 const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
 const root=path.resolve(__dirname,'..');
 const {default:publico}=await import(pathToFileURL(path.join(root,'js/config.js')));
 const {inicial,generar,calcular}=await import(pathToFileURL(path.join(root,'js/cotizacion-core.js')));
 const {validateOrder}=await import(pathToFileURL(path.join(root,'server/pedidos.mjs')));
 const {validarCotizacion}=await import(pathToFileURL(path.join(root,'server/cotizaciones-modelos.mjs')));
 const fail=(status,m)=>{const e=Error(m);e.status=status;throw e;};
 const imagen=fs.readFileSync(foto||path.join(root,'img/fotos/og.jpg'));
 const config={...inicial(),activo:true,prendas:[],rangos:[{desde:1,hasta:null,margen:3000}]};
 const session={access_token:'acceso-sintetico',refresh_token:'renovacion-sintetica',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id:'12345678-1234-4123-8123-123456789abc',email:'equipo@example.test'}};
 await page.addInitScript(s=>sessionStorage.setItem('zain-equipo',JSON.stringify(s)),session);
 const errores=[],red=[],operaciones=[];page.on('pageerror',e=>errores.push(e.message));
 const almacen=new Map(),archivosPedido=new Map();
 let guardada=null,pedido=null,cotizacion=null,crearBody=null;
 await page.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url()),op=u.searchParams.get('op');
  const json=d=>route.fulfill({json:d});
  if(u.origin===new URL(base).origin&&u.pathname.startsWith('/__subida/')){const objeto=decodeURIComponent(u.pathname.slice(10));assert.equal(req.method(),'PUT');assert.equal(req.headers()['content-type'],objeto.endsWith('.jpg')?'image/jpeg':'image/png');almacen.set(decodeURIComponent(u.pathname.slice(10)),req.postDataBuffer());return json({});}
  if(u.origin===new URL(base).origin&&u.pathname.startsWith('/__foto/')){const b=almacen.get(decodeURIComponent(u.pathname.slice(8)));return b?route.fulfill({status:200,contentType:'image/jpeg',body:b}):route.fulfill({status:404,body:''});}
  if(u.origin===new URL(base).origin&&u.pathname.startsWith('/__pedido/')){archivosPedido.set(u.pathname.slice(10),{tipo:req.headers()['content-type'],bytes:req.postDataBuffer()});return json({});}
  if(op){
   const b=req.method()==='POST'?req.postDataJSON():null;operaciones.push(op);
   if(op==='config')return json({activo:true,supabaseUrl:'https://auth.example.test',publishableKey:'sb_publishable_ficticia'});
   if(op==='lista')return json({pedidos:[],siguiente:false,equipo:{nombre:'Equipo de prueba'}});
   if(op==='resumen')return json({resumen:{activos:0}});
   if(op==='precios-config')return json({config:{version:1,datos:config}});
   if(op==='catalogo-lista')return json({productos:[]});
   if(op==='catalogo-publico')return json({catalogo:publico});
   if(op==='cm-lista')return json({cotizaciones:guardada?[{...guardada,desde:20000,modelos:1,updated_at:new Date().toISOString()}]:[]});
   // El logo (PNG) y la foto (JPEG ya reducida) usan la misma firma de subida.
   if(op==='cm-logo-subida'){assert.ok(['image/jpeg','image/png'].includes(b.mime));if(b.mime==='image/jpeg')assert.ok(b.bytes>1000&&b.bytes<3*1024*1024,'la foto se reduce antes de subir: '+b.bytes);const objeto=b.id+'/'+crypto.randomUUID()+(b.mime==='image/jpeg'?'.jpg':'.png');return json({objeto,url:base+'/__subida/'+objeto});}
   if(op==='cm-guardar'){
    validarCotizacion(b,fail);
    for(const s of b.datos.modelos)if(s.foto)assert.ok(almacen.has(s.foto.objeto),'la foto se sube antes de guardar');
    guardada={...b,folio:'COT-9101',estado:b.estado||'borrador',version:(guardada?.version||0)+1};return json({cotizacion:guardada});
   }
   if(op==='cm-estado'){guardada={...guardada,estado:b.estado,version:guardada.version+1};return json({cotizacion:guardada});}
   if(op==='cm-leer'){const fotosUrl=Object.fromEntries(guardada.datos.modelos.filter(s=>s.foto).map(s=>[s.foto.objeto,base+'/__foto/'+s.foto.objeto]));return json({cotizacion:{...guardada,logoUrl:null,fotosUrl}});}
   if(op==='crear'){crearBody=b;const x=validateOrder(b,{snapshot:true,servicio:true});pedido={id:b.id,folio:'ZAIN-FOTO',items:x.items,archivos:x.files,estado:'nuevo',total:x.total,created_at:new Date().toISOString(),guardado_at:new Date().toISOString(),version:1};return json({id:b.id,folio:pedido.folio});}
   if(op==='subidas')return json({files:crearBody.files.map(f=>({item:f.item,kind:f.kind,subido:false,url:base+'/__pedido/'+f.item+'-'+f.kind}))});
   if(op==='finalizar')return json({id:pedido.id,folio:pedido.folio,url:base+'/mi-pedido#solo-sintetico'});
   if(op==='cotizacion'){cotizacion={version:1,borrador:generar(pedido.items,config),publicada:null};return json({cotizacion});}
   if(op==='cotizacion-guardar'){cotizacion={version:2,borrador:calcular(pedido.items,b.borrador),publicada:null};return json({cotizacion});}
   if(op==='cotizacion-publicar'){cotizacion={...cotizacion,version:3,publicada:{revision:3,total:cotizacion.borrador.total}};return json({cotizacion});}
   if(op==='cm-convertir'){guardada={...guardada,estado:'convertida',pedido_id:pedido.id,version:guardada.version+1};return json({cotizacion:guardada,pedido:{id:pedido.id,folio:pedido.folio}});}
   return json({productos:[],cotizaciones:[],avisos:[],habilitado:false});
  }
  if(u.origin!==new URL(base).origin){red.push(u.hostname);return route.fulfill({status:200,body:''});}
  return route.continue();
 });
 const estado=()=>page.locator('.cm-modelo [data-vista-estado]').textContent();
 const pixelesFoto=()=>page.locator('.cm-modelo canvas').evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let distintos=0;for(let i=0;i<d.length;i+=4*97)if(Math.abs(d[i]-243)+Math.abs(d[i+1]-243)+Math.abs(d[i+2]-240)>30)distintos++;return distintos;});
 const esperar=async(cond,que)=>{for(let i=0;i<150;i++){if(cond())return;await page.waitForTimeout(100);}throw Error('No terminó: '+que+' · '+await page.locator('#cmEstado').textContent());};
 const resultados=[];
 for(const [width,conLogo] of [[390,false],[1280,true]]){
  guardada=null;pedido=null;cotizacion=null;crearBody=null;almacen.clear();archivosPedido.clear();operaciones.length=0;
  await page.setViewportSize({width,height:844});await page.goto(base+'/gestion-zain.html');await page.locator('#trabajo').waitFor();await page.evaluate(()=>document.querySelector('#verCotizaciones').click());await page.locator('#cmCampos:not([disabled])').waitFor({state:'attached'});
  await page.locator('#cmNueva').click();await page.locator('#cmDestinatario').fill('Empresa de prueba');
  if(conLogo)await page.locator('#cmLogo').setInputFiles({name:'logo.png',mimeType:'image/png',buffer:fs.readFileSync(path.join(root,'img/app-192.png'))});
  await page.locator('#cmLibre').click();
  // Sin foto: el artículo se ve como antes.
  assert.match(await estado(),/Sin foto/);assert.equal(await page.locator('.cm-modelo [data-foto-texto]').textContent(),'Subir foto');assert.equal(await page.locator('[data-accion=quitar-foto]').isHidden(),true);
  await page.locator('[data-campo=concepto]').fill('Playera gruesa oversize');await page.locator('[data-campo=costoLibre]').fill('189.69');
  if(conLogo)await page.locator('.cm-modelo [data-campo=tecnica]').selectOption('serigrafia');
  // Un archivo que no es imagen se rechaza sin perder nada.
  await page.locator('[data-foto]').setInputFiles({name:'nota.txt',mimeType:'text/plain',buffer:Buffer.from('hola')});
  await page.waitForFunction(()=>/foto JPG, PNG o WEBP/.test(document.querySelector('#cmEstado').textContent));
  assert.doesNotMatch(await estado(),/Foto del artículo/);
  await page.locator('[data-foto]').setInputFiles({name:'oversize.jpg',mimeType:'image/jpeg',buffer:imagen});
  await page.waitForFunction(()=>/Foto del artículo/.test(document.querySelector('.cm-modelo [data-vista-estado]').textContent));
  assert.equal(await page.locator('.cm-modelo canvas').isVisible(),true);assert.ok(await pixelesFoto()>200,'la foto se dibuja');
  assert.equal(await page.locator('.cm-modelo [data-foto-texto]').textContent(),'Cambiar foto');assert.equal(await page.locator('[data-accion=quitar-foto]').isVisible(),true);
  if(conLogo)assert.match(await estado(),/logo/);
  for(const campo of await page.locator('[data-campo=precio]').all()){await campo.fill('290');await campo.dispatchEvent('input');}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(capturas)await page.locator('.cm-modelo').screenshot({path:capturas+'/foto-libre-'+width+'.png'});
  // Guardar sube la foto a la carpeta de la cotización.
  await page.locator('#cmGuardar').click();await esperar(()=>guardada?.version===1,'guardar');
  assert.equal([...almacen.keys()].filter(k=>k.endsWith('.jpg')).length,1);const objeto=guardada.datos.modelos[0].foto.objeto;assert.ok(almacen.has(objeto));assert.equal(guardada.datos.modelos[0].foto.mime,'image/jpeg');
  // Guardar otra vez no vuelve a subir la misma foto.
  await page.locator('[data-campo=concepto]').fill('Playera gruesa oversize negra');await page.locator('#cmGuardar').click();
  await esperar(()=>guardada.version===2,'guardar otra vez');
  assert.equal(guardada.version,2);assert.equal(guardada.datos.modelos[0].foto.objeto,objeto);assert.equal(operaciones.filter(o=>o==='cm-logo-subida').length,1+(conLogo?1:0));
  // Reabrir desde la lista recupera la foto.
  await page.locator('#cmVolver').click();await page.locator('[data-abrir]').first().click();
  await page.waitForFunction(()=>/Foto del artículo/.test(document.querySelector('.cm-modelo [data-vista-estado]')?.textContent||''));assert.ok(await pixelesFoto()>200,'la foto vuelve al reabrir');
  // PDF con la foto.
  const [descarga]=await Promise.all([page.waitForEvent('download'),page.locator('#cmPDF').click()]);
  const pdf=fs.readFileSync(await descarga.path());assert.ok(pdf.subarray(0,5).toString()==='%PDF-');assert.ok(pdf.length>20000,'el PDF lleva la imagen: '+pdf.length);
  if(capturas)fs.writeFileSync(capturas+'/foto-libre-'+width+'.pdf',pdf);
  // Pasar a pedido: la foto va como imagen (render PNG) de la partida.
  await page.locator('#cmPasar').click();await page.locator('#cmConvertir').waitFor();
  await page.locator('#cvLineas [data-talla]').first().fill('30');await page.locator('#cvLineas [data-talla]').first().dispatchEvent('input');
  assert.equal(await page.locator('#cvErrores').textContent(),'');
  await page.locator('#cvCrear').click();await page.locator('#cvResultado:not([hidden])').waitFor();
  const item=pedido.items[0];assert.equal(item.p,'articulo-libre');assert.equal(item.tieneRender,true);assert.equal(item.tieneLogo,conLogo);assert.equal(item.tecnica,conLogo?'Serigrafía':'Solo prenda');
  const render=archivosPedido.get('0-render');assert.ok(render,'se subió la imagen de la partida');assert.equal(render.tipo,'image/png');assert.equal(render.bytes.subarray(1,4).toString(),'PNG');
  assert.equal(guardada.estado,'convertida');
  resultados.push({width,conLogo,fotoBytes:almacen.get(objeto).length,pdfBytes:pdf.length,renderBytes:render.bytes.length,convertida:true});
 }
 assert.deepEqual(errores,[]);assert.ok(red.every(h=>h==='fonts.googleapis.com'||h==='fonts.gstatic.com'),'Solo fuentes externas bloqueadas: '+red.join(','));
 return {resultados,errores,serviciosReales:0};
};
