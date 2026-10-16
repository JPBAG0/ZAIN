import {prepararImagenes} from './cotizacion-imagen.js?v=1';
import {documento,imprimir,actualizarImagenes} from './cotizacion-vista.js?v=3';
let pedidoActual=null,cotizacionActual=null,imagenesActual={},revisionImagenes=0;
addEventListener('zain:consulta-cliente',e=>{
 const x=e.detail,q=x.cotizacion,pedido=document.querySelector('#pedido');
 pedidoActual=x.folio;cotizacionActual=q;imagenesActual=Object.fromEntries((x.archivos||[]).filter(f=>f.kind==='render').map(f=>[f.item,{pendiente:true}]));revisionImagenes++;
 document.querySelector('#cotizacionCliente')?.remove();
 const section=document.createElement('section');section.id='cotizacionCliente';section.className='cot-area';section.setAttribute('aria-label','Tu cotización');
 if(!q){section.innerHTML='<h2>Tu cotización</h2><p class="cot-ayuda">ZAIN está preparando los precios y condiciones. Tu cotización aparecerá aquí cuando el equipo la revise y publique.</p>';}
 else{section.innerHTML=documento(q,{imagenes:imagenesActual})+'<div class="cot-botones"><button type="button" class="btn btn--azul" id="imprimirCotizacionCliente">Imprimir o guardar PDF</button></div><p id="estadoCotizacionCliente" role="status" class="cot-estado"></p>';section.querySelector('button').addEventListener('click',()=>{try{if(Object.values(imagenesActual).some(v=>v.pendiente))throw Error('Espera a que terminen de cargar los diseños antes de imprimir.');imprimir(q,{imagenes:imagenesActual});}catch(er){section.querySelector('[role=status]').textContent=er.message;}});}
 pedido.prepend(section);
});
// Reutiliza únicamente el render ya autorizado y cargado para este pedido.
addEventListener('zain:render-cliente',async e=>{const d=e.detail;if(d.folio!==pedidoActual||!cotizacionActual)return;const p=cotizacionActual.partidas.find(p=>p.indice===d.indice);if(!p)return;if(!d.src){delete imagenesActual[p.indice];const root=document.querySelector('#cotizacionCliente');if(root)actualizarImagenes(root,cotizacionActual,imagenesActual);return;}const turn=revisionImagenes,result=await prepararImagenes({partidas:[p]},{[p.indice]:{src:d.src,referencia:false}});if(turn!==revisionImagenes||d.folio!==pedidoActual)return;imagenesActual[p.indice]=result[p.indice];const root=document.querySelector('#cotizacionCliente');if(root)actualizarImagenes(root,cotizacionActual,imagenesActual);});
await import('./mi-pedido.js?v=7');
