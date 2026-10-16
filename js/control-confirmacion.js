import {pesos,decimal} from './cotizacion-core.js?v=8';
import {esc} from './cotizacion-vista.js?v=6';
let epoca=0;
addEventListener('zain:pedido-abierto',async e=>{
 const x=e.detail,turn=++epoca;if(x.archivado_at)return;
 document.querySelector('#seguimientoComercial')?.remove();
 document.querySelector('#detalle').insertAdjacentHTML('beforeend','<section id="seguimientoComercial" class="cot-panel"><h2>Aceptación y pagos</h2><p>Consultando seguimiento…</p></section>');
 try{
  const {seguimiento:s}=await window.ZAINEquipo.call('cotizacion-seguimiento',null,{id:x.id});if(turn!==epoca)return;
  const root=document.querySelector('#seguimientoComercial');if(!root)return;
  if(!s){root.innerHTML='<h2>Aceptación y pagos</h2><p class="cot-ayuda">Publica la cotización revisada para que el cliente pueda aceptarla desde Mi pedido.</p>';return;}
  root.innerHTML='<h2>Aceptación y pagos</h2><p class="cot-ayuda">'+(s.aceptada_at?'Revisión '+esc(s.revision)+' aceptada el '+esc(new Date(s.aceptada_at).toLocaleString('es-MX',{timeZone:'America/Mexico_City'}))+'.':'El cliente todavía no acepta la revisión '+esc(s.revision)+'.')+'</p><div class="cot-resumen"><div><small>Anticipo acordado</small><strong>'+pesos(s.anticipo)+'</strong></div><div><small>Pagos verificados</small><strong>'+pesos(s.recibido)+'</strong></div><div><small>Saldo pendiente</small><strong>'+pesos(s.saldo)+'</strong></div></div>'+(s.aceptada_at&&s.anticipo!==null&&s.saldo>0&&x.estado!=='cancelado'?'<details class="cot-ajustes"><summary>Registrar pago recibido</summary><p class="cot-ayuda">Regístralo después de comprobarlo en tu cuenta. Al cubrir el anticipo, el pedido queda confirmado; el saldo se cubre antes del envío.</p><form id="registrarPago" class="cot-edicion"><label>Importe recibido (MXN)<input name="importe" type="number" inputmode="decimal" min="0.01" max="'+(s.saldo/100).toFixed(2)+'" step="0.01" required></label><label>Referencia interna (opcional)<input name="referencia" maxlength="300"></label><label class="cot-check cot-ancho"><input type="checkbox" name="verificado" required>Ya verifiqué que recibimos este pago</label><button class="btn btn--azul">Registrar pago</button><p id="mensajePago" role="status" class="cot-ancho"></p></form></details>':!s.aceptada_at?'<p class="cot-ayuda">Comparte el enlace del cliente para que revise y acepte. Aceptar no confirma un pago.</p>':s.anticipo===null?'<p class="cot-ayuda">Define el anticipo en Entrega y condiciones y publica una revisión nueva antes de registrar pagos.</p>':'<p class="cot-ayuda">'+(s.saldo===0?'Pago completo registrado.':'No se pueden registrar pagos en un pedido cancelado.')+'</p>');
  const form=root.querySelector('form');if(!form)return;let solicitud=null,ocupado=false;
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
