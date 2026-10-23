module.exports=async function verificarCamisa(page,{base,fixture,capturas}={}){
 const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
 const product=fixture.productos.find(p=>p.sku==='ZN-CM-016'),errors=[],writes=[];
 page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(req.method()!=='GET'&&req.method()!=='HEAD'){writes.push({method:req.method(),path:url.pathname});return route.abort();}
  if(url.searchParams.get('op')==='catalogo-publico')return route.fulfill({json:{catalogo:fixture}});
  if(url.searchParams.get('op')==='config')return route.fulfill({json:{activo:false}});
  if(url.origin===base)return route.continue();return route.abort();
 });
 const results=[];
 for(const width of [1280,390]){
  await page.setViewportSize({width,height:width<500?844:900});await page.goto(base+'/index.html');
  await page.locator('[data-id="zn-cm-016"] [data-ver]').click();await page.locator('#hoja [data-personalizar]').click();
  await page.locator('#pieTxt').filter({hasText:'Camisa utilitaria'}).waitFor();
  const logo=await page.evaluate(()=>window.ZR.logoZain('#2145ff').toDataURL('image/png').split(',')[1]);
  await page.locator('#archivo').setInputFiles({name:'logo-zain-prueba.png',mimeType:'image/png',buffer:Buffer.from(logo,'base64')});
  await page.locator('#analisis').waitFor({state:'visible'});
  const samples=[];
  for(let i=0;i<product.colores.length;i++){
   const cid=product.colores[i];await page.locator('#personaliza [data-c="'+cid+'"]').click();
   await page.waitForFunction(async({cid,file})=>{
    if(!document.querySelector('#personaliza [data-c="'+cid+'"]')?.classList.contains('on'))return false;
    const img=await ZR.cargar(file),expected=ZR.tenir(img,null,1000),actual=document.querySelector('#lienzo');
    const a=actual.getContext('2d').getImageData(0,0,1000,1000).data,b=expected.getContext('2d').getImageData(0,0,1000,1000).data;
    let outside=0,inside=0;
    for(let y=0;y<1000;y+=2)for(let x=0;x<1000;x+=2){const k=(y*1000+x)*4;const diff=Math.abs(a[k]-b[k])+Math.abs(a[k+1]-b[k+1])+Math.abs(a[k+2]-b[k+2]);if(diff>4){if(x>=540&&x<=650&&y>=270&&y<=350)inside++;else outside++;}}
    return inside>15&&outside===0;
   },{cid,file:product.fotosColor[cid]},{timeout:12000});
   samples.push({color:fixture.colores.find(c=>c.id===cid).nombre,foto:product.fotosColor[cid],logo_visible:true,prenda_sin_recoloracion:true});
   await page.locator('#lienzo').screenshot({path:path.join(capturas,'camisa-'+width+'-c'+String(i+1).padStart(2,'0')+'.png')});
  }
  await page.locator('#personaliza [data-z="pecho-der"]').click();await page.waitForFunction(()=>document.querySelector('[data-z="pecho-der"]')?.classList.contains('on'));
  await page.locator('#personaliza').screenshot({path:path.join(capturas,'personalizador-'+width+'.png')});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false,'sin desbordamiento');
  await page.getByRole('tab',{name:'Escribir texto',exact:true}).click();await page.locator('#texto').fill('EQUIPO ZAIN');await page.locator('#colorTexto').fill('#ffffff');await page.locator('#texto').dispatchEvent('input');await page.waitForTimeout(250);
  assert.ok((await page.locator('#tamanoTxt').innerText()).includes('cm'));
  results.push({width,colores:samples,logo_archivo_y_texto:true,zonas:product.zonas.map(z=>z.id),desbordamiento:false});
 }
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
 await fs.writeFile(path.join(capturas,'resultado-navegador.json'),JSON.stringify({results,errors,writes},null,2));return {pantallas:results.length,colores_por_pantalla:7,errores:errors,escrituras:writes};
};
