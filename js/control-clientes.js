// Clientes (JP, 21-nov-2026): una ficha por cliente con sus pedidos y cotizaciones (cerradas y no cerradas), juntar
// fichas repetidas, cambiar el cliente de un pedido y duplicar un pedido o una cotización al mismo cliente o a otro.
// Los clientes salen solos de los pedidos y cotizaciones que ya existen; el servidor los liga al abrir esta sección.
import {pesos} from './cotizacion-core.js?v=24';
const $=s=>document.querySelector(s),nav=$('.control__secciones'),api=(op,body,extra)=>window.ZAINEquipo.call(op,body,extra);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fecha=x=>x?new Date(x).toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric',timeZone:'America/Mexico_City'}):'';
const clave=s=>String(s||'').toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').trim();
const ESTADO_PEDIDO={nuevo:'Por revisar',contactado:'Contactado',cotizado:'Cotizado',aceptado:'Aceptado',confirmado:'Confirmado',produccion:'En producción',entregado:'Entregado',cancelado:'Cancelado'};
const ESTADO_COT={borrador:'Borrador',enviada:'Enviada',autorizada:'Autorizada',convertida:'Pasó a pedido',descartada:'Descartada'};
// Cerrado = el cliente dijo que sí (pedido confirmado o después; cotización autorizada o convertida en pedido).
const grupoPedido=p=>p.archivado||p.estado==='cancelado'?'no':['confirmado','produccion','entregado'].includes(p.estado)?'si':'proceso';
const grupoCot=c=>c.estado==='descartada'?'no':['autorizada','convertida'].includes(c.estado)?'si':'proceso';
const GRUPO={si:'Cerrado',proceso:'En proceso',no:'No se cerró'};
// 523312345678 → 33 1234 5678
const telVista=t=>t?.length===12&&t.startsWith('52')?t.slice(2).replace(/(\d{2})(\d{4})(\d{4})/,'$1 $2 $3'):t||'';
let lista=[],epoca=0,filtro='',ficha=null,editando=false,cargando=null,orden='reciente';
// JP (22-nov-2026): casilla para seleccionar clientes, total abajo y total de los seleccionados, para ver quién
// nos ha comprado más; y unir en uno solo los que están repetidos.
const sel=new Set();

($('#verCotizaciones')||$('#verPedidos')).insertAdjacentHTML('afterend','<button type="button" id="verClientes" aria-pressed="false">Clientes</button>');
$('#trabajo').insertAdjacentHTML('beforeend',`<section id="seccionClientes" class="cl-area" hidden>
<div class="control__titulo"><div><h1>Clientes</h1><p>Cada cliente con sus pedidos y cotizaciones. Duplica un pedido para repetirlo sin volver a cotizar.</p></div><button type="button" id="clNuevo" class="btn btn--azul">+ Nuevo cliente</button></div>
<p id="clEstado" class="control__estado" role="status" aria-live="polite"></p>
<div id="clListaPanel" class="cot-panel cl-panel"><div class="cl-herr"><input id="clBuscar" type="search" placeholder="Buscar nombre, empresa o teléfono" aria-label="Buscar cliente" autocomplete="off" enterkeyhint="search"><label class="cl-orden">Ordenar<select id="clOrden"><option value="reciente">Más recientes</option><option value="vendido">Más vendido</option><option value="pedidos">Más pedidos</option><option value="nombre">Nombre</option></select></label></div><ul id="clLista" class="cl-lista" aria-live="polite"><li class="cl-vacia">Cargando clientes…</li></ul><div id="clTotal" class="cl-total" aria-live="polite"></div><div id="clSel" class="cl-sel" hidden><span id="clSelTexto"></span><span class="cl-sel-botones"><button type="button" class="btn btn--blanco" id="clSelUnir">Unir en un solo cliente…</button><button type="button" class="btn btn--linea" id="clSelQuitar">Quitar selección</button></span></div></div>
<div id="clFicha" class="cl-ficha" hidden></div>
</section>`);
document.body.insertAdjacentHTML('beforeend',`<dialog id="clElegir" class="cl-dialogo" aria-labelledby="clElegirTitulo"><form method="dialog">
<h2 id="clElegirTitulo"></h2><p id="clElegirTexto" class="cot-ayuda"></p>
<label class="cl-elegir-buscar">Cliente<input id="clElegirBuscar" type="search" placeholder="Busca o escribe un cliente nuevo" autocomplete="off"></label>
<ul id="clElegirLista" class="cl-elegir-lista"></ul><p id="clElegirEstado" class="cl-elegir-estado" role="status" aria-live="polite"></p>
<div class="cl-dialogo-botones"><button type="button" class="btn btn--linea" data-cl-cancelar>Cancelar</button><button type="button" class="btn btn--azul" id="clElegirOk" disabled>Listo</button></div>
</form></dialog>
<dialog id="clUnir" class="cl-dialogo" aria-labelledby="clUnirTitulo"><form method="dialog"><h2 id="clUnirTitulo">Unir en un solo cliente</h2><p class="cot-ayuda">Elige cuál se queda. Los pedidos y cotizaciones de los demás pasan a ese cliente y sus datos completan los que le falten. No se borra nada.</p><ul id="clUnirLista" class="cl-elegir-lista"></ul><p id="clUnirEstado" class="cl-elegir-estado" role="status" aria-live="polite"></p><div class="cl-dialogo-botones"><button type="button" class="btn btn--linea" data-cl-unir-cancelar>Cancelar</button><button type="button" class="btn btn--azul" id="clUnirOk" disabled>Unir</button></div></form></dialog>`);

