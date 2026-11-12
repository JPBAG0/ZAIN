// Convierte una cotización por modelo y talla en las selecciones de una solicitud normal.
// Cada selección agrupa las tallas que comparten el mismo renglón cotizado, para que su precio sea exactamente el prometido.
import {itemServicio} from './cotizacion-servicio.js?v=3';
const maxLogo=(z,escala)=>Math.round(z.max*(z.orientativa?1:escala||1)*2)/2;
// El tramo de volumen se elige con el total de piezas del modelo en ese color, como se cotizó.
function renglon(filas,talla,color,piezas){
 return filas.find(f=>f.incluir!==false&&f.visto!=null&&(talla===''?!f.tallas.length||f.tallas.includes(''):f.tallas.includes(talla))&&(f.color==='Todos los colores'||(f.colores||[]).includes(color))&&piezas>=f.desde&&(f.hasta==null||piezas<=f.hasta));
}
export function armarPedido({modelos,lineas,colores,escala=1,folio=''}){
 const errores=[],selecciones=[];
 for(const l of lineas){
  const m=modelos[l.modelo];if(!m)continue;
  const p=m.producto,color=colores.find(c=>c.id===l.colorId),cantidades=Object.entries(l.cantidades||{}).filter(([,n])=>n>0);
  if(!cantidades.length)continue;
  // Sin prenda: el cliente entrega las prendas; una sola partida por piezas, sin color, tallas ni zona del catálogo.
  if(p.servicio){
   const n=cantidades.reduce((s,[,v])=>s+v,0);
   if(cantidades.some(([t,v])=>t!==''||!Number.isSafeInteger(v))||n>9999){errores.push(m.nombre+': revisa las piezas.');continue;}
   const f=renglon(m.filas,'','',n);
   if(!f){errores.push(m.nombre+': no tiene precio cotizado para '+n+' piezas.');continue;}
   const libre=!!p.libre,simple=libre&&!m.tecnica;
   if(!m.tecnica&&!libre){errores.push(m.nombre+': elige la personalización.');continue;}
   const cm=simple?0:m.ancho/100;if(!simple&&(!(cm>0)||cm>200)){errores.push(m.nombre+': revisa el ancho del logo (hasta 200 cm).');continue;}
   // El costo escrito del artículo fuera de catálogo viaja a la cotización del pedido (null = pendiente).
   selecciones.push({modelo:l.modelo,colorId:'',precio:f.visto,...(libre?{costo:f.costo??null}:{}),item:itemServicio({libre,nombre:m.nombre,tecnica:simple?'Solo prenda':m.tecnica,ubicacion:m.ubicacion||'',cm,piezas:n,logoNombre:simple?'':m.logoNombre||'',folio})});
   continue;
  }
  const etiqueta=m.nombre+(color?' · '+color.nombre:'');
  if(!color||!(p.colores||[]).includes(l.colorId)){errores.push(etiqueta+': elige un color del modelo.');continue;}
  if(cantidades.some(([,n])=>!Number.isSafeInteger(n)||n<0||n>9999)){errores.push(etiqueta+': revisa las cantidades.');continue;}
  const conTallas=(p.tallas||[]).length>0;
  if(conTallas&&cantidades.some(([t])=>!p.tallas.includes(t))){errores.push(etiqueta+': hay tallas que no existen en este modelo.');continue;}
  const total=cantidades.reduce((s,[,n])=>s+n,0),grupos=new Map();
  let falta=false;
  for(const [talla,n] of cantidades){
   const f=renglon(m.filas,conTallas?talla:'',color.nombre,total);
   if(!f){errores.push(etiqueta+': '+(conTallas?'la talla '+talla:'el modelo')+' no tiene precio cotizado para '+total+' piezas.');falta=true;break;}
   const g=grupos.get(f)||{fila:f,tallas:{}};g.tallas[talla]=n;grupos.set(f,g);
  }
  if(falta)continue;
  const sinPersonalizar=!m.tecnica,z=m.zonaDatos;
  if(!sinPersonalizar&&!z){errores.push(etiqueta+': confirma la zona del logo.');continue;}
  const cm=sinPersonalizar?0:m.ancho/100;if(!sinPersonalizar&&(!(cm>0)||cm>maxLogo(z,escala))){errores.push(etiqueta+': el logo de '+cm+' cm excede lo que se puede pedir en '+z.nombre+' (máx. '+maxLogo(z,escala)+' cm). Ajústalo en la cotización.');continue;}
  for(const g of grupos.values()){
   const orden=conTallas?p.tallas.filter(t=>g.tallas[t]):[],piezas=Object.values(g.tallas).reduce((s,n)=>s+n,0),minimo=Math.max(1,p.minimoPiezas||0),paso=p.pasoPiezas||1;
   if(piezas<minimo||(piezas-(p.minimoPiezas||0))%paso){errores.push(etiqueta+': '+(conTallas?orden.join(', ')+' suman ':'')+piezas+' piezas; el mínimo es '+minimo+(paso>1?' y luego de '+paso+' en '+paso:'')+'.');continue;}
   selecciones.push({modelo:l.modelo,colorId:l.colorId,precio:g.fila.visto,item:{
    p:p.id,nombre:p.nombre,sku:p.sku,medidas:p.medidas||'',detalleMedidas:'',color:color.nombre,colorId:color.id,colorCodigo:color.codigo||'',
    ...(conTallas?{tallasDetalle:Object.fromEntries(orden.map(t=>[t,g.tallas[t]])),tallas:orden.map(t=>t+' '+g.tallas[t]).join(' · ')}:{tallas:''}),
    tallasEtq:p.tallasNombre||'Tallas',renderOrientativo:!!p.renderOrientativo,tecnica:m.tecnica||'Solo prenda',zona:sinPersonalizar?'':z.nombre,cm,
    ...(!sinPersonalizar&&m.logoNombre&&m.logoGeometria?{logoGeometria:m.logoGeometria}:{}),piezas,logo:!sinPersonalizar&&m.logoNombre?'archivo «'+m.logoNombre+'»':sinPersonalizar?'Sin personalización':'Logo pendiente de recibir',colorLogo:'Original del archivo',pantone:'',
    notas:(folio?'Pedido desde la cotización '+folio+'. ':'')+(!sinPersonalizar&&!m.logoNombre?'Logo pendiente de recibir y confirmar antes de producción.':''),tieneLogo:!sinPersonalizar&&!!m.logoNombre,tieneRender:!sinPersonalizar&&!!m.logoNombre}});
  }
 }
 if(selecciones.length>20)errores.push('Un pedido admite hasta 20 selecciones (modelo, color y grupo de tallas). Divide la conversión.');
 if(!selecciones.length&&!errores.length)errores.push('Escribe al menos una cantidad.');
 const subtotal=selecciones.reduce((s,x)=>s+x.precio*x.item.piezas,0);
 return {selecciones,errores,subtotal,piezas:selecciones.reduce((s,x)=>s+x.item.piezas,0)};
}
