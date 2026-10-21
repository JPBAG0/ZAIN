import {configurar,decimal,decimalTarifa,pesos} from './cotizacion-core.js?v=16';
import {esc} from './cotizacion-vista.js?v=11';
import {filasModelo,precioFila,aplicacionArea,comercial,textoComercial} from './cotizacion-modelos.js?v=3';
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
nav.querySelector('#verPedidos').insertAdjacentHTML('afterend','<button type="button" id="verCotizaciones" aria-pressed="false">Cotizaciones</button>');
$('#trabajo').insertAdjacentHTML('beforeend',`<section id="seccionCotizaciones" class="cm-area" hidden>
<div class="control__titulo"><div><h1>Cotizaciones</h1><p>Precio por pieza según modelo y talla, sin capturar cantidades.</p></div><button type="button" id="cmActualizar" class="btn btn--linea">Actualizar modelos y costos</button></div>
<p id="cmEstado" class="control__estado" role="status" aria-live="polite"></p>
<section class="cot-panel cm-guardadas"><div class="cm-guardadascab"><h2>Guardadas</h2><button type="button" id="cmNueva" class="btn btn--azul">Nueva cotización</button></div><div class="cm-filtros"><input id="cmFiltro" type="search" placeholder="Buscar folio o cliente" aria-label="Buscar cotización" autocomplete="off"><label class="cot-check"><input id="cmVerDescartadas" type="checkbox">Ver descartadas</label></div><ul id="cmLista" class="cm-lista" aria-live="polite"></ul></section>
<form id="cmForm"><fieldset id="cmCampos" disabled>
<div class="cm-actual"><div><small>Editando</small><b id="cmFolio">Nueva cotización</b></div><label>Estado<select id="cmEstadoSel" disabled>${Object.entries(ESTADOS).filter(([k])=>k!=='convertida').map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label></div>
<p id="cmConvertida" class="cm-aviso" hidden></p>
<section class="cot-panel"><h2><span class="cm-paso">1</span>Cliente y condiciones</h2><div class="cm-campos cm-campos--3"><label>Cliente o empresa (opcional)<input id="cmDestinatario" maxlength="180" autocomplete="off" placeholder="Ej. Constructora del Bajío"></label><label>Precios e IVA<select id="cmIVA"><option value="1600" selected>Más IVA (16%)</option><option value="0">Sin IVA</option></select></label><label>Redondear precios<select id="cmRedondeo"><option value="100" selected>A peso cerrado</option><option value="500">A múltiplos de $5</option><option value="1">Sin redondeo (centavos)</option></select></label><label>Válida hasta<input id="cmVigencia" type="date"></label><label>Entrega (opcional)<input id="cmPlazo" maxlength="120" placeholder="Ej. 10 a 12 días hábiles tras el anticipo"></label><label>Anticipo (%)<input id="cmAnticipo" type="number" min="0" max="100" step="1" inputmode="numeric" value="50" placeholder="Sin anticipo"></label></div></section>
<section class="cot-panel"><h2><span class="cm-paso">2</span>Logo del cliente</h2><div class="cm-logo"><label>Subir logo<input id="cmLogo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label><div><p id="cmLogoEstado" class="cot-ayuda">PNG, JPG, WEBP o SVG · hasta 15 MB. Opcional si solo cotizas la prenda.</p><label class="cot-check"><input id="cmQuitarFondo" type="checkbox">Quitar fondo del logo</label><button type="button" id="cmEliminarLogo" class="btn-texto" hidden>Quitar logo</button></div></div></section>
<section class="cot-panel"><h2><span class="cm-paso">3</span>Modelos</h2><div class="cm-agregar"><label>Buscar<input id="cmBuscar" type="search" placeholder="Polo, playera, gorra, SKU…" autocomplete="off"></label><label>Modelo<select id="cmModelo"></select></label><button type="button" id="cmAgregar" class="btn btn--azul">Agregar</button></div><p class="cot-ayuda">El precio se calcula con el margen de tus Costos; puedes cambiar el margen del modelo o escribir el precio de cualquier talla.</p></section>
<div id="cmModelos"></div>
<section class="cot-panel cm-cierre"><h2><span class="cm-paso">4</span>Cargo único y notas</h2><div class="cm-campos"><label>Concepto del cargo (opcional)<input id="cmCargoConcepto" maxlength="120" placeholder="Ponchado del logo"></label><label>Cargo único (MXN)<input id="cmCargo" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Sin cargo"></label></div><p class="cot-ayuda">Se cobra una sola vez, aunque el logo vaya en varios modelos.</p><label>Condiciones o notas para el cliente<textarea id="cmNotas" rows="3" maxlength="2000" placeholder="Forma de pago, envío…"></textarea></label></section>
<div class="cm-exportar"><p id="cmResumen" class="cot-ayuda">Agrega un modelo para empezar.</p><div><button type="button" id="cmGuardar" class="btn btn--linea">Guardar</button><button type="button" id="cmCopiar" class="btn btn--linea">Copiar texto</button><button type="button" id="cmPDF" class="btn btn--azul">Descargar PDF</button></div></div>
<p class="cot-ayuda">Solo equipo ZAIN. Guardar conserva la cotización con su logo para abrirla después; descargar o copiar también la guarda. Costos y márgenes nunca salen en el documento.</p>
</fieldset></form></section>`);
const zona=m=>(m.producto.zonas||[]).find(z=>z.id===m.zona);
const color=m=>datos.colores.find(c=>c.id===m.color)||{hex:'#ffffff',nombre:'Por confirmar'};
const maxAncho=m=>{const z=zona(m);return z?Math.floor(z.max*(z.orientativa?1:window.ZAIN.escalaMaxLogo||1.3)*100):20000;};
const redondeo=()=>Number($('#cmRedondeo').value);
function avisar(t){$('#cmEstado').textContent=t;}
function resumen(){
 const filas=modelos.flatMap(m=>m.filas.filter(f=>f.incluir)),listas=filas.filter(f=>f.listo).length;
 const estado=actual?actual.folio+(sucio?' · cambios sin guardar':' · guardada'):sucio&&modelos.length?'Sin guardar':'';
 $('#cmResumen').textContent=[estado,!modelos.length?'Agrega un modelo para empezar.':modelos.length+(modelos.length===1?' modelo':' modelos')+' · '+listas+' de '+filas.length+(filas.length===1?' precio listo':' precios listos')].filter(Boolean).join(' · ');
 $('#cmResumen').classList.toggle('cm-pendiente',sucio&&modelos.length>0);
}
function marcarSucio(){if(!sucio){sucio=true;resumen();}}
function marcarLimpio(){sucio=false;resumen();}
function cabecera(){
 const convertida=actual?.estado==='convertida';
 $('#cmFolio').textContent=actual?actual.folio:'Nueva cotización';
 const sel=$('#cmEstadoSel');sel.disabled=!actual||convertida;if(convertida&&!sel.querySelector('[value=convertida]'))sel.insertAdjacentHTML('beforeend','<option value="convertida">Convertida en pedido</option>');sel.value=actual?.estado||'borrador';
 $('#cmConvertida').hidden=!convertida;$('#cmConvertida').textContent=convertida?'Esta cotización ya se convirtió en pedido. Los cambios se hacen en la cotización del pedido, en Pedidos.':'';
 $('#cmGuardar').disabled=convertida;
}
function pintarLista(){
 const texto=$('#cmFiltro').value.trim().toLocaleLowerCase('es'),ver=$('#cmVerDescartadas').checked;
 const filas=lista.filter(x=>(ver||x.estado!=='descartada')&&(x.folio+' '+x.cliente).toLocaleLowerCase('es').includes(texto));
 $('#cmLista').innerHTML=filas.length?filas.map(x=>`<li class="${actual?.id===x.id?'on':''}"><button type="button" class="cm-item" data-abrir="${esc(x.id)}"><b>${esc(x.folio)}</b><span>${esc(x.cliente||'Sin cliente')}</span><small><i class="cm-chip cm-chip--${esc(x.estado)}">${esc(ESTADOS[x.estado]||x.estado)}</i>${x.modelos} ${x.modelos===1?'modelo':'modelos'}${x.desde==null?'':' · desde '+esc(pesos(x.desde))} · ${esc(fechaCorta(x.updated_at))}</small></button><button type="button" class="btn-texto" data-duplicar="${esc(x.id)}" aria-label="Duplicar ${esc(x.folio)}">Duplicar</button></li>`).join(''):`<li class="cm-vacia">${lista.length?'Ninguna cotización coincide.':'Todavía no hay cotizaciones guardadas.'}</li>`;
}
async function cargarLista(){
 const turno=epoca;
 try{const r=await api('cm-lista');if(turno!==epoca)return;lista=r.cotizaciones||[];pintarLista();}
 catch(e){if(turno===epoca){$('#cmLista').innerHTML='<li class="cm-vacia">No se pudo cargar la lista: '+esc(e.message)+'</li>';}}
}
function opciones(){
 const busqueda=$('#cmBuscar').value.trim().toLocaleLowerCase('es'),anterior=$('#cmModelo').value;
 $('#cmModelo').innerHTML=catalogo.filter(p=>p.activo!==false&&[p.nombre,p.silueta,p.sku].join(' ').toLocaleLowerCase('es').includes(busqueda)).map(p=>`<option value="${esc(p.sku)}">${esc(nombreDe(p))} · ${esc(p.sku)}</option>`).join('');
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
  opciones();$('#cmCampos').disabled=false;cabecera();avisar('Costos guardados · versión '+datos.version+(datos.margen==null?'.':' · margen inicial '+datos.margen/100+'%.'));
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
for(const tipo of ['input','change'])$('#cmForm').addEventListener(tipo,e=>{if(!['cmBuscar','cmModelo','cmEstadoSel'].includes(e.target.id))marcarSucio();});
$('#cmRedondeo').addEventListener('change',()=>{for(const m of modelos)actualizar(m);});
$('#cmFiltro').addEventListener('input',pintarLista);
$('#cmVerDescartadas').addEventListener('change',pintarLista);
$('#cmActualizar').addEventListener('click',()=>{
 if(modelos.length&&!confirm('Se volverán a cargar los costos y se quitarán los modelos en pantalla (lo guardado se conserva). ¿Continuar?'))return;
 epoca++;cargando=false;datos=null;catalogo=[];limpiar();actual=null;cabecera();$('#cmCampos').disabled=true;void cargar();
});
function crearModelo(p){
 const producto={...p,colores:(p.colores||[]).map(id=>datos.colores.find(c=>c.id===id)?.nombre||id)};
 const m={id:++contador,producto:p,nombre:nombreDe(p),sku:p.sku,margen:datos.margen,filas:filasModelo(producto,datos.config).map(f=>({...f,incluir:true,margen:null,precio:null})),tecnica:'',tecnicaID:'',color:p.colores?.[0]||'',zona:p.zonas?.[0]?.id||'',ancho:800,alto:null,autoAlto:true,aplicacion:0,modo:'area',render:null,renderTurno:0};
 m.ancho=Math.min(m.ancho,maxAncho(m));if(logo)m.alto=Math.max(1,Math.round(m.ancho*logo.height/logo.width));
 return m;
}
function agregar(){
 if(modelos.length>=20)return avisar('Puedes cotizar hasta 20 modelos en un documento.');
 const p=catalogo.find(p=>p.sku===$('#cmModelo').value);if(!p)return;
 const m=crearModelo(p);modelos.push(m);pintarModelo(m);void renderizar(m);marcarSucio();
 $('#cmBuscar').value='';opciones();avisar(m.nombre+' agregado.');nodo(m).scrollIntoView({block:'start',behavior:'smooth'});
}
function pintarModelo(m){
 const seccion=document.createElement('section');seccion.className='cot-panel cm-modelo';seccion.dataset.modelo=m.id;
 const etiqueta=f=>[f.talla,f.color!=='Todos los colores'?f.color:'',f.volumen].filter(Boolean).join(' ');
 seccion.innerHTML=`<div class="cm-modelocab"><div><h2>${esc(m.nombre)}</h2><p class="cot-ayuda">${esc(m.sku)}</p></div><button type="button" data-accion="quitar" class="btn-texto">Quitar</button></div>
<div class="cm-diseno"><div class="cm-preview"><canvas width="600" height="600" aria-label="Vista del modelo con logo"></canvas><p data-vista-estado class="cot-ayuda" role="status">Cargando modelo…</p></div><div>
<div class="cm-campos"><label>Personalización<select data-campo="tecnica"><option value="">Solo prenda</option>${(m.producto.tecnicas||[]).map(t=>`<option value="${esc(t)}">${esc(tecnicas[t]||t)}</option>`).join('')}</select></label><label>Color de la vista<select data-campo="color">${(m.producto.colores||[]).map(id=>`<option value="${esc(id)}">${esc(datos.colores.find(c=>c.id===id)?.nombre||id)}</option>`).join('')}</select></label></div>
<div data-personalizacion hidden><div class="cm-campos"><label>Zona del logo<select data-campo="zona">${(m.producto.zonas||[]).map(z=>`<option value="${esc(z.id)}">${esc(z.nombre)}</option>`).join('')}</select></label><label>Ancho del logo (cm)<input data-campo="ancho" type="number" min="0.01" max="${maxAncho(m)/100}" step="0.01" inputmode="decimal" value="${numero(m.ancho)}"></label></div>
<details class="cm-mas"><summary>Alto y costo de la personalización</summary><div class="cm-campos"><label>Alto del logo (cm)<input data-campo="alto" type="number" min="0.01" max="200" step="0.01" inputmode="decimal" value="${numero(m.alto)}" placeholder="Sube el logo o escríbelo"></label><label>Cobro de la personalización<select data-campo="modo"><option value="area">Por cm²</option><option value="fijo">Importe fijo por pieza</option></select></label><label data-area>Tarifa MXN / cm²<input data-campo="tarifa" type="number" min="0" step="0.000001" inputmode="decimal" placeholder="Pendiente"></label><label data-fijo hidden>Costo fijo / pieza<input data-campo="fijo" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Pendiente"></label></div><p class="cot-ayuda">El alto sigue la proporción del logo hasta que lo cambies.</p></details><p data-preparacion class="cot-ayuda"></p></div>
<label class="cm-margen">Margen bruto del modelo (%)<input data-campo="margenModelo" type="number" min="0" max="99.99" step="0.01" inputmode="decimal" value="${m.margen==null?'':m.margen/100}" placeholder="Ej. 35"></label></div></div>
<div class="cm-tabla"><table><thead><tr><th><span class="cm-oculto">Ofrecer</span></th><th>Tallas</th><th>Costo / pza</th><th>Precio / pza</th><th>Utilidad / pza</th></tr></thead><tbody>${m.filas.map(f=>`<tr data-fila="${f.id}"><td><input type="checkbox" data-campo="incluir" checked aria-label="Ofrecer ${esc(etiqueta(f))}"></td><td><b>${esc(f.talla)}</b>${f.color!=='Todos los colores'?`<small>${esc(f.color)}</small>`:''}${f.volumen?`<small>${esc(f.volumen)}</small>`:''}</td><td data-label="Costo / pza" data-resultado="costo">—</td><td data-label="Precio / pza"><input data-campo="precio" aria-label="Precio por pieza ${esc(etiqueta(f))}" type="number" min="0" step="0.01" inputmode="decimal"><small data-resultado="nota"></small></td><td data-label="Utilidad / pza" data-resultado="utilidad">—</td></tr>`).join('')}</tbody></table></div><p data-error class="cm-error" role="status"></p>`;
 $('#cmModelos').append(seccion);actualizar(m);
}
const nodo=m=>$('#cmModelos [data-modelo="'+m.id+'"]');
function leer(m){
 const el=nodo(m),campo=k=>el.querySelector('[data-campo="'+k+'"]');
 m.tecnicaID=campo('tecnica').value;m.tecnica=tecnicas[m.tecnicaID]||'';m.color=campo('color').value;m.zona=campo('zona').value;m.modo=campo('modo').value;m.ancho=nullable(campo('ancho'));m.alto=nullable(campo('alto'));
 m.margen=nullable(campo('margenModelo'));if(m.margen!=null&&m.margen>9999)throw Error('El margen debe ser menor a 100%.');
 if(m.tecnica&&m.ancho!=null&&m.ancho>maxAncho(m))throw Error('El ancho excede el área disponible de esta zona.');
 const limite=zona(m)?.maxAlto;if(m.tecnica&&limite&&m.alto!=null&&m.alto>Math.floor(limite*100))throw Error('El alto excede el área disponible de esta zona ('+limite+' cm).');
 m.aplicacion=!m.tecnica?0:m.modo==='fijo'?nullable(campo('fijo')):aplicacionArea(m.ancho,m.alto,campo('tarifa').value===''?null:decimalTarifa(campo('tarifa').value));
 // Un precio escrito en la fila manda; si está vacío, se usa el margen del modelo.
 for(const f of m.filas){const tr=el.querySelector('[data-fila="'+f.id+'"]');f.incluir=tr.querySelector('[data-campo=incluir]').checked;f.margen=m.margen;f.precio=f.incluir?nullable(tr.querySelector('[data-campo=precio]')):null;}
}
function actualizar(m){
 const el=nodo(m);try{leer(m);el.querySelector('[data-error]').textContent='';
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
 el.querySelector('[data-preparacion]').textContent=!nombre?'':t?.preparacion?'Preparación de referencia: '+pesos(t.preparacion)+'. Agrégala al cargo único si corresponde.':'Preparación o ponchado: confirmar con el taller.';
}
function aplicarModo(m){const el=nodo(m),fijo=el.querySelector('[data-campo=modo]').value==='fijo';el.querySelector('[data-area]').hidden=fijo;el.querySelector('[data-fijo]').hidden=!fijo;}
$('#cmAgregar').addEventListener('click',agregar);
$('#cmModelos').addEventListener('input',e=>{
 const el=e.target.closest('[data-modelo]');if(!el)return;const m=modelos.find(m=>m.id===Number(el.dataset.modelo)),k=e.target.dataset.campo;if(!k)return;
 if(k==='alto')m.autoAlto=false;
 if(k==='ancho'){try{m.ancho=nullable(e.target);altoAutomatico(m);}catch{}}
 actualizar(m);if(['ancho','alto'].includes(k))void renderizar(m);
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
 m.renderTurno++;modelos=modelos.filter(x=>x!==m);el.remove();marcarSucio();resumen();
});
let logoTurno=0,logoOcupado=false;
// guardado=true: el logo viene de una cotización guardada y ya está en el servidor.
async function prepararLogo(archivo,guardado=false){
 if(!archivo)return;if(!/^image\/(png|jpeg|webp|svg\+xml)$/.test(archivo.type)||archivo.size>15*1024*1024){$('#cmLogo').value='';return avisar('Sube un logo PNG, JPG, WEBP o SVG de hasta 15 MB.');}
 const turno=++logoTurno,session=epoca;$('#cmLogoEstado').textContent='Preparando logo…';logoOcupado=true;
 try{const nuevo=await window.ZR.abrirArchivo(archivo);if(turno!==logoTurno||session!==epoca)return;crudo=nuevo;logoNombre=archivo.name;if(!guardado){logoArchivo=archivo;marcarSucio();}analizarLogo();}
 catch(e){if(turno===logoTurno){$('#cmLogoEstado').textContent='No se pudo abrir ese logo. El anterior se conserva.';avisar(e.message);}}
 finally{if(turno===logoTurno)logoOcupado=false;}
}
function analizarLogo(){
 if(!crudo)return;logo=window.ZR.analizarLogo(crudo,$('#cmQuitarFondo').checked).logo;$('#cmLogoEstado').textContent=logoNombre+' · elige Bordado, Serigrafía o DTF en cada modelo para verlo.';$('#cmEliminarLogo').hidden=false;
 for(const m of modelos){altoAutomatico(m);actualizar(m);void renderizar(m);}
}
$('#cmLogo').addEventListener('change',e=>void prepararLogo(e.target.files[0]));
$('#cmQuitarFondo').addEventListener('change',analizarLogo);
function sinLogo(texto){logoTurno++;logoOcupado=false;logo=null;crudo=null;logoNombre='';logoArchivo=null;$('#cmLogo').value='';$('#cmEliminarLogo').hidden=true;$('#cmLogoEstado').textContent=texto;}
$('#cmEliminarLogo').addEventListener('click',()=>{sinLogo('Logo retirado.');marcarSucio();for(const m of modelos)void renderizar(m);});
// Lo que se guarda: los valores tal como están en pantalla (también los incompletos).
function crudoModelo(m){
 const el=nodo(m),v=k=>el.querySelector('[data-campo="'+k+'"]').value;
 return {sku:m.sku,tecnica:v('tecnica'),color:v('color'),zona:v('zona'),modo:v('modo'),ancho:v('ancho'),alto:v('alto'),autoAlto:m.autoAlto,tarifa:v('tarifa'),fijo:v('fijo'),margen:v('margenModelo'),
  filas:m.filas.map(f=>{const tr=el.querySelector('[data-fila="'+f.id+'"]');return {clave:clave(f),incluir:tr.querySelector('[data-campo=incluir]').checked,precio:tr.querySelector('[data-campo=precio]').value,visto:f.visto??null};})};
}
const CAMPOS={destinatario:'#cmDestinatario',iva:'#cmIVA',redondeo:'#cmRedondeo',vigencia:'#cmVigencia',plazo:'#cmPlazo',anticipo:'#cmAnticipo',concepto:'#cmCargoConcepto',cargo:'#cmCargo',notas:'#cmNotas'};
const serializar=()=>({schema:1,...Object.fromEntries(Object.entries(CAMPOS).map(([k,s])=>[k,$(s).value])),quitarFondo:$('#cmQuitarFondo').checked,modelos:modelos.map(crudoModelo)});
function opcionesComerciales(folio){
 const anticipo=$('#cmAnticipo').value.trim();
 return {folio,destinatario:$('#cmDestinatario').value,impuesto:Number($('#cmIVA').value),vigencia:$('#cmVigencia').value,plazo:$('#cmPlazo').value,redondeo:redondeo(),anticipo:anticipo===''?null:Math.round(Number(anticipo)*100),concepto:$('#cmCargoConcepto').value,cargo:nullable($('#cmCargo')),notas:$('#cmNotas').value};
}
// Precios que vería el cliente en este momento; null si la cotización todavía está incompleta.
function proyeccion(){try{for(const m of modelos)leer(m);return comercial(modelos,opcionesComerciales(actual?.folio||''));}catch{return null;}}
function aplicarGuardada(x){actual={id:x.id,version:x.version,folio:x.folio,estado:x.estado,logo:x.logo||null};cabecera();}
async function subirLogo(id){
 const s=await api('cm-logo-subida',{id,mime:logoArchivo.type,bytes:logoArchivo.size});
 const r=await fetch(s.url,{method:'PUT',headers:{'Content-Type':logoArchivo.type},body:logoArchivo,signal:AbortSignal.timeout(120000)});
 if(!r.ok)throw Error('No se pudo subir el logo. Revisa tu conexión e intenta de nuevo.');
 return {objeto:s.objeto,mime:logoArchivo.type,nombre:logoArchivo.name};
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
  if(session!==epoca)throw Error('Sesión cerrada.');
  const q=proyeccion(),r=await api('cm-guardar',{id,version:actual?.version||0,cliente:$('#cmDestinatario').value,datos:serializar(),comercial:q,desde:q?Math.min(...q.partidas.map(p=>p.precio)):null,modelos:modelos.length,logo:logoRef,...(estado?{estado}:{})});
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
 for(const m of modelos)m.renderTurno++;modelos=[];$('#cmModelos').replaceChildren();
 sinLogo('PNG, JPG, WEBP o SVG · hasta 15 MB. Opcional si solo cotizas la prenda.');
 $('#cmForm').reset();$('#cmVigencia').value=hoyMX(15);marcarLimpio();
}
function nueva(){
 if(sucio&&modelos.length&&!confirm('Hay cambios sin guardar. ¿Descartarlos?'))return false;
 limpiar();actual=null;cabecera();pintarLista();return true;
}
$('#cmNueva').addEventListener('click',()=>{if(nueva()){avisar('Nueva cotización.');$('#cmDestinatario').focus();}});
async function restaurar(x,duplicar){
 limpiar();const d=x.datos||{};
 for(const [k,s] of Object.entries(CAMPOS))if(d[k]!=null)$(s).value=d[k];
 $('#cmDestinatario').value=x.cliente||d.destinatario||'';$('#cmQuitarFondo').checked=!!d.quitarFondo;
 if(duplicar)$('#cmVigencia').value=hoyMX(15);
 let fijados=0;const faltan=[];
 for(const s of d.modelos||[]){
  const p=catalogo.find(p=>p.sku===s.sku);if(!p){faltan.push(s.sku);continue;}
  const m=crearModelo(p);modelos.push(m);pintarModelo(m);
  const el=nodo(m),set=(k,v)=>{const c=el.querySelector('[data-campo="'+k+'"]');if(c&&v!=null)c.value=v;};
  set('tecnica',s.tecnica);aplicarTecnica(m);set('color',s.color);set('zona',s.zona);m.zona=el.querySelector('[data-campo=zona]').value;el.querySelector('[data-campo=ancho]').max=maxAncho(m)/100;
  set('modo',s.modo);aplicarModo(m);set('ancho',s.ancho);set('alto',s.alto);set('tarifa',s.tarifa);set('fijo',s.fijo);set('margenModelo',s.margen);m.autoAlto=s.autoAlto!==false;
  const guardadas=new Map((s.filas||[]).map(g=>[g.clave,g]));
  for(const f of m.filas){const g=guardadas.get(clave(f)),tr=el.querySelector('[data-fila="'+f.id+'"]');if(!g)continue;tr.querySelector('[data-campo=incluir]').checked=g.incluir!==false;tr.querySelector('[data-campo=precio]').value=g.precio||'';}
  actualizar(m);
  // Respetar el precio cotizado: si los costos cambiaron desde que se guardó, se fija el precio anterior.
  if(!duplicar){let cambio=false;for(const f of m.filas){const g=guardadas.get(clave(f));if(g&&g.incluir!==false&&!g.precio&&g.visto!=null&&f.visto!==g.visto){el.querySelector('[data-fila="'+f.id+'"] [data-campo=precio]').value=numero(g.visto);fijados++;cambio=true;}}if(cambio)actualizar(m);}
 }
 actual=duplicar?null:{id:x.id,version:x.version,folio:x.folio,estado:x.estado,logo:x.logo||null};cabecera();
 if(x.logoUrl){
  try{const r=await fetch(x.logoUrl,{signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error();const blob=await r.blob(),archivo=new File([blob],x.logo?.nombre||'logo',{type:x.logo?.mime||blob.type});await prepararLogo(archivo,!duplicar);if(duplicar)logoArchivo=archivo;}
  catch{$('#cmLogoEstado').textContent='No se pudo recuperar el logo guardado; súbelo de nuevo.';}
 }
 for(const m of modelos)void renderizar(m);
 if(duplicar)marcarSucio();else marcarLimpio();pintarLista();
 return [duplicar?'Copia de '+x.folio+' lista; guárdala para darle folio nuevo.':x.folio+' abierta.',fijados?fijados+(fijados===1?' precio cambió':' precios cambiaron')+' con los costos actuales; se conservó el precio cotizado.':'',faltan.length?'Ya no están en el catálogo: '+faltan.join(', ')+'.':''].filter(Boolean).join(' ');
}
async function abrir(id,duplicar=false){
 if(!datos)return;if(!duplicar&&actual?.id===id&&!sucio)return;
 if(sucio&&modelos.length&&!confirm('Hay cambios sin guardar. ¿Descartarlos?'))return;
 const session=epoca;avisar('Abriendo cotización…');
 try{const r=await api('cm-leer',undefined,{id});if(session!==epoca)return;avisar(await restaurar(r.cotizacion,duplicar));$('#cmCampos').scrollIntoView({block:'start',behavior:'smooth'});}
 catch(e){if(session===epoca)avisar(e.message);}
}
$('#cmLista').addEventListener('click',e=>{const a=e.target.closest('[data-abrir]'),d=e.target.closest('[data-duplicar]');if(a)void abrir(a.dataset.abrir);if(d)void abrir(d.dataset.duplicar,true);});
function documentoComercial(folio){
 if(logoOcupado)throw Error('Espera a que termine de cargar el logo.');
 if(!$('#cmForm').reportValidity())throw Error('Revisa los campos indicados.');
 for(const m of modelos){leer(m);if(m.tecnica&&!logo)throw Error('Sube el logo para los modelos personalizados.');}
 return comercial(modelos,opcionesComerciales(folio));
}
// Copiar o descargar guarda primero: así el folio del documento es el de la cotización guardada.
async function guardarParaEnviar(){documentoComercial('');if(sucio||!actual)await guardar(!actual||actual.estado==='borrador'?'enviada':undefined);else if(actual.estado==='borrador')aplicarGuardada((await api('cm-estado',{id:actual.id,version:actual.version,estado:'enviada'})).cotizacion);return documentoComercial(actual.folio);}
$('#cmCopiar').addEventListener('click',async()=>{
 try{const q=await guardarParaEnviar();await navigator.clipboard.writeText(textoComercial(q));avisar(q.folio+' copiada. Pégala en WhatsApp o en un correo.');}catch(e){avisar(e.message);}
});
$('#cmPDF').addEventListener('click',async e=>{
 const b=e.currentTarget,session=epoca;b.disabled=true;
 try{avisar('Guardando…');const q=await guardarParaEnviar();$('#cmCampos').disabled=true;$('#cmActualizar').disabled=true;avisar('Preparando PDF…');await Promise.all(modelos.map(renderizar));if(session!==epoca)return;
 for(const m of modelos)if(m.filas.some(f=>f.incluir)&&!m.render)throw Error('Espera a que cargue el diseño de '+m.nombre+' y vuelve a descargar.');
 const imagenes=modelos.map(m=>({sku:m.sku,nombre:m.nombre,src:m.render,nota:(m.tecnica?'Logo en '+(zona(m)?.nombre||'zona por confirmar'):'Referencia')+' · '+color(m).nombre}));
 const {descargarModelos}=await import('./cotizacion-modelos-pdf.js?v=4');if(session!==epoca)return;await descargarModelos(q,imagenes);avisar('PDF '+q.folio+' listo. Puedes enviarlo al cliente.');
 }catch(e){if(session===epoca)avisar(e.message);}finally{b.disabled=false;$('#cmActualizar').disabled=false;if(session===epoca&&datos)$('#cmCampos').disabled=false;}
});
addEventListener('beforeunload',e=>{if(sucio&&modelos.length){e.preventDefault();e.returnValue='';}});
addEventListener('zain:equipo-listo',()=>{if(location.hash==='#cotizaciones'&&$('#seccionCotizaciones').hidden)$('#verCotizaciones').click();});
addEventListener('zain:equipo-salio',()=>{
 epoca++;cargando=false;datos=null;catalogo=[];limpiar();actual=null;lista=[];
 $('#cmModelo').replaceChildren();$('#cmLista').replaceChildren();$('#cmVigencia').value='';$('#cmCampos').disabled=true;$('#seccionCotizaciones').hidden=true;cabecera();avisar('');
});
