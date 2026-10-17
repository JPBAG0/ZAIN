import {anticipoDe,normalizarPagos} from './cotizacion-pagos.js';
import {pesos} from './cotizacion-core.js?v=11';
import {logo,fecha,imagenDe,tallasDe} from './cotizacion-vista.js?v=7';
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
async function jpeg(src,max=900,fondo='#fff'){
 const img=new Image();img.crossOrigin='anonymous';img.referrerPolicy='no-referrer';
 await new Promise((ok,mal)=>{const timer=setTimeout(()=>fin(Error('No se pudo cargar un diseño para el PDF. Actualiza e inténtalo de nuevo.')),15000);function fin(e){clearTimeout(timer);img.onload=img.onerror=null;e?mal(e):ok();}img.onload=()=>fin();img.onerror=()=>fin(Error('No se pudo cargar un diseño para el PDF. Actualiza e inténtalo de nuevo.'));img.src=src;});
 const escala=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.naturalWidth*escala));c.height=Math.max(1,Math.round(img.naturalHeight*escala));
 try{const ctx=c.getContext('2d');ctx.fillStyle=fondo;ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);return {src:c.toDataURL('image/jpeg',.92),w:c.width,h:c.height};}finally{c.width=c.height=0;img.removeAttribute('src');}
}
// Membrete v3: mismo diseño que la vista HTML (portada oscura, tarjetas por partida, pago y pasos).
export async function crearPDF(cotizacion,{folio=cotizacion.folio||'',borrador=false,imagenes={}}={}){
 if(!Array.isArray(cotizacion.partidas)||!cotizacion.partidas.length||cotizacion.partidas.length>20)throw Error('No hay una cotización válida para descargar.');
 if(Object.values(imagenes).some(v=>v?.pendiente||v?.error))throw Error('Espera a que carguen todos los diseños. Si alguno falló, pulsa Actualizar para reintentar.');
 const q=datosPDF(cotizacion),jsPDF=await cargarBiblioteca(),doc=new jsPDF({unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});
 doc.setProperties({title:'Cotización ZAIN '+folio,subject:borrador?'Borrador privado':'Cotización revisada',author:'ZAIN',creator:'ZAIN'});
 const tinta=[17,17,19],tinta2=[59,59,64],tenue=[102,102,108],linea=[214,214,209],mesa=[231,231,227],algodon=[243,243,241],papel=[251,251,250],cobalto=[42,59,255],cobaltoTxt=[31,47,214],lila=[140,149,255],gris=[169,169,176],blanco=[255,255,255];
 const m=14,right=196,width=182,bottom=272;let y=0;
 const font=(size=9,bold=false,color=tinta,mono=false)=>{doc.setFont(mono?'courier':'helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);};
 const lines=(value,max,size=9,bold=false,mono=false)=>{font(size,bold,tinta,mono);return doc.splitTextToSize(texto(value),max);};
 const label=(value,x,yy,size=9,bold=false,color=tinta,align='left',mono=false)=>{font(size,bold,color,mono);doc.text(texto(value),x,yy,{align});};
 const etq=(value,x,yy,color=tenue,align='left')=>label(String(value).toUpperCase(),x,yy,6.5,false,color,align,true);
 const caja=(x,yy,w,h,fill=blanco,borde=linea,r=3)=>{doc.setFillColor(...fill);doc.setDrawColor(...borde);doc.setLineWidth(.25);doc.roundedRect(x,yy,w,h,r,r,borde?'FD':'F');};
 const punteada=(x1,yy,x2,color=linea)=>{doc.setDrawColor(...color);doc.setLineWidth(.3);doc.setLineDashPattern([1,1],0);doc.line(x1,yy,x2,yy);doc.setLineDashPattern([],0);};
 function fondo(){doc.setFillColor(...papel);doc.rect(0,0,210,297,'F');}
 function siguiente(){doc.addPage();fondo();doc.setFillColor(...tinta);doc.rect(0,0,210,16,'F');doc.addImage(logoBlanco.src,'JPEG',m,4.5,17,7,'marca-blanca');label(folio,right,10,8,true,blanco,'right',true);cinta(16);y=28;}
 function espacio(h){if(y+h>bottom)siguiente();}
 function cinta(yy){doc.setFillColor(...cobalto);for(let x=0;x<210;x+=8.5)doc.rect(x,yy,7,1.6,'F');}
 const svg=fill=>'data:image/svg+xml;base64,'+btoa(logo.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="740" height="300" fill="'+fill+'" '));
 const logoBlanco=await jpeg(svg('#ffffff'),740,'#111113');
 const unidades=q.partidas.reduce((n,p)=>n+p.piezas,0),pagos=q.pagos,pct=pagos?pagos.anticipo/100:null,anticipo=pagos?anticipoDe(q.total,pagos):null;
 const impuestoTxt=q.impuesto==null?'Impuesto por definir':q.impuesto===0?'Sin IVA · MXN':'Impuesto incluido · MXN';
 // Portada
 fondo();doc.setFillColor(...tinta);doc.rect(0,0,210,78,'F');
 doc.addImage(logoBlanco.src,'JPEG',m,13,34,13.8,'marca-blanca');etq('Uniformes · Bordado · Serigrafía · DTF',m,32,gris);
 etq('Cotización',right,15,gris,'right');label(folio,right,21,10,true,blanco,'right',true);
 const estado=(borrador?'Borrador privado':q.revision?'Revisión '+q.revision:'Cotización revisada').toUpperCase();font(6.5,false,blanco,true);const ew=doc.getTextWidth(estado)+6;doc.setDrawColor(70,70,76);doc.setFillColor(34,34,38);doc.roundedRect(right-ew,24.5,ew,5.6,2.8,2.8,'FD');label(estado,right-ew/2,28.3,6.5,false,blanco,'center',true);
 doc.setDrawColor(52,52,58);doc.setLineWidth(.25);doc.line(m,38,right,38);
 label('Tu pedido,',m,51,26,true,blanco);label('listo para producir.',m,62,26,true,lila);
 const para=lines('Preparada para '+(q.destinatario||'Tu equipo')+' · '+unidades.toLocaleString('es-MX')+(unidades===1?' pieza':' piezas')+' en '+q.partidas.length+(q.partidas.length===1?' selección':' selecciones'),118,8.5);label(para[0],m,70.5,8.5,false,[201,201,207]);
 etq('Total',right,50,gris,'right');label(numero(q.total),right,61,21,true,blanco,'right');label(impuestoTxt,right,67,7.5,false,gris,'right');
 cinta(78);
 // Datos rápidos
 y=80;const celdas=[['Emisión',borrador||!q.publicada_at?'Pendiente de publicación':fecha(q.publicada_at)],['Válida hasta',fecha(q.vigencia,true)],['Entrega',q.plazo||'Por acordar'],['Anticipo',pct===null?'Por acordar':pct+'% para iniciar']];
 const cw=width/4+3.5;let alto=0;const valores=celdas.map(([,v])=>lines(v,cw-8,8.5,true).slice(0,2));alto=Math.max(...valores.map(v=>v.length))*3.8+12;
 celdas.forEach(([k],i)=>{const x=i*(210/4);if(i)doc.setDrawColor(...linea),doc.line(x,y,x,y+alto);etq(k,x+(i?5:m),y+6);valores[i].forEach((l,j)=>label(l,x+(i?5:m),y+11+j*3.8,8.5,true));});
 y+=alto;doc.setDrawColor(...linea);doc.line(0,y,210,y);y+=10;
 // Partidas
 label('Tu selección',m,y,13,true);etq('Precios por pieza · personalización incluida',right,y,tenue,'right');y+=6;
 const assets=new Map();
 for(const p of q.partidas){const image=imagenDe(p,imagenes);if(image){const key=image.src;let asset=assets.get(key);if(!asset){asset={...await jpeg(key,900,'#e7e7e3'),alias:'diseno-'+assets.size};assets.set(key,asset);}p.imagen={...asset,referencia:image.referencia};}}
 const fw=46,ix=m+fw+6,iw=right-ix-5;
 q.partidas.forEach((p,i)=>{
  const nombre=lines(p.nombre,iw,11,true),sub=lines([p.color,p.zona].filter(Boolean).join(' · '),iw,8),chips=[p.tecnica,p.zona,p.cm?'Logo '+p.cm+' cm':'',p.sku].filter(Boolean),tallas=tallasDe(p.tallas),tallasTxt=!tallas&&p.tallas?lines('Tallas: '+p.tallas,iw,8):[];
  const h=Math.max(48,10+nombre.length*4.6+sub.length*3.6+8+(tallas?11:0)+tallasTxt.length*3.6+12);
  espacio(h+4);
  caja(m,y,width,h);doc.setFillColor(...mesa);doc.rect(m+.15,y+.15,fw,h-.3,'F');
  if(p.imagen){const a=p.imagen,bw=fw-8,bh=h-16,k=Math.min(bw/a.w,bh/a.h);doc.addImage(a.src,'JPEG',m+4+(bw-a.w*k)/2,y+6+(bh-a.h*k)/2,a.w*k,a.h*k,a.alias);}else{label('Vista previa',m+fw/2,y+h/2,7,false,tenue,'center');label('por confirmar',m+fw/2,y+h/2+3.5,7,false,tenue,'center');}
  etq(p.imagen?.referencia?'Referencia del modelo':p.imagen?'Diseño solicitado':'',m+3,y+h-3,tenue);
  doc.setFillColor(...tinta);doc.roundedRect(m+3,y+3,8,5,1.2,1.2,'F');label(String(i+1).padStart(2,'0'),m+7,y+6.6,7,true,blanco,'center',true);
  let yy=y+8;for(const l of nombre){label(l,ix,yy,11,true);yy+=4.6;}for(const l of sub){label(l,ix,yy,8,false,tenue);yy+=3.6;}yy+=1.5;
  let cx=ix;for(const c of chips){font(6.8,false,tinta2,true);const w=doc.getTextWidth(c)+4;if(cx+w>ix+iw){cx=ix;yy+=6;}caja(cx,yy-3.6,w,5,algodon,linea,1);label(c,cx+2,yy,6.8,false,tinta2,'left',true);cx+=w+1.8;}yy+=6;
  if(tallas){let tx=ix;for(const [t,n] of tallas){if(tx+11>ix+iw){break;}caja(tx,yy-2.5,10,9,blanco,linea,1.5);label(t,tx+5,yy+.6,5.8,false,tenue,'center',true);label(n,tx+5,yy+4.9,8.5,true,tinta,'center');tx+=11.5;}yy+=11;}
  for(const l of tallasTxt){label(l,ix,yy,8,false,tinta2);yy+=3.6;}
  const cy=y+h-6.5;punteada(ix,cy-5.5,ix+iw);
  font(8,false,tenue,true);let ox=ix;const parte=(t,c,b=false)=>{label(t,ox,cy,8,b,c,'left',true);font(8,b,c,true);ox+=doc.getTextWidth(t);};
  parte(String(p.piezas),tinta,true);parte(p.piezas===1?' pza × ':' pzas × ',tenue);parte(numero(p.precio),tinta,true);if(p.descuento)parte('  - '+p.descuento/100+'%',cobaltoTxt);
  label(numero(p.importe),ix+iw,cy+.5,12.5,true,tinta,'right');
  y+=h+4;
 });
 // Resumen y pago
 const filas=[['Productos',q.bruto],...(q.descuento?[['Descuento',-q.descuento,true]]:[]),['Envío',q.envio],['Subtotal',q.subtotal],[q.impuesto==null?'Impuesto por definir':'Impuesto '+q.impuesto/100+'%',q.impuestos]];
 const instr=pagos?.instrucciones?lines(pagos.instrucciones,80,7.5).slice(0,4):lines('Las condiciones de pago se acuerdan con ZAIN.',80,7.5);
 const bh=Math.max(14+filas.length*6+18,pagos?52+instr.length*3.4:24);
 y+=2;espacio(bh+4);const bw=(width-5)/2,x2=m+bw+5;
 caja(m,y,bw,bh);label('Resumen',m+6,y+9,10,true);let fy=y+17;
 for(const [k,v,d] of filas){label(k,m+6,fy,8.5,false,d?cobaltoTxt:tinta);label(d?'-'+numero(-v):numero(v),m+bw-6,fy,8.5,true,d?cobaltoTxt:tinta,'right');fy+=6;}
 doc.setFillColor(...cobalto);doc.roundedRect(m+6,fy-1,bw-12,13,2,2,'F');etq('Total',m+10,fy+6.8,blanco);label(numero(q.total),m+bw-10,fy+7.6,14,true,blanco,'right');
 caja(x2,y,bw,bh);label('Cómo se paga',x2+6,y+9,10,true);
 if(pagos){const by=y+14;doc.setFillColor(...mesa);doc.roundedRect(x2+6,by,bw-12,3.5,1.75,1.75,'F');doc.setFillColor(...tinta);const pw=(bw-12)*Math.max(0,Math.min(100,pct))/100;if(pw>0)doc.roundedRect(x2+6,by,pw,3.5,1.75,1.75,'F');
  const py=by+7,pbw=(bw-15)/2;doc.setFillColor(...tinta);doc.roundedRect(x2+6,py,pbw,21,2,2,'F');doc.setFillColor(...algodon);doc.roundedRect(x2+9+pbw,py,pbw,21,2,2,'F');
  etq('Anticipo '+pct+'%',x2+9,py+5.5,gris);label(numero(anticipo),x2+9,py+12.5,11.5,true,blanco);label('Para programar la producción',x2+9,py+17.5,6.5,false,[201,201,207]);
  etq('Saldo '+Math.round((100-pct)*100)/100+'%',x2+12+pbw,py+5.5);label(q.total==null?'Pendiente':numero(q.total-anticipo),x2+12+pbw,py+12.5,11.5,true);label('Antes del envío',x2+12+pbw,py+17.5,6.5,false,tenue);
  let iy=py+27;for(const l of instr){label(l,x2+6,iy,7.5,false,tenue);iy+=3.4;}
 }else{let iy=y+17;for(const l of instr){label(l,x2+6,iy,8,false,tenue);iy+=3.6;}}
 y+=bh+12;
 // Cómo seguimos
 const pasos=[['Acepta en línea','Desde tu enlace de Mi pedido.'],['Anticipo',pagos?'Con el '+pct+'% programamos tu producción.':'Acordamos contigo el anticipo.'],['Producción','Inicia al confirmar tu anticipo.'],['Entrega',q.plazo||'Plazo y destino por confirmar con ZAIN.']];
 const pw=width/4,desc=pasos.map(([,d])=>lines(d,pw-6,7.5).slice(0,4));espacio(24+Math.max(...desc.map(d=>d.length))*3.4);
 label('Cómo seguimos',m,y,13,true);y+=9;punteada(m+4,y,right-6,tinta);
 pasos.forEach(([t],i)=>{const x=m+i*pw;doc.setDrawColor(...(i?tinta:cobalto));doc.setFillColor(...(i?papel:cobalto));doc.setLineWidth(.5);doc.circle(x+4,y,3.6,'FD');label(String(i+1),x+4,y+1.2,7.5,true,i?tinta:blanco,'center',true);label(t,x,y+9,9,true);desc[i].forEach((l,j)=>label(l,x,y+13.5+j*3.4,7.5,false,tenue));});
 y+=16+Math.max(...desc.map(d=>d.length))*3.4+4;
 // Condiciones y notas
 if(q.condiciones){const c=lines(q.condiciones,width-12,8);espacio(14+Math.min(c.length,6)*3.8);doc.setFillColor(...algodon);doc.rect(m,y,width,10+c.length*3.8,'F');doc.setFillColor(...tinta);doc.rect(m,y,.9,10+c.length*3.8,'F');label('Condiciones de tu cotización',m+5,y+6,8.5,true);let cy=y+11;for(const l of c){if(cy>bottom){siguiente();cy=y;}label(l,m+5,cy,8,false,tinta2);cy+=3.8;}y=cy+5;}
 const notas=['Renders orientativos; diseño final por confirmar.','La aceptación de la cotización no registra un pago.','Precios por pieza con personalización incluida.','Esta cotización no es un comprobante fiscal.'];
 espacio(14);notas.forEach((n,i)=>label('— '+n,m+(i%2)*(width/2),y+Math.floor(i/2)*5,7.5,false,tenue));
 // Pie en cada página. Los datos de contacto son configuración pública, no datos de compras.
 const C=globalThis.window?.ZAIN||{},ig=String(C.instagram||'').match(/instagram\.com\/([A-Za-z0-9._]+)/)?.[1];
 const contacto=[C.correo,C.whatsapp?'WhatsApp +'+String(C.whatsapp).replace(/\D/g,''):'',ig?'@'+ig:'',C.ciudad].filter(Boolean).join('   ');
 const paginas=doc.getNumberOfPages();
 for(let i=1;i<=paginas;i++){doc.setPage(i);doc.setFillColor(...algodon);doc.rect(0,282,210,15,'F');doc.setDrawColor(...linea);doc.setLineWidth(.25);doc.line(0,282,210,282);if(contacto)label(contacto,m,290.5,7,false,tinta2,'left',true);label(i+' / '+paginas,right,290.5,7,false,tenue,'right',true);}
 return doc.output('blob');
}
export async function descargarPDF(q,options={}){
 const blob=await crearPDF(q,options),src=URL.createObjectURL(blob),a=document.createElement('a');
 const folio=String(options.folio||q.folio||'ZAIN').replace(/[^A-Za-z0-9_-]/g,'-').slice(0,80);
 a.href=src;a.download='Cotizacion-'+folio+(options.borrador?'-borrador':'')+'.pdf';a.rel='noopener';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(src),120000);
 return blob;
}
