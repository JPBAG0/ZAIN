(() => {
'use strict';
const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const api=window.ZAIN.pedidosApi||'/api/pedidos',labels={pendiente:'Nuevo trabajo',aceptado:'Aceptado',en_proceso:'En proceso',listo:'Listo'};
let config,session=null,epoch=0,refreshing=null,offset=0,loadVersion=0;
try{session=JSON.parse(sessionStorage.getItem('zain-taller'));}catch{}
const status=s=>$('#estadoPanel').textContent=s;
function exit(){epoch++;loadVersion++;session=null;sessionStorage.removeItem('zain-taller');$('#acceso').hidden=false;$('#trabajo').hidden=true;$('#salir').hidden=true;$('#trabajos').replaceChildren();$('#password').value='';}
async function auth(body,grant){
 const turn=epoch,r=await fetch(config.supabaseUrl+'/auth/v1/token?grant_type='+grant,{method:'POST',headers:{apikey:config.publishableKey,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 if(!r.ok)throw Error(grant==='password'?'Revisa tu correo y contraseña.':'Tu sesión terminó.');const data=await r.json();if(turn!==epoch)throw Error('Sesión cerrada.');session=data;sessionStorage.setItem('zain-taller',JSON.stringify(data));
}
async function call(op,body,extra={},retry=true){
 const turn=epoch,r=await fetch(api+'?'+new URLSearchParams({op,...extra}),{method:body?'POST':'GET',headers:{...(session?{Authorization:'Bearer '+session.access_token}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});
 if(turn!==epoch)throw Error('Sesión cerrada.');
 if(r.status===401&&retry&&session?.refresh_token){if(!refreshing)refreshing=auth({refresh_token:session.refresh_token},'refresh_token').finally(()=>refreshing=null);try{await refreshing;return call(op,body,extra,false);}catch(e){exit();throw e;}}
 const data=await r.json();if(!r.ok){if(r.status===401||r.status===403)exit();throw Error(data.error||'No se pudo consultar el trabajo.');}return data;
}
async function load(){
 const turn=++loadVersion;status('Actualizando tus trabajos…');const data=await call('taller-lista',null,{offset:String(offset)});if(turn!==loadVersion||!session)return;
 $('#acceso').hidden=true;$('#trabajo').hidden=false;$('#salir').hidden=false;$('#nombreTaller').textContent=data.taller.nombre+' · '+data.taller.tecnica;
 const newCount=data.trabajos.filter(t=>t.estado==='pendiente').length;$('#nuevos').textContent=newCount+(newCount===1?' trabajo nuevo':' trabajos nuevos')+' en esta página';$('#paginaTaller').textContent='Página '+(offset/20+1);$('#anteriorTaller').disabled=!offset;$('#siguienteTaller').disabled=!data.siguiente;
 $('#trabajos').innerHTML=data.trabajos.map(t=>{const p=t.item;
 return '<article class="control__tallercard"><p class="control__dato">'+esc(t.folio)+'</p><h2>'+esc(p.nombre)+'</h2><p>'+esc(p.color)+' · '+Number(p.piezas)+' piezas</p><p>'+esc(p.tecnica)+' · '+esc(p.zona)+(p.cm?' · logo '+p.cm+' cm':'')+'</p>'+(p.tallas?'<p>Tallas: '+esc(p.tallas)+'</p>':'')+(p.sku?'<p>SKU ZAIN: '+esc(p.sku)+'</p>':'')+(p.medidas?'<p>'+esc(p.medidas)+'</p>':'')+'<p>'+esc(p.logo)+'</p><p>'+esc(p.colorLogo)+(p.pantone?' · Pantone de referencia '+esc(p.pantone):'')+'</p><div data-vista="'+t.id+'">'+(t.archivos.some(f=>f.kind==='render')?'Preparando vista del diseño…':'Sin render adjunto.')+'</div><div class="control__talleracciones">'+t.archivos.map(f=>'<button type="button" class="btn btn--linea" data-archivo="'+t.id+'" data-kind="'+f.kind+'">Descargar '+(f.kind==='logo'?'logo original':'render')+'</button>').join('')+'</div><form data-trabajo="'+t.id+'" data-version="'+t.version+'"><label>Estado del taller<select name="estado">'+Object.entries(labels).map(([k,v])=>'<option value="'+k+'"'+(k===t.estado?' selected':'')+'>'+v+'</option>').join('')+'</select></label><button class="btn btn--azul">Guardar estado</button><p role="status"></p></form></article>';
 }).join('')||'<div class="control__vacio"><h2>Tu bandeja está al día</h2><p>Los trabajos aparecerán cuando ZAIN confirme el pedido y te asigne tu partida.</p></div>';
 status('El estado del taller informa al equipo ZAIN; no modifica el estado del pedido del cliente.');
 for(const t of data.trabajos.filter(t=>t.archivos.some(f=>f.kind==='render'))){try{const f=await call('taller-archivo',{id:t.id,kind:'render'});if(turn!==loadVersion)return;const img=new Image();img.alt='Diseño de '+t.item.nombre;img.referrerPolicy='no-referrer';img.src=f.url;$('[data-vista="'+t.id+'"]').replaceChildren(img);}catch{if(turn===loadVersion)$('[data-vista="'+t.id+'"]').textContent='Descarga el render para revisarlo.';}}
}
$('#login').addEventListener('submit',async e=>{e.preventDefault();$('#entrar').disabled=true;try{await auth({email:$('#correo').value.trim(),password:$('#password').value},'password');$('#password').value='';offset=0;await load();}catch(er){exit();status(er.message);}finally{$('#entrar').disabled=!config?.activo;}});
$('#salir').addEventListener('click',()=>{exit();status('Sesión cerrada.');});
$('#recargarTaller').addEventListener('click',()=>load().catch(e=>status(e.message)));
$('#anteriorTaller').addEventListener('click',()=>{offset=Math.max(0,offset-20);load().catch(e=>status(e.message));});
$('#siguienteTaller').addEventListener('click',()=>{offset+=20;load().catch(e=>status(e.message));});
$('#trabajos').addEventListener('submit',async e=>{e.preventDefault();const f=e.target,b=f.querySelector('button'),turn=epoch;b.disabled=true;try{await call('taller-actualizar',{id:f.dataset.trabajo,version:Number(f.dataset.version),estado:f.elements.estado.value});if(turn===epoch)await load();}catch(er){if(turn===epoch)f.querySelector('[role=status]').textContent=er.message;}finally{b.disabled=false;}});
$('#trabajos').addEventListener('click',async e=>{const b=e.target.closest('[data-archivo]');if(!b)return;const turn=epoch;b.disabled=true;try{const data=await call('taller-archivo',{id:b.dataset.archivo,kind:b.dataset.kind,descarga:true});if(turn!==epoch)return;const a=document.createElement('a');a.href=data.url;a.rel='noopener noreferrer';a.target='_blank';a.referrerPolicy='no-referrer';a.click();}catch(er){status(er.message);}finally{b.disabled=false;}});
(async()=>{try{const r=await fetch(api+'?op=config',{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('No se pudo preparar el acceso.');config=await r.json();$('#entrar').disabled=!config.activo;$('#entrar').textContent='Entrar a mi taller';if(session)await load();}catch(e){exit();status(e.message);}})();
})();
