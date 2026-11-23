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
 // Prenda del catálogo de un proveedor (soloGestion): no viene en config.js; llega con la sesión del equipo en catalogo-publico.
 const baseG=solo.find(p=>p.categoria==='Gorras'),gestion={...structuredClone(baseG),id:'zn-go-901',sku:'ZN-GO-901',nombre:'Gorra del catálogo del proveedor',foto:'',fotosColor:{},coloresSinRender:[],soloGestion:true,colores:['zn-go-901-c01'],activo:false};
 filas.push({...fila(gestion,999),fotoRender:'',soloGestion:true,proveedor:'Dimeo · DKPS',skuProveedor:'PRO-120',paginaProveedor:'Catálogo DKPS p. 12'});
 // Costos ficticios para comparar parecidas: tres playeras básicas de distintos proveedores con tramos distintos.
 const banda=(tallas,costo,desdePiezas,hastaPiezas)=>({tallas,colores:[],costo,...(desdePiezas?{desdePiezas,hastaPiezas}:{})});
 const ficticios={'ZN-PL-012':[banda(['S','M','L','XL'],7622,1,11),banda(['S','M','L','XL'],5326,12,35),banda(['S','M','L','XL'],4806,36,null),banda(['2XL'],9471,1,11),banda(['2XL'],6781,12,null)],
  'ZN-PL-025':[banda(['S','M','L','XL'],5092),banda(['2XL'],6269)],'ZN-PL-013':[banda(['S','M','L','XL'],10990,1,11),banda(['S','M','L','XL'],6923,12,null)]};
 const cfg={...core.inicial(),activo:true,prendas:todos.filter(x=>x.sku).map(x=>ficticios[x.sku]?{sku:x.sku,prenda:null,otros:0,bandas:ficticios[x.sku]}:{sku:x.sku,prenda:x.soloCotizar?null:10000,otros:0}),rangos:[{desde:1,hasta:null,margen:3000}]};
 const porSku=s=>filas.find(r=>r.sku===s);
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
   else if(op==='catalogo-publico'){const {tecnicas,...publico}=C;d={catalogo:{...publico,productosHistoricos:[...publico.productosHistoricos,gestion],colores:[...publico.colores,{id:'zn-go-901-c01',nombre:'Negro',hex:'#111111'}]}};}
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
 const todo=async()=>{for(let i=0;i<80;i++){if(!await page.evaluate(()=>{const c=document.querySelector('#masCatalogo');if(!c||c.hidden)return false;document.querySelector('#masCatalogoBtn').click();return true;}))break;await page.waitForTimeout(20);}};
 // ZAIN_ANCHOS=1180 prueba otros tamaños (por ejemplo el iPad acostado: 1180×760).
 for(const width of (process.env.ZAIN_ANCHOS||'390,1280').split(',').map(Number)){
  ops.length=0;
  await page.setViewportSize({width,height:{390:844,1280:900}[width]||760});await page.goto(base+'/gestion-zain.html');
  if(width<=720)await page.locator('#menuInferior [data-ir="mas"]').click();
  await page.locator('#verCatalogo').click();
  await page.locator('#listaCatalogo .cat-card').first().waitFor();
  await page.waitForFunction(()=>[...document.querySelectorAll('#listaCatalogo .cat-card img')].slice(0,4).every(i=>i.complete&&i.naturalWidth>0));
  assert.match(await page.locator('#estadoCatalogo').innerText(),/solo para cotizar/);
  // La lista se pinta por partes (iPad): primero unas 60 tarjetas y el resto con «Ver más» o al bajar.
  const primeras=await page.locator('#listaCatalogo .cat-card').count();assert.ok(primeras>=Math.min(60,filas.length)&&primeras<filas.length,'primero solo una parte: '+primeras);
  assert.match(await page.locator('#resultadoCatalogo').innerText(),new RegExp('^'+filas.length+' prendas'));
  await todo();assert.equal(await page.locator('#listaCatalogo .cat-card').count(),filas.length,'todas las prendas');
  assert.equal(await page.locator('#masCatalogo').isHidden(),true,'sin «Ver más» al final');
  assert.match(await page.locator('#usoCatalogo [data-uso="cotizar"]').innerText(),new RegExp('Solo cotizar\\s*'+filas.filter(r=>r.soloCotizar).length));
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
  // Parecidas juntas: las playeras básicas de todos los proveedores, la más barata primero para la cantidad elegida.
  await page.locator('#ordenCatalogo').selectOption('parecidas');await page.locator('#piezasCatalogo').selectOption('50');
  await page.locator('#categoriasCatalogo [data-categoria="Playeras"]').click();
  await todo();const grupo=page.locator('.cat-grupo').filter({has:page.locator('h3',{hasText:/^Playera básica de algodón$/})});
  await grupo.waitFor();
  const orden=async()=>grupo.locator('.cat-card').evaluateAll(b=>b.map(x=>x.dataset.ficha));
  assert.equal((await orden())[0],porSku('ZN-PL-012').id,'a 50 piezas la más barata es la de tramos por volumen');
  assert.equal(await grupo.locator('.cat-card').first().locator('.cat-card__costo').innerText(),'$48.06');
  assert.equal(await grupo.locator('.cat-card__barata').count(),1);assert.match(await grupo.locator('.cat-card').first().innerText(),/Más barata/);
  assert.match(await grupo.locator('.cat-grupo__cab p').innerText(),/de \$48\.06 a \$100\.00/);
  assert.equal(await grupo.locator('[data-ficha="'+porSku('ZN-PL-014').id+'"] .cat-card__costo').innerText(),'Sin costo');
  assert.match(await page.locator('#resultadoCatalogo').innerText(),/costo por pieza para 50 piezas/);
  await page.locator('#piezasCatalogo').selectOption('12');await todo();
  assert.equal((await orden())[0],porSku('ZN-PL-025').id,'a 12 piezas la más barata es la de precio único');
  await ancho('parecidas');
  if(capturas){await grupo.scrollIntoViewIfNeeded();await page.waitForTimeout(400);await page.screenshot({path:path.join(capturas,'catalogo-parecidas-'+width+'.png')});}
  // La ficha compara contra las parecidas y deja saltar a la más barata.
  await grupo.locator('[data-ficha="'+porSku('ZN-PL-013').id+'"]').click();await page.locator('#catFicha[open]').waitFor();
  await page.locator('#catFichaParecidas:not([hidden])').waitFor();
  // El cuerpo de la ficha llena el diálogo (en el iPad medía 0 y solo se veían el título y los botones).
  const medidas=await page.locator('#catFicha').evaluate(d=>{const c=d.querySelector('.cat-ficha__cuerpo');return {cuerpo:c.clientHeight,contenido:c.scrollHeight,dialogo:d.clientHeight,alto:innerHeight};});
  assert.ok(medidas.cuerpo>=Math.min(medidas.contenido,medidas.alto*0.5),'la ficha muestra su contenido: '+JSON.stringify(medidas));
  assert.equal(await page.locator('#catFicha .cat-ficha__cuerpo').evaluate(c=>getComputedStyle(c).flexBasis),'auto','base flexible automática para Safari');
  assert.match(await page.locator('#catFichaRanking').innerText(),/costo para 12 piezas · 2 más baratas que esta/);
  assert.match(await page.locator('#catFichaLista [data-par="'+porSku('ZN-PL-025').id+'"]').innerText(),/\$50\.92[\s\S]*\$18\.31 menos/);
  assert.match(await page.locator('#catFichaTramos li.on').innerText(),/12 piezas o más[\s\S]*\$69\.23/);
  await ancho('ficha con parecidas');
  if(capturas){await page.locator('#catFichaParecidas').scrollIntoViewIfNeeded();await page.waitForTimeout(300);await page.screenshot({path:path.join(capturas,'catalogo-ficha-parecidas-'+width+'.png')});}
  await page.locator('#catFichaLista [data-par="'+porSku('ZN-PL-025').id+'"]').click();
  await page.waitForFunction(n=>document.querySelector('#catFichaNombre').textContent===n,porSku('ZN-PL-025').nombre);
  assert.match(await page.locator('#catFichaRanking').innerText(),/esta es la más barata/);
  assert.match(await page.locator('#catFichaTramos').innerText(),/Cualquier cantidad[\s\S]*\$50\.92[\s\S]*hasta \$62\.69 según la talla/);
  await page.locator('#catFichaCerrar').click();
  // La prenda del catálogo del proveedor: sale en Prendas sin render, con su código, y no se puede mostrar en la página.
  await page.locator('#categoriasCatalogo [data-categoria=""]').click();await page.locator('#buscarCatalogo').fill('pro-120');
  const tarjetaG=page.locator('#listaCatalogo [data-ficha="zn-go-901"]');await tarjetaG.waitFor();
  assert.match(await tarjetaG.innerText(),/PRO-120[\s\S]*DIMEO · DKPS|PRO-120[\s\S]*Dimeo · DKPS/i);
  await tarjetaG.click();await page.locator('#catFicha[open]').waitFor();
  assert.match(await page.locator('#catFichaImg').innerText(),/Sin render/);
  assert.equal(await page.locator('#catFichaWeb').isDisabled(),true,'no se puede mostrar en la página');
  assert.match(await page.locator('#catFichaEstado').innerText(),/solo para Gestión/);
  assert.match(await page.locator('#catFichaColores').innerHTML(),/zn-go-901-c01/);
  if(capturas)await page.screenshot({path:path.join(capturas,'catalogo-proveedor-'+width+'.png')});
  await page.locator('#catFichaCerrar').click();await page.locator('#buscarCatalogo').fill('');
  await page.locator('#categoriasCatalogo [data-categoria=""]').click();
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
   // La tabla de Costos se arma al abrir la vista; el filtro llega cuando ya existe.
   await page.waitForFunction(v=>document.querySelector('#buscarCostoPrenda')?.value===v,objetivo.sku);
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
