import {pagosIniciales,normalizarPagos} from './cotizacion-pagos.mjs';
import {medidasLogo} from './logo-medidas.mjs';
// Dinero en centavos; porcentajes en puntos base (100 = 1%). Compartido por servidor y vista previa.
const MAX=100000000000;
const error=m=>{throw new Error(m);};
const entero=(n,min=0,max=MAX)=>{if(!Number.isSafeInteger(n)||n<min||n>max)error('Revisa los importes, cantidades y porcentajes.');return n;};
const texto=(s,n=1000)=>typeof s==='string'?s.replace(/[\x00-\x1f\x7f]/g,' ').trim().slice(0,n):'';
const suma=values=>entero(values.reduce((a,b)=>a+b,0));
const proporcion=(n,bps)=>Number((BigInt(entero(n))*BigInt(entero(bps,0,100000))+5000n)/10000n);
function decimalPreciso(s,n){
 const t=String(s).trim();if(!new RegExp('^\\d+(?:\\.\\d{1,'+n+'})?$').test(t))error('Escribe un número con hasta '+n+' decimales.');
 const [a,b='']=t.split('.');return entero(Number(a)*10**n+Number(b.padEnd(n,'0')));
}
export const decimal=s=>decimalPreciso(s,2);
// Tarifas privadas en millonésimas de MXN: 25862 representa $0.025862/cm².
// Hasta el esquema 5 y el costeo v3 se guardaban en diezmilésimas; se escalan ×100 al leerlos.
export const decimalTarifa=s=>decimalPreciso(s,6);
export const tarifaLegada=n=>n==null?null:n*100;
const TECNICAS=['Bordado','Serigrafía','DTF'];
export const pesos=n=>n===null?'Pendiente':new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(n/100);
const equivalente=r=>Math.floor(entero(r,0,100000)*10000/(10000+r));
export function inicial(){return {metodo:'margen_bruto',costeo:'area_tallas_volumen_v4',activo:false,rangos:[{desde:1,hasta:14,margen:4000},{desde:15,hasta:49,margen:3500},{desde:50,hasta:99,margen:3000},{desde:100,hasta:null,margen:2500}],prendas:[],tecnicas:TECNICAS.map(tecnica=>({tecnica,tarifaCm2:null,preparacion:0})),costos:[]};}
function bandasPrecio(value=[]){
 if(!Array.isArray(value)||value.length>100)error('Revisa los costos por talla.');
 const result=value.map(b=>{
  if(!b||!Array.isArray(b.tallas)||b.tallas.length>18||!Array.isArray(b.colores)||b.colores.length>30)error('Revisa tallas y colores de los costos.');
  const tallas=b.tallas.map(t=>texto(t,12)),colores=b.colores.map(t=>texto(t,50));
  if(tallas.some(t=>!t)||colores.some(t=>!t)||new Set(tallas).size!==tallas.length||new Set(colores).size!==colores.length)error('No repitas tallas o colores en el costo.');
  const desdePiezas=entero(b.desdePiezas??1,1,9999),hastaPiezas=b.hastaPiezas==null?null:entero(b.hastaPiezas,desdePiezas,9999);return {tallas,colores,costo:b.costo===null?null:entero(b.costo),...(b.desdePiezas!==undefined||b.hastaPiezas!==undefined?{desdePiezas,hastaPiezas}:{})};
 });
 for(let i=0;i<result.length;i++)for(let j=i+1;j<result.length;j++){
  const a=result[i],b=result[j];if((a.desdePiezas??1)<=(b.hastaPiezas??9999)&&(b.desdePiezas??1)<=(a.hastaPiezas??9999)&&(!a.tallas.length||!b.tallas.length||a.tallas.some(t=>b.tallas.includes(t)))&&(!a.colores.length||!b.colores.length||a.colores.some(c=>b.colores.includes(c))))error('Los costos por talla y color se traslapan.');
 }
 return result;
}
function costoPorTallas(p,bandas){
 // Una banda sin tallas aplica al modelo completo (por ejemplo, bolsas).
 const sinTallas=!p.tallasDetalle||typeof p.tallasDetalle==='object'&&!Array.isArray(p.tallasDetalle)&&!Object.keys(p.tallasDetalle).length;
 if(sinTallas){
  const b=bandas.find(b=>!b.tallas.length&&p.piezas>=(b.desdePiezas??1)&&(b.hastaPiezas==null||p.piezas<=b.hastaPiezas)&&(!b.colores.length||b.colores.includes(String(p.color||'').replace(/ · \d+$/,''))));
  const costo=b?.costo??null,importe=costo===null?null:entero(costo*p.piezas);
  return {total:importe,detalle:b?[{talla:'Sin talla',piezas:p.piezas,costo,importe}]:[]};
 }
 const counts=p.tallasDetalle;
 if(!counts||typeof counts!=='object'||Array.isArray(counts)||!Object.keys(counts).length)return {total:null,detalle:[]};
 let piezas=0,total=0,pendiente=false;const detalle=[];
 for(const [talla,n] of Object.entries(counts)){
  entero(n,1,9999);piezas+=n;const b=bandas.find(b=>p.piezas>=(b.desdePiezas??1)&&(b.hastaPiezas==null||p.piezas<=b.hastaPiezas)&&(!b.tallas.length||b.tallas.includes(talla))&&(!b.colores.length||b.colores.includes(String(p.color||'').replace(/ · \d+$/,''))));
  const costo=b?.costo??null,importe=costo===null?null:entero(costo*n);if(importe===null)pendiente=true;else total=entero(total+importe);
  detalle.push({talla,piezas:n,costo,importe});
 }
 if(piezas!==p.piezas)error('Las cantidades por talla no coinciden con la partida.');
 return {total:pendiente?null:total,detalle};
}
export function configurar(input){
 // Leer configuraciones anteriores sin reinterpretar recargo como margen. Requieren revisión.
 if(input&&!input.metodo&&Array.isArray(input.rangos))input={...input,activo:false,metodo:'margen_bruto',rangos:input.rangos.map(r=>({desde:r.desde,hasta:r.hasta,margen:equivalente(r.recargo)}))};
 if(!input||typeof input.activo!=='boolean'||!Array.isArray(input.rangos)||!input.rangos.length||input.rangos.length>20||!Array.isArray(input.costos)||input.costos.length>1000)error('Revisa la configuración de costos y rangos.');
 let next=1;
 const rangos=input.rangos.map((r,i)=>{
  const desde=entero(r.desde,1,9999),hasta=r.hasta===null?null:entero(r.hasta,desde,9999),margen=entero(r.margen,0,9999);
  if(desde!==next||(hasta===null&&i!==input.rangos.length-1))error('Los rangos deben comenzar en 1, sin huecos ni traslapes; el último no tiene límite.');
  next=hasta===null?null:hasta+1;return {desde,hasta,margen};
 });
 if(next!==null)error('Deja sin límite el último rango.');
 const seen=new Set();const costos=input.costos.map(p=>{
  const sku=texto(p.sku,60),tecnica=texto(p.tecnica,50),key=sku+'|'+tecnica;
  if(!sku||!['Bordado','Serigrafía','DTF'].includes(tecnica)||seen.has(key))error('Revisa productos, técnicas y costos duplicados.');seen.add(key);
  return {sku,tecnica,prenda:p.prenda===null?null:entero(p.prenda),aplicacion:p.aplicacion===null?null:entero(p.aplicacion),otros:entero(p.otros),preparacion:entero(p.preparacion)};
 });
 if(input.metodo!=='margen_bruto')error('El método de cálculo es margen bruto.');
 if(input.costeo!==undefined&&!['area_cm2_v1','area_tallas_v2','area_tallas_volumen_v3','area_tallas_volumen_v4'].includes(input.costeo))error('Revisa el método de costeo.');
 const productos=input.prendas??[];
 if(!Array.isArray(productos)||productos.length>1000)error('Revisa los costos de prendas.');
 const skus=new Set(),prendas=productos.map(p=>{
  const sku=texto(p.sku,60);if(!sku||skus.has(sku))error('Revisa los SKU de prendas duplicados.');skus.add(sku);
  const bandas=bandasPrecio(p.bandas),fuente=texto(p.fuente,700);
  return {sku,prenda:p.prenda===null?null:entero(p.prenda),otros:entero(p.otros),...(bandas.length?{bandas}:{}),...(fuente?{fuente}:{})};
 });
 const tasas=input.tecnicas??inicial().tecnicas;
 if(!Array.isArray(tasas)||tasas.length!==TECNICAS.length||new Set(tasas.map(t=>t.tecnica)).size!==TECNICAS.length||tasas.some(t=>!TECNICAS.includes(t.tecnica)))error('Define una tarifa para cada técnica.');
 const legada=input.costeo!=='area_tallas_volumen_v4';
 const tecnicas=TECNICAS.map(nombre=>{const t=tasas.find(t=>t.tecnica===nombre);return {tecnica:nombre,tarifaCm2:t.tarifaCm2===null?null:entero(legada?tarifaLegada(entero(t.tarifaCm2)):t.tarifaCm2),preparacion:entero(t.preparacion)};});
 return {metodo:'margen_bruto',costeo:'area_tallas_volumen_v4',activo:input.activo,rangos,prendas,tecnicas,costos};
}
function comercial(p,i){return {indice:i,sku:texto(p.sku,60),nombre:texto(p.nombreZain||p.nombre,150),color:texto(p.color,100).replace(/ · \d+$/,''),tecnica:texto(p.tecnica,50),piezas:entero(p.piezas,1,9999),tallas:texto(p.tallas,500),zona:texto(p.zona,120),cm:Number.isFinite(p.cm)?p.cm:0};}
export function generar(items,cfg){
 const c=configurar(cfg);
 return calcular(items,{partidas:items.map((p,i)=>{
  const cp=c.costos.find(v=>v.sku===p.sku&&v.tecnica===p.tecnica),prenda=c.prendas.find(v=>v.sku===p.sku),t=c.tecnicas.find(t=>t.tecnica===p.tecnica),r=c.rangos.find(r=>p.piezas>=r.desde&&(r.hasta===null||p.piezas<=r.hasta));
  // Los costos anteriores siguen por pieza hasta que el equipo migre ese SKU expresamente.
  const fijo=!!cp&&!prenda,medidas=medidasLogo(p.cm,p.logoGeometria);
  return {indice:i,modo:fijo?'fijo':'area',modoPrenda:prenda?.bandas?.length?'tallas':'unitario',bandas:prenda?.bandas||[],ancho:medidas?.ancho??(Number.isFinite(p.cm)&&p.cm>0?Math.round(p.cm*100):null),alto:medidas?.alto??null,tarifaCm2:t?.tarifaCm2??null,prenda:prenda?prenda.prenda:cp?.prenda??null,aplicacion:fijo?cp.aplicacion:null,otros:prenda?.otros??cp?.otros??0,preparacion:fijo?cp.preparacion:t?.preparacion??0,margenObjetivo:r.margen,precio:null,descuento:0};
 }),pagos:pagosIniciales(),destinatario:'',condiciones:'',plazo:'Por acordar con ZAIN.',vigencia:'',impuesto:null,envio:0,costoEnvio:0});
}
export function calcular(items,input){
 if(!Array.isArray(items)||!items.length||items.length>20||!Array.isArray(input?.partidas)||input.partidas.length!==items.length)error('Las partidas deben coincidir con el pedido.');
 let pendiente=false;
 const partidas=items.map((p,i)=>{
  const v=input.partidas[i];if(v.indice!==i)error('El orden de las partidas cambió.');
  const base=comercial(p,i),modo=v.modo??'fijo';
  if(!['area','fijo'].includes(modo))error('Elige costo por área o importe fijo.');
  const medida=n=>n==null?null:entero(n,1,20000),ancho=medida(v.ancho),alto=medida(v.alto),tarifaCm2=v.tarifaCm2==null?null:entero(v.tarifaCm2);
  const area=ancho===null||alto===null?null:ancho*alto;
  // Área en 1/10000 cm² × tarifa en 1/1000000 MXN; redondear una sola vez hacia arriba al centavo por pieza.
  const calculada=area===null||tarifaCm2===null?null:entero(Number((BigInt(area)*BigInt(tarifaCm2)+99999999n)/100000000n));
  const baseAplicacion=v.aplicacion===null?null:v.aplicacion;
  const prenda=v.prenda===null?null:entero(v.prenda),aplicacion=modo==='area'?calculada:enteroNullable(baseAplicacion),otros=entero(v.otros),preparacion=entero(v.preparacion),margenObjetivo=entero(v.margenObjetivo,0,9999),descuento=entero(v.descuento,0,10000);
  const modoPrenda=v.modoPrenda??'unitario';if(!['unitario','tallas'].includes(modoPrenda))error('Revisa el costeo de la prenda.');
  const bandas=bandasPrecio(v.bandas),porTalla=modoPrenda==='tallas'?costoPorTallas(p,bandas):{total:prenda===null?null:entero(prenda*base.piezas),detalle:[]};
  const costoPrendas=porTalla.total,costoVariable=costoPrendas===null||aplicacion===null?null:suma([costoPrendas,(aplicacion+otros)*base.piezas]);
  // El total por talla es exacto; el promedio informativo jamás se usa para acumular costos.
  const costoUnitario=costoVariable===null?null:Math.ceil(costoVariable/base.piezas);
  const costo=costoVariable===null?null:suma([costoVariable,preparacion]);
  // Preparación se reparte entre las piezas, redondeando hacia arriba un centavo como máximo por unidad.
  const divisor=BigInt(base.piezas)*BigInt(10000-margenObjetivo);
  const sugerido=costo===null?null:entero(Number((BigInt(costo)*10000n+divisor-1n)/divisor));
  const precio=v.precio===null?sugerido:entero(v.precio);
  // Publicar exige precio por pieza; los costos son opcionales y solo sirven para conocer la utilidad.
  if(precio===null)pendiente=true;
  const bruto=precio===null?null:entero(precio*base.piezas),rebaja=bruto===null?null:proporcion(bruto,descuento),importe=bruto===null?null:bruto-rebaja;
  return {...base,modo,modoPrenda,bandas,costoPrendas,detalleCostosTalla:porTalla.detalle,ancho,alto,area,tarifaCm2,prenda,aplicacion,otros,preparacion,margenObjetivo,precioManual:v.precio===null?null:precio,precio,descuento,costoUnitario,costo,sugerido,bruto,rebaja,importe};
 });
 const impuesto=input.impuesto===null?null:entero(input.impuesto,0,10000),envio=entero(input.envio),costoEnvio=entero(input.costoEnvio);
 if(impuesto===null)pendiente=true;
 const preciosPendientes=partidas.some(p=>p.importe===null),costosPendientes=partidas.some(p=>p.costo===null);
 const bruto=preciosPendientes?null:suma(partidas.map(p=>p.bruto)),descuento=preciosPendientes?null:suma(partidas.map(p=>p.rebaja)),subtotal=preciosPendientes?null:suma([bruto-descuento,envio]);
 const impuestos=subtotal===null||impuesto===null?null:proporcion(subtotal,impuesto),total=impuestos===null?null:suma([subtotal,impuestos]);
 const costo=costosPendientes?null:suma([...partidas.map(p=>p.costo),costoEnvio]),utilidad=subtotal===null||costo===null?null:subtotal-costo;
 const vigencia=texto(input.vigencia,10);if(vigencia&&(!/^\d{4}-\d{2}-\d{2}$/.test(vigencia)||new Date(vigencia+'T12:00:00Z').toISOString().slice(0,10)!==vigencia))error('Revisa la fecha de vigencia.');
 return {schema:6,metodo:'margen_bruto',moneda:'MXN',pagos:normalizarPagos(input.pagos),partidas,destinatario:texto(input.destinatario,180),condiciones:texto(input.condiciones,3000),plazo:texto(input.plazo,700),vigencia,impuesto,envio,costoEnvio,bruto,descuento,subtotal,impuestos,total,costo,utilidad,margen:subtotal&&utilidad!==null?Math.round(utilidad/subtotal*10000):null,preparada:!pendiente};
}
const enteroNullable=n=>n===null?null:entero(n);
export function entrada(q){return {...q,schema:6,metodo:'margen_bruto',partidas:q.partidas.map(p=>({...p,modo:q.schema<3?'fijo':p.modo,modoPrenda:p.modoPrenda??'unitario',bandas:p.bandas||[],ancho:p.ancho??null,alto:p.alto??null,tarifaCm2:q.schema<6?tarifaLegada(p.tarifaCm2??null):p.tarifaCm2??null,margenObjetivo:p.margenObjetivo??equivalente(p.recargo),precio:q.schema===1?(p.precioManual??p.precio):p.precioManual}))};}
export function paraCliente(q){
 if(!q.preparada)error('Escribe el precio por pieza de cada partida y elige el impuesto antes de publicar.');
 return {schema:1,moneda:'MXN',pagos:normalizarPagos(q.pagos),destinatario:q.destinatario,condiciones:q.condiciones,plazo:q.plazo,vigencia:q.vigencia,impuesto:q.impuesto,envio:q.envio,bruto:q.bruto,descuento:q.descuento,subtotal:q.subtotal,impuestos:q.impuestos,total:q.total,
 partidas:q.partidas.map(p=>Object.fromEntries(['indice','sku','nombre','color','tecnica','piezas','tallas','zona','cm','precio','descuento','bruto','rebaja','importe'].map(k=>[k,p[k]])))};
}
