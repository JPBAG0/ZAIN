(() => {
'use strict';
const $=s=>document.querySelector(s),api=window.ZAIN.pedidosApi||'/api/pedidos';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={nuevo:'Por revisar',contactado:'Contactado',cotizado:'Cotizado',aceptado:'Aceptada · Anticipo pendiente',confirmado:'Confirmado',produccion:'En producción',entregado:'Entregado',cancelado:'Cancelado'};
const date=x=>new Date(x).toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric',timeZone:'America/Mexico_City'});
const fecha=x=>new Date(x).toLocaleString('es-MX',{timeZone:'America/Mexico_City'});
const chip=x=>'<span class="control__estadochip control__estadochip--'+(labels[x]?x:'nuevo')+'">'+esc(labels[x]||x)+'</span>';
const PASOS=[['nuevo','Solicitud'],['cotizado','Cotización'],['aceptado','Aceptada'],['confirmado','Anticipo'],['produccion','Producción'],['entregado','Entregado'],['cerrado','Cerrado']];
const ORDEN={nuevo:0,contactado:0,cotizado:1,aceptado:2,confirmado:3,produccion:4,entregado:6};
const SIGUIENTE={nuevo:['Escribe el precio y publica la cotización','cotizacion'],contactado:['Escribe el precio y publica la cotización','cotizacion'],cotizado:['Espera la aceptación o regístrala si el cliente aceptó por WhatsApp','cobro'],aceptado:['Registra el anticipo cuando lo recibas','cobro'],confirmado:['Asigna el taller y pasa el pedido a producción','resumen'],produccion:['Cuando lo entregues, márcalo como entregado','resumen'],entregado:['Registra los gastos y cierra el pedido','gastos']};
const AVANZAR={confirmado:['produccion','Pasar a producción'],produccion:['entregado','Marcar como entregado']};
const PESTANAS=[['resumen','Pedido'],['cotizacion','Cotización'],['cobro','Cobro'],['gastos','Gastos']];
const pestanaGuardada=new Map();
function pasosHTML(x){
 if(x.estado==='cancelado')return '<div class="ficha-siguiente ficha-siguiente--cancelado">Pedido cancelado.</div>';
 const n=ORDEN[x.estado]??0,[texto,destino]=SIGUIENTE[x.estado]||SIGUIENTE.nuevo;
 return '<ol class="ficha-pasos" aria-label="Avance del pedido">'+PASOS.map(([k,t],i)=>'<li data-paso="'+k+'" class="'+(i<n?'hecho':i===n?'actual':'')+'"><span>'+(i<n?'✓':i+1)+'</span>'+t+'</li>').join('')+'</ol><button type="button" class="ficha-siguiente" data-ir="'+destino+'"><small>Siguiente paso</small><b>'+esc(texto)+'</b><i aria-hidden="true">→</i></button>';
}
function verPestana(nombre){
 const d=$('#detalle');d.dataset.ver=nombre;if(selected)pestanaGuardada.set(selected.id,nombre);
 for(const b of d.querySelectorAll('[data-pestana]')){const on=b.dataset.pestana===nombre;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on));}
 $('#ficha').scrollTop=0;
}
const imagenesModulo=import('./pedido-imagen.js?v=1'),recursosRender=[];
const liberarRenders=()=>{dispatchEvent(new CustomEvent('zain:imagenes-liberar'));for(const r of recursosRender.splice(0))r.liberar();};
addEventListener('zain:equipo-salio',liberarRenders);
let config,session=null,offset=0,selected=null,refreshing=null,trash=false,revision=0,detailRevision=0,deleteTarget=null,authEpoch=0;
try{session=JSON.parse(sessionStorage.getItem('zain-equipo'));}catch{}
const status=(txt,error=false)=>{$('#estadoPanel').textContent=txt;$('#estadoPanel').classList.toggle('error',error);};
const persist=()=>{try{sessionStorage.setItem('zain-equipo',JSON.stringify(session));}catch{}};
async function auth(body,grant){
 const epoch=authEpoch;
 const r=await fetch(config.supabaseUrl+'/auth/v1/token?grant_type='+grant,{method:'POST',headers:{apikey:config.publishableKey,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 if(!r.ok){const e=new Error(grant==='password'?'Revisa tu correo y contraseña.':'Tu sesión terminó. Vuelve a entrar.');e.auth=grant!=='password';throw e;}
 const data=await r.json();if(epoch!==authEpoch){const e=new Error('Sesión cerrada.');e.auth=true;throw e;}session=data;persist();return session;
}
async function call(op,body,extra={},retry=true){
 const q=new URLSearchParams({op,...extra});
 const r=await fetch(api+'?'+q,{method:body?'POST':'GET',headers:{...(session?{Authorization:'Bearer '+session.access_token}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});
 if(r.status===401&&retry&&session?.refresh_token){if(!refreshing)refreshing=auth({refresh_token:session.refresh_token},'refresh_token').finally(()=>refreshing=null);await refreshing;return call(op,body,extra,false);}
 const data=await r.json();if(!r.ok){const e=new Error(data.error||'No se pudo consultar el pedido.');e.auth=r.status===401||r.status===403;throw e;}return data;
}
window.ZAINEquipo={call,uploadGeneral:async(archivo,blob)=>{
 const send=()=>fetch(api+'?op=generales-comprobante&archivo='+encodeURIComponent(archivo),{method:'POST',headers:{Authorization:'Bearer '+session.access_token,'Content-Type':blob.type},body:blob,signal:AbortSignal.timeout(45000)});
 let r=await send();if(r.status===401&&session?.refresh_token){await auth({refresh_token:session.refresh_token},'refresh_token');r=await send();}const d=await r.json();if(!r.ok)throw Error(d.error||'No se pudo guardar el comprobante.');return d;
},uploadGasto:async(id,archivo,blob)=>{
 const send=()=>fetch(api+'?op=gastos-comprobante&id='+encodeURIComponent(id)+'&archivo='+encodeURIComponent(archivo),{method:'POST',headers:{Authorization:'Bearer '+session.access_token,'Content-Type':blob.type},body:blob,signal:AbortSignal.timeout(45000)});
 let r=await send();if(r.status===401&&session?.refresh_token){await auth({refresh_token:session.refresh_token},'refresh_token');r=await send();}const d=await r.json();if(!r.ok)throw Error(d.error||'No se pudo guardar el comprobante.');return d;
},upload:async(id,blob)=>{
 const send=()=>fetch(api+'?op=catalogo-foto&id='+encodeURIComponent(id),{method:'POST',headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'image/webp'},body:blob,signal:AbortSignal.timeout(45000)});
 let r=await send();if(r.status===401&&session?.refresh_token){await auth({refresh_token:session.refresh_token},'refresh_token');r=await send();}
 const d=await r.json();if(!r.ok)throw Error(d.error||'No se pudo subir la foto.');return d;
}};

function closeDetail(){liberarRenders();detailRevision++;selected=null;if($('#ficha').open)$('#ficha').close();history.replaceState(null,'',location.pathname+location.search);}
function salir(){authEpoch++;revision++;closeDetail();if($('#confirmacion').open)$('#confirmacion').close();session=null;try{sessionStorage.removeItem('zain-equipo');}catch{}$('#trabajo').hidden=true;$('#acceso').hidden=false;$('#salir').hidden=true;$('#equipo').textContent='';$('#lista').replaceChildren();$('#resumen').replaceChildren();$('#resumenFinanciero')?.replaceChildren();$('#detalle').replaceChildren();dispatchEvent(new CustomEvent('zain:equipo-salio'));}
const failed=er=>{if(er.auth)salir();status(er.message||'No se pudo conectar. Prueba Actualizar.',true);};
function vistas(){
 $('#activos').classList.toggle('on',!trash);$('#activos').setAttribute('aria-pressed',String(!trash));
 $('#papelera').classList.toggle('on',trash);$('#papelera').setAttribute('aria-pressed',String(trash));
}
function paintSummary(s){
 const cards=[['Solicitudes esta semana',s.solicitudes_semana,'Desde el lunes · hora CDMX','semana'],
 ['Por revisar',s.por_revisar,'Solicitudes nuevas por atender','nuevo'],
 ['Confirmados',s.confirmados,'Pendientes de producción','confirmado'],
 ['En producción',s.produccion,'Trabajo en curso','produccion']];
 $('#resumen').innerHTML=cards.map(x=>'<button type="button" class="control__tarjeta" data-resumen="'+x[3]+'"><span>'+x[0]+'</span><strong>'+Number(x[1]||0).toLocaleString('es-MX')+'</strong><small>'+x[2]+'</small></button>').join('');
 $('#cuentaPapelera').textContent=s.papelera||0;
 $('#fechaPanel').textContent=date(new Date())+' · '+Number(s.activos||0)+' solicitudes activas · '+Number(s.entregados||0)+' entregadas · '+Number(s.anticipos_pendientes||0)+' anticipos pendientes';
}
async function cargar(message=''){
 const turn=++revision;status('Actualizando pedidos…');
 const [list,stats]=await Promise.all([call('lista',null,{offset:String(offset),q:$('#buscar').value,estado:$('#estadoFiltro').value,periodo:$('#periodo').value,papelera:String(trash)}),call('resumen')]);
 if(turn!==revision||!session)return;
 const entering=!$('#acceso').hidden;
 $('#acceso').hidden=true;$('#trabajo').hidden=false;$('#salir').hidden=false;
 if(entering)window.scrollTo({top:0,behavior:'auto'});
 $('#equipo').textContent=list.equipo.nombre||'Equipo ZAIN';
 paintSummary(stats.resumen);vistas();
 const money=n=>n==null?'Pendiente':new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(n/100);
 let resumenFin=$('#resumenFinanciero');if(!resumenFin){resumenFin=document.createElement('section');resumenFin.id='resumenFinanciero';resumenFin.className='finanzas-bandeja';$('#lista').before(resumenFin);}
 resumenFin.hidden=!list.finanzas;
 if(list.finanzas){const f=list.finanzas;
 if(f.version_ventas!==1)resumenFin.innerHTML='<p class="cot-alerta">Falta aplicar la actualización de ventas reales en el servidor.</p>';
 else resumenFin.innerHTML='<div class="bandeja-finanzas"><div><small>VENDIDO · con IVA</small><strong>'+money(f.vendido)+'</strong><span>'+Number(f.vendidos)+' pedidos con anticipo cubierto</span></div><div><small>POR COBRAR · con IVA</small><strong>'+money(f.por_cobrar)+'</strong><span>Vendido menos pagos verificados</span></div><div><small>EN NEGOCIACIÓN · con IVA</small><strong>'+money(f.en_negociacion)+'</strong><span>'+Number(f.negociacion_pedidos)+' solicitudes · '+Number(f.cotizaciones_modelos)+' cotizaciones por modelo sin cantidades'+(f.negociacion_sin_importe?' · '+Number(f.negociacion_sin_importe)+' sin total definido':'')+'</span></div></div><p>Solo pedidos activos con los filtros actuales; cancelados y papelera fuera. Negociación no se suma a ventas. Las cotizaciones por modelo se cuentan por folio/periodo y, al filtrar estado de pedido, se consultan en Cotizaciones.</p>'+
 (f.sin_anticipo?'<p class="cot-alerta">'+Number(f.sin_anticipo)+' pedidos confirmados, en producción o entregados sin anticipo demostrable; revisa sus pagos.</p>':'')+
 '<details class="cot-panel fin-cobranza"><summary>Por cobrar por pedido · '+f.por_cobrar_pedidos.length+'</summary>'+(f.por_cobrar_pedidos.length?'<div class="cot-tablewrap"><table><thead><tr><th>Pedido</th><th>Vendido con IVA</th><th>Cobrado</th><th>Por cobrar</th></tr></thead><tbody>'+f.por_cobrar_pedidos.map(p=>'<tr><th>'+esc(p.folio)+'</th><td data-label="Vendido con IVA">'+money(p.venta_total)+'</td><td data-label="Cobrado">'+money(p.cobrado)+'</td><td data-label="Por cobrar">'+money(p.saldo)+'</td></tr>').join('')+'</tbody></table></div>':'<p>Sin saldos pendientes con estos filtros.</p>')+'</details>'+
 '<div class="bandeja-finanzas"><div><small>Vendido sin IVA</small><strong>'+money(f.venta)+'</strong></div><div><small>Costo + gastos de vendidos</small><strong>'+money(f.costo)+'</strong></div><div><small>Utilidad'+(f.provisionales?' provisional':'')+' de vendidos</small><strong class="'+(f.utilidad<0?'gastos-negativo':'')+'">'+money(f.utilidad)+'</strong></div><div><small>Margen bruto de vendidos</small><strong>'+(f.utilidad==null||!f.venta?'—':(Math.round(f.utilidad/f.venta*1000)/10).toLocaleString('es-MX')+'%')+'</strong></div></div>';
 }
 // Por pedido: venta, material (real al cerrar; si no, el mayor entre cotizado y registrado), gastos extra, utilidad y margen bruto.
 const pct=(u,v)=>u==null||!v?'—':(Math.round(u/v*1000)/10).toLocaleString('es-MX')+'%';
 const material=f=>f.cerrado_at?f.base_real:f.base_estimada!=null?Math.max(f.base_estimada,f.base_real||0):f.base_real>0?f.base_real:null;
 const linea=f=>f?.venta==null?'<span class="pedido-card__cifras pedido-card__cifras--vacio">Sin cotización publicada</span>':'<span class="pedido-card__finanzas">'+[[f.vendido?'Vendido sin IVA':f.en_negociacion?'Cotizado sin IVA':'Importe cotizado',money(f.venta)],['Material',material(f)==null?'Sin capturar':money(material(f))],['Gastos',money(f.extras||0)],[f.vendido?'Utilidad':'Utilidad estimada',f.utilidad==null?'—':money(f.utilidad),f.utilidad<0],['Margen',pct(f.utilidad,f.venta),f.utilidad<0]].map(([k,v,neg])=>'<span><small>'+k+'</small><b class="'+(neg?'gastos-negativo':'')+'">'+v+'</b></span>').join('')+'</span>'+(f.venta!=null&&f.utilidad!=null?'<span class="pedido-card__nota">'+(f.provisional?'Provisional':'Cierre revisado')+'</span>':'');
 $('#lista').innerHTML=list.pedidos.length?list.pedidos.map(x=>'<button type="button" class="pedido-card control__fila" data-id="'+esc(x.id)+'" aria-label="Abrir pedido '+esc(x.folio)+'"><span class="pedido-card__cab"><b>'+esc(x.cliente||x.folio)+'</b>'+chip(x.estado)+'</span><span class="pedido-card__dato">'+(x.cliente?esc(x.folio)+' · ':'')+esc(date(x.created_at))+'</span><span class="pedido-card__desc">'+esc(x.resumen||'Selección personalizada')+' · <b>'+Number(x.total)+' piezas</b></span>'+linea(x.finanzas)+'</button>').join(''):'<div class="control__vacio"><h3>'+(trash?'La papelera está vacía':'No hay pedidos con estos filtros')+'</h3><p>'+(trash?'Los pedidos eliminados aparecen aquí.':'Prueba con otro estado o borra la búsqueda.')+'</p></div>';
 $('#anterior').disabled=!offset;$('#siguiente').disabled=!list.siguiente;
 $('#pagina').textContent='Página '+(offset/20+1)+(list.pedidos.length?' · '+list.pedidos.length+' pedidos':'');
 status(message);dispatchEvent(new CustomEvent('zain:equipo-listo'));
}
const itemHTML=(p,i,files)=>{
 const render=files.some(f=>f.item===i&&f.kind==='render');
 return '<article class="control__item"><div class="control__render" id="render-'+i+'">'+(render?'Cargando diseño…':'Sin render guardado')+'</div><div><h3>'+esc(p.nombre)+' · '+esc(p.color)+'</h3><p><b>'+Number(p.piezas)+' piezas</b> · '+esc(p.tecnica)+'</p><p>'+esc(p.zona)+(p.cm?' · logo de '+esc(p.cm)+' cm':'')+'</p>'+(p.tallas?'<p>Tallas: '+esc(p.tallas)+'</p>':'')+(p.sku?'<p>SKU ZAIN: '+esc(p.sku)+'</p>':'')+(p.medidas?'<p>'+esc(p.detalleMedidas||p.medidas)+'</p>':'')+'<p>Logo: '+esc(p.logo)+'</p>'+(p.colorLogo?'<p>Color del logo: '+esc(p.colorLogo)+'</p>':'')+(p.pantone?'<p>Pantone de referencia: '+esc(p.pantone)+'</p>':'')+(p.notas?'<p>Indicaciones: '+esc(p.notas)+'</p>':'')+('<p class="control__referencia"><b>Proveedor: '+esc(p.proveedor||p.fabricante||'Por registrar')+'</b><br><b>SKU proveedor: '+esc(p.skuProveedor||p.codigoFabricante||'Por registrar')+'</b></p>')+'<div class="control__archivos">'+files.filter(f=>f.item===i).map(f=>'<button type="button" data-archivo="'+i+'" data-kind="'+esc(f.kind)+'">'+(f.kind==='logo'?'Descargar logo':'Descargar render')+'</button>').join('')+'</div></div></article>';
};
async function detalle(id){
 const turn=++detailRevision;selected=null;$('#detalle').innerHTML='<p>Abriendo ficha del pedido…</p>';if(!$('#ficha').open)$('#ficha').showModal();document.documentElement.classList.add('sin-scroll');
 const {pedido:x}=await call('detalle',null,{id});if(turn!==detailRevision||!session)return;selected=x;$('#detalle').dataset.pedido=x.id;
 liberarRenders();const files=x.archivos||[];
 const cabecera='<div class="ficha-cab"><div class="control__fichatitulo"><h2>'+esc(x.cliente?.nombre||x.folio)+'</h2>'+chip(x.estado)+'</div><p class="control__dato">'+(x.cliente?.nombre?esc(x.folio)+' · ':'')+Number(x.total)+' piezas · recibido '+esc(date(x.created_at))+(x.cliente?.fecha?' · lo necesita el '+esc(new Date(x.cliente.fecha+'T12:00:00').toLocaleDateString('es-MX',{day:'numeric',month:'short'})):'')+'</p>'+(x.archivado_at?'<p class="control__retirado">En papelera desde '+esc(date(x.archivado_at))+'. Restaura el pedido para volver a atenderlo.</p>':pasosHTML(x))+'</div>'+(x.archivado_at?'':'<div class="ficha-pestanas" role="tablist">'+PESTANAS.map(([k,t])=>'<button type="button" role="tab" data-pestana="'+k+'">'+t+'</button>').join('')+'</div>');
 $('#detalle').innerHTML=cabecera+'<div class="ficha-resumen">'+(!x.archivado_at&&AVANZAR[x.estado]?'<button type="button" class="btn btn--azul ficha-avanzar" data-avanzar="'+AVANZAR[x.estado][0]+'">'+AVANZAR[x.estado][1]+'</button>':'')+x.items.map((p,i)=>itemHTML(p,i,files)).join('')+
 (!x.archivado_at?'<form id="editar" class="control__editar"><h3>Estado y notas</h3><label>Cambiar estado<select id="estadoPedido">'+Object.entries(labels).map(([k,v])=>'<option value="'+k+'"'+(x.estado===k?' selected':'')+'>'+v+'</option>').join('')+'</select></label><label>Notas del equipo<textarea id="notasEquipo" maxlength="5000" placeholder="Cotización, acuerdos y siguiente paso…">'+esc(x.notas_internas)+'</textarea></label><button class="btn btn--azul">Guardar estado y notas</button><p class="control__dato">El precio y la publicación están en la pestaña Cotización.</p><p id="estadoFicha" role="status"></p></form>':'')+
 '<div class="control__acciones">'+(!x.archivado_at?'<button type="button" class="btn btn--linea" id="enlaceCliente">Copiar enlace del cliente</button>':'')+'<button type="button" class="btn btn--linea" id="exportarFicha">Exportar ficha</button><button type="button" class="btn '+(x.archivado_at?'btn--azul':'control__btnpeligro')+'" id="'+(x.archivado_at?'restaurar':'eliminar')+'">'+(x.archivado_at?'Restaurar pedido':'Eliminar pedido')+'</button></div><input id="urlCliente" aria-label="Enlace del cliente" readonly hidden><p id="estadoEnlace" role="status"></p><section class="control__historial"><h3>Actividad del pedido</h3><div id="historial">Cargando actividad…</div></section></div>';
 verPestana(x.archivado_at?'resumen':pestanaGuardada.get(x.id)||SIGUIENTE[x.estado]?.[1]||'resumen');
 status('');
 const history=call('historial',null,{id:x.id}).then(data=>{if(turn!==detailRevision)return;$('#historial').innerHTML=data.historial.length?'<ol>'+data.historial.map(h=>'<li><small>'+esc(fecha(h.created_at))+'</small><b>'+esc(labels[h.estado_anterior]||h.estado_anterior)+' → '+esc(labels[h.estado_nuevo]||h.estado_nuevo)+'</b><p>'+esc(h.notas)+'</p></li>').join('')+'</ol>':'<p class="control__dato">Sin cambios registrados todavía.</p>';}).catch(()=>{if(turn===detailRevision)$('#historial').textContent='No se pudo cargar la actividad. Vuelve a abrir la ficha.';});
 const images=files.filter(f=>f.kind==='render').map(async f=>{try{const {cargarRender}=await imagenesModulo,recurso=await cargarRender(()=>call('archivo',{id:x.id,item:f.item,kind:'render'}));if(turn!==detailRevision){recurso.liberar();return;}recursosRender.push(recurso);recurso.imagen.alt='Diseño de '+x.items[f.item].nombre;$('#render-'+f.item)?.replaceChildren(recurso.imagen);}catch{if(turn===detailRevision)$('#render-'+f.item).textContent='No se pudo cargar el diseño. Vuelve a abrir el pedido para reintentar.';}});
 await Promise.all([history,...images]);if(turn===detailRevision)dispatchEvent(new CustomEvent('zain:pedido-abierto',{detail:x}));
}
$('#cerrarDetalle').addEventListener('click',closeDetail);
// Otras secciones (p. ej. Cotizaciones al crear un pedido) piden abrir una ficha.
addEventListener('zain:abrir-pedido',e=>{if(session&&/^[a-f0-9-]{36}$/i.test(e.detail||''))detalle(e.detail).catch(failed);});
$('#ficha').addEventListener('close',()=>{liberarRenders();document.documentElement.classList.remove('sin-scroll');detailRevision++;selected=null;history.replaceState(null,'',location.pathname+location.search);});
$('#ficha').addEventListener('click',e=>{if(e.target===$('#ficha')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDetail();}});
$('#salir').addEventListener('click',()=>{salir();status('Sesión cerrada.');});
$('#login').addEventListener('submit',async e=>{e.preventDefault();$('#entrar').disabled=true;status('Entrando…');const deepLink=location.hash.slice(1);try{await auth({email:$('#correo').value.trim(),password:$('#password').value},'password');$('#password').value='';await cargar();if(/^[a-f0-9-]{36}$/i.test(deepLink))await detalle(deepLink);}catch(er){salir();status(er.message,true);}finally{$('#entrar').disabled=!config?.activo;}});
$('#filtros').addEventListener('submit',e=>{e.preventDefault();offset=0;cargar().catch(failed);});
$('#recargar').addEventListener('click',()=>cargar().catch(failed));
addEventListener('zain:gastos-guardados',()=>cargar().catch(failed));
addEventListener('zain:pago-registrado',()=>cargar().then(()=>{if(selected)detalle(selected.id).catch(failed);}).catch(failed));
addEventListener('zain:ver-pestana',e=>verPestana(e.detail));
// La pestaña Gastos avisa si el pedido ya tiene cierre revisado: completar el último paso y quitar el aviso de cerrar.
addEventListener('zain:pedido-finanzas',e=>{const {id,cerrado,utilidad}=e.detail;if(!selected||selected.id!==id||!cerrado)return;const paso=$('#detalle [data-paso="cerrado"]');if(paso){paso.className='hecho';paso.querySelector('span').textContent='✓';}const box=$('#detalle .ficha-siguiente');if(box)box.outerHTML='<div class="ficha-siguiente ficha-siguiente--cerrado"><small>Pedido cerrado</small><b>✓ Cierre revisado'+(utilidad==null?'':' · utilidad final '+new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(utilidad/100))+'</b></div>';});
addEventListener('zain:cotizacion-publicada',()=>cargar().then(()=>{if(selected)detalle(selected.id).catch(failed);}).catch(failed));
$('#anterior').addEventListener('click',()=>{offset=Math.max(0,offset-20);cargar().catch(failed);});
$('#siguiente').addEventListener('click',()=>{offset+=20;cargar().catch(failed);});
$('#activos').addEventListener('click',()=>{trash=false;offset=0;vistas();cargar().catch(failed);});
$('#papelera').addEventListener('click',()=>{trash=true;offset=0;$('#estadoFiltro').value='';$('#periodo').value='';$('#buscar').value='';vistas();cargar().catch(failed);});
$('#resumen').addEventListener('click',e=>{const b=e.target.closest('[data-resumen]');if(!b)return;trash=false;offset=0;$('#buscar').value='';$('#estadoFiltro').value=b.dataset.resumen==='semana'?'':b.dataset.resumen;$('#periodo').value=b.dataset.resumen==='semana'?'semana':'';vistas();cargar().catch(failed);});
$('#lista').addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b){history.replaceState(null,'','#'+b.dataset.id);detalle(b.dataset.id).catch(failed);}});
$('#detalle').addEventListener('submit',async e=>{
 if(e.target.id!=='editar'||!selected)return;e.preventDefault();const x=selected,b=e.target.querySelector('button');b.disabled=true;
 try{const data=await call('actualizar',{id:x.id,version:x.version,estado:$('#estadoPedido').value,notas:$('#notasEquipo').value});if(selected?.id!==x.id)return;selected=data.pedido;await detalle(x.id);await cargar('Cambios guardados.');}catch(er){const s=$('#estadoFicha');if(s)s.textContent=er.message;else failed(er);}finally{b.disabled=false;}
});
$('#detalle').addEventListener('click',async e=>{
 const avanzar=e.target.closest('[data-avanzar]');if(avanzar&&$('#editar')){$('#estadoPedido').value=avanzar.dataset.avanzar;$('#editar').requestSubmit();return;}
 const tab=e.target.closest('[data-pestana],[data-ir]');if(tab){verPestana(tab.dataset.pestana||tab.dataset.ir);return;}
 if(!selected)return;const x=selected;
 if(e.target.closest('#eliminar')){deleteTarget={id:x.id,version:x.version,folio:x.folio};$('#textoEliminar').textContent='Vas a retirar '+x.folio+' de la bandeja y de la consulta del cliente.';$('#folioEliminar').value='';$('#folioEliminar').placeholder=x.folio;$('#errorEliminar').textContent='';$('#confirmacion').showModal();return;}
 const restore=e.target.closest('#restaurar');
 if(restore){restore.disabled=true;try{await call('archivar',{id:x.id,version:x.version,archivar:false});closeDetail();await cargar('Pedido restaurado.');}catch(er){failed(er);}finally{restore.disabled=false;}return;}
 const link=e.target.closest('#enlaceCliente');
 if(link){link.disabled=true;try{const data=await call('enlace',{id:x.id});if(selected?.id!==x.id)return;const input=$('#urlCliente');input.value=data.url;input.hidden=false;try{await navigator.clipboard.writeText(data.url);$('#estadoEnlace').textContent='Enlace copiado. No incluye notas internas.';}catch{input.focus();input.select();$('#estadoEnlace').textContent='Copia el enlace de este campo.';}}catch(er){failed(er);}finally{link.disabled=false;}}
 const b=e.target.closest('[data-archivo]');
 if(b){b.disabled=true;try{const data=await call('archivo',{id:x.id,item:Number(b.dataset.archivo),kind:b.dataset.kind,descarga:true});if(selected?.id!==x.id)return;const a=document.createElement('a');a.href=data.url;a.rel='noopener noreferrer';a.download=data.name||'render.png';a.click();}catch(er){failed(er);}finally{b.disabled=false;}}
 if(e.target.closest('#exportarFicha')){const blob=new Blob([JSON.stringify({schema:1,pedido:x},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=x.folio+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
});
$('#cancelarEliminar').addEventListener('click',()=>$('#confirmacion').close());
$('#confirmarEliminar').addEventListener('submit',async e=>{
 e.preventDefault();if(!deleteTarget)return;const x=deleteTarget,folio=$('#folioEliminar').value.trim();
 if(folio!==x.folio){$('#errorEliminar').textContent='Escribe el folio completo tal como aparece arriba.';return;}
 $('#confirmarMover').disabled=true;
 try{await call('archivar',{...x,archivar:true,folio});$('#confirmacion').close();closeDetail();await cargar('Pedido movido a papelera. Puedes restaurarlo.');}catch(er){$('#errorEliminar').textContent=er.message;}finally{$('#confirmarMover').disabled=false;}
});
$('#estadoFiltro').insertAdjacentHTML('beforeend',Object.entries(labels).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join(''));
const ETIQUETA_CORTA={...labels,aceptado:'Aceptada'};
$('#chipsEstado').innerHTML=[['','Todos'],...Object.keys(labels).filter(k=>k!=='contactado').map(k=>[k,ETIQUETA_CORTA[k]])].map(([k,t])=>'<button type="button" data-estado="'+k+'">'+t+'</button>').join('');
function marcarChips(){for(const b of $('#chipsEstado').children){const on=b.dataset.estado===$('#estadoFiltro').value&&!$('#periodo').value;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));}}
$('#chipsEstado').addEventListener('click',e=>{const b=e.target.closest('[data-estado]');if(!b)return;trash=false;offset=0;$('#estadoFiltro').value=b.dataset.estado;$('#periodo').value='';vistas();cargar().catch(failed);});
addEventListener('zain:equipo-listo',marcarChips);
const modulosListos=document.readyState==='loading'?new Promise(r=>addEventListener('DOMContentLoaded',r,{once:true})):Promise.resolve();
call('config').then(async x=>{await modulosListos;config=x;if(!x.activo){status('El acceso todavía está en preparación.');$('#entrar').textContent='Acceso pendiente';return;}$('#entrar').disabled=false;$('#entrar').textContent='Entrar al panel';if(session){const id=location.hash.slice(1);try{await cargar();if(/^[a-f0-9-]{36}$/i.test(id))await detalle(id);}catch(er){salir();status(er.message,true);}}}).catch(()=>{status('No se pudo conectar con ZAIN. Intenta de nuevo.',true);$('#entrar').textContent='Acceso no disponible';});
})();
