// Cotizar solo la personalización cuando el cliente trae sus prendas (JP, 2-nov-2026).
// No es un modelo del catálogo: no lleva costo de prenda, tallas ni colores, y todavía no pasa a Pedidos
// (el pedido normal exige prendas del catálogo; ver docs/COTIZACIONES-MODELOS.md).
export const SERVICIO='prenda-cliente';
export const NOMBRE_SERVICIO='Personalización sobre prenda del cliente';
export const esServicio=sku=>sku===SERVICIO;
// Las técnicas en el orden en que se ofrecen; la primera (serigrafía) es la inicial.
export function productoServicio(){return {sku:SERVICIO,nombre:NOMBRE_SERVICIO,servicio:true,tecnicas:['serigrafia','bordado','dtf'],colores:[],zonas:[],tallas:[]};}
// Un solo renglón: precio por pieza; el costo de la prenda es cero porque la pone el cliente.
export function filasServicio(){return [{id:0,tallas:[],talla:'Por pieza',color:'Todos los colores',colores:['Todos los colores'],desde:1,hasta:null,costo:0,otros:0,volumen:''}];}
// Vista del documento: el logo centrado sobre fondo claro, porque no hay prenda que mostrar.
// Devuelve false si todavía no hay logo (el PDF muestra «Vista previa por confirmar»).
export function dibujarServicio(g,logo,S){
 g.clearRect(0,0,S,S);g.fillStyle='#f3f3f0';g.fillRect(0,0,S,S);
 if(!logo?.width||!logo?.height)return false;
 const k=Math.min(S*.7/logo.width,S*.7/logo.height),w=logo.width*k,h=logo.height*k;
 g.drawImage(logo,(S-w)/2,(S-h)/2,w,h);return true;
}
