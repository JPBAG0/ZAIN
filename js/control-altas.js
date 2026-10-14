(() => {
'use strict';
const $=s=>document.querySelector(s),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let categories=[],templates=[],canCreate=false,revision=0,saving=false,pending=false,current=null;
const call=(op,b,extra)=>window.ZAINEquipo.call(op,b,extra);
const field=(name,label,type='text',value='')=>'<label>'+label+'<input name="'+name+'" type="'+type+'" value="'+esc(value)+'"></label>';
$('#recargarCatalogo').insertAdjacentHTML('beforebegin','<div class="control__altasbotones"><button type="button" class="btn btn--linea" id="nuevaCategoria">Nueva categoría</button><button type="button" class="btn btn--azul" id="nuevoProducto">Nuevo producto</button></div>');
document.body.insertAdjacentHTML('beforeend','<dialog id="categoriaNueva" class="control__confirmacion"><form id="formCategoria"><h2>Nueva categoría</h2><p>Aparecerá para clientes cuando tenga productos publicados.</p><label>Nombre<input name="nombre" required maxlength="80" placeholder="Ej. Chalecos"></label><p id="mensajeCategoria" role="status"></p><div class="control__confirmarbotones"><button type="button" class="btn btn--linea" id="cerrarCategoria">Cerrar</button><button class="btn btn--azul">Crear categoría</button></div></form></dialog>'+
 '<dialog id="productoNuevo" class="control__editorcatalogo"><header class="control__fichacab"><span>Nuevo producto</span><button type="button" id="cerrarNuevoProducto" aria-label="Cerrar nuevo producto">✕</button></header><form id="formNuevoProducto"><h2>Amplía tu catálogo.</h2><p>Primero se guarda como borrador. Revisa el render antes de publicarlo.</p><div class="control__camposedicion">'+field('nombre','Nombre comercial')+'<label>Categoría<select name="categoria" id="categoriaProductoNuevo"></select></label>'+field('silueta','Silueta o variante (opcional)')+field('tallas','Tallas separadas por comas (opcional)','text','CH, M, G, XG')+'<label class="control__ancho">Descripción<textarea name="descripcion" maxlength="900" rows="3"></textarea></label><label class="control__ancho">Especificaciones<textarea name="especificaciones" maxlength="2400" rows="3"></textarea></label><fieldset class="control__tecnicaseditor"><legend>Técnicas disponibles</legend><div id="tecnicasNuevoProducto" class="control__elegirtecnicas"><button type="button" data-nueva-tecnica="bordado" aria-pressed="false">Bordado</button><button type="button" data-nueva-tecnica="serigrafia" class="on" aria-pressed="true">Serigrafía</button><button type="button" data-nueva-tecnica="dtf" aria-pressed="false">DTF</button></div></fieldset><fieldset class="control__ancho control__coloresnuevo"><legend>Colores de este modelo</legend><div id="coloresNuevoProducto"></div><button type="button" class="btn-texto" id="agregarColorNuevo">+ Agregar color</button></fieldset>'+field('minimoPiezas','Pedido mínimo','number','1')+field('pasoPiezas','Incrementos de cantidad','number','1')+field('anchoFrente','Ancho aproximado del frente (cm)','number','40')+'<label>Imagen principal<select name="modoRender" id="modoRenderNuevo"><option value="reutilizar">Usar un render existente</option><option value="subir">Subir un render preparado</option><option value="cola_local">Solicitar render a Codex en esta computadora</option></select></label><div class="control__ancho" id="plantillaNuevoCampo"><label>Render existente<select name="plantilla" id="plantillaNuevoProducto"></select></label><img id="vistaPlantillaNueva" class="control__plantilla" alt="Render seleccionado"><p class="control__dato">Elige esta opción si el nuevo modelo tiene el mismo corte. Cambiar el nombre no cambia la silueta.</p></div><div class="control__ancho" id="archivoNuevoCampo" hidden><label id="labelArchivoNuevo">Render preparado<input type="file" id="archivoNuevoProducto" accept="image/jpeg,image/png,image/webp"></label><p id="notaArchivoNuevo" class="control__dato"></p></div><div class="control__internotitulo control__ancho"><h3>Solo para compras del equipo</h3></div>'+field('proveedor','Proveedor')+field('sku_proveedor','SKU proveedor')+'</div><footer class="control__guardar"><p id="mensajeNuevoProducto" role="status"></p><div><button type="button" class="btn btn--linea" id="cancelarNuevoProducto">Cerrar</button><button class="btn btn--azul" id="crearNuevoProducto">Crear borrador</button></div></footer></form></dialog>');
$('#formCatalogo .control__camposedicion').insertAdjacentHTML('afterbegin','<label>Categoría<select name="categoria" id="categoriaEditorProducto"></select></label>');
$('#formCatalogo .control__fotoseditor').insertAdjacentHTML('afterend','<section id="renderNuevoProducto" class="control__rendernuevo" hidden><h3>Preparar imagen principal</h3><p class="control__dato">Puedes subir un render blanco con fondo transparente o mandar una foto a la cola local de Codex. No se publica automáticamente.</p><div class="control__prepararrender"><label class="btn btn--linea">Subir render preparado<input id="subirRenderProducto" type="file" accept="image/png,image/webp"></label><label class="btn btn--linea">Solicitar render desde una foto<input id="solicitarRenderProducto" type="file" accept="image/jpeg,image/png,image/webp"></label><button type="button" class="btn btn--linea" id="estadoRenderProducto">Consultar cola</button></div><p id="mensajeRenderProducto" role="status"></p><div id="revisionRenderProducto"></div></section>');
const form=$('#formNuevoProducto'),dialog=$('#productoNuevo');form.elements.nombre.required=true;form.elements.nombre.maxLength=120;form.elements.proveedor.maxLength=120;form.elements.sku_proveedor.maxLength=120;
for(const name of ['minimoPiezas','pasoPiezas']){form.elements[name].min='1';form.elements[name].max=name==='pasoPiezas'?'1000':'9999';form.elements[name].step='1';}
form.elements.anchoFrente.min='10';form.elements.anchoFrente.max='150';form.elements.anchoFrente.step='.1';
let requestID;
function categoryOptions(value){return categories.map(c=>'<option'+(c===value?' selected':'')+'>'+esc(c)+'</option>').join('');}
function colorRow(name='Blanco',hex='#ffffff'){return '<div class="control__colorfila"><label>Nombre<input data-color-nombre value="'+esc(name)+'" maxlength="50" required></label><label>Tono<input type="color" data-color-hex value="'+esc(hex)+'"></label><button type="button" data-quitar-color aria-label="Quitar color">✕</button></div>';}
function mode(){
 const m=form.elements.modoRender.value;$('#plantillaNuevoCampo').hidden=m!=='reutilizar';$('#archivoNuevoCampo').hidden=m==='reutilizar';
 $('#notaArchivoNuevo').textContent=m==='subir'?'PNG o WEBP con fondo transparente. Una prenda clara conserva mejor sus pliegues al cambiar el color.':'Sube una fotografía nítida del modelo. Codex la procesa desde la computadora usando tus límites de sesión; después debes aprobar el resultado.';
 $('#labelArchivoNuevo').firstChild.textContent=m==='subir'?'Render preparado':'Fotografía de referencia';
}
function templatePreview(){const t=templates.find(t=>t.id===form.elements.plantilla.value);$('#vistaPlantillaNueva').src=t?.foto||'';}
async function prepareImage(file,requireAlpha=false){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024)throw Error('Selecciona JPG, PNG o WEBP de hasta 20 MB.');
 const img=await createImageBitmap(file);try{
  if(img.width*img.height>40000000)throw Error('Usa una imagen de hasta 40 megapíxeles.');
  const check=document.createElement('canvas');check.width=check.height=160;const g=check.getContext('2d');g.drawImage(img,0,0,160,160);
  if(requireAlpha){const data=g.getImageData(0,0,160,160).data;let empty=0;for(let i=3;i<data.length;i+=4)if(data[i]<32)empty++;if(empty<256)throw Error('El render necesita fondo transparente. Para una fotografía usa la cola de Codex.');}
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1600;const scale=Math.min(1600/img.width,1600/img.height);canvas.getContext('2d').drawImage(img,(1600-img.width*scale)/2,(1600-img.height*scale)/2,img.width*scale,img.height*scale);
  const blob=await new Promise(r=>canvas.toBlob(r,'image/webp',.92));if(!blob||blob.type!=='image/webp'||blob.size>4*1024*1024)throw Error('No se pudo preparar la imagen. Prueba una versión más ligera.');return blob;
 }finally{img.close();}
}
async function prepareForProduct(id,file,m,version){
 const blob=await prepareImage(file,m==='subir');const photo=await window.ZAINEquipo.upload(id,blob);
 if(m==='subir')await call('catalogo-render',{id,foto_id:photo.foto_id,version});
 else await call('render-solicitar',{id,foto_id:photo.foto_id,request_id:crypto.randomUUID()});
}
function openNew(){if(!canCreate)return;form.reset();requestID=crypto.randomUUID();$('#mensajeNuevoProducto').textContent='';$('#categoriaProductoNuevo').innerHTML=categoryOptions();$('#plantillaNuevoProducto').innerHTML=templates.map(t=>'<option value="'+esc(t.id)+'">'+esc(t.nombre)+' · '+esc(t.sku)+'</option>').join('');$('#coloresNuevoProducto').innerHTML=colorRow();$('#tecnicasNuevoProducto [data-nueva-tecnica="serigrafia"]').classList.add('on');for(const b of $('#tecnicasNuevoProducto').querySelectorAll('button')){const on=b.dataset.nuevaTecnica==='serigrafia';b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));}mode();templatePreview();dialog.showModal();}
$('#nuevoProducto').addEventListener('click',openNew);$('#nuevaCategoria').addEventListener('click',()=>{if(!canCreate)return;$('#formCategoria').reset();$('#mensajeCategoria').textContent='';$('#categoriaNueva').showModal();});
$('#cerrarCategoria').addEventListener('click',()=>$('#categoriaNueva').close());
for(const id of ['cerrarNuevoProducto','cancelarNuevoProducto'])$('#'+id).addEventListener('click',()=>{if(!saving)dialog.close();});
dialog.addEventListener('cancel',e=>{if(saving)e.preventDefault();});
$('#modoRenderNuevo').addEventListener('change',mode);$('#plantillaNuevoProducto').addEventListener('change',templatePreview);
$('#categoriaProductoNuevo').addEventListener('change',()=>{if(form.elements.categoria.value==='Bolsas'){form.elements.minimoPiezas.value='100';form.elements.pasoPiezas.value='50';}});
$('#tecnicasNuevoProducto').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const on=b.getAttribute('aria-pressed')!=='true';b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));});
$('#agregarColorNuevo').addEventListener('click',()=>{if($('#coloresNuevoProducto').children.length<20)$('#coloresNuevoProducto').insertAdjacentHTML('beforeend',colorRow('','#000000'));});
$('#coloresNuevoProducto').addEventListener('click',e=>{if(e.target.closest('[data-quitar-color]')&&$('#coloresNuevoProducto').children.length>1)e.target.closest('.control__colorfila').remove();});
$('#formCategoria').addEventListener('submit',async e=>{
 e.preventDefault();const turn=revision,button=e.target.querySelector('[type=submit]')||e.target.querySelector('.btn--azul');button.disabled=true;
 try{const data=await call('categoria-crear',{nombre:e.target.elements.nombre.value.trim()});if(turn!==revision)return;await window.ZAINCatalogo.recargar();$('#categoriaProductoNuevo').innerHTML=categoryOptions(data.nombre);$('#categoriaNueva').close();}catch(er){if(turn===revision)$('#mensajeCategoria').textContent=er.message;}finally{button.disabled=false;}
});
form.addEventListener('submit',async e=>{
 e.preventDefault();if(saving)return;const turn=revision,data=Object.fromEntries(new FormData(form)),file=$('#archivoNuevoProducto').files[0];
 data.request_id=requestID;data.tallas=data.tallas.split(',').map(x=>x.trim()).filter(Boolean);data.colores=[...$('#coloresNuevoProducto').children].map(r=>({nombre:r.querySelector('[data-color-nombre]').value.trim(),hex:r.querySelector('[data-color-hex]').value}));data.tecnicas=[...$('#tecnicasNuevoProducto').querySelectorAll('[aria-pressed="true"]')].map(b=>b.dataset.nuevaTecnica);
 for(const n of ['minimoPiezas','pasoPiezas','anchoFrente'])data[n]=Number(data[n]);
 if(data.modoRender!=='reutilizar'&&!file){$('#mensajeNuevoProducto').textContent='Selecciona la imagen del nuevo modelo.';return;}
 if(!data.tecnicas.length){$('#mensajeNuevoProducto').textContent='Selecciona al menos una técnica.';return;}
 saving=true;$('#crearNuevoProducto').disabled=true;$('#mensajeNuevoProducto').textContent='Creando borrador…';let created;
 try{
  if(file)await prepareImage(file,data.modoRender==='subir');
  created=await call('producto-crear',data);if(turn!==revision)return;
  if(data.modoRender!=='reutilizar'){try{await prepareForProduct(created.id,file,data.modoRender,0);}catch(er){if(turn===revision)alert('El borrador '+created.sku+' se guardó. Falta preparar su render: '+er.message);}}
  if(turn!==revision)return;dialog.close();await window.ZAINCatalogo.recargar('Borrador creado. Revisa la imagen y actívalo cuando esté listo.');window.ZAINCatalogo.abrir(created.id);
 }catch(er){if(turn===revision)$('#mensajeNuevoProducto').textContent=er.message;}finally{saving=false;$('#crearNuevoProducto').disabled=false;}
});
async function renderStates(){
 if(!current)return;const p=current,turn=revision;$('#mensajeRenderProducto').textContent='Consultando cola…';
 const data=await call('render-estados',null,{id:p.id});if(turn!==revision||current!==p)return;
 const job=data.solicitudes.find(j=>j.producto_id===p.id);
 const labels={pendiente:'Pendiente de Codex en la computadora',generando:'Codex está preparando el render',revision:'Render listo para revisar',error:'Necesita revisión',cancelado:'Solicitud cancelada'};
 $('#mensajeRenderProducto').textContent=job?(labels[job.estado]||job.estado)+(job.error?' · '+job.error:''):'Todavía no hay una solicitud para este modelo.';
 $('#revisionRenderProducto').innerHTML=job?.estado==='revision'&&job?.url?'<img class="control__plantilla" src="'+esc(job.url)+'" alt="Render generado para revisión"><button type="button" class="btn btn--azul" id="usarRenderGenerado">Usar este render</button>':'';
 if(job?.estado==='revision'&&job?.url)$('#usarRenderGenerado').addEventListener('click',()=>applyGenerated().catch(e=>$('#mensajeRenderProducto').textContent=e.message));
 async function applyGenerated(){if(!window.ZAINCatalogo.puedePreparar()){$('#mensajeRenderProducto').textContent='Guarda los cambios del formulario antes de elegir el render.';return;}await call('catalogo-render',{id:p.id,foto_id:job.resultado_foto,version:p.version});await window.ZAINCatalogo.recargar();window.ZAINCatalogo.abrir(p.id);}

}
$('#estadoRenderProducto').addEventListener('click',()=>renderStates().catch(e=>$('#mensajeRenderProducto').textContent=e.message));
for(const [id,m]of [['subirRenderProducto','subir'],['solicitarRenderProducto','cola_local']])$('#'+id).addEventListener('change',async e=>{
 const file=e.target.files[0],p=current,turn=revision;if(!file||!p||pending)return;
 if(!window.ZAINCatalogo.puedePreparar()){$('#mensajeRenderProducto').textContent='Guarda los datos del producto antes de preparar el render.';e.target.value='';return;}
 pending=true;window.ZAINRenderPendiente=true;$('#mensajeRenderProducto').textContent='Preparando imagen…';
 try{await prepareForProduct(p.id,file,m,p.version);if(turn!==revision)return;await window.ZAINCatalogo.recargar();window.ZAINCatalogo.abrir(p.id);await renderStates();}catch(er){if(turn===revision)$('#mensajeRenderProducto').textContent=er.message;}finally{pending=false;window.ZAINRenderPendiente=false;e.target.value='';}
});
addEventListener('zain:catalogo-listo',e=>{categories=e.detail.categorias||[];templates=e.detail.plantillas||[];canCreate=!!e.detail.altas;$('#nuevoProducto').disabled=!canCreate;$('#nuevaCategoria').disabled=!canCreate;});
addEventListener('zain:producto-editar',e=>{current=e.detail;$('#categoriaEditorProducto').innerHTML=categoryOptions(current.categoria);$('#renderNuevoProducto').hidden=!current.creadoGestion||current.renderBloqueado;$('#mensajeRenderProducto').textContent=current.creadoGestion&&!current.renderListo?'Borrador: todavía falta su render.':'';$('#revisionRenderProducto').replaceChildren();});
addEventListener('zain:equipo-salio',()=>{revision++;current=null;categories=[];templates=[];canCreate=false;dialog.close();$('#categoriaNueva').close();form.reset();$('#revisionRenderProducto').replaceChildren();});
})();