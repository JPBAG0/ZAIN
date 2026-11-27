import {configurar,decimal,decimalTarifa,pesos,entrada} from './cotizacion-core.js?v=25';
import {esc} from './cotizacion-vista.js?v=16';
import {filasModelo,precioFila,aplicacionArea,comercial,textoComercial} from './cotizacion-modelos.js?v=8';
import {armarPedido} from './cotizacion-modelos-pedido.js?v=4';
import {SERVICIO,NOMBRE_SERVICIO,LIBRE,NOMBRE_LIBRE,productoServicio,productoLibre,filasServicio,dibujarLibre,prepararFoto} from './cotizacion-servicio.js?v=4';
import {comercialRapida,documentoRapida,textosPDF,textoRapida,importeLinea,rangoDe,normalizarTextos,TEXTOS} from './cotizacion-rapida.js?v=2';
import {costoCatalogo,descripcionCatalogo,MEDIDA_INICIAL} from './cotizacion-rapida-catalogo.js?v=1';
const $=s=>document.querySelector(s),nav=$('.control__secciones'),api=(op,body,extra)=>window.ZAINEquipo.call(op,body,extra);
const tecnicas={bordado:'Bordado',serigrafia:'Serigrafía',dtf:'DTF'},numero=n=>n==null?'':(n/100).toFixed(2),nullable=e=>e.value.trim()===''?null:decimal(e.value);
const ESTADOS={borrador:'Borrador',enviada:'Enviada',autorizada:'Autorizada',convertida:'Convertida en pedido',descartada:'Descartada'};
const hoyMX=(dias=0)=>new Date(Date.now()+dias*864e5).toLocaleDateString('en-CA',{timeZone:'America/Mexico_City'});
const fechaCorta=x=>new Date(x).toLocaleDateString('es-MX',{day:'numeric',month:'short',timeZone:'America/Mexico_City'});
// El nombre comercial ya puede traer la silueta («Polo corporativo · Caballero»); no repetirla.
const nombreDe=p=>p.silueta&&!p.nombre.includes(p.silueta)?p.nombre+' · '+p.silueta:p.nombre;
// Identifica una fila aunque cambie su posición al actualizar costos.
const clave=f=>f.talla+'|'+f.color+'|'+f.desde;
let epoca=0,datos=null,catalogo=[],modelos=[],contador=0,logo=null,crudo=null,logoNombre='',cargando=false;
// actual: cotización guardada que se está editando ({id,version,folio,estado,logo}); null si es nueva.
let actual=null,sucio=false,logoArchivo=null,lista=[],guardando=null;
// logoOriginal: archivo del logo tal como lo subió el equipo (nuevo o recuperado); se adjunta al pedido al convertir.
let logoOriginal=null,lineas=[],convirtiendo=false;
// Cotización rápida (JP, 20-nov-2026): partidas escritas a mano con foto opcional, cantidad, precio y descuento.
let modo='modelos',rapidas=[],rapidaId=0;
nav.querySelector('#verPedidos').insertAdjacentHTML('afterend','<button type="button" id="verCotizaciones" aria-pressed="false">Cotizaciones</button>');
$('#trabajo').insertAdjacentHTML('beforeend',`<section id="seccionCotizaciones" class="cm-area" hidden>
<div class="control__titulo"><div><h1>Cotizaciones</h1><p>Cotiza, guarda y pasa a pedido cuando el cliente confirme las cantidades.</p></div><button type="button" id="cmActualizar" class="btn btn--linea">Actualizar modelos y costos</button></div>
<p id="cmEstado" class="control__estado" role="status" aria-live="polite"></p>
<section id="cmGuardadas" class="cot-panel cm-guardadas"><div class="cm-guardadascab"><h2>Guardadas</h2><div class="cm-nuevas"><button type="button" id="cmRapidaNueva" class="btn btn--azul">Cotización rápida</button><button type="button" id="cmNueva" class="btn btn--linea">Por modelo y talla</button></div></div><div class="cm-filtros"><input id="cmFiltro" type="search" placeholder="Buscar folio o cliente" aria-label="Buscar cotización" autocomplete="off"><label class="cot-check"><input id="cmVerDescartadas" type="checkbox">Ver descartadas</label></div><ul id="cmLista" class="cm-lista" aria-live="polite"></ul></section>
<form id="cmForm" hidden><button type="button" id="cmVolver" class="btn-texto">← Volver a cotizaciones</button><fieldset id="cmCampos" disabled>
<div class="cm-actual"><div><small>Cotización</small><b id="cmFolio">Nueva cotización</b></div><div class="cm-actualacciones"><label>Estado<select id="cmEstadoSel" disabled>${Object.entries(ESTADOS).filter(([k])=>k!=='convertida').map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><button type="button" id="cmVerPedido" class="btn btn--linea" hidden>Ver pedido</button></div></div>
<p id="cmConvertida" class="cm-aviso" hidden></p>
<section class="cot-panel"><h2>Cliente y condiciones</h2><div class="cm-campos cm-campos--3"><label>Cliente o empresa (opcional)<input id="cmDestinatario" maxlength="180" autocomplete="off" list="cmClientes" placeholder="Ej. Constructora del Bajío"><datalist id="cmClientes"></datalist></label><label>Precios e IVA<select id="cmIVA"><option value="1600" selected>Más IVA (16%)</option><option value="0">Sin IVA</option></select></label><label id="cmRedondeoCampo">Redondear precios<select id="cmRedondeo"><option value="100" selected>A peso cerrado</option><option value="500">A múltiplos de $5</option><option value="1">Sin redondeo (centavos)</option></select></label><label>Válida hasta<input id="cmVigencia" type="date"></label><label>Entrega (opcional)<input id="cmPlazo" maxlength="120" placeholder="Ej. 10 a 12 días hábiles tras el anticipo"></label><label>Anticipo (%)<input id="cmAnticipo" type="number" min="0" max="100" step="1" inputmode="numeric" value="50" placeholder="Sin anticipo"></label></div></section>
<details id="cmLogoPanel" class="cot-panel cm-opciones"><summary>Logo del cliente (opcional)</summary><div class="cm-logo"><label>Subir logo<input id="cmLogo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label><div><p id="cmLogoEstado" class="cot-ayuda">PNG, JPG, WEBP o SVG · hasta 15 MB. Opcional. Si falta, el pedido queda con logo pendiente.</p><label class="cot-check"><input id="cmQuitarFondo" type="checkbox">Quitar fondo del logo</label><button type="button" id="cmEliminarLogo" class="btn-texto" hidden>Quitar logo</button></div></div></details>
<section id="cmModelosPanel" class="cot-panel"><h2>Modelos y precios</h2><div class="cm-agregar"><label>Buscar<input id="cmBuscar" type="search" placeholder="Polo, gorra, código del proveedor, SKU…" autocomplete="off"></label><label>Modelo<select id="cmModelo"></select></label><button type="button" id="cmAgregar" class="btn btn--azul">Agregar</button></div><div class="cm-sinprenda"><button type="button" id="cmLibre" class="btn btn--linea">+ Fuera de catálogo (artículo libre)</button><span class="cot-ayuda">Lo que no está en el catálogo: escribe el artículo, su costo y su precio.</span></div><div class="cm-sinprenda"><button type="button" id="cmServicio" class="btn btn--linea">+ Sin prenda (solo personalización)</button><span class="cot-ayuda">Cuando el cliente trae sus prendas: cotiza solo la serigrafía, el bordado o el DTF.</span></div><p class="cot-ayuda">El precio se calcula con el margen de tus Costos; puedes cambiar el margen del modelo o escribir el precio de cualquier talla.</p></section>
<div id="cmModelos"></div>
<section id="cmRapida" class="cot-panel cm-rapida" hidden><h2>Partidas</h2><p class="cot-ayuda">Busca la prenda en el catálogo y se llenan la foto, el costo y el precio; o escribe el artículo a mano y sube su foto. Todo se puede cambiar. Sin cantidad, sale el precio por pieza.</p><datalist id="crCatalogo"></datalist><div id="crFilas"></div><button type="button" id="crAgregar" class="btn btn--linea">+ Agregar partida</button><div id="crTotales" class="cr-totales" aria-live="polite"></div>
<details class="cm-opciones cr-textos"><summary>Textos del PDF</summary><div class="cm-campos"><label>Título, primera línea<input id="crTitulo1" maxlength="48"></label><label>Título, segunda línea<input id="crTitulo2" maxlength="48"></label><label>Encabezado de las partidas<input id="crSeccion" maxlength="48"></label><label>Nota junto al encabezado<input id="crEtiqueta" maxlength="60"></label></div><label class="cot-check"><input id="crPasos" type="checkbox" checked>Incluir «Cómo seguimos» (confirmar, anticipo, producción y entrega)</label><label>Notas al pie (una por renglón)<textarea id="crNotasPie" rows="3" maxlength="600"></textarea></label></details></section>
<details class="cot-panel cm-cierre cm-opciones"><summary>Cargo único y notas</summary><div class="cm-campos"><label>Concepto del cargo (opcional)<input id="cmCargoConcepto" maxlength="120" placeholder="Ponchado del logo"></label><label>Cargo único (MXN)<input id="cmCargo" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Sin cargo"></label></div><p class="cot-ayuda">Se cobra una sola vez, aunque el logo vaya en varios modelos.</p><label>Condiciones o notas para el cliente<textarea id="cmNotas" rows="3" maxlength="2000" placeholder="Forma de pago, envío…"></textarea></label><button type="button" id="cmCopiar" class="btn-texto">Copiar cotización como texto</button></details>
<section id="cmConvertir" class="cot-panel cm-convertir" hidden aria-labelledby="cvTitulo"><h2 id="cvTitulo">Pasar a pedido</h2><p class="cot-ayuda">Escribe las piezas que autorizó el cliente. Se crea un pedido normal en Pedidos con los precios de esta cotización; de ahí sigue como cualquier pedido: Mi pedido, anticipo, talleres y finanzas.</p><label>Nombre del cliente o empresa<input id="cvCliente" minlength="2" maxlength="120" autocomplete="off"></label><div id="cvLineas"></div><div id="cvTotal" class="cm-cvtotal" aria-live="polite"></div><label class="cot-check"><input id="cvPublicar" type="checkbox" checked>Publicar la cotización del pedido para que el cliente la vea y la acepte en Mi pedido</label><ul id="cvErrores" class="cm-error"></ul><div class="cm-cvbotones"><button type="button" id="cvCancelar" class="btn btn--linea">Cancelar</button><button type="button" id="cvCrear" class="btn btn--azul" disabled>Crear pedido</button></div><p id="cvEstado" class="cot-ayuda" role="status" aria-live="polite"></p><div id="cvResultado" class="cm-cvok" hidden></div></section>
<div class="cm-exportar"><p id="cmResumen" class="cot-ayuda">Agrega un modelo para empezar.</p><div><button type="button" id="cmGuardar" class="btn btn--linea">Guardar</button><button type="button" id="cmPDF" class="btn btn--linea">Descargar PDF</button><button type="button" id="cmPasar" class="btn btn--azul" hidden>Pasar a pedido</button></div></div>
<p class="cot-ayuda">Guardar conserva la cotización. Descargar PDF prepara el documento del cliente. Pasar a pedido pide las cantidades y conserva los precios acordados.</p>
</fieldset></form></section>`);
const zona=m=>(m.producto.zonas||[]).find(z=>z.id===m.zona);
const color=m=>datos.colores.find(c=>c.id===m.color)||{hex:'#ffffff',nombre:'Por confirmar'};
const maxAncho=m=>{const z=zona(m);return z?Math.floor(z.max*(z.orientativa?1:window.ZAIN.escalaMaxLogo||1.3)*100):20000;};
const redondeo=()=>Number($('#cmRedondeo').value);
function avisar(t){$('#cmEstado').textContent=t;}
function mostrarEditor(valor){$('#cmForm').hidden=!valor;$('#cmGuardadas').hidden=valor;}
function resumen(){
 if(modo==='rapida')return resumenRapida();
 const filas=modelos.flatMap(m=>m.filas.filter(f=>f.incluir)),listas=filas.filter(f=>f.listo).length;
 const estado=actual?actual.folio+(sucio?' · cambios sin guardar':' · guardada'):sucio&&modelos.length?'Sin guardar':'';
 $('#cmResumen').textContent=[estado,!modelos.length?'Agrega un modelo para empezar.':modelos.length+(modelos.length===1?' modelo':' modelos')+' · '+listas+' de '+filas.length+(filas.length===1?' precio listo':' precios listos')].filter(Boolean).join(' · ');
 $('#cmResumen').classList.toggle('cm-pendiente',sucio&&modelos.length>0);
 $('#cmPasar').hidden=!modelos.length||['convertida','descartada'].includes(actual?.estado);
}
function resumenRapida(){
 const estado=actual?actual.folio+(sucio?' · cambios sin guardar':' · guardada'):sucio&&rapidas.length?'Sin guardar':'';let total=null;try{total=proyeccionRapida().total;}catch{}
 $('#cmResumen').textContent=[estado,!rapidas.length?'Agrega una partida para empezar.':rapidas.length+(rapidas.length===1?' partida':' partidas')+(total==null?'':' · total '+pesos(total))].filter(Boolean).join(' · ');
 $('#cmResumen').classList.toggle('cm-pendiente',sucio&&rapidas.length>0);$('#cmPasar').hidden=true;
}
function marcarSucio(){if(!sucio){sucio=true;resumen();}}
function marcarLimpio(){sucio=false;resumen();}
function cabecera(){
 const convertida=actual?.estado==='convertida';
 $('#cmFolio').textContent=actual?actual.folio:'Nueva cotización';
 const sel=$('#cmEstadoSel');sel.disabled=!actual||convertida;if(convertida&&!sel.querySelector('[value=convertida]'))sel.insertAdjacentHTML('beforeend','<option value="convertida">Convertida en pedido</option>');sel.value=actual?.estado||'borrador';
 $('#cmConvertida').hidden=!convertida;$('#cmConvertida').textContent=convertida?'Esta cotización ya se convirtió en pedido. Los cambios se hacen en la cotización del pedido, en Pedidos.':'';
 $('#cmGuardar').disabled=convertida;
 $('#cmPasar').hidden=modo==='rapida'||!modelos.length||['convertida','descartada'].includes(actual?.estado);$('#cmVerPedido').hidden=!convertida||!actual?.pedido_id;
 if(!actual||convertida&&!convirtiendo&&$('#cvResultado').hidden)$('#cmConvertir').hidden=true;
}
function pintarLista(){
 const texto=$('#cmFiltro').value.trim().toLocaleLowerCase('es'),ver=$('#cmVerDescartadas').checked;
 const filas=lista.filter(x=>(ver||x.estado!=='descartada')&&(x.folio+' '+x.cliente).toLocaleLowerCase('es').includes(texto));
 $('#cmLista').innerHTML=filas.length?filas.map(x=>`<li class="${actual?.id===x.id?'on':''}"><button type="button" class="cm-item" data-abrir="${esc(x.id)}"><b>${esc(x.folio)}</b><span>${esc(x.cliente||'Sin cliente')}</span><small><i class="cm-chip cm-chip--${esc(x.estado)}">${esc(ESTADOS[x.estado]||x.estado)}</i>${x.tipo==='rapida'?'Rápida · '+x.modelos+(x.modelos===1?' partida':' partidas')+(Number.isSafeInteger(x.total)?' · total '+esc(pesos(x.total)):''):x.modelos+' '+(x.modelos===1?'modelo':'modelos')+(x.desde==null?'':' · desde '+esc(pesos(Number.isSafeInteger(x.impuesto)?x.desde+Math.round(x.desde*x.impuesto/10000):x.desde))+' / pza '+(Number.isSafeInteger(x.impuesto)?x.impuesto?'con IVA':'precio final':'(IVA por confirmar)'))} · ${esc(fechaCorta(x.updated_at))}</small></button><button type="button" class="btn-texto" data-duplicar="${esc(x.id)}" aria-label="Duplicar ${esc(x.folio)}">Duplicar</button></li>`).join(''):`<li class="cm-vacia">${lista.length?'Ninguna cotización coincide.':'Todavía no hay cotizaciones guardadas.'}</li>`;
}
async function cargarLista(){
 const turno=epoca;
 try{const r=await api('cm-lista');if(turno!==epoca)return;lista=r.cotizaciones||[];pintarLista();}
 catch(e){if(turno===epoca){$('#cmLista').innerHTML='<li class="cm-vacia">No se pudo cargar la lista: '+esc(e.message)+'</li>';}}
}
function opciones(){
 const busqueda=$('#cmBuscar').value.trim().toLocaleLowerCase('es'),anterior=$('#cmModelo').value;
 // Las prendas «solo para cotizar» (catálogo mayoreo, 22-nov-2026) salen con su código del proveedor aunque no estén en la web.
 $('#cmModelo').innerHTML=catalogo.filter(p=>(p.activo!==false||p.soloCotizar)&&[p.nombre,p.silueta,p.sku,p.skuProveedor,p.proveedor].join(' ').toLocaleLowerCase('es').includes(busqueda)).map(p=>`<option value="${esc(p.sku)}">${esc(nombreDe(p))} · ${p.skuProveedor?esc(p.skuProveedor)+' · ':''}${esc(p.sku)}${p.activo===false?' · solo cotizar':''}</option>`).join('');
 if([...$('#cmModelo').options].some(o=>o.value===anterior))$('#cmModelo').value=anterior;
 $('#cmAgregar').disabled=!$('#cmModelo').value;
}
async function cargar(){
 if(cargando||datos)return;
 const turno=epoca;cargando=true;avisar('Consultando modelos y costos privados…');
 try{
  const [cfg,cat,pub]=await Promise.all([api('precios-config'),api('catalogo-lista'),api('catalogo-publico')]);
  if(turno!==epoca||$('#trabajo').hidden)return;
  const c=pub.catalogo;datos={config:configurar(cfg.config.datos),version:cfg.config.version,colores:c.colores};
  // Margen inicial: el del primer rango de Costos (el mismo que usa el cotizador de pedidos).
  datos.margen=datos.config.rangos[0]?.margen??null;
  const publicos=[...c.productos,...c.productosHistoricos];
  catalogo=cat.productos.map(p=>({...publicos.find(x=>x.sku===p.sku),...p})).sort((a,b)=>nombreDe(a).localeCompare(nombreDe(b),'es'));
  if(!$('#cmVigencia').value)$('#cmVigencia').value=hoyMX(15);
  opciones();opcionesRapida();$('#cmCampos').disabled=false;cabecera();avisar('Costos guardados · versión '+datos.version+(datos.margen==null?'.':' · margen inicial '+datos.margen/100+'%.'));
  void cargarLista();
 }catch(e){if(turno===epoca)avisar(e.message);}finally{if(turno===epoca)cargando=false;}
}
nav.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;const on=b.id==='verCotizaciones';
 $('#seccionCotizaciones').hidden=!on;$('#verCotizaciones').classList.toggle('on',on);$('#verCotizaciones').setAttribute('aria-pressed',String(on));
 if(on){
  for(const s of $('#trabajo').children)if(s.tagName==='SECTION'||s.id==='seccionPedidos')s.hidden=s.id!=='seccionCotizaciones';
  for(const x of nav.querySelectorAll('button'))if(x!==b){x.classList.remove('on');x.setAttribute('aria-pressed','false');}
  history.replaceState(null,'','#cotizaciones');void cargar();if(datos)void cargarLista();
 }
});
$('#cmBuscar').addEventListener('input',opciones);
$('#cmBuscar').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if($('#cmModelo').value)agregar();}});
$('#cmForm').addEventListener('submit',e=>e.preventDefault());
// Cualquier cambio de la composición queda pendiente de guardar (buscar y el estado no cuentan).
for(const tipo of ['input','change'])$('#cmForm').addEventListener(tipo,e=>{if(!['cmBuscar','cmModelo','cmEstadoSel'].includes(e.target.id)&&!e.target.closest('#cmConvertir'))marcarSucio();});
$('#cmRedondeo').addEventListener('change',()=>{for(const m of modelos)actualizar(m);});
$('#cmFiltro').addEventListener('input',pintarLista);
$('#cmVerDescartadas').addEventListener('change',pintarLista);
$('#cmActualizar').addEventListener('click',()=>{
 if(modelos.length&&!confirm('Se volverán a cargar los costos y se quitarán los modelos en pantalla (lo guardado se conserva). ¿Continuar?'))return;
 epoca++;cargando=false;datos=null;catalogo=[];limpiar();actual=null;cabecera();$('#cmCampos').disabled=true;void cargar();
});
function crearModelo(p){
 const servicio=!!p.servicio,producto={...p,colores:(p.colores||[]).map(id=>datos.colores.find(c=>c.id===id)?.nombre||id)};
 const m={id:++contador,producto:p,servicio,libre:!!p.libre,costoLibre:null,nombre:servicio?p.nombre:nombreDe(p),sku:p.sku,margen:datos.margen,filas:(servicio?filasServicio():filasModelo(producto,datos.config)).map(f=>({...f,incluir:true,margen:null,precio:null})),tecnica:'',tecnicaID:'',color:p.colores?.[0]||'',zona:p.zonas?.[0]?.id||'',ubicacion:'',ancho:800,alto:null,autoAlto:true,aplicacion:0,modo:'area',render:null,renderTurno:0,foto:null,fotoTurno:0,fotoOcupada:false};
 m.ancho=Math.min(m.ancho,maxAncho(m));if(logo)m.alto=Math.max(1,Math.round(m.ancho*logo.height/logo.width));
 return m;
}
// p: modelo del catálogo elegido en la lista, productoServicio() para cotizar sin prenda o productoLibre() para un artículo fuera de catálogo.
function agregar(p=catalogo.find(p=>p.sku===$('#cmModelo').value)){
 if(modelos.length>=20)return avisar('Puedes cotizar hasta 20 modelos en un documento.');
 if(!p)return;
 const m=crearModelo(p);modelos.push(m);pintarModelo(m);if(m.servicio){aplicarTecnica(m);actualizar(m);}void renderizar(m);marcarSucio();
 if(!m.servicio){$('#cmBuscar').value='';opciones();}avisar(m.libre?'Artículo fuera de catálogo agregado. Escribe el concepto, el costo y el precio.':m.servicio?'Personalización sin prenda agregada.':m.nombre+' agregado.');nodo(m).scrollIntoView({block:'start',behavior:'smooth'});
}
function pintarModelo(m){
 const seccion=document.createElement('section');seccion.className='cot-panel cm-modelo';seccion.dataset.modelo=m.id;
 const etiqueta=f=>[f.talla,f.color!=='Todos los colores'?f.color:'',f.volumen].filter(Boolean).join(' ');
 const opcionesTecnica=(m.producto.tecnicas||[]).map(t=>`<option value="${esc(t)}">${esc(tecnicas[t]||t)}</option>`).join('');
 // Sin prenda: concepto editable y ubicación del logo en texto libre; no hay color, zona del catálogo ni «Solo prenda».
 // Fuera de catálogo: además lleva el costo del artículo escrito a mano y la personalización es opcional.
 const campos=m.libre?`<label>Concepto<input data-campo="concepto" maxlength="120" autocomplete="off" placeholder="Ej. Termo de acero 500 ml" value="${esc(m.nombre===NOMBRE_LIBRE?'':m.nombre)}"></label><label>Costo del artículo / pza (con IVA)<input data-campo="costoLibre" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Lo que te cuesta"></label><label>Personalización<select data-campo="tecnica"><option value="">Sin personalización</option>${opcionesTecnica}</select></label>`
  :m.servicio?`<label>Concepto<input data-campo="concepto" maxlength="120" autocomplete="off" value="${esc(m.nombre)}"></label><label>Personalización<select data-campo="tecnica">${opcionesTecnica}</select></label>`
  :`<label>Personalización<select data-campo="tecnica"><option value="">Solo prenda</option>${opcionesTecnica}</select></label><label>Color de la vista<select data-campo="color">${(m.producto.colores||[]).map(id=>`<option value="${esc(id)}">${esc(datos.colores.find(c=>c.id===id)?.nombre||id)}</option>`).join('')}</select></label>`;
 const ubicacion=m.servicio?`<label>Ubicación del logo (opcional)<input data-campo="ubicacion" maxlength="80" autocomplete="off" placeholder="Ej. Frente, espalda, manga" value="${esc(m.ubicacion)}"></label>`
  :`<label>Zona del logo<select data-campo="zona">${(m.producto.zonas||[]).map(z=>`<option value="${esc(z.id)}">${esc(z.nombre)}</option>`).join('')}</select></label>`;
 seccion.innerHTML=`<div class="cm-modelocab"><div><h2>${esc(m.nombre)}</h2><p class="cot-ayuda">${m.libre?'Fuera de catálogo · ZAIN consigue el artículo':m.servicio?'Sin prenda · el cliente entrega sus prendas':esc(m.sku)}</p></div><button type="button" data-accion="quitar" class="btn-texto">Quitar</button></div>
<div class="cm-diseno"><div class="cm-preview"><canvas width="600" height="600" aria-label="${m.servicio?'Vista del logo':'Vista del modelo con logo'}"></canvas><p data-vista-estado class="cot-ayuda" role="status">${m.libre?'Sin foto: artículo fuera de catálogo':m.servicio?'Sube el logo para verlo aquí':'Cargando modelo…'}</p>${m.libre?`<div class="cm-foto"><label class="btn btn--linea cm-foto__subir"><span data-foto-texto>Subir foto</span><input data-foto type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" aria-label="Foto del artículo"></label><button type="button" data-accion="quitar-foto" class="btn-texto" hidden>Quitar foto</button></div><p class="cot-ayuda cm-foto__ayuda">Opcional. Puedes usar la foto del catálogo; el cliente la ve como imagen ilustrativa.</p>`:''}</div><div>
<div class="cm-campos">${campos}</div>
<div data-personalizacion hidden><div class="cm-campos">${ubicacion}<label>Ancho del logo (cm)<input data-campo="ancho" type="number" min="0.01" max="${maxAncho(m)/100}" step="0.01" inputmode="decimal" value="${numero(m.ancho)}"></label></div>
<details class="cm-mas"><summary>Alto y costo de la personalización</summary><div class="cm-campos"><label>Alto del logo (cm)<input data-campo="alto" type="number" min="0.01" max="200" step="0.01" inputmode="decimal" value="${numero(m.alto)}" placeholder="Sube el logo o escríbelo"></label><label>Cobro de la personalización<select data-campo="modo"><option value="area">Por cm²</option><option value="fijo">Importe fijo por pieza</option></select></label><label data-area>Tarifa MXN / cm²<input data-campo="tarifa" type="number" min="0" step="0.000001" inputmode="decimal" placeholder="Pendiente"></label><label data-fijo hidden>Costo fijo / pieza<input data-campo="fijo" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Pendiente"></label></div><p class="cot-ayuda">El alto sigue la proporción del logo hasta que lo cambies.</p></details><p data-preparacion class="cot-ayuda"></p></div>
<label class="cm-margen">Margen bruto del modelo (%)<input data-campo="margenModelo" type="number" min="0" max="99.99" step="0.01" inputmode="decimal" value="${m.margen==null?'':m.margen/100}" placeholder="Ej. 35"></label></div></div>
<div class="cm-tabla"><table><thead><tr><th><span class="cm-oculto">Ofrecer</span></th><th>${m.servicio?'Cobro':'Tallas'}</th><th>Costo / pza</th><th>Precio / pza sin IVA</th><th>Utilidad / pza</th></tr></thead><tbody>${m.filas.map(f=>`<tr data-fila="${f.id}"><td><input type="checkbox" data-campo="incluir" checked aria-label="Ofrecer ${esc(etiqueta(f))}"></td><td><b>${esc(f.talla)}</b>${f.color!=='Todos los colores'?`<small>${esc(f.color)}</small>`:''}${f.volumen?`<small>${esc(f.volumen)}</small>`:''}</td><td data-label="Costo / pza" data-resultado="costo">—</td><td data-label="Precio / pza"><input data-campo="precio" aria-label="Precio por pieza ${esc(etiqueta(f))}" type="number" min="0" step="0.01" inputmode="decimal"><small data-resultado="nota"></small></td><td data-label="Utilidad / pza" data-resultado="utilidad">—</td></tr>`).join('')}</tbody></table></div><p data-error class="cm-error" role="status"></p>`;
 $('#cmModelos').append(seccion);actualizar(m);
}
const nodo=m=>$('#cmModelos [data-modelo="'+m.id+'"]');
function leer(m){
 const el=nodo(m),campo=k=>el.querySelector('[data-campo="'+k+'"]'),valor=k=>campo(k)?.value??'';
 m.tecnicaID=valor('tecnica');m.tecnica=tecnicas[m.tecnicaID]||'';m.color=valor('color');m.zona=valor('zona');m.modo=valor('modo');m.ancho=nullable(campo('ancho'));m.alto=nullable(campo('alto'));
 if(m.servicio){m.nombre=valor('concepto').replace(/\s+/g,' ').trim()||(m.libre?NOMBRE_LIBRE:NOMBRE_SERVICIO);m.ubicacion=valor('ubicacion').replace(/\s+/g,' ').trim();}
 // Fuera de catálogo: el costo escrito es el costo del renglón; vacío = pendiente (se puede escribir el precio directo).
 if(m.libre){m.costoLibre=nullable(campo('costoLibre'));for(const f of m.filas)f.costo=m.costoLibre;}
 m.margen=nullable(campo('margenModelo'));if(m.margen!=null&&m.margen>9999)throw Error('El margen debe ser menor a 100%.');
 if(m.tecnica&&m.ancho!=null&&m.ancho>maxAncho(m))throw Error('El ancho excede el área disponible de esta zona.');
 const limite=zona(m)?.maxAlto;if(m.tecnica&&limite&&m.alto!=null&&m.alto>Math.floor(limite*100))throw Error('El alto excede el área disponible de esta zona ('+limite+' cm).');
 // por área se suma el costo fijo por pieza de la técnica (p. ej. el aplicado del DTF)
 const fijoTecnica=datos.config.tecnicas.find(t=>t.tecnica===m.tecnica)?.porPieza??0,area=aplicacionArea(m.ancho,m.alto,campo('tarifa').value===''?null:decimalTarifa(campo('tarifa').value));
 m.aplicacion=!m.tecnica?0:m.modo==='fijo'?nullable(campo('fijo')):area==null?null:area+fijoTecnica;
 // Un precio escrito en la fila manda; si está vacío, se usa el margen del modelo.
 for(const f of m.filas){const tr=el.querySelector('[data-fila="'+f.id+'"]');f.incluir=tr.querySelector('[data-campo=incluir]').checked;f.margen=m.margen;f.precio=f.incluir?nullable(tr.querySelector('[data-campo=precio]')):null;}
}
function actualizar(m){
 const el=nodo(m);try{leer(m);el.querySelector('[data-error]').textContent='';if(m.servicio)el.querySelector('.cm-modelocab h2').textContent=m.nombre;
 for(const f of m.filas){
  const tr=el.querySelector('[data-fila="'+f.id+'"]'),input=tr.querySelector('[data-campo=precio]'),r=f.incluir?precioFila(f,{margen:f.margen,precio:f.precio,aplicacion:m.aplicacion,redondeo:redondeo()}):{costo:null,precio:null,sugerido:null,utilidad:null};
  f.listo=r.precio!=null;f.visto=r.precio;tr.classList.toggle('cm-excluido',!f.incluir);tr.classList.toggle('cm-fijo',f.precio!=null);input.disabled=!f.incluir;
  input.placeholder=r.sugerido==null?'Escribe el precio':numero(r.sugerido);
  tr.querySelector('[data-resultado=costo]').textContent=r.costo==null?'Sin costo':pesos(r.costo);
  tr.querySelector('[data-resultado=nota]').textContent=!f.incluir?'No se ofrece':f.precio!=null?'Precio escrito'+(r.sugerido==null?'':' · sugerido '+pesos(r.sugerido)):r.sugerido==null?(r.costo==null?'Falta el costo':'Falta el margen'):'Con margen '+m.margen/100+'%';
  tr.querySelector('[data-resultado=utilidad]').textContent=r.utilidad==null?'—':pesos(r.utilidad)+(r.margenReal==null?'':' · '+(r.margenReal/100).toLocaleString('es-MX')+'%');
  tr.querySelector('[data-resultado=utilidad]').classList.toggle('cm-negativo',r.utilidad!=null&&r.utilidad<0);
 }}catch(e){m.render=null;for(const f of m.filas){f.listo=false;f.visto=null;}el.querySelector('[data-error]').textContent=e.message;}
 resumen();
}
async function renderizar(m){
 const el=nodo(m);if(!el)return;const turn=++m.renderTurno,session=epoca;m.render=null;
 // Sin prenda: solo el logo, sin modelo que cargar.
 // Fuera de catálogo: la foto subida (si hay) con el logo en una esquina cuando lleva personalización.
 if(m.servicio){
  const conLogo=!m.libre||!!m.tecnica,foto=m.libre?m.foto?.img:null,canvas=el.querySelector('canvas'),con=dibujarLibre(canvas.getContext('2d'),foto,conLogo?logo:null,canvas.width);
  canvas.hidden=!con&&m.libre;m.render=con?canvas.toDataURL('image/png'):null;
  const dondeLogo=m.ubicacion?'logo en '+m.ubicacion:'con logo';
  el.querySelector('[data-vista-estado]').textContent=foto?'Foto del artículo (ilustrativa)'+(m.tecnica?' · '+(logo?dondeLogo:'logo pendiente'):''):con?'Logo'+(m.ubicacion?' en '+m.ubicacion:'')+(m.libre?' · artículo fuera de catálogo':' · prenda del cliente'):m.libre?'Sin foto: artículo fuera de catálogo':'Sube el logo para verlo aquí';
  if(m.libre){el.querySelector('[data-foto-texto]').textContent=m.foto?'Cambiar foto':'Subir foto';el.querySelector('[data-accion=quitar-foto]').hidden=!m.foto;}
  return;
 }
 try{
 const p=m.producto,col=color(m),src=p.fotosColor?.[m.color]||p.fotoRender||p.foto;
 if(!src)throw Error('Este modelo todavía no tiene render.');
 const img=await window.ZR.cargar(src);if(turn!==m.renderTurno||session!==epoca||!nodo(m))return;
 const canvas=el.querySelector('canvas'),g=canvas.getContext('2d'),S=canvas.width;
 g.clearRect(0,0,S,S);g.drawImage(window.ZR.tenir(img,p.fotosColor?.[m.color]?null:col.hex,S,p.fotoColor?datos.colores.find(c=>c.id===p.fotoColor)?.hex:null,p.acabadosFijos||null),0,0);
 const z=zona(m);
 if(m.tecnica&&logo){
 if(!z||!m.ancho||!p.pxPorCm)throw Error('Confirma la zona y el ancho para mostrar el logo.');
 window.ZR.estampar(g,img,logo,{x:z.x*S/1000,y:z.y*S/1000,ancho:m.ancho/100*p.pxPorCm*S/1000,tecnica:m.tecnicaID,S,sombraLocal:!!p.fotosColor,giro:z.giro,sesgo:z.sesgo,inclina:z.inclina,compresion:z.compresion,textura:z.textura});
 }
 m.render=canvas.toDataURL('image/png');el.querySelector('[data-vista-estado]').textContent=(m.tecnica?(logo?'Logo en '+(z?.nombre||'zona por confirmar'):'Sube el logo para verlo aquí'):'Referencia del modelo')+' · '+col.nombre;
 }catch(e){if(turn===m.renderTurno&&session===epoca&&nodo(m))el.querySelector('[data-vista-estado]').textContent=e.message;}
}
function altoAutomatico(m){
 if(!logo||!m.autoAlto||m.ancho==null)return;
 m.alto=Math.max(1,Math.round(m.ancho*logo.height/logo.width));nodo(m).querySelector('[data-campo=alto]').value=numero(m.alto);
}
function aplicarTecnica(m){
 const el=nodo(m),nombre=tecnicas[el.querySelector('[data-campo=tecnica]').value],t=datos.config.tecnicas.find(t=>t.tecnica===nombre);
 el.querySelector('[data-personalizacion]').hidden=!nombre;el.querySelector('[data-campo=tarifa]').value=t?.tarifaCm2==null?'':t.tarifaCm2/1000000;
 // técnica que el taller cobra fijo por pieza (bordado, serigrafía): se propone el modo fijo con ese importe
 if(t?.porPieza!=null&&!t.tarifaCm2){el.querySelector('[data-campo=modo]').value='fijo';el.querySelector('[data-campo=fijo]').value=(t.porPieza/100).toFixed(2);aplicarModo(m);}
 el.querySelector('[data-preparacion]').textContent=!nombre?'':t?.preparacion?'Preparación de referencia: '+pesos(t.preparacion)+'. Agrégala al cargo único si corresponde.':'Preparación o ponchado: confirmar con el taller.';
}
function aplicarModo(m){const el=nodo(m),fijo=el.querySelector('[data-campo=modo]').value==='fijo';el.querySelector('[data-area]').hidden=fijo;el.querySelector('[data-fijo]').hidden=!fijo;}
$('#cmAgregar').addEventListener('click',()=>agregar());
$('#cmServicio').addEventListener('click',()=>agregar(productoServicio()));
$('#cmLibre').addEventListener('click',()=>agregar(productoLibre()));
$('#cmModelos').addEventListener('input',e=>{
 const el=e.target.closest('[data-modelo]');if(!el)return;const m=modelos.find(m=>m.id===Number(el.dataset.modelo)),k=e.target.dataset.campo;if(!k)return;
 if(k==='alto')m.autoAlto=false;
 if(k==='ancho'){try{m.ancho=nullable(e.target);altoAutomatico(m);}catch{}}
 actualizar(m);if(['ancho','alto','ubicacion'].includes(k))void renderizar(m);
});
$('#cmModelos').addEventListener('change',e=>{
 const el=e.target.closest('[data-modelo]');if(!el)return;const m=modelos.find(m=>m.id===Number(el.dataset.modelo)),k=e.target.dataset.campo;
 if(k==='tecnica')aplicarTecnica(m);
 if(k==='modo')aplicarModo(m);
 if(k==='zona'){m.zona=e.target.value;const input=el.querySelector('[data-campo=ancho]');input.max=maxAncho(m)/100;}
 actualizar(m);if(['tecnica','zona','color'].includes(k))void renderizar(m);
});
$('#cmModelos').addEventListener('click',e=>{
 const b=e.target.closest('[data-accion=quitar]');if(!b)return;const el=b.closest('[data-modelo]'),m=modelos.find(m=>m.id===Number(el.dataset.modelo));
 m.renderTurno++;m.fotoTurno++;modelos=modelos.filter(x=>x!==m);el.remove();marcarSucio();resumen();
});
// Foto del artículo fuera de catálogo (JP, 20-nov-2026). Se prepara en el navegador y se sube al guardar.
async function ponerFoto(m,archivo){
 if(!archivo)return;const turno=++m.fotoTurno,session=epoca,el=nodo(m);m.fotoOcupada=true;el.querySelector('[data-vista-estado]').textContent='Preparando foto…';
 try{const f=await prepararFoto(archivo);if(turno!==m.fotoTurno||session!==epoca||!nodo(m))return;m.foto={...f,objeto:null};marcarSucio();avisar('Foto agregada a '+m.nombre+'. Se sube al guardar.');}
 catch(e){if(turno===m.fotoTurno&&nodo(m))avisar(e.message);}
 finally{if(turno===m.fotoTurno){m.fotoOcupada=false;if(nodo(m)){el.querySelector('[data-foto]').value='';void renderizar(m);}}}
}
const modeloDe=e=>modelos.find(m=>m.id===Number(e.closest('[data-modelo]')?.dataset.modelo));
$('#cmModelos').addEventListener('change',e=>{const input=e.target.closest('[data-foto]'),m=input&&modeloDe(input);if(m)void ponerFoto(m,input.files[0]);});
$('#cmModelos').addEventListener('click',e=>{
 const b=e.target.closest('[data-accion=quitar-foto]'),m=b&&modeloDe(b);if(!m)return;
 m.fotoTurno++;m.fotoOcupada=false;m.foto=null;marcarSucio();void renderizar(m);avisar('Foto retirada.');
});
let logoTurno=0,logoOcupado=false;
// guardado=true: el logo viene de una cotización guardada y ya está en el servidor.
async function prepararLogo(archivo,guardado=false){
 if(!archivo)return;if(!/^image\/(png|jpeg|webp|svg\+xml)$/.test(archivo.type)||archivo.size>15*1024*1024){$('#cmLogo').value='';return avisar('Sube un logo PNG, JPG, WEBP o SVG de hasta 15 MB.');}
 const turno=++logoTurno,session=epoca;$('#cmLogoEstado').textContent='Preparando logo…';logoOcupado=true;
 try{const nuevo=await window.ZR.abrirArchivo(archivo);if(turno!==logoTurno||session!==epoca)return;crudo=nuevo;logoNombre=archivo.name;logoOriginal=archivo;if(!guardado){logoArchivo=archivo;marcarSucio();}analizarLogo();}
 catch(e){if(turno===logoTurno){$('#cmLogoEstado').textContent='No se pudo abrir ese logo. El anterior se conserva.';avisar(e.message);}}
 finally{if(turno===logoTurno)logoOcupado=false;}
}
function analizarLogo(){
 if(!crudo)return;logo=window.ZR.analizarLogo(crudo,$('#cmQuitarFondo').checked).logo;$('#cmLogoEstado').textContent=logoNombre+' · elige Bordado, Serigrafía o DTF en cada modelo para verlo.';$('#cmEliminarLogo').hidden=false;
 for(const m of modelos){altoAutomatico(m);actualizar(m);void renderizar(m);}
}
$('#cmLogo').addEventListener('change',e=>void prepararLogo(e.target.files[0]));
$('#cmQuitarFondo').addEventListener('change',analizarLogo);
function sinLogo(texto){logoTurno++;logoOcupado=false;logo=null;crudo=null;logoNombre='';logoArchivo=null;logoOriginal=null;$('#cmLogo').value='';$('#cmEliminarLogo').hidden=true;$('#cmLogoEstado').textContent=texto;}
$('#cmEliminarLogo').addEventListener('click',()=>{sinLogo('Logo retirado.');marcarSucio();for(const m of modelos)void renderizar(m);});
// Lo que se guarda: los valores tal como están en pantalla (también los incompletos).
function crudoModelo(m){
 const el=nodo(m),v=k=>el.querySelector('[data-campo="'+k+'"]')?.value??'';
 return {sku:m.sku,tecnica:v('tecnica'),color:v('color'),zona:v('zona'),...(m.servicio?{concepto:v('concepto'),ubicacion:v('ubicacion')}:{}),...(m.libre?{costoLibre:v('costoLibre')}:{}),...(m.libre&&m.foto?.objeto?{foto:{objeto:m.foto.objeto,mime:m.foto.mime}}:{}),modo:v('modo'),ancho:v('ancho'),alto:v('alto'),autoAlto:m.autoAlto,tarifa:v('tarifa'),fijo:v('fijo'),margen:v('margenModelo'),
  filas:m.filas.map(f=>{const tr=el.querySelector('[data-fila="'+f.id+'"]');return {clave:clave(f),incluir:tr.querySelector('[data-campo=incluir]').checked,precio:tr.querySelector('[data-campo=precio]').value,visto:f.visto??null};})};
}
const CAMPOS={destinatario:'#cmDestinatario',iva:'#cmIVA',redondeo:'#cmRedondeo',vigencia:'#cmVigencia',plazo:'#cmPlazo',anticipo:'#cmAnticipo',concepto:'#cmCargoConcepto',cargo:'#cmCargo',notas:'#cmNotas'};
const serializar=()=>modo==='rapida'?{schema:1,tipo:'rapida',...Object.fromEntries(Object.entries(CAMPOS).map(([k,s])=>[k,$(s).value])),textos:crudoTextos(),modelos:rapidas.map(crudoRapida)}
 :{schema:1,...Object.fromEntries(Object.entries(CAMPOS).map(([k,s])=>[k,$(s).value])),quitarFondo:$('#cmQuitarFondo').checked,modelos:modelos.map(crudoModelo)};
function opcionesComerciales(folio){
 const anticipo=$('#cmAnticipo').value.trim();
 return {folio,destinatario:$('#cmDestinatario').value,impuesto:Number($('#cmIVA').value),vigencia:$('#cmVigencia').value,plazo:$('#cmPlazo').value,redondeo:redondeo(),anticipo:anticipo===''?null:Math.round(Number(anticipo)*100),concepto:$('#cmCargoConcepto').value,cargo:nullable($('#cmCargo')),notas:$('#cmNotas').value};
}
// Precios que vería el cliente en este momento; null si la cotización todavía está incompleta.
function proyeccion(){try{if(modo==='rapida')return proyeccionRapida();for(const m of modelos)leer(m);return comercial(modelos,opcionesComerciales(actual?.folio||''));}catch{return null;}}
function aplicarGuardada(x){actual={id:x.id,version:x.version,folio:x.folio,estado:x.estado,logo:x.logo||null,pedido_id:x.pedido_id||null};cabecera();}
async function subirLogo(id){
 const s=await api('cm-logo-subida',{id,mime:logoArchivo.type,bytes:logoArchivo.size});
 const r=await fetch(s.url,{method:'PUT',headers:{'Content-Type':logoArchivo.type},body:logoArchivo,signal:AbortSignal.timeout(120000)});
 if(!r.ok)throw Error('No se pudo subir el logo. Revisa tu conexión e intenta de nuevo.');
 return {objeto:s.objeto,mime:logoArchivo.type,nombre:logoArchivo.name};
}
// La foto del artículo libre va al mismo bucket privado que el logo (carpeta de la cotización).
async function subirFoto(id,blob){
 const s=await api('cm-logo-subida',{id,mime:blob.type,bytes:blob.size});
 const r=await fetch(s.url,{method:'PUT',headers:{'Content-Type':blob.type},body:blob,signal:AbortSignal.timeout(120000)});
 if(!r.ok)throw Error('No se pudo subir la foto. Revisa tu conexión e intenta de nuevo.');
 return s.objeto;
}
function guardar(estado){
 if(guardando)return guardando;
 const session=epoca;
 guardando=(async()=>{
  if(!datos)throw Error('Espera a que carguen los modelos y costos.');
  if(actual?.estado==='convertida')throw Error('Esta cotización ya es un pedido; edítala desde Pedidos.');
  if(logoOcupado)throw Error('Espera a que termine de cargar el logo.');
  const id=actual?.id||crypto.randomUUID();
  let logoRef=null;
  if(logo){logoRef=!logoArchivo&&actual?.logo?.objeto?.startsWith(id+'/')?actual.logo:null;if(!logoRef){if(!logoArchivo)throw Error('Vuelve a subir el logo.');avisar('Subiendo logo…');logoRef=await subirLogo(id);}}
  const conFoto=modo==='rapida'?rapidas:modelos.filter(m=>m.libre);
  if(conFoto.some(m=>m.fotoOcupada))throw Error('Espera a que termine de cargar la foto.');
  for(const m of conFoto)if(m.foto&&!m.foto.objeto?.startsWith(id+'/')){const nombre=m.rapida?nombreRapida(m):m.nombre;if(session!==epoca)throw Error('Sesión cerrada.');if(!m.foto.blob)throw Error('Vuelve a subir la foto de '+nombre+'.');avisar('Subiendo foto de '+nombre+'…');m.foto.objeto=await subirFoto(id,m.foto.blob);}
  if(session!==epoca)throw Error('Sesión cerrada.');
  const q=proyeccion(),r=await api('cm-guardar',{id,version:actual?.version||0,cliente:$('#cmDestinatario').value,cliente_id:clienteElegido(),datos:serializar(),comercial:q,desde:q?minimo(q.partidas.map(p=>p.precio)):null,modelos:modo==='rapida'?rapidas.length:modelos.length,logo:logoRef,...(estado?{estado}:{})});
  if(session!==epoca)throw Error('Sesión cerrada.');
  aplicarGuardada(r.cotizacion);logoArchivo=null;marcarLimpio();void cargarLista();return actual;
 })().finally(()=>{guardando=null;});
 return guardando;
}
$('#cmGuardar').addEventListener('click',async e=>{
 const b=e.currentTarget;b.disabled=true;
 try{await guardar();avisar(actual.folio+' guardada.');pintarLista();}catch(er){avisar(er.message);}finally{b.disabled=actual?.estado==='convertida';}
});
$('#cmEstadoSel').addEventListener('change',async e=>{
 const nuevo=e.target.value;if(!actual)return;
 try{
  if(sucio)await guardar(nuevo);else aplicarGuardada((await api('cm-estado',{id:actual.id,version:actual.version,estado:nuevo})).cotizacion);
  avisar(actual.folio+' · '+ESTADOS[actual.estado]+'.');void cargarLista();
 }catch(er){e.target.value=actual.estado;avisar(er.message);}
});
function limpiar(){
 for(const m of modelos)m.renderTurno++;modelos=[];$('#cmModelos').replaceChildren();cerrarConversion();
 for(const r of rapidas){r.fotoTurno++;r.vistaTurno++;}rapidas=[];$('#crFilas').replaceChildren();$('#crTotales').replaceChildren();
 sinLogo('PNG, JPG, WEBP o SVG · hasta 15 MB. Opcional. Si falta, el pedido queda con logo pendiente.');
 $('#cmForm').reset();$('#cmVigencia').value=hoyMX(15);marcarLimpio();
}
function nueva(){
 if(sucio&&(modelos.length||rapidas.length)&&!confirm('Hay cambios sin guardar. ¿Descartarlos?'))return false;
 limpiar();actual=null;cabecera();pintarLista();return true;
}
$('#cmVolver').addEventListener('click',()=>{if(sucio&&(modelos.length||rapidas.length)&&!confirm('Hay cambios sin guardar. ¿Volver sin guardarlos?'))return;if(sucio){limpiar();actual=null;cabecera();}cerrarConversion();mostrarEditor(false);void cargarLista();});
// «+ Cotizar» de la pantalla de Pedidos (11-nov-2026): abre una cotización nueva sin pasar por la lista.
// 25-nov-2026 (JP): abre la cotización rápida, que ya sirve para prendas del catálogo y para artículos de fuera.
$('#cotizarRapido')?.addEventListener('click',()=>{$('#verCotizaciones').click();$('#cmRapidaNueva').click();});
$('#cmRapidaNueva').addEventListener('click',()=>{if(nueva()){ponerModo('rapida');pintarRapida();actualizarRapidas();marcarLimpio();mostrarEditor(true);avisar('Cotización rápida nueva: escribe las partidas.');$('#crFilas [data-cr=concepto]').focus();}});
$('#cmNueva').addEventListener('click',()=>{if(nueva()){ponerModo('modelos');mostrarEditor(true);avisar('Nueva cotización.');$('#cmDestinatario').focus();}});
async function restaurar(x,duplicar){
 if(x.datos?.tipo==='rapida')return restaurarRapida(x,duplicar);
 limpiar();ponerModo('modelos');const d=x.datos||{};
 for(const [k,s] of Object.entries(CAMPOS))if(d[k]!=null)$(s).value=d[k];
 $('#cmDestinatario').value=x.cliente||d.destinatario||'';$('#cmQuitarFondo').checked=!!d.quitarFondo;
 if(duplicar)$('#cmVigencia').value=hoyMX(15);
 let fijados=0;const faltan=[],fotos=[],sinFoto=[];
 for(const s of d.modelos||[]){
  const p=s.sku===SERVICIO?productoServicio():s.sku===LIBRE?productoLibre():catalogo.find(p=>p.sku===s.sku);if(!p){faltan.push(s.sku);continue;}
  const m=crearModelo(p);modelos.push(m);pintarModelo(m);if(m.libre&&s.foto?.objeto)fotos.push([m,s.foto]);
  const el=nodo(m),set=(k,v)=>{const c=el.querySelector('[data-campo="'+k+'"]');if(c&&v!=null)c.value=v;};
  set('tecnica',s.tecnica);aplicarTecnica(m);set('color',s.color);set('zona',s.zona);set('concepto',s.concepto);set('costoLibre',s.costoLibre);set('ubicacion',s.ubicacion);m.zona=el.querySelector('[data-campo=zona]')?.value||'';el.querySelector('[data-campo=ancho]').max=maxAncho(m)/100;
  set('modo',s.modo);aplicarModo(m);set('ancho',s.ancho);set('alto',s.alto);set('tarifa',s.tarifa);set('fijo',s.fijo);set('margenModelo',s.margen);m.autoAlto=s.autoAlto!==false;
  const guardadas=new Map((s.filas||[]).map(g=>[g.clave,g]));
  for(const f of m.filas){const g=guardadas.get(clave(f)),tr=el.querySelector('[data-fila="'+f.id+'"]');if(!g)continue;tr.querySelector('[data-campo=incluir]').checked=g.incluir!==false;tr.querySelector('[data-campo=precio]').value=g.precio||'';}
  actualizar(m);
  // Respetar el precio cotizado: si los costos cambiaron desde que se guardó, se fija el precio anterior.
  if(!duplicar){let cambio=false;for(const f of m.filas){const g=guardadas.get(clave(f));if(g&&g.incluir!==false&&!g.precio&&g.visto!=null&&f.visto!==g.visto){el.querySelector('[data-fila="'+f.id+'"] [data-campo=precio]').value=numero(g.visto);fijados++;cambio=true;}}if(cambio)actualizar(m);}
 }
 actual=duplicar?null:{id:x.id,version:x.version,folio:x.folio,estado:x.estado,logo:x.logo||null,pedido_id:x.pedido_id||null};cabecera();
 if(x.logoUrl){
  try{const r=await fetch(x.logoUrl,{signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error();const blob=await r.blob(),archivo=new File([blob],x.logo?.nombre||'logo',{type:x.logo?.mime||blob.type});await prepararLogo(archivo,!duplicar);if(duplicar)logoArchivo=archivo;}
  catch{$('#cmLogoEstado').textContent='No se pudo recuperar el logo guardado; súbelo de nuevo.';}
 }
 // Fotos de artículos fuera de catálogo. Al duplicar se vuelven a subir a la carpeta de la cotización nueva.
 await Promise.all(fotos.map(async([m,f])=>{
  try{const url=x.fotosUrl?.[f.objeto];if(!url)throw Error();const r=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error();const blob=await r.blob();
   m.foto={objeto:duplicar?null:f.objeto,mime:f.mime||blob.type||'image/jpeg',img:await createImageBitmap(blob),blob:duplicar?blob:null};}
  catch{sinFoto.push(m.nombre);m.foto=duplicar?null:{objeto:f.objeto,mime:f.mime||'image/jpeg',img:null,blob:null};}
 }));
 for(const m of modelos)void renderizar(m);
 if(duplicar)marcarSucio();else marcarLimpio();pintarLista();
 return [duplicar?'Copia de '+x.folio+' lista; guárdala para darle folio nuevo.':x.folio+' abierta.',fijados?fijados+(fijados===1?' precio cambió':' precios cambiaron')+' con los costos actuales; se conservó el precio cotizado.':'',faltan.length?'Ya no están en el catálogo: '+faltan.join(', ')+'.':'',sinFoto.length?'No se pudo recuperar la foto de '+sinFoto.join(', ')+'; súbela de nuevo.':''].filter(Boolean).join(' ');
}
async function abrir(id,duplicar=false){
 if(!datos)return;if(!duplicar&&actual?.id===id&&!sucio){mostrarEditor(true);return;}
 if(sucio&&(modelos.length||rapidas.length)&&!confirm('Hay cambios sin guardar. ¿Descartarlos?'))return;
 const session=epoca;avisar('Abriendo cotización…');
 try{const r=await api('cm-leer',undefined,{id});if(session!==epoca)return;avisar(await restaurar(r.cotizacion,duplicar));mostrarEditor(true);$('#cmCampos').scrollIntoView({block:'start',behavior:'smooth'});}
 catch(e){if(session===epoca)avisar(e.message);}
}
$('#cmLista').addEventListener('click',e=>{const a=e.target.closest('[data-abrir]'),d=e.target.closest('[data-duplicar]');if(a)void abrir(a.dataset.abrir);if(d)void abrir(d.dataset.duplicar,true);});
function documentoComercial(folio,{permitirLogoPendiente=true}={}){
 if(!$('#cmForm').reportValidity())throw Error('Revisa los campos indicados.');
 if(modo==='rapida')return proyeccionRapida(folio);
 if(logoOcupado)throw Error('Espera a que termine de cargar el logo.');
 for(const m of modelos){leer(m);if(m.tecnica&&!logo&&!permitirLogoPendiente)throw Error('Sube el logo para los modelos personalizados.');}
 return comercial(modelos,opcionesComerciales(folio));
}
// Copiar o descargar guarda primero: así el folio del documento es el de la cotización guardada.
async function guardarParaEnviar(){documentoComercial('');if(sucio||!actual)await guardar(!actual||actual.estado==='borrador'?'enviada':undefined);else if(actual.estado==='borrador')aplicarGuardada((await api('cm-estado',{id:actual.id,version:actual.version,estado:'enviada'})).cotizacion);return documentoComercial(actual.folio);}
$('#cmCopiar').addEventListener('click',async()=>{
 try{const q=await guardarParaEnviar();await navigator.clipboard.writeText(q.tipo==='rapida'?textoRapida(q):textoComercial(q));avisar(q.folio+' copiada. Pégala en WhatsApp o en un correo.');}catch(e){avisar(e.message);}
});
$('#cmPDF').addEventListener('click',async e=>{
 const b=e.currentTarget,session=epoca;b.disabled=true;
 try{avisar('Guardando…');const q=await guardarParaEnviar();$('#cmCampos').disabled=true;$('#cmActualizar').disabled=true;avisar('Preparando PDF…');if(modo==='rapida'){await pdfRapida(q);if(session===epoca)avisar('PDF '+q.folio+' listo. Puedes enviarlo al cliente.');return;}await Promise.all(modelos.map(renderizar));if(session!==epoca)return;
 // Sin prenda y sin logo no hay imagen que esperar: el PDF dice «Vista previa por confirmar».
 // Fuera de catálogo: con foto siempre hay imagen; sin foto, solo si lleva logo.
 const esperaImagen=m=>m.libre?!!(m.foto?.img||m.tecnica&&logo):m.servicio?!!logo:true;
 if(modelos.some(m=>m.fotoOcupada))throw Error('Espera a que termine de cargar la foto.');
 for(const m of modelos)if(m.filas.some(f=>f.incluir)&&!m.render&&esperaImagen(m))throw Error('Espera a que cargue el diseño de '+m.nombre+' y vuelve a descargar.');
 const imagenes=modelos.map(m=>({sku:m.sku,nombre:m.nombre,src:m.render,nota:m.libre?'Artículo especial'+(m.foto?.img?' · imagen ilustrativa':'')+(m.tecnica&&!logo?' · logo pendiente':''):m.servicio?'Prenda del cliente'+(logo?'':' · logo pendiente'):(m.tecnica?(logo?'Logo en '+(zona(m)?.nombre||'zona por confirmar'):'Logo pendiente · referencia del modelo'):'Referencia')+' · '+color(m).nombre}));
 const {descargarModelos}=await import('./cotizacion-modelos-pdf.js?v=12');if(session!==epoca)return;await descargarModelos(q,imagenes);avisar('PDF '+q.folio+' listo. Puedes enviarlo al cliente.');
 }catch(e){if(session===epoca)avisar(e.message);}finally{b.disabled=false;$('#cmActualizar').disabled=false;if(session===epoca&&datos)$('#cmCampos').disabled=false;}
});
// ===== Pasar a pedido: cantidades autorizadas → solicitud normal con los precios cotizados =====
const nombreColor=id=>datos.colores.find(c=>c.id===id)?.nombre||id;
function cerrarConversion(){$('#cmForm .cm-exportar').hidden=false;lineas=[];$('#cmConvertir').hidden=true;$('#cvLineas').replaceChildren();$('#cvResultado').hidden=true;$('#cvResultado').replaceChildren();$('#cvEstado').textContent='';$('#cvErrores').replaceChildren();}
function pintarLineas(){
 const porModelo=modelos.map((m,i)=>({m,i,lineas:lineas.map((l,k)=>({...l,k})).filter(l=>l.modelo===i)}));
 $('#cvLineas').innerHTML=porModelo.map(({m,i,lineas:ls})=>`<div class="cm-cvmodelo"><h3>${esc(m.nombre)}${m.libre?' <small>· fuera de catálogo</small>':m.servicio?' <small>· prenda del cliente</small>':m.tecnica?'':' <small>· solo prenda</small>'}</h3>${ls.map(l=>{const tallas=(m.producto.tallas||[]).length?m.producto.tallas:[''];return `<div class="cm-cvlinea" data-linea="${l.k}">${m.servicio?'':`<div class="cm-cvcab"><label>Color<select data-cv="color">${(m.producto.colores||[]).map(id=>`<option value="${esc(id)}"${id===l.colorId?' selected':''}>${esc(nombreColor(id))}</option>`).join('')}</select></label>${ls.length>1?'<button type="button" class="btn-texto" data-cv="quitar">Quitar color</button>':''}</div>`}<div class="cm-cvtallas">${tallas.map(t=>`<label>${esc(t||'Piezas')}<input type="number" min="0" max="9999" step="1" inputmode="numeric" data-talla="${esc(t)}" value="${l.cantidades[t]||''}"></label>`).join('')}</div><p class="cot-ayuda" data-cv="nota"></p></div>`;}).join('')}${m.servicio?'':`<button type="button" class="btn-texto" data-cv="otro" data-modelo="${i}">+ Otro color de este modelo</button>`}</div>`).join('');
 calcularConversion();
}
// Lo mínimo que necesita armarPedido de cada modelo de la pantalla.
function vistaModelos(){
 return modelos.map(m=>{try{leer(m);}catch{}return {nombre:m.nombre,producto:m.producto,tecnica:m.tecnica,zonaDatos:zona(m),ancho:m.ancho,ubicacion:m.ubicacion,filas:m.filas,logoNombre:logoOriginal?.name,logoGeometria:logo&&m.ancho?{anchoPx:logo.width,altoPx:logo.height,anchoCm:m.ancho/100}:null};});
}
function calcularConversion(){
 for(const el of $('#cvLineas').querySelectorAll('[data-linea]')){const l=lineas[Number(el.dataset.linea)];l.colorId=el.querySelector('[data-cv=color]')?.value??'';l.cantidades=Object.fromEntries([...el.querySelectorAll('[data-talla]')].map(i=>[i.dataset.talla,i.value===''?0:Number(i.value)]));}
 const r=armarPedido({modelos:vistaModelos(),lineas,colores:datos.colores,escala:window.ZAIN.escalaMaxLogo||1,folio:actual?.folio||''});
 for(const el of $('#cvLineas').querySelectorAll('[data-linea]')){const k=Number(el.dataset.linea),l=lineas[k],sel=r.selecciones.filter(s=>s.modelo===l.modelo&&s.colorId===l.colorId);el.querySelector('[data-cv=nota]').textContent=sel.map(s=>(s.item.tallas||s.item.piezas+' piezas')+' a '+pesos(s.precio)+' / pza').join(' · ');}
 const q=(()=>{try{return comercial(modelos,opcionesComerciales(''));}catch{return null;}})(),cargo=q?.cargo?.importe||0,sub=r.subtotal+cargo,iva=q?.impuesto?Math.round(sub*q.impuesto/10000):0;
 $('#cvTotal').innerHTML=r.piezas?`<span>${r.piezas} piezas en ${r.selecciones.length} ${r.selecciones.length===1?'partida':'partidas'}</span><span>Productos ${esc(pesos(r.subtotal))}${cargo?' · '+esc(q.cargo.concepto)+' '+esc(pesos(cargo)):''}${iva?' · IVA '+esc(pesos(iva)):''}</span><b>Total estimado ${esc(pesos(sub+iva))}</b>`:'';
 $('#cvErrores').innerHTML=r.errores.map(e=>'<li>'+esc(e)+'</li>').join('');
 $('#cvCrear').disabled=convirtiendo||!!r.errores.length||!r.selecciones.length;
 return r;
}
$('#cmPasar').addEventListener('click',()=>{
 if(!modelos.length)return avisar('Agrega un modelo para pasar la cotización a pedido.');
 // Sin prenda no tiene color: su línea solo pide piezas.
 lineas=modelos.map((m,i)=>({modelo:i,colorId:nodo(m).querySelector('[data-campo=color]')?.value??'',cantidades:{}}));
 $('#cvCliente').value=$('#cmDestinatario').value.trim();$('#cvResultado').hidden=true;$('#cvEstado').textContent='';$('#cvCrear').hidden=false;$('#cvCancelar').textContent='Cancelar';
 $('#cmConvertir').hidden=false;$('#cmForm .cm-exportar').hidden=true;pintarLineas();$('#cvEstado').textContent=!logoOriginal&&modelos.some(m=>m.tecnica)?'El pedido quedará con logo pendiente; confirma el diseño antes de enviarlo a producción.':'';$('#cmConvertir').scrollIntoView({block:'start',behavior:'smooth'});
});
$('#cvCancelar').addEventListener('click',cerrarConversion);
$('#cvLineas').addEventListener('input',calcularConversion);
$('#cvLineas').addEventListener('change',calcularConversion);
$('#cvLineas').addEventListener('click',e=>{
 const b=e.target.closest('[data-cv=otro],[data-cv=quitar]');if(!b)return;calcularConversion();
 if(b.dataset.cv==='otro'){const i=Number(b.dataset.modelo),m=modelos[i],usados=lineas.filter(l=>l.modelo===i).map(l=>l.colorId);lineas.push({modelo:i,colorId:(m.producto.colores||[]).find(c=>!usados.includes(c))||m.producto.colores?.[0],cantidades:{}});}
 else lineas.splice(Number(b.closest('[data-linea]').dataset.linea),1);
 pintarLineas();
});
// Render del diseño para el taller, del mismo tamaño que los pedidos del catálogo.
// Imagen de la partida fuera de catálogo para el pedido: PNG de 1200 px (el servidor solo acepta renders PNG).
async function fotoPedido(m,conLogo){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1200;
 try{dibujarLibre(canvas.getContext('2d'),m.foto.img,conLogo?logo:null,1200);return await new Promise((ok,mal)=>canvas.toBlob(b=>b?ok(b):mal(Error('No se pudo preparar la foto de '+m.nombre+'.')),'image/png'));}
 finally{canvas.width=canvas.height=0;}
}
async function renderPedido(m,colorId){
 const p=m.producto,col=datos.colores.find(c=>c.id===colorId)||color(m),src=p.fotosColor?.[colorId]||p.fotoRender||p.foto;if(!src)throw Error(m.nombre+' no tiene render para el pedido.');
 const img=await window.ZR.cargar(src),S=1200,canvas=document.createElement('canvas');canvas.width=canvas.height=S;const g=canvas.getContext('2d'),z=zona(m);
 g.drawImage(window.ZR.tenir(img,p.fotosColor?.[colorId]?null:col.hex,S,p.fotoColor?datos.colores.find(c=>c.id===p.fotoColor)?.hex:null,p.acabadosFijos||null),0,0);
 window.ZR.estampar(g,img,logo,{x:z.x*S/1000,y:z.y*S/1000,ancho:m.ancho/100*p.pxPorCm*S/1000,tecnica:m.tecnicaID,S,sombraLocal:!!p.fotosColor,giro:z.giro,sesgo:z.sesgo,inclina:z.inclina,compresion:z.compresion,textura:z.textura});
 const blob=await new Promise(ok=>canvas.toBlob(ok,'image/png'));canvas.width=canvas.height=0;if(!blob)throw Error('No se pudo preparar el diseño de '+m.nombre+'.');return blob;
}
// Mismas operaciones públicas que usa el catálogo para crear una solicitud.
async function publico(op,body){
 const r=await fetch((window.ZAIN.pedidosApi||'/api/pedidos')+'?op='+op,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(60000)});
 const d=await r.json().catch(()=>({}));if(!r.ok){const e=Error(d.error||'No se pudo crear el pedido.');e.status=r.status;throw e;}return d;
}
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
// Reintentos sin duplicar: la misma conversión reutiliza id y token mientras no cambien las cantidades.
function borradorConversion(huella){
 const llave='zain-cm-conversion-'+actual.id;let d=null;try{d=JSON.parse(sessionStorage.getItem(llave));}catch{}
 if(!d||d.huella!==huella)d={huella,id:crypto.randomUUID(),token:hex(crypto.getRandomValues(new Uint8Array(32)))};
 const guardarD=()=>{try{sessionStorage.setItem(llave,JSON.stringify(d));}catch{}};guardarD();return {d,guardarD,borrar:()=>{try{sessionStorage.removeItem(llave);}catch{}}};
}
// La cotización del pedido recibe exactamente los precios, cargo, IVA, vigencia, entrega y anticipo de esta cotización.
// costos: el costo escrito de cada artículo fuera de catálogo (null o undefined = no tocar el costo de esa partida).
function borradorPedido(b,precios,q,costos=[]){
 const e=entrada(b),conCargo=!!q.cargo;
 return {...e,partidas:e.partidas.map((p,i)=>({...p,precio:precios[i],...(costos[i]!=null?{prenda:costos[i]}:{}),...(conCargo?{}:{cargoAparte:false})})),cargos:conCargo?[{concepto:q.cargo.concepto.slice(0,80),importe:q.cargo.importe,costo:b.cargos?.[0]?.costo??null}]:[],
  impuesto:q.impuesto,vigencia:q.vigencia||'',plazo:q.plazo||b.plazo||'',condiciones:q.notas||'',destinatario:q.destinatario||'',pagos:q.anticipo==null?null:{anticipo:q.anticipo,instrucciones:b.pagos?.instrucciones||'Coordina con ZAIN los datos para el anticipo.'}};
}
$('#cvCrear').addEventListener('click',async()=>{
 if(convirtiendo)return;const r=calcularConversion(),cliente=$('#cvCliente').value.replace(/\s+/g,' ').trim();
 if(r.errores.length||!r.selecciones.length)return;
 if(cliente.length<2){$('#cvCliente').focus();return $('#cvEstado').textContent='Escribe el nombre del cliente o empresa.';}
 const session=epoca,estado=t=>{if(session===epoca)$('#cvEstado').textContent=t;};
 convirtiendo=true;$('#cvCrear').disabled=true;$('#cmCampos').disabled=true;
 try{
  estado('Guardando la cotización…');if(sucio||!actual)await guardar();
  const q=documentoComercial(actual.folio,{permitirLogoPendiente:true});
  estado('Preparando diseños…');
  const archivos=[];
  // Sin prenda no lleva render (no hay prenda que mostrar): el taller recibe el logo original.
  // Fuera de catálogo con foto: la foto (con el logo en la esquina si lo lleva) es la imagen de la partida en Pedidos y Mi pedido.
  for(const [i,s] of r.selecciones.entries()){const md=modelos[s.modelo];if(s.item.libre&&md?.foto?.img){const render=await fotoPedido(md,s.item.tieneLogo);s.item.tieneRender=true;archivos.push({item:i,kind:'render',name:'foto.png',type:'image/png',size:render.size,blob:render});}}
  for(const [i,s] of r.selecciones.entries()){if(!s.item.tieneLogo)continue;if(s.item.servicio){archivos.push({item:i,kind:'logo',name:logoOriginal.name,type:logoOriginal.type,size:logoOriginal.size,blob:logoOriginal});continue;}const render=await renderPedido(modelos[s.modelo],s.colorId);archivos.push({item:i,kind:'logo',name:logoOriginal.name,type:logoOriginal.type,size:logoOriginal.size,blob:logoOriginal},{item:i,kind:'render',name:'render.png',type:'image/png',size:render.size,blob:render});}
  if(archivos.reduce((s,f)=>s+f.size,0)>30*1024*1024)throw Error('Los archivos suman más de 30 MB: el logo es muy pesado para tantas partidas. Sube una versión más ligera del logo.');
  const items=r.selecciones.map(s=>s.item),manifest=archivos.map(({blob,...f})=>f);
  const huella=hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify({items,cliente}))));
  const {d,guardarD,borrar}=borradorConversion(huella);
  if(!d.recibo){
   estado('Creando el pedido…');
   // Una partida sin prenda solo la acepta el servidor con la sesión del equipo.
   const cuerpo={id:d.id,token:d.token,items,files:manifest,cliente:{nombre:cliente}},soloCotizar=r.selecciones.some(s=>!s.item.servicio&&modelos[s.modelo]?.producto?.activo===false),crear=()=>items.some(x=>x.servicio)||soloCotizar?api('crear',cuerpo):publico('crear',cuerpo);
   await crear(); // Un conflicto conserva el identificador: nunca crear un segundo pedido a ciegas.
   const s=await publico('subidas',{id:d.id,token:d.token});let n=0;
   for(const f of s.files||[]){
    const local=archivos.find(x=>x.item===f.item&&x.kind===f.kind);if(!local)throw Error('Falta un archivo del pedido.');
    if(!f.subido){estado('Subiendo archivos '+(++n)+' de '+archivos.length+'…');const up=await fetch(f.url,{method:'PUT',headers:{'Content-Type':local.type},body:local.blob,signal:AbortSignal.timeout(120000)});if(!up.ok&&up.status!==409)throw Error('No se pudo subir un archivo. Vuelve a pulsar Crear pedido: no se duplicará.');}
   }
   d.recibo=await publico('finalizar',{id:d.id,token:d.token});guardarD();
  }
  estado('Poniendo los precios cotizados…');
  const c=(await api('cotizacion',undefined,{id:d.recibo.id})).cotizacion;
  let out=(await api('cotizacion-guardar',{id:d.recibo.id,version:c.version,borrador:borradorPedido(c.borrador,r.selecciones.map(s=>s.precio),q,r.selecciones.map(s=>s.costo))})).cotizacion;
  if($('#cvPublicar').checked&&!out.publicada){estado('Publicando la cotización del pedido…');out=(await api('cotizacion-publicar',{id:d.recibo.id,version:out.version})).cotizacion;}
  const v=await api('cm-convertir',{id:actual.id,version:actual.version,pedido_id:d.recibo.id});aplicarGuardada(v.cotizacion);borrar();void cargarLista();
  estado('');$('#cvLineas').replaceChildren();$('#cvTotal').replaceChildren();$('#cvErrores').replaceChildren();
  $('#cvResultado').innerHTML=`<b>Pedido ${esc(d.recibo.folio)} creado</b><p>${r.piezas} piezas · ${$('#cvPublicar').checked?'cotización publicada en Mi pedido':'cotización del pedido en borrador'}. Ya aparece en Pedidos.</p><div><button type="button" class="btn btn--azul" data-pedido="${esc(d.recibo.id)}">Abrir pedido</button><button type="button" class="btn btn--linea" data-enlace="${esc(d.recibo.url)}">Copiar enlace para el cliente</button></div>`;
  $('#cvResultado').hidden=false;$('#cvCrear').hidden=true;$('#cvCancelar').textContent='Cerrar';avisar(actual.folio+' convertida en el pedido '+d.recibo.folio+'.');
 }catch(e){estado(e.message);}
 finally{convirtiendo=false;if(session===epoca&&datos)$('#cmCampos').disabled=false;if(!$('#cvResultado').hidden)$('#cvCrear').disabled=true;else calcularConversion();cabecera();}
});
const abrirPedido=id=>{$('#verPedidos').click();dispatchEvent(new CustomEvent('zain:abrir-pedido',{detail:id}));};
$('#cvResultado').addEventListener('click',async e=>{
 const p=e.target.closest('[data-pedido]'),l=e.target.closest('[data-enlace]');
 if(p)abrirPedido(p.dataset.pedido);
 if(l){try{await navigator.clipboard.writeText(l.dataset.enlace);$('#cvEstado').textContent='Enlace copiado. Envíalo al cliente por WhatsApp.';}catch{$('#cvEstado').textContent=l.dataset.enlace;}}
});
$('#cmVerPedido').addEventListener('click',()=>{if(actual?.pedido_id)abrirPedido(actual.pedido_id);});
addEventListener('beforeunload',e=>{if(sucio&&modelos.length){e.preventDefault();e.returnValue='';}});
addEventListener('zain:equipo-listo',()=>{if(location.hash==='#cotizaciones'&&$('#seccionCotizaciones').hidden)$('#verCotizaciones').click();});
addEventListener('zain:equipo-salio',()=>{
 epoca++;cargando=false;datos=null;catalogo=[];limpiar();actual=null;lista=[];
 $('#cmModelo').replaceChildren();$('#cmLista').replaceChildren();$('#cmVigencia').value='';$('#cmCampos').disabled=true;$('#seccionCotizaciones').hidden=true;mostrarEditor(false);cabecera();avisar('');
});

// ===== Cotización rápida (JP, 20-nov-2026; rehecha el 26-nov-2026) =====
// JP (26-nov): «que todo se pueda modificar… de tantas a tantas piezas a este precio». Cada partida: prenda del catálogo
// (opcional) o artículo escrito a mano, concepto, descripción, foto, y una tabla de precios por rango de piezas con
// costo y precio editables. El costo y el precio se proponen (catálogo y margen) solo mientras nadie los cambie.
const minimo=a=>{const n=a.filter(Number.isSafeInteger);return n.length?Math.min(...n):null;};
const nodoR=r=>$('#crFilas [data-rapida="'+r.id+'"]');
const rapidaDe=e=>rapidas.find(r=>r.id===Number(e.closest('[data-rapida]')?.dataset.rapida));
const nombreRapida=r=>nodoR(r)?.querySelector('[data-cr=concepto]').value.trim()||'la partida '+(rapidas.indexOf(r)+1);
const MAX_RANGOS=12;
function ponerModo(m){
 modo=m;const rapida=m==='rapida';
 for(const id of ['#cmLogoPanel','#cmModelosPanel','#cmModelos','#cmRedondeoCampo'])$(id).hidden=rapida;
 $('#cmRapida').hidden=!rapida;
 if(rapida){const t=TEXTOS;for(const [id,v] of [['#crTitulo1',t.titulo1],['#crTitulo2',t.titulo2],['#crSeccion',t.seccion],['#crEtiqueta',t.etiqueta],['#crNotasPie',t.notas]])if(!$(id).value)$(id).value=v;}
 resumen();cabecera();
}
function crudoTextos(){return {titulo1:$('#crTitulo1').value,titulo2:$('#crTitulo2').value,seccion:$('#crSeccion').value,etiqueta:$('#crEtiqueta').value,notas:$('#crNotasPie').value,pasos:$('#crPasos').checked};}
const filasRango=r=>[...nodoR(r).querySelectorAll('[data-escala]')];
const esAuto=i=>i.dataset.auto!=null&&i.value===i.dataset.auto;
function crudoRapida(r){
 const el=nodoR(r),v=k=>el.querySelector('[data-cr="'+k+'"]').value;
 const escalas=filasRango(r).map(f=>{const e=k=>f.querySelector('[data-e="'+k+'"]');return {desde:e('desde').value,hasta:e('hasta').value,costo:e('costo').value,precio:e('precio').value,autoCosto:esAuto(e('costo')),autoPrecio:esAuto(e('precio'))};});
 return {sku:LIBRE,concepto:v('concepto'),descripcion:v('descripcion'),cantidad:v('cantidad'),descuento:v('descuento'),margen:v('margen'),escalas,
  ...(r.foto?.objeto?{foto:{objeto:r.foto.objeto,mime:r.foto.mime}}:{}),
  ...(r.cat?{catalogo:{sku:r.cat.p.sku,color:v('color'),tecnica:v('tecnica'),ancho:v('ancho'),alto:v('alto')}}:{})};
}
function lineaRapida(r){
 const c=crudoRapida(r),nombre=nombreRapida(r),txt=t=>String(t??'').trim();
 const entero=(t,msg)=>{if(!txt(t))return null;const n=Number(txt(t));if(!Number.isSafeInteger(n)||n<1)throw Error(msg);return n;};
 const dinero=t=>{if(!txt(t))return null;try{return decimal(txt(t));}catch{throw Error('Revisa los importes de '+nombre+'.');}};
 const escalas=c.escalas.map(e=>({desde:entero(e.desde,'Las piezas de los rangos de '+nombre+' deben ser números enteros.'),hasta:entero(e.hasta,'Las piezas de los rangos de '+nombre+' deben ser números enteros.'),costo:dinero(e.costo),precio:dinero(e.precio)}));
 return {concepto:c.concepto,descripcion:c.descripcion,cantidad:entero(c.cantidad,'La cantidad de '+nombre+' debe ser un número entero.'),descuento:dinero(c.descuento)??0,escalas};
}
const proyeccionRapida=(folio=actual?.folio||'')=>comercialRapida(rapidas.map(lineaRapida),{...opcionesComerciales(folio),textos:crudoTextos()});
function htmlRango(e={}){
 const v=k=>esc(e[k]??''),auto=(k,f)=>f?` data-auto="${v(k)}"`:'';
 return `<div class="cr-rango" data-escala><label><span>De (pzas)</span><input data-e="desde" type="number" min="1" step="1" inputmode="numeric" placeholder="1" value="${v('desde')}"></label><label><span>A (pzas)</span><input data-e="hasta" type="number" min="1" step="1" inputmode="numeric" placeholder="Sin límite" value="${v('hasta')}"></label><label><span>Costo / pza</span><input data-e="costo" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Opcional" value="${v('costo')}"${auto('costo',e.autoCosto)}></label><label><span>Precio / pza sin IVA</span><input data-e="precio" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0.00" value="${v('precio')}"${auto('precio',e.autoPrecio)}></label><button type="button" class="btn-texto cr-rango__quitar" data-cr="quitar-rango" aria-label="Quitar este rango">✕</button><small class="cr-rango__nota" data-e-nota></small></div>`;
}
function pintarRapida(l={}){
 if(rapidas.length>=20){avisar('La cotización admite hasta 20 partidas.');return null;}
 const r={id:++rapidaId,rapida:true,foto:null,fotoTurno:0,fotoOcupada:false,cat:null,vista:null,vistaTurno:0,auto:{}};rapidas.push(r);
 const el=document.createElement('article');el.className='cr-fila';el.dataset.rapida=r.id;
 const val=k=>esc(l[k]??'');
 // Partidas de antes: un solo precio y costo = un rango sin límites.
 const escalas=Array.isArray(l.escalas)&&l.escalas.length?l.escalas:[{precio:l.precio||l.catalogo?.precioCotizado||'',costo:l.costo??''}];
 const margen=l.margen??l.catalogo?.margen??(datos?.margen==null?'':String(datos.margen/100));
 el.innerHTML=`<div class="cr-foto"><label class="cr-foto__caja" title="Foto de la partida (opcional)"><canvas width="240" height="240" hidden></canvas><span data-cr-foto-texto>+ Foto<small>opcional</small></span><input data-cr-foto type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" aria-label="Foto de la partida"></label><button type="button" class="btn-texto" data-cr="quitar-foto" hidden>Quitar foto</button></div>
<div class="cr-datos"><div class="cr-buscar"><label>Prenda del catálogo (opcional)<input data-cr-buscar list="crCatalogo" autocomplete="off" placeholder="Busca polo, chamarra, código o SKU"></label><button type="button" class="btn-texto" data-cr="desligar" hidden>Quitar prenda del catálogo</button></div>
<div class="cr-cat" data-cr-cat hidden><label>Color<select data-cr="color"></select></label><label>Personalización<select data-cr="tecnica"></select></label><label data-cr-medida hidden>Logo ancho × alto (cm)<span class="cr-medida"><input data-cr="ancho" type="number" min="0.01" step="0.01" inputmode="decimal" aria-label="Ancho del logo en cm"><input data-cr="alto" type="number" min="0.01" step="0.01" inputmode="decimal" aria-label="Alto del logo en cm"></span></label></div>
<label>Concepto<input data-cr="concepto" maxlength="150" autocomplete="off" placeholder="Ej. Chamarra softshell con logo bordado" value="${val('concepto')}"></label>
<label>Descripción (opcional)<textarea data-cr="descripcion" rows="2" maxlength="400" placeholder="Ej. Bordado al pecho, colores a elegir">${val('descripcion')}</textarea></label>
<div class="cr-precios"><div class="cr-precioscab"><b>Precios</b><label class="cr-margen">Margen para sugerir precio (%)<input data-cr="margen" type="number" min="0" max="99.99" step="0.01" inputmode="decimal" placeholder="Ej. 35" value="${esc(margen)}"></label></div>
<div data-cr-escalas>${escalas.map(htmlRango).join('')}</div>
<button type="button" class="btn btn--linea cr-agregar-rango" data-cr="agregar-rango">+ Agregar rango de piezas</button>
<p class="cot-ayuda cr-ayuda">Un rango sin piezas = el mismo precio para cualquier cantidad. Escribe el costo y el precio se sugiere con el margen; si escribes el precio, ese manda.</p></div>
<div class="cr-numeros cr-numeros--2"><label>Cantidad (opcional, para el total)<input data-cr="cantidad" type="number" min="1" step="1" inputmode="numeric" placeholder="Sin cantidad" value="${val('cantidad')}"></label><label>Descuento %<input data-cr="descuento" type="number" min="0" max="100" step="0.01" inputmode="decimal" placeholder="0" value="${val('descuento')}"></label></div>
<p class="cr-importe" data-cr-importe></p></div>
<div class="cr-acciones"><button type="button" class="btn-texto" data-cr="subir" aria-label="Subir partida">↑</button><button type="button" class="btn-texto" data-cr="bajar" aria-label="Bajar partida">↓</button><button type="button" class="btn-texto" data-cr="quitar">Quitar</button></div>`;
 $('#crFilas').append(el);
 // Al abrir una guardada, la partida vuelve a ligarse a su prenda (si sigue en el catálogo) sin cambiar sus precios.
 const p=l.catalogo?.sku&&catalogo.find(x=>x.sku===l.catalogo.sku);if(p)ligarCatalogo(r,p,l.catalogo);
 return r;
}
function pintarFotoRapida(r){
 const el=nodoR(r);if(!el)return;const canvas=el.querySelector('canvas'),img=r.foto?.img||(r.foto?null:r.vista);
 canvas.hidden=!img;el.querySelector('[data-cr-foto-texto]').hidden=!!img;el.querySelector('[data-cr=quitar-foto]').hidden=!r.foto;
 canvas.title=r.foto?'Foto de la partida':r.vista?'Render del catálogo · toca para usar otra foto':'';
 if(img){const g=canvas.getContext('2d'),S=canvas.width,k=Math.min(S/img.width,S/img.height),w=img.width*k,h=img.height*k;g.fillStyle='#fff';g.fillRect(0,0,S,S);g.drawImage(img,(S-w)/2,(S-h)/2,w,h);}
 else if(r.foto)el.querySelector('[data-cr-foto-texto]').innerHTML='Foto guardada<small>no se pudo abrir; súbela de nuevo</small>';
}
// Un campo propuesto se actualiza solo mientras siga igual a lo propuesto (o vacío); lo escrito a mano no se toca.
function proponer(input,valor){
 if(input.value.trim()!==''&&!esAuto(input))return;
 input.value=valor;input.dataset.auto=valor;
}
// Costo de cada rango desde el catálogo (con las piezas «De» del rango) y precio con el margen de la partida.
function proponerPrecios(r,excepto=null){
 const el=nodoR(r);if(!el)return;
 let margen=null;try{const t=el.querySelector('[data-cr=margen]').value.trim();margen=t?decimal(t):null;if(margen!=null&&margen>9999)margen=null;}catch{margen=null;}
 for(const f of filasRango(r)){
  const e=k=>f.querySelector('[data-e="'+k+'"]'),desde=Number(e('desde').value)||1;
  if(r.cat&&e('costo')!==excepto){try{const a=calculoCatalogo(r,desde);proponer(e('costo'),a.costo==null?'':numero(a.costo));}catch{}}
  if(e('precio')!==excepto){
   let costo=null;try{costo=e('costo').value.trim()?decimal(e('costo').value.trim()):null;}catch{costo=null;}
   let sugerido=null;try{sugerido=costo==null||margen==null?null:precioFila({costo,otros:0},{margen,redondeo:100}).sugerido;}catch{sugerido=null;}
   proponer(e('precio'),sugerido==null?'':numero(sugerido));
  }
 }
}
function actualizarRapidas(){
 if(modo!=='rapida')return;
 for(const r of rapidas){const el=nodoR(r),out=el.querySelector('[data-cr-importe]');out.classList.remove('cm-negativo');
  try{
   const l=lineaRapida(r),filas=filasRango(r);
   l.escalas.forEach((e,i)=>{const nota=filas[i].querySelector('[data-e-nota]'),u=e.costo!=null&&e.precio!=null?e.precio-e.costo:null;
    nota.textContent=[e.precio!=null&&esAuto(filas[i].querySelector('[data-e=precio]'))?'Sugerido con el margen':'',u==null?'':'Utilidad '+pesos(u)+' / pza'+(e.precio?' ('+(Math.round(u/e.precio*1000)/10).toLocaleString('es-MX')+'%)':'')].filter(Boolean).join(' · ');
    nota.classList.toggle('cm-negativo',u!=null&&u<0);});
   const aplica=rangoDe(l.escalas,l.cantidad);
   if(l.cantidad!=null&&!aplica)throw Error('Ningún rango incluye '+l.cantidad+' piezas: revisa los rangos o la cantidad.');
   const imp=aplica?importeLinea({cantidad:l.cantidad,precio:aplica.precio,descuento:l.descuento}):null;
   out.textContent=l.cantidad!=null?(aplica.precio==null?'Escribe el precio del rango de '+l.cantidad+' piezas.':'Importe '+pesos(imp)+' ('+l.cantidad+' pzas × '+pesos(aplica.precio)+(l.descuento?' con '+l.descuento/100+'% de descuento':'')+')'+(aplica.costo!=null?' · utilidad '+pesos(imp-aplica.costo*l.cantidad):''))
    :l.escalas.length>1?'Sin cantidad: el cliente ve los '+l.escalas.length+' precios por rango de piezas.':l.escalas[0].precio==null?'Escribe el precio.':'Sin cantidad: el cliente ve el precio por pieza.';
   if(aplica?.costo!=null&&imp!=null&&imp<aplica.costo*l.cantidad)out.classList.add('cm-negativo');
   if(r.cat)out.textContent+=' · '+notaCatalogo(r);
  }catch(e){out.textContent=e.message;out.classList.add('cm-negativo');}
  el.querySelector('[data-cr=agregar-rango]').disabled=filasRango(r).length>=MAX_RANGOS;
  for(const b of el.querySelectorAll('[data-cr=quitar-rango]'))b.hidden=filasRango(r).length<2;
 }
 let q=null,error='';try{q=proyeccionRapida();}catch(e){error=e.message;}
 $('#crTotales').innerHTML=q?.total!=null?`<span>Productos ${esc(pesos(q.bruto))}</span>${q.descuento?`<span>Descuento −${esc(pesos(q.descuento))}</span>`:''}${q.cargos.map(c=>`<span>${esc(c.concepto)} ${esc(pesos(c.importe))}</span>`).join('')}<span>${q.impuesto?'IVA '+q.impuesto/100+'%':'Sin IVA'} ${esc(pesos(q.impuestos))}</span><b>Total ${esc(pesos(q.total))}</b>`
  :`<span>${esc(error||'Sin total: escribe la cantidad de cada partida para ver el total (no es obligatorio).')}</span>`;
 resumen();
}
async function ponerFotoRapida(r,archivo){
 if(!archivo)return;const turno=++r.fotoTurno,session=epoca;r.fotoOcupada=true;avisar('Preparando foto…');
 try{const f=await prepararFoto(archivo);if(turno!==r.fotoTurno||session!==epoca||!nodoR(r))return;r.foto={...f,objeto:null};marcarSucio();avisar('Foto agregada a '+nombreRapida(r)+'. Se sube al guardar.');}
 catch(e){if(turno===r.fotoTurno)avisar(e.message);}
 finally{if(turno===r.fotoTurno){r.fotoOcupada=false;const el=nodoR(r);if(el){el.querySelector('[data-cr-foto]').value='';pintarFotoRapida(r);}}}
}
$('#crAgregar').addEventListener('click',()=>{const r=pintarRapida();if(!r)return;actualizarRapidas();marcarSucio();nodoR(r).querySelector('[data-cr-buscar]').focus();});
for(const tipo of ['input','change'])$('#cmForm').addEventListener(tipo,e=>{if(modo==='rapida'&&!e.target.matches('[data-cr-foto]'))actualizarRapidas();});
$('#crFilas').addEventListener('change',e=>{const input=e.target.closest('[data-cr-foto]'),r=input&&rapidaDe(input);if(r)void ponerFotoRapida(r,input.files[0]);});
// Costo, piezas «De» y margen cambian lo propuesto en la misma partida (antes de recalcular totales en #cmForm).
$('#crFilas').addEventListener('input',e=>{
 const r=rapidaDe(e.target);if(!r)return;
 if(e.target.matches('[data-e=precio],[data-e=costo]'))delete e.target.dataset.auto;
 if(e.target.matches('[data-e=costo],[data-e=desde],[data-cr=margen],[data-cr=ancho],[data-cr=alto]'))proponerPrecios(r,e.target);
});
$('#crFilas').addEventListener('click',e=>{
 const b=e.target.closest('button[data-cr]'),r=b&&rapidaDe(b);if(!r)return;const el=nodoR(r),i=rapidas.indexOf(r),accion=b.dataset.cr;
 if(accion==='quitar-foto'){r.fotoTurno++;r.fotoOcupada=false;r.foto=null;pintarFotoRapida(r);avisar('Foto retirada.');}
 else if(accion==='quitar'){r.fotoTurno++;r.vistaTurno++;rapidas.splice(i,1);el.remove();avisar('Partida quitada.');}
 else if(accion==='subir'&&i>0){rapidas.splice(i-1,0,...rapidas.splice(i,1));el.previousElementSibling.before(el);}
 else if(accion==='bajar'&&i<rapidas.length-1){rapidas.splice(i+1,0,...rapidas.splice(i,1));el.nextElementSibling.after(el);}
 else if(accion==='agregar-rango'){
  const filas=filasRango(r);if(filas.length>=MAX_RANGOS)return;
  // El rango nuevo empieza donde terminó el anterior.
  const ult=filas.at(-1),hasta=Number(ult?.querySelector('[data-e=hasta]').value)||null;
  el.querySelector('[data-cr-escalas]').insertAdjacentHTML('beforeend',htmlRango({desde:hasta?String(hasta+1):''}));
  proponerPrecios(r);filasRango(r).at(-1).querySelector(hasta?'[data-e=hasta]':'[data-e=desde]').focus();
 }
 else if(accion==='quitar-rango'){const f=b.closest('[data-escala]');if(filasRango(r).length>1)f.remove();}
 else return;
 marcarSucio();actualizarRapidas();
});
async function restaurarRapida(x,duplicar){
 limpiar();ponerModo('rapida');const d=x.datos||{};
 for(const [k,sel] of Object.entries(CAMPOS))if(d[k]!=null)$(sel).value=d[k];
 $('#cmDestinatario').value=x.cliente||d.destinatario||'';if(duplicar)$('#cmVigencia').value=hoyMX(15);
 const t={...TEXTOS,...(d.textos||{})};$('#crTitulo1').value=t.titulo1;$('#crTitulo2').value=t.titulo2;$('#crSeccion').value=t.seccion;$('#crEtiqueta').value=t.etiqueta;$('#crNotasPie').value=t.notas;$('#crPasos').checked=t.pasos!==false;
 const sinFoto=[];
 const filas=(d.modelos||[]).map(s=>[pintarRapida(s),s]).filter(([r])=>r);
 await Promise.all(filas.filter(([,s])=>s.foto?.objeto).map(async([r,s])=>{
  try{const url=x.fotosUrl?.[s.foto.objeto];if(!url)throw Error();const res=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!res.ok)throw Error();const blob=await res.blob();
   r.foto={objeto:duplicar?null:s.foto.objeto,mime:s.foto.mime||blob.type||'image/jpeg',img:await createImageBitmap(blob),blob};}
  catch{sinFoto.push(s.concepto||'una partida');r.foto=duplicar?null:{objeto:s.foto.objeto,mime:s.foto.mime||'image/jpeg',img:null,blob:null};}
 }));
 for(const [r] of filas)pintarFotoRapida(r);
 actual=duplicar?null:{id:x.id,version:x.version,folio:x.folio,estado:x.estado,logo:null,pedido_id:x.pedido_id||null};cabecera();
 actualizarRapidas();if(duplicar)marcarSucio();else marcarLimpio();pintarLista();
 return [duplicar?'Copia de '+x.folio+' lista; guárdala para darle folio nuevo.':x.folio+' abierta.',sinFoto.length?'No se pudo recuperar la foto de '+sinFoto.join(', ')+'; súbela de nuevo.':''].filter(Boolean).join(' ');
}
// PDF: mismo membrete; la foto de cada partida, y sin foto la partida sale como renglón delgado.
async function pdfRapida(q){
 if(rapidas.some(r=>r.fotoOcupada))throw Error('Espera a que termine de cargar la foto.');
 const urls=[],imagenes={};
 try{
  for(const [i,r] of rapidas.entries()){const img=r.foto?.img||(r.foto?null:r.vista);if(!img)continue;const blob=r.foto?.blob||await new Promise(ok=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(img,0,0);c.toBlob(ok,'image/jpeg',.9);});const url=URL.createObjectURL(blob);urls.push(url);imagenes[i]={src:url,referencia:false};}
  const {descargarPDF}=await import('./cotizacion-pdf.js?v=23');
  await descargarPDF(documentoRapida(q),{folio:q.folio,imagenes,textos:textosPDF(q)});
 }finally{setTimeout(()=>urls.forEach(u=>URL.revokeObjectURL(u)),60000);}
}

// Clientes (21-nov-2026): «Cliente o empresa» sugiere las fichas de Clientes y guarda a cuál pertenece la cotización.
// Desde la ficha de un cliente se abre, se duplica (para él o para otro) o se empieza una cotización nueva.
let clientesPorNombre=new Map();
const claveCliente=s=>String(s||'').toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').trim();
addEventListener('zain:clientes-lista',e=>{
 const l=Array.isArray(e.detail)?e.detail:[],veces=new Map();
 for(const c of l)veces.set(claveCliente(c.nombre),(veces.get(claveCliente(c.nombre))||0)+1);
 // Dos fichas con el mismo nombre no se adivinan: la cotización se liga después por nombre.
 clientesPorNombre=new Map(l.filter(c=>veces.get(claveCliente(c.nombre))===1).map(c=>[claveCliente(c.nombre),c.id]));
 $('#cmClientes').innerHTML=l.map(c=>`<option value="${esc(c.nombre)}"></option>`).join('');
});
function clienteElegido(){return clientesPorNombre.get(claveCliente($('#cmDestinatario').value))||null;}
async function cotizadorListo(){
 if($('#seccionCotizaciones').hidden)$('#verCotizaciones').click();
 for(let i=0;i<200&&!datos;i++)await new Promise(r=>setTimeout(r,100));
 return !!datos;
}
addEventListener('zain:abrir-cotizacion',async e=>{
 const {id,duplicar,cliente}=e.detail||{};if(!id||!await cotizadorListo())return;
 await abrir(id,!!duplicar);
 if(cliente?.nombre&&actual?.id!==id&&$('#cmDestinatario').value!==cliente.nombre){$('#cmDestinatario').value=cliente.nombre;marcarSucio();}
});
// «Cotizar este modelo» desde Catálogo (22-nov-2026): agrega la prenda a la cotización por modelos abierta o empieza una nueva.
addEventListener('zain:cotizar-modelo',async e=>{
 const {sku}=e.detail||{};if(!sku||!await cotizadorListo())return;
 const p=catalogo.find(p=>p.sku===sku);if(!p){avisar('Ese modelo no está disponible para cotizar.');return;}
 // 26-nov-2026 (JP): siempre a la cotización rápida (abierta o nueva), donde todo se puede cambiar.
 if($('#cmForm').hidden||modo!=='rapida'){if(!nueva())return;ponerModo('rapida');mostrarEditor(true);}
 const vacia=rapidas.length===1&&!crudoRapida(rapidas[0]).concepto.trim()&&!rapidas[0].cat&&!rapidas[0].foto?rapidas[0]:null;
 if(!vacia&&rapidas.length>=20)return avisar('La cotización admite hasta 20 partidas.');
 const r=vacia||pintarRapida();if(!r)return;ligarCatalogo(r,p);actualizarRapidas();marcarSucio();avisar(nombreDe(p)+' agregado a la cotización rápida.');
});
addEventListener('zain:nueva-cotizacion',async e=>{
 const {modo:m,cliente}=e.detail||{};if(!await cotizadorListo())return;
 $(m==='rapida'?'#cmRapidaNueva':'#cmNueva').click();
 if(cliente?.nombre&&!actual)$('#cmDestinatario').value=cliente.nombre;
});


// ===== Cotización rápida con prendas del catálogo (JP, 25-nov-2026; rangos el 26-nov-2026) =====
// Al elegir una prenda se proponen concepto, descripción, render del color y los rangos de piezas del proveedor con su
// costo (prenda + personalización) y su precio con el margen. Todo queda en campos normales: se cambia, se agregan o
// quitan rangos, y lo escrito a mano ya no lo vuelve a tocar nada (JP: «nos cuesta diferente que en el catálogo»).
const etiquetasCat=new Map();
const etiquetaCat=p=>nombreDe(p)+' · '+(p.skuProveedor?p.skuProveedor+' · ':'')+p.sku;
function opcionesRapida(){
 etiquetasCat.clear();const lista=catalogo.filter(p=>p.activo!==false||p.soloCotizar);
 for(const p of lista)etiquetasCat.set(etiquetaCat(p),p);
 $('#crCatalogo').innerHTML=lista.map(p=>`<option value="${esc(etiquetaCat(p))}"></option>`).join('');
 // Partidas creadas antes de que terminaran de cargar los costos: reciben el margen inicial.
 if(datos?.margen!=null)for(const i of document.querySelectorAll('#crFilas [data-cr=margen]'))if(!i.value.trim())i.value=String(datos.margen/100);
}
const productoCat=p=>({...p,colores:(p.colores||[]).map(nombreColor)});
// Rangos de piezas del proveedor para esa prenda (un solo rango = mismo costo para cualquier cantidad).
function rangosCatalogo(p){
 const vistos=new Map();
 for(const f of filasModelo(productoCat(p),datos.config))if(!vistos.has(f.desde))vistos.set(f.desde,{desde:f.desde,hasta:f.hasta});
 const r=[...vistos.values()].sort((a,b)=>a.desde-b.desde);
 return r.length>1?r.map(x=>({desde:String(x.desde),hasta:x.hasta==null?'':String(x.hasta)})):[{desde:'',hasta:''}];
}
// s: lo guardado de la partida al abrir una cotización (sus rangos y precios se respetan); sin s es una prenda recién elegida.
function ligarCatalogo(r,p,s=null){
 const el=nodoR(r);if(!el||!datos)return;
 const campo=k=>el.querySelector('[data-cr="'+k+'"]'),hay=(sel,v)=>[...sel.options].some(o=>o.value===v);
 r.cat={p};el.querySelector('[data-cr-buscar]').value=etiquetaCat(p);
 campo('color').innerHTML=(p.colores||[]).map(id=>`<option value="${esc(id)}">${esc(nombreColor(id))}</option>`).join('')||'<option value="">Por confirmar</option>';
 campo('tecnica').innerHTML='<option value="">Sin personalización</option>'+(p.tecnicas||[]).map(t=>`<option value="${esc(t)}">${esc(tecnicas[t]||t)}</option>`).join('');
 if(s){
  if(s.color&&hay(campo('color'),s.color))campo('color').value=s.color;
  if(hay(campo('tecnica'),s.tecnica||''))campo('tecnica').value=s.tecnica||'';
  campo('ancho').value=s.ancho??numero(MEDIDA_INICIAL);campo('alto').value=s.alto??numero(MEDIDA_INICIAL);
 }else{
  campo('ancho').value=numero(MEDIDA_INICIAL);campo('alto').value=numero(MEDIDA_INICIAL);
  if(!campo('margen').value.trim()&&datos.margen!=null)campo('margen').value=String(datos.margen/100);
  const c=campo('concepto'),d=campo('descripcion');
  if(!c.value.trim()||c.value===r.auto.concepto)c.value=nombreDe(p);
  if(!d.value.trim()||d.value===r.auto.descripcion)d.value=descripcionCatalogo({colorNombre:nombreColor(campo('color').value),tecnica:campo('tecnica').value});
  // Prenda nueva: los rangos del proveedor, con costo y precio propuestos (todo editable).
  el.querySelector('[data-cr-escalas]').innerHTML=rangosCatalogo(p).map(e=>htmlRango({...e,costo:'',precio:''})).join('');
  for(const i of el.querySelectorAll('[data-e=costo],[data-e=precio]'))i.dataset.auto='';
 }
 r.auto={concepto:nombreDe(p),descripcion:descripcionCatalogo({colorNombre:nombreColor(campo('color').value),tecnica:campo('tecnica').value})};
 el.querySelector('[data-cr-cat]').hidden=false;el.querySelector('[data-cr=desligar]').hidden=false;
 // Al reabrir no se recalcula nada: los precios quedan como se cotizaron hasta que se cambie algo.
 if(!s)proponerPrecios(r);medidaVisible(r);void vistaCatalogo(r);
}
function desligarCatalogo(r){
 const el=nodoR(r);if(!el)return;r.cat=null;r.vistaTurno++;r.vista=null;r.auto={};
 el.querySelector('[data-cr-cat]').hidden=true;el.querySelector('[data-cr=desligar]').hidden=true;el.querySelector('[data-cr-buscar]').value='';
 // Los costos y precios se quedan como están, ya como escritos a mano.
 for(const i of el.querySelectorAll('[data-e]'))delete i.dataset.auto;
 pintarFotoRapida(r);
}
function calculoCatalogo(r,cantidad){
 const el=nodoR(r),v=k=>el.querySelector('[data-cr="'+k+'"]').value.trim();
 const num=k=>{if(!v(k))return null;try{return decimal(v(k));}catch{return null;}};
 return costoCatalogo(productoCat(r.cat.p),datos.config,{cantidad,color:nombreColor(v('color')),tecnica:v('tecnica'),ancho:num('ancho'),alto:num('alto')});
}
function medidaVisible(r){const el=nodoR(r);try{el.querySelector('[data-cr-medida]').hidden=!calculoCatalogo(r,1).porArea;}catch{}}
function notaCatalogo(r){
 const el=nodoR(r),t=el.querySelector('[data-cr=tecnica]').value;let a;try{a=calculoCatalogo(r,1);}catch{return '';}
 const partes=[];
 if(a.prenda==null)partes.push('la prenda no tiene costo en Costos: escríbelo');
 else if(a.variasTallas)partes.push('costo propuesto con tallas '+a.tallas+'; las grandes cuestan más');
 if(t&&a.personalizacion==null)partes.push((tecnicas[t]||t)+' sin tarifa en Costos: súmala al costo');
 else if(t)partes.push('incluye '+(tecnicas[t]||t)+' '+pesos(a.personalizacion)+' / pza');
 return partes.length?'Catálogo: '+partes.join(' · '):'Costo propuesto del catálogo; cámbialo si tu trato es otro.';
}
// Render del catálogo pintado del color elegido; una foto subida a la partida manda sobre él.
async function vistaCatalogo(r){
 const el=nodoR(r);if(!el||!r.cat)return;
 const turno=++r.vistaTurno,session=epoca,p=r.cat.p,id=el.querySelector('[data-cr=color]').value,col=datos.colores.find(c=>c.id===id),propia=p.fotosColor?.[id];
 const src=propia||p.fotoRender||p.foto;
 if(src&&window.ZR){
  try{const img=await window.ZR.cargar(src);if(turno!==r.vistaTurno||session!==epoca||!nodoR(r))return;
   r.vista=window.ZR.tenir(img,propia||!col?null:col.hex,600,p.fotoColor?datos.colores.find(c=>c.id===p.fotoColor)?.hex:null,p.acabadosFijos||null);}
  catch{if(turno===r.vistaTurno)r.vista=null;}
 }else r.vista=null;
 if(turno===r.vistaTurno)pintarFotoRapida(r);
}
$('#crFilas').addEventListener('input',e=>{
 if(!e.target.matches('[data-cr-buscar]'))return;
 const r=rapidaDe(e.target),p=etiquetasCat.get(e.target.value);if(r&&p&&r.cat?.p!==p)ligarCatalogo(r,p);
});
$('#crFilas').addEventListener('change',e=>{
 const r=rapidaDe(e.target);if(!r)return;
 if(e.target.matches('[data-cr-buscar]')){
  const texto=e.target.value.trim(),p=etiquetasCat.get(e.target.value);
  if(p){if(r.cat?.p!==p)ligarCatalogo(r,p);}else if(!texto){if(r.cat)desligarCatalogo(r);}else avisar('Elige la prenda de la lista, o deja el buscador vacío para escribir el artículo a mano.');
  return;
 }
 if(!r.cat||!e.target.matches('[data-cr=color],[data-cr=tecnica]'))return;
 const el=nodoR(r),d=el.querySelector('[data-cr=descripcion]'),nueva=descripcionCatalogo({colorNombre:nombreColor(el.querySelector('[data-cr=color]').value),tecnica:el.querySelector('[data-cr=tecnica]').value});
 if(!d.value.trim()||d.value===r.auto.descripcion)d.value=nueva;r.auto.descripcion=nueva;
 proponerPrecios(r);medidaVisible(r);
 if(e.target.matches('[data-cr=color]'))void vistaCatalogo(r);
});
$('#crFilas').addEventListener('click',e=>{const b=e.target.closest('button[data-cr=desligar]'),r=b&&rapidaDe(b);if(!r)return;desligarCatalogo(r);marcarSucio();actualizarRapidas();avisar('La partida ya no está ligada al catálogo; sus precios se quedan como están.');});
