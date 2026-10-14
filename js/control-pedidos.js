(() => {
  'use strict';
  const $=s=>document.querySelector(s),api=window.ZAIN.pedidosApi||'/api/pedidos';
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels={nuevo:'Nuevo',contactado:'Contactado',cotizado:'Cotizado',confirmado:'Confirmado',produccion:'En producción',entregado:'Entregado',cancelado:'Cancelado'};
  const fecha=x=>new Date(x).toLocaleString('es-MX');
  let config,session=null,offset=0,selected=null,refreshing=null;
  try{session=JSON.parse(sessionStorage.getItem('zain-equipo'));}catch{}
  const status=(txt,error=false)=>{$('#estadoPanel').textContent=txt;$('#estadoPanel').classList.toggle('error',error);};
  const persist=()=>{try{sessionStorage.setItem('zain-equipo',JSON.stringify(session));}catch{}};
  const auth=async(body,grant)=>{
    const r=await fetch(config.supabaseUrl+'/auth/v1/token?grant_type='+grant,{method:'POST',headers:{apikey:config.publishableKey,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
    if(!r.ok)throw new Error('No pudimos iniciar sesión. Revisa tu correo y contraseña.');
    session=await r.json();persist();return session;
  };
  async function call(op,body,extra={},retry=true) {
    const q=new URLSearchParams({op,...extra});
    const r=await fetch(api+'?'+q,{method:body?'POST':'GET',headers:{...(session?{Authorization:'Bearer '+session.access_token}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});
    if(r.status===401&&retry&&session?.refresh_token){if(!refreshing)refreshing=auth({refresh_token:session.refresh_token},'refresh_token').finally(()=>refreshing=null);await refreshing;return call(op,body,extra,false);}
    const data=await r.json();if(!r.ok)throw new Error(data.error||'No se pudo consultar el pedido.');return data;
  }
  function salir(){session=null;selected=null;try{sessionStorage.removeItem('zain-equipo');}catch{}$('#trabajo').hidden=true;$('#acceso').hidden=false;$('#salir').hidden=true;$('#lista').replaceChildren();$('#detalle').replaceChildren();}
  async function cargar() {
    status('Consultando solicitudes…');
    const data=await call('lista',null,{offset:String(offset),q:$('#buscar').value,estado:$('#estadoFiltro').value});
    const entrando=!$('#acceso').hidden;
    $('#acceso').hidden=true;$('#trabajo').hidden=false;$('#salir').hidden=false;
    if(entrando)window.scrollTo({top:0,behavior:'auto'});
    $('#equipo').textContent=data.equipo.nombre||'EQUIPO ZAIN';
    $('#lista').innerHTML=data.pedidos.map(x=>`<button type="button" class="control__pedido" data-id="${esc(x.id)}" aria-current="${x.id===selected?.id}"><b class="num">${esc(x.folio)}</b><span>${esc(fecha(x.created_at))}</span><span>${esc(labels[x.estado])} · ${x.total} piezas</span></button>`).join('')||'<p>No hay solicitudes en esta búsqueda.</p>';
    $('#anterior').disabled=!offset;$('#siguiente').disabled=data.pedidos.length<50;$('#pagina').textContent='Página '+(offset/50+1);status('');
  }
  async function detalle(id) {
    status('Abriendo ficha…');
    const {pedido:x}=await call('detalle',null,{id});selected=x;
    $('#detalle').dataset.id=x.id;
    document.querySelectorAll('[data-id]').forEach(b=>b.setAttribute('aria-current',b.dataset.id===x.id));
    $('#detalle').innerHTML=`<div><span class="control__etq">SOLICITUD</span><h2 class="num">${esc(x.folio)}</h2><p class="control__dato">${esc(fecha(x.created_at))} · ${x.total} piezas</p></div>
      ${x.items.map((p,i)=>`<article class="control__item"><b>${esc(p.nombre)} · ${esc(p.color)}</b><p>${p.piezas} piezas · ${esc(p.tecnica)} · ${esc(p.zona)}${p.cm?' · logo '+p.cm+' cm':''}</p>${p.medidas?`<p>${esc(p.medidas)} · ${esc(p.detalleMedidas)}</p>`:''}${p.sku?`<p><b>SKU ZAIN:</b> ${esc(p.sku)}</p>`:""}${p.fabricante?`<p><b>Referencia interna:</b> ${esc(p.fabricante)} · ${esc(p.codigoFabricante)} · ${esc(p.silueta)}<br>${esc(p.tejido)} · ${esc(p.gramaje)} g/m² · ${esc(p.composicion)}</p>`:""}${p.renderOrientativo?`<p>Vista orientativa; el tamaño y el acabado se confirman antes de producir.</p>`:""}${p.tallas?`<p>${esc(p.tallasEtq)}: ${esc(p.tallas)}</p>`:''}<p>Logo: ${esc(p.logo)}</p>${p.colorLogo?`<p>Color: ${esc(p.colorLogo)}</p>`:''}${p.pantone?`<p>Pantone de referencia: ${esc(p.pantone)}</p>`:''}${p.notas?`<p>Cliente: ${esc(p.notas)}</p>`:''}<div id="render-${i}"></div>${x.archivos.filter(f=>f.item===i).map(f=>`<button class="btn-texto" type="button" data-archivo="${i}" data-kind="${f.kind}">Descargar ${f.kind==='logo'?'logo original: '+esc(f.name):'render PNG'}</button>`).join('')}</article>`).join('')}
      <div><button class="btn btn--linea" type="button" id="enlaceCliente">Copiar enlace para el cliente</button><input id="urlCliente" aria-label="Enlace de seguimiento del cliente" readonly hidden><p id="estadoEnlace" role="status"></p></div>
      <form id="editar" class="control__editar"><label>Estado<select id="estadoPedido">${Object.entries(labels).map(([k,v])=>`<option value="${k}" ${x.estado===k?'selected':''}>${v}</option>`).join('')}</select></label><label>Notas del equipo<textarea id="notasEquipo" maxlength="5000">${esc(x.notas_internas)}</textarea></label><button class="btn btn--azul" type="submit">Guardar cambios</button><p id="estadoFicha" role="status"></p></form><button class="btn-texto" type="button" id="exportarFicha">Exportar ficha (JSON)</button>`;
    status('');
    if(innerWidth<800)$('#detalle').scrollIntoView({behavior:'smooth',block:'start'});
    for(const f of x.archivos.filter(f=>f.kind==='render')) {
      try{const data=await call('archivo',{id:x.id,item:f.item,kind:'render'});if(selected?.id!==x.id)break;const img=new Image();img.alt='Render de '+x.items[f.item].nombre;img.src=data.url;$('#render-'+f.item).appendChild(img);}catch{if(selected?.id===x.id)$('#render-'+f.item).textContent='El render está disponible para descargar al reintentar.';}
    }
  }
  $('#salir').addEventListener('click',()=>{salir();status('Sesión cerrada.');});
  $('#login').addEventListener('submit',async e=>{e.preventDefault();$('#entrar').disabled=true;status('Entrando…');try{await auth({email:$('#correo').value.trim(),password:$('#password').value},'password');$('#password').value='';await cargar();if(location.hash.length>1)await detalle(location.hash.slice(1));}catch(er){salir();status(er.message,true);}finally{$('#entrar').disabled=!config?.activo;}});
  $('#filtros').addEventListener('submit',e=>{e.preventDefault();offset=0;cargar().catch(er=>status(er.message,true));});
  $('#recargar').addEventListener('click',()=>cargar().catch(er=>status(er.message,true)));
  $('#anterior').addEventListener('click',()=>{offset=Math.max(0,offset-50);cargar().catch(er=>status(er.message,true));});
  $('#siguiente').addEventListener('click',()=>{offset+=50;cargar().catch(er=>status(er.message,true));});
  $('#lista').addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b){location.hash=b.dataset.id;detalle(b.dataset.id).catch(er=>status(er.message,true));}});
  $('#detalle').addEventListener('submit',async e=>{if(e.target.id!=='editar')return;e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;try{const data=await call('actualizar',{id:selected.id,version:selected.version,estado:$('#estadoPedido').value,notas:$('#notasEquipo').value});selected=data.pedido;$('#estadoFicha').textContent='Cambios guardados.';await cargar();}catch(er){$('#estadoFicha').textContent=er.message;}finally{button.disabled=false;}});
  $('#detalle').addEventListener('click',async e=>{
    const link=e.target.closest('#enlaceCliente');
    if(link){const id=selected.id;link.disabled=true;try{const data=await call('enlace',{id});if(selected?.id!==id)return;const input=$('#urlCliente');input.value=data.url;input.hidden=false;try{await navigator.clipboard.writeText(data.url);$('#estadoEnlace').textContent='Enlace copiado. Muestra solo esta solicitud y su estado; no incluye notas del equipo.';}catch{input.focus();input.select();$('#estadoEnlace').textContent='Copia el enlace del campo para compartirlo con el cliente.';}}catch(er){status(er.message,true);}finally{link.disabled=false;}}
    const b=e.target.closest('[data-archivo]');
    if(b){b.disabled=true;try{const data=await call('archivo',{id:selected.id,item:Number(b.dataset.archivo),kind:b.dataset.kind,descarga:true});const a=document.createElement('a');a.href=data.url;a.rel='noopener noreferrer';a.download=data.name||'render.png';a.click();}catch(er){status(er.message,true);}finally{b.disabled=false;}}
    if(e.target.closest('#exportarFicha')){const blob=new Blob([JSON.stringify({schema:1,pedido:selected},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=selected.folio+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
  });
  $('#estadoFiltro').insertAdjacentHTML('beforeend',Object.entries(labels).map(([k,v])=>`<option value="${k}">${v}</option>`).join(''));
  call('config').then(async x=>{config=x;if(!x.activo){status('El panel todavía está en preparación. El acceso se habilitará cuando esté conectado.');$('#entrar').textContent='Acceso pendiente';return;}$('#entrar').disabled=false;$('#entrar').textContent='Entrar al panel';if(session){try{await cargar();if(location.hash.length>1)await detalle(location.hash.slice(1));}catch(er){salir();status(er.message,true);}}}).catch(()=>{status('No se pudo conectar con ZAIN. Intenta de nuevo.',true);$('#entrar').textContent='Acceso no disponible';});
})();
