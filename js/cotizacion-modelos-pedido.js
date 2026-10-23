// Convierte una cotización por modelo y talla en las selecciones de una solicitud normal.
// Cada selección agrupa las tallas que comparten el mismo renglón cotizado, para que su precio sea exactamente el prometido.
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
