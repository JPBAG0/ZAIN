import {terminosPago,anticipoDe,normalizarPagos} from './cotizacion-pagos.js';
import {pesos} from './cotizacion-core.js?v=11';
import {logo,fecha,imagenDe} from './cotizacion-vista.js?v=6';
let biblioteca;
const cargarBiblioteca=()=>biblioteca||(biblioteca=import('./vendor/jspdf-4.2.1.umd.min.js').then(()=>globalThis.jspdf.jsPDF).catch(e=>{biblioteca=null;throw e;}));
// Lista comercial explícita. Nunca serializar el objeto privado en el archivo.
export function datosPDF(q){
 const keys=['pagos','destinatario','publicada_at','revision','vigencia','plazo','condiciones','bruto','descuento','envio','subtotal','impuesto','impuestos','total'];
 const pkeys=['indice','sku','nombre','color','tecnica','zona','cm','piezas','tallas','precio','descuento','importe'];
 return {...Object.fromEntries(keys.map(k=>[k,q[k]])),pagos:normalizarPagos(q.pagos),partidas:q.partidas.map(p=>Object.fromEntries(pkeys.map(k=>[k,p[k]])))};
}
const texto=v=>String(v??'').normalize('NFC').replace(/[\x00-\x08\x0b-\x1f\x7f]/g,'').replace(/\u202f|\u00a0/g,' ');
const numero=v=>v==null?'Pendiente':pesos(v).replace(/\u00a0/g,' ');
async function jpeg(src,max=900){
 const img=new Image();img.crossOrigin='anonymous';img.referrerPolicy='no-referrer';
 await new Promise((ok,mal)=>{const timer=setTimeout(()=>fin(Error('No se pudo cargar un diseño para el PDF. Actualiza e inténtalo de nuevo.')),15000);function fin(e){clearTimeout(timer);img.onload=img.onerror=null;e?mal(e):ok();}img.onload=()=>fin();img.onerror=()=>fin(Error('No se pudo cargar un diseño para el PDF. Actualiza e inténtalo de nuevo.'));img.src=src;});
 const escala=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.naturalWidth*escala));c.height=Math.max(1,Math.round(img.naturalHeight*escala));
 try{const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);return {src:c.toDataURL('image/jpeg',.92),w:c.width,h:c.height};}finally{c.width=c.height=0;img.removeAttribute('src');}
}
export async function crearPDF(cotizacion,{folio=cotizacion.folio||'',borrador=false,imagenes={}}={}){
 if(!Array.isArray(cotizacion.partidas)||!cotizacion.partidas.length||cotizacion.partidas.length>20)throw Error('No hay una cotización válida para descargar.');
 if(Object.values(imagenes).some(v=>v?.pendiente||v?.error))throw Error('Espera a que carguen todos los diseños. Si alguno falló, pulsa Actualizar para reintentar.');
 const q=datosPDF(cotizacion);if(q.pagos)q.condiciones=[terminosPago(q.pagos),'Anticipo: '+numero(anticipoDe(q.total,q.pagos)),q.condiciones].filter(Boolean).join('\n');const jsPDF=await cargarBiblioteca(),doc=new jsPDF({unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});
 doc.setProperties({title:'Cotización ZAIN '+folio,subject:borrador?'Borrador privado':'Cotización revisada',author:'ZAIN',creator:'ZAIN'});
 const azul=[48,53,255],tinta=[20,23,29],tenue=[98,109,125],linea=[220,225,232],papel=[239,242,246];
 const m=14,right=196,width=182,bottom=278;let y=14;
 const font=(size=9,bold=false,color=tinta)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);};
 const lines=(value,max,size=9,bold=false)=>{font(size,bold);return doc.splitTextToSize(texto(value),max);};
 const label=(value,x,yy,size=9,bold=false,color=tinta,align='left')=>{font(size,bold,color);doc.text(texto(value),x,yy,{align});};
 const rule=yy=>{doc.setDrawColor(...linea);doc.setLineWidth(.25);doc.line(m,yy,right,yy);};
 function siguiente(){doc.addPage();doc.setFillColor(...azul);doc.rect(m,12,width,1,'F');label('ZAIN · Cotización',m,21,10,true);label(folio,right,21,8,false,tenue,'right');y=29;}
 function espacio(h){if(y+h>bottom)siguiente();}
 const logoImg=await jpeg('data:image/svg+xml;base64,'+btoa(logo.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="740" height="300" ')),740);
 doc.setFillColor(...azul);doc.rect(m,12,width,1.5,'F');doc.addImage(logoImg.src,'JPEG',m,19,43,17.43,'marca');
 label('Uniformes y artículos personalizados',m,41,7,false,tenue);label('Cotización',right,28,23,true,tinta,'right');
 const folioLines=lines(folio,95,9,true);for(let i=0;i<folioLines.length;i++)label(folioLines[i],right,35+i*4,9,true,tenue,'right');
 label(borrador?'Borrador privado · Pendiente de publicación':q.revision?'Revisión '+q.revision:'Cotización revisada',right,42+Math.max(0,folioLines.length-1)*4,7,false,azul,'right');
 y=51+Math.max(0,folioLines.length-1)*4;
 const assets=new Map();
 for(const p of q.partidas){const image=imagenDe(p,imagenes);if(image){const key=image.src;let asset=assets.get(key);if(!asset){asset={...await jpeg(key),alias:'diseno-'+assets.size};assets.set(key,asset);}p.imagen={...asset,referencia:image.referencia};}}
 function dibujo(p,x,yy,w,h){if(p.imagen){const a=p.imagen,k=Math.min(w/a.w,h/a.h);doc.addImage(a.src,'JPEG',x+(w-a.w*k)/2,yy+(h-a.h*k)/2,a.w*k,a.h*k,a.alias);}else{label('Vista previa',x+w/2,yy+h/2,7,false,tenue,'center');label('por confirmar',x+w/2,yy+h/2+3.5,7,false,tenue,'center');}}
 label('Diseños de tu pedido',m,y,10,true);label(q.partidas.reduce((n,p)=>n+p.piezas,0)+' piezas · '+q.partidas.length+' selecciones',right,y,8,false,tenue,'right');y+=5;
 const cols=Math.min(q.partidas.length,4),gap=4,cw=(width-gap*(cols-1))/cols;
 for(let i=0;i<q.partidas.length;i+=cols){
  const row=q.partidas.slice(i,i+cols),nombres=row.map(p=>lines(p.nombre,cw,8,true)),meta=row.map(p=>lines(p.color+' · '+p.piezas+' piezas',cw,7));
  const h=33+Math.max(...nombres.map(a=>a.length))*3.2+Math.max(...meta.map(a=>a.length))*3+5;espacio(h);
  row.forEach((p,j)=>{const x=m+j*(cw+gap);dibujo(p,x,y,cw,27);label(p.imagen?.referencia?'Referencia del modelo':'Diseño solicitado',x+cw/2,y+30,6,false,tenue,'center');let yy=y+34;for(const l of nombres[j]){label(l,x+cw/2,yy,8,true,tinta,'center');yy+=3.2;}for(const l of meta[j]){label(l,x+cw/2,yy,7,false,tenue,'center');yy+=3;}});y+=h;
 }
 y+=3;espacio(27);rule(y);y+=6;
 const cliente=lines(q.destinatario||'Tu equipo',83,12,true),emision=borrador?'Pendiente de publicación':q.publicada_at?fecha(q.publicada_at):'Por acordar';
 label('Preparada para',m,y,7,false,tenue);label('Emisión',110,y,7,false,tenue);label('Válida hasta',right,y,7,false,tenue,'right');y+=5;
 for(let i=0;i<cliente.length;i++)label(cliente[i],m,y+i*4.6,12,true);
 for(const [value,x,align] of [[emision,110,'left'],[fecha(q.vigencia,true),right,'right']]){const a=lines(value,43,8,true);a.forEach((l,i)=>label(l,x,y+i*3.7,8,true,tinta,align));}
 y+=Math.max(cliente.length*4.6,8)+5;rule(y);y+=7;
 function tabla(){label('Tu selección',m,y,10,true);label('Piezas',120,y,7,false,tenue,'right');label('Unitario',149,y,7,false,tenue,'right');label('Desc.',166,y,7,false,tenue,'right');label('Importe',right,y,7,false,tenue,'right');y+=4;rule(y);y+=2;}
 espacio(15);tabla();
 for(const p of q.partidas){
  const nombre=lines(p.nombre,75,9,true),meta=lines([p.color,p.tecnica+(p.zona?' · '+p.zona:'')+(p.cm?' · '+p.cm+' cm':''),p.sku,p.tallas?'Tallas: '+p.tallas:''].filter(Boolean).join('\n'),75,7.5);
  const h=Math.max(24,nombre.length*3.8+meta.length*3.3+8);
  if(y+h>bottom){siguiente();tabla();}
  dibujo(p,m,y+2,15,19);let yy=y+5;for(const l of nombre){label(l,32,yy,9,true);yy+=3.8;}yy+=1;
  for(const l of meta){label(l,32,yy,7.5,false,tenue);yy+=3.3;}
  label(p.piezas,120,y+7,8,false,tinta,'right');label(numero(p.precio),149,y+7,8,false,tinta,'right');label(p.descuento?p.descuento/100+'%':'—',166,y+7,8,false,p.descuento?azul:tenue,'right');label(numero(p.importe),right,y+7,8,true,tinta,'right');
  y+=h;rule(y);y+=2;
 }
 y+=5;
 const totales=[['Productos',q.bruto],...(q.descuento?[['Descuento aplicado',-q.descuento]]:[]),['Envío',q.envio],['Subtotal',q.subtotal],[q.impuesto==null?'Impuesto por definir':'Impuesto '+q.impuesto/100+'%',q.impuestos]];
 const totalH=totales.length*5.5+25,plazo=lines(q.plazo||'Plazo y destino por confirmar con ZAIN.',81,8),intro=lines('Revisa diseño, colores, tallas y ubicación del logo. La cotización no inicia la producción.',81,8);
 espacio(Math.max(totalH,plazo.length*3.8+intro.length*3.8+17));const inicio=y;
 label('Para continuar',m,y+3,11,true);let yy=y+9;for(const l of intro){label(l,m,yy,8,false,tenue);yy+=3.8;}yy+=4;for(const l of plazo){label(l,m,yy,8,false,tenue);yy+=3.8;}
 const tx=114;let ty=y+3;
 for(const [name,value] of totales){label(name,tx,ty,8,false,tenue);label(numero(value),right,ty,8,true,tinta,'right');ty+=5.5;}
 ty+=2;doc.setFillColor(...azul);doc.rect(110,ty,86,23,'F');label('Total de la propuesta',115,ty+6,9,true,[255,255,255]);label(numero(q.total),191,ty+15,19,true,[255,255,255],'right');label('MXN',115,ty+20,7,false,[255,255,255]);
 const condicionesCortas=q.condiciones?lines(q.condiciones,81,8):[];
 const juntoAlTotal=condicionesCortas.length&&condicionesCortas.length<=8&&yy+11+condicionesCortas.length*4<=bottom;
 if(juntoAlTotal){yy+=8;label('Condiciones de tu cotización',m,yy,9,true);yy+=5;for(const l of condicionesCortas){label(l,m,yy,8,false,tenue);yy+=4;}}
 y=Math.max(inicio+totalH,yy)+7;
 if(q.condiciones&&!juntoAlTotal){espacio(14);label('Condiciones de tu cotización',m,y,10,true);y+=5;for(const l of lines(q.condiciones,width,8)){espacio(4);label(l,m,y,8,false,tenue);y+=4;}}
 // Los datos de contacto son configuración pública, no datos de compras.
 const C=globalThis.window?.ZAIN||{},contacto=[C.correo,C.whatsapp?'WhatsApp +'+String(C.whatsapp).replace(/\D/g,''):''].filter(Boolean).join(' · ');
 const paginas=doc.getNumberOfPages();
 for(let i=1;i<=paginas;i++){doc.setPage(i);rule(284);label('Renders orientativos; diseño final por confirmar.',m,289,6.5,false,tenue);label(i+' / '+paginas,right,289,7,false,tenue,'right');if(contacto)label(contacto,m,293,6.5,false,tenue);}
 return doc.output('blob');
}
export async function descargarPDF(q,options={}){
 const blob=await crearPDF(q,options),src=URL.createObjectURL(blob),a=document.createElement('a');
 const folio=String(options.folio||q.folio||'ZAIN').replace(/[^A-Za-z0-9_-]/g,'-').slice(0,80);
 a.href=src;a.download='Cotizacion-'+folio+(options.borrador?'-borrador':'')+'.pdf';a.rel='noopener';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(src),120000);
 return blob;
}
