// Cotizar solo la personalización cuando el cliente trae sus prendas (JP, 2-nov-2026).
// No es un modelo del catálogo: no lleva costo de prenda, tallas ni colores. Desde el 2-nov-2026 también pasa a Pedidos
// como partida «sin prenda» (p:'prenda-cliente'), que solo el equipo puede crear (ver docs/COTIZACIONES-MODELOS.md).
export const SERVICIO='prenda-cliente';
export const NOMBRE_SERVICIO='Personalización sobre prenda del cliente';
export const COLOR_SERVICIO='Prenda del cliente';
export const esServicio=sku=>sku===SERVICIO;
// Artículo fuera de catálogo (JP, 11-nov-2026): algo que ZAIN consigue por fuera (un termo, un mandil, una prenda de otro
// proveedor). Lleva concepto, costo y precio escritos a mano; la personalización es opcional. Solo lo crea el equipo.
export const LIBRE='articulo-libre';
export const NOMBRE_LIBRE='Artículo fuera de catálogo';
export const COLOR_LIBRE='Artículo especial';
export function productoLibre(){return {sku:LIBRE,nombre:NOMBRE_LIBRE,servicio:true,libre:true,tecnicas:['serigrafia','bordado','dtf'],colores:[],zonas:[],tallas:[]};}
// Las técnicas en el orden en que se ofrecen; la primera (serigrafía) es la inicial.
export function productoServicio(){return {sku:SERVICIO,nombre:NOMBRE_SERVICIO,servicio:true,tecnicas:['serigrafia','bordado','dtf'],colores:[],zonas:[],tallas:[]};}
// Un solo renglón: precio por pieza; el costo de la prenda es cero porque la pone el cliente.
export function filasServicio(){return [{id:0,tallas:[],talla:'Por pieza',color:'Todos los colores',colores:['Todos los colores'],desde:1,hasta:null,costo:0,otros:0,volumen:''}];}
// Partida del pedido: misma forma que una selección del catálogo, sin SKU, tallas ni render (no hay prenda que mostrar).
// anterior: la partida que se está modificando; conserva su logo, color del logo, Pantone e indicaciones.
// libre: artículo fuera de catálogo. Con técnica «Solo prenda» va sin personalización (sin logo, zona ni medida).
export function itemServicio({nombre,tecnica,ubicacion='',cm,piezas,logoNombre='',folio='',anterior=null,libre=false}){
 const id=libre?LIBRE:SERVICIO,base=libre?NOMBRE_LIBRE:NOMBRE_SERVICIO;
 if(libre&&tecnica==='Solo prenda')return {p:LIBRE,servicio:true,libre:true,nombre:nombre||base,nombreZain:nombre||base,sku:'',medidas:'',detalleMedidas:'',color:COLOR_LIBRE,tallas:'',tallasEtq:'Piezas',renderOrientativo:false,
  tecnica,zona:'',cm:0,piezas,logo:'Sin personalización',colorLogo:'',pantone:'',notas:anterior?.p===LIBRE?anterior.notas||'':(folio?'Pedido desde la cotización '+folio+'. ':'')+'Artículo fuera de catálogo: ZAIN lo consigue por fuera.',tieneLogo:false,tieneRender:false};
 const previo=anterior?.servicio&&anterior.p===id&&anterior.tecnica!=='Solo prenda'?anterior:null,conLogo=previo?!!previo.tieneLogo:!!logoNombre;
 return {p:id,servicio:true,...(libre?{libre:true}:{}),nombre:nombre||base,nombreZain:nombre||base,sku:'',medidas:'',detalleMedidas:'',color:libre?COLOR_LIBRE:COLOR_SERVICIO,tallas:'',tallasEtq:'Piezas',renderOrientativo:false,
  tecnica,zona:ubicacion,cm,piezas,logo:previo?previo.logo:conLogo?'archivo «'+logoNombre+'»':'Logo pendiente de recibir',colorLogo:previo?.colorLogo??'Original del archivo',pantone:previo?.pantone??'',
  notas:previo?previo.notas||'':(folio?'Pedido desde la cotización '+folio+'. ':'')+(libre?'Artículo fuera de catálogo: ZAIN lo consigue por fuera.':'El cliente entrega las prendas.')+(conLogo?'':' Logo pendiente de recibir y confirmar antes de producción.'),tieneLogo:conLogo,tieneRender:false};
}
// Vista del documento: el logo centrado sobre fondo claro, porque no hay prenda que mostrar.
// Devuelve false si todavía no hay logo (el PDF muestra «Vista previa por confirmar»).
export function dibujarServicio(g,logo,S){
 g.clearRect(0,0,S,S);g.fillStyle='#f3f3f0';g.fillRect(0,0,S,S);
 if(!logo?.width||!logo?.height)return false;
 const k=Math.min(S*.7/logo.width,S*.7/logo.height),w=logo.width*k,h=logo.height*k;
 g.drawImage(logo,(S-w)/2,(S-h)/2,w,h);return true;
}
// Foto del artículo fuera de catálogo (JP, 20-nov-2026): como el artículo no está en el catálogo, se sube una foto
// (p. ej. la del catálogo mayoreo) para que el cliente vea qué se cotiza. Es una imagen ilustrativa.
export const FOTO_MAX_LADO=1600,FOTO_MAX_BYTES=25*1024*1024;
const FOTO_TIPO=/^image\/(jpeg|png|webp|heic|heif)$/,FOTO_EXT=/\.(jpe?g|png|webp|heic|heif)$/i;
// Abre la foto elegida y la deja en JPEG de hasta 1600 px por lado: pesa poco y alcanza para el PDF.
export async function prepararFoto(archivo){
 if(!archivo||!(FOTO_TIPO.test(archivo.type)||FOTO_EXT.test(archivo.name||''))||!(archivo.size>0)||archivo.size>FOTO_MAX_BYTES)throw Error('Sube una foto JPG, PNG o WEBP de hasta 25 MB.');
 let fuente;
 try{fuente=await createImageBitmap(archivo,{imageOrientation:'from-image'});}catch{throw Error('No se pudo abrir esa foto. Prueba con una JPG, PNG o WEBP.');}
 try{
  const k=Math.min(1,FOTO_MAX_LADO/Math.max(fuente.width,fuente.height)),w=Math.max(1,Math.round(fuente.width*k)),h=Math.max(1,Math.round(fuente.height*k));
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  // Las fotos recortadas (PNG con fondo transparente) quedan sobre blanco.
  g.fillStyle='#fff';g.fillRect(0,0,w,h);g.drawImage(fuente,0,0,w,h);
  const blob=await new Promise((ok,mal)=>c.toBlob(b=>b?ok(b):mal(Error('No se pudo preparar la foto.')),'image/jpeg',.86));
  return {blob,mime:'image/jpeg',img:c};
 }finally{fuente.close?.();}
}
// Vista del artículo: la foto completa sobre fondo claro y, si lleva personalización con logo, el logo en una tarjeta
// en la esquina. Sin foto se comporta igual que antes (solo el logo). Devuelve false si no hay nada que mostrar.
export function dibujarLibre(g,foto,logo,S){
 if(!foto?.width||!foto?.height)return dibujarServicio(g,logo,S);
 g.clearRect(0,0,S,S);g.fillStyle='#f3f3f0';g.fillRect(0,0,S,S);
 const borde=S*.04,k=Math.min((S-2*borde)/foto.width,(S-2*borde)/foto.height),w=foto.width*k,h=foto.height*k;
 g.drawImage(foto,(S-w)/2,(S-h)/2,w,h);
 if(logo?.width&&logo?.height){
  const L=S*.26,x=S-L-borde,y=S-L-borde,p=L*.12;
  g.save();g.shadowColor='rgba(0,0,0,.18)';g.shadowBlur=S*.02;g.fillStyle='#fff';g.beginPath();if(g.roundRect)g.roundRect(x,y,L,L,S*.03);else g.rect(x,y,L,L);g.fill();g.restore();
  const q=Math.min((L-2*p)/logo.width,(L-2*p)/logo.height),lw=logo.width*q,lh=logo.height*q;
  g.drawImage(logo,x+(L-lw)/2,y+(L-lh)/2,lw,lh);
 }
 return true;
}
