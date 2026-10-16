import {generar,calcular,entrada} from './cotizacion-core.mjs';
const campos=['modo','modoPrenda','bandas','prenda','tarifaCm2','aplicacion','otros','preparacion','margenObjetivo'];
const igual=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function vincularCostos(q,version,base=q){
 return {...q,origenCostos:{version,partidas:base.partidas.map(p=>Object.fromEntries(['sku','tecnica',...campos].map(k=>[k,structuredClone(p[k])])) )}};
}
export function sincronizarCostos(items,guardado,config){
 const actual=generar(items,config.datos),input=entrada(guardado),origen=guardado.origenCostos;
 for(let i=0;i<input.partidas.length;i++){
  const v=input.partidas[i],antes=guardado.partidas[i],nuevo=actual.partidas[i],base=origen?.partidas?.[i];
  if(base&&base.sku===nuevo.sku&&base.tecnica===nuevo.tecnica){
   for(const k of campos){
    if(k==='aplicacion'&&v.modo==='fijo'&&base.modo!=='fijo')continue;
    if(igual(antes[k],base[k]))v[k]=structuredClone(nuevo[k]);
   }
  }else{
   // Los borradores antiguos no tenían origen de costos. Recuperar tarifas y
   // pendientes sin descartar precios especiales, descuentos o medidas revisadas.
   const sinPrenda=antes.prenda===null&&!antes.bandas?.length;
   if((sinPrenda||antes.modoPrenda==='tallas')&&(nuevo.prenda!==null||nuevo.bandas.length)){
    v.modoPrenda=nuevo.modoPrenda;v.bandas=structuredClone(nuevo.bandas);
    if(nuevo.prenda!==null)v.prenda=nuevo.prenda;
   }
   if(v.modo==='area'&&nuevo.tarifaCm2!==null)v.tarifaCm2=nuevo.tarifaCm2;
   if(v.modo==='fijo'&&nuevo.modo==='fijo'&&v.aplicacion===null)v.aplicacion=nuevo.aplicacion;
   for(const k of ['otros','preparacion'])if(v[k]===0)v[k]=nuevo[k];
  }
  for(const k of ['ancho','alto'])if(v[k]===null&&nuevo[k]!==null)v[k]=nuevo[k];
 }
 return vincularCostos(calcular(items,input),config.version,actual);
}
