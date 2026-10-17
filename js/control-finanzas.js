import {pesos,decimal} from './cotizacion-core.js?v=11';
import {esc} from './cotizacion-vista.js?v=8';
// Finanzas: dashboard anual y movimientos generales (gastos, ingresos y reembolsos que no son de un pedido).
const $=s=>document.querySelector(s),api=(op,b,q)=>window.ZAINEquipo.call(op,b,q);
const personas={juan_pablo:'Juan Pablo',garcia:'García',zain:'Caja ZAIN'},MESES=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const hoy=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Mexico_City'});
const pct=(u,v)=>!v?'—':(Math.round(u/v*1000)/10).toLocaleString('es-MX')+'%';
let datos=null,anio=Number(hoy().slice(0,4)),epoca=0,ocupado=false,ultima=null,filtro='';
const nav=$('.control__secciones');
nav.querySelector('#verPedidos').insertAdjacentHTML('afterend','<button type="button" id="verFinanzas" aria-pressed="false">Finanzas</button>');
$('#trabajo').insertAdjacentHTML('beforeend',`<section id="seccionFinanzas" hidden><div class="control__titulo"><div><h1>Finanzas</h1><p>Cómo va ZAIN: ventas, costos, gastos generales y utilidad.</p></div><label class="fin-anio"><span class="sr-only">Año</span><select id="finAnio"></select></label></div><p id="finEstado" class="control__estado" role="status"></p><div id="finTablero"></div>
<details class="fin-registrar cot-panel" id="finRegistrar"><summary>+ Registrar gasto o ingreso general</summary><p class="cot-ayuda">Para lo que no es de un pedido: publicidad, software, flete, muestras, comisiones, una venta de mostrador o dinero que metieron al negocio. Los gastos de un pedido se registran dentro del pedido, en su pestaña Gastos.</p>
<form id="finForm" class="fin-form"><fieldset class="fin-tipo"><legend class="sr-only">Tipo</legend>${[['gasto','Gasto'],['ingreso','Ingreso'],['reembolso','Reembolso']].map(([v,t],i)=>`<label class="cot-chip"><input type="radio" name="tipo" value="${v}" ${i?'':'checked'}><span>${t}</span></label>`).join('')}</fieldset>
<label class="fin-ancho">Concepto<input name="concepto" maxlength="180" required placeholder="Anuncios de Instagram de octubre"></label>
<label>Importe (MXN)<input name="importe" type="number" inputmode="decimal" min="0.01" step="0.01" required></label>
<label>Fecha<input name="fecha" type="date" required></label>
<label>Categoría<select name="categoria" required></select></label>
<label><span data-persona-label>Quién pagó</span><select name="persona" required></select></label>
<details class="fin-ancho" data-solo-gasto><summary>Impuesto recuperable y comprobante</summary><div class="fin-form"><label>IVA recuperable (MXN)<input name="iva" type="number" inputmode="decimal" min="0" step="0.01" value="0.00"></label><label class="fin-ancho">Comprobante opcional<input name="archivo" type="file" accept="image/jpeg,image/png,image/webp,application/pdf"><small>JPG, PNG, WEBP o PDF · hasta 4 MB</small></label></div></details>
<label class="cot-check fin-ancho" data-solo-reembolso hidden><input type="checkbox" name="verificado">Ya entregamos o transferimos este reembolso</label>
<button class="btn btn--azul fin-ancho">Guardar movimiento</button><p id="finMensaje" class="fin-ancho" role="status"></p></form></details>
<section class="cot-panel fin-movs"><div class="fin-movscab"><h2>Movimientos generales</h2><div class="bandeja-chips" id="finFiltro">${[['','Todos'],['gasto','Gastos'],['ingreso','Ingresos'],['reembolso','Reembolsos']].map(([v,t])=>`<button type="button" data-filtro="${v}">${t}</button>`).join('')}</div></div><div id="finLista"></div></section></section>`);
for(let a=anio;a>=2026;a--)$('#finAnio').insertAdjacentHTML('beforeend',`<option value="${a}">${a}</option>`);
const mensaje=t=>{const m=$('#finMensaje');if(m)m.textContent=t;};
function tablero(){
 const d=datos.dashboard,M=d.meses||[],sum=k=>M.reduce((n,m)=>n+Number(m[k]||0),0);
 const ventas=sum('ventas'),costo=sum('costo_pedidos'),gastos=sum('gastos_generales'),ingresos=sum('ingresos'),utilPed=sum('utilidad_pedidos'),neta=utilPed+ingresos-gastos,sinCosto=sum('pedidos_sin_costo'),cotizado=sum('cotizado'),aport=sum('aportaciones');
 const netaMes=M.map(m=>Number(m.utilidad_pedidos)+Number(m.ingresos)-Number(m.gastos_generales)),max=Math.max(1,...netaMes.map(Math.abs));
 const cats=d.categorias||[],maxCat=Math.max(1,...cats.map(c=>c.total)),P=d.personas||{};
 const mitad=Math.round(neta/2);
 $('#finTablero').innerHTML=`<div class="fin-kpis"><div><small>Ventas sin IVA</small><strong>${esc(pesos(ventas))}</strong><span>${sum('pedidos')} ${sum('pedidos')===1?'pedido aceptado':'pedidos aceptados'}</span></div><div><small>Costo de pedidos</small><strong>${esc(pesos(costo))}</strong><span>Material y gastos de cada pedido</span></div><div><small>Gastos generales</small><strong>${esc(pesos(gastos))}</strong><span>${ingresos?'Ingresos extra '+esc(pesos(ingresos)):'Marketing, software, flete…'}</span></div><div class="fin-kpi-neta ${neta<0?'fin-negativa':''}"><small>Utilidad neta</small><strong>${esc(pesos(neta))}</strong><span>Margen neto ${pct(neta,ventas+ingresos)}</span></div></div>
 ${sinCosto?`<p class="cot-alerta">${sinCosto} ${sinCosto===1?'pedido aceptado no tiene':'pedidos aceptados no tienen'} costos capturados: su utilidad no se cuenta todavía. Regístralos en la pestaña Gastos de cada pedido.</p>`:''}
 <div class="fin-grid"><section class="cot-panel"><h2>Utilidad neta por mes</h2><p class="cot-ayuda">Utilidad de pedidos + ingresos extra − gastos generales. Pedidos por mes de solicitud.</p><div class="fin-barras" role="img" aria-label="Utilidad neta por mes de ${anio}">${netaMes.map((v,i)=>`<div class="fin-barra" title="${MESES[i]}: ${esc(pesos(v))}"><div class="fin-barra__area"><i class="${v<0?'neg':v===0?'cero':''}" style="height:${Math.round(Math.abs(v)/max*100)}%"></i></div><small>${MESES[i]}</small></div>`).join('')}</div>
 <details class="fin-tabla"><summary>Ver tabla por mes</summary><div class="cot-tablewrap"><table><thead><tr><th>Mes</th><th>Ventas</th><th>Costo pedidos</th><th>Gastos gen.</th><th>Ingresos</th><th>Utilidad neta</th></tr></thead><tbody>${M.map((m,i)=>`<tr><th>${MESES[i]}</th><td>${esc(pesos(Number(m.ventas)))}</td><td>${esc(pesos(Number(m.costo_pedidos)))}</td><td>${esc(pesos(Number(m.gastos_generales)))}</td><td>${esc(pesos(Number(m.ingresos)))}</td><td><b class="${netaMes[i]<0?'gastos-negativo':''}">${esc(pesos(netaMes[i]))}</b></td></tr>`).join('')}</tbody></table></div></details></section>
 <section class="cot-panel"><h2>Gastos generales por categoría</h2>${cats.length?`<ul class="fin-cats">${cats.map(c=>`<li><div><span>${esc(c.categoria)}</span><b>${esc(pesos(c.total))}</b></div><i style="width:${Math.max(2,Math.round(c.total/maxCat*100))}%"></i></li>`).join('')}</ul>`:'<p class="cot-ayuda">Todavía no hay gastos generales este año.</p>'}</section>
 <section class="cot-panel"><h2>Reparto y cuentas</h2><div class="fin-reparto"><div><small>Juan Pablo · 50%</small><strong class="${mitad<0?'gastos-negativo':''}">${esc(pesos(mitad))}</strong></div><div><small>García · 50%</small><strong class="${neta-mitad<0?'gastos-negativo':''}">${esc(pesos(neta-mitad))}</strong></div></div><p class="cot-ayuda">De la utilidad neta del año. Es informativo: no hace transferencias.</p>
 <h3>Por devolver a cada quien</h3><div class="fin-reparto">${['juan_pablo','garcia'].map(p=>`<div><small>${personas[p]}</small><strong class="${(P[p]?.total||0)<0?'gastos-negativo':''}">${esc(pesos(P[p]?.total||0))}</strong><span>Pedidos ${esc(pesos(P[p]?.pedidos||0))} · Generales ${esc(pesos(P[p]?.generales||0))}</span></div>`).join('')}</div><p class="cot-ayuda">Lo que adelantaron de su bolsa, menos reembolsos e ingresos del negocio que recibieron. Un saldo negativo significa que esa persona tiene dinero del negocio.</p>
 ${cotizado||aport?`<p class="cot-ayuda">${cotizado?'Cotizado sin aceptar: '+esc(pesos(cotizado))+'. ':''}${aport?'Aportaciones de capital: '+esc(pesos(aport))+' (no cuentan como utilidad).':''}</p>`:''}</section></div>`;
}
function lista(){
 const movs=datos.movimientos.filter(m=>!filtro||m.tipo===filtro);
 for(const b of $('#finFiltro').children){const on=b.dataset.filtro===filtro;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));}
 $('#finLista').innerHTML=movs.length?movs.map(m=>`<article class="fin-mov ${m.anulado_at?'gastos-anulado':''}"><div><b>${esc(m.concepto)}</b><strong class="fin-${m.tipo}">${m.tipo==='gasto'?'−':m.tipo==='ingreso'?'+':''}${esc(pesos(m.importe))}</strong></div><p>${esc(m.fecha)} · ${esc(m.categoria)} · ${m.tipo==='ingreso'?'Recibió':m.tipo==='reembolso'?'Para':'Pagó'} ${esc(personas[m.persona])}${m.iva_recuperable?' · IVA recuperable '+esc(pesos(m.iva_recuperable)):''}${m.anulado_at?' · Anulado: '+esc(m.motivo):''}</p><div class="gastos-acciones">${m.comprobante?`<button type="button" class="btn-texto" data-comprobante="${esc(m.id)}">Ver comprobante</button>`:''}${m.anulado_at?'':`<details><summary>Corregir</summary><form data-anular="${esc(m.id)}" class="fin-anular"><label>Motivo<input name="motivo" minlength="5" maxlength="500" required placeholder="Se capturó dos veces"></label><button class="btn btn--linea">Anular registro</button></form></details>`}</div></article>`).join(''):`<p class="cot-ayuda">${filtro?'No hay movimientos de este tipo en '+anio+'.':'Todavía no hay movimientos generales en '+anio+'.'}</p>`;
}
function formulario(){
 const f=$('#finForm'),tipo=f.elements.tipo.value,c=datos?.categorias||{gasto:[],ingreso:[],reembolso:[]};
 const actual=f.elements.categoria.value;f.elements.categoria.innerHTML=c[tipo].map(x=>`<option${x===actual?' selected':''}>${esc(x)}</option>`).join('');
 const p=f.elements.persona.value;f.elements.persona.innerHTML='<option value="" disabled '+(p?'':'selected')+'>Elige</option>'+Object.entries(personas).filter(([k])=>tipo!=='reembolso'||k!=='zain').map(([k,v])=>`<option value="${k}" ${k===p?'selected':''}>${v}</option>`).join('');
 f.querySelector('[data-persona-label]').textContent=tipo==='ingreso'?'Quién lo recibió':tipo==='reembolso'?'Para quién':'Quién pagó';
 f.querySelector('[data-solo-gasto]').hidden=tipo!=='gasto';f.querySelector('[data-solo-reembolso]').hidden=tipo!=='reembolso';f.elements.verificado.required=tipo==='reembolso';
 if(!f.elements.fecha.value){f.elements.fecha.value=hoy();}f.elements.fecha.max=hoy();
}
async function cargar(){const turn=++epoca;$('#finEstado').textContent='Consultando finanzas…';try{const d=await api('generales',null,{anio:String(anio)});if(turn!==epoca)return;datos=d;tablero();lista();formulario();$('#finEstado').textContent='';}catch(e){if(turn===epoca)$('#finEstado').textContent=e.message;}}
nav.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const on=b.id==='verFinanzas';$('#seccionFinanzas').hidden=!on;$('#verFinanzas').classList.toggle('on',on);$('#verFinanzas').setAttribute('aria-pressed',String(on));
 if(on){for(const id of ['seccionPedidos','seccionCatalogo','seccionTalleres','seccionCotizador'])if($('#'+id))$('#'+id).hidden=true;for(const x of nav.querySelectorAll('button'))if(x.id!=='verFinanzas'){x.classList.remove('on');x.setAttribute('aria-pressed','false');}history.replaceState(null,'','#finanzas');cargar();}});
