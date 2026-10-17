// Avisos en el celular del equipo: solicitudes nuevas y cotizaciones aceptadas (Web Push).
const caja=document.getElementById('avisos');
const soporta='serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1;
const instalada=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const llave=b64=>{const s=atob(b64.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(b64.length/4)*4,'='));return Uint8Array.from(s,c=>c.charCodeAt(0));};
const dispositivo=()=>(ios?'iPhone':/Android/.test(navigator.userAgent)?'Android':'Computadora')+(instalada?' · app':'');
let registro=null;
function pintar(estado,detalle=''){
 caja.hidden=false;caja.dataset.estado=estado;
 const textos={
  instalar:['Avisos en tu iPhone','Abre Gestión desde el ícono de tu pantalla de inicio para activar los avisos.'],
  nosoporta:['Avisos no disponibles','Este navegador no permite avisos. Usa Safari (iPhone) o Chrome.'],
  apagado:['Avisos en este dispositivo','Te llega una notificación con cada solicitud nueva y cada cotización aceptada.'],
  bloqueado:['Avisos bloqueados','Actívalos en Ajustes → Notificaciones → ZAIN Gestión y vuelve a abrir la app.'],
  activo:['Avisos activos ✓','Este dispositivo recibe cada solicitud nueva y cada cotización aceptada.']
 };
 const [t,p]=textos[estado];
 caja.innerHTML=`<div><b>${t}</b><p>${detalle||p}</p></div><div class="control__avisosbotones">${estado==='apagado'?'<button type="button" class="btn btn--azul" data-accion="activar">Activar avisos</button>':estado==='activo'?'<button type="button" class="btn btn--linea" data-accion="probar">Probar</button><button type="button" class="btn-texto" data-accion="quitar">Desactivar</button>':''}</div>`;
}
async function suscripcion(){registro??=await navigator.serviceWorker.register('/sw-gestion.js',{scope:'/gestion-zain'});await navigator.serviceWorker.ready;return registro.pushManager.getSubscription();}
async function revisar(){
 if(!soporta)return pintar(ios&&!instalada?'instalar':'nosoporta');
 if(Notification.permission==='denied')return pintar('bloqueado');
 const s=await suscripcion();
 if(s&&Notification.permission==='granted'){
  // Se vuelve a registrar en cada visita: si el servidor la había olvidado, se recupera.
  window.ZAINEquipo.call('avisos-suscribir',{suscripcion:s.toJSON(),dispositivo:dispositivo()}).catch(()=>{});
  return pintar('activo');
 }
 pintar('apagado');
}
caja?.addEventListener('click',async e=>{
 const b=e.target.closest('[data-accion]');if(!b)return;b.disabled=true;
 try{
  if(b.dataset.accion==='activar'){
   // Safari exige pedir el permiso directamente desde el toque.
   const permiso=await Notification.requestPermission();
   if(permiso!=='granted')return pintar(permiso==='denied'?'bloqueado':'apagado');
   const [{publica},reg]=await Promise.all([window.ZAINEquipo.call('avisos-clave'),suscripcion().then(()=>registro)]);
   const s=await reg.pushManager.getSubscription()||await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:llave(publica)});
   await window.ZAINEquipo.call('avisos-suscribir',{suscripcion:s.toJSON(),dispositivo:dispositivo()});
   pintar('activo','Listo. Toca Probar para recibir un aviso de ejemplo.');
  }else if(b.dataset.accion==='probar'){
   const {enviados}=await window.ZAINEquipo.call('avisos-probar',{});
   pintar('activo',enviados?'Aviso de prueba enviado. Debe llegarte en unos segundos.':'No se pudo entregar. Desactiva y vuelve a activar los avisos.');
  }else if(b.dataset.accion==='quitar'){
   const s=await suscripcion();if(s){await window.ZAINEquipo.call('avisos-quitar',{endpoint:s.endpoint}).catch(()=>{});await s.unsubscribe();}
   pintar('apagado');
  }
 }catch(er){pintar(caja.dataset.estado||'apagado',er.message||'No se pudieron configurar los avisos.');}
 finally{b.disabled=false;}
});
if(caja)addEventListener('zain:equipo-listo',()=>revisar().catch(()=>pintar('apagado')));
