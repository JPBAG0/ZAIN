import {prepararImagenes} from './cotizacion-imagen.js?v=2';
import {documento,imprimir,actualizarImagenes} from './cotizacion-vista.js?v=5';
let pedidoActual=null,cotizacionActual=null,imagenesActual={},revisionImagenes=0;
function controles(){const pending=Object.values(imagenesActual).some(v=>v.pendiente);for(const b of document.querySelectorAll('#cotizacionCliente .cot-botones button'))b.disabled=pending;}
addEventListener('zain:consulta-cliente',e=>{
 const x=e.detail,q=x.cotizacion,pedido=document.querySelector('#pedido');
 pedidoActual=x.folio;cotizacionActual=q;imagenesActual=Object.fromEntries((x.archivos||[]).filter(f=>f.kind==='render').map(f=>[f.item,{pendiente:true}]));revisionImagenes++;
 document.querySelector('#cotizacionCliente')?.remove();
 const section=document.createElement('section');section.id='cotizacionCliente';section.className='cot-area';section.setAttribute('aria-label','Tu cotización');
 if(!q){section.innerHTML='<h2>Tu cotización</h2><p class="cot-ayuda">ZAIN está preparando los precios y condiciones. Tu cotización aparecerá aquí cuando el equipo la revise y publique.</p>';}
 else{
  section.innerHTML=documento(q,{imagenes:imagenesActual})+'<div class="cot-botones"><button type="button" class="btn btn--linea" id="imprimirCotizacionCliente">Imprimir</button><button type="button" class="btn btn--azul" id="descargarCotizacionCliente">Descargar PDF</button></div><p id="estadoCotizacionCliente" role="status" class="cot-estado"></p>';
  section.querySelector('#imprimirCotizacionCliente').onclick=()=>{try{if(Object.values(imagenesActual).some(v=>v.pendiente||v.error))throw Error('Espera a que carguen los diseños; si alguno falló, pulsa Actualizar estado.');imprimir(q,{imagenes:imagenesActual});}catch(er){section.querySelector('[role=status]').textContent=er.message;}};
  section.querySelector('#descargarCotizacionCliente').onclick=async e=>{const b=e.currentTarget,turn=revisionImagenes;b.disabled=true;const estado=section.querySelector('[role=status]');estado.textContent='Preparando PDF…';try{const {descargarPDF}=await import('./cotizacion-pdf.js?v=1');if(turn!==revisionImagenes)return;await descargarPDF(q,{imagenes:imagenesActual});estado.textContent='PDF generado. Puedes guardarlo o compartirlo desde tu dispositivo.';}catch(er){estado.textContent=er.message;}finally{if(turn===revisionImagenes){controles();}}};
 }
 pedido.prepend(section);controles();
});
addEventListener('zain:render-cliente',async e=>{
 const d=e.detail;if(d.folio!==pedidoActual||!cotizacionActual)return;const p=cotizacionActual.partidas.find(p=>p.indice===d.indice);if(!p)return;
 if(!d.src){imagenesActual[p.indice]={error:true};const root=document.querySelector('#cotizacionCliente');if(root){actualizarImagenes(root,cotizacionActual,imagenesActual);root.querySelector('[role=status]').textContent='Algún diseño no cargó. Pulsa Actualizar estado para reintentar.';}controles();return;}
 const turn=revisionImagenes,result=await prepararImagenes({partidas:[p]},{[p.indice]:{src:d.src,referencia:false}});if(turn!==revisionImagenes||d.folio!==pedidoActual)return;
 imagenesActual[p.indice]=result[p.indice];const root=document.querySelector('#cotizacionCliente');if(root)actualizarImagenes(root,cotizacionActual,imagenesActual);controles();
});
await import('./mi-pedido.js?v=8');