$('#finAnio').addEventListener('change',e=>{anio=Number(e.target.value);cargar();});
$('#finFiltro').addEventListener('click',e=>{const b=e.target.closest('[data-filtro]');if(!b||!datos)return;filtro=b.dataset.filtro;lista();});
$('#finForm').addEventListener('change',e=>{if(e.target.name==='tipo')formulario();});
$('#finForm').addEventListener('submit',async e=>{
 e.preventDefault();if(ocupado)return;const f=e.currentTarget,fd=new FormData(f);
 try{
  const tipo=fd.get('tipo'),file=tipo==='gasto'?fd.get('archivo'):null;if(file?.size>4194304)throw Error('El comprobante puede pesar hasta 4 MB.');
  const datosMov={tipo,categoria:fd.get('categoria'),persona:fd.get('persona'),concepto:String(fd.get('concepto')||''),importe:decimal(fd.get('importe')),iva_recuperable:tipo==='gasto'?decimal(fd.get('iva')||'0'):0,fecha:fd.get('fecha'),...(tipo==='reembolso'?{verificado:fd.has('verificado')}:{})};
  const firma=JSON.stringify({datosMov,file:file?.size?[file.name,file.size,file.lastModified]:null});if(!ultima||ultima.firma!==firma)ultima={firma,request:crypto.randomUUID(),archivo:crypto.randomUUID(),comprobante:null};
  ocupado=true;for(const el of f.elements)el.disabled=true;mensaje('Guardando…');
  if(file?.size&&!ultima.comprobante){const r=await subir(ultima.archivo,file);ultima.comprobante=r.comprobante;}
  const d=await api('generales-guardar',{...datosMov,request:ultima.request,...(ultima.comprobante?{comprobante:ultima.comprobante}:{})});
  ultima=null;if(d.anio===anio){datos=d;tablero();lista();}f.reset();formulario();mensaje('Guardado.');
 }catch(er){mensaje(er.message);}finally{ocupado=false;for(const el of f.elements)el.disabled=false;}
});
async function subir(archivo,blob){
 // Misma sesión y renovación que el resto de Gestión, con cuerpo binario.
 return window.ZAINEquipo.uploadGeneral(archivo,blob);
}
$('#finLista').addEventListener('submit',async e=>{const f=e.target.closest('[data-anular]');if(!f)return;e.preventDefault();const b=f.querySelector('button');b.disabled=true;try{const d=await api('generales-anular',{id:f.dataset.anular,motivo:new FormData(f).get('motivo')});if(d.anio===anio){datos=d;tablero();lista();}}catch(er){alertaLista(er.message);}finally{b.disabled=false;}});
$('#finLista').addEventListener('click',async e=>{const b=e.target.closest('[data-comprobante]');if(!b)return;b.disabled=true;try{const r=await api('generales-archivo',{id:b.dataset.comprobante});const a=document.createElement('a');a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';a.click();}catch(er){alertaLista(er.message);}finally{b.disabled=false;}});
const alertaLista=t=>{$('#finEstado').textContent=t;};
addEventListener('zain:equipo-listo',()=>{if(location.hash==='#finanzas')$('#verFinanzas').click();});
addEventListener('zain:equipo-salio',()=>{epoca++;datos=null;$('#seccionFinanzas').hidden=true;$('#finTablero').replaceChildren();$('#finLista').replaceChildren();});