const avisar=t=>{$('#clEstado').textContent=t||'';};
const publicar=()=>dispatchEvent(new CustomEvent('zain:clientes-lista',{detail:lista}));
async function cargarLista(){
 if(cargando)return cargando;
 const turno=epoca;
 cargando=(async()=>{
  try{const r=await api('clientes');if(turno!==epoca)return;lista=r.clientes||[];publicar();pintarLista();}
  catch(e){if(turno===epoca)$('#clLista').innerHTML='<li class="cl-vacia">No se pudo cargar la lista: '+esc(e.message)+'</li>';}
 })().finally(()=>{cargando=null;});
 return cargando;
}
const coincide=(c,q)=>!q||clave([c.nombre,c.empresa,c.telefono,telVista(c.telefono),c.correo].join(' ')).includes(q);
const ORDEN={reciente:null,vendido:(a,b)=>Number(b.vendido)-Number(a.vendido)||b.cerrados-a.cerrados,pedidos:(a,b)=>b.pedidos-a.pedidos||Number(b.vendido)-Number(a.vendido),nombre:(a,b)=>a.nombre.localeCompare(b.nombre,'es')};
const sumar=cs=>({clientes:cs.length,pedidos:cs.reduce((a,c)=>a+c.pedidos,0),cerrados:cs.reduce((a,c)=>a+c.cerrados,0),vendido:cs.reduce((a,c)=>a+Number(c.vendido||0),0)});
const cifrasTexto=t=>`<b>${t.clientes}</b> ${t.clientes===1?'cliente':'clientes'} · <b>${t.pedidos}</b> ${t.pedidos===1?'pedido':'pedidos'} (${t.cerrados} ${t.cerrados===1?'cerrado':'cerrados'}) · <b>${esc(pesos(t.vendido))}</b> vendido`;
function pintarTotales(vistos){
 const t=sumar(vistos),todo=sumar(lista);
 $('#clTotal').innerHTML=lista.length?'<span>Total'+(vistos.length<lista.length?' de los que se ven':'')+'</span><span>'+cifrasTexto(t)+'</span>':'';
 const elegidos=lista.filter(c=>sel.has(c.id)),s=sumar(elegidos);
 $('#clSel').hidden=!elegidos.length;
 if(elegidos.length)$('#clSelTexto').innerHTML='Seleccionados: '+cifrasTexto(s)+(todo.vendido>0?' · <b>'+Math.round(s.vendido*100/todo.vendido)+'%</b> de lo vendido':'');
 $('#clSelUnir').disabled=elegidos.length<2;
}
function pintarLista(){
 for(const id of [...sel])if(!lista.some(c=>c.id===id))sel.delete(id);
 const q=clave(filtro),vistos=lista.filter(c=>coincide(c,q));if(ORDEN[orden])vistos.sort(ORDEN[orden]);
 pintarTotales(vistos);
 $('#clLista').innerHTML=vistos.length?vistos.map(c=>`<li class="cl-li${sel.has(c.id)?' on':''}"><label class="cl-marca"><input type="checkbox" data-sel="${esc(c.id)}"${sel.has(c.id)?' checked':''} aria-label="Seleccionar ${esc(c.nombre)}"></label><button type="button" class="cl-item" data-cliente="${esc(c.id)}"><span class="cl-item-nombre"><b>${esc(c.nombre)}</b><small>${esc([c.empresa,telVista(c.telefono)].filter(Boolean).join(' · ')||'Sin datos de contacto')}</small></span>`+
  `<span class="cl-item-cifras"><span>${c.pedidos} ${c.pedidos===1?'pedido':'pedidos'}${c.cerrados?' · <i class="cl-si">'+c.cerrados+(c.cerrados===1?' cerrado':' cerrados')+'</i>':''}${c.cotizaciones?' · '+c.cotizaciones+(c.cotizaciones===1?' cotización':' cotizaciones'):''}</span>${Number(c.vendido)?'<b>'+esc(pesos(Number(c.vendido)))+'</b>':''}</span><i aria-hidden="true">→</i></button></li>`).join('')
  :`<li class="cl-vacia">${lista.length?'Ningún cliente coincide con «'+esc(filtro)+'».':'Todavía no hay clientes.'}</li>`;
}
$('#clBuscar').addEventListener('input',e=>{filtro=e.target.value;pintarLista();});
$('#clOrden').addEventListener('change',e=>{orden=e.target.value;pintarLista();});
$('#clLista').addEventListener('click',e=>{const b=e.target.closest('[data-cliente]');if(b)void abrirFicha(b.dataset.cliente);});
$('#clLista').addEventListener('change',e=>{const x=e.target.closest('[data-sel]');if(!x)return;if(x.checked)sel.add(x.dataset.sel);else sel.delete(x.dataset.sel);x.closest('.cl-li')?.classList.toggle('on',x.checked);pintarTotales(lista.filter(c=>coincide(c,clave(filtro))));});
$('#clSelQuitar').addEventListener('click',()=>{sel.clear();pintarLista();});
// Unir los seleccionados: el que se elija se queda; los demás se juntan con él uno por uno (misma función que «Juntar»).
let destinoUnir=null;
function pintarUnir(){
 const elegidos=lista.filter(c=>sel.has(c.id));
 $('#clUnirLista').innerHTML=elegidos.map(c=>`<li><button type="button" class="cl-opcion${destinoUnir===c.id?' on':''}" data-unir-destino="${esc(c.id)}" aria-pressed="${destinoUnir===c.id}"><b>${esc(c.nombre)}</b><small>${esc([c.empresa,telVista(c.telefono),c.pedidos+(c.pedidos===1?' pedido':' pedidos'),c.cotizaciones+(c.cotizaciones===1?' cotización':' cotizaciones'),Number(c.vendido)?pesos(Number(c.vendido)):''].filter(Boolean).join(' · '))}</small></button></li>`).join('');
 $('#clUnirOk').disabled=!destinoUnir;
}
$('#clSelUnir').addEventListener('click',()=>{
 const elegidos=lista.filter(c=>sel.has(c.id));if(elegidos.length<2)return;
 destinoUnir=[...elegidos].sort((a,b)=>b.pedidos+b.cotizaciones-a.pedidos-a.cotizaciones||Number(b.vendido)-Number(a.vendido))[0].id;
 $('#clUnirEstado').textContent='';pintarUnir();$('#clUnir').showModal();
});
$('#clUnirLista').addEventListener('click',e=>{const b=e.target.closest('[data-unir-destino]');if(b){destinoUnir=b.dataset.unirDestino;pintarUnir();}});
$('#clUnir [data-cl-unir-cancelar]').addEventListener('click',()=>{if(!$('#clUnirOk').dataset.ocupado)$('#clUnir').close();});
$('#clUnir').addEventListener('cancel',e=>{if($('#clUnirOk').dataset.ocupado)e.preventDefault();});
$('#clUnirOk').addEventListener('click',async()=>{
 const b=$('#clUnirOk'),d=destinoUnir,origenes=[...sel].filter(id=>id!==d);if(!d||!origenes.length||b.dataset.ocupado)return;
 b.dataset.ocupado='1';b.disabled=true;let hechos=0;
 try{for(const o of origenes){$('#clUnirEstado').textContent='Uniendo '+(hechos+1)+' de '+origenes.length+'…';await api('cliente-unir',{origen:o,destino:d});hechos++;sel.delete(o);}
  delete b.dataset.ocupado;$('#clUnir').close();sel.clear();await cargarLista();avisar((hechos+1)+' clientes unidos en «'+(lista.find(c=>c.id===d)?.nombre||'uno solo')+'».');
 }catch(er){delete b.dataset.ocupado;b.disabled=false;$('#clUnirEstado').textContent=(hechos?'Se unieron '+hechos+'. ':'')+er.message;void cargarLista();}
});

