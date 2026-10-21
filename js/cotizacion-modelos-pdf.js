import {pesos} from './cotizacion-core.js?v=16';
let biblioteca;
async function libreria(){return biblioteca||(biblioteca=import('./vendor/jspdf-4.2.1.umd.min.js').then(()=>globalThis.jspdf.jsPDF).catch(e=>{biblioteca=null;throw e;}));}
export async function descargarModelos(q,imagenes=[]){
 const PDF=await libreria(),doc=new PDF({unit:'mm',format:'a4'}),fecha=new Date().toLocaleDateString('es-MX',{timeZone:'America/Mexico_City'});let y=0,pagina=0;
 const limpio=t=>String(t??'').normalize('NFC').replace(/[\u2010-\u2015]/g,'-').replace(/\u202f|\u00a0/g,' ');
 function cabecera(){
  pagina++;doc.setFillColor(255,255,255);doc.rect(0,0,210,297,'F');doc.setTextColor(17,17,19);doc.setFont('helvetica','bold');doc.setFontSize(27);doc.text('ZAIN',16,23);doc.setFontSize(10);doc.text('Cotización por modelo y tallas',194,19,{align:'right'});doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text(fecha,194,25,{align:'right'});doc.setDrawColor(210,210,215);doc.line(16,31,194,31);y=39;
  doc.setTextColor(80,80,88);doc.setFontSize(8);doc.text('ZAIN · Precios por pieza en MXN',16,285);doc.text(String(pagina),194,285,{align:'right'});
 }
 function espacio(h){if(y+h>275){doc.addPage();cabecera();}}
 function texto(t,{tam=10,negrita=false,color=[17,17,19],ancho=178}={}){
  doc.setFont('helvetica',negrita?'bold':'normal');doc.setFontSize(tam);doc.setTextColor(...color);
  const lineas=doc.splitTextToSize(limpio(t),ancho),paso=tam*.48;
  for(const l of lineas){espacio(paso);doc.text(l,16,y);y+=paso;}y+=2;
 }
 cabecera();
 if(q.destinatario)texto('Para: '+q.destinatario,{negrita:true,tam:12});
 texto(q.impuesto?'Precios más IVA ('+q.impuesto/100+'%).':'Precios sin impuesto (0%).',{color:[55,55,65]});
 for(let i=0;i<q.partidas.length;i++){
  const p=q.partidas[i],anterior=q.partidas[i-1],nuevo=!anterior||anterior.modelo!==p.modelo;
  if(nuevo){
   espacio(70);y+=3;texto(p.nombre,{tam:14,negrita:true});texto(p.sku+' · '+p.personalizacion+(p.zona?' · '+p.zona:'')+(p.medidas?' · '+p.medidas:''),{tam:9});
   const imagen=imagenes[p.modelo];
   if(imagen?.src){espacio(57);doc.addImage(imagen.src,'PNG',16,y,48,48);doc.setFontSize(9);doc.setTextColor(75,75,85);const nota=doc.splitTextToSize(limpio(imagen.nota+'\nVista ilustrativa; confirmar acabado y medidas.'),115);doc.text(nota,72,y+14);y+=54;}
  }
  const detalle=[p.tallas,p.color,p.volumen?'Referencia de compra: '+p.volumen:''].filter(Boolean).join(' · ');
  doc.setFont('helvetica','normal');doc.setFontSize(10);const lineas=doc.splitTextToSize(limpio(detalle),125),alto=Math.max(13,lineas.length*5+6);espacio(alto);
  doc.setFillColor(i%2?249:244,245,248);doc.rect(16,y-4,178,alto,'F');doc.setTextColor(30,30,38);doc.text(lineas,19,y+1);doc.setFont('helvetica','bold');doc.setFontSize(11);doc.text(limpio(pesos(p.precio))+' / pieza',191,y+1,{align:'right'});y+=alto;
 }
 if(q.cargo){y+=5;espacio(18);texto(q.cargo.concepto+' · cargo único: '+pesos(q.cargo.importe),{negrita:true,tam:11});}
 y+=6;if(q.notas){texto('Condiciones',{negrita:true});texto(q.notas,{tam:9});}
 texto('Disponibilidad, cantidades y entrega se confirman al realizar el pedido.',{tam:9,color:[75,75,85]});
 doc.save('ZAIN-cotizacion-modelos-'+new Date().toLocaleDateString('en-CA',{timeZone:'America/Mexico_City'})+'.pdf');
}
