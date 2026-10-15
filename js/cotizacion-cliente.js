import {documento,imprimir} from './cotizacion-vista.js';
addEventListener('zain:consulta-cliente',e=>{
 const q=e.detail.cotizacion,pedido=document.querySelector('#pedido');
 document.querySelector('#cotizacionCliente')?.remove();
 const section=document.createElement('section');section.id='cotizacionCliente';section.className='cot-area';section.setAttribute('aria-label','Tu cotización');
 if(!q){section.innerHTML='<h2>Tu cotización</h2><p class="cot-ayuda">ZAIN está preparando los precios y condiciones. Tu cotización aparecerá aquí cuando el equipo la revise y publique.</p>';}
 else{section.innerHTML=documento(q)+'<div class="cot-botones"><button type="button" class="btn btn--azul" id="imprimirCotizacionCliente">Imprimir o guardar PDF</button></div><p id="estadoCotizacionCliente" role="status" class="cot-estado"></p>';section.querySelector('button').addEventListener('click',()=>{try{imprimir(q);}catch(er){section.querySelector('[role=status]').textContent=er.message;}});}
 pedido.prepend(section);
});
// Registrar el receptor antes de que comience la primera consulta.
await import('./mi-pedido.js?v=4');
