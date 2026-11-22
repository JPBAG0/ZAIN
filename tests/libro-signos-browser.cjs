// Libro de movimientos (JP, 21-nov-2026): en «Todas», un cobro suma (verde, +) y un gasto resta (rojo, −) aunque lo haya
// recibido o pagado un socio de su bolsa; transferencias y reembolsos no suman ni restan. Solo fixtures, sin servicios reales.
module.exports=async function verificarLibro(page,{base,capturas}={}){
 const assert=require('node:assert/strict'),errores=[];
 page.on('pageerror',e=>errores.push(e.message));
 await page.addInitScript(()=>sessionStorage.setItem('zain-equipo',JSON.stringify({access_token:'sesion-ficticia',refresh_token:'renovacion-ficticia',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id:'12345678-1234-4123-8123-123456789abc',email:'equipo@example.test'}})));
 const meses=Array.from({length:12},(_,i)=>({mes:i+1,ventas:0,vendido:0,costo_pedidos:0,utilidad_pedidos:0,pedidos:0,pedidos_sin_costo:0,cotizado:0,en_negociacion:0,negociacion_pedidos:0,negociacion_sin_importe:0,cotizaciones_modelos:0,sin_anticipo:0,por_cobrar:0,entregados:0,gastos_generales:0,ingresos:0,aportaciones:0}));
 const finanzas={version_ventas:1,pedidos:0,cotizados:0,vendidos:0,vendido:0,venta:0,cobrado:0,por_cobrar:0,en_negociacion:0,negociacion_pedidos:0,negociacion_sin_importe:0,cotizaciones_modelos:0,sin_anticipo:0,costo:0,utilidad:0,pendientes:0,provisionales:0,por_cobrar_pedidos:[]};
 const id=n=>'33333333-3333-4333-8333-'+String(n).padStart(12,'0');
 const mov=(n,o)=>({id:id(n),fecha:'2026-11-21',created_at:'2026-11-21T12:00:00Z',iva_recuperable:0,categoria:null,grupo:null,pedido_id:null,folio:null,en_papelera:false,comprobante:null,destino:null,origen_persona:null,...o});
 // Los mismos casos de la captura de JP, con folios ficticios. Importes en centavos.
 const libro=[
  mov(1,{origen:'pago',tipo:'cobro',persona:'juan_pablo',concepto:'Transferencia JP',importe:440000,folio:'ZAIN-FICTICIO-1',efecto_caja:0,efecto_socio:-440000}),
  mov(2,{origen:'pedido',tipo:'gasto',persona:'juan_pablo',concepto:'Camisas',importe:454800,folio:'ZAIN-FICTICIO-1',efecto_caja:0,efecto_socio:454800}),
  mov(3,{origen:'pedido',tipo:'gasto',persona:'garcia',concepto:'Serigrafía 40 playeras',importe:140000,folio:'ZAIN-FICTICIO-2',efecto_caja:0,efecto_socio:140000}),
  mov(4,{origen:'caja',tipo:'transferencia',persona:'garcia',origen_persona:'garcia',destino:'oficina_garcia',concepto:'Pago de factura a Oficina García',importe:310880,efecto_caja:310880,efecto_socio:310880}),
  mov(5,{origen:'pago',tipo:'cobro',persona:'zain',concepto:'Transferencia a la cuenta',importe:176902,folio:'ZAIN-FICTICIO-3',efecto_caja:176902,efecto_socio:0}),
  mov(6,{origen:'pedido',tipo:'gasto',persona:'oficina_garcia',concepto:'Playeras',importe:155440,folio:'ZAIN-FICTICIO-2',efecto_caja:-155440,efecto_socio:0}),
  mov(7,{origen:'pedido',tipo:'reembolso',persona:'garcia',concepto:'Reembolso de flete',importe:11000,folio:'ZAIN-FICTICIO-2',efecto_caja:-11000,efecto_socio:-11000})
 ];
 const caja={caja:165902,cajas:{zain:165902,oficina_jp:0,oficina_garcia:155440},socios:{juan_pablo:14800,garcia:439880},utilidad:{por_repartir:{juan_pablo:0,garcia:0},pedidos_cerrados:0,repartido:{juan_pablo:0,garcia:0},provisional:0},iva_cobrado:0,papelera:0,libro,pedidos:[]};
 await page.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url()),op=u.searchParams.get('op');
  if(op){
   const respuestas={config:{activo:true,supabaseUrl:'https://ficticio.invalid',publishableKey:'ficticia'},lista:{pedidos:[],finanzas,siguiente:false,equipo:{nombre:'Equipo ficticio'}},resumen:{resumen:{activos:0}},
    generales:{anio:2026,dashboard:{version_ventas:1,anio:2026,meses,categorias:[],personas:{},por_cobrar_pedidos:[]},movimientos:[],categorias:{gasto:['Flete'],ingreso:['Venta sin pedido'],reembolso:['Reembolso']}},caja:{caja,categorias:{gasto:['Flete'],ingreso:['Venta sin pedido'],reembolso:['Reembolso']}}};
   await route.fulfill({json:respuestas[op]||{productos:[],tecnicas:[],cotizaciones:[],activo:false}});return;
  }
  if(u.hostname!=='127.0.0.1'&&u.hostname!=='localhost'){await route.fulfill({status:200,body:''});return;}
  await route.continue();
 });
 const montos=()=>page.locator('#cajaLibro .fin-libro-fila > strong').evaluateAll(l=>l.map(e=>[e.textContent.trim(),e.className]));
 const resultados=[];
 for(const width of [390,1280]){
  await page.setViewportSize({width,height:width===390?844:800});await page.goto(base+'/gestion-zain.html');
  // En celular Finanzas está en el menú inferior.
  await page.locator(width===390?'#menuInferior [data-ir="verFinanzas"]':'#verFinanzas').click();await page.locator('#cajaLibro .fin-libro-fila').first().waitFor();
  const todas=await montos();
  assert.deepEqual(todas,[
   ['+$4,400.00','fin-ingreso'],['−$4,548.00','fin-egreso'],['−$1,400.00','fin-egreso'],
   ['$3,108.80','fin-neutro'],['+$1,769.02','fin-ingreso'],['−$1,554.40','fin-egreso'],['$110.00','fin-neutro']]);
  const texto=await page.locator('#cajaLibro').innerText();
  assert.match(texto,/ZAIN le debe a García \$1,400\.00/,'sigue diciendo a quién se le debe');
  assert.equal((texto.match(/Solo mueve dinero entre cuentas/g)||[]).length,2,'la transferencia y el reembolso se explican');
  const total=await page.locator('#cajaTotales').innerText();
  assert.match(total,/Resultado del negocio/);
  // 4,400 + 1,769.02 − 4,548 − 1,400 − 1,554.40 = −1,333.38
  assert.match(total,/−\$1,333\.38/);assert.match(total,/Entradas \$6,169\.02 · Salidas \$7,502\.40/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Sin desbordamiento horizontal');
  if(capturas)await page.locator('#cajaLibro').screenshot({path:capturas+'/libro-todas-'+width+'.png'});
  // Con una cuenta elegida no cambia nada: entradas y salidas de esa cuenta.
  await page.locator('#cajaCuentas [data-cuenta="garcia"]').click();
  assert.deepEqual(await montos(),[['−$1,400.00','fin-egreso'],['−$3,108.80','fin-egreso'],['+$110.00','fin-ingreso']]);
  await page.locator('#cajaCuentas [data-cuenta="zain"]').click();
  assert.deepEqual(await montos(),[['+$1,769.02','fin-ingreso'],['−$110.00','fin-egreso']]);
  resultados.push({width,todas:todas.map(x=>x[0]).join(' ')});
 }
 assert.deepEqual(errores,[]);
 return resultados;
};