function mostrarFicha(si){$('#clFicha').hidden=!si;$('#clListaPanel').hidden=si;}
async function abrirFicha(id){
 const turno=++epoca;avisar('Abriendo cliente…');editando=false;
 try{const r=await api('cliente',undefined,{id});if(turno!==epoca)return;ficha=r;pintarFicha();mostrarFicha(true);avisar('');$('#seccionClientes').scrollIntoView({block:'start'});}
 catch(e){if(turno===epoca)avisar(e.message);}
}
function cifras(){
 const g={si:0,proceso:0,no:0};
 for(const p of ficha.pedidos)g[grupoPedido(p)]++;
 const vendido=ficha.pedidos.filter(p=>grupoPedido(p)==='si'&&p.importe!=null).reduce((a,p)=>a+Number(p.importe),0);
 return `<div class="cl-cifras"><div class="cl-cifra cl-cifra--si"><strong>${g.si}</strong><span>${g.si===1?'Pedido cerrado':'Pedidos cerrados'}</span></div><div class="cl-cifra cl-cifra--proceso"><strong>${g.proceso}</strong><span>En proceso</span></div><div class="cl-cifra cl-cifra--no"><strong>${g.no}</strong><span>No se cerraron</span></div><div class="cl-cifra"><strong>${esc(pesos(vendido))}</strong><span>Vendido con IVA</span></div></div>`;
}
function filaPedido(p){
 const g=grupoPedido(p);
 return `<li class="cl-fila cl-fila--${g}"><button type="button" class="cl-abrir" data-pedido="${esc(p.id)}"><b>${esc(p.folio)}</b><small>${esc([fecha(p.created_at),p.prendas,p.piezas?p.piezas+' pzs':''].filter(Boolean).join(' · '))}</small></button>`+
  `<span class="cl-estado"><span class="control__estadochip control__estadochip--${esc(p.estado)}">${esc(p.archivado?'En papelera':ESTADO_PEDIDO[p.estado]||p.estado)}</span><small>${GRUPO[g]}</small></span>`+
  `<strong class="cl-importe">${p.importe!=null?esc(pesos(Number(p.importe))):p.cotizado?'Sin publicar':'Sin cotizar'}</strong>`+
  `<button type="button" class="btn btn--linea cl-duplicar" data-duplicar-pedido="${esc(p.id)}" data-folio="${esc(p.folio)}">Duplicar</button></li>`;
}
function filaCot(c){
 const g=grupoCot(c),importe=c.tipo==='rapida'?(c.total!=null?pesos(Number(c.total)):''):c.desde!=null?'Desde '+pesos(Number(c.desde))+' / pza':'';
 return `<li class="cl-fila cl-fila--${g}"><button type="button" class="cl-abrir" data-cot="${esc(c.id)}"><b>${esc(c.folio)}</b><small>${esc([fecha(c.updated_at),c.tipo==='rapida'?'Rápida':'Por modelo',c.modelos?c.modelos+(c.tipo==='rapida'?(c.modelos===1?' partida':' partidas'):(c.modelos===1?' modelo':' modelos')):''].filter(Boolean).join(' · '))}</small></button>`+
  `<span class="cl-estado"><i class="cm-chip cm-chip--${esc(c.estado)}">${esc(ESTADO_COT[c.estado]||c.estado)}</i><small>${GRUPO[g]}</small></span>`+
  `<strong class="cl-importe">${esc(importe)}</strong>`+
  `<button type="button" class="btn btn--linea cl-duplicar" data-duplicar-cot="${esc(c.id)}" data-folio="${esc(c.folio)}">Duplicar</button></li>`;
}
function formulario(c){
 return `<form id="clForm" class="cot-panel cl-form" novalidate><h3>${c?'Datos del cliente':'Cliente nuevo'}</h3><div class="cl-campos">
 <label>Nombre o empresa<input name="nombre" required minlength="2" maxlength="180" autocomplete="off" value="${esc(c?.nombre)}"></label>
 <label>Empresa (opcional)<input name="empresa" maxlength="180" autocomplete="off" value="${esc(c?.empresa)}"></label>
 <label>Teléfono<input name="telefono" type="tel" inputmode="tel" maxlength="20" autocomplete="off" placeholder="10 dígitos" value="${esc(telVista(c?.telefono))}"></label>
 <label>Correo<input name="correo" type="email" maxlength="254" autocomplete="off" value="${esc(c?.correo)}"></label></div>
 <label>Notas<textarea name="notas" rows="3" maxlength="2000" placeholder="Cómo factura, quién autoriza, tallas que siempre pide…">${esc(c?.notas)}</textarea></label>
 <p id="clFormEstado" class="cl-form-estado" role="status" aria-live="polite"></p>
 <div class="cl-form-botones">${c?'<button type="button" class="btn-texto" data-cl-juntar>Juntar con otro cliente…</button>':''}<span></span><button type="button" class="btn btn--linea" data-cl-cancelar-form>Cancelar</button><button type="submit" class="btn btn--azul">Guardar</button></div></form>`;
}
function pintarFicha(){
 const c=ficha.cliente;
 $('#clFicha').innerHTML=`<button type="button" class="btn-texto" data-cl-volver>← Clientes</button>
 <div class="cl-cab"><div><h2>${esc(c.nombre)}</h2><p>${esc([c.empresa,telVista(c.telefono)?'tel. '+telVista(c.telefono):'',c.correo].filter(Boolean).join(' · ')||'Sin datos de contacto')}</p></div>
 <div class="cl-acciones"><button type="button" class="btn btn--azul" data-cl-cotizar="rapida">+ Cotizar</button><button type="button" class="btn btn--linea" data-cl-cotizar="modelos">+ Por modelo y talla</button><button type="button" class="btn btn--linea" data-cl-editar>Editar datos</button><button type="button" class="btn btn--linea" data-cl-juntar>Unir con otro cliente…</button></div></div>
 ${editando?formulario(c):''}${cifras()}${c.notas&&!editando?`<p class="cl-notas">${esc(c.notas)}</p>`:''}
 <section class="cot-panel cl-historial"><h3>Pedidos <span>${ficha.pedidos.length}</span></h3>${ficha.pedidos.length?'<ul class="cl-filas">'+ficha.pedidos.map(filaPedido).join('')+'</ul>':'<p class="cot-ayuda">Sin pedidos todavía.</p>'}</section>
 <section class="cot-panel cl-historial"><h3>Cotizaciones <span>${ficha.cotizaciones.length}</span></h3>${ficha.cotizaciones.length?'<ul class="cl-filas">'+ficha.cotizaciones.map(filaCot).join('')+'</ul>':'<p class="cot-ayuda">Sin cotizaciones guardadas.</p>'}</section>`;
}
function nuevoCliente(){
 epoca++;ficha=null;editando=true;avisar('');
 $('#clFicha').innerHTML='<button type="button" class="btn-texto" data-cl-volver>← Clientes</button>'+formulario(null);mostrarFicha(true);$('#clForm [name=nombre]').focus();
}
$('#clNuevo').addEventListener('click',nuevoCliente);
async function guardarForm(f,forzar=false){
 const v=Object.fromEntries(new FormData(f));const estado=$('#clFormEstado');
 if(!f.reportValidity())return;
 const boton=f.querySelector('[type=submit]');boton.disabled=true;estado.textContent='Guardando…';
 try{
  const r=await api('cliente-guardar',ficha?{...v,id:ficha.cliente.id,version:ficha.cliente.version}:{...v,...(forzar?{forzar:true}:{})});
  editando=false;await cargarLista();await abrirFicha(r.cliente.id);avisar(r.cliente.nombre+' guardado.');
 }catch(e){
  estado.textContent=e.message;
  if(!ficha&&/Ya existe/.test(e.message)){estado.insertAdjacentHTML('beforeend',' <button type="button" class="btn-texto" data-cl-forzar>Crear de todos modos</button>');}
 }finally{boton.disabled=false;}
}
$('#clFicha').addEventListener('submit',e=>{e.preventDefault();void guardarForm(e.target);});
$('#clFicha').addEventListener('click',async e=>{
 const t=e.target;
 if(t.closest('[data-cl-volver]')){epoca++;editando=false;mostrarFicha(false);void cargarLista();return;}
 if(t.closest('[data-cl-editar]')){editando=!editando;pintarFicha();if(editando)$('#clForm [name=nombre]').focus();return;}
 if(t.closest('[data-cl-cancelar-form]')){if(!ficha){mostrarFicha(false);return;}editando=false;pintarFicha();return;}
 if(t.closest('[data-cl-forzar]')){void guardarForm($('#clForm'),true);return;}
 if(t.closest('[data-cl-juntar]')){void juntar();return;}
 const cot=t.closest('[data-cl-cotizar]');if(cot){dispatchEvent(new CustomEvent('zain:nueva-cotizacion',{detail:{modo:cot.dataset.clCotizar,cliente:{id:ficha.cliente.id,nombre:ficha.cliente.nombre}}}));return;}
 const p=t.closest('[data-pedido]');if(p){dispatchEvent(new CustomEvent('zain:abrir-pedido',{detail:{id:p.dataset.pedido}}));return;}
 const c=t.closest('[data-cot]');if(c){dispatchEvent(new CustomEvent('zain:abrir-cotizacion',{detail:{id:c.dataset.cot}}));return;}
 const dp=t.closest('[data-duplicar-pedido]');if(dp){void duplicarPedido(dp.dataset.duplicarPedido,dp.dataset.folio,{id:ficha.cliente.id,nombre:ficha.cliente.nombre});return;}
 const dc=t.closest('[data-duplicar-cot]');if(dc){void duplicarCotizacion(dc.dataset.duplicarCot,dc.dataset.folio,{id:ficha.cliente.id,nombre:ficha.cliente.nombre});}
});

