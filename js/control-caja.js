import {pesos,decimal} from './cotizacion-core.js?v=17';
import {esc} from './cotizacion-vista.js?v=11';
// Caja ZAIN tipo Tricount: saldos en vivo, libro único de movimientos, transferencias y reparto pagado.
const $=s=>document.querySelector(s),api=(op,b,q)=>window.ZAINEquipo.call(op,b,q);
const personas={juan_pablo:'Juan Pablo',garcia:'García',zain:'Caja ZAIN'};
const hoy=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Mexico_City'});
const FILTROS=[['','Todo'],['cobro','Cobros'],['gasto','Gastos'],['caja','Caja y reparto']];
const RUTAS=[['juan_pablo','zain','Juan Pablo → Caja ZAIN'],['garcia','zain','García → Caja ZAIN'],['zain','juan_pablo','Caja ZAIN → Juan Pablo'],['zain','garcia','Caja ZAIN → García']];
let datos=null,epoca=0,filtro='',visibles=30,ocupado=false,ultima=null;

export function montarCaja(){
 $('#finTablero').insertAdjacentHTML('beforebegin',`<section id="finCaja" class="cot-panel fin-caja" aria-labelledby="finCajaTitulo">
 <div class="fin-caja-cab"><div><h2 id="finCajaTitulo">Caja y cuentas</h2><p class="cot-ayuda">Saldos al momento con todos los cobros, gastos, reembolsos, transferencias y repartos.</p></div>
 <div class="fin-caja-acciones"><button type="button" class="btn btn--linea" data-nuevo="transferencia">Transferencia</button><button type="button" class="btn btn--linea" data-nuevo="reparto">Repartir utilidad</button><button type="button" class="btn btn--azul" data-nuevo="general">+ Gasto o ingreso</button></div></div>
 <p id="cajaEstado" class="control__estado" role="status"></p><div id="cajaSaldos"></div>
 <form id="cajaForm" class="fin-form fin-caja-form" hidden><fieldset class="fin-tipo fin-ancho"><legend class="sr-only">Tipo</legend><label class="cot-chip"><input type="radio" name="tipo" value="transferencia" checked><span>Transferencia</span></label><label class="cot-chip"><input type="radio" name="tipo" value="reparto"><span>Reparto de utilidad</span></label></fieldset>
 <label data-solo="transferencia">Movimiento<select name="ruta">${RUTAS.map(([o,d,t])=>`<option value="${o}:${d}">${t}</option>`).join('')}</select></label>
 <label data-solo="reparto" hidden>Para<select name="para"><option value="juan_pablo">Juan Pablo</option><option value="garcia">García</option></select></label>
 <label>Importe (MXN)<input name="importe" type="number" inputmode="decimal" min="0.01" step="0.01" required></label>
 <label>Fecha<input name="fecha" type="date" required></label>
 <label class="fin-ancho">Concepto<input name="concepto" maxlength="180" required placeholder="Depósito del anticipo que cobré"></label>
 <p class="cot-ayuda fin-ancho" data-ayuda></p>
 <div class="fin-ancho fin-caja-botones"><button class="btn btn--azul">Guardar</button><button type="button" class="btn-texto" data-cancelar>Cancelar</button></div><p id="cajaMensaje" class="fin-ancho" role="status"></p></form>
 <div class="fin-movscab fin-libro-cab"><h3>Libro de movimientos</h3><div class="bandeja-chips" id="cajaFiltro">${FILTROS.map(([v,t])=>`<button type="button" data-filtro="${v}">${t}</button>`).join('')}</div></div>
 <ol id="cajaLibro" class="fin-libro"></ol></section>`);
 $('#finCaja').addEventListener('click',clic);$('#cajaForm').addEventListener('change',e=>{if(['tipo','para'].includes(e.target.name))formulario();});
 $('#cajaForm').addEventListener('submit',guardar);$('#cajaLibro').addEventListener('change',receptor);$('#cajaLibro').addEventListener('submit',anular);
}
export async function cargarCaja(){
 const turn=++epoca;$('#cajaEstado').textContent='Calculando saldos…';
 try{const r=await api('caja');if(turn!==epoca)return;datos=r.caja;pintar();$('#cajaEstado').textContent='';}
 catch(e){if(turn!==epoca)return;$('#cajaEstado').textContent=/no encontrada|404|zain_caja/i.test(e.message)?'Falta aplicar la actualización de la caja en el servidor.':e.message;}
}
export function limpiarCaja(){epoca++;datos=null;for(const id of ['cajaSaldos','cajaLibro'])$('#'+id)?.replaceChildren();}
const firmado=n=>(n>0?'+':n<0?'−':'')+pesos(Math.abs(n));
function socio(k){
 const v=Number(datos.socios[k]);
 return `<div class="${v<0?'fin-debe':''}"><small>${personas[k]}</small><strong>${esc(pesos(Math.abs(v)))}</strong><span>${v>0?'ZAIN le debe':v<0?'Tiene dinero del negocio':'Sin saldo'}</span></div>`;
}
function pintar(){
 const u=datos.utilidad,n=k=>Number(u.por_repartir[k]),caja=Number(datos.caja);
 $('#cajaSaldos').innerHTML=`<div class="fin-kpis fin-saldos"><div class="fin-kpi-neta ${caja<0?'fin-negativa':''}"><small>Caja ZAIN</small><strong>${esc(firmado(caja).replace(/^\+/,''))}</strong><span>Dinero del negocio · incluye IVA cobrado</span></div>${socio('juan_pablo')}${socio('garcia')}
 <div><small>Por repartir · utilidad cerrada</small><strong>${esc(pesos(Math.max(0,n('juan_pablo'))+Math.max(0,n('garcia'))))}</strong><span>JP ${esc(pesos(n('juan_pablo')))} · García ${esc(pesos(n('garcia')))}</span><span>${Number(u.pedidos_cerrados)} ${Number(u.pedidos_cerrados)===1?'pedido cerrado':'pedidos cerrados'} · repartido ${esc(pesos(Number(u.repartido.juan_pablo)+Number(u.repartido.garcia)))}</span></div></div>
 ${Number(u.provisional)?`<p class="cot-ayuda">Utilidad provisional de pedidos vendidos sin cerrar: ${esc(pesos(Number(u.provisional)))}. Se puede repartir al cerrarlos.</p>`:''}
 ${Number(datos.papelera)?`<p class="cot-alerta">El libro incluye cobros o gastos de ${datos.papelera} ${datos.papelera==1?'pedido':'pedidos'} en papelera. Es dinero real: restaura el pedido o corrige sus movimientos.</p>`:''}`;
 libro();
}
const tipoDe=m=>m.origen==='pago'?'cobro':m.origen==='caja'?'caja':m.tipo==='ingreso'?'cobro':'gasto';
function libro(){
 for(const b of $('#cajaFiltro').children){const on=b.dataset.filtro===filtro;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));}
 const lista=datos.libro.filter(m=>!filtro||tipoDe(m)===filtro||(filtro==='gasto'&&m.tipo==='reembolso')),parte=lista.slice(0,visibles);
 $('#cajaLibro').innerHTML=parte.length?parte.map(fila).join('')+(lista.length>visibles?`<li class="fin-libro-mas"><button type="button" class="btn btn--linea" data-mas>Ver más (${lista.length-visibles})</button></li>`:''):'<li class="cot-ayuda">Sin movimientos con este filtro.</li>';
}
function fila(m){
 const ec=Number(m.efecto_caja),es=Number(m.efecto_socio),quien=personas[m.persona]||'';
 const titulo=m.origen==='pago'?'Cobro':m.origen==='caja'?(m.tipo==='reparto'?'Reparto a '+personas[m.destino]:m.destino==='zain'?quien+' depositó a la caja':'La caja dio a '+personas[m.destino]):m.tipo==='reembolso'?'Reembolso a '+quien:m.tipo==='ingreso'?'Ingreso':'Gasto';
 const detalle=[m.folio?esc(m.folio)+(m.en_papelera?' (papelera)':''):m.origen==='general'?'General':'',m.origen==='pedido'||m.origen==='general'?(m.tipo==='gasto'?'Pagó ':m.tipo==='ingreso'?'Recibió ':'')+(m.tipo==='reembolso'?'':quien):'',m.origen!=='caja'&&!ec&&es?(es>0?'ZAIN le debe a '+quien+' '+pesos(es):quien+' tiene '+pesos(-es)+' del negocio'):''].filter(Boolean).join(' · ');
 const recibio=m.origen==='pago'?`<label class="fin-recibio">Lo recibió<select data-pago="${esc(m.id)}">${Object.entries(personas).map(([k,v])=>`<option value="${k}"${k===m.persona?' selected':''}>${v}</option>`).join('')}</select></label>`:'';
 const anular=m.origen==='caja'?`<details><summary>Anular</summary><form data-anular="${esc(m.id)}" class="fin-anular"><label>Motivo<input name="motivo" minlength="5" maxlength="500" required placeholder="Se capturó dos veces"></label><button class="btn btn--linea">Anular</button></form></details>`:'';
 return `<li class="fin-libro-fila"><span class="fin-libro-fecha">${esc(fechaCorta(m.fecha))}</span><div><b>${esc(titulo)}</b><p>${esc(m.concepto)}</p>${detalle?`<p class="fin-libro-meta">${detalle}</p>`:''}${recibio||anular?`<div class="gastos-acciones">${recibio}${anular}</div>`:''}</div><strong class="${ec>0?'fin-ingreso':ec<0?'fin-egreso':'fin-neutro'}" title="Efecto en la Caja ZAIN">${ec?esc(firmado(ec)):esc(pesos(Number(m.importe)))}</strong></li>`;
}
const fechaCorta=f=>new Date(f+'T12:00:00').toLocaleDateString('es-MX',{day:'numeric',month:'short'});
function formulario(){
 const f=$('#cajaForm'),tipo=f.elements.tipo.value;
 for(const el of f.querySelectorAll('[data-solo]'))el.hidden=el.dataset.solo!==tipo;
 f.elements.fecha.max=hoy();if(!f.elements.fecha.value)f.elements.fecha.value=hoy();
 const sugerido=datos&&tipo==='reparto'?Number(datos.utilidad.por_repartir[f.elements.para.value]):0;
 if(tipo==='reparto'&&sugerido>0&&!f.elements.importe.dataset.tocado)f.elements.importe.value=(sugerido/100).toFixed(2);
 f.elements.concepto.placeholder=tipo==='reparto'?'Reparto de utilidades de octubre':'Depósito del anticipo que cobré';
 f.querySelector('[data-ayuda]').textContent=tipo==='reparto'?'Sale de la Caja ZAIN y cuenta como utilidad ya repartida. Le toca '+pesos(Math.max(0,sugerido))+' pendiente.':'Para mover dinero entre un socio y la caja: depositar un cobro que recibiste, sacar efectivo o prestar al negocio.';
}
function clic(e){
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.nuevo==='general'){const d=$('#finRegistrar');d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'});return;}
 if(b.dataset.nuevo){const f=$('#cajaForm');f.hidden=false;f.reset();delete f.elements.importe.dataset.tocado;f.elements.tipo.value=b.dataset.nuevo;formulario();f.elements.importe.focus();$('#cajaMensaje').textContent='';return;}
 if(b.hasAttribute('data-cancelar')){$('#cajaForm').hidden=true;ultima=null;return;}
 if(b.closest('#cajaFiltro')&&datos){filtro=b.dataset.filtro;visibles=30;libro();return;}
 if(b.hasAttribute('data-mas')){visibles+=30;libro();}
}
async function guardar(e){
 e.preventDefault();if(ocupado)return;const f=e.currentTarget,fd=new FormData(f),tipo=fd.get('tipo');
 try{
  const [origen,destino]=tipo==='reparto'?['zain',fd.get('para')]:String(fd.get('ruta')).split(':');
  const mov={tipo,origen,destino,importe:decimal(fd.get('importe')),fecha:fd.get('fecha'),concepto:String(fd.get('concepto')||'')};
  const firma=JSON.stringify(mov);if(!ultima||ultima.firma!==firma)ultima={firma,request:crypto.randomUUID()};
  ocupado=true;for(const el of f.elements)el.disabled=true;$('#cajaMensaje').textContent='Guardando…';
  const r=await api('caja-guardar',{...mov,request:ultima.request});ultima=null;datos=r.caja;pintar();f.hidden=true;$('#cajaEstado').textContent=tipo==='reparto'?'Reparto registrado.':'Transferencia registrada.';
 }catch(er){$('#cajaMensaje').textContent=er.message;}finally{ocupado=false;for(const el of f.elements)el.disabled=false;}
}
async function receptor(e){
 const s=e.target.closest('[data-pago]');if(!s)return;s.disabled=true;
 try{const r=await api('caja-receptor',{id:s.dataset.pago,recibio:s.value});datos=r.caja;pintar();$('#cajaEstado').textContent='Actualizado quién recibió el cobro.';}
 catch(er){$('#cajaEstado').textContent=er.message;s.disabled=false;}
}
async function anular(e){
 const f=e.target.closest('[data-anular]');if(!f)return;e.preventDefault();const b=f.querySelector('button');b.disabled=true;
 try{const r=await api('caja-anular',{id:f.dataset.anular,motivo:new FormData(f).get('motivo')});datos=r.caja;pintar();$('#cajaEstado').textContent='Movimiento anulado.';}
 catch(er){$('#cajaEstado').textContent=er.message;b.disabled=false;}
}
addEventListener('input',e=>{if(e.target.closest?.('#cajaForm')&&e.target.name==='importe')e.target.dataset.tocado='1';});
