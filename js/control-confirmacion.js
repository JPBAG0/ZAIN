import {pesos,decimal} from './cotizacion-core.js?v=17';
import {esc} from './cotizacion-vista.js?v=12';
let epoca=0;
const valor=n=>(n/100).toFixed(2);
const fechaMX=x=>new Date(x).toLocaleString('es-MX',{timeZone:'America/Mexico_City',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});
function cifras(s){return '<div class="cobro-cifras"><div><small>Total cotizado</small><strong>'+pesos(s.total)+'</strong></div><div><small>'+(s.anticipo_aceptado!=null?'Anticipo aceptado':'Anticipo acordado')+'</small><strong>'+pesos(s.anticipo)+'</strong>'+(s.anticipo_aceptado!=null&&s.anticipo_pactado!=null?'<small>Pactado '+pesos(s.anticipo_pactado)+'</small>':'')+'</div><div><small>Recibido</small><strong>'+pesos(s.recibido)+'</strong></div><div class="'+(s.saldo>0?'cobro-saldo':'cobro-saldo cobro-saldo--cero')+'"><small>Saldo</small><strong>'+pesos(s.saldo)+'</strong></div></div>';}
function aceptacionHTML(s){
 return '<div class="cobro-paso"><h3>1 · Aceptación del cliente</h3><p class="cot-ayuda">El cliente puede aceptar desde su enlace de Mi pedido. Si ya te confirmó por WhatsApp, en persona o ya pagó, regístralo aquí.</p><div class="cot-acciones"><button type="button" class="btn btn--linea" id="cobroCopiarEnlace">Copiar enlace del cliente</button></div><p class="cot-ayuda" id="cobroEnlaceEstado" role="status"></p><form id="aceptarEquipo" class="cobro-form"><label class="cot-check"><input type="checkbox" name="confirmo" required>El cliente aceptó la cotización de '+pesos(s.total)+' (revisión '+esc(s.revision)+')</label><button class="btn btn--azul">Registrar aceptación</button><p role="status" class="cot-ayuda" data-mensaje></p></form></div>';
}
// El cliente depositó menos del anticipo y el equipo lo acepta: el pedido avanza con lo recibido; el saldo sigue pendiente.
function anticipoHTML(s){
 if(s.anticipo===null||s.recibido<=0||s.recibido>=s.anticipo)return '';
 return '<form id="aceptarAnticipo" class="cobro-paso cobro-form"><h3>¿Te depositaron menos del anticipo?</h3><p class="cot-ayuda">Recibiste '+pesos(s.recibido)+' de '+pesos(s.anticipo)+'. Si lo acordaste con el cliente, acepta lo recibido como anticipo y el pedido pasa a Confirmado. El saldo sigue por cobrar.</p><label class="cot-check"><input type="checkbox" name="confirmo" required>Acepto '+pesos(s.recibido)+' como anticipo de este pedido</label><button class="btn btn--linea">Aceptar '+pesos(s.recibido)+' como anticipo</button><p role="status" class="cot-ayuda" data-mensaje></p></form>';
}
function pagoHTML(s){
 const rapidos=[];if(s.anticipo!==null&&s.recibido<s.anticipo)rapidos.push(['Anticipo',s.anticipo-s.recibido]);if(s.saldo>0)rapidos.push(['Todo el saldo',s.saldo]);
 return '<div class="cobro-paso"><h3>2 · Registrar pago recibido</h3><p class="cot-ayuda">Captúralo cuando ya lo veas en la cuenta. Al cubrir el anticipo el pedido pasa a Confirmado.</p><form id="registrarPago" class="cobro-form"><div class="cot-chips">'+rapidos.map(([t,n])=>'<button type="button" class="cot-chip-btn" data-monto="'+valor(n)+'">'+t+' · '+pesos(n)+'</button>').join('')+'</div><label>Importe recibido (MXN)<input name="importe" type="number" inputmode="decimal" min="0.01" max="'+valor(s.saldo)+'" step="0.01" required></label><label>Referencia (opcional)<input name="referencia" maxlength="300" placeholder="Transferencia, efectivo…"></label><label class="cot-check"><input type="checkbox" name="verificado" required>Ya verifiqué que recibimos este pago</label><button class="btn btn--azul">Registrar pago</button><p id="mensajePago" role="status" class="cot-ayuda"></p></form></div>';
}
addEventListener('zain:pedido-abierto',async e=>{
 const x=e.detail,turn=++epoca;if(x.archivado_at)return;
 document.querySelector('#seguimientoComercial')?.remove();
 document.querySelector('#detalle').insertAdjacentHTML('beforeend','<section id="seguimientoComercial" class="cot-panel"><h2>Cobro</h2><p>Consultando…</p></section>');
 try{
  const {seguimiento:s}=await window.ZAINEquipo.call('cotizacion-seguimiento',null,{id:x.id});if(turn!==epoca)return;
  const root=document.querySelector('#seguimientoComercial');if(!root)return;
  if(!s){root.innerHTML='<h2>Cobro</h2><p class="cot-ayuda">Primero publica la cotización. Después aquí registras la aceptación y los pagos.</p><button type="button" class="btn btn--azul" data-ir="cotizacion">Ir a Cotización</button>';return;}
  const cancelado=x.estado==='cancelado';
  root.innerHTML='<h2>Cobro</h2><p class="cot-ayuda">'+(s.aceptada_at?'✓ Revisión '+esc(s.revision)+' aceptada el '+esc(fechaMX(s.aceptada_at))+'.':'Revisión '+esc(s.revision)+' publicada, falta la aceptación.')+'</p>'+cifras(s)+
   (cancelado?'<p class="cot-ayuda">Pedido cancelado: no se registran pagos.</p>':!s.aceptada_at?aceptacionHTML(s):s.anticipo===null?'<p class="cot-alerta">Esta cotización no tiene anticipo definido. Ponlo en Cotización → Cliente, entrega y condiciones y publica de nuevo.</p>':s.saldo>0?anticipoHTML(s)+pagoHTML(s):'<p class="cobro-listo">✓ Pago completo registrado.</p>');
  root.querySelector('#cobroCopiarEnlace')?.addEventListener('click',async ev=>{const b=ev.currentTarget,msg=root.querySelector('#cobroEnlaceEstado');b.disabled=true;try{const r=await window.ZAINEquipo.call('enlace',{id:x.id});try{await navigator.clipboard.writeText(r.url);msg.textContent='Enlace copiado. Pégalo en el chat del cliente.';}catch{msg.textContent=r.url;}}catch(er){msg.textContent=er.message;}finally{b.disabled=false;}});
  const acepta=root.querySelector('#aceptarEquipo');
  if(acepta)acepta.onsubmit=async ev=>{ev.preventDefault();const msg=acepta.querySelector('[data-mensaje]');for(const el of acepta.elements)el.disabled=true;msg.textContent='Registrando…';
   try{await window.ZAINEquipo.call('cotizacion-aceptar-equipo',{id:x.id,revision:s.revision,acepto:true});if(turn===epoca)dispatchEvent(new CustomEvent('zain:pago-registrado'));}
   catch(er){if(turn===epoca){msg.textContent=er.message;for(const el of acepta.elements)el.disabled=false;}}};
  const anticipo=root.querySelector('#aceptarAnticipo');
  if(anticipo)anticipo.onsubmit=async ev=>{ev.preventDefault();const msg=anticipo.querySelector('[data-mensaje]');for(const el of anticipo.elements)el.disabled=true;msg.textContent='Aceptando…';
   try{await window.ZAINEquipo.call('anticipo-aceptar',{id:x.id,revision:s.revision,acepto:true});if(turn===epoca)dispatchEvent(new CustomEvent('zain:pago-registrado'));}
   catch(er){if(turn===epoca){msg.textContent=er.message;for(const el of anticipo.elements)el.disabled=false;}}};
  const form=root.querySelector('#registrarPago');if(!form)return;let solicitud=null,ocupado=false;
  form.addEventListener('click',ev=>{const b=ev.target.closest('[data-monto]');if(b){form.elements.importe.value=b.dataset.monto;form.elements.importe.focus();}});
  form.onsubmit=async ev=>{ev.preventDefault();if(ocupado)return;const fd=new FormData(form),importe=decimal(fd.get('importe')),referencia=String(fd.get('referencia')||'').trim();
   if(!solicitud||solicitud.importe!==importe||solicitud.referencia!==referencia)solicitud={request:crypto.randomUUID(),importe,referencia};
   const msg=root.querySelector('#mensajePago');ocupado=true;for(const el of form.elements)el.disabled=true;msg.textContent='Registrando pago verificado…';
   try{await window.ZAINEquipo.call('cotizacion-pago',{id:x.id,revision:s.revision,...solicitud,verificado:true});if(turn===epoca)dispatchEvent(new CustomEvent('zain:pago-registrado'));}
   catch(er){if(turn===epoca)msg.textContent=er.message;}
   finally{ocupado=false;if(turn===epoca)for(const el of form.elements)el.disabled=false;}
  };
 }catch(er){if(turn===epoca&&document.querySelector('#seguimientoComercial'))document.querySelector('#seguimientoComercial').textContent=er.message;}
});
document.querySelector('#ficha')?.addEventListener('close',()=>epoca++);
addEventListener('zain:equipo-salio',()=>epoca++);
