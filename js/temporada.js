import {vigente,identificador,precioAprobado,mensajePaquete,testimoniosPublicables} from './temporada-core.js?v=1';
await window.ZAINCatalogoListo;
const C=window.ZAIN,$=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pesos=n=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(n/100);
const medir=(tipo,id)=>{try{window.ZAINMedicion?.temporada(tipo,id);}catch{}};
const campana=C.posadas,paquetes=Array.isArray(campana?.paquetes)?campana.paquetes.filter(p=>identificador(p.id)&&p.nombre):[];
const mostrar=vigente(campana)&&paquetes.length>0&&!C.catalogoNoDisponible;
$('#paquetes').hidden=!mostrar;$('#navPaquetes').hidden=!mostrar;
if(mostrar){
 $('#listaPaquetes').innerHTML=paquetes.map(p=>{const ok=precioAprobado(p);return `<article class="posada-paquete"><h3>${esc(p.nombre)}</h3><p class="posada-paquete__minimo">${ok?'Desde '+p.minimoPaquetes+' paquetes':'Cantidad por acordar'}</p><ul>${(p.contenido||[]).map(x=>`<li><b>${ok?x.cantidad+' × ':''}${esc(x.producto)}</b><span>${ok?esc(x.tecnica+' · '+x.ubicacion):'Personalización por cotizar'}</span></li>`).join('')}</ul><div class="posada-paquete__precios"><div><span>Por paquete${ok?' · '+p.piezasPorPaquete+' piezas':''}</span><strong>${ok?esc(pesos(p.precioPaquete)):'Por cotizar'}</strong></div><div><span>Promedio por pieza</span><strong>${ok?esc(pesos(p.precioPieza)):'Por cotizar'}</strong></div></div>${ok?`<p class="posada-paquete__iva">${p.impuesto===1600?'Más IVA':'Precio final'}</p>`:''}<a class="btn btn--tinta" data-paquete="${esc(p.id)}" href="https://wa.me/${esc(String(C.whatsapp).replace(/\D/g,''))}?text=${esc(encodeURIComponent(mensajePaquete(p)))}" target="_blank" rel="noopener">Cotizar este paquete</a></article>`;}).join('');
 $('#listaPaquetes').addEventListener('click',e=>{const a=e.target.closest('[data-paquete]');if(a)medir('paquete_clic',a.dataset.paquete);});
 const banner=$('#posadaBanner'),llave='zain-banner-'+campana.id+'-'+campana.inicio+'-'+campana.fin;
 let cerrado=false;try{cerrado=sessionStorage.getItem(llave)==='cerrado';}catch{}
 if(campana.bannerActivo===true&&!cerrado){
  $('#posadaBannerTexto').textContent=campana.textoBanner;banner.hidden=false;
  document.documentElement.classList.add('hay-posada');
  const ajustar=()=>document.documentElement.style.setProperty('--posada-alto',banner.getBoundingClientRect().height+'px');ajustar();
  const observador=typeof ResizeObserver==='function'?new ResizeObserver(ajustar):null;observador?.observe(banner);addEventListener('resize',ajustar);
  let visto=false;const ver=()=>{if(!visto){visto=true;medir('banner_ver',campana.id);}};
  if(typeof IntersectionObserver==='function'){const io=new IntersectionObserver(entries=>{if(entries.some(x=>x.isIntersecting)){ver();io.disconnect();}},{threshold:0.5});io.observe(banner);}else ver();
  $('#posadaBannerEnlace').addEventListener('click',e=>{e.preventDefault();medir('banner_clic',campana.id);history.replaceState(null,'','#paquetes');$('#paquetes').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});$('#paquetesTitulo').focus({preventScroll:true});});
  $('#cerrarPosada').addEventListener('click',()=>{medir('banner_cerrar',campana.id);banner.hidden=true;document.documentElement.classList.remove('hay-posada');document.documentElement.style.removeProperty('--posada-alto');observador?.disconnect();removeEventListener('resize',ajustar);try{sessionStorage.setItem(llave,'cerrado');}catch{}$('#barra a').focus({preventScroll:true});});
 }
}
const testimonios=testimoniosPublicables(C.clientesSatisfechos);
$('#clientes-satisfechos').hidden=!testimonios.length;$('#navClientes').hidden=!testimonios.length;
$('#listaTestimonios').innerHTML=testimonios.map(x=>`<figure class="trabajo-real"><img src="${esc(x.foto)}" alt="${esc(x.producto+' personalizado por ZAIN')}" width="1200" height="900" loading="lazy" decoding="async"><figcaption><blockquote><p>“${esc(x.frase)}”</p></blockquote><p><b>${esc(x.permisoEmpresa===true&&x.empresa?x.empresa:'Cliente ZAIN')}</b><span>${esc(x.producto)}</span></p></figcaption></figure>`).join('');
