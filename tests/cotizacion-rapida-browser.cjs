// Navegador con API aislada: cotización rápida (JP, 20-nov-2026). Partidas escritas a mano, foto opcional, cantidad,
// precio y descuento; guardar, la lista, reabrir, duplicar y el PDF (sin vista gris en la partida sin foto).
module.exports=async function verificarCotizacionRapida(page,{base,capturas,foto}={}){
 const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
 const root=path.resolve(__dirname,'..');
 const {default:publico}=await import(pathToFileURL(path.join(root,'js/config.js')));
 const {inicial}=await import(pathToFileURL(path.join(root,'js/cotizacion-core.js')));
 const {validarCotizacion}=await import(pathToFileURL(path.join(root,'server/cotizaciones-modelos.mjs')));
 const fail=(status,m)=>{const e=Error(m);e.status=status;throw e;};
 const imagen=fs.readFileSync(foto||path.join(root,'img/fotos/og.jpg'));
 const config={...inicial(),activo:true,prendas:[],rangos:[{desde:1,hasta:null,margen:3000}]};
 const session={access_token:'acceso-sintetico',refresh_token:'renovacion-sintetica',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id:'12345678-1234-4123-8123-123456789abc',email:'equipo@example.test'}};
 await page.addInitScript(s=>sessionStorage.setItem('zain-equipo',JSON.stringify(s)),session);
 const errores=[],red=[],operaciones=[];page.on('pageerror',e=>errores.push(e.message));
 const almacen=new Map(),filas=new Map();let numero=0;
 const origen=new URL(base).origin;
 await page.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url()),op=u.searchParams.get('op'),json=d=>route.fulfill({json:d});
  if(u.origin===origen&&u.pathname.startsWith('/__subida/')){almacen.set(decodeURIComponent(u.pathname.slice(10)),req.postDataBuffer());return json({});}
  if(u.origin===origen&&u.pathname.startsWith('/__foto/')){const b=almacen.get(decodeURIComponent(u.pathname.slice(8)));return b?route.fulfill({status:200,contentType:'image/jpeg',body:b}):route.fulfill({status:404,body:''});}
  if(op){
   const b=req.method()==='POST'?req.postDataJSON():null;operaciones.push(op);
   if(op==='config')return json({activo:true,supabaseUrl:'https://auth.example.test',publishableKey:'sb_publishable_ficticia'});
   if(op==='lista')return json({pedidos:[],siguiente:false,equipo:{nombre:'Equipo de prueba'}});
   if(op==='resumen')return json({resumen:{activos:0}});
   if(op==='precios-config')return json({config:{version:1,datos:config}});
   if(op==='catalogo-lista')return json({productos:[]});
   if(op==='catalogo-publico')return json({catalogo:publico});
   // La lista del servidor manda tipo y total (CAMPOS de server/cotizaciones-modelos.mjs).
   if(op==='cm-lista')return json({cotizaciones:[...filas.values()].map(x=>({id:x.id,folio:x.folio,estado:x.estado,cliente:x.cliente,desde:x.desde,modelos:x.modelos,version:x.version,updated_at:new Date().toISOString(),impuesto:x.comercial?.impuesto,tipo:x.datos?.tipo,total:x.comercial?.total}))});
   if(op==='cm-logo-subida'){assert.equal(b.mime,'image/jpeg');const objeto=b.id+'/'+crypto.randomUUID()+'.jpg';return json({objeto,url:base+'/__subida/'+objeto});}
   if(op==='cm-guardar'){
    validarCotizacion(b,fail);for(const s of b.datos.modelos)if(s.foto)assert.ok(almacen.has(s.foto.objeto),'la foto se sube antes de guardar');
    const previa=filas.get(b.id),x={...b,folio:previa?.folio||'COT-'+String(9200+(++numero)),estado:b.estado||previa?.estado||'borrador',version:(previa?.version||0)+1};filas.set(b.id,x);return json({cotizacion:x});
   }
   if(op==='cm-estado'){const x={...filas.get(b.id),estado:b.estado};x.version++;filas.set(b.id,x);return json({cotizacion:x});}
   if(op==='cm-leer'){const x=filas.get(u.searchParams.get('id'));const fotosUrl=Object.fromEntries(x.datos.modelos.filter(s=>s.foto).map(s=>[s.foto.objeto,base+'/__foto/'+s.foto.objeto]));return json({cotizacion:{...x,logoUrl:null,fotosUrl}});}
   return json({productos:[],cotizaciones:[],avisos:[],habilitado:false});
  }
  if(u.origin!==origen){red.push(u.hostname);return route.fulfill({status:200,body:''});}
  return route.continue();
 });
 const esperar=async(cond,que)=>{for(let i=0;i<150;i++){if(cond())return;await page.waitForTimeout(100);}throw Error('No terminó: '+que+' · '+await page.locator('#cmEstado').textContent());};
 const fila=n=>page.locator('#crFilas .cr-fila').nth(n),campo=(n,k)=>fila(n).locator('[data-cr="'+k+'"]');
 const resultados=[];
 for(const width of [390,1280]){
  filas.clear();almacen.clear();operaciones.length=0;
  await page.setViewportSize({width,height:844});await page.goto(base+'/gestion-zain.html');await page.locator('#trabajo').waitFor();await page.evaluate(()=>document.querySelector('#verCotizaciones').click());await page.locator('#cmCampos:not([disabled])').waitFor({state:'attached'});
  await page.locator('#cmRapidaNueva').click();
  assert.equal(await page.locator('#cmRapida').isVisible(),true);
  for(const id of ['#cmModelosPanel','#cmLogoPanel','#cmPasar','#cmRedondeoCampo'])assert.equal(await page.locator(id).isHidden(),true,id+' oculto');
  assert.equal(await page.locator('#crFilas .cr-fila').count(),1);assert.equal(await page.locator('#crTitulo1').inputValue(),'Tu cotización,');
  await page.locator('#cmDestinatario').fill('Cafetería de prueba');
  await campo(0,'concepto').fill('Termo de acero 500 ml');await campo(0,'descripcion').fill('Tampografía a 1 tinta, logo al frente');
  await campo(0,'cantidad').fill('100');await campo(0,'precio').fill('85');await campo(0,'descuento').fill('10');await campo(0,'costo').fill('52');
  await fila(0).locator('[data-cr-foto]').setInputFiles({name:'termo.jpg',mimeType:'image/jpeg',buffer:imagen});
  await page.waitForFunction(()=>!document.querySelector('#crFilas .cr-fila canvas').hidden);
  assert.match(await fila(0).locator('[data-cr-importe]').textContent(),/Importe \$7,650\.00.*utilidad \$2,450\.00/);
  await page.locator('#crAgregar').click();await campo(1,'concepto').fill('Taza de cerámica 11 oz');await campo(1,'descripcion').fill('Tampografía a 1 tinta');await campo(1,'cantidad').fill('50');await campo(1,'precio').fill('60');
  // Una partida de más: se agrega, se sube y se quita; las otras dos conservan su orden.
  await page.locator('#crAgregar').click();await campo(2,'concepto').fill('Partida de sobra');await campo(2,'subir').click();
  assert.equal(await campo(1,'concepto').inputValue(),'Partida de sobra');await campo(1,'quitar').click();
  assert.equal(await page.locator('#crFilas .cr-fila').count(),2);assert.equal(await campo(1,'concepto').inputValue(),'Taza de cerámica 11 oz');
  await page.evaluate(()=>{for(const d of document.querySelectorAll('#cmForm details'))d.open=true;});
  await page.locator('#cmCargoConcepto').fill('Pantalla de tampografía');await page.locator('#cmCargo').fill('350');await page.locator('#cmCargo').dispatchEvent('input');
  await page.locator('#crTitulo1').fill('Hola, Cafetería de prueba');await page.locator('#crNotasPie').fill('Imágenes ilustrativas.\nPrecios sujetos a existencia.');
  const totales=await page.locator('#crTotales').textContent();assert.match(totales,/Descuento −\$850\.00/);assert.match(totales,/Total \$12,760\.00/);
  assert.match(await page.locator('#cmResumen').textContent(),/2 partidas · total \$12,760\.00/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(capturas)await page.locator('#cmRapida').screenshot({path:capturas+'/rapida-'+width+'.png'});
  // Guardar
  await page.locator('#cmGuardar').click();await esperar(()=>filas.size===1,'guardar');
  const [g]=[...filas.values()];assert.equal(g.datos.tipo,'rapida');assert.equal(g.modelos,2);assert.equal(g.desde,6000);assert.equal(g.comercial.total,1276000);assert.equal(g.comercial.partidas[0].descuento,1000);
  assert.ok(g.datos.modelos[0].foto&&!g.datos.modelos[1].foto);assert.equal(g.datos.modelos[0].costo,'52');assert.ok(!JSON.stringify(g.comercial).includes('5200'),'el costo no va en lo comercial');
  assert.equal(g.datos.textos.titulo1,'Hola, Cafetería de prueba');
  // La lista y reabrir
  await page.locator('#cmVolver').click();await page.locator('#cmLista [data-abrir]').first().waitFor();
  assert.match(await page.locator('#cmLista').textContent(),/Rápida · 2 partidas · total \$12,760\.00/);
  await page.locator('#cmLista [data-abrir]').first().click();await page.waitForFunction(()=>document.querySelectorAll('#crFilas .cr-fila').length===2&&!document.querySelector('#crFilas .cr-fila canvas').hidden);
  assert.equal(await campo(0,'precio').inputValue(),'85');assert.equal(await campo(1,'concepto').inputValue(),'Taza de cerámica 11 oz');assert.equal(await page.locator('#crTitulo1').inputValue(),'Hola, Cafetería de prueba');
  assert.equal(await page.locator('#cmModelosPanel').isHidden(),true);
  // PDF
  const [descarga]=await Promise.all([page.waitForEvent('download'),page.locator('#cmPDF').click()]);
  const pdf=fs.readFileSync(await descarga.path());assert.equal(pdf.subarray(0,5).toString(),'%PDF-');if(capturas)fs.writeFileSync(capturas+'/rapida-'+width+'.pdf',pdf);
  const subidas=operaciones.filter(o=>o==='cm-logo-subida').length;
  // Duplicar: la copia vuelve a subir la foto a su propia carpeta.
  await page.locator('#cmVolver').click();await page.locator('#cmLista [data-duplicar]').first().click();
  await page.waitForFunction(()=>document.querySelectorAll('#crFilas .cr-fila').length===2);await page.locator('#cmGuardar').click();await esperar(()=>filas.size===2,'guardar la copia');
  const copia=[...filas.values()][1];assert.notEqual(copia.datos.modelos[0].foto.objeto,g.datos.modelos[0].foto.objeto);assert.ok(copia.datos.modelos[0].foto.objeto.startsWith(copia.id+'/'));assert.equal(operaciones.filter(o=>o==='cm-logo-subida').length,subidas+1);
  // La cotización por modelo sigue igual.
  await page.locator('#cmVolver').click();await page.locator('#cmNueva').click();assert.equal(await page.locator('#cmModelosPanel').isVisible(),true);assert.equal(await page.locator('#cmRapida').isHidden(),true);
  resultados.push({width,total:g.comercial.total,pdfBytes:pdf.length,duplicada:true});
 }
 assert.deepEqual(errores,[]);assert.ok(red.every(h=>h==='fonts.googleapis.com'||h==='fonts.gstatic.com'),'Solo fuentes externas bloqueadas: '+red.join(','));
 return {resultados,errores,serviciosReales:0};
};
