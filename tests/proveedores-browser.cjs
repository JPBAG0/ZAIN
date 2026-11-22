// Catálogos de proveedores (21-nov-2026): Gestión → Catálogo lista los archivos por proveedor; en computadora el PDF
// se abre en un visor dentro de la página, en el celular en una pestaña nueva; subir, cambiar nombre y quitar.
// Solo fixtures, sin servicios reales.
module.exports=async function verificarProveedores(page,{base,capturas}={}){
 const assert=require('node:assert/strict'),path=require('node:path'),errores=[],ops=[];
 page.on('pageerror',e=>errores.push(e.message));
 await page.addInitScript(()=>sessionStorage.setItem('zain-equipo',JSON.stringify({access_token:'sesion-ficticia',refresh_token:'renovacion-ficticia',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id:'12345678-1234-4123-8123-123456789abc',email:'equipo@example.test'}})));
 // PDF mínimo válido de una página para el visor.
 const pdf=Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n');
 const id=n=>'88888888-8888-4888-8888-'+String(n).padStart(12,'0');
 let archivos;const reiniciar=()=>{archivos=[
  {id:id(1),proveedor:'Playerytees',tipo:'catalogo',titulo:'Catálogo 2026',objeto:id(1)+'.pdf',mime:'application/pdf',bytes:15728640,nota:'',version:1},
  {id:id(2),proveedor:'Playerytees',tipo:'precios',titulo:'Lista de precios publicista 2026',objeto:id(2)+'.pdf',mime:'application/pdf',bytes:524288,nota:'',version:1},
  {id:id(3),proveedor:'Dimeo',tipo:'precios',titulo:'Lista de precios vigente',objeto:id(3)+'.xlsx',mime:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',bytes:9332326,nota:'Bajada el 10-nov',version:1},
  {id:id(4),proveedor:'Wusstek',tipo:'catalogo',titulo:'Catálogo 2026',objeto:id(4)+'.pdf',mime:'application/pdf',bytes:9000000,nota:'',version:1}];};
 const firmado=x=>'https://fixture.invalid/storage/v1/object/sign/zain-proveedores/'+x+'?token=t';
 await page.context().route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url()),op=u.searchParams.get('op');
  if(op){
   const b=req.method()==='GET'?{}:req.postDataJSON();ops.push({op,b});let d;
   if(op==='config')d={activo:true,supabaseUrl:'https://fixture.invalid',publishableKey:'ficticia'};
   else if(op==='lista')d={pedidos:[],siguiente:false,equipo:{nombre:'Equipo ficticio'}};
   else if(op==='resumen')d={resumen:{activos:0}};
   else if(op==='proveedores-archivos')d={archivos};
   else if(op==='proveedor-archivo-abrir'){const a=archivos.find(x=>x.id===b.id);d={url:firmado(a.objeto),mime:a.mime,titulo:a.titulo,proveedor:a.proveedor};}
   else if(op==='proveedor-archivo-subida')d={objeto:b.id+'.pdf',url:'https://fixture.invalid/storage/v1/object/upload/sign/zain-proveedores/'+b.id+'.pdf?token=s'};
   else if(op==='proveedor-archivo-guardar'){const a={...b,version:1};delete a.id;archivos=[...archivos,{id:b.id,...a}];d={archivo:a};}
   else if(op==='proveedor-archivo-editar'){const a=archivos.find(x=>x.id===b.id);Object.assign(a,{proveedor:b.proveedor,tipo:b.tipo,titulo:b.titulo,nota:b.nota,version:a.version+1});d={archivo:a};}
   else if(op==='proveedor-archivo-archivar'){archivos=archivos.filter(x=>x.id!==b.id);d={ok:true};}
   else d={ok:true,productos:[],tecnicas:[],cotizaciones:[],categorias:[]};
   return route.fulfill({json:d});
  }
  if(u.hostname==='fixture.invalid'&&u.pathname.includes('/object/sign/'))return route.fulfill({status:200,contentType:'application/pdf',headers:{'Access-Control-Allow-Origin':'*'},body:pdf});
  if(u.hostname==='fixture.invalid'&&u.pathname.includes('/object/upload/sign/')){ops.push({op:'PUT',b:{bytes:req.postDataBuffer()?.length,tipo:req.headers()['content-type']}});return route.fulfill({status:200,headers:{'Access-Control-Allow-Origin':'*'},json:{Key:'ok'}});}
  if(!['127.0.0.1','localhost'].includes(u.hostname))return route.fulfill({status:200,body:''});
  await route.continue();
 });
 const ancho=async donde=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Sin desbordamiento horizontal: '+donde);
 const resultados=[];
 for(const width of [390,1280]){
  reiniciar();ops.length=0;
  await page.setViewportSize({width,height:width===390?844:860});await page.goto(base+'/gestion-zain.html');
  if(width===390)await page.locator('#menuInferior [data-ir="mas"]').click();
  await page.locator('#verCatalogo').click();
  await page.locator('#provLista .prov-proveedor').first().waitFor();
  assert.deepEqual(await page.locator('#provLista .prov-proveedor h3').allTextContents(),['Dimeo','Playerytees','Wusstek'],'proveedores en orden');
  assert.deepEqual(await page.locator('#provLista .prov-proveedor:nth-child(2) .prov-tipo').allTextContents(),['Catálogo','Lista de precios'],'primero el catálogo');
  assert.match(await page.locator('#provCuenta').innerText(),/4 archivos · 3 proveedores/);
  await page.locator('#provBuscar').fill('wuss');assert.equal(await page.locator('#provLista .prov-archivo').count(),1);await page.locator('#provBuscar').fill('');
  await ancho('lista');
  if(capturas)await page.locator('#provPanel').screenshot({path:path.join(capturas,'proveedores-'+width+'.png')});
  const catalogo=page.locator('[data-prov-abrir="'+id(1)+'"]');
  if(width===390){
   // Celular: pestaña nueva con el enlace firmado.
   const [pestana]=await Promise.all([page.context().waitForEvent('page'),catalogo.click()]);
   await pestana.waitForURL(/object\/sign\/zain-proveedores\/88888888/);assert.equal(await page.locator('#provVisor').evaluate(d=>d.open),false);await pestana.close();
  }else{
   // Computadora: visor dentro de Gestión; la segunda vez no se vuelve a pedir el enlace.
   await catalogo.click();await page.locator('#provVisorMarco:not([hidden])').waitFor();
   assert.match(await page.locator('#provVisorMarco').getAttribute('src'),/^blob:/);
   assert.equal(await page.locator('#provVisorTitulo').innerText(),'Catálogo 2026');
   assert.match(await page.locator('#provVisorPestana').getAttribute('href'),/object\/sign\//);
   if(capturas)await page.screenshot({path:path.join(capturas,'proveedores-visor-'+width+'.png')});
   await page.locator('#provVisorCerrar').click();
   const antes=ops.filter(o=>o.op==='proveedor-archivo-abrir').length;
   await catalogo.click();await page.locator('#provVisorMarco:not([hidden])').waitFor();
   assert.equal(ops.filter(o=>o.op==='proveedor-archivo-abrir').length,antes,'el PDF se queda en memoria durante la sesión');
   await page.locator('#provVisorCerrar').click();
   // El Excel se abre en pestaña nueva también en computadora.
   const [hoja]=await Promise.all([page.context().waitForEvent('page'),page.locator('[data-prov-abrir="'+id(3)+'"]').click()]);
   await hoja.waitForURL(/\.xlsx\?token/);await hoja.close();
  }
  // Subir un PDF nuevo.
  await page.locator('#provSubir').click();
  await page.locator('#provForm [name=proveedor]').fill('Yazbek');
  await page.locator('#provForm [name=archivo]').setInputFiles({name:'lista-precios-con-iva-2026.pdf',mimeType:'application/pdf',buffer:pdf});
  assert.equal(await page.locator('#provForm [name=titulo]').inputValue(),'lista precios con iva 2026','el nombre sale del archivo');
  assert.equal(await page.locator('#provForm [name=tipo]').inputValue(),'precios','detecta que es lista de precios');
  await page.locator('#provForm [name=titulo]').fill('Lista de precios con IVA 2026');
  await page.locator('#provForm [type=submit]').click();
  await page.locator('#provForm').waitFor({state:'hidden'});
  const subida=ops.find(o=>o.op==='proveedor-archivo-subida'),put=ops.find(o=>o.op==='PUT'),guardar=ops.find(o=>o.op==='proveedor-archivo-guardar');
  assert.equal(subida.b.bytes,pdf.length);assert.equal(put.b.bytes,pdf.length);assert.equal(put.b.tipo,'application/pdf');
  assert.deepEqual({proveedor:guardar.b.proveedor,tipo:guardar.b.tipo,titulo:guardar.b.titulo,objeto:guardar.b.objeto},{proveedor:'Yazbek',tipo:'precios',titulo:'Lista de precios con IVA 2026',objeto:subida.b.id+'.pdf'});
  assert.ok((await page.locator('#provLista h3').allTextContents()).includes('Yazbek'));
  // Cambiar nombre y quitar (se archiva, no se borra).
  await page.locator('#provEditar').click();
  await page.locator('[data-prov-cambiar="'+id(4)+'"]').click();await page.locator('#provForm [name=titulo]').fill('Catálogo general 2026');await page.locator('#provForm [type=submit]').click();
  await page.locator('#provForm').waitFor({state:'hidden'});assert.equal(ops.find(o=>o.op==='proveedor-archivo-editar').b.titulo,'Catálogo general 2026');
  await page.locator('[data-prov-quitar="'+id(2)+'"]').click();await page.locator('[data-prov-quitar-si="'+id(2)+'"]').click();
  await page.waitForFunction(()=>/se conserva/.test(document.querySelector('#provEstado').textContent));
  assert.equal(await page.locator('[data-prov-abrir="'+id(2)+'"]').count(),0);
  await ancho('después de editar');
  resultados.push({width,ops:[...new Set(ops.map(o=>o.op))].filter(o=>/proveedor|PUT/.test(o)).join(',')});
 }
 assert.deepEqual(errores,[]);
 return resultados;
};
