// Catálogos y listas de precios de proveedores (JP, 21-nov-2026) en Gestión → Catálogo: «que esté accesible» y que se
// abra en la página sin tener que buscarlo en Dropbox ni descargarlo cada vez.
// En computadora el PDF se abre en un visor dentro de Gestión y se queda en memoria durante la sesión; en el celular se
// abre en una pestaña nueva con el visor del teléfono (el de iPhone no muestra bien un PDF dentro de la página).
const $=s=>document.querySelector(s),api=(op,body,extra)=>window.ZAINEquipo.call(op,body,extra);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clave=s=>String(s||'').toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').trim();
const TIPO={catalogo:'Catálogo',precios:'Lista de precios',otro:'Otro'},ORDEN={catalogo:0,precios:1,otro:2};
const MIME_EXT={pdf:'application/pdf',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp'};
const FORMATO={'application/pdf':'PDF','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'Excel','image/jpeg':'Imagen','image/png':'Imagen','image/webp':'Imagen'};
const MAX=50*1024*1024;
const peso=b=>b>=1048576?(b/1048576).toLocaleString('es-MX',{maximumFractionDigits:1})+' MB':Math.max(1,Math.round(b/1024))+' KB';
const enCelular=()=>matchMedia('(max-width: 760px), (pointer: coarse)').matches;
let archivos=[],cargado=false,epoca=0,visorTurno=0,filtro='',editando=false,porQuitar=null,enEdicion=null,ocupado=false;
// PDF ya bajados en esta sesión (id → URL en memoria); se guardan los últimos 4.
const memoria=new Map();

// 22-nov-2026: dentro de la vista «Prendas» de Catálogo.
const titulo=$('#seccionCatalogo .control__titulo'),vistaPrendas=$('#vistaPrendas');
(vistaPrendas||titulo||$('#seccionCatalogo')).insertAdjacentHTML(vistaPrendas?'afterbegin':titulo?'afterend':'afterbegin',`<details id="provPanel" class="cot-panel prov-panel" open>
<summary><span><b>Catálogos y listas de precios de proveedores</b><small id="provCuenta"></small></span></summary>
<div class="prov-barra"><input id="provBuscar" type="search" placeholder="Buscar proveedor o archivo" aria-label="Buscar catálogo o lista de precios" autocomplete="off"><button type="button" id="provSubir" class="btn btn--linea">+ Subir archivo</button><button type="button" id="provEditar" class="btn-texto" aria-pressed="false">Editar lista</button></div>
<p id="provEstado" class="control__estado" role="status" aria-live="polite"></p>
<form id="provForm" class="prov-form" hidden novalidate><h3 id="provFormTitulo">Subir catálogo o lista de precios</h3><div class="prov-campos">
<label>Proveedor<input name="proveedor" list="provNombres" required minlength="2" maxlength="80" autocomplete="off" placeholder="Playerytees"></label><datalist id="provNombres"></datalist>
<label>Tipo<select name="tipo"><option value="catalogo">Catálogo</option><option value="precios">Lista de precios</option><option value="otro">Otro</option></select></label>
<label>Nombre<input name="titulo" required minlength="2" maxlength="120" autocomplete="off" placeholder="Catálogo 2026"></label>
<label data-prov-archivo>Archivo (PDF, Excel o imagen · hasta 50 MB)<input name="archivo" type="file" accept="application/pdf,.pdf,.xlsx,image/jpeg,image/png,image/webp"></label></div>
<label>Nota (opcional)<input name="nota" maxlength="300" autocomplete="off" placeholder="Vigente desde enero 2026"></label>
<p id="provFormEstado" class="prov-form-estado" role="status" aria-live="polite"></p>
<div class="prov-botones"><button type="button" class="btn btn--linea" data-prov-cancelar>Cancelar</button><button type="submit" class="btn btn--azul">Guardar</button></div></form>
<div id="provLista" class="prov-lista" aria-live="polite"></div>
</details>`);
document.body.insertAdjacentHTML('beforeend',`<dialog id="provVisor" class="prov-visor" aria-labelledby="provVisorTitulo"><header><div><small id="provVisorProveedor"></small><b id="provVisorTitulo"></b></div><a id="provVisorPestana" class="btn-texto" target="_blank" rel="noopener noreferrer">Abrir en pestaña nueva</a><button type="button" id="provVisorCerrar" class="prov-visor-cerrar" aria-label="Cerrar">✕</button></header><div class="prov-visor-cuerpo"><p id="provVisorEstado">Abriendo…</p><iframe id="provVisorMarco" title="Archivo del proveedor" hidden></iframe></div></dialog>`);

const avisar=t=>{$('#provEstado').textContent=t||'';};
async function cargar(forzar=false){
 if(cargado&&!forzar)return;const turno=++epoca;
 if(!cargado)$('#provLista').innerHTML='<p class="cot-ayuda">Cargando catálogos…</p>';
 try{const r=await api('proveedores-archivos');if(turno!==epoca)return;archivos=r.archivos||[];cargado=true;pintar();}
 catch(e){if(turno===epoca)$('#provLista').innerHTML='<p class="cot-ayuda">No se pudieron cargar los catálogos: '+esc(e.message)+'</p>';}
}
function grupos(){
 const q=clave(filtro),m=new Map();
 for(const a of archivos){if(q&&!clave(a.proveedor+' '+a.titulo+' '+TIPO[a.tipo]).includes(q))continue;const k=a.proveedor;if(!m.has(k))m.set(k,[]);m.get(k).push(a);}
 return [...m.entries()].sort((a,b)=>a[0].localeCompare(b[0],'es')).map(([p,l])=>[p,l.sort((a,b)=>ORDEN[a.tipo]-ORDEN[b.tipo]||a.titulo.localeCompare(b.titulo,'es'))]);
}
function pintar(){
 $('#provCuenta').textContent=archivos.length?archivos.length+(archivos.length===1?' archivo':' archivos')+' · '+new Set(archivos.map(a=>a.proveedor)).size+' proveedores':'';
 $('#provNombres').innerHTML=[...new Set(archivos.map(a=>a.proveedor))].map(p=>`<option value="${esc(p)}"></option>`).join('');
 $('#provEditar').textContent=editando?'Listo':'Editar lista';$('#provEditar').setAttribute('aria-pressed',String(editando));
 const g=grupos();
 $('#provLista').innerHTML=g.length?g.map(([p,l])=>`<section class="prov-proveedor"><h3>${esc(p)}</h3><ul>${l.map(fila).join('')}</ul></section>`).join('')
  :`<p class="cot-ayuda">${archivos.length?'Ningún archivo coincide con «'+esc(filtro)+'».':'Todavía no hay catálogos. Usa «+ Subir archivo».'}</p>`;
}
function fila(a){
 const acciones=!editando?'':porQuitar===a.id?`<span class="prov-confirmar">¿Quitar de la lista? <button type="button" class="btn-texto prov-quitar" data-prov-quitar-si="${esc(a.id)}">Sí, quitar</button><button type="button" class="btn-texto" data-prov-quitar-no>No</button></span>`
  :`<span class="prov-acciones"><button type="button" class="btn-texto" data-prov-cambiar="${esc(a.id)}">Cambiar nombre</button><button type="button" class="btn-texto prov-quitar" data-prov-quitar="${esc(a.id)}">Quitar</button></span>`;
 return `<li><button type="button" class="prov-archivo prov-archivo--${esc(a.tipo)}" data-prov-abrir="${esc(a.id)}"><span class="prov-tipo">${esc(TIPO[a.tipo])}</span><b>${esc(a.titulo)}</b><small>${esc([FORMATO[a.mime]||'Archivo',peso(Number(a.bytes)),a.nota].filter(Boolean).join(' · '))}</small></button>${acciones}</li>`;
}
$('#provBuscar').addEventListener('input',e=>{filtro=e.target.value;pintar();});
$('#provEditar').addEventListener('click',()=>{editando=!editando;porQuitar=null;pintar();});

// Abrir: en computadora, visor dentro de Gestión; en el celular o si no es PDF, pestaña nueva.
function guardarEnMemoria(id,url){memoria.set(id,url);while(memoria.size>4){const [viejo,u]=memoria.entries().next().value;URL.revokeObjectURL(u);memoria.delete(viejo);}}
async function abrir(id,pagina=null){
 const a=archivos.find(x=>x.id===id);if(!a)return;
 // Desde la ficha de una prenda (22-nov-2026) el PDF abre en la página del modelo.
 const hoja=a.mime==='application/pdf'&&Number.isSafeInteger(pagina)&&pagina>0?'#page='+pagina:'';
 if(enCelular()||a.mime!=='application/pdf'){
  // La pestaña se abre en el mismo toque (si no, el teléfono la bloquea) y luego recibe el enlace firmado.
  const w=window.open('','_blank');avisar('Abriendo '+a.titulo+'…');
  try{const r=await api('proveedor-archivo-abrir',{id});if(w&&!w.closed){w.opener=null;w.location.href=r.url+hoja;avisar('');}else{avisar('');$('#provEstado').innerHTML='<a href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">Abrir '+esc(a.titulo)+'</a>';}}
  catch(e){w?.close();avisar(e.message);}
  return;
 }
 const d=$('#provVisor'),marco=$('#provVisorMarco'),estado=$('#provVisorEstado'),turno=++visorTurno;
 $('#provVisorProveedor').textContent=a.proveedor+' · '+TIPO[a.tipo];$('#provVisorTitulo').textContent=a.titulo;$('#provVisorPestana').removeAttribute('href');
 marco.hidden=true;marco.removeAttribute('src');estado.hidden=false;estado.textContent=memoria.has(id)?'Abriendo…':'Abriendo '+peso(Number(a.bytes))+'…';d.showModal();
 try{
  let url=memoria.get(id),firmado=null;
  if(!url){
   const r=await api('proveedor-archivo-abrir',{id});firmado=r.url;
   const res=await fetch(r.url,{signal:AbortSignal.timeout(180000)});if(!res.ok)throw Error('No se pudo abrir el archivo. Intenta de nuevo.');
   url=URL.createObjectURL(new Blob([await res.blob()],{type:'application/pdf'}));guardarEnMemoria(id,url);
  }
  if(turno!==visorTurno||!d.open)return;
  marco.src=url+hoja;marco.hidden=false;estado.hidden=true;$('#provVisorPestana').href=firmado||url;
 }catch(e){if(turno===visorTurno)estado.textContent=e.message;}
}
$('#provVisorCerrar').addEventListener('click',()=>$('#provVisor').close());
// Para la ficha de cada prenda en Catálogo: sus catálogos del mismo proveedor («Player y Tees» = «Playerytees»).
const mismoProveedor=(a,b)=>{const n=s=>clave(s).replace(/^proveedor /,'').replace(/\s+/g,'');return !!n(a)&&n(a)===n(b);};
window.ZAINProveedores={
 async catalogosDe(proveedor){await cargar();return archivos.filter(a=>a.tipo==='catalogo'&&mismoProveedor(a.proveedor,proveedor)).sort((a,b)=>a.titulo.localeCompare(b.titulo,'es'));},
 abrir:(id,pagina)=>abrir(id,pagina)
};
$('#provVisor').addEventListener('close',()=>{visorTurno++;$('#provVisorMarco').removeAttribute('src');$('#provVisorMarco').hidden=true;});

// Subir o cambiar el nombre.
function mostrarForm(a=null){
 const f=$('#provForm');enEdicion=a;f.reset();f.hidden=false;$('#provFormEstado').textContent='';
 $('#provFormTitulo').textContent=a?'Cambiar «'+a.titulo+'»':'Subir catálogo o lista de precios';
 f.querySelector('[data-prov-archivo]').hidden=!!a;f.elements.archivo.required=!a;
 if(a){f.elements.proveedor.value=a.proveedor;f.elements.tipo.value=a.tipo;f.elements.titulo.value=a.titulo;f.elements.nota.value=a.nota||'';}
 f.elements.proveedor.focus();
}
$('#provSubir').addEventListener('click',()=>mostrarForm());
$('#provForm').addEventListener('change',e=>{
 if(e.target.name!=='archivo')return;const f=e.currentTarget,x=e.target.files[0];if(!x)return;
 if(!f.elements.titulo.value.trim())f.elements.titulo.value=x.name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').trim().slice(0,120);
 if(/precio/i.test(x.name))f.elements.tipo.value='precios';
});
const mimeDe=x=>MIME_EXT[(x.name.split('.').pop()||'').toLowerCase()]||(Object.values(MIME_EXT).includes(x.type)?x.type:'');
$('#provForm').addEventListener('click',e=>{if(e.target.closest('[data-prov-cancelar]')){$('#provForm').hidden=true;enEdicion=null;}});
$('#provForm').addEventListener('submit',async e=>{
 e.preventDefault();const f=e.currentTarget,estado=$('#provFormEstado');if(ocupado||!f.reportValidity())return;
 const datos={proveedor:f.elements.proveedor.value,tipo:f.elements.tipo.value,titulo:f.elements.titulo.value,nota:f.elements.nota.value};
 const boton=f.querySelector('[type=submit]');ocupado=true;boton.disabled=true;
 try{
  if(enEdicion){estado.textContent='Guardando…';await api('proveedor-archivo-editar',{...datos,id:enEdicion.id,version:enEdicion.version});}
  else{
   const x=f.elements.archivo.files[0],mime=x&&mimeDe(x);
   if(!x)throw Error('Elige el archivo.');if(!mime)throw Error('Sube un PDF, un Excel (.xlsx) o una imagen.');if(x.size>MAX)throw Error('El archivo pesa '+peso(x.size)+'; el máximo es 50 MB. Pídeme que lo comprima.');
   const id=crypto.randomUUID();estado.textContent='Subiendo '+peso(x.size)+'…';
   const s=await api('proveedor-archivo-subida',{id,mime,bytes:x.size});
   const r=await fetch(s.url,{method:'PUT',headers:{'Content-Type':mime},body:x,signal:AbortSignal.timeout(600000)});
   if(!r.ok)throw Error('No se pudo subir el archivo. Revisa tu conexión e intenta de nuevo.');
   estado.textContent='Guardando…';await api('proveedor-archivo-guardar',{...datos,id,objeto:s.objeto,mime,bytes:x.size});
  }
  f.hidden=true;const nombre=datos.titulo;enEdicion=null;await cargar(true);avisar(nombre+' guardado.');
 }catch(er){estado.textContent=er.message;}
 finally{ocupado=false;boton.disabled=false;}
});
$('#provLista').addEventListener('click',async e=>{
 const t=e.target,ab=t.closest('[data-prov-abrir]');if(ab){void abrir(ab.dataset.provAbrir);return;}
 const c=t.closest('[data-prov-cambiar]');if(c){mostrarForm(archivos.find(a=>a.id===c.dataset.provCambiar));return;}
 const q=t.closest('[data-prov-quitar]');if(q){porQuitar=q.dataset.provQuitar;pintar();return;}
 if(t.closest('[data-prov-quitar-no]')){porQuitar=null;pintar();return;}
 const si=t.closest('[data-prov-quitar-si]');
 if(si){try{await api('proveedor-archivo-archivar',{id:si.dataset.provQuitarSi});porQuitar=null;await cargar(true);avisar('Se quitó de la lista. El archivo se conserva.');}catch(er){avisar(er.message);}}
});
// Recordar si el panel se dejó cerrado (solo en este navegador).
// 22-nov-2026: cerrado de entrada para que las prendas se vean primero; se recuerda si lo abres.
try{$('#provPanel').open=localStorage.getItem('zain-prov-panel')==='abierto';}catch{$('#provPanel').open=false;}
$('#provPanel').addEventListener('toggle',e=>{try{localStorage.setItem('zain-prov-panel',e.currentTarget.open?'abierto':'cerrado');}catch{}});

$('#verCatalogo')?.addEventListener('click',()=>{void cargar();});
addEventListener('zain:equipo-listo',()=>{if(!$('#seccionCatalogo').hidden)void cargar();});
addEventListener('zain:equipo-salio',()=>{epoca++;visorTurno++;cargado=false;archivos=[];editando=false;porQuitar=null;filtro='';$('#provBuscar').value='';$('#provForm').hidden=true;$('#provLista').replaceChildren();$('#provCuenta').textContent='';avisar('');if($('#provVisor').open)$('#provVisor').close();for(const u of memoria.values())URL.revokeObjectURL(u);memoria.clear();});
