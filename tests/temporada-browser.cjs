module.exports=async function verificarTemporada(page,{base='http://127.0.0.1:8080',capturas}={}){
 const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
 const raiz=path.resolve(__dirname,'..'),respaldo=JSON.parse(fs.readFileSync(path.join(raiz,'js/catalogo-respaldo.json'),'utf8'));
 const publico=require('../js/config.js'),errores=[],escrituras=[],whatsapps=[];let modo='base';
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>{
  sessionStorage.setItem('zain-intro','1');window.interaccionesTemporada=[];
  let medicion;Object.defineProperty(window,'ZAINMedicion',{configurable:true,get:()=>medicion,set(v){medicion=v;v.temporada=(tipo,id)=>window.interaccionesTemporada.push({tipo,id});}});
 });
 page.on('pageerror',e=>errores.push(e.message));
 await page.context().route('**/*',async route=>{
  const r=route.request(),u=new URL(r.url());if(r.method()!=='GET')escrituras.push(u.pathname);
  if(u.hostname==='wa.me'){whatsapps.push(u.href);await route.fulfill({body:'Prueba aislada; no se envió ningún mensaje.'});return;}
  if(u.searchParams.get('op')==='catalogo-publico'){
   if(modo==='falloapi'){await route.fulfill({status:503,json:{error:'Prueba de respaldo'}});return;}
   const catalogo=structuredClone(respaldo.catalogo);catalogo.posadas=structuredClone(publico.posadas);catalogo.clientesSatisfechos=structuredClone(publico.clientesSatisfechos);
   if(modo==='apagado')catalogo.posadas.activa=false;
   if(modo==='expirado')catalogo.posadas.fin='2025-12-31';
   if(modo==='sinbanner')catalogo.posadas.bannerActivo=false;
   if(modo==='aprobado'){
    Object.assign(catalogo.posadas.paquetes[0],{estado:'aprobado',minimoPaquetes:50,piezasPorPaquete:2,precioPaquete:20000,precioPieza:10000,impuesto:1600,contenido:[{producto:'Gorra',cantidad:1,tecnica:'Bordado',ubicacion:'Frente'},{producto:'Chaleco',cantidad:1,tecnica:'Bordado',ubicacion:'Frente y espalda'}]});
    catalogo.clientesSatisfechos[0]={estado:'aprobado',permisoPublicar:true,permisoEmpresa:false,permisoImagen:true,empresa:'Nombre sin permiso',producto:'Producto ficticio',foto:'img/trabajos/fixture.webp',frase:'Testimonio ficticio para verificar el diseño.'};
   }
   await route.fulfill({json:{catalogo}});return;
  }
  if(u.pathname==='/img/trabajos/fixture.webp'){
   const foto=respaldo.catalogo.productos.find(p=>p.foto&&!/^https/.test(p.foto)).foto;
   await route.fulfill({contentType:'image/webp',body:fs.readFileSync(path.join(raiz,foto))});return;
  }
  if(u.hostname!=='127.0.0.1'&&u.hostname!=='localhost'){await route.fulfill({body:''});return;}
  if(u.pathname.startsWith('/_vercel/')){await route.fulfill({body:''});return;}
  await route.continue();
 });
 const ancho=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Sin desbordamiento horizontal');
 const abrir=async()=>{await page.goto(base+'/index.html');await page.locator('.mini').first().waitFor();};
 const resultados=[];
 for(const width of [390,1280]){
  modo='base';await page.setViewportSize({width,height:width===390?844:800});await abrir();
  await page.locator('#posadaBanner').waitFor();assert.equal(await page.locator('.posada-paquete').count(),2);
  const banner=await page.locator('#posadaBanner').boundingBox(),barra=await page.locator('#barra').boundingBox();assert.ok(barra.y>=banner.y+banner.height-1);
  assert.match(await page.locator('.posada-paquete').first().innerText(),/Por cotizar/);assert.equal(await page.locator('#clientes-satisfechos').isVisible(),false);await ancho();
  if(capturas)await page.screenshot({path:path.join(capturas,'inicio-'+width+'.png')});
  await page.locator('#posadaBannerEnlace').click();await page.locator('#paquetesTitulo').waitFor();
  assert.equal(await page.locator('#paquetesTitulo').evaluate(e=>document.activeElement===e),true);await ancho();
  if(capturas)await page.screenshot({path:path.join(capturas,'paquetes-'+width+'.png')});
  const [popup]=await Promise.all([page.waitForEvent('popup'),page.locator('[data-paquete="gorra-chaleco"]').click()]);await popup.waitForLoadState('domcontentloaded');await popup.close();
  assert.ok(whatsapps.length);assert.match(new URL(whatsapps.at(-1)).searchParams.get('text'),/Gorra \+ chaleco/);
  await page.locator('#cerrarPosada').click();assert.equal(await page.locator('#posadaBanner').isVisible(),false);
  await page.reload();await page.locator('.mini').first().waitFor();assert.equal(await page.locator('#posadaBanner').isVisible(),false);assert.equal(await page.locator('#paquetes').isVisible(),true);
  for(const variante of ['apagado','expirado','sinbanner','aprobado','falloapi']){
   await page.evaluate(()=>sessionStorage.clear());modo=variante;await abrir();
   if(['apagado','expirado'].includes(modo)){assert.equal(await page.locator('#paquetes').isVisible(),false);assert.equal(await page.locator('#posadaBanner').isVisible(),false);}
   if(modo==='sinbanner'){assert.equal(await page.locator('#posadaBanner').isVisible(),false);assert.equal(await page.locator('#paquetes').isVisible(),true);}
   if(modo==='aprobado'){
    const tarjeta=await page.locator('.posada-paquete').first().innerText();assert.match(tarjeta,/50 paquetes/);assert.match(tarjeta,/\$200\.00/);assert.match(tarjeta,/Frente y espalda/);
    assert.equal(await page.locator('#clientes-satisfechos').isVisible(),true);assert.match(await page.locator('#clientes-satisfechos').innerText(),/Cliente ZAIN/);assert.ok(!(await page.locator('#clientes-satisfechos').innerText()).includes('Nombre sin permiso'));
    await page.locator('#clientes-satisfechos').scrollIntoViewIfNeeded();await page.locator('.trabajo-real img').evaluate(e=>e.decode());await ancho();
    if(capturas)await page.screenshot({path:path.join(capturas,'clientes-'+width+'.png')});
   }
   if(modo==='falloapi')assert.equal(await page.locator('#paquetes').isVisible(),true);await ancho();
  }
  await page.evaluate(()=>sessionStorage.clear());resultados.push({ancho:width,pendientes:true,aprobadoConFixture:true,calendario:true,cierrePersistente:true,respaldo:true});
 }
 const eventos=await page.evaluate(()=>window.interaccionesTemporada);assert.ok(eventos.some(e=>e.tipo==='banner_ver'));
 assert.deepEqual(errores,[]);assert.deepEqual(escrituras,[]);return {resultados,errores,escrituras,aperturasWhatsAppInterceptadas:whatsapps.length};
};
