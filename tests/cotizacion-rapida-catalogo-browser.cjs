// Navegador con API aislada: cotización rápida con prendas del catálogo (JP, 25-nov-2026). Ligar una partida a una
// prenda, costo y precio propuestos (tramo + bordado + margen), escribir el precio, guardar, reabrir con el precio
// cotizado, desligar y «Cotizar este modelo» desde Catálogo.
module.exports=async function verificarRapidaCatalogo(page,{base,capturas}={}){
 const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
 const root=path.resolve(__dirname,'..');
 const {default:publico}=await import(pathToFileURL(path.join(root,'js/config.js')));
 const {inicial}=await import(pathToFileURL(path.join(root,'js/cotizacion-core.js')));
 const {validarCotizacion}=await import(pathToFileURL(path.join(root,'server/cotizaciones-modelos.mjs')));
 const fail=(status,m)=>{const e=Error(m);e.status=status;throw e;};
 const SKU='ZN-GO-001',gorra=publico.productos.find(p=>p.sku===SKU);assert.ok(gorra?.foto,'la gorra de prueba tiene render');
 const config={...inicial(),activo:true,rangos:[{desde:1,hasta:null,margen:3000}],
  prendas:[{sku:SKU,prenda:null,otros:0,bandas:[{tallas:[],colores:[],costo:10000,desdePiezas:1,hastaPiezas:49},{tallas:[],colores:[],costo:8000,desdePiezas:50,hastaPiezas:null}]}],
  tecnicas:inicial().tecnicas.map(t=>t.tecnica==='Bordado'?{...t,porPieza:4000}:t)};
 const session={access_token:'acceso-sintetico',refresh_token:'renovacion-sintetica',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id:'12345678-1234-4123-8123-123456789abc',email:'equipo@example.test'}};
 await page.addInitScript(s=>sessionStorage.setItem('zain-equipo',JSON.stringify(s)),session);
 const errores=[],red=[];page.on('pageerror',e=>errores.push(e.message));
 const filas=new Map();let numero=0;const origen=new URL(base).origin;
 await page.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url()),op=u.searchParams.get('op'),json=d=>route.fulfill({json:d});
  if(op){
   const b=req.method()==='POST'?req.postDataJSON():null;
   if(op==='config')return json({activo:true,supabaseUrl:'https://auth.example.test',publishableKey:'sb_publishable_ficticia'});
   if(op==='lista')return json({pedidos:[],siguiente:false,equipo:{nombre:'Equipo de prueba'}});
   if(op==='resumen')return json({resumen:{activos:0}});
   if(op==='precios-config')return json({config:{version:1,datos:config}});
   if(op==='catalogo-lista')return json({productos:[{...gorra,skuProveedor:'GOR-6P',activo:true}]});
   if(op==='catalogo-publico')return json({catalogo:publico});
   if(op==='cm-lista')return json({cotizaciones:[...filas.values()].map(x=>({id:x.id,folio:x.folio,estado:x.estado,cliente:x.cliente,desde:x.desde,modelos:x.modelos,version:x.version,updated_at:new Date().toISOString(),impuesto:x.comercial?.impuesto,tipo:x.datos?.tipo,total:x.comercial?.total}))});
   if(op==='cm-guardar'){validarCotizacion(b,fail);const previa=filas.get(b.id),x={...b,folio:previa?.folio||'COT-'+String(9300+(++numero)),estado:b.estado||previa?.estado||'borrador',version:(previa?.version||0)+1};filas.set(b.id,x);return json({cotizacion:x});}
   if(op==='cm-estado'){const x={...filas.get(b.id),estado:b.estado};x.version++;filas.set(b.id,x);return json({cotizacion:x});}
   if(op==='cm-leer'){const x=filas.get(u.searchParams.get('id'));return json({cotizacion:{...x,logoUrl:null,fotosUrl:{}}});}
   return json({productos:[],cotizaciones:[],avisos:[],habilitado:false});
  }
  if(u.origin!==origen){red.push(u.hostname);return route.fulfill({status:200,body:''});}
  return route.continue();
 });
 const esperar=async(cond,que)=>{for(let i=0;i<150;i++){if(await cond())return;await page.waitForTimeout(100);}throw Error('No terminó: '+que+' · '+await page.locator('#cmEstado').textContent());};
 const fila=n=>page.locator('#crFilas .cr-fila').nth(n),campo=(n,k)=>fila(n).locator('[data-cr="'+k+'"]'),importe=n=>fila(n).locator('[data-cr-importe]').textContent();
 // La lista se vuelve a pintar al regresar: esperar a que termine antes de tocar la fila.
 const abrirPrimera=async()=>{await page.locator('#cmVolver').click();await page.locator('#cmLista [data-abrir]').first().waitFor();await page.waitForTimeout(400);await page.locator('#cmLista [data-abrir]').first().click();await esperar(async()=>await page.locator('#cmForm').isVisible(),'abrir la guardada');};
 const resultados=[];
 for(const width of [390,1280]){
  filas.clear();
  await page.setViewportSize({width,height:844});await page.goto(base+'/gestion-zain.html');await page.locator('#trabajo').waitFor();
  // «+ Cotizar» de Pedidos ya abre la cotización rápida.
  await page.evaluate(()=>document.querySelector('#cotizarRapido').click());await esperar(async()=>await page.locator('#cmCampos:not([disabled])').count()===1,'cargar costos');
  await esperar(async()=>await page.locator('#cmRapida').isVisible(),'abrir la rápida desde + Cotizar');
  const etiqueta=await page.evaluate(()=>document.querySelector('#crCatalogo option')?.value);assert.match(etiqueta,/Gorra 6 paneles · GOR-6P · ZN-GO-001/);
  await fila(0).locator('[data-cr-buscar]').fill(etiqueta);
  await esperar(async()=>await fila(0).locator('[data-cr-cat]').isVisible(),'ligar la prenda');
  assert.equal(await campo(0,'concepto').inputValue(),'Gorra 6 paneles');assert.match(await campo(0,'descripcion').inputValue(),/ · Sin personalización$/);
  assert.equal(await campo(0,'margen').inputValue(),'30');
  assert.equal(await campo(0,'costo').getAttribute('placeholder'),'100.00');assert.equal(await campo(0,'precio').getAttribute('placeholder'),'143.00','100 / 0.70 a peso cerrado');
  await page.waitForFunction(()=>!document.querySelector('#crFilas .cr-fila canvas').hidden);
  await campo(0,'cantidad').fill('10');assert.match(await importe(0),/Importe \$1,430\.00.*utilidad \$430\.00.*Del catálogo: prenda \$100\.00/);
  await campo(0,'tecnica').selectOption('bordado');
  assert.match(await campo(0,'descripcion').inputValue(),/ · Bordado$/,'la descripción propuesta sigue a la técnica');
  assert.equal(await campo(0,'costo').getAttribute('placeholder'),'140.00');assert.equal(await campo(0,'precio').getAttribute('placeholder'),'200.00');
  await campo(0,'cantidad').fill('60');assert.equal(await campo(0,'costo').getAttribute('placeholder'),'120.00','con 60 piezas aplica el tramo de 50 o más');
  await campo(0,'cantidad').fill('10');
  // Todo se puede cambiar: precio y descripción escritos mandan.
  await campo(0,'precio').fill('250');await campo(0,'descripcion').fill('Bordado frontal, color a elegir');
  assert.match(await importe(0),/Importe \$2,500\.00.*utilidad \$1,100\.00/);
  await campo(0,'color').selectOption({index:1});assert.equal(await campo(0,'descripcion').inputValue(),'Bordado frontal, color a elegir','no pisa lo escrito');
  // Una partida a mano en la misma cotización.
  await page.locator('#crAgregar').click();assert.equal(await fila(1).locator('[data-cr-cat]').isHidden(),true);
  await campo(1,'concepto').fill('Termo de acero 500 ml');await campo(1,'cantidad').fill('10');await campo(1,'precio').fill('85');
  assert.match(await page.locator('#crTotales').textContent(),/Total \$3,886\.00/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'sin scroll horizontal');
  if(capturas)await page.locator('#cmRapida').screenshot({path:capturas+'/rapida-catalogo-'+width+'.png'});
  await page.locator('#cmGuardar').click();await esperar(()=>filas.size===1,'guardar');
  const [g]=[...filas.values()],d0=g.datos.modelos[0];
  assert.equal(d0.catalogo.sku,SKU);assert.equal(d0.catalogo.tecnica,'bordado');assert.equal(d0.precio,'250');assert.equal(d0.costo,'');
  assert.equal(g.comercial.partidas[0].precio,25000);assert.equal(g.comercial.partidas[0].descripcion,'Bordado frontal, color a elegir');
  assert.ok(!JSON.stringify(g.comercial).includes('14000')&&!JSON.stringify(g.comercial).includes('GOR-6P'),'sin costo ni código del proveedor en lo comercial');
  // Reabrir: vuelve ligada, con su técnica y el precio escrito.
  await abrirPrimera();
  await esperar(async()=>await page.locator('#crFilas .cr-fila').count()===2&&await fila(0).locator('[data-cr-cat]').isVisible(),'reabrir');
  assert.equal(await fila(0).locator('[data-cr-buscar]').inputValue(),etiqueta);assert.equal(await campo(0,'tecnica').inputValue(),'bordado');assert.equal(await campo(0,'precio').inputValue(),'250');
  // Precio vacío = el del margen; al guardar queda anotado y al reabrir se respeta.
  await campo(0,'precio').fill('');assert.match(await importe(0),/Importe \$2,000\.00/);
  await page.locator('#cmGuardar').click();await esperar(()=>[...filas.values()][0].version===2,'guardar con precio del margen');
  assert.equal([...filas.values()][0].datos.modelos[0].catalogo.precioCotizado,'200.00');
  await page.locator('#cmVolver').click();await page.locator('#cmLista [data-duplicar]').first().waitFor();await page.waitForTimeout(400);await page.locator('#cmLista [data-duplicar]').first().click();
  await esperar(async()=>await page.locator('#cmForm').isVisible()&&await campo(0,'precio').count()&&await campo(0,'precio').inputValue()==='200.00','reabrir (duplicar) con el precio cotizado');
  // PDF con el render del catálogo.
  const [descarga]=await Promise.all([page.waitForEvent('download'),page.locator('#cmPDF').click()]);
  const pdf=fs.readFileSync(await descarga.path());assert.equal(pdf.subarray(0,5).toString(),'%PDF-');assert.ok(pdf.length>30000,'el PDF lleva la imagen de la prenda');
  if(capturas)fs.writeFileSync(capturas+'/rapida-catalogo-'+width+'.pdf',pdf);
  // Desligar: vuelve a ser una partida a mano.
  await campo(0,'desligar').click();assert.equal(await fila(0).locator('[data-cr-cat]').isHidden(),true);assert.equal(await fila(0).locator('[data-cr-buscar]').inputValue(),'');
  // «Cotizar este modelo» desde Catálogo, sin cotización abierta: abre una rápida con la prenda ligada.
  page.once('dialog',dl=>dl.accept());await page.locator('#cmVolver').click();
  await page.evaluate(sku=>dispatchEvent(new CustomEvent('zain:cotizar-modelo',{detail:{sku}})),SKU);
  await esperar(async()=>await page.locator('#cmRapida').isVisible()&&await page.locator('#crFilas .cr-fila').count()===1&&await fila(0).locator('[data-cr-cat]').isVisible(),'cotizar desde Catálogo');
  assert.equal(await campo(0,'concepto').inputValue(),'Gorra 6 paneles');
  resultados.push({width,total:g.comercial.total,pdfBytes:pdf.length});
 }
 assert.deepEqual(errores,[]);assert.ok(red.every(h=>h==='fonts.googleapis.com'||h==='fonts.gstatic.com'),'Solo fuentes externas bloqueadas: '+red.join(','));
 return {resultados,errores,serviciosReales:0};
};
