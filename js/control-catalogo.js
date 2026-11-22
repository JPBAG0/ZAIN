(() => {
'use strict';
// Gestión → Catálogo (v5, 22-nov-2026). JP: «en gestión nos importa el código del proveedor para identificarla más
// rápido… que esté mucho más sencillo ver las prendas». Vista «Prendas»: tarjetas con foto y código del proveedor en
// grande; al tocar, la ficha con colores, catálogo del proveedor en su página, «Cotizar este modelo» y «Mostrar en la
// página web». Vista «Costos»: la tabla de costos por talla de siempre (control-cotizaciones.js).
const $=s=>document.querySelector(s), esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let rows=[],loaded=false,epoch=0,selected=null,dirty=false,photoChange=undefined,busy=false,uploading=false,allowed=false;
let uso='',categoria='',ficha=null,fichaColor=null,fichaTurno=0;
let techniques=window.ZAIN.tecnicas.map(({id,nombre})=>({id,nombre}));
const USO={web:'En la web',cotizar:'Solo cotizar',oculta:'Oculta'};
const ORDEN_CAT=['Playeras','Deportivas','Polos','Camisas','Sudaderas','Chamarras','Chalecos','Pantalones','Infantil','Gorras','Bolsas'];
const usoDe=p=>p.activo?'web':p.soloCotizar?'cotizar':'oculta';
const clave=s=>String(s??'').toLocaleLowerCase('es-MX').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').trim();
const compacto=s=>clave(s).replace(/[^a-z0-9]/g,'');
// «Proveedor gorras premium» → «Gorras premium»; los demás se quedan igual.
const proveedorDe=p=>{const s=String(p.proveedor||'').replace(/^proveedor\s+/i,'').trim();return s?s[0].toLocaleUpperCase('es-MX')+s.slice(1):'';};
const publico=p=>{const Z=window.ZAIN;return [...(Z.productos||[]),...(Z.productosHistoricos||[])].find(x=>x.sku===p.sku)||null;};
const colorDe=id=>(window.ZAIN.colores||[]).find(c=>c.id===id)||null;
const paginaDe=p=>Number(String(p.paginaProveedor||'').match(/\d+/)?.[0])||null;
const cmp=(a,b)=>String(a||'').localeCompare(String(b||''),'es-MX',{numeric:true,sensitivity:'base'});
const status=(s,error=false)=>{$('#estadoCatalogo').textContent=s;$('#estadoCatalogo').classList.toggle('error',error);};
const field=(key,label,type='text',max=300)=>'<label>'+label+'<input name="'+key+'" type="'+type+'" maxlength="'+max+'"></label>';
document.body.insertAdjacentHTML('beforeend','<dialog id="editorCatalogo" class="control__editorcatalogo"><header class="control__fichacab"><span>Editar publicación</span><button type="button" id="cerrarCatalogo" aria-label="Cerrar editor">✕</button></header><form id="formCatalogo"><div class="control__editorcab"><h2 id="tituloCatalogo"></h2><p id="skuCatalogo" class="control__dato"></p><label class="control__publicar"><input name="activo" type="checkbox">Visible para clientes</label></div><div class="control__fotoseditor"><div><img id="renderCatalogo" alt="Render protegido"><b>Render del personalizador</b><small>Se conserva para mantener los colores y el logo.</small></div><div><img id="fotoCatalogo" alt="Foto secundaria del producto"><b>Foto de referencia</b><label class="btn btn--linea control__subirfoto">Cambiar foto<input id="archivoCatalogo" type="file" accept="image/jpeg,image/png,image/webp"></label><button type="button" id="fotoOriginal" class="btn-texto">Usar foto original</button><small>JPG, PNG o WEBP. Guarda para publicar el cambio.</small></div></div><div class="control__camposedicion"><fieldset class="control__tecnicaseditor"><legend>Técnicas disponibles</legend><div id="tecnicasCatalogo" class="control__elegirtecnicas" role="group" aria-label="Técnicas disponibles"></div><p>Selecciona una o varias técnicas que tu equipo pueda producir en este modelo.</p></fieldset>'+field('nombre','Nombre de la familia','text',120)+field('disponibilidad','Aviso de disponibilidad','text',300)+'<label class="control__ancho">Descripción<textarea name="descripcion" maxlength="900" rows="3"></textarea></label><label class="control__ancho">Especificaciones adicionales<textarea name="especificaciones" maxlength="2400" rows="4"></textarea></label>'+field('tejido','Tejido','text',120)+field('gramaje','Gramaje (g/m²)','number')+field('composicion','Composición','text',250)+field('medidas','Medidas','text',300)+'<p class="control__ancho control__dato">La composición se aplica a todos los colores si la cambias. Las tallas, paletas y cantidades mínimas conservan sus valores.</p><div class="control__internotitulo control__ancho"><h3>Para compras · solo equipo ZAIN</h3><p>Estas referencias se guardan en los pedidos nuevos y no se muestran al cliente.</p></div>'+field('proveedor','Proveedor','text',120)+field('sku_proveedor','Código del proveedor','text',120)+field('pagina_proveedor','Página en su catálogo','text',60)+'</div><footer class="control__guardar"><p id="mensajeEditor" role="status" aria-live="polite"></p><div><button type="button" class="btn btn--linea" id="cancelarCatalogo">Cerrar</button><button type="submit" class="btn btn--azul" id="guardarCatalogo">Guardar y publicar</button></div></footer></form></dialog>');
document.body.insertAdjacentHTML('beforeend','<dialog id="catFicha" class="cat-ficha" aria-labelledby="catFichaNombre"><header class="cat-ficha__cab"><div><small id="catFichaCat"></small><h2 id="catFichaNombre"></h2></div><button type="button" id="catFichaCerrar" class="cat-ficha__cerrar" aria-label="Cerrar ficha">✕</button></header><div class="cat-ficha__cuerpo"><div class="cat-ficha__visual"><div id="catFichaImg" class="cat-ficha__img"></div><p id="catFichaColor" class="cat-ficha__colornombre"></p><div id="catFichaColores" class="cat-ficha__colores" role="group" aria-label="Colores"></div></div><div class="cat-ficha__datos"><section class="cat-ficha__prov" aria-label="Proveedor"><small>Código del proveedor</small><div class="cat-ficha__codigo"><b id="catFichaCodigo"></b><button type="button" id="catFichaCopiar" class="btn-texto">Copiar</button></div><p id="catFichaProveedor"></p><div id="catFichaCatalogos" class="cat-ficha__catalogos"></div></section><dl id="catFichaDl" class="cat-ficha__dl"></dl><p id="catFichaDesc" class="cat-ficha__desc"></p><label class="cat-ficha__web"><input type="checkbox" id="catFichaWeb"><span>Mostrar en la página web</span></label><p id="catFichaEstado" class="cat-ficha__estado" role="status" aria-live="polite"></p></div></div><footer class="cat-ficha__acciones"><button type="button" class="btn btn--azul" id="catFichaCotizar">Cotizar este modelo</button><button type="button" class="btn btn--linea" id="catFichaCostos">Costos</button><button type="button" class="btn btn--linea" id="catFichaEditar">Editar datos</button></footer></dialog>');
$('#seccionCatalogo').insertAdjacentHTML('afterbegin','<p id="estadoCatalogo" role="status" class="control__estado"></p>');
const dialog=$('#editorCatalogo'), form=$('#formCatalogo'), fichaDlg=$('#catFicha');
form.elements.gramaje.min='1';form.elements.gramaje.max='2000';form.elements.gramaje.step='1';
function tab(catalogue){$('#seccionPedidos').hidden=catalogue;$('#seccionCatalogo').hidden=!catalogue;for(const [id,on] of [['verCatalogo',catalogue],['verPedidos',!catalogue]]){$('#'+id).classList.toggle('on',on);$('#'+id).setAttribute('aria-pressed',String(on));}if(catalogue){history.replaceState(null,'','#catalogo');if(!loaded)load().catch(error);}else history.replaceState(null,'',location.pathname+location.search);}
function error(e){status(e.message||'No se pudo actualizar el catálogo.',true);if(e.auth)$('#salir').click();}
function vista(v){const costos=v==='costos';$('#vistaPrendas').hidden=costos;$('#vistaCostos').hidden=!costos;for(const [id,on] of [['catVerPrendas',!costos],['catVerCostos',costos]]){$('#'+id).classList.toggle('on',on);$('#'+id).setAttribute('aria-pressed',String(on));}}

// ---------- Vista «Prendas» ----------
function puntos(p,max){
 const ids=publico(p)?.colores||[],ver=ids.slice(0,max).map(colorDe).filter(Boolean);
 return ver.map(c=>'<i style="--c:'+esc(c.hex)+';--c2:'+esc(c.hex2||c.hex)+'"></i>').join('')+(ids.length>max?'<em>+'+(ids.length-max)+'</em>':'');
}
function filtrados(){
 const texto=clave($('#buscarCatalogo').value),codigo=compacto($('#buscarCatalogo').value),prov=$('#proveedorCatalogo').value;
 return rows.filter(p=>(!uso||usoDe(p)===uso)&&(!categoria||p.categoria===categoria)&&(!prov||proveedorDe(p)===prov)&&(!texto||p._busca.includes(texto)||(codigo&&p._codigo.includes(codigo))));
}
function ordenar(lista){
 const o=$('#ordenCatalogo').value,cat=p=>{const i=ORDEN_CAT.indexOf(p.categoria);return i<0?99:i;};
 const porCodigo=(a,b)=>cmp(a.skuProveedor||'~',b.skuProveedor||'~');
 return lista.sort((a,b)=>o==='nombre'?cmp(a.nombre,b.nombre)||cmp(a.sku,b.sku):o==='sku'?cmp(a.sku,b.sku):o==='codigo'?porCodigo(a,b)||cmp(a.nombre,b.nombre):cat(a)-cat(b)||cmp(proveedorDe(a),proveedorDe(b))||porCodigo(a,b)||cmp(a.nombre,b.nombre));
}
function chips(){
 const cuenta=k=>rows.filter(p=>!k||usoDe(p)===k).length;
 $('#usoCatalogo').innerHTML=[['','Todas'],['web',USO.web],['cotizar',USO.cotizar],['oculta','Ocultas']].filter(([k])=>!k||cuenta(k)).map(([k,t])=>'<button type="button" class="cat-chip cat-chip--'+(k||'todas')+(uso===k?' on':'')+'" data-uso="'+k+'" aria-pressed="'+(uso===k)+'">'+esc(t)+' <b>'+cuenta(k)+'</b></button>').join('');
 const base=rows.filter(p=>!uso||usoDe(p)===uso),cats=[...new Set(base.map(p=>p.categoria).filter(Boolean))].sort((a,b)=>{const x=ORDEN_CAT.indexOf(a),y=ORDEN_CAT.indexOf(b);return (x<0?99:x)-(y<0?99:y)||cmp(a,b);});
 if(categoria&&!cats.includes(categoria))categoria='';
 $('#categoriasCatalogo').innerHTML=['',...cats].map(c=>'<button type="button" class="cat-chip'+(categoria===c?' on':'')+'" data-categoria="'+esc(c)+'" aria-pressed="'+(categoria===c)+'">'+esc(c||'Todas')+' <b>'+(c?base.filter(p=>p.categoria===c).length:base.length)+'</b></button>').join('');
}
function paint(){
 chips();
 const visible=ordenar(filtrados());
 $('#resultadoCatalogo').textContent=visible.length===rows.length?rows.length+' prendas':visible.length+' de '+rows.length+' prendas';
 $('#listaCatalogo').innerHTML=visible.map(p=>{const u=usoDe(p);return '<button type="button" class="cat-card cat-card--'+u+'" data-ficha="'+esc(p.id)+'"><span class="cat-card__foto">'+(p.fotoRender?'<img src="'+esc(p.fotoRender)+'" alt="" loading="lazy" decoding="async">':'<span class="cat-card__sinfoto">Sin render</span>')+'<span class="cat-card__uso">'+esc(USO[u])+'</span></span><span class="cat-card__codigo'+(p.skuProveedor?'':' cat-card__codigo--falta')+'">'+esc(p.skuProveedor||'Sin código')+'</span><span class="cat-card__prov">'+esc(proveedorDe(p)||'Sin proveedor')+'</span><span class="cat-card__nombre">'+esc(p.nombre)+'</span><span class="cat-card__colores" aria-hidden="true">'+puntos(p,7)+'</span></button>';}).join('')||'<div class="control__vacio"><h3>No hay prendas con estos filtros</h3><p>Prueba con otro código, nombre o SKU.</p></div>';
}
async function load(message=''){
 const turn=epoch;status('Cargando prendas…');const data=await window.ZAINEquipo.call('catalogo-lista');if(turn!==epoch||$('#trabajo').hidden)return;
 rows=data.productos.map(p=>{const r={...p,tecnicas:p.tecnicas||publico(p)?.tecnicas||['serigrafia']};r._busca=clave([r.nombre,r.sku,r.proveedor,proveedorDe(r),r.skuProveedor,r.categoria,r.silueta].join(' '));r._codigo=compacto(r.skuProveedor)+' '+compacto(r.sku);return r;});
 techniques=data.opcionesTecnicas||techniques;allowed=data.editable;loaded=true;
 const prov=$('#proveedorCatalogo'),antes=prov.value;prov.innerHTML='<option value="">Todos</option>'+[...new Set(rows.map(proveedorDe).filter(Boolean))].sort(cmp).map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join('');prov.value=antes;if(prov.selectedIndex<0)prov.value='';
 paint();dispatchEvent(new CustomEvent('zain:catalogo-listo',{detail:data}));
 if(ficha&&fichaDlg.open&&rows.some(x=>x.id===ficha.id))abrirFicha(ficha.id,fichaColor);
 const n=k=>rows.filter(p=>usoDe(p)===k).length;status(message||n('web')+' en la web · '+n('cotizar')+' solo para cotizar · '+n('oculta')+' ocultas');
}

// ---------- Ficha de la prenda ----------
function mostrarColor(p,cid){
 const pub=publico(p),c=cid?colorDe(cid):null,turno=++fichaTurno,caja=$('#catFichaImg');fichaColor=c?cid:null;
 for(const b of $('#catFichaColores').querySelectorAll('[data-color]')){const on=b.dataset.color===fichaColor;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));}
 const aprox=!!c&&(pub?.coloresSinRender||[]).includes(cid);
 $('#catFichaColor').innerHTML=c?esc(c.nombre)+(aprox?' <small>· color aproximado, falta su render</small>':''):'<small>Toca un color para verlo en la prenda.</small>';
 const propia=c?pub?.fotosColor?.[cid]:null,src=propia||p.fotoRender||pub?.foto||'';
 if(!src){caja.innerHTML='<span class="cat-card__sinfoto">Sin render</span>';return;}
 if(!c||propia||!window.ZR?.tenir){caja.innerHTML='<img src="'+esc(src)+'" alt="'+esc(p.nombre+(c?' · '+c.nombre:''))+'">';return;}
 const img=new Image();if(/^https?:/.test(src))img.crossOrigin='anonymous';
 img.onload=()=>{if(turno!==fichaTurno)return;try{const lienzo=window.ZR.tenir(img,c.hex,800);lienzo.setAttribute('role','img');lienzo.setAttribute('aria-label',p.nombre+' · '+c.nombre);caja.replaceChildren(lienzo);}catch{caja.innerHTML='<img src="'+esc(src)+'" alt="'+esc(p.nombre)+'">';}};
 img.onerror=()=>{if(turno===fichaTurno)caja.innerHTML='<span class="cat-card__sinfoto">No se pudo cargar el render</span>';};
 img.src=src;
}
async function catalogosProveedor(p){
 const caja=$('#catFichaCatalogos'),pagina=paginaDe(p);caja.innerHTML='';
 if(!p.proveedor||!window.ZAINProveedores)return;
 try{
  const lista=await window.ZAINProveedores.catalogosDe(p.proveedor);if(ficha?.id!==p.id)return;
  caja.innerHTML=lista.slice(0,4).map(a=>'<button type="button" class="btn btn--linea cat-ficha__catalogo" data-catalogo="'+esc(a.id)+'">'+esc(lista.length>1?a.titulo:'Ver en su catálogo')+(pagina?' · p. '+pagina:'')+'</button>').join('');
 }catch{caja.innerHTML='';}
}
function abrirFicha(id,colorInicial=null){
 const p=rows.find(x=>x.id===id);if(!p)return;ficha=p;
 const u=usoDe(p),pub=publico(p),ids=pub?.colores||[],aprox=pub?.coloresSinRender||[];
 $('#catFichaCat').textContent=[p.categoria,p.silueta].filter(Boolean).join(' · ');
 $('#catFichaNombre').textContent=p.nombre;
 $('#catFichaCodigo').textContent=p.skuProveedor||'Sin código registrado';$('#catFichaCopiar').hidden=!p.skuProveedor;
 $('#catFichaProveedor').textContent=(proveedorDe(p)||'Proveedor por registrar')+(paginaDe(p)?' · página '+paginaDe(p)+' de su catálogo':'');
 const tec=p.tecnicas.map(t=>techniques.find(x=>x.id===t)?.nombre||t).join(', ');
 const datos=[['Dónde se usa','<span class="cat-uso cat-uso--'+u+'">'+esc(USO[u])+'</span>'],['SKU ZAIN',esc(p.sku)],['Tallas',esc(pub?.tallas?.length?pub.tallas.join(', '):'Unitalla')],['Tela',esc([p.composicion,p.tejido].filter(Boolean).join(' · ')||'Por confirmar')],['Gramaje',p.gramaje?esc(p.gramaje+' g/m²'):''],['Técnicas',esc(tec)],['Colores',ids.length?ids.length+(aprox.length?' · '+aprox.length+' aproximados':''):'']];
 $('#catFichaDl').innerHTML=datos.filter(([,v])=>v).map(([k,v])=>'<div><dt>'+esc(k)+'</dt><dd>'+v+'</dd></div>').join('');
 $('#catFichaDesc').textContent=p.descripcion||'';
 $('#catFichaColores').innerHTML=ids.map(colorDe).filter(Boolean).map(c=>'<button type="button" data-color="'+esc(c.id)+'" style="--c:'+esc(c.hex)+';--c2:'+esc(c.hex2||c.hex)+'" aria-label="'+esc(c.nombre)+'" title="'+esc(c.nombre)+'" aria-pressed="false"'+(aprox.includes(c.id)?' class="aprox"':'')+'></button>').join('');
 const web=$('#catFichaWeb');web.checked=p.activo;web.disabled=!allowed||(p.creadoGestion&&!p.renderListo);
 $('#catFichaEstado').textContent=p.activo?'Los clientes la ven en la página.':p.soloCotizar?'No sale en la página: solo la usa el equipo para cotizar.':'Oculta: no sale en la página ni en el cotizador.';
 const cotizable=p.activo||p.soloCotizar;$('#catFichaCotizar').disabled=!cotizable;$('#catFichaCotizar').title=cotizable?'':'Muéstrala en la página para poder cotizarla.';
 $('#catFichaEditar').disabled=!allowed;
 mostrarColor(p,colorInicial&&ids.includes(colorInicial)?colorInicial:null);
 void catalogosProveedor(p);
 if(!fichaDlg.open)fichaDlg.showModal();
}
async function cambiarWeb(p,activo){
 const web=$('#catFichaWeb'),turn=epoch;
 if(activo&&!confirm('¿Mostrar «'+p.nombre+'» en la página web? Los clientes la podrán ver y pedir.')){web.checked=false;return;}
 web.disabled=true;$('#catFichaEstado').textContent='Guardando…';
 try{await window.ZAINEquipo.call('catalogo-guardar',{id:p.id,version:p.version,cambios:{activo}});if(turn===epoch)await load(activo?'Prenda visible en la página web.':'Prenda oculta en la página web. Se conserva el modelo.');}
 catch(er){if(turn===epoch){web.checked=p.activo;$('#catFichaEstado').textContent=er.message;if(er.auth)error(er);}}
 finally{if(turn===epoch&&ficha)web.disabled=!allowed;}
}
async function verCostos(p){
 vista('costos');
 for(let i=0;i<50&&!$('#buscarCostoPrenda');i++)await new Promise(r=>setTimeout(r,100));
 const b=$('#buscarCostoPrenda'),v=$('#visibilidadCostos');if(!b)return;
 if(v)v.value='';b.value=p.sku;b.dispatchEvent(new Event('input',{bubbles:true}));b.scrollIntoView({block:'center'});
}

