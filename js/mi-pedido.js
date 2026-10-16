(() => {
  'use strict';
  const imagenesModulo=import('./pedido-imagen.js?v=1');
  const recursos=[];let ultimaCarga=0;
  const liberar=()=>{dispatchEvent(new CustomEvent('zain:imagenes-liberar'));for(const r of recursos.splice(0))r.liberar();};
  const $=s=>document.querySelector(s),endpoint=window.ZAIN.pedidosApi||'/api/pedidos';
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels={nuevo:'Solicitud recibida',contactado:'En contacto',cotizado:'Cotización enviada',confirmado:'Pedido confirmado',produccion:'En producción',entregado:'Entregado',cancelado:'Cancelado'};
  const descriptions={nuevo:'Recibimos tu selección y sus archivos. Falta confirmar disponibilidad, cotización y fecha de entrega con ZAIN.',contactado:'El equipo está revisando los detalles contigo por WhatsApp.',cotizado:'Consulta en WhatsApp los precios, condiciones y tiempos de tu cotización.',confirmado:'Tu pedido está confirmado. Consulta los detalles acordados con ZAIN por WhatsApp.',produccion:'Estamos trabajando en tu pedido.',entregado:'Tu pedido figura como entregado. Gracias por elegir ZAIN.',cancelado:'Esta solicitud está cancelada. Puedes comunicarte con ZAIN si necesitas retomarla.'};
  const match=location.hash.match(/^#([a-f0-9-]{36})\/([a-f0-9]{64})$/i);
  let access=match?{id:match[1],token:match[2].toLowerCase()}:null,busy=false,generation=0;
  async function call(op,extra={}) {
    const r=await fetch(endpoint+'?op='+op,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...access,...extra}),signal:AbortSignal.timeout(30000)});
    const x=await r.json();if(!r.ok)throw new Error(x.error||'No se pudo consultar tu solicitud.');return x;
  }
  async function cargar() {
    if(busy||!access)return;busy=true;$('#actualizar').disabled=true;$('#mensaje').textContent='Consultando tu solicitud…';const turn=++generation;
    try {
      const {pedido:x}=await call('consulta');
      const contacto='https://wa.me/'+window.ZAIN.whatsapp+'?text='+encodeURIComponent('Hola ZAIN, quiero consultar mi pedido. Folio: '+x.folio);
      liberar();ultimaCarga=Date.now();
      $('#pedido').innerHTML=`<div class="seguimiento__resumen"><div><span class="seguimiento__etq">TU FOLIO</span><h2 class="seguimiento__folio">${esc(x.folio)}</h2></div><div class="seguimiento__datos"><span class="seguimiento__estado">${esc(labels[x.estado]||'En revisión')}</span><b class="num">${esc(x.total)} piezas</b><span>${esc(new Date(x.created_at).toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'}))}</span></div><p>${esc(x.cotizacion&&x.estado==='cotizado'?'Tu cotización revisada está disponible en esta página. Si tienes dudas, escríbenos por WhatsApp.':descriptions[x.estado]||'Consulta los detalles con ZAIN.')}</p></div>
        <div class="seguimiento__items">${x.items.map((p,i)=>`<article class="seguimiento__item"><div class="seguimiento__imagen" id="imagen-${i}"><p>${x.archivos.some(f=>f.item===i&&f.kind==='render')?'Cargando tu diseño…':'Sin vista previa para esta selección.'}</p></div><div class="seguimiento__info"><h2>${esc(p.nombre)}</h2><p>${esc(p.color)} · ${esc(p.tecnica)}</p><b class="seguimiento__cantidad">${esc(p.piezas)} piezas</b>${p.medidas?`<p><b>Medidas:</b> ${esc(p.detalleMedidas||p.medidas)}</p>`:''}${p.sku?`<p><b>SKU ZAIN:</b> ${esc(p.sku)}</p>`:""}${p.silueta?`<p>${esc(p.silueta)} · ${esc(p.tejido)} · ${esc(p.gramaje)} g/m² · ${esc(p.composicion)}</p>`:""}${p.renderOrientativo?`<p>Vista orientativa; el tamaño y el acabado se confirman antes de producir.</p>`:""}${p.tallas?`<p><b>${esc(p.tallasEtq||'Tallas')}:</b> ${esc(p.tallas)}</p>`:''}${p.zona?`<p><b>Ubicación:</b> ${esc(p.zona)}${p.cm?' · logo de '+esc(p.cm)+' cm':''}</p>`:''}${p.logo?`<p><b>Logo:</b> ${esc(p.logo)}</p>`:''}${p.colorLogo?`<p><b>Color del logo:</b> ${esc(p.colorLogo)}</p>`:''}${p.pantone?`<p><b>Pantone de referencia:</b> ${esc(p.pantone)}</p>`:''}${p.notas?`<p><b>Tus indicaciones:</b> ${esc(p.notas)}</p>`:''}<div class="seguimiento__archivos">${x.archivos.filter(f=>f.item===i).map(f=>`<button type="button" class="btn-texto" data-item="${i}" data-kind="${esc(f.kind)}">${f.kind==='logo'?'Descargar tu logo original':'Descargar tu diseño'}</button>`).join('')}</div></div></article>`).join('')}</div><div class="seguimiento__ayuda"><div><b>¿Tienes alguna duda?</b><p>Menciona tu folio al escribirnos.</p></div><a class="btn btn--linea" href="${esc(contacto)}" rel="noreferrer">Hablar con ZAIN</a></div>`;
      $('#pedido').hidden=false;$('#actualizar').hidden=false;$('#mensaje').textContent='Estado consultado a las '+new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})+'. Los renders son vistas previas; confirma el diseño final con ZAIN.';
      dispatchEvent(new CustomEvent('zain:consulta-cliente',{detail:x}));
      await Promise.all(x.archivos.filter(f=>f.kind==='render').map(async f=>{
        try{const {cargarRender}=await imagenesModulo,recurso=await cargarRender(()=>call('archivo-consulta',{item:f.item,kind:'render'}));if(turn!==generation){recurso.liberar();return;}recursos.push(recurso);recurso.imagen.alt='Tu diseño de '+x.items[f.item].nombre;$('#imagen-'+f.item).replaceChildren(recurso.imagen);dispatchEvent(new CustomEvent('zain:render-cliente',{detail:{folio:x.folio,indice:f.item,src:recurso.src}}));}catch{if(turn===generation){$('#imagen-'+f.item).textContent='No se pudo cargar la imagen. Prueba Actualizar estado.';dispatchEvent(new CustomEvent('zain:render-cliente',{detail:{folio:x.folio,indice:f.item,src:null}}));}}
      }));
    }catch(er){$('#mensaje').textContent=er.message;$('#actualizar').hidden=false;}finally{busy=false;$('#actualizar').disabled=false;}
  }
  $('#actualizar').addEventListener('click',cargar);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-ultimaCarga>60000)cargar();});
  $('#pedido').addEventListener('click',async e=>{
    const b=e.target.closest('[data-item]');if(!b)return;b.disabled=true;
    try{const data=await call('archivo-consulta',{item:Number(b.dataset.item),kind:b.dataset.kind,descarga:true});const a=document.createElement('a');a.href=data.url;a.rel='noopener noreferrer';a.download=data.name||'render.png';a.click();}catch(er){$('#mensaje').textContent=er.message;}finally{b.disabled=false;}
  });
  if(access)cargar();else $('#mensaje').textContent='Abre el enlace completo que recibiste con tu cotización para consultar tu pedido. Si no lo tienes, solicítalo a ZAIN por WhatsApp.';
})();
