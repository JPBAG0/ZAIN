import {pesos,decimal} from './cotizacion-core.js?v=17';
import {esc} from './cotizacion-vista.js?v=12';
// Caja ZAIN y oficinas tipo Tricount con libro flexible: registrar, corregir, mover de pedido y borrar cualquier movimiento.
// Los saldos y las reglas viven en la base (zain_caja_resumen y zain_libro_operar); aquí solo se captura.
const $=s=>document.querySelector(s),api=(op,b,q)=>window.ZAINEquipo.call(op,b,q);
const personas={juan_pablo:'Juan Pablo',garcia:'García',zain:'Caja ZAIN',oficina_jp:'Oficina JP',oficina_garcia:'Oficina García'},CAJAS=['zain','oficina_jp','oficina_garcia'];
const hoy=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Mexico_City'});
const FILTROS=[['','Todo'],['cobro','Cobros'],['gasto','Gastos'],['caja','Caja y reparto']];
const TIPOS=[['cobro','Cobro de pedido'],['gasto','Gasto'],['ingreso','Ingreso'],['reembolso','Reembolso'],['transferencia','Transferencia'],['reparto','Reparto']];
let avisoHasta=0,datos=null,categorias={gasto:[],ingreso:[]},epoca=0,filtro='',visibles=30,ocupado=false,editando=null,ultima=null,porBorrar=null;
// Finanzas de cada pedido (partidas cotizadas y partida de cada gasto) para elegir la partida al registrar un gasto.
const gastosPedido=new Map();

