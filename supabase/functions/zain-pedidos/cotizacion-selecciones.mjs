// Las referencias de archivo proceden del pedido, nunca de rutas enviadas por el navegador.
import {mismaVista} from './cotizacion-selecciones.js';
export function validarSelecciones(lista,pedido,catalogo,validarPedido,fail){
 if(!Array.isArray(lista)||!lista.length||lista.length>20)fail(400,'La cotización admite de 1 a 20 partidas.');
 const archivos=[],items=lista.map((s,i)=>{
  if(!s||typeof s!=='object'||!s.item||typeof s.item!=='object'||s.origen!==null&&(!Number.isInteger(s.origen)||!pedido.items[s.origen]))fail(400,'Referencia de partida inválida.');
  const fuente=s.origen===null?null:pedido.items[s.origen],p=[...catalogo.productos,...catalogo.productosHistoricos||[]].find(p=>p.id===s.item.p||p.idPublico===s.item.p);
  if(!p||p.activo===false&&(!fuente||fuente.p!==p.id))fail(400,'Elige un modelo activo para la partida nueva.');
  if(p.tallas?.length){const cantidades=s.item.tallasDetalle;if(!cantidades||typeof cantidades!=='object'||Array.isArray(cantidades)||!Object.keys(cantidades).length||Object.entries(cantidades).some(([t,n])=>!p.tallas.includes(t)||!Number.isSafeInteger(n)||n<1||n>9999)||Object.values(cantidades).reduce((a,n)=>a+n,0)!==s.item.piezas)fail(400,'Revisa las tallas y su suma para el modelo.');}
  const original=(pedido.archivos||[]).filter(f=>f.item===s.origen),simple=s.item.tecnica==='Solo prenda',igual=mismaVista(fuente,s.item);
  const keepLogo=!simple&&!!fuente?.tieneLogo&&original.some(f=>f.kind==='logo'),keepRender=igual&&!!fuente?.tieneRender&&original.some(f=>f.kind==='render');
  const item={...s.item,color:String(s.item.color||'').replace(/ · \d+$/,''),tieneLogo:keepLogo,tieneRender:keepRender};
  if(keepLogo)item.logo=fuente.logo;
  if(keepRender){item.zona=fuente.zona;item.color=fuente.color;if(fuente.logoGeometria)item.logoGeometria=fuente.logoGeometria;}else delete item.logoGeometria;
  if(simple){item.logo='Sin personalización';item.zona='';item.cm=0;delete item.logoGeometria;}else if(!keepLogo)item.logo='Logo pendiente de confirmar';
  for(const f of original)if(f.kind==='logo'?keepLogo:f.kind==='render'?keepRender:true)archivos.push({...f,item:i});
  return item;
 });
 const validado=validarPedido({id:pedido.id,token:'a'.repeat(64),items,files:archivos},{catalogo,allowHistoricos:true,snapshot:true});
 return validado.items.map((item,i)=>{const p=[...catalogo.productos,...catalogo.productosHistoricos||[]].find(p=>p.id===item.p);if(p?.tallas?.length){item.tallasDetalle=Object.fromEntries(p.tallas.filter(t=>items[i].tallasDetalle[t]>0).map(t=>[t,items[i].tallasDetalle[t]]));item.tallas=Object.entries(item.tallasDetalle).map(([t,n])=>t+' '+n).join(' · ');}return {origen:lista[i].origen,item};});
}
