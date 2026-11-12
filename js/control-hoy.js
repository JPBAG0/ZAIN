// «Para hoy» y menú inferior del celular en Gestión (JP, 11-nov-2026).
// La lista de pedidos sigue igual abajo; esto solo dice qué toca hacer y deja lo más usado a la mano.
import {agrupar,pesos} from './para-hoy.js?v=1';
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const caja=$('#paraHoy'),VISIBLES=4;
let turno=0,abiertos=new Set();
function pintar(grupos){
 const con=grupos.filter(g=>g.filas.length),sin=grupos.filter(g=>!g.filas.length);
 if(!con.length){caja.innerHTML='<h2>Para hoy</h2><p class="hoy-vacio">Nada pendiente: no hay pedidos por cotizar, cobrar ni entregar.</p>';caja.hidden=false;return;}
 caja.innerHTML='<h2>Para hoy</h2>'+con.map(g=>{
  const todas=abiertos.has(g.clave)||g.filas.length<=VISIBLES,filas=todas?g.filas:g.filas.slice(0,VISIBLES);
  return '<section class="hoy-grupo hoy-grupo--'+g.clave+'"><header><h3>'+esc(g.titulo)+' <span>'+g.filas.length+'</span></h3>'+(g.total&&g.clave!=='respuesta'?'<b>'+esc(pesos(g.total))+'</b>':'')+'</header>'+
   filas.map(f=>'<button type="button" class="hoy-fila'+(f.urgente?' hoy-fila--urgente':'')+'" data-hoy="'+esc(f.id)+'" data-pestana="'+esc(f.pestana)+'"><span><b>'+esc(f.titulo)+'</b><small>'+esc(f.detalle)+'</small></span><i aria-hidden="true">→</i></button>').join('')+
   (todas?'':'<button type="button" class="btn-texto hoy-mas" data-hoy-mas="'+g.clave+'">Ver los '+g.filas.length+'</button>')+'</section>';
 }).join('')+(sin.length?'<p class="hoy-sin">Sin pendientes en: '+sin.map(g=>esc(g.titulo.toLowerCase())).join(', ')+'.</p>':'');
 caja.hidden=false;
}
let ultimos=null;
async function cargar(){
 if(!caja||!window.ZAINEquipo)return;const t=++turno;
 try{const d=await window.ZAINEquipo.call('hoy');if(t!==turno)return;ultimos=agrupar(d.pedidos||[]);pintar(ultimos);}
 // Si el servidor todavía no tiene la operación, la sección no aparece y la lista de siempre sigue funcionando.
 catch{if(t===turno)caja.hidden=true;}
}
caja?.addEventListener('click',e=>{
 const mas=e.target.closest('[data-hoy-mas]');if(mas){abiertos.add(mas.dataset.hoyMas);if(ultimos)pintar(ultimos);return;}
 const f=e.target.closest('[data-hoy]');if(f)dispatchEvent(new CustomEvent('zain:abrir-pedido',{detail:{id:f.dataset.hoy,pestana:f.dataset.pestana}}));
});
// Se actualiza cada vez que se recarga la lista (al entrar, al cambiar un estado, al registrar un pago).
addEventListener('zain:equipo-listo',()=>{void cargar();});

// Menú inferior (solo celular): Pedidos, Cotizar, Finanzas y Más. «Más» muestra las demás secciones.
const menu=$('#menuInferior'),nav=$('.control__secciones');
function marcar(){
 if(!menu||!nav)return;const on=nav.querySelector('button.on')?.id||'';
 for(const b of menu.querySelectorAll('[data-ir]')){const activo=b.dataset.ir===on||b.dataset.ir==='cotizarRapido'&&on==='verCotizaciones'||b.dataset.ir==='mas'&&!['verPedidos','verCotizaciones','verFinanzas'].includes(on)&&!!on;b.classList.toggle('on',activo);}
}
menu?.addEventListener('click',e=>{
 const b=e.target.closest('[data-ir]');if(!b)return;
 if(b.dataset.ir==='mas'){document.body.classList.toggle('menu-mas');if(document.body.classList.contains('menu-mas'))window.scrollTo({top:0,behavior:'smooth'});return;}
 document.body.classList.remove('menu-mas');$('#'+b.dataset.ir)?.click();window.scrollTo({top:0,behavior:'auto'});
});
nav?.addEventListener('click',()=>{document.body.classList.remove('menu-mas');setTimeout(marcar);});
if(nav)new MutationObserver(marcar).observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});
// El menú solo existe con la sesión abierta.
if(menu&&$('#trabajo'))new MutationObserver(()=>{menu.hidden=$('#trabajo').hidden;}).observe($('#trabajo'),{attributes:true,attributeFilter:['hidden']});
marcar();
