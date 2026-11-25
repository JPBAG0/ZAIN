// Cotización rápida con prendas del catálogo (JP, 25-nov-2026): «que la cotización rápida sea para los dos tipos».
// Al elegir una prenda se propone su costo (prenda en el tramo de la cantidad + personalización) y el precio con el
// margen; todo se puede cambiar en la partida. Importes en centavos, margen en puntos base (3500 = 35%).
import {filasModelo,aplicacionArea,precioFila} from './cotizacion-modelos.js?v=8';
export const TECNICAS={bordado:'Bordado',serigrafia:'Serigrafía',dtf:'DTF'};
// Medida del logo con que se propone el costo de una técnica que se cobra por cm² (se puede cambiar en la partida).
export const MEDIDA_INICIAL=1000;
// producto: del catálogo, con colores como nombres (igual que en la cotización por modelo).
export function costoCatalogo(producto,config,{cantidad=null,color='',tecnica='',ancho=MEDIDA_INICIAL,alto=MEDIDA_INICIAL,margen=null}={}){
 const q=Number.isSafeInteger(cantidad)&&cantidad>0?cantidad:1;
 const filas=filasModelo(producto,config).filter(f=>q>=f.desde&&(f.hasta==null||q<=f.hasta));
 // La fila del color elegido; las tallas más chicas van primero y son las del precio base.
 const fila=filas.find(f=>f.color==='Todos los colores'||f.colores?.includes(color))||filas[0]||null;
 const prenda=fila?.costo==null?null:fila.costo+(fila.otros??0);
 const t=tecnica?config.tecnicas.find(x=>x.tecnica===(TECNICAS[tecnica]||tecnica)):null;
 let personalizacion=0,porArea=false;
 if(tecnica){
  porArea=!!t?.tarifaCm2;
  personalizacion=porArea?(()=>{const a=aplicacionArea(ancho,alto,t.tarifaCm2);return a==null?null:a+(t.porPieza??0);})():t?.porPieza??null;
 }
 const costo=prenda==null||personalizacion==null?null:prenda+personalizacion;
 const {sugerido}=precioFila({costo,otros:0},{margen,redondeo:100});
 return {prenda,personalizacion,porArea,costo,sugerido,tallas:fila?.talla||'',volumen:fila?.volumen||'',
  variasTallas:filasModelo(producto,config).some(f=>f.desde===fila?.desde&&f.costo!==fila?.costo)};
}
// Texto que se propone como descripción de la partida («Negro · Bordado»); el equipo lo puede reescribir.
export function descripcionCatalogo({colorNombre='',tecnica=''}={}){
 return [colorNombre,tecnica?TECNICAS[tecnica]||tecnica:'Sin personalización'].filter(Boolean).join(' · ');
}