// ---------- Editor (igual que antes, más la página del catálogo del proveedor) ----------
function setImage(img,src){img.hidden=!src;img.removeAttribute('src');if(src)img.src=src;}
function open(id){selected=rows.find(p=>p.id===id);if(!selected)return;dirty=false;photoChange=undefined;$('#mensajeEditor').textContent='';$('#tituloCatalogo').textContent=selected.nombre;$('#skuCatalogo').textContent='SKU ZAIN: '+selected.sku+(selected.silueta?' · '+selected.silueta:'');for(const name of ['nombre','descripcion','especificaciones','tejido','composicion','gramaje','medidas','disponibilidad','proveedor'])form.elements[name].value=selected[name]??'';form.elements.sku_proveedor.value=selected.skuProveedor;form.elements.pagina_proveedor.value=selected.paginaProveedor||'';form.elements.activo.checked=selected.activo;$('#archivoCatalogo').value='';setImage($('#renderCatalogo'),selected.fotoRender);setImage($('#fotoCatalogo'),selected.fotoModelo);$('#fotoOriginal').disabled=!selected.fotoModelo;$('#guardarCatalogo').disabled=!allowed;$('#tecnicasCatalogo').innerHTML=techniques.map(t=>'<button type="button" data-tecnica="'+esc(t.id)+'" aria-pressed="'+selected.tecnicas.includes(t.id)+'" class="'+(selected.tecnicas.includes(t.id)?'on':'')+'">'+esc(t.nombre)+'</button>').join('');form.elements.activo.disabled=selected.creadoGestion&&!selected.renderListo;if(!dialog.open)dialog.showModal();dispatchEvent(new CustomEvent('zain:producto-editar',{detail:selected}));}
function close(force=false){if(!force&&(busy||uploading||window.ZAINRenderPendiente)){ $('#mensajeEditor').textContent='Espera a que termine el guardado o la foto.';return;}if(!force&&dirty&&!confirm('¿Cerrar sin guardar los cambios de esta publicación?'))return;dialog.close();selected=null;dirty=false;photoChange=undefined;}
$('#verCatalogo').addEventListener('click',()=>tab(true));$('#verPedidos').addEventListener('click',()=>tab(false));
$('#catVerPrendas').addEventListener('click',()=>vista('prendas'));$('#catVerCostos').addEventListener('click',()=>vista('costos'));
$('#recargarCatalogo').addEventListener('click',()=>load().catch(error));
$('#buscarCatalogo').addEventListener('input',paint);$('#proveedorCatalogo').addEventListener('change',paint);$('#ordenCatalogo').addEventListener('change',paint);
$('#usoCatalogo').addEventListener('click',e=>{const b=e.target.closest('[data-uso]');if(!b)return;uso=b.dataset.uso;paint();});
$('#categoriasCatalogo').addEventListener('click',e=>{const b=e.target.closest('[data-categoria]');if(!b)return;categoria=b.dataset.categoria;paint();});
$('#listaCatalogo').addEventListener('click',e=>{const b=e.target.closest('[data-ficha]');if(b)abrirFicha(b.dataset.ficha);});
$('#catFichaColores').addEventListener('click',e=>{const b=e.target.closest('[data-color]');if(b&&ficha)mostrarColor(ficha,b.dataset.color===fichaColor?null:b.dataset.color);});
$('#catFichaCatalogos').addEventListener('click',e=>{const b=e.target.closest('[data-catalogo]');if(b&&ficha)window.ZAINProveedores?.abrir(b.dataset.catalogo,paginaDe(ficha));});
$('#catFichaCopiar').addEventListener('click',async()=>{if(!ficha?.skuProveedor)return;try{await navigator.clipboard.writeText(ficha.skuProveedor);$('#catFichaCopiar').textContent='Copiado';setTimeout(()=>{$('#catFichaCopiar').textContent='Copiar';},1500);}catch{$('#catFichaEstado').textContent='No se pudo copiar; selecciona el código.';}});
$('#catFichaWeb').addEventListener('change',e=>{if(ficha)void cambiarWeb(ficha,e.target.checked);});
$('#catFichaCotizar').addEventListener('click',()=>{if(!ficha)return;const sku=ficha.sku;fichaDlg.close();dispatchEvent(new CustomEvent('zain:cotizar-modelo',{detail:{sku}}));});
$('#catFichaCostos').addEventListener('click',()=>{if(!ficha)return;const p=ficha;fichaDlg.close();void verCostos(p);});
$('#catFichaEditar').addEventListener('click',()=>{if(!ficha)return;const id=ficha.id;fichaDlg.close();open(id);});
$('#catFichaCerrar').addEventListener('click',()=>fichaDlg.close());
fichaDlg.addEventListener('close',()=>{ficha=null;fichaColor=null;fichaTurno++;});
fichaDlg.addEventListener('click',e=>{if(e.target===fichaDlg)fichaDlg.close();});
for(const id of ['cerrarCatalogo','cancelarCatalogo'])$('#'+id).addEventListener('click',()=>close());
dialog.addEventListener('cancel',e=>{e.preventDefault();close();});dialog.addEventListener('close',()=>{selected=null;dirty=false;photoChange=undefined;});
form.addEventListener('input',e=>{if(!e.target.closest('#renderNuevoProducto'))dirty=true;});
$('#tecnicasCatalogo').addEventListener('click',e=>{const b=e.target.closest('[data-tecnica]');if(!b)return;const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));b.classList.toggle('on',on);dirty=true;});
$('#archivoCatalogo').addEventListener('change',async e=>{
 const file=e.target.files[0],p=selected,turn=epoch;if(!file||!p)return;uploading=true;$('#guardarCatalogo').disabled=true;$('#mensajeEditor').textContent='Preparando foto de referencia…';let bitmap;
 try{
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024)throw Error('Usa una foto JPG, PNG o WEBP de hasta 20 MB.');
  bitmap=await createImageBitmap(file);if(bitmap.width*bitmap.height>40000000)throw Error('La foto es demasiado grande. Usa una versión de hasta 40 megapíxeles.');
  const ratio=Math.min(1,1600/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
  const blob=await new Promise(r=>canvas.toBlob(r,'image/webp',.88));if(!blob||blob.type!=='image/webp'||blob.size>4*1024*1024)throw Error('No se pudo preparar esta foto. Prueba otra imagen.');
  const data=await window.ZAINEquipo.upload(p.id,blob);if(turn!==epoch||selected!==p)return;photoChange=data.foto_id;dirty=true;setImage($('#fotoCatalogo'),data.url);$('#mensajeEditor').textContent='Foto lista. Guarda para publicarla.';$('#fotoOriginal').disabled=false;
 }catch(er){if(turn===epoch&&selected===p){$('#mensajeEditor').textContent=er.message;if(er.auth)error(er);}}finally{bitmap?.close();if(turn===epoch&&selected===p){uploading=false;$('#guardarCatalogo').disabled=!allowed;}}
});
$('#fotoOriginal').addEventListener('click',()=>{photoChange=null;dirty=true;setImage($('#fotoCatalogo'),'');$('#mensajeEditor').textContent='Al guardar se recuperará la foto original del catálogo.';});
form.addEventListener('submit',async e=>{
 e.preventDefault();const p=selected,turn=epoch;if(!p||busy||uploading||!allowed)return;
 const changes={};
 const chosen=[...$('#tecnicasCatalogo').querySelectorAll('[aria-pressed="true"]')].map(b=>b.dataset.tecnica);
 if(!chosen.length){$('#mensajeEditor').textContent='Selecciona al menos una técnica.';return;}
 if(JSON.stringify([...chosen].sort())!==JSON.stringify([...p.tecnicas].sort()))changes.tecnicas=chosen;
 for(const name of ['nombre','descripcion','especificaciones','tejido','composicion','medidas','disponibilidad','proveedor','categoria']){if(!form.elements[name])continue;const value=form.elements[name].value.trim();if(value!==(p[name]??''))changes[name]=value;}
 const supplier=form.elements.sku_proveedor.value.trim();if(supplier!==p.skuProveedor)changes.sku_proveedor=supplier;
 const pagina=form.elements.pagina_proveedor.value.trim();if(pagina!==(p.paginaProveedor||''))changes.pagina_proveedor=pagina;
 const g=form.elements.gramaje.value;if(g!==String(p.gramaje??'')){if(!g){$('#mensajeEditor').textContent='Indica el gramaje o conserva el dato original.';return;}changes.gramaje=Number(g);}
 if(form.elements.activo.checked!==p.activo)changes.activo=form.elements.activo.checked;
 if(photoChange!==undefined)changes.foto_id=photoChange;
 if(!Object.keys(changes).length){$('#mensajeEditor').textContent='No hay cambios por guardar.';return;}
 busy=true;$('#guardarCatalogo').disabled=true;$('#mensajeEditor').textContent='Guardando publicación…';
 try{await window.ZAINEquipo.call('catalogo-guardar',{id:p.id,version:p.version,cambios:changes});if(turn!==epoch)return;dirty=false;close(true);await load('Cambios guardados. Los pedidos anteriores conservan su selección.');}
 catch(er){if(turn===epoch&&selected===p){$('#mensajeEditor').textContent=er.message;if(er.auth)error(er);}}finally{if(turn===epoch){busy=false;$('#guardarCatalogo').disabled=!allowed;}}
});
addEventListener('zain:equipo-listo',()=>{if(location.hash==='#catalogo')tab(true);});
addEventListener('zain:equipo-salio',()=>{epoch++;rows=[];loaded=false;busy=false;uploading=false;allowed=false;close(true);if(fichaDlg.open)fichaDlg.close();$('#listaCatalogo').replaceChildren();status('');$('#buscarCatalogo').value='';uso='';categoria='';vista('prendas');tab(false);});
window.ZAINCatalogo={recargar:load,abrir:open,ficha:abrirFicha,puedePreparar:()=>!dirty&&!busy&&!uploading&&!window.ZAINRenderPendiente};
})();
