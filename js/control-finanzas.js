import {pesos} from './cotizacion-core.js?v=17';
import {esc} from './cotizacion-vista.js?v=12';
import {montarCaja,cargarCaja,limpiarCaja} from './control-caja.js?v=4';
// Finanzas: caja y libro de movimientos (control-caja.js) y tablero anual de ventas, costos y utilidad.
const $=s=>document.querySelector(s),api=(op,b,q)=>window.ZAINEquipo.call(op,b,q);
const personas={juan_pablo:'Juan Pablo',garcia:'García',zain:'Caja ZAIN'},MESES=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const hoy=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Mexico_City'});
const pct=(u,v)=>!v?'—':(Math.round(u/v*1000)/10).toLocaleString('es-MX')+'%';
let datos=null,anio=Number(hoy().slice(0,4)),epoca=0;
const nav=$('.control__secciones');
nav.querySelector('#verPedidos').insertAdjacentHTML('afterend','<button type="button" id="verFinanzas" aria-pressed="false">Finanzas</button>');
$('#trabajo').insertAdjacentHTML('beforeend',`<section id="seccionFinanzas" hidden><div class="control__titulo"><div><h1>Finanzas</h1><p>Cómo va ZAIN: caja, ventas, costos, gastos generales y utilidad.</p></div><label class="fin-anio"><span class="sr-only">Año</span><select id="finAnio"></select></label></div><p id="finEstado" class="control__estado" role="status"></p><div id="finTablero"></div></section>`);
montarCaja();
for(let a=anio;a>=2026;a--)$('#finAnio').insertAdjacentHTML('beforeend',`<option value="${a}">${a}</option>`);
const mensaje=t=>{const m=$('#finMensaje');if(m)m.textContent=t;};
// Escala "redonda" para el eje: 0 y tres marcas con valores fáciles de leer.
function escala(min,max){
 const rango=Math.max(max,-min,1),paso0=rango/3,mag=10**Math.floor(Math.log10(paso0)),paso=[1,2,2.5,5,10].map(k=>k*mag).find(p=>p>=paso0);
 const top=Math.ceil(Math.max(max,0)/paso)*paso,bottom=-Math.ceil(Math.max(-min,0)/paso)*paso,ticks=[];for(let v=bottom;v<=top+1e-9;v+=paso)ticks.push(Math.round(v));
 return {top:top||paso,bottom,ticks:ticks.length>1?ticks:[0,paso]};
}
const corto=n=>{const a=Math.abs(n)/100,s=n<0?'−$':'$';return a>=1e6?s+(a/1e6).toLocaleString('es-MX',{maximumFractionDigits:1})+' M':a>=1e3?s+(a/1e3).toLocaleString('es-MX',{maximumFractionDigits:1})+' k':s+Math.round(a).toLocaleString('es-MX');};
let mesSel=0;
function tablero(){
 const d=datos.dashboard;
 if(d.version_ventas!==1){$('#finTablero').innerHTML='<p class="cot-alerta">Falta aplicar la actualización de ventas reales en el servidor. Las cifras se mostrarán cuando esté lista.</p>';return;}
 const M=(d.meses||[]).map(m=>Object.fromEntries(Object.entries(m).map(([k,v])=>[k,Number(v)||0])));
 const neta=m=>m.utilidad_pedidos+m.ingresos-m.gastos_generales;
 const sel=mesSel?[M[mesSel-1]]:M,sum=k=>sel.reduce((n,m)=>n+m[k],0);
 const vendido=sum('vendido'),negociacion=sum('en_negociacion'),negociacionN=sum('negociacion_pedidos'),sinImporte=sum('negociacion_sin_importe'),modelos=sum('cotizaciones_modelos'),sinAnticipo=sum('sin_anticipo');
 const saldos=(d.por_cobrar_pedidos||[]).filter(p=>!mesSel||p.mes===mesSel);
 const ventas=sum('ventas'),costo=sum('costo_pedidos'),gastos=sum('gastos_generales'),ingresos=sum('ingresos'),utilNeta=sel.reduce((n,m)=>n+neta(m),0),pedidosN=sum('pedidos'),sinCosto=sum('pedidos_sin_costo'),aport=sum('aportaciones'),porCobrar=sum('por_cobrar'),entregados=sum('entregados');
 const previo=mesSel>1?M[mesSel-2]:null,delta=(a,b)=>!b?'':'<em class="'+(a>=b?'sube':'baja')+'">'+(a>=b?'▲ ':'▼ ')+Math.abs(Math.round((a-b)/Math.abs(b)*100))+'% vs '+MESES[mesSel-2]+'</em>';
 const valores=M.map(neta),esc0=escala(Math.min(0,...valores),Math.max(0,...valores)),alto=v=>(v/(esc0.top-esc0.bottom))*100,cero=alto(esc0.top);
 const cats=d.categorias||[],maxCat=Math.max(1,...cats.map(c=>c.total)),P=d.personas||{},mitad=Math.round(utilNeta/2);
 const periodo=mesSel?MESES[mesSel-1]+' '+anio:'Año '+anio;
 $('#finTablero').innerHTML=`<div class="fin-periodo bandeja-chips" role="group" aria-label="Periodo"><button type="button" data-mes="0" class="${mesSel?'':'on'}">Todo ${anio}</button>${MESES.map((m,i)=>`<button type="button" data-mes="${i+1}" class="${mesSel===i+1?'on':''}">${m}</button>`).join('')}</div>
 <div class="fin-kpis fin-principales" aria-label="Ventas reales y negociación"><div><small>VENDIDO · con IVA</small><strong>${esc(pesos(vendido))}</strong><span>${pedidosN} pedidos con anticipo cubierto</span></div>
 <div><small>POR COBRAR · con IVA</small><strong class="${porCobrar?'fin-pendiente':''}">${esc(pesos(porCobrar))}</strong><span>Vendido menos pagos verificados</span></div>
 <div><small>EN NEGOCIACIÓN · con IVA</small><strong>${esc(pesos(negociacion))}</strong><span>${negociacionN} solicitudes${sinImporte?' · '+sinImporte+' sin total definido':''} · ${modelos} cotizaciones por modelo sin cantidades</span><span>Fuera de ventas; precios por pieza sin sumar</span></div></div>
 <details class="cot-panel fin-cobranza"><summary>Por cobrar por pedido · ${saldos.length}</summary>${saldos.length?`<div class="cot-tablewrap"><table><thead><tr><th>Pedido</th><th>Vendido con IVA</th><th>Cobrado</th><th>Por cobrar</th></tr></thead><tbody>${saldos.map(p=>`<tr><th>${esc(p.folio)}</th><td data-label="Vendido con IVA">${esc(pesos(p.venta_total))}</td><td data-label="Cobrado">${esc(pesos(p.cobrado))}</td><td data-label="Por cobrar">${esc(pesos(p.saldo))}</td></tr>`).join('')}</tbody></table></div>`:'<p class="cot-ayuda">Sin saldos pendientes en el periodo.</p>'}</details>
 ${sinAnticipo?`<p class="cot-alerta">${sinAnticipo} pedidos en estado confirmado, producción o entregado sin anticipo demostrable: fuera de ventas. Revisa sus pagos y términos de anticipo.</p>`:''}
 <div class="fin-kpis"><div><small>Venta sin IVA · ${esc(periodo)}</small><strong>${esc(pesos(ventas))}</strong><span>${pedidosN} ${pedidosN===1?'pedido vendido':'pedidos vendidos'}${pedidosN?' · ticket '+esc(pesos(Math.round(ventas/pedidosN))):''}</span>${previo?delta(ventas,previo.ventas):''}</div>
 <div><small>Costo de pedidos</small><strong>${esc(pesos(costo))}</strong><span>Material y gastos de cada pedido</span></div>
 <div><small>Gastos generales</small><strong>${esc(pesos(gastos))}</strong><span>${ingresos?'Ingresos extra '+esc(pesos(ingresos)):'Marketing, software, flete…'}</span></div>
 <div class="fin-kpi-neta ${utilNeta<0?'fin-negativa':''}"><small>Utilidad neta</small><strong>${esc(pesos(utilNeta))}</strong><span>Margen neto ${pct(utilNeta,ventas+ingresos)}</span>${previo?delta(utilNeta,neta(previo)):''}</div>
 <div><small>Pedidos entregados</small><strong>${entregados}</strong><span>${'de '+pedidosN+' vendidos'}</span></div></div>
 ${sinCosto?`<p class="cot-alerta">${sinCosto} ${sinCosto===1?'pedido vendido no tiene':'pedidos vendidos no tienen'} costos capturados: su utilidad no se cuenta todavía. Regístralos en la pestaña Gastos de cada pedido.</p>`:''}
 <div class="fin-grid"><section class="cot-panel fin-grafica"><h2>Utilidad neta por mes · ${anio}</h2><p class="cot-ayuda">Pasa el cursor o toca una barra para ver el detalle. Utilidad de pedidos + ingresos extra − gastos generales.</p>
 <div class="fin-chart"><div class="fin-eje" aria-hidden="true">${esc0.ticks.slice().reverse().map(t=>`<span style="top:${alto(esc0.top-t)}%">${corto(t)}</span>`).join('')}</div>
 <div class="fin-plot">${esc0.ticks.map(t=>`<i class="fin-linea ${t===0?'fin-linea--cero':''}" style="top:${alto(esc0.top-t)}%"></i>`).join('')}
 ${M.map((m,i)=>{const v=valores[i],h=Math.abs(alto(v));return `<button type="button" class="fin-col ${mesSel===i+1?'sel':''}" data-mes="${i+1}" aria-label="${MESES[i]}: utilidad neta ${esc(pesos(v))}"><i class="fin-bar ${v<0?'neg':v===0?'cero':''}" style="${v>=0?`bottom:${100-cero}%;height:${h}%`:`top:${cero}%;height:${h}%`}"></i><span class="fin-tip" role="tooltip"><b>${MESES[i]} ${anio}</b><span>Ventas <em>${esc(pesos(m.ventas))}</em></span><span>Costo pedidos <em>${esc(pesos(m.costo_pedidos))}</em></span><span>Gastos generales <em>${esc(pesos(m.gastos_generales))}</em></span>${m.ingresos?`<span>Ingresos extra <em>${esc(pesos(m.ingresos))}</em></span>`:''}<span class="fin-tip-total">Utilidad neta <em>${esc(pesos(v))}</em></span><small>${m.pedidos} ${m.pedidos===1?'pedido':'pedidos'}${m.pedidos_sin_costo?' · '+m.pedidos_sin_costo+' sin costos':''}${m.por_cobrar?' · por cobrar '+esc(pesos(m.por_cobrar)):''}</small></span></button>`;}).join('')}</div>
 <div class="fin-meses" aria-hidden="true">${MESES.map(m=>`<span>${m}</span>`).join('')}</div></div>
 <details class="fin-tabla"><summary>Ver tabla por mes</summary><div class="cot-tablewrap"><table><thead><tr><th>Mes</th><th>Ventas</th><th>Costo pedidos</th><th>Gastos gen.</th><th>Ingresos</th><th>Utilidad neta</th><th>Por cobrar</th></tr></thead><tbody>${M.map((m,i)=>`<tr><th>${MESES[i]}</th><td>${esc(pesos(m.ventas))}</td><td>${esc(pesos(m.costo_pedidos))}</td><td>${esc(pesos(m.gastos_generales))}</td><td>${esc(pesos(m.ingresos))}</td><td><b class="${valores[i]<0?'gastos-negativo':''}">${esc(pesos(valores[i]))}</b></td><td>${esc(pesos(m.por_cobrar))}</td></tr>`).join('')}</tbody></table></div></details></section>
 <section class="cot-panel"><h2>Gastos generales por categoría · ${anio}</h2>${cats.length?`<ul class="fin-cats">${cats.map(c=>`<li title="${esc(c.categoria)}: ${esc(pesos(c.total))} (${pct(c.total,cats.reduce((n,x)=>n+x.total,0))})"><div><span>${esc(c.categoria)}</span><b>${esc(pesos(c.total))} <small>${pct(c.total,cats.reduce((n,x)=>n+x.total,0))}</small></b></div><i style="width:${Math.max(2,Math.round(c.total/maxCat*100))}%"></i></li>`).join('')}</ul>`:'<p class="cot-ayuda">Todavía no hay gastos generales este año.</p>'}</section>
 <section class="cot-panel"><h2>Reparto y cuentas · ${esc(periodo)}</h2><div class="fin-reparto"><div><small>Juan Pablo · 50%</small><strong class="${mitad<0?'gastos-negativo':''}">${esc(pesos(mitad))}</strong></div><div><small>García · 50%</small><strong class="${utilNeta-mitad<0?'gastos-negativo':''}">${esc(pesos(utilNeta-mitad))}</strong></div></div><p class="cot-ayuda">De la utilidad neta del periodo. Es informativo: no hace transferencias.</p>
 <h3>Por devolver a cada quien (saldo actual)</h3><div class="fin-reparto">${['juan_pablo','garcia'].map(p=>`<div><small>${personas[p]}</small><strong class="${(P[p]?.total||0)<0?'gastos-negativo':''}">${esc(pesos(P[p]?.total||0))}</strong><span>Pedidos ${esc(pesos(P[p]?.pedidos||0))} · Generales ${esc(pesos(P[p]?.generales||0))}</span></div>`).join('')}</div><p class="cot-ayuda">Lo que adelantaron de su bolsa, menos reembolsos e ingresos del negocio que recibieron. Negativo: esa persona tiene dinero del negocio.</p>
 ${aport?`<p class="cot-ayuda">Aportaciones de capital en el periodo: ${esc(pesos(aport))} (no cuentan como utilidad).</p>`:''}</section></div>`;
}
async function cargar(){void cargarCaja();const turn=++epoca;$('#finEstado').textContent='Consultando finanzas…';try{const d=await api('generales',null,{anio:String(anio)});if(turn!==epoca)return;datos=d;tablero();$('#finEstado').textContent='';}catch(e){if(turn===epoca)$('#finEstado').textContent=e.message;}}
nav.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const on=b.id==='verFinanzas';$('#seccionFinanzas').hidden=!on;$('#verFinanzas').classList.toggle('on',on);$('#verFinanzas').setAttribute('aria-pressed',String(on));
 if(on){for(const id of ['seccionPedidos','seccionCatalogo','seccionTalleres','seccionCotizador'])if($('#'+id))$('#'+id).hidden=true;for(const x of nav.querySelectorAll('button'))if(x.id!=='verFinanzas'){x.classList.remove('on');x.setAttribute('aria-pressed','false');}history.replaceState(null,'','#finanzas');cargar();}});
$('#finAnio').addEventListener('change',e=>{anio=Number(e.target.value);mesSel=0;cargar();});
$('#finTablero').addEventListener('click',e=>{const b=e.target.closest('.fin-periodo [data-mes]');if(!b||!datos)return;mesSel=Number(b.dataset.mes);tablero();});
addEventListener('zain:equipo-listo',()=>{if(location.hash==='#finanzas')$('#verFinanzas').click();});
// Un cambio en el libro de la caja también mueve el tablero.
addEventListener('zain:libro-cambio',()=>{if(!$('#seccionFinanzas').hidden){const turn=++epoca;api('generales',null,{anio:String(anio)}).then(d=>{if(turn===epoca){datos=d;tablero();}}).catch(()=>{});}});
addEventListener('zain:equipo-salio',()=>{epoca++;datos=null;limpiarCaja();$('#seccionFinanzas').hidden=true;$('#finTablero').replaceChildren();});
