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
  const rango=(n,k,c)=>fila(n).locator('[data-escala]').nth(k).locator('[data-e="'+c+'"]'),valores=async(n,c)=>{const out=[];for(let k=0;k<await fila(n).locator('[data-escala]').count();k++)out.push(await rango(n,k,c).inputValue());return out;};
  await fila(0).locator('[data-cr-buscar]').fill(etiqueta);
  await esperar(async()=>await fila(0).locator('[data-cr-cat]').isVisible(),'ligar la prenda');
  assert.equal(await campo(0,'concepto').inputValue(),'Gorra 6 paneles');assert.match(await campo(0,'descripcion').inputValue(),/ · Sin personalización$/);
  assert.equal(await campo(0,'margen').inputValue(),'30');
  // Los rangos del proveedor quedan como campos normales con costo y precio propuestos.
  assert.deepEqual(await valores(0,'desde'),['1','50']);assert.deepEqual(await valores(0,'hasta'),['49','']);
  assert.deepEqual(await valores(0,'costo'),['100.00','80.00']);assert.deepEqual(await valores(0,'precio'),['143.00','115.00']);
  await page.waitForFunction(()=>!document.querySelector('#crFilas .cr-fila canvas').hidden);
  await campo(0,'tecnica').selectOption('bordado');
  assert.match(await campo(0,'descripcion').inputValue(),/ · Bordado$/,'la descripción propuesta sigue a la técnica');
  assert.deepEqual(await valores(0,'costo'),['140.00','120.00']);assert.deepEqual(await valores(0,'precio'),['200.00','172.00']);
  // «Nos cuesta diferente»: el costo escrito manda y el precio sugerido lo sigue; el precio escrito ya no se toca.
  await rango(0,0,'costo').fill('90');assert.equal(await rango(0,0,'precio').inputValue(),'129.00');
  await rango(0,1,'precio').fill('150');
  await campo(0,'margen').fill('40');assert.deepEqual(await valores(0,'precio'),['150.00','150']);assert.deepEqual(await valores(0,'costo'),['90','120.00']);
  assert.match(await fila(0).locator('[data-escala]').nth(0).locator('[data-e-nota]').textContent(),/Utilidad \$60\.00 \/ pza \(40%\)/);
  // Agregar y quitar un rango.
  await campo(0,'agregar-rango').click();assert.equal(await fila(0).locator('[data-escala]').count(),3);
  await rango(0,2,'desde').fill('100');assert.equal(await rango(0,2,'costo').inputValue(),'120.00','el costo propuesto usa las piezas «De» del rango');
  await rango(0,2,'costo').fill('70');assert.equal(await rango(0,2,'precio').inputValue(),'117.00');
  await fila(0).locator('[data-escala]').nth(2).locator('[data-cr=quitar-rango]').click();assert.equal(await fila(0).locator('[data-escala]').count(),2);
  await campo(0,'descripcion').fill('Bordado frontal, color a elegir');await campo(0,'color').selectOption({index:1});assert.equal(await campo(0,'descripcion').inputValue(),'Bordado frontal, color a elegir','no pisa lo escrito');
  assert.match(await importe(0),/el cliente ve los 2 precios por rango/);
  // Una partida escrita a mano: costo y margen sugieren el precio.
  await page.locator('#crAgregar').click();assert.equal(await fila(1).locator('[data-cr-cat]').isHidden(),true);
  await campo(1,'concepto').fill('Termo de acero 500 ml');await rango(1,0,'costo').fill('50');assert.equal(await rango(1,0,'precio').inputValue(),'72.00');
  await campo(1,'cantidad').fill('10');assert.match(await importe(1),/Importe \$720\.00.*utilidad \$220\.00/);
  assert.match(await page.locator('#crTotales').textContent(),/Sin total/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'sin scroll horizontal');
  if(capturas)await page.locator('#cmRapida').screenshot({path:capturas+'/rapida-catalogo-'+width+'.png'});
  await page.locator('#cmGuardar').click();await esperar(()=>filas.size===1,'guardar');
  const [g]=[...filas.values()],d0=g.datos.modelos[0];
  assert.equal(d0.catalogo.sku,SKU);assert.equal(d0.catalogo.tecnica,'bordado');assert.equal(d0.escalas.length,2);
  assert.deepEqual(d0.escalas.map(e=>[e.costo,e.precio,e.autoCosto,e.autoPrecio]),[['90','150.00',false,true],['120.00','150',true,false]]);
  assert.deepEqual(g.comercial.partidas[0].escalas,[{rango:'1 a 49 pzas',precio:15000},{rango:'50 pzas o más',precio:15000}]);
  assert.equal(g.comercial.partidas[1].precio,7200);assert.equal(g.comercial.total,null);
  assert.ok(!JSON.stringify(g.comercial).includes('GOR-6P')&&!JSON.stringify(g.comercial).includes('9000'),'sin costo ni código del proveedor en lo comercial');
  // PDF con el render y los precios por rango.
  const [descarga]=await Promise.all([page.waitForEvent('download'),page.locator('#cmPDF').click()]);
  const pdf=fs.readFileSync(await descarga.path());assert.equal(pdf.subarray(0,5).toString(),'%PDF-');assert.ok(pdf.length>30000,'el PDF lleva la imagen de la prenda');
  if(capturas)fs.writeFileSync(capturas+'/rapida-catalogo-'+width+'.pdf',pdf);
  // Reabrir desde el servidor (Duplicar): mismos precios; lo propuesto se sigue actualizando, lo escrito no.
  await page.locator('#cmVolver').click();await page.locator('#cmLista [data-duplicar]').first().waitFor();await page.waitForTimeout(400);await page.locator('#cmLista [data-duplicar]').first().click();
  await esperar(async()=>await page.locator('#cmForm').isVisible()&&await fila(0).locator('[data-cr-cat]').isVisible(),'reabrir');
  assert.equal(await fila(0).locator('[data-cr-buscar]').inputValue(),etiqueta);assert.deepEqual(await valores(0,'precio'),['150.00','150']);assert.equal(await campo(0,'margen').inputValue(),'40');
  await campo(0,'margen').fill('50');assert.deepEqual(await valores(0,'precio'),['180.00','150']);
  await campo(0,'cantidad').fill('60');assert.match(await importe(0),/Importe \$9,000\.00 \(60 pzas × \$150\.00\)/,'con cantidad aplica el rango de 50 o más');
  await campo(0,'cantidad').fill('');
  // Quitar la prenda del catálogo: los precios se quedan.
  await campo(0,'desligar').click();assert.equal(await fila(0).locator('[data-cr-cat]').isHidden(),true);assert.deepEqual(await valores(0,'precio'),['180.00','150']);
  // «Cotizar este modelo» desde Catálogo, sin cotización abierta: abre una rápida con la prenda ligada.
  page.once('dialog',dl=>dl.accept());await page.locator('#cmVolver').click();
  await page.evaluate(sku=>dispatchEvent(new CustomEvent('zain:cotizar-modelo',{detail:{sku}})),SKU);
  await esperar(async()=>await page.locator('#cmRapida').isVisible()&&await page.locator('#crFilas .cr-fila').count()===1&&await fila(0).locator('[data-cr-cat]').isVisible(),'cotizar desde Catálogo');
  assert.equal(await campo(0,'concepto').inputValue(),'Gorra 6 paneles');assert.deepEqual(await valores(0,'costo'),['100.00','80.00']);
  resultados.push({width,rangos:g.comercial.partidas[0].escalas.length,pdfBytes:pdf.length});
 }
 assert.deepEqual(errores,[]);assert.ok(red.every(h=>h==='fonts.googleapis.com'||h==='fonts.gstatic.com'),'Solo fuentes externas bloqueadas: '+red.join(','));
 return {resultados,errores,serviciosReales:0};
};
