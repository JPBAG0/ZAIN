// Propuesta interna: usa el mismo motor de cotizaciones. Nunca aprueba ni publica precios.
import {generar,calcular,inicial} from '../js/cotizacion-core.js';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {resolve,relative,isAbsolute,sep} from 'node:path';
import C from './config-interno.cjs';
export function proponerPaquete(escenario,config=inicial()){
 if(!Number.isSafeInteger(escenario.cantidadPaquetes)||escenario.cantidadPaquetes<1||!Array.isArray(escenario.componentes)||!escenario.componentes.length)throw Error('Define paquetes y componentes propuestos.');
 const items=escenario.componentes.map(c=>{
  const p=C.productos.find(p=>p.sku===c.sku);if(!p||!Number.isSafeInteger(c.cantidad)||c.cantidad<1)throw Error('Modelo o cantidad propuesta inválidos.');
  const piezas=escenario.cantidadPaquetes*c.cantidad;
  return {sku:p.sku,nombreZain:p.nombreComercial||p.nombre,color:c.color||'Por confirmar',tecnica:c.tecnica||'Bordado',piezas,tallasDetalle:p.tallas?.length?{[c.talla||'M']:piezas}:{},tallas:p.tallas?.length?c.talla||'M':'Unitalla',zona:c.zona||'Por confirmar',cm:c.anchoCm||0};
 });
 const q=generar(items,config);
 // Referencia separada que excluye expresamente aplicación/ponchado, no presupone que sean gratis.
 const material=calcular(items,{...q,partidas:q.partidas.map(p=>({...p,modo:'fijo',aplicacion:0,preparacion:0,cargoAparte:false,precio:null})),cargos:[],impuesto:0});
 const piezas=items.reduce((n,p)=>n+p.piezas,0);
 return {estado:'PENDIENTE',id:escenario.id,cantidadPaquetesPropuesta:escenario.cantidadPaquetes,piezasPropuestas:piezas,componentesPropuestos:items.map((x,i)=>({sku:x.sku,talla:x.tallas,piezas:x.piezas,margen:q.partidas[i].margenObjetivo})),
 precioFinal:null,precioPorPaqueteFinal:null,precioPorPiezaFinal:null,
 referenciaSoloPrendasSinPersonalizacion:material.subtotal,referenciaPorPaquete:material.subtotal===null?null:Math.ceil(material.subtotal/escenario.cantidadPaquetes),referenciaPorPieza:material.subtotal===null?null:Math.ceil(material.subtotal/piezas),
 propuestaConPersonalizacionSinIVA:q.subtotal,
 pendientes:['Aprobar composición, modelos, tallas y colores','Confirmar cantidad mínima','Definir técnica, ubicación y medidas del logo','Completar costos vigentes de personalización y ponchado','Confirmar impuesto, entrega y precio final'],nota:'Referencia interna, nunca una oferta. Rango de margen por piezas de cada modelo, igual que el cotizador. Los costos de prendas son los de la fuente proporcionada, sin reinterpretar su IVA.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const arg=n=>process.argv[process.argv.indexOf(n)+1],salida=arg('--salida');
 if(!process.argv.includes('--salida')||!salida)throw Error('Indica --salida fuera del repositorio; el resultado es privado.');
 const ruta=relative(fileURLToPath(new URL('../',import.meta.url)),resolve(salida));
 if(!ruta||(!ruta.startsWith('..'+sep)&&!isAbsolute(ruta)))throw Error('Guarda la propuesta privada fuera del repositorio publicable.');
 let cfg=inicial();
 if(process.argv.includes('--config-costos'))cfg=JSON.parse(await readFile(arg('--config-costos'),'utf8'));
 else if(process.argv.includes('--fuente-prendas')){
  const fuente=JSON.parse((await readFile(arg('--fuente-prendas'),'utf8')).replace(/^\uFEFF/,''));
  cfg.prendas=fuente.productos.map(p=>p.precio).filter(Boolean).map(({sku,prenda,otros,bandas})=>({sku,prenda,otros,bandas}));
 }
 const polo=C.productos.find(p=>p.categoria==='Polos'&&p.activo!==false);
 const escenarios=process.argv.includes('--escenarios')?JSON.parse(await readFile(arg('--escenarios'),'utf8')):[
  {id:'gorra-chaleco',cantidadPaquetes:50,componentes:[{sku:'ZN-GO-002',cantidad:1},{sku:'ZN-CE-002',cantidad:1}]},
  {id:'polo-gorra',cantidadPaquetes:50,componentes:[{sku:polo.sku,cantidad:1},{sku:'ZN-GO-002',cantidad:1}]}
 ];
 await writeFile(salida,JSON.stringify({generado:new Date().toISOString(),advertencia:'PENDIENTE: escenarios de 50 kits, una pieza de cada modelo; no cantidades ni precios aprobados.',propuestas:escenarios.map(e=>proponerPaquete(e,cfg))},null,2)+'\n',{flag:'wx'});
 console.log('Propuesta calculada y guardada; precios finales continúan PENDIENTE.');
}
