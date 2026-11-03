// Cotizar solo la personalización cuando el cliente trae sus prendas (JP, 2-nov-2026).
// No es un modelo del catálogo: no lleva costo de prenda, tallas ni colores. Desde el 2-nov-2026 también pasa a Pedidos
// como partida «sin prenda» (p:'prenda-cliente'), que solo el equipo puede crear (ver docs/COTIZACIONES-MODELOS.md).
export const SERVICIO='prenda-cliente';
export const NOMBRE_SERVICIO='Personalización sobre prenda del cliente';
export const COLOR_SERVICIO='Prenda del cliente';
export const esServicio=sku=>sku===SERVICIO;
// Las técnicas en el orden en que se ofrecen; la primera (serigrafía) es la inicial.
export function productoServicio(){return {sku:SERVICIO,nombre:NOMBRE_SERVICIO,servicio:true,tecnicas:['serigrafia','bordado','dtf'],colores:[],zonas:[],tallas:[]};}
// Un solo renglón: precio por pieza; el costo de la prenda es cero porque la pone el cliente.
export function filasServicio(){return [{id:0,tallas:[],talla:'Por pieza',color:'Todos los colores',colores:['Todos los colores'],desde:1,hasta:null,costo:0,otros:0,volumen:''}];}
// Partida del pedido: misma forma que una selección del catálogo, sin SKU, tallas ni render (no hay prenda que mostrar).
// anterior: la partida que se está modificando; conserva su logo, color del logo, Pantone e indicaciones.
export function itemServicio({nombre,tecnica,ubicacion='',cm,piezas,logoNombre='',folio='',anterior=null}){
 const previo=anterior?.servicio?anterior:null,conLogo=previo?!!previo.tieneLogo:!!logoNombre;
 return {p:SERVICIO,servicio:true,nombre:nombre||NOMBRE_SERVICIO,nombreZain:nombre||NOMBRE_SERVICIO,sku:'',medidas:'',detalleMedidas:'',color:COLOR_SERVICIO,tallas:'',tallasEtq:'Piezas',renderOrientativo:false,
  tecnica,zona:ubicacion,cm,piezas,logo:previo?previo.logo:conLogo?'archivo «'+logoNombre+'»':'Logo pendiente de recibir',colorLogo:previo?.colorLogo??'Original del archivo',pantone:previo?.pantone??'',
  notas:previo?previo.notas||'':(folio?'Pedido desde la cotización '+folio+'. ':'')+'El cliente entrega las prendas.'+(conLogo?'':' Logo pendiente de recibir y confirmar antes de producción.'),tieneLogo:conLogo,tieneRender:false};
}
// Vista del documento: el logo centrado sobre fondo claro, porque no hay prenda que mostrar.
// Devuelve false si todavía no hay logo (el PDF muestra «Vista previa por confirmar»).
export function dibujarServicio(g,logo,S){
 g.clearRect(0,0,S,S);g.fillStyle='#f3f3f0';g.fillRect(0,0,S,S);
 if(!logo?.width||!logo?.height)return false;
 const k=Math.min(S*.7/logo.width,S*.7/logo.height),w=logo.width*k,h=logo.height*k;
 g.drawImage(logo,(S-w)/2,(S-h)/2,w,h);return true;
}
