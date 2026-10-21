import {configurar,decimal,decimalTarifa,pesos} from './cotizacion-core.js?v=16';
import {esc} from './cotizacion-vista.js?v=11';
import {filasModelo,precioFila,aplicacionArea,comercial,textoComercial} from './cotizacion-modelos.js?v=1';
const $=s=>document.querySelector(s),nav=$('.control__secciones'),api=(op)=>window.ZAINEquipo.call(op);
const tecnicas={bordado:'Bordado',serigrafia:'Serigrafía',dtf:'DTF'},numero=n=>n==null?'':(n/100).toFixed(2),nullable=e=>e.value.trim()===''?null:decimal(e.value);
let epoca=0,datos=null,catalogo=[],modelos=[],contador=0,logo=null,crudo=null,logoNombre='',cargando=false;
nav.querySelector('#verPedidos').insertAdjacentHTML('afterend','<button type="button" id="verCotizaciones" aria-pressed="false">Cotizaciones</button>');
$('#trabajo').insertAdjacentHTML('beforeend',`<section id="seccionCotizaciones" class="cm-area" hidden>
<div class="control__titulo"><div><h1>Cotizaciones</h1><p>Precio por modelo y tallas, sin capturar cantidades.</p></div><button type="button" id="cmActualizar" class="btn btn--linea">Actualizar modelos y costos</button></div>
<p id="cmEstado" class="control__estado" role="status" aria-live="polite"></p>
<form id="cmForm"><fieldset id="cmCampos" disabled>
<section class="cot-panel cm-cabecera"><div><h2>Logo de la cotización</h2><label>Subir logo<input id="cmLogo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label><p id="cmLogoEstado" class="cot-ayuda">PNG, JPG, WEBP o SVG · hasta 15 MB. Se usa en los modelos que personalices.</p><label class="cot-check"><input id="cmQuitarFondo" type="checkbox">Quitar fondo del logo</label><button type="button" id="cmEliminarLogo" class="btn-texto" hidden>Quitar logo</button></div><div><h2>Datos comerciales</h2><label>Cliente o empresa (opcional)<input id="cmDestinatario" maxlength="180" autocomplete="off"></label><label>Precios e IVA<select id="cmIVA"><option value="">Seleccionar</option><option value="1600">Precios más IVA (16%)</option><option value="0">Sin impuesto (0%)</option></select></label></div></section>
<section class="cot-panel"><h2>Agregar modelo</h2><div class="cm-agregar"><label>Buscar modelo<input id="cmBuscar" type="search" placeholder="Nombre, silueta o SKU"></label><label>Modelo<select id="cmModelo"></select></label><button type="button" id="cmAgregar" class="btn btn--azul">Agregar modelo</button></div><p class="cot-ayuda">Los rangos de tallas se toman de los costos guardados. Si hay tarifas por volumen o color, se muestran por separado. Puedes excluir los tramos que no ofrecerás.</p></section>
<div id="cmModelos"></div>
<section class="cot-panel cm-cierre"><h2>Condiciones y cargo único</h2><div class="cm-campos"><label>Concepto del cargo (opcional)<input id="cmCargoConcepto" maxlength="120" placeholder="Ponchado del logo"></label><label>Cargo único (MXN)<input id="cmCargo" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Sin cargo"></label></div><p class="cot-ayuda">Se cobra una sola vez en esta cotización, aunque el logo aparezca en varios modelos. Revisa el ponchado o preparación con tu taller.</p><label>Condiciones o vigencia<textarea id="cmNotas" rows="3" maxlength="2000" placeholder="Vigencia, entrega y condiciones que quieras indicar."></textarea></label></section>
<div class="cm-exportar"><button type="button" id="cmCopiar" class="btn btn--linea">Copiar cotización</button><button type="button" id="cmPDF" class="btn btn--azul">Descargar PDF</button></div>
<p class="cot-ayuda">Solo equipo ZAIN. La cotización permanece en esta página mientras esté abierta; descarga el PDF para conservarla. Los costos y márgenes quedan fuera del documento.</p>
</fieldset></form></section>`);
const zona=m=>(m.producto.zonas||[]).find(z=>z.id===m.zona);
const color=m=>datos.colores.find(c=>c.id===m.color)||{hex:'#ffffff',nombre:'Por confirmar'};
const maxAncho=m=>{const z=zona(m);return z?Math.floor(z.max*(z.orientativa?1:window.ZAIN.escalaMaxLogo||1.3)*100):20000;};
function avisar(t){$('#cmEstado').textContent=t;}
function opciones(){
 const busqueda=$('#cmBuscar').value.trim().toLocaleLowerCase('es'),anterior=$('#cmModelo').value;
 $('#cmModelo').innerHTML=catalogo.filter(p=>p.activo!==false&&[p.nombre,p.silueta,p.sku].join(' ').toLocaleLowerCase('es').includes(busqueda)).map(p=>`<option value="${esc(p.sku)}">${esc(p.nombre)}${p.silueta?' · '+esc(p.silueta):''} · ${esc(p.sku)}</option>`).join('');
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
  const publicos=[...c.productos,...c.productosHistoricos];
  catalogo=cat.productos.map(p=>({...publicos.find(x=>x.sku===p.sku),...p})).sort((a,b)=>(a.nombre+' '+a.silueta).localeCompare(b.nombre+' '+b.silueta,'es'));
  opciones();$('#cmCampos').disabled=false;avisar('Elige un modelo. Costos guardados · versión '+datos.version+'.');
 }catch(e){if(turno===epoca)avisar(e.message);}finally{if(turno===epoca)cargando=false;}
}
nav.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;const on=b.id==='verCotizaciones';
 $('#seccionCotizaciones').hidden=!on;$('#verCotizaciones').classList.toggle('on',on);$('#verCotizaciones').setAttribute('aria-pressed',String(on));
 if(on){
  for(const s of $('#trabajo').children)if(s.tagName==='SECTION'||s.id==='seccionPedidos')s.hidden=s.id!=='seccionCotizaciones';
  for(const x of nav.querySelectorAll('button'))if(x!==b){x.classList.remove('on');x.setAttribute('aria-pressed','false');}
  history.replaceState(null,'','#cotizaciones');void cargar();
 }
});
$('#cmBuscar').addEventListener('input',opciones);
$('#cmForm').addEventListener('submit',e=>e.preventDefault());
$('#cmActualizar').addEventListener('click',()=>{
 if(modelos.length&&!confirm('Se volverán a cargar los costos y se quitarán los modelos de esta cotización. ¿Continuar?'))return;
 epoca++;cargando=false;datos=null;catalogo=[];modelos=[];$('#cmModelos').replaceChildren();$('#cmCampos').disabled=true;void cargar();
});
function agregar(){
 if(modelos.length>=20)return avisar('Puedes cotizar hasta 20 modelos en un documento.');
 const p=catalogo.find(p=>p.sku===$('#cmModelo').value);if(!p)return;
 const producto={...p,colores:(p.colores||[]).map(id=>datos.colores.find(c=>c.id===id)?.nombre||id)};
 const m={id:++contador,producto:p,nombre:p.nombre+(p.silueta?' · '+p.silueta:''),sku:p.sku,filas:filasModelo(producto,datos.config).map(f=>({...f,incluir:true,margen:null,precio:null})),tecnica:'',tecnicaID:'',color:p.colores?.[0]||'',zona:p.zonas?.[0]?.id||'',ancho:800,alto:null,autoAlto:true,aplicacion:0,modo:'area',render:null,renderTurno:0};
 m.ancho=Math.min(m.ancho,maxAncho(m));if(logo)m.alto=Math.max(1,Math.round(m.ancho*logo.height/logo.width));
 modelos.push(m);pintarModelo(m);avisar('Ajusta el margen o escribe el precio por pieza de cada rango.');$('#cmModelos').lastElementChild.scrollIntoView({block:'start',behavior:'smooth'});
}
function pintarModelo(m){
 const seccion=document.createElement('section');seccion.className='cot-panel cm-modelo';seccion.dataset.modelo=m.id;
 seccion.innerHTML=`<div class="cm-modelocab"><div><h2>${esc(m.nombre)}</h2><p class="cot-ayuda">${esc(m.sku)}</p></div><button type="button" data-accion="quitar" class="btn-texto">Quitar modelo</button></div>
<div class="cm-diseno"><div class="cm-preview"><canvas width="600" height="600" aria-label="Vista del modelo con logo"></canvas><p data-vista-estado class="cot-ayuda" role="status">Cargando modelo…</p></div><div>
<div class="cm-campos"><label>Personalización<select data-campo="tecnica"><option value="">Solo prenda</option>${(m.producto.tecnicas||[]).map(t=>`<option value="${esc(t)}">${esc(tecnicas[t]||t)}</option>`).join('')}</select></label><label>Color de la vista<select data-campo="color">${(m.producto.colores||[]).map(id=>`<option value="${esc(id)}">${esc(datos.colores.find(c=>c.id===id)?.nombre||id)}</option>`).join('')}</select></label></div>
<div data-personalizacion hidden><div class="cm-campos"><label>Zona del logo<select data-campo="zona">${(m.producto.zonas||[]).map(z=>`<option value="${esc(z.id)}">${esc(z.nombre)}</option>`).join('')}</select></label><label>Costo de personalización<select data-campo="modo"><option value="area">Por cm²</option><option value="fijo">Importe fijo por pieza</option></select></label><label>Ancho del logo (cm)<input data-campo="ancho" type="number" min="0.01" max="${maxAncho(m)/100}" step="0.01" inputmode="decimal" value="${numero(m.ancho)}"></label><label>Alto del logo (cm)<input data-campo="alto" type="number" min="0.01" max="200" step="0.01" inputmode="decimal" value="${numero(m.alto)}" placeholder="Sube el logo o confírmalo"></label></div><div class="cm-campos"><label data-area>Tarifa MXN / cm²<input data-campo="tarifa" type="number" min="0" step="0.000001" inputmode="decimal" placeholder="Pendiente"></label><label data-fijo hidden>Costo fijo / pieza<input data-campo="fijo" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Pendiente"></label></div><p data-preparacion class="cot-ayuda"></p><p class="cot-ayuda">El alto se propone con la proporción del logo. Puedes corregirlo. Vista y medidas sujetas a revisión antes de producir.</p></div>
<div class="cm-margen"><label>Margen bruto para este modelo (%)<input data-campo="margenModelo" type="number" min="0" max="99.99" step="0.01" inputmode="decimal" placeholder="Ej. 30"></label><button type="button" class="btn btn--linea" data-accion="margen">Aplicar a todos sus rangos</button></div></div></div>
<div class="cm-tabla"><table><thead><tr><th>Ofrecer</th><th>Tallas y referencia</th><th>Costo / pza</th><th>Margen %</th><th>Precio directo / pza</th><th>Precio de venta / pza</th></tr></thead><tbody>${m.filas.map(f=>`<tr data-fila="${f.id}"><td data-label="Ofrecer"><input type="checkbox" data-campo="incluir" checked aria-label="Ofrecer ${esc(f.talla+' '+f.color+' '+f.volumen)}"></td><td><b>${esc(f.talla)}</b><small>${esc(f.color)}</small>${f.volumen?`<small>Referencia de compra: ${esc(f.volumen)}</small>`:''}</td><td data-label="Costo / pza" data-resultado="costo">—</td><td data-label="Margen %"><input data-campo="margen" aria-label="Margen ${esc(f.talla+' '+f.volumen)}" type="number" min="0" max="99.99" step="0.01" inputmode="decimal" placeholder="—"></td><td data-label="Precio directo / pza"><input data-campo="precio" aria-label="Precio directo ${esc(f.talla+' '+f.volumen)}" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Usar margen"><button type="button" data-accion="sugerido" class="btn-texto">Usar margen</button></td><td data-label="Precio de venta / pza"><strong data-resultado="precio">Pendiente</strong><small data-resultado="utilidad"></small></td></tr>`).join('')}</tbody></table></div><p data-error class="cm-error" role="status"></p>`;
 $('#cmModelos').append(seccion);actualizar(m);void renderizar(m);
}
const nodo=m=>$('#cmModelos [data-modelo="'+m.id+'"]');
function leer(m){
 const el=nodo(m),campo=k=>el.querySelector('[data-campo="'+k+'"]');
 m.tecnicaID=campo('tecnica').value;m.tecnica=tecnicas[m.tecnicaID]||'';m.color=campo('color').value;m.zona=campo('zona').value;m.modo=campo('modo').value;m.ancho=nullable(campo('ancho'));m.alto=nullable(campo('alto'));
 if(m.tecnica&&m.ancho!=null&&m.ancho>maxAncho(m))throw Error('El ancho excede el área disponible de esta zona.');
 const limite=zona(m)?.maxAlto;if(m.tecnica&&limite&&m.alto!=null&&m.alto>Math.floor(limite*100))throw Error('El alto excede el área disponible de esta zona ('+limite+' cm).');
 m.aplicacion=!m.tecnica?0:m.modo==='fijo'?nullable(campo('fijo')):aplicacionArea(m.ancho,m.alto,campo('tarifa').value===''?null:decimalTarifa(campo('tarifa').value));
 for(const f of m.filas){const tr=el.querySelector('[data-fila="'+f.id+'"]');f.incluir=tr.querySelector('[data-campo=incluir]').checked;if(!f.incluir)continue;f.margen=nullable(tr.querySelector('[data-campo=margen]'));f.precio=nullable(tr.querySelector('[data-campo=precio]'));}
}
function actualizar(m){
 const el=nodo(m);try{leer(m);el.querySelector('[data-error]').textContent='';
 for(const f of m.filas){const tr=el.querySelector('[data-fila="'+f.id+'"]'),r=f.incluir?precioFila(f,{margen:f.margen,precio:f.precio,aplicacion:m.aplicacion}):{costo:null,precio:null,utilidad:null};
 tr.classList.toggle('cm-excluido',!f.incluir);for(const x of tr.querySelectorAll('[data-campo=margen],[data-campo=precio],[data-accion=sugerido]'))x.disabled=!f.incluir;tr.querySelector('[data-resultado=costo]').textContent=pesos(r.costo);tr.querySelector('[data-resultado=precio]').textContent=f.incluir?pesos(r.precio):'No incluido';
 tr.querySelector('[data-resultado=utilidad]').textContent=r.utilidad==null?'Utilidad pendiente':'Utilidad '+pesos(r.utilidad)+(r.margenReal==null?'':' · '+(r.margenReal/100).toLocaleString('es-MX')+'%')+(f.precio==null?'':' · precio directo');
 }}catch(e){m.render=null;el.querySelector('[data-error]').textContent=e.message;for(const x of el.querySelectorAll('[data-resultado=precio]'))x.textContent='Revisar datos';}
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
 m.render=canvas.toDataURL('image/png');el.querySelector('[data-vista-estado]').textContent=(m.tecnica?(logo?'Logo en '+(z?.nombre||'zona por confirmar'):'Sube el logo para ver el diseño'):'Referencia del modelo')+' · '+col.nombre;
 }catch(e){if(turn===m.renderTurno&&session===epoca&&nodo(m))el.querySelector('[data-vista-estado]').textContent=e.message;}
}
function altoAutomatico(m){
 if(!logo||!m.autoAlto||m.ancho==null)return;
 m.alto=Math.max(1,Math.round(m.ancho*logo.height/logo.width));nodo(m).querySelector('[data-campo=alto]').value=numero(m.alto);
}
$('#cmAgregar').addEventListener('click',agregar);
$('#cmModelos').addEventListener('input',e=>{
 const el=e.target.closest('[data-modelo]');if(!el)return;const m=modelos.find(m=>m.id===Number(el.dataset.modelo)),k=e.target.dataset.campo;if(!k)return;
 if(k==='alto')m.autoAlto=false;
 if(k==='ancho'){try{m.ancho=nullable(e.target);altoAutomatico(m);}catch{}}
 actualizar(m);if(['ancho','alto'].includes(k))void renderizar(m);
});
$('#cmModelos').addEventListener('change',e=>{
 const el=e.target.closest('[data-modelo]');if(!el)return;const m=modelos.find(m=>m.id===Number(el.dataset.modelo)),k=e.target.dataset.campo;
 if(k==='tecnica'){
 const nombre=tecnicas[e.target.value],t=datos.config.tecnicas.find(t=>t.tecnica===nombre);el.querySelector('[data-personalizacion]').hidden=!nombre;el.querySelector('[data-campo=tarifa]').value=t?.tarifaCm2==null?'':t.tarifaCm2/1000000;
 el.querySelector('[data-preparacion]').textContent=t?.preparacion?'Preparación de referencia: '+pesos(t.preparacion)+'. Agrégala al cargo único si corresponde.':'Preparación o ponchado: confirmar con el taller.';
 }
 if(k==='modo'){const fijo=e.target.value==='fijo';el.querySelector('[data-area]').hidden=fijo;el.querySelector('[data-fijo]').hidden=!fijo;}
 if(k==='zona'){m.zona=e.target.value;const input=el.querySelector('[data-campo=ancho]');input.max=maxAncho(m)/100;}
 actualizar(m);if(['tecnica','zona','color'].includes(k))void renderizar(m);
});
$('#cmModelos').addEventListener('click',e=>{
 const b=e.target.closest('[data-accion]');if(!b)return;const el=b.closest('[data-modelo]'),m=modelos.find(m=>m.id===Number(el.dataset.modelo));
 if(b.dataset.accion==='quitar'){m.renderTurno++;modelos=modelos.filter(x=>x!==m);el.remove();return;}
 if(b.dataset.accion==='margen'){
 const input=el.querySelector('[data-campo=margenModelo]');
 if(!input.reportValidity()||input.value==='')return avisar('Escribe el margen que quieres aplicar.');
 try{const n=decimal(input.value);if(n>9999)throw Error('El margen debe ser menor a 100%.');for(const tr of el.querySelectorAll('[data-fila]')){tr.querySelector('[data-campo=margen]').value=input.value;tr.querySelector('[data-campo=precio]').value='';}}catch(e){return avisar(e.message);}
 }else if(b.dataset.accion==='sugerido')b.closest('[data-fila]').querySelector('[data-campo=precio]').value='';
 actualizar(m);
});
async function prepararLogo(archivo){
 if(!archivo)return;if(!/^image\/(png|jpeg|webp|svg\+xml)$/.test(archivo.type)||archivo.size>15*1024*1024){$('#cmLogo').value='';return avisar('Sube un logo PNG, JPG, WEBP o SVG de hasta 15 MB.');}
 const turno=++logoTurno,session=epoca;$('#cmLogoEstado').textContent='Preparando logo…';logoOcupado=true;
 try{const nuevo=await window.ZR.abrirArchivo(archivo);if(turno!==logoTurno||session!==epoca)return;crudo=nuevo;logoNombre=archivo.name;analizarLogo();}
 catch(e){if(turno===logoTurno){$('#cmLogoEstado').textContent='No se pudo abrir ese logo. El anterior se conserva.';avisar(e.message);}}
 finally{if(turno===logoTurno)logoOcupado=false;}
}
let logoTurno=0,logoOcupado=false;
function analizarLogo(){
 if(!crudo)return;logo=window.ZR.analizarLogo(crudo,$('#cmQuitarFondo').checked).logo;$('#cmLogoEstado').textContent=logoNombre;$('#cmEliminarLogo').hidden=false;
 for(const m of modelos){altoAutomatico(m);actualizar(m);void renderizar(m);}
}
$('#cmLogo').addEventListener('change',e=>void prepararLogo(e.target.files[0]));
$('#cmQuitarFondo').addEventListener('change',analizarLogo);
$('#cmEliminarLogo').addEventListener('click',()=>{logoTurno++;logoOcupado=false;logo=null;crudo=null;logoNombre='';$('#cmLogo').value='';$('#cmEliminarLogo').hidden=true;$('#cmLogoEstado').textContent='Logo retirado.';for(const m of modelos)void renderizar(m);});
function documentoComercial(){
 if(logoOcupado)throw Error('Espera a que termine de cargar el logo.');
 if(!$('#cmForm').reportValidity())throw Error('Revisa los campos indicados.');
 for(const m of modelos){leer(m);if(m.tecnica&&!logo)throw Error('Sube el logo para los modelos personalizados.');}
 return comercial(modelos,{destinatario:$('#cmDestinatario').value,impuesto:$('#cmIVA').value===''?null:Number($('#cmIVA').value),concepto:$('#cmCargoConcepto').value,cargo:nullable($('#cmCargo')),notas:$('#cmNotas').value});
}
$('#cmCopiar').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText(textoComercial(documentoComercial()));avisar('Cotización copiada con precios de venta.');}catch(e){avisar(e.message);}
});
$('#cmPDF').addEventListener('click',async e=>{
 const b=e.currentTarget,session=epoca;b.disabled=true;
 try{const q=documentoComercial();$('#cmCampos').disabled=true;$('#cmActualizar').disabled=true;await Promise.all(modelos.map(renderizar));if(session!==epoca)return;
 for(const m of modelos)if(m.filas.some(f=>f.incluir)&&!m.render)throw Error('Espera a que cargue el diseño de '+m.nombre+' y vuelve a descargar.');
 const imagenes=modelos.map(m=>({sku:m.sku,nombre:m.nombre,src:m.render,nota:(m.tecnica?'Logo en '+(zona(m)?.nombre||'zona por confirmar'):'Referencia')+' · '+color(m).nombre}));
 const {descargarModelos}=await import('./cotizacion-modelos-pdf.js?v=2');if(session!==epoca)return;await descargarModelos(q,imagenes);avisar('PDF generado. Puedes enviarlo al cliente.');
 }catch(e){if(session===epoca)avisar(e.message);}finally{b.disabled=false;$('#cmActualizar').disabled=false;if(session===epoca&&datos)$('#cmCampos').disabled=false;}
});
addEventListener('zain:equipo-listo',()=>{if(location.hash==='#cotizaciones'&&$('#seccionCotizaciones').hidden)$('#verCotizaciones').click();});
addEventListener('zain:equipo-salio',()=>{
 epoca++;logoTurno++;cargando=false;logoOcupado=false;datos=null;catalogo=[];modelos=[];logo=null;crudo=null;logoNombre='';
 $('#cmForm').reset();$('#cmModelos').replaceChildren();$('#cmModelo').replaceChildren();$('#cmCampos').disabled=true;$('#seccionCotizaciones').hidden=true;$('#cmEliminarLogo').hidden=true;$('#cmLogoEstado').textContent='PNG, JPG, WEBP o SVG · hasta 15 MB.';avisar('');
});
