// Tarjeta «Por repartir» (JP, 27-nov-2026): al tocarla se abre qué le toca a cada socio de cada pedido cerrado y la
// utilidad de los pedidos aprobados que faltan por cerrar. Solo fixtures, sin servicios reales. Importes en centavos.
module.exports=async function verificarUtilidad(page,{base,capturas}={}){
 const assert=require('node:assert/strict'),errores=[];
 page.on('pageerror',e=>errores.push(e.message));
 await page.addInitScript(()=>sessionStorage.setItem('zain-equipo',JSON.stringify({access_token:'sesion-ficticia',refresh_token:'renovacion-ficticia',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id:'12345678-1234-4123-8123-123456789abc',email:'equipo@example.test'}})));
 const meses=Array.from({length:12},(_,i)=>({mes:i+1,ventas:0,vendido:0,costo_pedidos:0,utilidad_pedidos:0,pedidos:0,pedidos_sin_costo:0,cotizado:0,en_negociacion:0,negociacion_pedidos:0,negociacion_sin_importe:0,cotizaciones_modelos:0,sin_anticipo:0,por_cobrar:0,entregados:0,gastos_generales:0,ingresos:0,aportaciones:0}));
 const finanzas={version_ventas:1,pedidos:0,cotizados:0,vendidos:0,vendido:0,venta:0,cobrado:0,por_cobrar:0,en_negociacion:0,negociacion_pedidos:0,negociacion_sin_importe:0,cotizaciones_modelos:0,sin_anticipo:0,costo:0,utilidad:0,pendientes:0,provisionales:0,por_cobrar_pedidos:[]};
 const id=n=>'44444444-4444-4444-8444-'+String(n).padStart(12,'0');
 // Dos cerrados (50/50 y 70/30), generales −$300 y un reparto de $1,000 a JP: JP 3,800+9,590−150−1,000; García 3,800+4,110−150.
 const detalle={version:1,
  cerrados:[{id:id(1),folio:'ZAIN-FICTICIO-1',cliente:'Taller ficticio',cerrado:'2026-11-20',venta:1160000,costo:400000,utilidad:760000,reparto_bp:5000,juan_pablo:380000,garcia:380000},
   {id:id(2),folio:'ZAIN-FICTICIO-2',cliente:null,cerrado:'2026-11-10',venta:2320000,costo:950000,utilidad:1370000,reparto_bp:7000,juan_pablo:959000,garcia:411000}],
  generales:{ingresos:0,gastos:30000,neto:-30000,movimientos:1,juan_pablo:-15000,garcia:-15000},
  repartos:[{id:id(3),destino:'juan_pablo',importe:100000,concepto:'Reparto noviembre',fecha:'2026-11-21'}],
  por_cerrar:[{id:id(4),folio:'ZAIN-FICTICIO-4',cliente:'Escuela ficticia',estado:'produccion',venta:2000000,cobrado:1000000,por_cobrar:1000000,gastos:1270000,costo_cotizado:800000,costo:1270000,utilidad:730000,reparto_bp:5000,juan_pablo:365000,garcia:365000},
   {id:id(5),folio:'ZAIN-FICTICIO-5',cliente:null,estado:'aceptado',venta:500000,cobrado:0,por_cobrar:500000,gastos:0,costo_cotizado:null,costo:null,utilidad:null,reparto_bp:5000,juan_pablo:null,garcia:null}]};
 const caja={caja:0,cajas:{zain:0,oficina_jp:0,oficina_garcia:0},socios:{juan_pablo:0,garcia:0},
  utilidad:{cerrada:2100000,provisional:730000,pedidos_cerrados:2,toca:{juan_pablo:1324000,garcia:776000},repartido:{juan_pablo:100000,garcia:0},por_repartir:{juan_pablo:1224000,garcia:776000}},iva_cobrado:0,papelera:0,libro:[],pedidos:[]};
 let abierto=null;
 await page.exposeFunction('zainAbrioPedido',v=>{abierto=v;});
 await page.addInitScript(()=>addEventListener('zain:abrir-pedido',e=>window.zainAbrioPedido(e.detail?.id||e.detail)));
 await page.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url()),op=u.searchParams.get('op');
  if(op){
   const respuestas={config:{activo:true,supabaseUrl:'https://ficticio.invalid',publishableKey:'ficticia'},lista:{pedidos:[],finanzas,siguiente:false,equipo:{nombre:'Equipo ficticio'}},resumen:{resumen:{activos:0}},
    generales:{anio:2026,dashboard:{version_ventas:1,anio:2026,meses,categorias:[],personas:{},por_cobrar_pedidos:[]},movimientos:[],categorias:{gasto:['Flete'],ingreso:['Venta sin pedido'],reembolso:['Reembolso']}},
    caja:{caja,detalle,categorias:{gasto:['Flete'],ingreso:['Venta sin pedido'],reembolso:['Reembolso']}}};
   await route.fulfill({json:respuestas[op]||{productos:[],tecnicas:[],cotizaciones:[],activo:false}});return;
  }
  if(u.hostname!=='127.0.0.1'&&u.hostname!=='localhost'){await route.fulfill({status:200,body:''});return;}
  await route.continue();
 });
 const resultados=[];
 for(const width of [390,1280]){
  await page.setViewportSize({width,height:width===390?844:800});await page.goto(base+'/gestion-zain.html');
  await page.locator(width===390?'#menuInferior [data-ir="verFinanzas"]':'#verFinanzas').click();
  const tarjeta=page.locator('#cajaSaldos button[data-tarjeta="utilidad"].fin-kpi-clic');await tarjeta.waitFor();
  assert.match(await tarjeta.innerText(),/\$20,000\.00[\s\S]*JP \$12,240\.00 · García \$7,760\.00/);
  assert.equal(await page.locator('#cajaDesglose').count(),0,'cerrado al cargar');
  assert.match(await page.locator('#cajaSaldos').innerText(),/Utilidad por cerrar: \$7,300\.00 en 2 pedidos aprobados/);
  await tarjeta.click();
  const panel=page.locator('#cajaDesglose');await panel.waitFor();
  assert.equal(await page.locator('#cajaSaldos .fin-kpis [data-tarjeta="utilidad"]').getAttribute('aria-expanded'),'true');
  const t=await panel.innerText();
  assert.match(t,/Le toca \$13,240\.00 · ya se le repartió \$1,000\.00/);assert.match(t,/Le toca \$7,760\.00 · ya se le repartió \$0\.00/);
  assert.match(t,/ZAIN-FICTICIO-1[\s\S]*Taller ficticio[\s\S]*utilidad \$7,600\.00 · 50\/50/);
  assert.match(t,/ZAIN-FICTICIO-2[\s\S]*JP 70% · García 30%/);
  assert.match(t,/Gastos e ingresos generales/);assert.match(t,/Ya repartido a Juan Pablo/);
  const total=await panel.locator('.fin-util-lista').first().locator('.fin-util-total').innerText();
  assert.match(total,/Por repartir hoy[\s\S]*\$12,240\.00[\s\S]*\$7,760\.00/);
  // Por cerrar: lo que falta cobrar, gastos ya registrados, utilidad hasta hoy; el que no tiene costo no se cuenta.
  assert.match(t,/ZAIN-FICTICIO-4[\s\S]*En producción[\s\S]*falta cobrar \$10,000\.00[\s\S]*Gastos registrados \$12,700\.00 · costo cotizado \$8,000\.00 · utilidad hasta hoy \$7,300\.00/);
  assert.match(t,/ZAIN-FICTICIO-5[\s\S]*Aceptado[\s\S]*sin costo cotizado ni gastos: no se cuenta/);
  assert.match(t,/Utilidad por cerrar[\s\S]*falta cobrar \$15,000\.00 · 1 sin costo no se cuenta/);
  assert.match(await panel.locator('.fin-util-futuro').innerText(),/\$15,890\.00[\s\S]*\$11,410\.00/,'por repartir más lo por cerrar');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'sin desbordamiento horizontal');
  if(capturas)await panel.screenshot({path:capturas+'/utilidad-'+width+'.png'});
  // El folio abre el pedido.
  abierto=null;await panel.locator('[data-util-pedido]').first().click();
  for(let i=0;i<20&&!abierto;i++)await page.waitForTimeout(50);
  assert.equal(abierto,id(1));
  // Volver a Finanzas (se cierra la ficha del pedido que se abrió): tocar la tarjeta otra vez lo cierra.
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#ficha')?.open);
  await page.locator(width===390?'#menuInferior [data-ir="verFinanzas"]':'#verFinanzas').click();
  await page.locator('#cajaSaldos .fin-kpis [data-tarjeta="utilidad"]').click();
  assert.equal(await page.locator('#cajaDesglose').count(),0,'se cierra al tocar otra vez');
  resultados.push({width,ok:true});
 }
 assert.deepEqual(errores,[]);
 return resultados;
};