export function montarCaja(){
 $('#finTablero').insertAdjacentHTML('beforebegin',`<section id="finCaja" class="cot-panel fin-caja" aria-labelledby="finCajaTitulo">
 <div class="fin-caja-cab"><div><h2 id="finCajaTitulo">Caja y cuentas</h2><p class="cot-ayuda">Saldos al momento. Todo se puede corregir, mover de pedido o borrar desde el libro de movimientos, al final de la página.</p></div>
 <div class="fin-caja-acciones"><button type="button" class="btn btn--azul" data-nuevo="cobro">+ Registrar movimiento</button><button type="button" class="btn btn--linea" data-nuevo="reparto">Repartir utilidad</button></div></div>
 <p id="cajaEstado" class="control__estado" role="status"></p><div id="cajaSaldos"></div>
 <form id="cajaForm" class="fin-form fin-caja-form" hidden novalidate>
  <h3 class="fin-ancho" id="cajaFormTitulo">Registrar movimiento</h3>
  <fieldset class="fin-tipo fin-ancho"><legend class="sr-only">Tipo</legend>${TIPOS.map(([v,t])=>`<label class="cot-chip"><input type="radio" name="tipo" value="${v}"><span>${t}</span></label>`).join('')}</fieldset>
  <label class="fin-ancho" data-campo="pedido">Pedido<select name="pedido"></select><small data-saldo-pedido></small></label>
  <label class="fin-ancho" data-campo="partida">Partida<select name="partida"></select><small>Para comparar lo pagado contra lo cotizado de cada partida.</small></label>
  <label data-campo="ruta">De<select name="de">${Object.entries(personas).map(([k,t])=>`<option value="${k}">${t}</option>`).join('')}</select></label>
  <label data-campo="para">Para<select name="para">${Object.entries(personas).map(([k,t])=>`<option value="${k}"${k==='zain'?' selected':''}>${t}</option>`).join('')}</select></label>
  <label data-campo="persona"><span data-persona-label>Quién pagó</span><select name="persona"></select></label>
  <label>Importe (MXN)<input name="importe" type="number" inputmode="decimal" min="0.01" step="0.01" required></label>
  <label>Fecha<input name="fecha" type="date" required></label>
  <label data-campo="categoria">Categoría<select name="categoria"></select></label>
  <fieldset data-campo="grupo" class="fin-tipo"><legend>¿Qué tipo de gasto?</legend><label class="cot-chip"><input type="radio" name="grupo" value="base"><span>Material del pedido</span></label><label class="cot-chip"><input type="radio" name="grupo" value="extra"><span>Gasto extra</span></label></fieldset>
  <label class="fin-ancho"><span data-concepto-label>Concepto</span><input name="concepto" maxlength="180"></label>
  <label data-campo="iva">IVA recuperable (MXN)<input name="iva" type="number" inputmode="decimal" min="0" step="0.01" value="0.00"></label>
  <label class="fin-ancho" data-campo="comprobante">Comprobante (opcional)<input name="archivo" type="file" accept="image/jpeg,image/png,image/webp,application/pdf"><small data-comprobante-actual>JPG, PNG, WEBP o PDF · hasta 4 MB</small></label>
  <p class="cot-ayuda fin-ancho" data-ayuda></p>
  <div class="fin-ancho fin-caja-botones"><button class="btn btn--azul" type="submit">Guardar</button><button type="button" class="btn-texto" data-cancelar>Cancelar</button><button type="button" class="btn-texto fin-borrar" data-borrar-form hidden>Borrar este movimiento</button></div>
  <p id="cajaMensaje" class="fin-ancho" role="status"></p></form></section>`);
 // El libro va al final, después del tablero, para no tener que bajar más conforme crece.
 $('#finTablero').insertAdjacentHTML('afterend',`<section id="finLibro" class="cot-panel fin-caja" aria-labelledby="finLibroTitulo">
 <div class="fin-movscab fin-libro-cab"><h2 id="finLibroTitulo">Libro de movimientos</h2><div class="bandeja-chips" id="cajaFiltro">${FILTROS.map(([v,t])=>`<button type="button" data-filtro="${v}">${t}</button>`).join('')}</div></div>
 <ol id="cajaLibro" class="fin-libro"></ol></section>`);
 for(const id of ['#finCaja','#finLibro'])$(id).addEventListener('click',clic);
 $('#cajaForm').addEventListener('change',e=>{if(['tipo','pedido','persona'].includes(e.target.name))formulario(false,e.target.name);});
 $('#cajaForm').addEventListener('input',e=>{if(['importe','partida'].includes(e.target.name))e.target.dataset.tocado='1';});
 $('#cajaForm').addEventListener('submit',guardar);
}
export async function cargarCaja(){
 const turn=++epoca,conAviso=Date.now()<avisoHasta;if(!conAviso)$('#cajaEstado').textContent='Calculando saldos…';
 try{const r=await api('caja');if(turn!==epoca)return;datos=r.caja;categorias=r.categorias||categorias;pintar();if(Date.now()>=avisoHasta)$('#cajaEstado').textContent='';}
 catch(e){if(turn!==epoca)return;$('#cajaEstado').textContent=/no encontrada|404|zain_caja/i.test(e.message)?'Falta aplicar la actualización de la caja en el servidor.':e.message;}
}
export function limpiarCaja(){epoca++;datos=null;editando=null;gastosPedido.clear();for(const id of ['cajaSaldos','cajaLibro'])$('#'+id)?.replaceChildren();}
const firmado=n=>(n>0?'+':n<0?'−':'')+pesos(Math.abs(n));
function socio(k){
 const v=Number(datos.socios[k]);
 return `<div class="${v<0?'fin-debe':''}"><small>${personas[k]}</small><strong>${esc(pesos(Math.abs(v)))}</strong><span>${v>0?'ZAIN le debe':v<0?'Tiene dinero del negocio':'Sin saldo'}</span></div>`;
}
function pintar(){
 const u=datos.utilidad,n=k=>Number(u.por_repartir[k]),caja=Number(datos.caja),cerrados=Number(u.pedidos_cerrados);
 const cajas=datos.cajas||{zain:caja},cajaHTML=(k,nota)=>{const v=Number(cajas[k]||0);return `<div class="${k==='zain'?'fin-kpi-neta ':''}${v<0?'fin-negativa':''}"><small>${personas[k]}</small><strong>${esc(firmado(v).replace(/^\+/,''))}</strong><span>${nota}</span></div>`;};
 $('#cajaSaldos').innerHTML=`<div class="fin-kpis fin-saldos">${cajaHTML('zain','Dinero del negocio · con IVA')}${cajaHTML('oficina_jp','Caja aparte')}${cajaHTML('oficina_garcia','Caja aparte')}${socio('juan_pablo')}${socio('garcia')}
 <div><small>Por repartir · utilidad cerrada</small><strong>${esc(pesos(Math.max(0,n('juan_pablo'))+Math.max(0,n('garcia'))))}</strong><span>JP ${esc(pesos(n('juan_pablo')))} · García ${esc(pesos(n('garcia')))}</span><span>${cerrados} ${cerrados===1?'pedido cerrado':'pedidos cerrados'} · repartido ${esc(pesos(Number(u.repartido.juan_pablo)+Number(u.repartido.garcia)))}</span></div></div>
 ${Number(datos.iva_cobrado)?`<p class="cot-ayuda">IVA incluido en las ventas: ${esc(pesos(Number(datos.iva_cobrado)))}. Todo se cuenta con IVA; si un cliente pide factura, ese IVA se paga.</p>`:''}
 ${Number(u.provisional)?`<p class="cot-ayuda">Utilidad provisional de pedidos vendidos sin cerrar: ${esc(pesos(Number(u.provisional)))}. Se puede repartir al cerrarlos.</p>`:''}
 ${Number(datos.papelera)?`<p class="cot-alerta">El libro incluye cobros o gastos de ${datos.papelera} ${datos.papelera==1?'pedido':'pedidos'} en papelera. Es dinero real: restaura el pedido o corrige sus movimientos.</p>`:''}`;
 libro();
}
const tipoDe=m=>m.origen==='pago'?'cobro':m.origen==='caja'?'caja':m.tipo==='ingreso'?'cobro':'gasto';
const claseDe=m=>m.origen==='pago'?'cobro':m.tipo;
function libro(){
 for(const b of $('#cajaFiltro').children){const on=b.dataset.filtro===filtro;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));}
 const lista=datos.libro.filter(m=>!filtro||tipoDe(m)===filtro||(filtro==='gasto'&&m.tipo==='reembolso')),parte=lista.slice(0,visibles);
 $('#cajaLibro').innerHTML=parte.length?parte.map(fila).join('')+(lista.length>visibles?`<li class="fin-libro-mas"><button type="button" class="btn btn--linea" data-mas>Ver más (${lista.length-visibles})</button></li>`:''):'<li class="cot-ayuda">Sin movimientos con este filtro.</li>';
}
function fila(m){
 const ec=Number(m.efecto_caja),es=Number(m.efecto_socio),quien=personas[m.persona]||'';
 const titulo=m.origen==='pago'?'Cobro':m.origen==='caja'?(m.tipo==='reparto'?'Reparto a '+personas[m.destino]:(personas[m.origen_persona]||'')+' → '+(personas[m.destino]||'')):m.tipo==='reembolso'?'Reembolso a '+quien:m.tipo==='ingreso'?'Ingreso':'Gasto';
 const detalle=[m.folio?esc(m.folio)+(m.en_papelera?' (papelera)':''):m.origen==='general'?'General':'',m.origen==='pago'?'Recibió '+quien:m.origen==='pedido'||m.origen==='general'?(m.tipo==='gasto'?'Pagó ':m.tipo==='ingreso'?'Recibió ':'')+(m.tipo==='reembolso'?'':quien):'',m.origen!=='caja'&&!ec&&es?(es>0?'ZAIN le debe a '+quien+' '+pesos(es):quien+' tiene '+pesos(-es)+' del negocio'):''].filter(Boolean).join(' · ');
 const acciones=porBorrar===m.id?`<span class="fin-confirmar">¿Borrar? <button type="button" class="btn-texto fin-borrar" data-borrar-si="${esc(m.id)}">Sí, borrar</button><button type="button" class="btn-texto" data-borrar-no>No</button></span>`:`${m.comprobante?`<button type="button" class="btn-texto" data-ver-comprobante="${esc(m.id)}">Ver comprobante</button>`:''}<button type="button" class="btn-texto" data-editar="${esc(m.id)}">Editar</button><button type="button" class="btn-texto fin-borrar" data-borrar="${esc(m.id)}">Borrar</button>`;
 return `<li class="fin-libro-fila${editando?.id===m.id?' fin-libro-fila--editando':''}"><span class="fin-libro-fecha">${esc(fechaCorta(m.fecha))}</span><div><b>${esc(titulo)}</b><p>${esc(m.concepto)}</p>${detalle?`<p class="fin-libro-meta">${detalle}</p>`:''}<div class="gastos-acciones">${acciones}</div></div><strong class="${ec>0?'fin-ingreso':ec<0?'fin-egreso':'fin-neutro'}" title="Efecto en la Caja ZAIN">${ec?esc(firmado(ec)):esc(pesos(Number(m.importe)))}</strong></li>`;
}
const fechaCorta=f=>new Date(f+'T12:00:00').toLocaleDateString('es-MX',{day:'numeric',month:'short'});
const opciones=(lista,v)=>lista.map(([k,t])=>`<option value="${esc(k)}"${k===v?' selected':''}>${esc(t)}</option>`).join('');
// Partida de un gasto de pedido: se muestra si la cotización publicada tiene partidas; al corregir parte de la ya guardada.
function partidas(f,id){
 const campo=f.querySelector('[data-campo="partida"]'),sel=f.elements.partida;
 if(!id){campo.hidden=true;return;}
 const fin=gastosPedido.get(id);
 if(fin===undefined){
  campo.hidden=true;gastosPedido.set(id,null);
  api('gastos',null,{id}).then(r=>{gastosPedido.set(id,r.finanzas);if(!f.hidden&&f.elements.pedido.value===id)partidas(f,id);}).catch(()=>gastosPedido.delete(id));return;
 }
 const lista=fin?.cotizado?.partidas||[];campo.hidden=!lista.length;if(!lista.length)return;
 const actual=sel.dataset.tocado?sel.value:editando?.origen==='pedido'?String(fin.movimientos.find(x=>x.id===editando.id)?.partida??''):sel.value;
 sel.innerHTML='<option value="">General del pedido · sin partida</option>'+lista.map((p,i)=>`<option value="${i}">${esc((i+1)+' · '+(p.nombre||'Partida')+(p.color?' · '+p.color:'')+(p.piezas?' · '+p.piezas+' pzs':''))}</option>`).join('');
 sel.value=lista[actual]?actual:'';
}
// Ajusta los campos visibles al tipo: el pedido se elige por folio; sin pedido, un gasto o reembolso es general.
function formulario(reiniciar,cambio){
 const f=$('#cajaForm'),tipo=f.elements.tipo.value||'cobro',pedido=f.elements.pedido.value,mostrar=(campo,si)=>{f.querySelector(`[data-campo="${campo}"]`).hidden=!si;};
 const pedidos=datos?.pedidos||[];
 f.elements.pedido.innerHTML=(tipo==='cobro'?'<option value="">Elige el folio…</option>':'<option value="">General · sin pedido</option>')+pedidos.map(p=>`<option value="${esc(p.id)}"${p.id===pedido?' selected':''}>${esc(p.folio)}${p.cliente?' · '+esc(p.cliente):''}${p.publicada?' · '+esc(pesos(Number(p.cobrado)))+' de '+esc(pesos(Number(p.total))):' · sin cotización publicada'}</option>`).join('');
 if(pedido&&!pedidos.some(p=>p.id===pedido))f.elements.pedido.insertAdjacentHTML('beforeend',`<option value="${esc(pedido)}" selected>Pedido actual (fuera de la lista)</option>`);
 const conPedido=!!f.elements.pedido.value;
 mostrar('pedido',['cobro','gasto','reembolso'].includes(tipo));mostrar('ruta',tipo==='transferencia');mostrar('para',tipo==='transferencia');
 partidas(f,tipo==='gasto'&&conPedido?f.elements.pedido.value:null);mostrar('persona',tipo!=='transferencia');
 mostrar('categoria',(tipo==='gasto'&&!conPedido)||tipo==='ingreso');mostrar('grupo',tipo==='gasto'&&conPedido);mostrar('iva',tipo==='gasto');mostrar('comprobante',tipo==='gasto');
 const quien=tipo==='reembolso'||tipo==='reparto'?[['juan_pablo','Juan Pablo'],['garcia','García']]:Object.entries(personas);
 const actual=cambio==='tipo'?'':f.elements.persona.value,omision=quien.some(([k])=>k==='zain')?'zain':quien[0][0];f.elements.persona.innerHTML=opciones(quien,quien.some(([k])=>k===actual)?actual:omision);
 f.querySelector('[data-persona-label]').textContent=tipo==='gasto'?'¿Quién pagó?':tipo==='reembolso'||tipo==='reparto'?'¿Para quién?':'¿Quién lo recibió?';
 const cats=categorias[tipo==='ingreso'?'ingreso':'gasto']||[],cat=f.elements.categoria.value;f.elements.categoria.innerHTML=cats.map(c=>`<option${c===cat?' selected':''}>${esc(c)}</option>`).join('');
 if(!f.querySelector('[name=grupo]:checked'))f.querySelector('[name=grupo][value=base]').checked=true;
 f.querySelector('[data-concepto-label]').textContent=tipo==='cobro'?'Referencia (opcional)':'Concepto';
 f.elements.concepto.placeholder={cobro:'Transferencia del anticipo',gasto:'Playeras Player y Tees',ingreso:'Venta de mostrador',reembolso:'Reembolso del material',transferencia:'Depósito del cobro que recibí',reparto:'Reparto de utilidades de octubre'}[tipo];
 f.elements.fecha.max=hoy();if(!f.elements.fecha.value)f.elements.fecha.value=hoy();
 const sel=pedidos.find(p=>p.id===f.elements.pedido.value),saldo=f.querySelector('[data-saldo-pedido]');
 saldo.textContent=sel?(sel.publicada?'Total '+pesos(Number(sel.total))+' · cobrado '+pesos(Number(sel.cobrado))+' · falta '+pesos(Math.max(0,Number(sel.total)-Number(sel.cobrado))):'Este pedido no tiene cotización publicada: publícala antes de registrar el cobro.'):'';
 const sugerido=tipo==='reparto'&&datos?Number(datos.utilidad.por_repartir[f.elements.persona.value]):0;
 if(reiniciar!==true&&tipo==='reparto'&&sugerido>0&&!f.elements.importe.dataset.tocado)f.elements.importe.value=(sugerido/100).toFixed(2);
 if(tipo==='cobro'&&sel?.publicada&&!f.elements.importe.dataset.tocado&&!editando)f.elements.importe.value=(Math.max(0,Number(sel.total)-Number(sel.cobrado))/100).toFixed(2);
 f.querySelector('[data-ayuda]').textContent={cobro:'Se suma al saldo del pedido y a lo que el cliente ve en su enlace. Si el cliente no aceptó en su enlace, queda aceptada por el equipo.',gasto:conPedido?'Cuenta como costo real del pedido.':'Gasto general del negocio (publicidad, software, flete…).',ingreso:'Dinero que entra sin ser cobro de un pedido.',reembolso:'Devolución a un socio de lo que pagó de su bolsa.',transferencia:'Mover dinero entre cajas (Caja ZAIN, Oficina JP, Oficina García), o entre un socio y una caja.',reparto:'Sale de la Caja ZAIN y cuenta como utilidad repartida. Pendiente para esta persona: '+pesos(Math.max(0,sugerido))+'.'}[tipo];
}
function abrir(tipo,m=null){
 const f=$('#cajaForm');f.hidden=false;f.reset();delete f.elements.importe.dataset.tocado;delete f.elements.partida.dataset.tocado;editando=m;porBorrar=null;
 // Un registro nuevo empieza sin folio ni persona heredados del anterior.
 f.elements.pedido.innerHTML='';f.elements.persona.innerHTML='';f.elements.categoria.innerHTML='';
 const borrar=f.querySelector('[data-borrar-form]');delete borrar.dataset.seguro;borrar.textContent='Borrar este movimiento';borrar.hidden=!m;
 f.querySelector(`[name=tipo][value="${m?claseDe(m):tipo}"]`).checked=true;
 if(m){
  f.elements.pedido.innerHTML=`<option value="${esc(m.pedido_id||'')}"></option>`;f.elements.pedido.value=m.pedido_id||'';
  f.elements.importe.value=(Number(m.importe)/100).toFixed(2);f.elements.importe.dataset.tocado='1';f.elements.fecha.value=m.fecha;
  f.elements.concepto.value=m.origen==='pago'&&m.concepto==='Pago del cliente'?'':m.concepto;f.elements.iva.value=(Number(m.iva_recuperable||0)/100).toFixed(2);
  f.elements.persona.innerHTML=`<option value="${esc(m.persona)}"></option>`;f.elements.persona.value=m.persona;
  if(m.categoria)f.elements.categoria.innerHTML=`<option>${esc(m.categoria)}</option>`;
  if(m.grupo)f.querySelector(`[name=grupo][value="${m.grupo}"]`).checked=true;
  if(m.origen==='caja'&&m.tipo==='transferencia'){f.elements.de.value=m.origen_persona;f.elements.para.value=m.destino;}
 }
 f.querySelector('[data-comprobante-actual]').textContent=m?.comprobante?'Ya tiene comprobante; sube otro solo si quieres reemplazarlo.':'JPG, PNG, WEBP o PDF · hasta 4 MB';
 formulario(true);
 $('#cajaFormTitulo').textContent=m?'Editar movimiento':'Registrar movimiento';$('#cajaMensaje').textContent='';
 if(datos)libro();
 f.scrollIntoView({behavior:'smooth',block:'start'});f.elements.importe.focus({preventScroll:true});
}
function cerrar(){$('#cajaForm').hidden=true;editando=null;ultima=null;if(datos)libro();}
async function enviar(cuerpo,aviso){
 ocupado=true;const f=$('#cajaForm');for(const el of f.elements)el.disabled=true;$('#cajaMensaje').textContent='Guardando…';
 try{const r=await api('libro-operar',cuerpo);gastosPedido.clear();datos=r.caja;categorias=r.categorias||categorias;porBorrar=null;cerrar();pintar();$('#cajaEstado').textContent=aviso;avisoHasta=Date.now()+6000;
  // Pedidos, cobro y gastos abiertos se actualizan con los mismos datos.
  for(const ev of ['zain:pago-registrado','zain:gastos-guardados','zain:libro-cambio'])dispatchEvent(new CustomEvent(ev));
 }catch(er){$('#cajaMensaje').textContent=er.message;if(f.hidden)$('#cajaEstado').textContent=er.message;porBorrar=null;if(datos)libro();}
 finally{ocupado=false;for(const el of f.elements)el.disabled=false;}
}
async function verComprobante(b){
 const m=datos.libro.find(x=>x.id===b.dataset.verComprobante);if(!m)return;b.disabled=true;
 try{const r=m.origen==='general'?await api('generales-archivo',{id:m.id}):await api('gastos-archivo',{id:m.pedido_id,movimiento:m.id});const a=document.createElement('a');a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';a.click();}
 catch(er){$('#cajaEstado').textContent=er.message;}finally{b.disabled=false;}
}
async function guardar(e){
 e.preventDefault();if(ocupado)return;const f=e.currentTarget,fd=new FormData(f),tipo=fd.get('tipo');
 try{
  const origen_persona=fd.get('de'),destino_persona=fd.get('para');
  const conPedido=['cobro','gasto','reembolso'].includes(tipo)&&fd.get('pedido');
  if(tipo==='cobro'&&!conPedido)throw Error('Elige el folio del pedido que pagó.');
  const importe=decimal(fd.get('importe'));if(!importe)throw Error('Escribe el importe.');
  const archivo=tipo==='gasto'?fd.get('archivo'):null;if(archivo?.size>4194304)throw Error('El comprobante puede pesar hasta 4 MB.');
  const datosMov={tipo,importe,fecha:fd.get('fecha'),concepto:String(fd.get('concepto')||''),persona:fd.get('persona')||'zain',
   ...(conPedido?{pedido_id:fd.get('pedido')}:{}),...(tipo==='gasto'?{iva_recuperable:decimal(fd.get('iva')||'0'),grupo:fd.get('grupo')||'base'}:{}),
   ...((tipo==='gasto'&&!conPedido)||tipo==='ingreso'?{categoria:fd.get('categoria')}:{}),...(tipo==='transferencia'?{origen_persona,destino_persona}:{})};
  // La partida solo viaja si se ve el selector; al corregir, solo si la cambiaste (si no, la base la conserva).
  const sp=f.elements.partida;if(tipo==='gasto'&&conPedido&&!sp.closest('[data-campo]').hidden&&(!editando||sp.dataset.tocado))datosMov.partida=sp.value===''?null:Number(sp.value);
  const firma=JSON.stringify({datosMov,editando:editando?.id,archivo:archivo?.size?[archivo.name,archivo.size,archivo.lastModified]:null});if(!ultima||ultima.firma!==firma)ultima={firma,request:crypto.randomUUID(),archivo:crypto.randomUUID(),comprobante:null};
  if(archivo?.size&&!ultima.comprobante){
   $('#cajaMensaje').textContent='Subiendo comprobante…';
   const r=conPedido?await window.ZAINEquipo.uploadGasto(datosMov.pedido_id,ultima.archivo,archivo):await window.ZAINEquipo.uploadGeneral(ultima.archivo,archivo);ultima.comprobante=r.comprobante;
  }
  if(ultima.comprobante)datosMov.comprobante=ultima.comprobante;
  if(editando)return enviar({modo:'guardar',origen:editando.origen,id:editando.id,datos:datosMov},'Movimiento corregido.');
  await enviar({modo:'guardar',datos:{...datosMov,request:ultima.request}},'Movimiento registrado.');
 }catch(er){$('#cajaMensaje').textContent=er.message;}
}
function clic(e){
 const b=e.target.closest('button');if(!b||ocupado)return;
 if(b.dataset.nuevo){abrir(b.dataset.nuevo);return;}
 if(b.hasAttribute('data-cancelar')){cerrar();return;}
 if(b.dataset.verComprobante){verComprobante(b);return;}
 if(b.dataset.editar){const m=datos.libro.find(x=>x.id===b.dataset.editar);if(m)abrir(null,m);return;}
 if(b.dataset.borrar){porBorrar=b.dataset.borrar;libro();return;}
 if(b.hasAttribute('data-borrar-no')){porBorrar=null;libro();return;}
 if(b.dataset.borrarSi){const m=datos.libro.find(x=>x.id===b.dataset.borrarSi);if(m)enviar({modo:'borrar',origen:m.origen,id:m.id},'Movimiento borrado. Queda una copia en el historial.');return;}
 if(b.hasAttribute('data-borrar-form')&&editando){if(b.dataset.seguro)enviar({modo:'borrar',origen:editando.origen,id:editando.id},'Movimiento borrado. Queda una copia en el historial.');else{b.dataset.seguro='1';b.textContent='Toca otra vez para borrar';}return;}
 if(b.closest('#cajaFiltro')&&datos){filtro=b.dataset.filtro;visibles=30;libro();return;}
 if(b.hasAttribute('data-mas')){visibles+=30;libro();}
}
