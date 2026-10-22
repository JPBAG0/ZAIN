// Ejecutar con una página Playwright aislada. Solo fixtures, sin servicios reales.
module.exports=async function verificarVentas(page,{base='http://127.0.0.1:8085',capturas}={}){
 const assert=require('node:assert/strict'),errores=[],escrituras=[];
 page.on('pageerror',e=>errores.push(e.message));
 await page.addInitScript(()=>sessionStorage.setItem('zain-equipo',JSON.stringify({access_token:'sesion-ficticia'})));
 const meses=Array.from({length:12},(_,i)=>({mes:i+1,ventas:0,vendido:0,costo_pedidos:0,utilidad_pedidos:0,pedidos:0,pedidos_sin_costo:0,cotizado:0,en_negociacion:0,negociacion_pedidos:0,negociacion_sin_importe:0,cotizaciones_modelos:0,sin_anticipo:0,por_cobrar:0,entregados:0,gastos_generales:0,ingresos:0,aportaciones:0}));
 Object.assign(meses[8],{ventas:10000,vendido:11600,costo_pedidos:4000,utilidad_pedidos:6000,pedidos:1,entregados:1});
 Object.assign(meses[9],{ventas:10000,vendido:11600,costo_pedidos:4000,utilidad_pedidos:6000,pedidos:1,en_negociacion:46400,cotizado:46400,negociacion_pedidos:5,negociacion_sin_importe:1,cotizaciones_modelos:2,sin_anticipo:1,por_cobrar:5800});
 const saldo={id:'11111111-1111-4111-8111-111111111111',folio:'ZAIN-FICTICIO-1',mes:10,venta_total:11600,cobrado:5800,saldo:5800};
 const finanzas={version_ventas:1,pedidos:8,cotizados:7,vendidos:2,vendido:23200,venta:20000,cobrado:17400,por_cobrar:5800,en_negociacion:46400,negociacion_pedidos:5,negociacion_sin_importe:1,cotizaciones_modelos:2,sin_anticipo:1,costo:8000,utilidad:12000,pendientes:0,provisionales:2,por_cobrar_pedidos:[saldo]};
 const dashboard={version_ventas:1,anio:2026,meses,categorias:[],personas:{},por_cobrar_pedidos:[saldo]};
 const pedidos=['nuevo','contactado','cotizado','aceptado','confirmado','produccion','entregado','cancelado'].map((estado,i)=>({id:i?'22222222-2222-4222-8222-'+String(i).padStart(12,'0'):saldo.id,folio:i?'ZAIN-FICTICIO-'+(i+1):saldo.folio,estado,total:12,created_at:'2026-10-22T12:00:00Z',resumen:'Producto ficticio',finanzas:{venta:i===0?null:10000,venta_total:11600,vendido:['confirmado','entregado'].includes(estado),en_negociacion:['nuevo','contactado','cotizado','aceptado'].includes(estado),base_estimada:4000,base_real:0,extras:0,costo:4000,utilidad:6000,provisional:true}}));
 let antiguo=false;
 await page.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url()),op=u.searchParams.get('op');
  if(op){
   if(req.method()!=='GET')escrituras.push(op);
   const respuestas={config:{activo:true,supabaseUrl:'https://ficticio.invalid',publishableKey:'ficticia'},lista:{pedidos,finanzas:antiguo?{cotizados:8,venta:999999999}:finanzas,siguiente:false,equipo:{nombre:'Equipo ficticio'}},resumen:{resumen:{activos:8,solicitudes_semana:8,por_revisar:1,confirmados:1,produccion:1,entregados:1}},generales:{anio:2026,dashboard:antiguo?{anio:2026,meses}:dashboard,movimientos:[],categorias:{gasto:['Flete'],ingreso:['Venta sin pedido'],reembolso:['Reembolso']}}};
   await route.fulfill({json:respuestas[op]||{productos:[],tecnicas:[],cotizaciones:[],activo:false}});return;
  }
  if(u.hostname!=='127.0.0.1'&&u.hostname!=='localhost'){await route.fulfill({status:200,body:''});return;}
  await route.continue();
 });
 const valores=selector=>page.locator(selector+' > div > strong').allTextContents();
 const ancho=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Sin desbordamiento horizontal');
 const resultados=[];
 for(const width of [390,1280]){
  await page.setViewportSize({width,height:width===390?844:800});await page.goto(base+'/gestion-zain.html');
  await page.locator('#resumenFinanciero .bandeja-finanzas').first().waitFor();
  assert.deepEqual((await valores('#resumenFinanciero .bandeja-finanzas')).slice(0,3),['$232.00','$58.00','$464.00']);
  assert.match(await page.locator('#lista').innerText(),/Cotizado sin IVA/);assert.match(await page.locator('#lista').innerText(),/Vendido sin IVA/);
  await page.locator('#resumenFinanciero summary').click();assert.match(await page.locator('#resumenFinanciero table').innerText(),/ZAIN-FICTICIO-1/);await ancho();
  if(capturas)await page.screenshot({path:capturas+'/pedidos-'+width+'.png',fullPage:true});
  await page.locator('#verFinanzas').click();await page.locator('.fin-principales').waitFor();
  assert.deepEqual(await valores('.fin-principales'),['$232.00','$58.00','$464.00']);
  assert.match(await page.locator('.fin-principales').innerText(),/2 cotizaciones por modelo sin cantidades/);
  await page.locator('#finTablero summary').first().click();assert.equal(await page.locator('#finTablero .fin-cobranza tbody tr').count(),1);await ancho();
  if(capturas)await page.screenshot({path:capturas+'/finanzas-'+width+'.png',fullPage:true});
  await page.locator('.fin-periodo [data-mes="9"]').click();assert.deepEqual(await valores('.fin-principales'),['$116.00','$0.00','$0.00']);
  await page.locator('#finTablero .fin-cobranza summary').click();assert.match(await page.locator('#finTablero .fin-cobranza').innerText(),/Sin saldos pendientes/);
  await page.locator('.fin-periodo [data-mes="10"]').click();assert.deepEqual(await valores('.fin-principales'),['$116.00','$58.00','$464.00']);
  await page.locator('.fin-periodo [data-mes="0"]').click();assert.deepEqual(await valores('.fin-principales'),['$232.00','$58.00','$464.00']);await ancho();
  antiguo=true;await page.reload();await page.locator('#verFinanzas').click();await page.locator('#finTablero .cot-alerta').waitFor();
  assert.equal(await page.locator('#finTablero .fin-principales').count(),0);
  await page.locator('#verPedidos').click();assert.match(await page.locator('#resumenFinanciero').innerText(),/Falta aplicar/);antiguo=false;
  resultados.push({ancho:width,tarjetas:true,desglose:true,periodos:true,servidorAnteriorOculto:true});
 }
 assert.deepEqual(errores,[]);assert.deepEqual(escrituras,[]);
 return {resultados,errores,escrituras};
};
