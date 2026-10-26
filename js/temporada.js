import {vigente,identificador,precioAprobado,precioDesde,mensajePaquete,testimoniosPublicables} from './temporada-core.js?v=3';
await window.ZAINCatalogoListo;
const C=window.ZAIN,$=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pesos=n=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',minimumFractionDigits:n%100?2:0}).format(n/100);
const medir=(tipo,id)=>{try{window.ZAINMedicion?.temporada(tipo,id);}catch{}};
const campana=C.posadas,paquetes=Array.isArray(campana?.paquetes)?campana.paquetes.filter(p=>identificador(p.id)&&p.nombre):[];
const mostrar=vigente(campana)&&paquetes.length>0&&!C.catalogoNoDisponible;
$('#paquetes').hidden=!mostrar;$('#navPaquetes').hidden=!mostrar;
if(mostrar){
 const wa=p=>`https://wa.me/${esc(String(C.whatsapp).replace(/\D/g,''))}?text=${esc(encodeURIComponent(mensajePaquete(p)))}`;
 const logo=x=>x.tecnica==='DTF'?'Logo DTF al frente':x.tecnica==='Bordado'?'Logo bordado':'Logo en serigrafía';
 const foto=x=>(C.productos||[]).find(v=>v.sku===x.sku)?.foto;
 // kit con escalones: fotos, contenido, precio «desde» y tabla por cantidad
 const kit=p=>`<article class="posada-paquete posada-kit${p.destacado?' posada-kit--destacado':''}">${p.destacado?'<span class="posada-kit__chip">El más pedido</span>':''}<div class="posada-kit__fotos">${p.contenido.map(x=>`<div>${foto(x)?`<img src="${esc(foto(x))}" alt="${esc(x.producto)}" width="320" height="320" loading="lazy" decoding="async">`:''}</div>`).join('')}</div><h3>${esc(p.nombre)}</h3>${p.subtitulo?`<p class="posada-kit__sub">${esc(p.subtitulo)}</p>`:''}<ul>${p.contenido.map(x=>`<li><b>${x.cantidad>1?x.cantidad+' × ':''}${esc(x.producto)}</b><span>${esc(logo(x))}</span></li>`).join('')}</ul><p class="posada-kit__desde">Desde</p><p class="posada-kit__precio">${esc(pesos(precioDesde(p)))} <small>por kit${p.impuesto===1600?' + IVA':''}</small></p><table class="posada-kit__tabla"><thead><tr><th scope="col">Kits</th><th scope="col">Precio por kit${p.impuesto===1600?' + IVA':''}</th></tr></thead><tbody>${p.escalones.map(e=>`<tr><td>${e.hasta===null?e.desde+' o más':e.desde+' – '+e.hasta}</td><td>${esc(pesos(e.precio))}</td></tr>`).join('')}</tbody></table><a class="btn btn--tinta" data-paquete="${esc(p.id)}" href="${wa(p)}" target="_blank" rel="noopener">Cotizar por WhatsApp</a></article>`;
 $('#listaPaquetes').innerHTML=paquetes.map(p=>{const ok=precioAprobado(p);if(ok&&p.escalones)return kit(p);return `<article class="posada-paquete"><h3>${esc(p.nombre)}</h3><p class="posada-paquete__minimo">${ok?'Desde '+p.minimoPaquetes+' paquetes':'Cantidad por acordar'}</p><ul>${(p.contenido||[]).map(x=>`<li><b>${ok?x.cantidad+' × ':''}${esc(x.producto)}</b><span>${ok?esc(x.tecnica+' · '+x.ubicacion):'Personalización por cotizar'}</span></li>`).join('')}</ul><div class="posada-paquete__precios"><div><span>Por paquete${ok?' · '+p.piezasPorPaquete+' piezas':''}</span><strong>${ok?esc(pesos(p.precioPaquete)):'Por cotizar'}</strong></div><div><span>Promedio por pieza</span><strong>${ok?esc(pesos(p.precioPieza)):'Por cotizar'}</strong></div></div>${ok?`<p class="posada-paquete__iva">${p.impuesto===1600?'Más IVA':'Precio final'}</p>`:''}<a class="btn btn--tinta" data-paquete="${esc(p.id)}" href="https://wa.me/${esc(String(C.whatsapp).replace(/\D/g,''))}?text=${esc(encodeURIComponent(mensajePaquete(p)))}" target="_blank" rel="noopener">Cotizar este paquete</a></article>`;}).join('');
 const nota=$('#notaPaquetes');if(nota&&campana.notaPaquetes){nota.textContent=campana.notaPaquetes;nota.hidden=false;}
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
// galería de trabajos: la frase y el nombre de la empresa son opcionales (solo con permiso)
// las fotos anchas ocupan 2 columnas; una tarjeta para cotizar llena los huecos de la última fila (3 columnas en PC, 2 en celular)
const lugares=testimonios.reduce((n,x)=>n+(x.formato==='ancho'?2:1),0),huecoPC=(3-lugares%3)%3,huecoCel=(2-lugares%2)%2;
const waTrabajos=`https://wa.me/${esc(String(C.whatsapp).replace(/\D/g,''))}?text=${esc(encodeURIComponent('Hola, vi sus trabajos en la página y quiero cotizar con mi logo.'))}`;
$('#listaTestimonios').innerHTML=testimonios.map(x=>{const ancho=x.formato==='ancho',frase=String(x.frase||'').trim(),empresa=x.permisoEmpresa===true&&x.empresa?x.empresa:'';return `<figure class="trabajo-real${ancho?' trabajo-real--ancho':''}"><img src="${esc(x.foto)}" alt="${esc(x.producto+(x.tecnica?' · '+x.tecnica:'')+' hecho por ZAIN')}" width="${ancho?1280:720}" height="${ancho?720:900}" loading="lazy" decoding="async"><figcaption>${frase?`<blockquote><p>“${esc(frase)}”</p></blockquote>`:''}<p><b>${esc(x.producto)}</b><span>${esc([x.tecnica,empresa].filter(Boolean).join(' · '))}</span></p></figcaption></figure>`;}).join('')
 +((huecoPC||huecoCel)?`<a class="trabajo-cta trabajo-cta--pc${huecoPC} trabajo-cta--cel${huecoCel}" href="${waTrabajos}" target="_blank" rel="noopener"><b>¿Tu logo aquí?</b><span>Cotiza tu pedido por WhatsApp</span><i aria-hidden="true">→</i></a>`:'');
