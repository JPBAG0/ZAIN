// Cotización rápida (JP, 20-nov-2026): partidas libres con concepto, descripción, foto opcional, cantidad, precio y
// descuento, todo escrito a mano. Para lo que no está en el catálogo (termos, tazas con tampografía…).
// Importes en centavos y descuentos en puntos base (1000 = 10%). Nada de costos sale de aquí hacia el cliente.
import {pesos} from './cotizacion-core.js?v=24';
export const TEXTOS={titulo1:'Tu cotización,',titulo2:'lista para producir.',seccion:'Tu selección',etiqueta:'Precios por pieza',pasos:true,
 notas:'Imágenes ilustrativas; diseño final por confirmar.\nEsta cotización no es un comprobante fiscal.'};
const corto=(v,n)=>String(v??'').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g,'').trim().slice(0,n);
const entero=(n,min=0,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
export function normalizarTextos(t={}){
 const o={...TEXTOS};
 // Un título vacío regresa al texto de siempre; las notas al pie sí pueden quedar vacías.
 for(const k of ['titulo1','titulo2','seccion','etiqueta'])if(typeof t?.[k]==='string'&&t[k].trim())o[k]=corto(t[k],k==='etiqueta'?60:48);
 if(typeof t?.notas==='string')o.notas=corto(t.notas,600);
 if(typeof t?.pasos==='boolean')o.pasos=t.pasos;
 return o;
}
// Importe de una partida: cantidad × precio menos su descuento. null si falta la cantidad o el precio.
export function importeLinea({cantidad,precio,descuento=0}){
 if(cantidad==null||precio==null)return null;
 const bruto=cantidad*precio;return bruto-Math.round(bruto*(descuento||0)/10000);
}
// Rangos de piezas (JP, 26-nov-2026: «de tantas a tantas piezas a este precio»). Una partida tiene uno o varios
// {desde,hasta,precio,costo}; desde/hasta vacíos = cualquier cantidad. Texto corto para el PDF y la lista.
export function textoRango({desde=null,hasta=null}){
 if(desde!=null&&hasta!=null)return desde===hasta?desde+' pzas':desde+' a '+hasta+' pzas';
 if(desde!=null)return desde+' pzas o más';
 if(hasta!=null)return 'Hasta '+hasta+' pzas';
 return '';
}
// El rango que aplica a una cantidad; sin cantidad, solo si hay un único rango.
export function rangoDe(escalas,cantidad){
 if(cantidad==null)return escalas.length===1?escalas[0]:null;
 return escalas.find(e=>(e.desde??1)<=cantidad&&(e.hasta==null||cantidad<=e.hasta))||null;
}
export function comercialRapida(lineas,{folio='',destinatario='',impuesto=1600,vigencia='',plazo='',anticipo=null,concepto='',cargo=null,notas='',textos={}}={}){
 if(!Array.isArray(lineas)||!lineas.length)throw Error('Agrega al menos una partida.');
 if(lineas.length>20)throw Error('La cotización admite hasta 20 partidas.');
 if(!entero(impuesto,0,10000))throw Error('Selecciona cómo se presenta el IVA.');
 if(anticipo!=null&&!entero(anticipo,0,10000))throw Error('El anticipo va de 0 a 100%.');
 if(cargo!=null&&!entero(cargo))throw Error('Revisa el cargo único.');
 if(vigencia&&!/^\d{4}-\d{2}-\d{2}$/.test(vigencia))throw Error('Revisa la fecha de vigencia.');
 const partidas=lineas.map((l,i)=>{
  const nombre=corto(l.concepto,150);if(!nombre)throw Error('Escribe el concepto de la partida '+(i+1)+'.');
  if(l.cantidad!=null&&!entero(l.cantidad,1,999999))throw Error('Revisa la cantidad de '+nombre+'.');
  if(!entero(l.descuento||0,0,10000))throw Error('El descuento de '+nombre+' va de 0 a 100%.');
  // Partidas de antes (un solo precio) = un rango sin límites.
  const escalas=(Array.isArray(l.escalas)&&l.escalas.length?l.escalas:[{desde:null,hasta:null,precio:l.precio??null}]).map(e=>{
   if(e.precio!=null&&!entero(e.precio))throw Error('Revisa el precio de '+nombre+'.');
   if(e.desde!=null&&!entero(e.desde,1,999999)||e.hasta!=null&&!entero(e.hasta,1,999999))throw Error('Revisa las piezas de los rangos de '+nombre+'.');
   if(e.desde!=null&&e.hasta!=null&&e.hasta<e.desde)throw Error('En '+nombre+', «hasta» debe ser mayor que «desde».');
   return {desde:e.desde??null,hasta:e.hasta??null,precio:e.precio??null};
  });
  if(escalas.length>12)throw Error('Usa hasta 12 rangos en '+nombre+'.');
  const aplica=rangoDe(escalas,l.cantidad??null);
  if(l.cantidad!=null&&!aplica)throw Error('Ningún rango de '+nombre+' incluye '+l.cantidad+' piezas.');
  const precio=aplica?.precio??null,importe=importeLinea({cantidad:l.cantidad??null,precio,descuento:l.descuento||0});
  // Sin cantidad y con varios rangos, el cliente ve todos los precios por volumen.
  const porVolumen=l.cantidad==null&&escalas.length>1;
  return {indice:i,nombre,descripcion:corto(l.descripcion,400),piezas:l.cantidad??null,precio,descuento:l.descuento||0,importe,
   ...(porVolumen?{escalas:escalas.map(e=>({rango:textoRango(e),precio:e.precio}))}:{})};
 });
 const completa=partidas.every(p=>p.importe!=null),suma=a=>a.reduce((s,n)=>s+n,0);
 const cargos=cargo?[{concepto:corto(concepto,120)||'Cargo único',importe:cargo}]:[];
 const bruto=completa?suma(partidas.map(p=>p.piezas*p.precio)):null,neto=completa?suma(partidas.map(p=>p.importe)):null;
 const subtotal=completa?neto+suma(cargos.map(c=>c.importe)):null,impuestos=subtotal==null?null:Math.round(subtotal*impuesto/10000);
 return {tipo:'rapida',folio:corto(folio,40),destinatario:corto(destinatario,180),impuesto,vigencia:vigencia||'',plazo:corto(plazo,120),anticipo,cargos,notas:corto(notas,2000),textos:normalizarTextos(textos),
  partidas,bruto,descuento:completa?bruto-neto:null,subtotal,impuestos,total:subtotal==null?null:subtotal+impuestos};
}
// Documento para el PDF (crearPDF sin «sinCantidades»): la descripción va como subtítulo de la partida.
export function documentoRapida(q,{publicada_at=new Date().toISOString()}={}){
 return {destinatario:q.destinatario,publicada_at,vigencia:q.vigencia,plazo:q.plazo,condiciones:q.notas,pagos:q.anticipo==null?null:{anticipo:q.anticipo,instrucciones:''},
  cargos:q.cargos||[],impuesto:q.impuesto,bruto:q.bruto,descuento:q.descuento,envio:null,subtotal:q.subtotal,impuestos:q.impuestos,total:q.total,
  partidas:q.partidas.map(p=>({indice:p.indice,sku:'',nombre:p.nombre,color:p.descripcion,tecnica:'',zona:'',cm:'',tallas:'',piezas:p.piezas,precio:p.precio,descuento:p.descuento,importe:p.importe,
   ...(p.escalas?{preciosTalla:p.escalas.map(e=>({tallas:e.rango,piezas:null,precio:e.precio}))}:{})}))};
}
// Lo que pide crearPDF para usar los textos de la cotización rápida.
export function textosPDF(q){
 const t=normalizarTextos(q.textos),pct=q.anticipo==null?null:q.anticipo/100;
 return {titulo1:t.titulo1,titulo2:t.titulo2,estado:'Cotización',seccion:t.seccion,etiqueta:t.etiqueta+(q.impuesto?' · más IVA':''),sinEnvio:true,
  pasos:t.pasos?[['Confirma','Nos confirmas cantidades y diseño.'],['Anticipo',pct==null?'Acordamos contigo el anticipo.':'Con el '+pct+'% programamos tu producción.'],['Producción','Inicia al confirmar tu anticipo.'],['Entrega',q.plazo||'Plazo y destino por confirmar con ZAIN.']]:null,
  notas:t.notas.split('\n').map(s=>s.trim()).filter(Boolean).slice(0,6)};
}
export function textoRapida(q){
 const vence=q.vigencia?new Date(q.vigencia+'T12:00:00Z').toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric',timeZone:'America/Mexico_City'}):'';
 const lineas=q.partidas.map((p,i)=>[(i+1)+'. '+p.nombre,p.descripcion,p.escalas?p.escalas.map(e=>(e.rango?e.rango+': ':'')+(e.precio==null?'precio pendiente':pesos(e.precio)+' / pieza')).join('\n   '):p.piezas!=null&&p.precio!=null?p.piezas+' pzas × '+pesos(p.precio)+(p.descuento?' − '+p.descuento/100+'%':'')+' = '+pesos(p.importe):p.precio!=null?pesos(p.precio)+' / pieza':'Precio pendiente'].filter(Boolean).join('\n   '));
 const totales=q.total==null?[]:[...(q.descuento?['Descuento: −'+pesos(q.descuento)]:[]),...q.cargos.map(c=>c.concepto+': '+pesos(c.importe)),'Subtotal: '+pesos(q.subtotal),(q.impuesto?'IVA '+q.impuesto/100+'%: ':'Sin IVA: ')+pesos(q.impuestos),'Total: '+pesos(q.total)];
 return ['ZAIN · Cotización'+(q.folio?' '+q.folio:''),q.destinatario?'Para: '+q.destinatario:'',lineas.join('\n\n'),totales.join('\n'),
  [vence?'Válida hasta el '+vence:'',q.plazo?'Entrega: '+q.plazo:'',q.anticipo!=null?'Anticipo '+q.anticipo/100+'%':''].filter(Boolean).join(' · '),q.notas].filter(Boolean).join('\n\n');
}
