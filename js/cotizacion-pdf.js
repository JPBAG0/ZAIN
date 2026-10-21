import {anticipoDe,normalizarPagos} from './cotizacion-pagos.js';
import {pesos} from './cotizacion-core.js?v=16';
import {logo,fecha,imagenDe,tallasDe} from './cotizacion-vista.js?v=11';
let biblioteca;
const cargarBiblioteca=()=>biblioteca||(biblioteca=import('./vendor/jspdf-4.2.1.umd.min.js').then(()=>globalThis.jspdf.jsPDF).catch(e=>{biblioteca=null;throw e;}));
// Lista comercial explícita. Nunca serializar el objeto privado en el archivo.
export function datosPDF(q){
 const keys=['pagos','cargos','destinatario','publicada_at','revision','vigencia','plazo','condiciones','bruto','descuento','envio','subtotal','impuesto','impuestos','total'];
 const pkeys=['indice','sku','nombre','color','tecnica','zona','cm','piezas','tallas','precio','preciosTalla','descuento','importe'];
 return {...Object.fromEntries(keys.map(k=>[k,q[k]])),pagos:normalizarPagos(q.pagos),partidas:q.partidas.map(p=>Object.fromEntries(pkeys.map(k=>[k,p[k]])))};
}
const texto=v=>String(v??'').normalize('NFC').replace(/[\x00-\x08\x0b-\x1f\x7f]/g,'').replace(/\u202f|\u00a0/g,' ');
const numero=v=>v==null?'Pendiente':pesos(v).replace(/\u00a0/g,' ');
// Caja del contenido: ignora márgenes transparentes o del color de las esquinas. Null si no hay nada que recortar.
function contenido(ctx,w,h){
 const d=ctx.getImageData(0,0,w,h).data,px=i=>[d[i],d[i+1],d[i+2],d[i+3]],esq=px(0),opaco=[0,(w-1)*4,(h-1)*w*4,(h*w-1)*4].every(i=>d[i+3]>250);
 const vacio=i=>d[i+3]<16||opaco&&Math.abs(d[i]-esq[0])+Math.abs(d[i+1]-esq[1])+Math.abs(d[i+2]-esq[2])<24;
 let x0=w,y0=h,x1=-1,y1=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(!vacio((y*w+x)*4)){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 if(x1<0)return null;const pad=Math.round(Math.max(x1-x0,y1-y0)*.04);x0=Math.max(0,x0-pad);y0=Math.max(0,y0-pad);x1=Math.min(w-1,x1+pad);y1=Math.min(h-1,y1+pad);
 return x1-x0+1<w*.97||y1-y0+1<h*.97?{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1}:null;
}
async function jpeg(src,max=900,fondo='#fff',recortar=false){
 const img=new Image();img.crossOrigin='anonymous';img.referrerPolicy='no-referrer';
 await new Promise((ok,mal)=>{const timer=setTimeout(()=>fin(Error('No se pudo cargar un diseño para el PDF. Actualiza e inténtalo de nuevo.')),15000);function fin(e){clearTimeout(timer);img.onload=img.onerror=null;e?mal(e):ok();}img.onload=()=>fin();img.onerror=()=>fin(Error('No se pudo cargar un diseño para el PDF. Actualiza e inténtalo de nuevo.'));img.src=src;});
 const escala=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.naturalWidth*escala));c.height=Math.max(1,Math.round(img.naturalHeight*escala));
 const t=recortar?document.createElement('canvas'):null;
 try{
  let caja=null;if(t){t.width=c.width;t.height=c.height;const tx=t.getContext('2d',{willReadFrequently:true});tx.drawImage(img,0,0,t.width,t.height);try{caja=contenido(tx,t.width,t.height);}catch{caja=null;}}
  if(caja){c.width=caja.w;c.height=caja.h;}
  const ctx=c.getContext('2d');ctx.fillStyle=fondo;ctx.fillRect(0,0,c.width,c.height);
  if(caja)ctx.drawImage(t,caja.x,caja.y,caja.w,caja.h,0,0,caja.w,caja.h);else ctx.drawImage(img,0,0,c.width,c.height);
  return {src:c.toDataURL('image/jpeg',.92),w:c.width,h:c.height};
 }finally{c.width=c.height=0;if(t)t.width=t.height=0;img.removeAttribute('src');}
}
// Membrete v3: mismo diseño que la vista HTML (portada oscura, tarjetas por partida, pago y pasos).
export async function crearPDF(cotizacion,{folio=cotizacion.folio||'',borrador=false,imagenes={},sinCantidades=false}={}){
 if(!Array.isArray(cotizacion.partidas)||!cotizacion.partidas.length||cotizacion.partidas.length>(sinCantidades?400:20))throw Error('No hay una cotización válida para descargar.');
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
 // Sin cantidades: el precio por pieza más bajo sustituye al total como cifra principal.
 const desde=sinCantidades?Math.min(...q.partidas.flatMap(p=>(p.preciosTalla||[]).map(g=>g.precio)).filter(Number.isSafeInteger)):null;
 const unidades=q.partidas.reduce((n,p)=>n+p.piezas,0),pagos=q.pagos,pct=pagos?pagos.anticipo/100:null,anticipo=pagos?anticipoDe(q.total,pagos):null;
 const impuestoTxt=q.impuesto==null?'Impuesto por definir':q.impuesto===0?'Sin IVA · MXN':sinCantidades?'Más IVA '+q.impuesto/100+'% · MXN':'Impuesto incluido · MXN';
 // Portada
 fondo();doc.setFillColor(...tinta);doc.rect(0,0,210,64,'F');
 doc.addImage(logoBlanco.src,'JPEG',m,10,29,11.8,'marca-blanca');etq('Uniformes · Bordado · Serigrafía · DTF',m,26,gris);
 etq('Cotización',right,12,gris,'right');label(folio,right,17.5,10,true,blanco,'right',true);
 const estado=(sinCantidades?'Cotización por tallas':borrador?'Borrador privado':q.revision?'Revisión '+q.revision:'Cotización revisada').toUpperCase();font(6.5,false,blanco,true);const ew=doc.getTextWidth(estado)+6;doc.setDrawColor(70,70,76);doc.setFillColor(34,34,38);doc.roundedRect(right-ew,20.5,ew,5.6,2.8,2.8,'FD');label(estado,right-ew/2,24.3,6.5,false,blanco,'center',true);
 doc.setDrawColor(52,52,58);doc.setLineWidth(.25);doc.line(m,31,right,31);
 label(sinCantidades?'Tu cotización,':'Tu pedido,',m,41.5,21,true,blanco);label(sinCantidades?'por modelo y talla.':'listo para producir.',m,50.5,21,true,lila);
 const para=lines('Preparada para '+(q.destinatario||'Tu equipo')+(sinCantidades?' · Precios por talla':' · '+unidades.toLocaleString('es-MX')+(unidades===1?' pieza':' piezas')+' en '+q.partidas.length+(q.partidas.length===1?' selección':' selecciones')),118,8.5);label(para[0],m,58,8.5,false,[201,201,207]);
 etq(sinCantidades?'Desde':'Total',right,41,gris,'right');label(sinCantidades?numero(desde)+' / pza':numero(q.total),right,50.5,19,true,blanco,'right');label(impuestoTxt,right,56.5,7.5,false,gris,'right');
 cinta(64);
 // Datos rápidos
 y=65.6;const celdas=[['Emisión',borrador||!q.publicada_at?'Pendiente de publicación':fecha(q.publicada_at)],['Válida hasta',fecha(q.vigencia,true)],['Entrega',q.plazo||'Por acordar'],sinCantidades?['Cantidades','Por definir']:['Anticipo',pct===null?'Por acordar':pct+'% para iniciar']];
 const cw=width/4+3.5;let alto=0;const valores=celdas.map(([,v])=>lines(v,cw-8,8.5,true).slice(0,2));alto=Math.max(...valores.map(v=>v.length))*3.8+10;
 celdas.forEach(([k],i)=>{const x=i*(210/4);if(i)doc.setDrawColor(...linea),doc.line(x,y,x,y+alto);etq(k,x+(i?5:m),y+6);valores[i].forEach((l,j)=>label(l,x+(i?5:m),y+10.5+j*3.8,8.5,true));});
 y+=alto;doc.setDrawColor(...linea);doc.line(0,y,210,y);y+=8;
 // Partidas
 label('Tu selección',m,y,11.5,true);etq('Precios por pieza · personalización incluida',right,y,tenue,'right');y+=4.5;
 const assets=new Map();
 for(const p of q.partidas){const image=imagenDe(p,imagenes);if(image){const key=image.src;let asset=assets.get(key);if(!asset){asset={...await jpeg(key,900,'#e7e7e3',true),alias:'diseno-'+assets.size};assets.set(key,asset);}p.imagen={...asset,referencia:image.referencia};}}
 const fw=36,ix=m+fw+6,iw=right-ix-5;
 q.partidas.forEach((p,i)=>{
  const nombre=lines(p.nombre,iw,10,true),sub=lines(p.color||'',iw,7.5),chips=[p.tecnica,p.zona,p.cm?'Logo '+p.cm+' cm':'',p.sku].filter(Boolean),tallas=tallasDe(p.tallas),tallasTxt=!tallas&&p.tallas?lines('Tallas: '+p.tallas,iw,7.5):[];
  const grupos=p.preciosTalla?.length?p.preciosTalla:null,unitarias=sinCantidades?(grupos||[]).map(g=>({...g,lineas:lines(g.tallas,iw-40,8,false,true)})):null,extra=unitarias?Math.max(0,unitarias.reduce((n,g)=>n+g.lineas.length,0)-1)*4.5:grupos?(grupos.length-1)*4.5:0;
  const h=Math.max(36,8+nombre.length*4.2+sub.length*3.3+6.5+(tallas?10.5:0)+tallasTxt.length*3.3+11+extra);
  espacio(h+3);
  caja(m,y,width,h);doc.setFillColor(...mesa);doc.rect(m+.15,y+.15,fw,h-.3,'F');
  if(p.imagen){const a=p.imagen,bw=fw-5,bh=h-11.5,k=Math.min(bw/a.w,bh/a.h);doc.addImage(a.src,'JPEG',m+2.5+(bw-a.w*k)/2,y+4.5+(bh-a.h*k)/2,a.w*k,a.h*k,a.alias);}else{label('Vista previa',m+fw/2,y+h/2,7,false,tenue,'center');label('por confirmar',m+fw/2,y+h/2+3.5,7,false,tenue,'center');}
  font(5.5,false,tenue,true);label((p.imagen?.referencia?'Referencia del modelo':p.imagen?'Diseño solicitado':'').toUpperCase(),m+2.5,y+h-2.5,5.5,false,tenue,'left',true);
  doc.setFillColor(...tinta);doc.roundedRect(m+3,y+3,8,5,1.2,1.2,'F');label(String(i+1).padStart(2,'0'),m+7,y+6.6,7,true,blanco,'center',true);
  let yy=y+7;for(const l of nombre){label(l,ix,yy,10,true);yy+=4.2;}for(const l of sub){label(l,ix,yy,7.5,false,tenue);yy+=3.3;}yy+=1.5;
  let cx=ix;for(const c of chips){font(6.3,false,tinta2,true);const w=doc.getTextWidth(c)+3.6;if(cx+w>ix+iw){cx=ix;yy+=5.5;}caja(cx,yy-3.3,w,4.6,algodon,linea,1);label(c,cx+1.8,yy,6.3,false,tinta2,'left',true);cx+=w+1.6;}yy+=5.5;
  if(tallas){let tx=ix;for(const [t,n] of tallas){if(tx+11>ix+iw){break;}caja(tx,yy-2.5,10,9,blanco,linea,1.5);label(t,tx+5,yy+.6,5.8,false,tenue,'center',true);label(n,tx+5,yy+4.9,8.5,true,tinta,'center');tx+=11.5;}yy+=10.5;}
  for(const l of tallasTxt){label(l,ix,yy,7.5,false,tinta2);yy+=3.3;}
  const cy=y+h-5.5,gy=cy-extra;punteada(ix,gy-4.5,ix+iw);
  let ox,ly;const parte=(t,c,b=false)=>{label(t,ox,ly,8,b,c,'left',true);font(8,b,c,true);ox+=doc.getTextWidth(t);};
  // Tallas con distinto costo: un renglón por grupo dentro de la misma partida.
  if(unitarias){let uy=gy;for(const g of unitarias){g.lineas.forEach((l,j)=>label(l,ix,uy+j*4.5,8,false,tinta2,'left',true));label(numero(g.precio)+' / pza',ix+iw,uy,9,true,tinta,'right');uy+=g.lineas.length*4.5;}}
  else (grupos||[{piezas:p.piezas,precio:p.precio}]).forEach((g,k)=>{ox=ix;ly=gy+k*4.5;if(g.tallas){parte(g.tallas,tinta2);ox=Math.max(ox+2,ix+22);}parte(String(g.piezas),tinta,true);parte(g.piezas===1?' pza × ':' pzas × ',tenue);parte(numero(g.precio),tinta,true);if(p.descuento&&k===(grupos?grupos.length-1:0))parte('  - '+p.descuento/100+'%',cobaltoTxt);});
  if(!sinCantidades)label(numero(p.importe),ix+iw,cy+.5,11.5,true,tinta,'right');
  y+=h+3;
 });
 // Cargos únicos (ponchado por logo): partida propia, una vez por pedido.
 for(const c of q.cargos||[]){espacio(17);caja(m,y,width,14);etq('Cargo único · una vez',m+5,y+5.5);label(lines(c.concepto,width-60,10,true)[0],m+5,y+10.5,10,true);label(numero(c.importe),right-5,y+9.5,11.5,true,tinta,'right');y+=17;}
 // Resumen y pago. Sin cantidades no hay importes que resumir: el anticipo va en «Cómo seguimos».
 if(!sinCantidades){
 const filas=sinCantidades?[['Precios','Por pieza · MXN'],['IVA',q.impuesto==null?'Por definir':q.impuesto?'Más '+q.impuesto/100+'%':'Sin IVA'],...(q.cargos||[]).map(c=>[lines(c.concepto,50,8)[0]+' (una vez)',numero(c.importe)]),['Válida hasta',fecha(q.vigencia,true)]]:[['Productos',q.bruto],...(q.descuento?[['Descuento',-q.descuento,true]]:[]),...(q.cargos||[]).map(c=>[lines(c.concepto,50,8)[0],c.importe]),['Envío',q.envio],['Subtotal',q.subtotal],[q.impuesto==null?'Impuesto por definir':'Impuesto '+q.impuesto/100+'%',q.impuestos]];
 const instr=pagos?.instrucciones?lines(pagos.instrucciones,80,7).slice(0,4):lines('Las condiciones de pago se acuerdan con ZAIN.',80,7);
 const bh=Math.max(12+filas.length*4.8+14,pagos?39+instr.length*3.1:22);
 y+=1;espacio(bh+3);const bw=(width-5)/2,x2=m+bw+5;
 caja(m,y,bw,bh);label('Resumen',m+5,y+7.5,9.5,true);let fy=y+14;
 for(const [k,v,d] of filas){label(k,m+5,fy,8,false,d?cobaltoTxt:tinta);label(sinCantidades?v:d?'-'+numero(-v):numero(v),m+bw-5,fy,8,true,d?cobaltoTxt:tinta,'right');fy+=4.8;}
 doc.setFillColor(...cobalto);doc.roundedRect(m+5,fy-1.5,bw-10,10,2,2,'F');etq(sinCantidades?'Desde':'Total',m+9,fy+4.8,blanco);label(sinCantidades?numero(desde)+' / pza':numero(q.total),m+bw-9,fy+5.5,12.5,true,blanco,'right');
 caja(x2,y,bw,bh);label('Cómo se paga',x2+5,y+7.5,9.5,true);
 if(pagos){const by=y+11;doc.setFillColor(...mesa);doc.roundedRect(x2+5,by,bw-10,3,1.5,1.5,'F');doc.setFillColor(...tinta);const pw=(bw-10)*Math.max(0,Math.min(100,pct))/100;if(pw>0)doc.roundedRect(x2+5,by,pw,3,1.5,1.5,'F');
  const py=by+5.5,pbw=(bw-13)/2;doc.setFillColor(...tinta);doc.roundedRect(x2+5,py,pbw,17,2,2,'F');doc.setFillColor(...algodon);doc.roundedRect(x2+8+pbw,py,pbw,17,2,2,'F');
  etq('Anticipo '+pct+'%',x2+8,py+4.8,gris);label(numero(anticipo),x2+8,py+10.5,10.5,true,blanco);label('Para programar la producción',x2+8,py+14.5,6,false,[201,201,207]);
  etq('Saldo '+Math.round((100-pct)*100)/100+'%',x2+11+pbw,py+4.8);label(q.total==null?'Pendiente':numero(q.total-anticipo),x2+11+pbw,py+10.5,10.5,true);label('Antes del envío',x2+11+pbw,py+14.5,6,false,tenue);
  let iy=py+22;for(const l of instr){label(l,x2+5,iy,7,false,tenue);iy+=3.1;}
 }else{let iy=y+14;for(const l of instr){label(l,x2+5,iy,7.5,false,tenue);iy+=3.3;}}
 y+=bh+8;
 }else y+=4;
 // Cómo seguimos
 const pasos=sinCantidades?[['Confirma tu selección','Nos dices modelos, tallas y cantidades.'],['Anticipo',pagos?'Con el '+pct+'% programamos tu producción; el '+Math.round((100-pct)*100)/100+'% restante, antes del envío.':'Acordamos contigo el anticipo.'],['Producción','Inicia al confirmar tu anticipo.'],['Entrega',q.plazo||'Plazo y destino por confirmar con ZAIN.']]:[['Acepta en línea','Desde tu enlace de Mi pedido.'],['Anticipo',pagos?'Con el '+pct+'% programamos tu producción.':'Acordamos contigo el anticipo.'],['Producción','Inicia al confirmar tu anticipo.'],['Entrega',q.plazo||'Plazo y destino por confirmar con ZAIN.']];
 const pw=width/4,desc=pasos.map(([,d])=>lines(d,pw-6,7).slice(0,4));espacio(19+Math.max(...desc.map(d=>d.length))*3.1);
 label('Cómo seguimos',m,y,11.5,true);y+=7;punteada(m+4,y,right-6,tinta);
 pasos.forEach(([t],i)=>{const x=m+i*pw;doc.setDrawColor(...(i?tinta:cobalto));doc.setFillColor(...(i?papel:cobalto));doc.setLineWidth(.5);doc.circle(x+3.5,y,3,'FD');label(String(i+1),x+3.5,y+1.1,7,true,i?tinta:blanco,'center',true);label(t,x,y+7.5,8.5,true);desc[i].forEach((l,j)=>label(l,x,y+11.5+j*3.1,7,false,tenue));});
 y+=13.5+Math.max(...desc.map(d=>d.length))*3.1+1;
 // Condiciones y notas
 if(q.condiciones){const c=lines(q.condiciones,width-12,8);espacio(14+Math.min(c.length,6)*3.8);doc.setFillColor(...algodon);doc.rect(m,y,width,10+c.length*3.8,'F');doc.setFillColor(...tinta);doc.rect(m,y,.9,10+c.length*3.8,'F');label('Condiciones de tu cotización',m+5,y+6,8.5,true);let cy=y+11;for(const l of c){if(cy>bottom){siguiente();cy=y;}label(l,m+5,cy,8,false,tinta2);cy+=3.8;}y=cy+5;}
 const notas=sinCantidades?['Renders orientativos; diseño final por confirmar.','Cantidades y disponibilidad se acuerdan con ZAIN.','Precios por pieza según modelo y talla.','Esta cotización no es un comprobante fiscal.']:['Renders orientativos; diseño final por confirmar.','La aceptación de la cotización no registra un pago.','Precios por pieza con personalización incluida.','Esta cotización no es un comprobante fiscal.'];
 if(y+5>279.5)siguiente();notas.forEach((n,i)=>label('— '+n,m+(i%2)*(width/2),y+Math.floor(i/2)*4.2,7,false,tenue));
 // Pie en cada página. Los datos de contacto son configuración pública, no datos de compras.
 const C=globalThis.window?.ZAIN||{},ig=String(C.instagram||'').match(/instagram\.com\/([A-Za-z0-9._]+)/)?.[1];
 const contacto=[C.correo,C.whatsapp?'WhatsApp +'+String(C.whatsapp).replace(/\D/g,''):'',ig?'@'+ig:'',C.ciudad].filter(Boolean).join('   ');
 const wa=String(C.whatsapp||'').replace(/\D/g,''),enlace=/^\d{8,15}$/.test(wa)?'https://wa.me/'+wa+'?text='+encodeURIComponent('Hola ZAIN, quiero revisar mi cotización. Folio: '+folio):'',verde=[17,130,63],bw2=33;
 const paginas=doc.getNumberOfPages();
 // Botón "Hablar con ZAIN" igual que la vista HTML; en el PDF es un enlace a WhatsApp.
 for(let i=1;i<=paginas;i++){doc.setPage(i);doc.setFillColor(...algodon);doc.rect(0,282,210,15,'F');doc.setDrawColor(...linea);doc.setLineWidth(.25);doc.line(0,282,210,282);if(contacto)label(contacto,m,290.5,7,false,tinta2,'left',true);
  const px=enlace?right-bw2-4:right;label(i+' / '+paginas,px,290.5,7,false,tenue,'right',true);
  if(enlace){doc.setFillColor(...verde);doc.roundedRect(right-bw2,285,bw2,9,4.5,4.5,'F');label('Hablar con ZAIN',right-bw2/2,290.6,8.5,true,blanco,'center');doc.link(right-bw2,285,bw2,9,{url:enlace});}}
 return doc.output('blob');
}
export async function descargarPDF(q,options={}){
 const blob=await crearPDF(q,options),src=URL.createObjectURL(blob),a=document.createElement('a');
 const folio=String(options.folio||q.folio||'ZAIN').replace(/[^A-Za-z0-9_-]/g,'-').slice(0,80);
 a.href=src;a.download='Cotizacion-'+folio+(options.borrador?'-borrador':'')+'.pdf';a.rel='noopener';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(src),120000);
 return blob;
}
