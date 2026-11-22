// Clientes (21-nov-2026): lista, ficha con historial, duplicar un pedido para otro cliente, cambiar el cliente desde la
// ficha del pedido y juntar fichas repetidas. Solo fixtures, sin servicios reales.
module.exports=async function verificarClientes(page,{base,capturas}={}){
 const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
 const root=path.resolve(__dirname,'..'),{default:C}=await import(pathToFileURL(path.join(root,'js/config.js'))),sel=await import(pathToFileURL(path.join(root,'js/cotizacion-selecciones.js'))),core=await import(pathToFileURL(path.join(root,'js/cotizacion-core.js')));
 const p=C.productos.find(x=>x.tallas?.length&&x.activo!==false),uid='12345678-1234-4123-8123-123456789abc',errores=[],operaciones=[];
 const norte='44444444-4444-4444-8444-000000000001',sur='44444444-4444-4444-8444-000000000002',nuevoCliente='44444444-4444-4444-8444-000000000003';
 const idPedido=n=>'55555555-5555-4555-8555-'+String(n).padStart(12,'0');
 const cfg={...core.inicial(),activo:true,prendas:C.productos.filter(x=>x.sku).map(x=>({sku:x.sku,prenda:10000,otros:0})),rangos:[{desde:1,hasta:null,margen:3000}]};
 let pedidos,clientes,creados;
 function iniciar(){
  const item=sel.itemCatalogo(p,C.colores.find(c=>c.id===p.colores[0]),'Solo prenda',p.zonas[0],0,{[p.tallas[0]]:12},12);
  const ped=(n,estado,extra={})=>({id:idPedido(n),folio:'ZAIN-FICTICIO-'+n,estado,version:1,partidas_version:0,items:[item],archivos:[],total:12,created_at:'2026-11-1'+n+'T12:00:00Z',guardado_at:'2026-11-1'+n+'T12:00:00Z',cliente:{nombre:'Escuela Norte'},cliente_id:norte,notas_internas:'',...extra});
  pedidos=[ped(1,'entregado'),ped(2,'cotizado'),ped(3,'cancelado')];creados=[];
  clientes=[{id:norte,numero:1,nombre:'Escuela Norte',empresa:'Colegio del Norte',telefono:'523311112222',correo:'',notas:'Factura a nombre del colegio',version:1,pedidos:3,cerrados:1,cotizaciones:1,vendido:116000,ultima:'2026-11-13'},
   {id:sur,numero:2,nombre:'Escuela Sur',empresa:'',telefono:'',correo:'',notas:'',version:1,pedidos:0,cerrados:0,cotizaciones:0,vendido:0,ultima:'2026-11-01'}];
 }
 const ficha=id=>({cliente:clientes.find(c=>c.id===id),pedidos:pedidos.filter(x=>x.cliente_id===id).map(x=>({id:x.id,folio:x.folio,estado:x.estado,piezas:12,created_at:x.created_at,archivado:false,importe:x.estado==='entregado'?116000:x.estado==='cotizado'?58000:null,cotizado:x.estado!=='cancelado',prendas:p.nombre})),
  cotizaciones:id===norte?[{id:'66666666-6666-4666-8666-000000000001',folio:'COT-FICTICIA',estado:'enviada',tipo:'rapida',modelos:2,desde:null,total:232000,pedido_id:null,updated_at:'2026-11-12T12:00:00Z',version:2}]:[]});
 await page.addInitScript(s=>sessionStorage.setItem('zain-equipo',JSON.stringify(s)),{access_token:'ficticio',refresh_token:'renovacion-ficticia',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id:uid,email:'equipo@example.test'}});
 page.on('pageerror',e=>errores.push(e.message));
 await page.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url()),op=u.searchParams.get('op');
  if(op){
   const b=req.method()==='GET'?{}:req.postDataJSON();let d;
   if(op==='config')d={activo:true,supabaseUrl:'https://fixture.invalid',publishableKey:'ficticia'};
   else if(op==='lista')d={pedidos:pedidos.map(x=>({...x,resumen:p.nombre,selecciones:1})),siguiente:false,equipo:{nombre:'Equipo ficticio'}};
   else if(op==='resumen')d={resumen:{activos:pedidos.length}};
   else if(op==='detalle')d={pedido:pedidos.find(x=>x.id===u.searchParams.get('id'))};
   else if(op==='historial')d={historial:[]};
   // La cotización del pedido duplicado llega como borrador con el precio del original.
   else if(op==='cotizacion'){const x=pedidos.find(y=>y.id===u.searchParams.get('id')),e=core.entrada(core.generar(x.items,cfg));e.impuesto=1600;e.partidas[0].precio=8333;e.destinatario=x.cliente.nombre;d={cotizacion:{version:1,borrador:core.calcular(x.items,e),publicada:null},editable:true};}
   else if(op==='precios-config')d={config:{version:1,datos:cfg}};
   else if(op==='catalogo-publico'){const {tecnicas,...publico}=C;d={catalogo:publico};}
   else if(op==='clientes')d={clientes};
   else if(op==='cliente')d=ficha(u.searchParams.get('id'));
   else if(op==='cliente-guardar'){operaciones.push({op,b});const c={id:nuevoCliente,numero:3,nombre:b.nombre,empresa:'',telefono:'',correo:'',notas:'',version:1,pedidos:0,cerrados:0,cotizaciones:0,vendido:0};clientes=[...clientes,c];d={cliente:c};}
   else if(op==='pedido-duplicar'){operaciones.push({op,b});const o=pedidos.find(x=>x.id===b.origen),c=clientes.find(x=>x.id===b.cliente_id),n={...o,id:b.nuevo,folio:'ZAIN-DUPLICADO',estado:'nuevo',cliente:{nombre:c.nombre},cliente_id:c.id,notas_internas:'Duplicado de '+o.folio+'.'};pedidos=[n,...pedidos];creados.push(n);d={pedido:{id:n.id,folio:n.folio}};}
   else if(op==='cliente-asignar'){operaciones.push({op,b});const x=pedidos.find(y=>y.id===b.pedido_id),c=clientes.find(y=>y.id===b.cliente_id);x.cliente_id=c.id;x.cliente={nombre:c.nombre};d={pedido:{id:x.id,cliente_id:c.id},cliente:{id:c.id,nombre:c.nombre}};}
   else if(op==='cliente-unir'){operaciones.push({op,b});clientes=clientes.filter(c=>c.id!==b.origen);for(const x of pedidos)if(x.cliente_id===b.origen)x.cliente_id=b.destino;d={cliente:{id:b.destino}};}
   else if(op==='cotizacion-seguimiento')d={seguimiento:null};
   else d={ok:true,productos:[],tecnicas:[],chats:[],cotizaciones:[],finanzas:null};
   return route.fulfill({json:d});
  }
  if(!['127.0.0.1','localhost'].includes(u.hostname))return route.fulfill({status:200,body:''});
  await route.continue();
 });
 const ancho=async donde=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Sin desbordamiento horizontal: '+donde);
 const resultados=[];
 for(const width of [390,1280]){
  iniciar();operaciones.length=0;
  await page.setViewportSize({width,height:width===390?844:900});await page.goto(base+'/gestion-zain.html');
  await page.locator('#lista [data-id]').first().waitFor();
  // En celular, Clientes está en «Más».
  if(width===390)await page.locator('#menuInferior [data-ir="mas"]').click();
  await page.locator('#verClientes').click();
  await page.locator('#clLista [data-cliente]').first().waitFor();
  assert.equal(await page.locator('#clLista [data-cliente]').count(),2);
  assert.match(await page.locator('#clLista [data-cliente="'+norte+'"]').innerText(),/3 pedidos · 1 cerrado · 1 cotización/);
  await page.locator('#clBuscar').fill('sur');assert.equal(await page.locator('#clLista [data-cliente]').count(),1);
  await page.locator('#clBuscar').fill('1111');assert.equal(await page.locator('#clLista [data-cliente]').count(),1,'busca por teléfono');
  await page.locator('#clBuscar').fill('');await ancho('lista');
  // Total abajo, casillas, total de los seleccionados y orden por lo vendido (JP, 22-nov).
  assert.match(await page.locator('#clTotal').innerText(),/Total[\s\S]*2 clientes · 3 pedidos \(1 cerrado\) · \$1,160\.00 vendido/);
  assert.equal(await page.locator('#clSel').isHidden(),true);
  await page.locator('#clLista [data-sel="'+norte+'"]').check();
  assert.match(await page.locator('#clSel').innerText(),/Seleccionados: 1 cliente · 3 pedidos \(1 cerrado\) · \$1,160\.00 vendido · 100% de lo vendido/);
  assert.equal(await page.locator('#clSelUnir').isDisabled(),true,'para unir se necesitan dos');
  await page.locator('#clLista [data-sel="'+sur+'"]').check();
  assert.match(await page.locator('#clSel').innerText(),/Seleccionados: 2 clientes/);
  await page.locator('#clOrden').selectOption('vendido');
  assert.equal(await page.locator('#clLista [data-cliente]').first().getAttribute('data-cliente'),norte,'el que más ha comprado va primero');
  assert.equal(await page.locator('#clLista .cl-li.on').count(),2,'la selección se conserva al reordenar');
  await ancho('selección');
  if(capturas)await page.screenshot({path:path.join(capturas,'clientes-seleccion-'+width+'.png')});
  await page.locator('#clSelUnir').click();await page.locator('#clUnir[open]').waitFor();
  assert.equal(await page.locator('#clUnir .cl-opcion').count(),2);
  assert.match(await page.locator('#clUnir .cl-opcion.on').innerText(),/Escuela Norte/,'se queda el que tiene más historial');
  if(capturas)await page.locator('#clUnir').screenshot({path:path.join(capturas,'clientes-unir-'+width+'.png')});
  await page.locator('#clUnir [data-cl-unir-cancelar]').click();
  await page.locator('#clSelQuitar').click();assert.equal(await page.locator('#clSel').isHidden(),true);
  await page.locator('#clOrden').selectOption('reciente');
  if(capturas)await page.screenshot({path:path.join(capturas,'clientes-lista-'+width+'.png'),fullPage:true});
  // Ficha: 1 cerrado, 1 en proceso, 1 no se cerró; vendido con IVA.
  await page.locator('#clLista [data-cliente="'+norte+'"]').click();await page.locator('#clFicha .cl-cifras').waitFor();
  assert.deepEqual(await page.locator('#clFicha .cl-cifra strong').allTextContents(),['1','1','1','$1,160.00']);
  assert.equal(await page.locator('#clFicha .cl-fila').count(),4);
  assert.match(await page.locator('#clFicha').innerText(),/Factura a nombre del colegio/);
  await ancho('ficha');
  if(capturas)await page.screenshot({path:path.join(capturas,'clientes-ficha-'+width+'.png'),fullPage:true});
  // Duplicar el pedido entregado para un cliente nuevo que se crea desde el selector.
  await page.locator('#clFicha [data-duplicar-pedido="'+idPedido(1)+'"]').click();
  const dialogo=page.locator('#clElegir');await dialogo.waitFor();
  assert.match(await dialogo.locator('.cl-opcion.on').innerText(),/Escuela Norte.*\(el mismo\)/s,'el mismo cliente viene elegido');
  await page.locator('#clElegirBuscar').fill('Preparatoria Oriente');
  await dialogo.locator('[data-elegir-nuevo]').click();
  if(capturas)await dialogo.screenshot({path:path.join(capturas,'clientes-duplicar-'+width+'.png')});
  await page.locator('#clElegirOk').click();
  await page.locator('#ficha .ficha-cliente').waitFor();
  assert.deepEqual(operaciones.map(o=>o.op),['cliente-guardar','pedido-duplicar']);
  assert.equal(operaciones[1].b.origen,idPedido(1));assert.equal(operaciones[1].b.cliente_id,nuevoCliente);assert.match(operaciones[1].b.nuevo,/^[0-9a-f-]{36}$/);
  assert.match(await page.locator('#detalle').innerText(),/ZAIN-DUPLICADO/);
  assert.match(await page.locator('#ficha .ficha-cliente').innerText(),/Preparatoria Oriente/);
  await page.locator('#formCotizacion [name="precio-q0"]').waitFor();assert.equal(await page.locator('#formCotizacion [name="precio-q0"]').inputValue(),'83.33','abre en la cotización con el precio del original');
  await ancho('ficha del pedido');
  if(capturas)await page.locator('#ficha').screenshot({path:path.join(capturas,'clientes-pedido-'+width+'.png')});
  // Cambiar el cliente del pedido duplicado a Escuela Sur desde la barra del pedido.
  await page.locator('#ficha [data-cl-cambiar]').click();await dialogo.waitFor();
  await page.locator('#clElegirBuscar').fill('sur');await dialogo.locator('[data-elegir="'+sur+'"]').click();await page.locator('#clElegirOk').click();
  await page.waitForFunction(()=>/Escuela Sur/.test(document.querySelector('#ficha .ficha-cliente')?.textContent||''));
  assert.deepEqual(operaciones.at(-1),{op:'cliente-asignar',b:{pedido_id:creados[0].id,cliente_id:sur}});
  await page.locator('#cerrarDetalle').click();await page.waitForFunction(()=>!document.querySelector('#ficha').open);
  // Juntar la ficha nueva con Escuela Norte.
  await page.locator('#clFicha [data-cl-volver]').click();
  // «Unir con otro cliente…» ya está a la vista en la ficha, sin entrar a «Editar datos».
  await page.locator('#clLista [data-cliente="'+nuevoCliente+'"]').click();
  await page.locator('#clFicha .cl-acciones [data-cl-juntar]').click();await dialogo.waitFor();
  assert.equal(await dialogo.locator('[data-elegir="'+nuevoCliente+'"]').count(),0,'no se ofrece juntar consigo mismo');
  assert.equal(await dialogo.locator('[data-elegir-nuevo]').count(),0);
  await dialogo.locator('[data-elegir="'+norte+'"]').click();await page.locator('#clElegirOk').click();
  await page.waitForFunction(()=>/Escuela Norte/.test(document.querySelector('#clFicha h2')?.textContent||''));
  assert.deepEqual(operaciones.at(-1),{op:'cliente-unir',b:{origen:nuevoCliente,destino:norte}});
  // «+ Cotización rápida» desde la ficha: abre Cotizaciones con el cliente puesto y sus fichas como sugerencias.
  await page.locator('#clFicha [data-cl-cotizar="rapida"]').click();
  await page.waitForFunction(()=>!document.querySelector('#cmForm').hidden&&document.querySelector('#cmDestinatario').value==='Escuela Norte');
  assert.ok(await page.locator('#cmClientes option[value="Escuela Norte"]').count()>=1,'las fichas se sugieren en «Cliente o empresa»');
  await ancho('cotización desde el cliente');
  resultados.push({width,operaciones:operaciones.map(o=>o.op).join(',')});
 }
 assert.deepEqual(errores,[]);
 return resultados;
};
