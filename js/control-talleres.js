(() => {
'use strict';
const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const call=(op,b,extra)=>window.ZAINEquipo.call(op,b,extra);
let epoch=0,talleres=[],busy=false;
$('.control__secciones').insertAdjacentHTML('beforeend','<button type="button" id="verTalleres" aria-pressed="false">Talleres</button>');
$('#trabajo').insertAdjacentHTML('beforeend','<section id="seccionTalleres" hidden><div class="control__titulo"><div><h1>Trabajo en equipo.</h1><p>Accesos separados para bordado, DTF y serigrafía.</p></div><button type="button" class="btn btn--linea" id="recargarTalleres">↻ Actualizar</button></div><p class="control__dato">Autoriza el correo del taller y crea su cuenta en Supabase Auth con ese mismo correo. Comparte /taller-zain. Cada taller ve únicamente las partidas que le asignas. No se envían correos ni WhatsApp automáticamente.</p><form id="formTallerNuevo" class="control__tallerform"><label>Nombre del taller<input name="nombre" required maxlength="120"></label><label>Correo autorizado<input name="email" type="email" required maxlength="254"></label><label>Técnica<select name="tecnica"><option>Bordado</option><option>DTF</option><option>Serigrafía</option></select></label><label><input type="checkbox" name="principal">Asignar automáticamente al confirmar pedidos de esta técnica</label><button class="btn btn--azul">Autorizar taller</button></form><p id="estadoTalleres" role="status"></p><div id="listaTalleres" class="control__tallergrid"></div></section>');
async function load(){
 const turn=epoch,data=await call('talleres-lista');if(turn!==epoch)return;talleres=data.talleres;
 $('#listaTalleres').innerHTML=talleres.map(t=>'<article class="control__tallercard"><h2>'+esc(t.nombre)+'</h2><p>'+esc(t.tecnica)+'</p><p>'+esc(t.email)+'</p><p>'+(t.activo?'Acceso activo':'Acceso suspendido')+(t.principal&&t.activo?' · Taller principal':'')+'</p><div class="control__talleracciones"><button type="button" class="btn btn--linea" data-acceso="'+esc(t.id)+'">'+(t.activo?'Suspender acceso':'Reactivar acceso')+'</button><button type="button" class="btn btn--linea" data-principal="'+esc(t.id)+'">'+(t.principal?'Quitar asignación automática':'Usar al confirmar')+'</button></div></article>').join('')||'<div class="control__vacio"><h2>Aún no hay talleres autorizados</h2><p>Agrega su correo cuando lo tengas. Hasta entonces, nadie nuevo puede entrar.</p></div>';
 $('#formTallerNuevo').hidden=!data.habilitado;$('#estadoTalleres').textContent=data.habilitado?'Las asignaciones automáticas se aplican en las próximas confirmaciones.':'El acceso de talleres está pendiente de configuración.';
}
const failed=e=>$('#estadoTalleres').textContent=e.message;
$('#verTalleres').addEventListener('click',()=>{for(const id of ['seccionPedidos','seccionCatalogo'])$('#'+id).hidden=true;$('#seccionTalleres').hidden=false;for(const id of ['verPedidos','verCatalogo']){$('#'+id).classList.remove('on');$('#'+id).setAttribute('aria-pressed','false');}$('#verTalleres').classList.add('on');$('#verTalleres').setAttribute('aria-pressed','true');history.replaceState(null,'','#talleres');load().catch(failed);});
for(const id of ['verPedidos','verCatalogo'])$('#'+id).addEventListener('click',()=>{$('#seccionTalleres').hidden=true;$('#verTalleres').classList.remove('on');$('#verTalleres').setAttribute('aria-pressed','false');});
$('#recargarTalleres').addEventListener('click',()=>load().catch(failed));
$('#formTallerNuevo').addEventListener('submit',async e=>{
 e.preventDefault();if(busy)return;busy=true;const turn=epoch,f=e.target,b=f.querySelector('button');b.disabled=true;
 try{await call('talleres-guardar',{nombre:f.elements.nombre.value.trim(),email:f.elements.email.value.trim(),tecnica:f.elements.tecnica.value,activo:true,principal:f.elements.principal.checked});if(turn!==epoch)return;f.reset();await load();}catch(er){if(turn===epoch)failed(er);}finally{busy=false;b.disabled=false;}
});
$('#listaTalleres').addEventListener('click',async e=>{
 const b=e.target.closest('[data-acceso],[data-principal]');if(!b||busy)return;const t=talleres.find(t=>t.id===(b.dataset.acceso||b.dataset.principal));if(!t)return;const turn=epoch;busy=true;b.disabled=true;
 try{await call('talleres-guardar',{id:t.id,version:t.version,nombre:t.nombre,email:t.email,tecnica:t.tecnica,activo:b.dataset.acceso?!t.activo:t.activo,principal:b.dataset.principal?!t.principal:t.principal});if(turn===epoch)await load();}catch(er){if(turn===epoch)failed(er);}finally{busy=false;b.disabled=false;}
});
addEventListener('zain:pedido-abierto',async e=>{
 const x=e.detail,turn=epoch;if(x.archivado_at||!['confirmado','produccion'].includes(x.estado))return;
 try{
  const [data,tasks]=await Promise.all([call('talleres-lista'),call('talleres-partidas',null,{id:x.id})]);
  if(turn!==epoch||!$('#ficha').open||$('#detalle').dataset.pedido!==x.id||!data.habilitado)return;
  const html=x.items.map((p,i)=>{
   const options=data.talleres.filter(t=>t.activo&&t.tecnica===p.tecnica),task=tasks.partidas.find(t=>t.indice===i);
   return '<form class="control__asignar" data-partida="'+i+'"><h3>'+esc(p.nombre)+' · '+esc(p.tecnica)+'</h3><p>'+Number(p.piezas)+' piezas'+(task?' · Taller: '+esc(data.talleres.find(t=>t.id===task.taller_id)?.nombre||'Suspendido')+' · '+esc(task.estado):' · Sin asignar')+'</p>'+(options.length?'<label>Taller<select name="taller">'+options.map(t=>'<option value="'+t.id+'"'+(task?.taller_id===t.id?' selected':'')+'>'+esc(t.nombre)+'</option>').join('')+'</select></label><button class="btn btn--linea">Asignar partida</button>':'<p class="control__dato">Autoriza un taller de esta técnica desde Talleres.</p>')+'<p role="status"></p></form>';
  }).join('');
  $('#detalle').insertAdjacentHTML('beforeend','<section id="asignarTalleres"><h2>Asignaciones a talleres</h2><p>Cada taller recibe solo su partida y sus archivos.</p>'+html+'</section>');
  $('#asignarTalleres').addEventListener('submit',async ev=>{ev.preventDefault();const f=ev.target,b=f.querySelector('button');if(!b)return;b.disabled=true;try{await call('talleres-asignar',{id:x.id,indice:Number(f.dataset.partida),taller_id:f.elements.taller.value});if(turn===epoch)f.querySelector('[role=status]').textContent='Partida asignada.';}catch(er){if(turn===epoch)f.querySelector('[role=status]').textContent=er.message;}finally{b.disabled=false;}});
 }catch{}
});
addEventListener('zain:equipo-listo',()=>{if(location.hash==='#talleres')$('#verTalleres').click();});
addEventListener('zain:equipo-salio',()=>{epoch++;talleres=[];$('#seccionTalleres').hidden=true;$('#listaTalleres').replaceChildren();$('#formTallerNuevo').reset();});
})();