// Selector de cliente (cambiar, duplicar o juntar): busca en la lista o crea uno nuevo con lo que se escribió.
let eleccion=null;
function elegirCliente({titulo,texto='',actual=null,boton='Listo',excluir=null,crear=true,accion}){
 return new Promise(resolve=>{
  const d=$('#clElegir');eleccion={actual,excluir,crear,accion,resolve,elegido:actual?.id?{...actual}:null};
  $('#clElegirTitulo').textContent=titulo;$('#clElegirTexto').textContent=texto;$('#clElegirOk').textContent=boton;$('#clElegirEstado').textContent='';
  $('#clElegirBuscar').value='';pintarEleccion();d.showModal();$('#clElegirBuscar').focus();
  if(!lista.length)void cargarLista().then(pintarEleccion);
 });
}
function pintarEleccion(){
 if(!eleccion)return;
 const texto=$('#clElegirBuscar').value.trim(),q=clave(texto),e=eleccion;
 const vistos=lista.filter(c=>c.id!==e.excluir&&coincide(c,q)).slice(0,8);
 if(e.elegido&&!e.elegido.nuevo&&!vistos.some(c=>c.id===e.elegido.id)&&e.elegido.id!==e.excluir){const c=lista.find(x=>x.id===e.elegido.id)||e.elegido;vistos.unshift(c);}
 const exacto=lista.some(c=>clave(c.nombre)===q);
 $('#clElegirLista').innerHTML=vistos.map(c=>`<li><button type="button" class="cl-opcion${e.elegido?.id===c.id?' on':''}" data-elegir="${esc(c.id)}" aria-pressed="${e.elegido?.id===c.id}"><b>${esc(c.nombre)}${e.actual?.id===c.id?' <small>(el mismo)</small>':''}</b><small>${esc([c.empresa,telVista(c.telefono)].filter(Boolean).join(' · '))}</small></button></li>`).join('')+
  (e.crear&&q.length>=2&&!exacto?`<li><button type="button" class="cl-opcion cl-opcion--nuevo${e.elegido?.nuevo?' on':''}" data-elegir-nuevo>+ Cliente nuevo: «${esc(texto)}»</button></li>`:'')+
  (!vistos.length&&!(e.crear&&q.length>=2)?'<li class="cl-vacia">Escribe el nombre del cliente.</li>':'');
 $('#clElegirOk').disabled=!e.elegido||e.elegido.id===e.excluir;
}
$('#clElegirBuscar').addEventListener('input',pintarEleccion);
$('#clElegirLista').addEventListener('click',e=>{
 const b=e.target.closest('[data-elegir]'),n=e.target.closest('[data-elegir-nuevo]');if(!eleccion)return;
 if(b){const c=lista.find(x=>x.id===b.dataset.elegir)||(eleccion.actual?.id===b.dataset.elegir?eleccion.actual:null);eleccion.elegido=c?{id:c.id,nombre:c.nombre}:null;}
 if(n)eleccion.elegido={nuevo:true,nombre:$('#clElegirBuscar').value.trim()};
 pintarEleccion();
});
function cerrarEleccion(valor){const e=eleccion;eleccion=null;$('#clElegir').close();e?.resolve(valor);}
$('#clElegir [data-cl-cancelar]').addEventListener('click',()=>cerrarEleccion(null));
$('#clElegir').addEventListener('cancel',e=>{e.preventDefault();if(!$('#clElegirOk').dataset.ocupado)cerrarEleccion(null);});
$('#clElegirOk').addEventListener('click',async()=>{
 const e=eleccion,b=$('#clElegirOk');if(!e?.elegido||b.dataset.ocupado)return;
 b.dataset.ocupado='1';b.disabled=true;$('#clElegirEstado').textContent='Un momento…';
 try{
  let c=e.elegido;
  if(c.nuevo){const r=await api('cliente-guardar',{nombre:c.nombre});c={id:r.cliente.id,nombre:r.cliente.nombre};e.elegido=c;void cargarLista();}
  const resultado=e.accion?await e.accion(c):c;
  delete b.dataset.ocupado;cerrarEleccion(resultado);
 }catch(er){delete b.dataset.ocupado;$('#clElegirEstado').textContent=er.message;b.disabled=false;}
});

