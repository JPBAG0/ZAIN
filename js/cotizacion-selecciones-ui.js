import {configurar} from './cotizacion-core.js?v=23';
import {esc,tallasDe} from './cotizacion-vista.js?v=16';
import {seleccionesDe,itemCatalogo,modificarSelecciones} from './cotizacion-selecciones.js?v=5';
import {SERVICIO,NOMBRE_SERVICIO,itemServicio} from './cotizacion-servicio.js?v=2';
// Misma zona «Libre» que el personalizador (js/zain.js) y validateOrder.
const zonasDe=p=>[...p.zonas,{id:'libre',nombre:'Libre',x:500,y:430,max:Math.floor(820/(p.pxPorCm||8)),orientativa:true,libre:true}];
export async function editarSelecciones(pedido,borrador,api){
 const [{catalogo:c},{config}]=await Promise.all([api('catalogo-publico'),api('precios-config')]); // catalogo-publico no incluye técnicas; vienen de config.js.
 c.tecnicas??=window.ZAIN?.tecnicas??[];
 // «Sin prenda» (el cliente entrega las prendas) va primero en la lista de modelos; no tiene color, tallas ni zona del catálogo.
 const servicio={id:SERVICIO,sku:'',nombre:'Sin prenda (prenda del cliente)',servicio:true,colores:[],tecnicas:c.tecnicas.map(t=>t.id),zonas:[],tallas:[],minimoPiezas:1};
 const productos=[servicio,...new Map([...(c.productos||[]),...(c.productosHistoricos||[])].map(p=>[p.id,p])).values()];
 const viejas=seleccionesDe(pedido,borrador);let filas=viejas.map((s,i)=>({...structuredClone(s),anterior:i})),contador=0;
 const dialogo=document.createElement('dialog');dialogo.className='cot-selecciones-dialogo';dialogo.setAttribute('aria-labelledby','cotSeleccionesTitulo');dialogo.innerHTML='<form id="cotSeleccionesForm"><header class="cot-selecciones-cab"><h2 id="cotSeleccionesTitulo">Partidas y tallas</h2><button type="button" class="btn-texto" data-cerrar>Cancelar</button></header><p>Cambia tallas, cantidades o modelos. Los cambios se aplican al borrador; el cliente los verá al publicar la nueva revisión.</p><div data-filas></div><button type="button" class="btn btn--linea" data-agregar>+ Agregar partida</button><p data-error role="status" class="cot-alerta"></p><footer class="cot-acciones"><button class="btn btn--azul">Aplicar al borrador</button></footer></form>';document.body.append(dialogo);
 const cont=dialogo.querySelector('[data-filas]'),errores=dialogo.querySelector('[data-error]');
 const productoDe=item=>item?.p===SERVICIO?servicio:productos.find(p=>!p.servicio&&(p.id===item?.p||p.idPublico===item?.p||p.sku===item?.sku));
 function pintar(f){
  f.clave=++contador;const p=productoDe(f.item)||productos.find(p=>!p.servicio&&p.activo!==false);if(!p)throw Error('No hay modelos disponibles.');
  const el=document.createElement('fieldset');el.className='cot-seleccion-fila';el.dataset.seleccion=String(f.clave);el.innerHTML='<legend>Partida</legend><div class="cot-seleccion-acciones"><button type="button" class="btn-texto" data-duplicar>Duplicar</button><button type="button" class="btn-texto" data-quitar>Quitar partida</button></div><label>Modelo<select data-modelo>'+productos.filter(v=>v.activo!==false||v.id===p.id).map(v=>'<option value="'+esc(v.id)+'">'+esc((v.nombreComercial||v.nombre)+(v.silueta&&!String(v.nombreComercial||v.nombre).includes(v.silueta)?' · '+v.silueta:''))+'</option>').join('')+'</select></label><label data-concepto hidden>Concepto<input data-nombre maxlength="150" autocomplete="off" value="'+esc(f.item?.servicio?f.item.nombreZain||f.item.nombre:NOMBRE_SERVICIO)+'"></label><div class="cot-edicion"><label data-color-campo>Color<select data-color></select></label><label>Personalización<select data-tecnica></select></label></div><div class="cot-edicion" data-personalizacion><label data-zona-campo>Zona<select data-zona></select></label><label data-ubicacion hidden>Ubicación del logo<input data-ubic maxlength="120" autocomplete="off" placeholder="Ej. Frente, espalda, manga" value="'+esc(f.item?.servicio?f.item.zona||'':'')+'"></label><label>Ancho del logo (cm)<input data-cm type="number" min="0" max="200" step="0.01" value="'+esc(f.item?.cm||8)+'"></label></div><div data-tallas></div>';
  cont.append(el);el.querySelector('[data-modelo]').value=p.id;actualizar(el,f,false);numerar();
 }
 function numerar(){[...cont.children].forEach((el,i)=>el.querySelector('legend').textContent='Partida '+(i+1));}
 function actualizar(el,f,cambio){
  const p=productos.find(p=>p.id===el.querySelector('[data-modelo]').value),item=cambio?null:f.item,sp=!!p.servicio;
  for(const [s,oculto] of [['[data-color-campo]',sp],['[data-zona-campo]',sp],['[data-concepto]',!sp],['[data-ubicacion]',!sp]])el.querySelector(s).hidden=oculto;
  el.querySelector('[data-color]').innerHTML=p.colores.map(id=>c.colores.find(col=>col.id===id)).filter(Boolean).map(col=>'<option value="'+esc(col.id)+'">'+esc(col.nombre)+'</option>').join('');
  if(item&&!sp){const nombre=String(item.color||'').replace(/ · [^·]+$/,''),opciones=c.colores.filter(col=>p.colores.includes(col.id)),col=item.colorId&&opciones.find(col=>col.id===item.colorId)||item.colorCodigo&&opciones.find(col=>col.codigo===item.colorCodigo)||opciones.find(col=>col.nombre===item.color||col.nombre===nombre);if(col)el.querySelector('[data-color]').value=col.id;else errores.textContent='No encontramos el color «'+item.color+'» en el catálogo. Elige el color correcto antes de aplicar.';}
  el.querySelector('[data-tecnica]').innerHTML=(sp?'':'<option value="Solo prenda">Solo prenda</option>')+p.tecnicas.map(id=>c.tecnicas.find(t=>t.id===id)).filter(Boolean).map(t=>'<option value="'+esc(t.nombre)+'">'+esc(t.nombre)+'</option>').join('');
  el.querySelector('[data-tecnica]').value=item&&!(sp&&item.tecnica==='Solo prenda')?item.tecnica:sp?(c.tecnicas.find(t=>t.nombre==='Serigrafía')||c.tecnicas[0])?.nombre||'':'Solo prenda';el.querySelector('[data-zona]').innerHTML=zonasDe(p).map(z=>'<option value="'+esc(z.id)+'">'+esc(z.nombre)+'</option>').join('');const z=zonasDe(p).find(z=>z.nombre===String(item?.zona||'').replace(/ \(posición ajustada\)$/,''));if(z)el.querySelector('[data-zona]').value=z.id;
  const minimo=Math.max(1,p.minimoPiezas||0),tallas=p.tallas||[],desglose=item?.tallasDetalle||Object.fromEntries(tallasDe(item?.tallas)||[]);el.querySelector('[data-tallas]').innerHTML=tallas.length?'<p class="cot-ayuda">Piezas por talla · mínimo '+minimo+' por partida</p><div class="cot-tallas-cantidades">'+tallas.map((t,i)=>'<label>'+esc(t)+'<input type="number" min="0" max="9999" step="1" required inputmode="numeric" data-talla="'+esc(t)+'" value="'+(desglose[t]??(!item&&!i?minimo:0))+'"></label>').join('')+'</div>':'<label>Piezas<input data-piezas type="number" min="'+minimo+'" max="9999" step="'+(p.pasoPiezas||1)+'" required value="'+(item?.piezas||minimo)+'"></label>';
  personalizacion(el);
 }
 function personalizacion(el){el.querySelector('[data-personalizacion]').hidden=el.querySelector('[data-tecnica]').value==='Solo prenda';}
 function leer(el){
  const fila=filas.find(f=>f.clave===Number(el.dataset.seleccion)),modelo=productos.find(p=>p.id===el.querySelector('[data-modelo]').value);
  if(modelo?.servicio){
   const cm=Number(el.querySelector('[data-cm]').value),piezas=Number(el.querySelector('[data-piezas]')?.value),limpio=s=>s.replace(/\s+/g,' ').trim();
   if(!(cm>0)||cm>200)throw Error('Revisa el ancho del logo de la partida sin prenda (hasta 200 cm).');
   if(!Number.isSafeInteger(piezas)||piezas<1||piezas>9999)throw Error('Revisa las piezas de la partida sin prenda.');
   return {...fila,item:itemServicio({nombre:limpio(el.querySelector('[data-nombre]').value),tecnica:el.querySelector('[data-tecnica]').value,ubicacion:limpio(el.querySelector('[data-ubic]').value),cm,piezas,anterior:fila.item})};
  }
  const f=fila,p=modelo,col=c.colores.find(c=>c.id===el.querySelector('[data-color]').value),t=el.querySelector('[data-tecnica]').value,z=zonasDe(p).find(z=>z.id===el.querySelector('[data-zona]').value),cantidades=Object.fromEntries([...el.querySelectorAll('[data-talla]')].map(e=>[e.dataset.talla,Number(e.value)]));
  // Una partida que era «sin prenda» y ahora es un modelo no hereda sus campos (servicio, concepto, ubicación).
  return {...f,item:itemCatalogo(p,col,t,z,Number(el.querySelector('[data-cm]').value),cantidades,el.querySelector('[data-piezas]')?.value,f.item?.servicio?null:f.item)};
 }
 try{for(const f of filas)pintar(f);}catch(e){dialogo.remove();throw e;}
 return new Promise(resolve=>{
  let resultado=null;
  const terminar=()=>{dialogo.close();};
  dialogo.addEventListener('close',()=>{dialogo.remove();resolve(resultado);},{once:true});
  dialogo.addEventListener('change',e=>{const el=e.target.closest('[data-seleccion]');if(!el)return;try{if(e.target.matches('[data-modelo]'))actualizar(el,filas.find(f=>f.clave===Number(el.dataset.seleccion)),true);if(e.target.matches('[data-tecnica]'))personalizacion(el);}catch(e){errores.textContent=e.message;}});
  dialogo.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;errores.textContent='';try{
   if(b.hasAttribute('data-cerrar'))terminar();
   if(b.hasAttribute('data-quitar')){const el=b.closest('[data-seleccion]');filas=filas.filter(f=>f.clave!==Number(el.dataset.seleccion));el.remove();numerar();}
   if(b.hasAttribute('data-agregar')){if(filas.length>=20)throw Error('Se admiten hasta20partidas.');const f={origen:null,anterior:null,item:null};filas.push(f);pintar(f);}
   if(b.hasAttribute('data-duplicar')){if(filas.length>=20)throw Error('Se admiten hasta20partidas.');const f=leer(b.closest('[data-seleccion]'));filas.push(f);pintar(f);}
  }catch(e){errores.textContent=e.message;}});
  dialogo.querySelector('form').addEventListener('submit',e=>{e.preventDefault();try{const nuevas=[...cont.children].map(leer);resultado=modificarSelecciones(pedido,borrador,nuevas,configurar(config.datos));terminar();}catch(e){errores.textContent=e.message;}});
  dialogo.showModal();
 });
}
