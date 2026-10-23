// Selecciones del borrador: el pedido publicado permanece intacto hasta publicar.
import {calcular,entrada,generar} from './cotizacion-core.mjs';
export const seleccionesDe=(pedido,borrador)=>borrador?.selecciones||pedido.items.map((item,origen)=>({origen,item}));
export const itemsDe=(pedido,borrador)=>seleccionesDe(pedido,borrador).map(s=>s.item);
export function conservarSelecciones(resultado,borrador){return {...resultado,...(borrador?.selecciones?{selecciones:structuredClone(borrador.selecciones),partidasVersion:borrador.partidasVersion??0}:{})};}
export const calcularSeleccion=(pedido,borrador)=>conservarSelecciones(calcular(itemsDe(pedido,borrador),borrador),borrador);
export function mismaVista(a,b){return !!a&&a.p===b.p&&a.color===b.color&&a.tecnica===b.tecnica&&a.zona===b.zona&&Number(a.cm)===Number(b.cm);}
export function itemCatalogo(producto,color,tecnica,zona,cm,cantidades,piezas,anterior=null){
 const tallasDetalle=Object.fromEntries((producto.tallas||[]).filter(t=>cantidades[t]>0).map(t=>[t,Number(cantidades[t])]));
 const total=producto.tallas?.length?Object.values(tallasDetalle).reduce((n,v)=>n+v,0):Number(piezas);
 if(!Number.isSafeInteger(total)||total<Math.max(1,producto.minimoPiezas||0)||total>9999||(total-(producto.minimoPiezas||0))%(producto.pasoPiezas||1))throw Error('Revisa las cantidades y el mínimo de '+(producto.nombreComercial||producto.nombre)+'.');
 const simple=tecnica==='Solo prenda';
 const item={...(anterior||{}),p:producto.id,sku:producto.sku,nombre:producto.nombre,nombreZain:producto.nombreComercial||producto.nombre,color:producto.fabricante?color.nombre+' · '+color.codigo:color.nombre,colorId:color.id,colorCodigo:color.codigo||'',tecnica,piezas:total,tallasDetalle,tallas:Object.entries(tallasDetalle).map(([t,n])=>t+' '+n).join(' · '),tallasEtq:'Tallas',zona:simple?'':zona?.nombre||'',cm:simple?0:Number(cm),tieneLogo:false,tieneRender:false};
 if(!simple&&(!zona||!Number.isFinite(item.cm)||item.cm<0||item.cm>200))throw Error('Revisa la zona y el ancho del logo.');
 if(anterior&&mismaVista(anterior,item)){item.tieneLogo=!!anterior.tieneLogo;item.tieneRender=!!anterior.tieneRender;}else delete item.logoGeometria;
 if(simple){delete item.logoGeometria;item.logo='Sin personalización';}else if(!item.tieneLogo)item.logo='Logo pendiente de confirmar';
 return item;
}
function preciosDe(partida,item){
 if(partida.preciosDetalle?.length)return Object.fromEntries(partida.preciosDetalle.map(p=>[p.talla,p.precio]));
 const costos=[...new Set((partida.detalleCostosTalla||[]).map(d=>d.costo))].sort((a,b)=>a-b);
 return Object.fromEntries(Object.keys(item.tallasDetalle||{}).map(t=>{const d=partida.detalleCostosTalla?.find(d=>d.talla===t);return [t,d&&partida.preciosTalla?.length?partida.preciosTalla[costos.indexOf(d.costo)]?.precio??partida.precio:partida.precio];}).filter(([,n])=>Number.isSafeInteger(n)));
}
export function modificarSelecciones(pedido,anterior,filas,config){
 if(!filas.length||filas.length>20)throw Error('La cotización admite de 1 a 20 partidas.');
 const viejas=seleccionesDe(pedido,anterior),input=entrada(anterior),items=filas.map(f=>f.item),origen=[];
 input.partidas=filas.map((f,i)=>{
  const antigua=f.anterior==null?null:anterior.partidas[f.anterior],old=viejas[f.anterior]?.item;
  if(antigua&&old?.sku===f.item.sku&&old.tecnica===f.item.tecnica){const v={...inputAnterior(antigua,anterior),indice:i};if(v.precio==null&&antigua.precio!=null)v.precio=antigua.precio;if(Number(old.cm)!==Number(f.item.cm)&&Number(f.item.cm)>0){const ancho=Math.round(f.item.cm*100);v.alto=v.ancho&&v.alto?Math.max(1,Math.min(20000,Math.round(v.alto*ancho/v.ancho))):ancho;v.ancho=ancho;}if(f.item.tallasDetalle&&antigua.precio!=null){const fijos=preciosDe(antigua,old),prueba=calcular([f.item],{...input,partidas:[{...v,indice:0}]}).partidas[0],base=[...prueba.detalleCostosTalla].sort((a,b)=>a.costo-b.costo)[0]?.talla||Object.keys(f.item.tallasDetalle)[0];if(Object.keys(fijos).length){v.precio=fijos[base]??v.precio;v.precioAncla=v.precio;v.preciosAcordados=fijos;}}origen.push(anterior.origenCostos?.partidas?.[f.anterior]||null);return v;}
  const nuevo=generar([f.item],config).partidas[0];origen.push({...nuevo});return {...entrada({schema:6,partidas:[nuevo]}).partidas[0],indice:i};
 });
 const q=calcular(items,input),selecciones=filas.map(f=>({origen:f.origen,item:f.item}));
 return {...q,selecciones,partidasVersion:anterior.partidasVersion??pedido.partidas_version??0,origenCostos:{version:anterior.origenCostos?.version??0,partidas:origen}};
}
function inputAnterior(partida,q){return entrada({...q,partidas:[partida]}).partidas[0];}
