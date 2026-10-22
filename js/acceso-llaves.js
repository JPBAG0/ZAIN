/* Interfaz compartida, siempre opcional y con contraseña de respaldo. */
(() => {
'use strict';
function montar({acceso,autorizar,alEntrar,alError=()=>{},loginForm,loginMensaje}){
 const $=s=>document.querySelector(s),dialog=$('#seguridadLlaves'),estado=$('#llavesEstado'),lista=$('#llavesLista');
 const abrir=$('#abrirLlaves'),entrar=$('#entrarLlave'),cancelar=$('#cancelarLlave');
 let autorizada=false,version=0,trabajando=false;
 const decir=t=>{estado.textContent=t;};
 const disponible=acceso.soporte();entrar.hidden=!disponible;
 $('#llaveAyuda').textContent=disponible?'Face ID, huella, PIN o llave de seguridad. Tu contraseña sigue disponible.':'Este navegador no admite llaves. Entra con tu contraseña.';
 function ocupado(b){trabajando=b;for(const x of dialog.querySelectorAll('button,input'))if(x.id!=='cerrarLlaves')x.disabled=b;}
 function cerrar(){version++;acceso.cancelar();if(dialog.open)dialog.close();$('#confirmarClaveLlave').value='';lista.replaceChildren();decir('');}
 async function ejecutar(fn){if(trabajando)return;const v=version;ocupado(true);try{await autorizar();if(v!==version||!autorizada)return;await fn(v);}catch(e){if(v===version){decir(AccesoSeguro.mensaje(e));alError(e);}}finally{ocupado(false);}}
 function pintar(items){lista.replaceChildren();if(!items.length){const p=document.createElement('p');p.textContent='Todavía no tienes llaves registradas.';lista.append(p);return;}
  for(const item of items){const li=document.createElement('li'),titulo=document.createElement('strong'),fecha=document.createElement('p');
   titulo.textContent=item.friendly_name||'Llave sin nombre';
   const fechaTexto=x=>x?new Date(x).toLocaleDateString('es-MX'):'Sin uso registrado';
   fecha.textContent='Registrada: '+fechaTexto(item.created_at)+' · Último uso: '+fechaTexto(item.last_used_at);
   const nombre=document.createElement('input');nombre.value=item.friendly_name||'';nombre.maxLength=120;nombre.setAttribute('aria-label','Nombre de la llave');nombre.autocomplete='off';
   const renombrar=document.createElement('button');renombrar.type='button';renombrar.textContent='Guardar nombre';
   renombrar.onclick=()=>ejecutar(async v=>{if(!nombre.value.trim()){decir('Escribe un nombre para la llave.');return;}await acceso.administrar('nombre',item.id,nombre.value);if(v===version)await cargar(v);});
   const quitar=document.createElement('button');quitar.type='button';quitar.textContent='Quitar llave';
   quitar.onclick=()=>{if(!confirm('¿Quitar esta llave? Ya no permitirá nuevas entradas. La contraseña seguirá disponible y las sesiones abiertas no se cierran.'))return;
    ejecutar(async v=>{await acceso.administrar('quitar',item.id);if(v===version){await cargar(v);decir('Llave retirada. Las sesiones que ya estaban abiertas se conservan.');}});};
   li.append(titulo,fecha,nombre,renombrar,quitar);lista.append(li);
  }
 }
 async function cargar(v){const items=await acceso.llaves();if(v===version&&autorizada&&dialog.open)pintar(items);}
 abrir.onclick=()=>{if(!autorizada)return;version++;dialog.showModal();ejecutar(cargar);};
 $('#cerrarLlaves').onclick=cerrar;dialog.addEventListener('cancel',e=>{e.preventDefault();cerrar();});
 $('#confirmarLlave').onsubmit=e=>{e.preventDefault();const clave=$('#confirmarClaveLlave').value;$('#confirmarClaveLlave').value='';ejecutar(async v=>{await acceso.confirmar(clave);if(v===version)decir('Identidad confirmada durante 5 minutos. Ya puedes administrar tus llaves.');});};
 $('#registrarLlave').onclick=()=>ejecutar(async v=>{decir('Sigue las instrucciones de tu dispositivo…');await acceso.administrar('registrar');if(v===version){await cargar(v);decir('Llave registrada. Puedes cambiar su nombre abajo.');}});
 $('#actualizarLlaves').onclick=()=>ejecutar(cargar);
 entrar.onclick=async()=>{await acceso.esperarCierre();if(acceso.ocupada||trabajando)return;const v=version;entrar.disabled=true;cancelar.hidden=false;loginMensaje.textContent='Sigue las instrucciones de tu dispositivo…';
  for(const x of loginForm.elements)x.disabled=true;
  try{await acceso.entrarLlave();if(v===version)await alEntrar();}
  catch(e){if(v===version)loginMensaje.textContent=AccesoSeguro.mensaje(e);alError(e);}
  finally{entrar.disabled=false;cancelar.hidden=true;for(const x of loginForm.elements)x.disabled=false;}
 };
 cancelar.onclick=()=>{version++;loginMensaje.textContent='Operación cancelada. Puedes entrar con contraseña.';acceso.cerrar().catch(()=>{});};
 return {autorizar(valor){autorizada=valor;abrir.hidden=!valor;if(!valor)cerrar();},cerrar};
}
globalThis.LlavesUI={montar};
})();
