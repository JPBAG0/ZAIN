import {configurar} from './cotizacion-core.js?v=21';
import {esc,tallasDe} from './cotizacion-vista.js?v=15';
import {seleccionesDe,itemCatalogo,modificarSelecciones} from './cotizacion-selecciones.js?v=4';
// Misma zona «Libre» que el personalizador (js/zain.js) y validateOrder.
const zonasDe=p=>[...p.zonas,{id:'libre',nombre:'Libre',x:500,y:430,max:Math.floor(820/(p.pxPorCm||8)),orientativa:true,libre:true}];
export async function editarSelecciones(pedido,borrador,api){
 const [{catalogo:c},{config}]=await Promise.all([api('catalogo-publico'),api('precios-config')]); // catalogo-publico no incluye técnicas; vienen de config.js.
 c.tecnicas??=window.ZAIN?.tecnicas??[];
 const productos=[...new Map([...(c.productos||[]),...(c.productosHistoricos||[])].map(p=>[p.id,p])).values()];
 const viejas=seleccionesDe(pedido,borrador);let filas=viejas.map((s,i)=>({...structuredClone(s),anterior:i})),contador=0;
 const dialogo=document.createElement('dialog');dialogo.className='cot-selecciones-dialogo';dialogo.setAttribute('aria-labelledby','cotSeleccionesTitulo');dialogo.innerHTML='<form id="cotSeleccionesForm"><header class="cot-selecciones-cab"><h2 id="cotSeleccionesTitulo">Partidas y tallas</h2><button type="button" class="btn-texto" data-cerrar>Cancelar</button></header><p>Cambia tallas, cantidades o modelos. Los cambios se aplican al borrador; el cliente los verá al publicar la nueva revisión.</p><div data-filas></div><button type="button" class="btn btn--linea" data-agregar>+ Agregar partida</button><p data-error role="status" class="cot-alerta"></p><footer class="cot-acciones"><button class="btn btn--azul">Aplicar al borrador</button></footer></form>';document.body.append(dialogo);
 const cont=dialogo.querySelector('[data-filas]'),errores=dialogo.querySelector('[data-error]');
 const productoDe=item=>productos.find(p=>p.id===item?.p||p.idPublico===item?.p||p.sku===item?.sku);
 function pintar(f){
  f.clave=++contador;const p=productoDe(f.item)||productos.find(p=>p.activo!==false);if(!p)throw Error('No hay modelos disponibles.');
  const el=document.createElement('fieldset');el.className='cot-seleccion-fila';el.dataset.seleccion=String(f.clave);el.innerHTML='<legend>Partida</legend><div class="cot-seleccion-acciones"><button type="button" class="btn-texto" data-duplicar>Duplicar</button><button type="button" class="btn-texto" data-quitar>Quitar partida</button></div><label>Modelo<select data-modelo>'+productos.filter(v=>v.activo!==false||v.id===p.id).map(v=>'<option value="'+esc(v.id)+'">'+esc((v.nombreComercial||v.nombre)+(v.silueta&&!String(v.nombreComercial||v.nombre).includes(v.silueta)?' · '+v.silueta:''))+'</option>').join('')+'</select></label><div class="cot-edicion"><label>Color<select data-color></select></label><label>Personalización<select data-tecnica></select></label></div><div class="cot-edicion" data-personalizacion><label>Zona<select data-zona></select></label><label>Ancho del logo (cm)<input data-cm type="number" min="0" max="200" step="0.01" value="'+esc(f.item?.cm||8)+'"></label></div><div data-tallas></div>';
  cont.append(el);el.querySelector('[data-modelo]').value=p.id;actualizar(el,f,false);numerar();
 }
 function numerar(){[...cont.children].forEach((el,i)=>el.querySelector('legend').textContent='Partida '+(i+1));}
 function actualizar(el,f,cambio){
  const p=productos.find(p=>p.id===el.querySelector('[data-modelo]').value),item=cambio?null:f.item;
  el.querySelector('[data-color]').innerHTML=p.colores.map(id=>c.colores.find(col=>col.id===id)).filter(Boolean).map(col=>'<option value="'+esc(col.id)+'">'+esc(col.nombre)+'</option>').join('');
  if(item){const nombre=String(item.color||'').replace(/ · [^·]+$/,''),opciones=c.colores.filter(col=>p.colores.includes(col.id)),col=item.colorId&&opciones.find(col=>col.id===item.colorId)||item.colorCodigo&&opciones.find(col=>col.codigo===item.colorCodigo)||opciones.find(col=>col.nombre===item.color||col.nombre===nombre);if(col)el.querySelector('[data-color]').value=col.id;else errores.textContent='No encontramos el color «'+item.color+'» en el catálogo. Elige el color correcto antes de aplicar.';}
  el.querySelector('[data-tecnica]').innerHTML='<option value="Solo prenda">Solo prenda</option>'+p.tecnicas.map(id=>c.tecnicas.find(t=>t.id===id)).filter(Boolean).map(t=>'<option value="'+esc(t.nombre)+'">'+esc(t.nombre)+'</option>').join('');
  el.querySelector('[data-tecnica]').value=item?.tecnica||'Solo prenda';el.querySelector('[data-zona]').innerHTML=zonasDe(p).map(z=>'<option value="'+esc(z.id)+'">'+esc(z.nombre)+'</option>').join('');const z=zonasDe(p).find(z=>z.nombre===String(item?.zona||'').replace(/ \(posición ajustada\)$/,''));if(z)el.querySelector('[data-zona]').value=z.id;
  const minimo=Math.max(1,p.minimoPiezas||0),tallas=p.tallas||[],desglose=item?.tallasDetalle||Object.fromEntries(tallasDe(item?.tallas)||[]);el.querySelector('[data-tallas]').innerHTML=tallas.length?'<p class="cot-ayuda">Piezas por talla · mínimo '+minimo+' por partida</p><div class="cot-tallas-cantidades">'+tallas.map((t,i)=>'<label>'+esc(t)+'<input type="number" min="0" max="9999" step="1" required inputmode="numeric" data-talla="'+esc(t)+'" value="'+(desglose[t]??(!item&&!i?minimo:0))+'"></label>').join('')+'</div>':'<label>Piezas<input data-piezas type="number" min="'+minimo+'" max="9999" step="'+(p.pasoPiezas||1)+'" required value="'+(item?.piezas||minimo)+'"></label>';
  personalizacion(el);
 }
 function personalizacion(el){el.querySelector('[data-personalizacion]').hidden=el.querySelector('[data-tecnica]').value==='Solo prenda';}
 function leer(el){
  const f=filas.find(f=>f.clave===Number(el.dataset.seleccion)),p=productos.find(p=>p.id===el.querySelector('[data-modelo]').value),col=c.colores.find(c=>c.id===el.querySelector('[data-color]').value),t=el.querySelector('[data-tecnica]').value,z=zonasDe(p).find(z=>z.id===el.querySelector('[data-zona]').value),cantidades=Object.fromEntries([...el.querySelectorAll('[data-talla]')].map(e=>[e.dataset.talla,Number(e.value)]));
  return {...f,item:itemCatalogo(p,col,t,z,Number(el.querySelector('[data-cm]').value),cantidades,el.querySelector('[data-piezas]')?.value,f.item)};
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
