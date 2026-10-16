import {documento,imprimir,actualizarImagenes} from './cotizacion-vista.js?v=2';
let pedidoActual=null,cotizacionActual=null,imagenesActual={};
addEventListener('zain:consulta-cliente',e=>{
 const x=e.detail,q=x.cotizacion,pedido=document.querySelector('#pedido');
 pedidoActual=x.id;cotizacionActual=q;imagenesActual={};
 document.querySelector('#cotizacionCliente')?.remove();
 const section=document.createElement('section');section.id='cotizacionCliente';section.className='cot-area';section.setAttribute('aria-label','Tu cotización');
 if(!q){section.innerHTML='<h2>Tu cotización</h2><p class="cot-ayuda">ZAIN está preparando los precios y condiciones. Tu cotización aparecerá aquí cuando el equipo la revise y publique.</p>';}
 else{section.innerHTML=documento(q,{imagenes:imagenesActual})+'<div class="cot-botones"><button type="button" class="btn btn--azul" id="imprimirCotizacionCliente">Imprimir o guardar PDF</button></div><p id="estadoCotizacionCliente" role="status" class="cot-estado"></p>';section.querySelector('button').addEventListener('click',()=>{try{imprimir(q,{imagenes:imagenesActual});}catch(er){section.querySelector('[role=status]').textContent=er.message;}});}
 pedido.prepend(section);
});
// Reutiliza únicamente el render ya autorizado y cargado para este pedido.
addEventListener('zain:render-cliente',e=>{const d=e.detail;if(d.pedidoId!==pedidoActual||!cotizacionActual||!cotizacionActual.partidas.some(p=>p.indice===d.indice))return;imagenesActual[d.indice]={src:d.src,referencia:false};const root=document.querySelector('#cotizacionCliente');if(root)actualizarImagenes(root,cotizacionActual,imagenesActual);});
await import('./mi-pedido.js?v=5');