// Duplicar un pedido: mismo diseño, tallas, logos y la cotización como borrador; el id nuevo se fija al abrir el
// diálogo para que un reintento no cree dos pedidos.
async function duplicarPedido(id,folio,actual){
 const nuevo=crypto.randomUUID();
 const r=await elegirCliente({titulo:'Duplicar '+folio,texto:'Se crea un pedido nuevo con las mismas prendas, tallas, logos y diseño. La cotización queda como borrador para revisarla y publicarla. Empieza en «Por revisar», sin pagos ni gastos. ¿Para qué cliente?',actual,boton:'Duplicar pedido',
  accion:c=>api('pedido-duplicar',{origen:id,nuevo,cliente_id:c.id})});
 if(!r)return;
 dispatchEvent(new CustomEvent('zain:gastos-guardados'));
 dispatchEvent(new CustomEvent('zain:abrir-pedido',{detail:{id:r.pedido.id,pestana:'cotizacion'}}));
 avisar('Pedido '+r.pedido.folio+' creado.');if(ficha)void abrirFicha(ficha.cliente.id);
}
async function duplicarCotizacion(id,folio,actual){
 const c=await elegirCliente({titulo:'Duplicar '+folio,texto:'Se abre una copia en Cotizaciones con los mismos modelos, precios y logo. Guárdala para darle folio nuevo. ¿Para qué cliente?',actual,boton:'Abrir copia'});
 if(c)dispatchEvent(new CustomEvent('zain:abrir-cotizacion',{detail:{id,duplicar:true,cliente:c}}));
}
async function juntar(){
 const c=ficha.cliente;
 const r=await elegirCliente({titulo:'Juntar «'+c.nombre+'» con…',texto:'Los pedidos y cotizaciones de «'+c.nombre+'» pasan al cliente que elijas, y sus datos completan los que le falten. No se borra nada.',excluir:c.id,crear:false,boton:'Juntar',
  accion:d=>api('cliente-unir',{origen:c.id,destino:d.id})});
 if(!r)return;editando=false;await cargarLista();await abrirFicha(r.cliente.id);avisar('Clientes juntados.');
}

