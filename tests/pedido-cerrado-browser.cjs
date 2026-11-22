// Pedido cerrado (JP, 21-nov-2026): la lista y la ficha marcan en verde claro los pedidos con cierre y «Por cerrar» los
// entregados que todavía no lo tienen. Solo fixtures, sin servicios reales.
module.exports=async function verificarCerrado(page,{base,capturas}={}){
 const assert=require('node:assert/strict'),errores=[];
 page.on('pageerror',e=>errores.push(e.message));
 await page.addInitScript(()=>sessionStorage.setItem('zain-equipo',JSON.stringify({access_token:'sesion-ficticia',refresh_token:'renovacion-ficticia',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id:'12345678-1234-4123-8123-123456789abc',email:'equipo@example.test'}})));
 const fin=(extra={})=>({venta:10000,venta_total:11600,vendido:true,en_negociacion:false,base_estimada:4000,base_real:4000,extras:0,costo:4000,utilidad:6000,provisional:true,...extra});
 const id=n=>'77777777-7777-4777-8777-'+String(n).padStart(12,'0');
 const pedidos=[
  {id:id(1),folio:'ZAIN-FICTICIO-1',cliente:'Escuela Norte',estado:'entregado',total:40,created_at:'2026-11-10T12:00:00Z',resumen:'Playera',finanzas:fin({cerrado_at:'2026-11-20T12:00:00Z',provisional:false})},
  {id:id(2),folio:'ZAIN-FICTICIO-2',cliente:'Escuela Sur',estado:'entregado',total:30,created_at:'2026-11-11T12:00:00Z',resumen:'Polo',finanzas:fin()},
  {id:id(3),folio:'ZAIN-FICTICIO-3',cliente:'Taller Ríos',estado:'produccion',total:20,created_at:'2026-11-12T12:00:00Z',resumen:'Sudadera',finanzas:fin()}];
 const finanzas={version_ventas:1,pedidos:3,cotizados:3,vendidos:3,vendido:34800,venta:30000,cobrado:34800,por_cobrar:0,en_negociacion:0,negociacion_pedidos:0,negociacion_sin_importe:0,cotizaciones_modelos:0,sin_anticipo:0,costo:12000,utilidad:18000,pendientes:0,provisionales:2,por_cobrar_pedidos:[]};
 const detalle=x=>({...x,cliente:{nombre:x.cliente},items:[{nombre:x.resumen,piezas:x.total,tallas:{M:x.total},tecnica:'Bordado'}],archivos:[],guardado_at:x.created_at,notas_internas:'',version:1});
 await page.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url()),op=u.searchParams.get('op');
  if(op){
   const respuestas={config:{activo:true,supabaseUrl:'https://ficticio.invalid',publishableKey:'ficticia'},lista:{pedidos,finanzas,siguiente:false,equipo:{nombre:'Equipo ficticio'}},resumen:{resumen:{activos:3}},historial:{historial:[]},
    detalle:{pedido:detalle(pedidos.find(x=>x.id===u.searchParams.get('id'))||pedidos[0])}};
   await route.fulfill({json:respuestas[op]||{productos:[],tecnicas:[],cotizaciones:[],activo:false}});return;
  }
  if(u.hostname!=='127.0.0.1'&&u.hostname!=='localhost'){await route.fulfill({status:200,body:''});return;}
  await route.continue();
 });
 const resultados=[];
 for(const width of [390,1280]){
  await page.setViewportSize({width,height:width===390?844:800});await page.goto(base+'/gestion-zain.html');
  await page.locator('#lista .pedido-card').first().waitFor();
  const tarjetas=await page.locator('#lista .pedido-card').evaluateAll(l=>l.map(e=>({cerrado:e.classList.contains('pedido-card--cerrado'),chips:[...e.querySelectorAll('.pedido-card__chips .control__estadochip')].map(c=>c.textContent.trim())})));
  assert.deepEqual(tarjetas,[{cerrado:true,chips:['Entregado','✓ Cerrado']},{cerrado:false,chips:['Entregado','Por cerrar']},{cerrado:false,chips:['En producción']}]);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Sin desbordamiento horizontal');
  if(capturas)await page.locator('#lista').screenshot({path:capturas+'/cerrados-'+width+'.png'});
  await page.locator('#lista .pedido-card').first().click();await page.locator('#detalle .control__fichatitulo').waitFor();
  assert.match(await page.locator('#detalle .control__fichatitulo').innerText(),/✓ Cerrado/);
  await page.locator('#cerrarDetalle').click();
  resultados.push({width,tarjetas:tarjetas.map(t=>t.chips.join('+')).join(' | ')});
 }
 assert.deepEqual(errores,[]);
 return resultados;
};
