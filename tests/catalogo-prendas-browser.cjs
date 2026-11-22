// Catálogo → Prendas (22-nov-2026): tarjetas con el código del proveedor, filtros por uso y categoría, búsqueda por
// código, ficha con colores (render propio o teñido), catálogo del proveedor en su página, «Cotizar este modelo» y
// «Costos». Solo fixtures; los códigos de proveedor son ficticios salvo que ZAIN_EDICIONES apunte a un archivo local.
module.exports=async function verificarCatalogoPrendas(page,{base,capturas}={}){
 const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{pathToFileURL}=require('node:url');
 const root=path.resolve(__dirname,'..'),{default:C}=await import(pathToFileURL(path.join(root,'js/config.js'))),core=await import(pathToFileURL(path.join(root,'js/cotizacion-core.js')));
 const uid='12345678-1234-4123-8123-123456789abc',errores=[],ops=[];
 const reales=process.env.ZAIN_EDICIONES?new Map(JSON.parse(fs.readFileSync(process.env.ZAIN_EDICIONES,'utf8')).map(e=>[e.id,e])):new Map();
 const todos=[...C.productos,...C.productosHistoricos];
 const solo=todos.filter(p=>p.soloCotizar);assert.ok(solo.length>=90,'las prendas del catálogo mayoreo están en el catálogo');
 // La primera prenda con color propio (no teñible) y la primera playera de solo cotizar.
 const conFoto=solo.find(p=>p.fotosColor&&Object.keys(p.fotosColor).length&&p.colores.length>Object.keys(p.fotosColor).length);
 const fila=(p,i)=>{const e=reales.get(p.id);return {id:p.id,sku:p.sku,skuProveedor:e?.sku_proveedor??(p.soloCotizar?'PR'+(5000+i):''),proveedor:e?.proveedor??(p.soloCotizar?(i%2?'Proveedor ficticio':'Proveedor gorras premium'):''),paginaProveedor:e?.pagina_proveedor??(p.soloCotizar?'p. '+(10+i%20):''),soloCotizar:!!p.soloCotizar,silueta:p.silueta||'',categoria:p.categoria,tecnicas:[...p.tecnicas],activo:p.activo!==false,nombre:p.nombre,descripcion:p.descripcion||'',especificaciones:p.especificaciones||'',tejido:p.tejido||'',composicion:p.composicion||'',gramaje:p.gramaje||null,medidas:'',disponibilidad:'',creadoGestion:false,renderListo:true,fotoRender:p.foto,fotoModelo:'',version:0};};
 const filas=todos.map(fila),objetivo=filas.find(r=>r.sku===conFoto.sku);
 const cfg={...core.inicial(),activo:true,prendas:todos.filter(x=>x.sku).map(x=>({sku:x.sku,prenda:x.soloCotizar?null:10000,otros:0})),rangos:[{desde:1,hasta:null,margen:3000}]};
 const pdf=Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n');
 const archivoCat={id:'88888888-8888-4888-8888-000000000001',proveedor:objetivo.proveedor.replace(/^Proveedor /,''),tipo:'catalogo',titulo:'Catálogo 2026',objeto:'x.pdf',mime:'application/pdf',bytes:1000,nota:'',version:1};
 await page.addInitScript(s=>sessionStorage.setItem('zain-equipo',JSON.stringify(s)),{access_token:'ficticio',refresh_token:'renovacion-ficticia',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id:uid,email:'equipo@example.test'}});
 page.on('pageerror',e=>errores.push(e.message));
 await page.context().route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url()),op=u.searchParams.get('op');
  if(op){
   const b=req.method()==='GET'?{}:req.postDataJSON();ops.push({op,b});let d;
   if(op==='config')d={activo:true,supabaseUrl:'https://fixture.invalid',publishableKey:'ficticia'};
   else if(op==='lista')d={pedidos:[],siguiente:false,equipo:{nombre:'Equipo ficticio'}};
   else if(op==='resumen')d={resumen:{activos:0}};
   else if(op==='catalogo-lista')d={productos:filas,editable:true,opcionesTecnicas:C.tecnicas.map(({id,nombre})=>({id,nombre})),categorias:C.categoriasCatalogo,altas:false,plantillas:[]};
   else if(op==='catalogo-publico'){const {tecnicas,...publico}=C;d={catalogo:publico};}
   else if(op==='precios-config')d={config:{version:1,datos:cfg}};
   else if(op==='proveedores-archivos')d={archivos:[archivoCat]};
   else if(op==='proveedor-archivo-abrir')d={url:'https://fixture.invalid/storage/v1/object/sign/zain-proveedores/x.pdf?token=t',mime:'application/pdf',titulo:archivoCat.titulo,proveedor:archivoCat.proveedor};
   else if(op==='cm-lista')d={cotizaciones:[]};
   else d={ok:true,productos:[],tecnicas:[],chats:[],cotizaciones:[],finanzas:null,clientes:[]};
   return route.fulfill({json:d});
  }
  if(u.hostname==='fixture.invalid'&&u.pathname.includes('/object/sign/'))return route.fulfill({status:200,contentType:'application/pdf',headers:{'Access-Control-Allow-Origin':'*'},body:pdf});
  if(!['127.0.0.1','localhost'].includes(u.hostname))return route.fulfill({status:200,body:''});
  await route.continue();
 });
 const ancho=async donde=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Sin desbordamiento horizontal: '+donde);
 const resultados=[];
 for(const width of [390,1280]){
  ops.length=0;
  await page.setViewportSize({width,height:width===390?844:900});await page.goto(base+'/gestion-zain.html');
  if(width===390)await page.locator('#menuInferior [data-ir="mas"]').click();
  await page.locator('#verCatalogo').click();
  await page.locator('#listaCatalogo .cat-card').first().waitFor();
  await page.waitForFunction(()=>[...document.querySelectorAll('#listaCatalogo .cat-card img')].slice(0,4).every(i=>i.complete&&i.naturalWidth>0));
  assert.match(await page.locator('#estadoCatalogo').innerText(),/solo para cotizar/);
  assert.equal(await page.locator('#listaCatalogo .cat-card').count(),filas.length,'todas las prendas');
  assert.match(await page.locator('#usoCatalogo [data-uso="cotizar"]').innerText(),new RegExp('Solo cotizar\\s*'+solo.length));
  await ancho('lista');
  assert.equal(await page.locator('#provPanel').evaluate(d=>d.open),false,'el panel de proveedores empieza cerrado');
  if(capturas){await page.screenshot({path:path.join(capturas,'catalogo-prendas-'+width+'.png')});await page.locator('#listaCatalogo .cat-card').nth(width===390?0:2).scrollIntoViewIfNeeded();await page.waitForTimeout(400);await page.screenshot({path:path.join(capturas,'catalogo-tarjetas-'+width+'.png')});}
  // Solo cotizar + categoría Gorras.
  await page.locator('#usoCatalogo [data-uso="cotizar"]').click();
  assert.equal(await page.locator('#listaCatalogo .cat-card:not(.cat-card--cotizar)').count(),0,'solo las de cotizar');
  if(capturas){await page.locator('#listaCatalogo .cat-card').first().scrollIntoViewIfNeeded();await page.waitForTimeout(500);await page.screenshot({path:path.join(capturas,'catalogo-solo-'+width+'.png')});}
  await page.locator('#categoriasCatalogo [data-categoria="Gorras"]').click();
  const gorras=filas.filter(r=>r.soloCotizar&&r.categoria==='Gorras').length;assert.equal(await page.locator('#listaCatalogo .cat-card').count(),gorras);
  if(capturas&&width===390)await page.screenshot({path:path.join(capturas,'catalogo-gorras-'+width+'.png')});
  await page.locator('#categoriasCatalogo [data-categoria=""]').click();await page.locator('#usoCatalogo [data-uso=""]').click();
  // Búsqueda por código del proveedor (sin importar espacios ni diagonales).
  await page.locator('#buscarCatalogo').fill(objetivo.skuProveedor.replace(/[\/\s]/g,' ').split(' ')[0].toLowerCase());
  assert.ok(await page.locator('#listaCatalogo [data-ficha="'+objetivo.id+'"]').count()===1,'encuentra la prenda por su código');
  // Ficha.
  await page.locator('#listaCatalogo [data-ficha="'+objetivo.id+'"]').click();
  await page.locator('#catFicha[open]').waitFor();
  assert.equal(await page.locator('#catFichaCodigo').innerText(),objetivo.skuProveedor);
  const conColor=Object.keys(conFoto.fotosColor)[0],tenido=conFoto.colores.find(c=>!conFoto.fotosColor[c]&&!(conFoto.coloresSinRender||[]).includes(c));
  await page.locator('#catFichaColores [data-color="'+conColor+'"]').click();
  await page.waitForFunction(src=>document.querySelector('#catFichaImg img')?.getAttribute('src')===src,conFoto.fotosColor[conColor]);
  if(tenido){await page.locator('#catFichaColores [data-color="'+tenido+'"]').click();await page.locator('#catFichaImg canvas').waitFor();}
  await page.locator('#catFichaCatalogos [data-catalogo]').waitFor();
  assert.match(await page.locator('#catFichaCatalogos').innerText(),new RegExp('p\\. '+objetivo.paginaProveedor.match(/\d+/)[0]));
  await ancho('ficha');
  if(capturas)await page.screenshot({path:path.join(capturas,'catalogo-ficha-'+width+'.png')});
  if(width===1280){
   // El catálogo del proveedor abre en la página de la prenda.
   await page.locator('#catFichaCatalogos [data-catalogo]').click();await page.locator('#provVisorMarco:not([hidden])').waitFor();
   assert.match(await page.locator('#provVisorMarco').getAttribute('src'),new RegExp('^blob:.*#page='+objetivo.paginaProveedor.match(/\d+/)[0]+'$'));
   await page.locator('#provVisorCerrar').click();
   // Costos: cambia de vista y filtra por el SKU.
   await page.locator('#catFichaCostos').click();
   await page.locator('#vistaCostos:not([hidden]) #buscarCostoPrenda').waitFor();
   assert.equal(await page.locator('#buscarCostoPrenda').inputValue(),objetivo.sku);
   assert.equal(await page.locator('[data-fila-prenda]:not([hidden])').count(),1,'solo la fila de esa prenda');
   await page.locator('#catVerPrendas').click();
   await page.locator('#listaCatalogo [data-ficha="'+objetivo.id+'"]').click();await page.locator('#catFicha[open]').waitFor();
  }
  // Cotizar este modelo: abre Cotizaciones con la prenda agregada aunque no esté en la web.
  await page.locator('#catFichaCotizar').click();
  await page.locator('#seccionCotizaciones:not([hidden])').waitFor();
  await page.waitForFunction(n=>document.querySelector('#cmForm:not([hidden])')&&document.body.innerText.includes(n),objetivo.nombre);
  assert.match(await page.locator('#cmModelo option:checked').innerText(),/solo cotizar/);
  await ancho('cotización');
  if(capturas)await page.screenshot({path:path.join(capturas,'catalogo-cotizar-'+width+'.png')});
  resultados.push({width,tarjetas:filas.length,soloCotizar:solo.length,objetivo:objetivo.sku});
 }
 assert.deepEqual(errores,[]);
 return resultados;
};
