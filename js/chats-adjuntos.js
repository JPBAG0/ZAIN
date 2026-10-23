// Archivos comerciales en memoria. No guarda datos del chat ni PDFs en el navegador.
export const TIPOS={pdf:'application/pdf',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
export function validarArchivo(archivo){
 const ext=String(archivo?.name||'').split('.').at(-1).toLowerCase(),mime=TIPOS[ext];
 if(!mime||archivo.type&&archivo.type!=='application/octet-stream'&&archivo.type!==mime||!Number.isSafeInteger(archivo.size)||archivo.size<12||archivo.size>8388608)throw Error('Elige PDF, JPG, PNG, WEBP, Word o Excel de hasta 8 MB.');
 return {nombre:archivo.name.replace(/[\x00-\x1f\x7f/\\]/g,'-').slice(-160),mime,bytes:archivo.size};
}
export async function prepararAdjunto(archivo,origen=null){
 const meta=validarArchivo(archivo),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await archivo.arrayBuffer())),b=>b.toString(16).padStart(2,'0')).join('');
 return {archivo,meta:{...meta,hash,...(origen?{origen}:{})}};
}
const nombrePDF=folio=>'Cotizacion-'+String(folio||'ZAIN').replace(/[^A-Za-z0-9_-]/g,'-').slice(0,80)+'.pdf';
export async function pdfModelo(id,api){
 const [{cotizacion:x},{catalogo:c}]=await Promise.all([api('cm-leer',null,{id}),api('catalogo-publico')]);
 if(!x.comercial?.partidas?.length||!['enviada','autorizada'].includes(x.estado))throw Error('Abre la cotización y guárdala lista para enviar.');
 const imagenes=[],productos=[...(c.productos||[]),...(c.productosHistoricos||[])];let logo=null;
 if(x.logoUrl){const res=await fetch(x.logoUrl,{credentials:'omit',signal:AbortSignal.timeout(15000)});if(!res.ok)throw Error('No se pudo cargar el logo de la cotización.');const f=await res.blob();logo=window.ZR.analizarLogo(await window.ZR.abrirArchivo(f),!!x.datos?.quitarFondo).logo;}
 for(const [i,s] of (x.datos?.modelos||[]).entries()){
  const p=productos.find(p=>p.sku===s.sku),col=c.colores.find(c=>c.id===s.color);if(!p||!col)throw Error('Abre la cotización y revisa el modelo antes de adjuntarla.');
  const src=p.fotosColor?.[s.color]||p.fotoRender||p.foto;if(!src)throw Error('Falta la imagen de un modelo. Revisa la cotización.');
  const img=await window.ZR.cargar(src),canvas=document.createElement('canvas');canvas.width=canvas.height=1000;
  try{
   const g=canvas.getContext('2d');g.drawImage(window.ZR.tenir(img,p.fotosColor?.[s.color]?null:col.hex,1000,p.fotoColor?c.colores.find(c=>c.id===p.fotoColor)?.hex:null,p.acabadosFijos||null),0,0);
   const z=p.zonas?.find(z=>z.id===s.zona);
   if(s.tecnica&&logo){if(!z||!(Number(s.ancho)>0)||!p.pxPorCm)throw Error('Confirma la zona y las medidas del logo en Cotizaciones.');window.ZR.estampar(g,img,logo,{x:z.x,y:z.y,ancho:Number(s.ancho)*p.pxPorCm,tecnica:s.tecnica,S:1000,sombraLocal:!!p.fotosColor,giro:z.giro,sesgo:z.sesgo,inclina:z.inclina,compresion:z.compresion,textura:z.textura});}
   imagenes[i]={src:canvas.toDataURL('image/png'),nota:(s.tecnica?(logo?'Logo en '+(z?.nombre||'zona por confirmar'):'Logo pendiente · referencia del modelo'):'Referencia')+' · '+col.nombre};
  }finally{canvas.width=canvas.height=0;}
 }
 const {adaptarModelos}=await import('./cotizacion-modelos-pdf.js?v=5'),{crearPDF}=await import('./cotizacion-pdf.js?v=15');
 const q={...x.comercial,folio:x.folio},a=adaptarModelos(q,imagenes),blob=await crearPDF(a.cotizacion,{sinCantidades:true,folio:x.folio,imagenes:a.imagenes});
 return prepararAdjunto(new File([blob],nombrePDF(x.folio),{type:'application/pdf'}),{tipo:'modelo',id:x.id,version:x.version});
}
export async function pdfPedido(id,api){
 const [{pedido:p},{cotizacion:c}]=await Promise.all([api('detalle',null,{id}),api('cotizacion',null,{id})]);
 const q=c?.publicada;if(!q?.partidas?.length)throw Error('Este pedido todavía no tiene una cotización publicada.');
 const imagenes={};
 for(const f of p.archivos||[]){if(f.kind!=='render')continue;const d=await api('archivo',{id,item:f.item,kind:'render'});imagenes[f.item]={src:d.url,referencia:false};}
 const {prepararImagenes}=await import('./cotizacion-imagen.js?v=1'),{crearPDF}=await import('./cotizacion-pdf.js?v=15');
 const blob=await crearPDF(q,{folio:p.folio,imagenes:await prepararImagenes(q,imagenes)});
 return prepararAdjunto(new File([blob],nombrePDF(p.folio),{type:'application/pdf'}),{tipo:'pedido',id,version:q.revision});
}
