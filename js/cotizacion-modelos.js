import {pesos} from './cotizacion-core.js?v=16';
// Cotización unitaria: nunca se inventa un pedido ni una cantidad para elegir costos.
const max=100000000000;
const entero=(n,limite=max)=>{if(!Number.isSafeInteger(n)||n<0||n>limite)throw Error('Revisa los importes y porcentajes.');return n;};
const opcional=n=>n==null?null:entero(n);
export function rangoTallas(tallas){return tallas.length>2?tallas[0]+' a '+tallas.at(-1):tallas.join(' · ')||'Unitalla';}
export function filasModelo(producto,config){
 const prenda=config.prendas.find(p=>p.sku===producto.sku),bandas=prenda?.bandas||[];
 const tallas=producto.tallas?.length?producto.tallas:[...new Set(bandas.flatMap(b=>b.tallas))];
 const colores=producto.colores?.length?producto.colores:[...new Set(bandas.flatMap(b=>b.colores))];
 const porColor=bandas.some(b=>b.colores.length);
 const contextos=porColor?(colores.length?colores:['Por confirmar']):['Todos los colores'];
 const cortes=[...new Set([1,...bandas.flatMap(b=>[b.desdePiezas??1,...(b.hastaPiezas!=null?[b.hastaPiezas+1]:[])])])].sort((a,b)=>a-b);
 const filas=[];
 for(let i=0;i<cortes.length;i++)for(const color of contextos){
  const desde=cortes[i],hasta=cortes[i+1]?cortes[i+1]-1:null;
  let grupo=null;
  for(const talla of tallas.length?tallas:['']){
   const banda=bandas.find(b=>(!b.tallas.length||b.tallas.includes(talla))&&(!b.colores.length||b.colores.includes(color))&&desde>=(b.desdePiezas??1)&&(b.hastaPiezas==null||desde<=b.hastaPiezas));
   const costo=bandas.length?banda?.costo??null:prenda?.prenda??null;
   if(grupo&&grupo.costo===costo)grupo.tallas.push(talla);
   else{grupo={tallas:talla?[talla]:[],color,desde,hasta,costo,otros:prenda?.otros??0};filas.push(grupo);}
  }
 }
 // Unificar colores solamente cuando coinciden talla, costo y tramo.
 const unidos=[];
 for(const f of filas){
  const igual=unidos.find(g=>g.desde===f.desde&&g.hasta===f.hasta&&g.costo===f.costo&&JSON.stringify(g.tallas)===JSON.stringify(f.tallas));
  if(igual)igual.colores.push(f.color);else unidos.push({...f,colores:[f.color]});
 }
 return unidos.map((f,i)=>({...f,id:i,talla:rangoTallas(f.tallas),color:!porColor||f.colores.length===contextos.length?'Todos los colores':f.colores.join(' · '),volumen:cortes.length===1?'':f.hasta==null?'Pedido de '+f.desde+' piezas o más':'Pedido de '+f.desde+' a '+f.hasta+' piezas'}));
}
export function aplicacionArea(ancho,alto,tarifa){
 if(ancho==null||alto==null||tarifa==null)return null;
 entero(ancho,20000);entero(alto,20000);entero(tarifa);
 if(!ancho||!alto)throw Error('Confirma ancho y alto del diseño.');
 return entero(Number((BigInt(ancho)*BigInt(alto)*BigInt(tarifa)+99999999n)/100000000n));
}
// Redondeo hacia arriba del precio sugerido, en centavos: 1 (sin redondeo), 100 (peso cerrado) o 500 (múltiplos de $5).
export const REDONDEOS=[1,100,500];
export function precioFila(f,{margen=null,precio=null,aplicacion=0,redondeo=1}={}){
 opcional(f.costo);entero(f.otros??0);opcional(aplicacion);opcional(precio);
 if(margen!=null)entero(margen,9999);if(!REDONDEOS.includes(redondeo))throw Error('Revisa el redondeo de precios.');
 const costo=f.costo==null||aplicacion==null?null:entero(f.costo+(f.otros??0)+aplicacion);
 const exacto=costo==null||margen==null?null:Number((BigInt(costo)*10000n+BigInt(10000-margen)-1n)/BigInt(10000-margen));
 const sugerido=exacto==null?null:entero(Math.ceil(exacto/redondeo)*redondeo);
 const venta=precio??sugerido,utilidad=costo==null||venta==null?null:venta-costo;
 return {costo,sugerido,precio:venta,utilidad,margenReal:utilidad==null||!venta?null:Math.round(utilidad/venta*10000)};
}
// Proyección comercial explícita: no copiar modelos privados, bandas o fuentes al PDF/texto.
export function comercial(modelos,{destinatario='',impuesto=null,concepto='',cargo=null,notas='',folio='',vigencia='',plazo='',redondeo=1}={}){
 if(impuesto==null)throw Error('Selecciona cómo se presenta el IVA.');
 entero(impuesto,10000);opcional(cargo);
 if(vigencia&&!/^\d{4}-\d{2}-\d{2}$/.test(vigencia))throw Error('Revisa la fecha de vigencia.');
 const partidas=modelos.flatMap((m,modelo)=>m.filas.filter(f=>f.incluir!==false).map(f=>{
  const r=precioFila(f,{margen:f.margen,precio:f.precio,aplicacion:m.aplicacion,redondeo});
  if(r.precio==null)throw Error('Completa el precio o margen de '+m.nombre+' · '+f.talla+'.');
  return {modelo,nombre:m.nombre,sku:m.sku,zona:m.tecnica?(m.producto?.zonas||[]).find(z=>z.id===m.zona)?.nombre||'':'',medidas:m.tecnica&&m.ancho&&m.alto?(m.ancho/100)+' × '+(m.alto/100)+' cm':'',tallas:f.talla,color:f.color,volumen:f.volumen,personalizacion:m.tecnica||'Solo prenda',precio:r.precio};
 }));
 if(!partidas.length)throw Error('Agrega un modelo y al menos un rango de tallas.');
 return {folio:String(folio).trim().slice(0,40),destinatario:String(destinatario).trim().slice(0,180),impuesto,vigencia:vigencia||'',plazo:String(plazo).trim().slice(0,120),partidas,cargo:cargo?{concepto:String(concepto).trim().slice(0,120)||'Cargo único',importe:cargo}:null,notas:String(notas).trim().slice(0,2000)};
}
export function textoComercial(q){
 const vence=q.vigencia?new Date(q.vigencia+'T12:00:00Z').toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric',timeZone:'America/Mexico_City'}):'';
 return ['ZAIN · Cotización por modelo y tallas'+(q.folio?' · '+q.folio:''),q.destinatario?'Para: '+q.destinatario:'','Precios por pieza en MXN · '+(q.impuesto?'más IVA '+q.impuesto/100+'%':'sin impuesto (0%)'),[vence?'Válida hasta el '+vence:'',q.plazo?'Entrega: '+q.plazo:''].filter(Boolean).join(' · '),...q.partidas.map(p=>[p.nombre+' ('+p.sku+')',p.tallas,p.color,p.volumen,p.personalizacion,p.zona,p.medidas,pesos(p.precio)+' / pieza'].filter(Boolean).join(' · ')),q.cargo?q.cargo.concepto+' · cargo único: '+pesos(q.cargo.importe):'',q.notas,'Disponibilidad, cantidades y entrega se confirman al realizar el pedido.'].filter(Boolean).join('\n\n');
}
