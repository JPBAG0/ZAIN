import {descargarPDF} from './cotizacion-pdf.js?v=15';
// Adaptar únicamente el contenido al membrete v3 existente; el diseño vive en cotizacion-pdf.js.
export function adaptarModelos(q,imagenes=[]){
 const partidas=[],vistas={};
 const modelos=[...new Set(q.partidas.map(p=>p.modelo))];
 for(const modelo of modelos){
  const filas=q.partidas.filter(p=>p.modelo===modelo),primera=filas[0],vista=imagenes[modelo];
  for(let inicio=0;inicio<filas.length;inicio+=6){
   const indice=partidas.length,grupo=filas.slice(inicio,inicio+6);
   partidas.push({indice,sku:primera.sku,nombre:primera.nombre+(inicio?' (continuación)':''),color:vista?.nota||'',tecnica:primera.personalizacion,zona:primera.zona||'',cm:primera.medidas?.replace(/ cm$/,'')||'',tallas:'',piezas:null,precio:null,importe:null,descuento:0,preciosTalla:grupo.map(p=>({tallas:[p.tallas,p.color!=='Todos los colores'?p.color:'',p.volumen||''].filter(Boolean).join(' · '),precio:p.precio}))});
   if(vista?.src)vistas[indice]={src:vista.src,referencia:primera.personalizacion==='Solo prenda'};
  }
 }
 return {cotizacion:{destinatario:q.destinatario,publicada_at:new Date().toISOString(),vigencia:q.vigencia||'',plazo:q.plazo||'Por acordar con ZAIN.',condiciones:q.notas,pagos:q.anticipo==null?null:{anticipo:q.anticipo,instrucciones:''},cargos:q.cargo?[q.cargo]:[],partidas,impuesto:q.impuesto,bruto:null,descuento:0,envio:null,subtotal:null,impuestos:null,total:null},imagenes:vistas};
}
export async function descargarModelos(q,imagenes=[]){
 const a=adaptarModelos(q,imagenes);
 return descargarPDF(a.cotizacion,{sinCantidades:true,folio:q.folio||'COTIZACIÓN',imagenes:a.imagenes});
}