// Cliente en la ficha del pedido: ver su ficha, cambiarlo o duplicar el pedido.
let pedidoAbierto=null;
function barraPedido(){
 const x=pedidoAbierto,cab=$('#detalle .ficha-cab');if(!x||!cab)return;
 $('#detalle .ficha-cliente')?.remove();
 const c=x.cliente_id?lista.find(y=>y.id===x.cliente_id):null,nombre=c?.nombre||(x.cliente_id?x.cliente?.nombre:'');
 cab.insertAdjacentHTML('afterend',`<div class="ficha-cliente"><span>${nombre?'Cliente: <b>'+esc(nombre)+'</b>':'Sin ficha de cliente'}</span>${x.cliente_id?'<button type="button" class="btn-texto" data-cl-ver>Ver cliente</button>':''}<button type="button" class="btn-texto" data-cl-cambiar>${x.cliente_id?'Cambiar':'Elegir cliente'}</button><button type="button" class="btn btn--linea" data-cl-duplicar>Duplicar pedido</button></div>`);
}
addEventListener('zain:pedido-abierto',e=>{pedidoAbierto=e.detail;barraPedido();if(!lista.length)void cargarLista().then(barraPedido);});
$('#detalle')?.addEventListener('click',async e=>{
 const x=pedidoAbierto;if(!x||!e.target.closest('.ficha-cliente'))return;
 const actual=x.cliente_id?{id:x.cliente_id,nombre:lista.find(y=>y.id===x.cliente_id)?.nombre||x.cliente?.nombre||''}:null;
 if(e.target.closest('[data-cl-ver]')){$('#ficha')?.close();if($('#seccionClientes').hidden)$('#verClientes').click();void abrirFicha(x.cliente_id);return;}
 if(e.target.closest('[data-cl-duplicar]')){void duplicarPedido(x.id,x.folio,actual);return;}
 if(e.target.closest('[data-cl-cambiar]')){
  const r=await elegirCliente({titulo:'Cliente de '+x.folio,texto:'El pedido y su historial pasan a la ficha que elijas.',actual,boton:'Guardar',accion:c=>api('cliente-asignar',{pedido_id:x.id,cliente_id:c.id})});
  if(!r)return;void cargarLista();dispatchEvent(new CustomEvent('zain:gastos-guardados'));dispatchEvent(new CustomEvent('zain:abrir-pedido',{detail:{id:x.id}}));
 }
});

nav.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;const on=b.id==='verClientes';
 $('#seccionClientes').hidden=!on;$('#verClientes').classList.toggle('on',on);$('#verClientes').setAttribute('aria-pressed',String(on));
 if(on){
  for(const s of $('#trabajo').children)if(s.tagName==='SECTION'||s.id==='seccionPedidos')s.hidden=s.id!=='seccionClientes';
  for(const x of nav.querySelectorAll('button'))if(x!==b){x.classList.remove('on');x.setAttribute('aria-pressed','false');}
  history.replaceState(null,'','#clientes');void cargarLista();
 }
});
addEventListener('zain:equipo-listo',()=>{void cargarLista();if(location.hash==='#clientes'&&$('#seccionClientes').hidden)$('#verClientes').click();});
addEventListener('zain:equipo-salio',()=>{epoca++;lista=[];sel.clear();ficha=null;editando=false;pedidoAbierto=null;filtro='';$('#clBuscar').value='';mostrarFicha(false);$('#clFicha').replaceChildren();$('#clLista').innerHTML='<li class="cl-vacia">Cargando clientes…</li>';avisar('');publicar();});
