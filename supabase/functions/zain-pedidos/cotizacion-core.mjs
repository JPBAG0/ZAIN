// Dinero en centavos; porcentajes en puntos base (100 = 1%). Compartido por servidor y vista previa.
const MAX=100000000000;
const error=m=>{throw new Error(m);};
const entero=(n,min=0,max=MAX)=>{if(!Number.isSafeInteger(n)||n<min||n>max)error('Revisa los importes, cantidades y porcentajes.');return n;};
const texto=(s,n=1000)=>typeof s==='string'?s.replace(/[\x00-\x1f\x7f]/g,' ').trim().slice(0,n):'';
const suma=values=>entero(values.reduce((a,b)=>a+b,0));
const proporcion=(n,bps)=>Number((BigInt(entero(n))*BigInt(entero(bps,0,100000))+5000n)/10000n);
export function decimal(s){
 const t=String(s).trim();if(!/^\d+(?:\.\d{1,2})?$/.test(t))error('Escribe un número con hasta dos decimales.');
 const [a,b='']=t.split('.');return entero(Number(a)*100+Number(b.padEnd(2,'0')));
}
export const pesos=n=>n===null?'Pendiente':new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(n/100);
export function inicial(){return {activo:false,rangos:[{desde:1,hasta:14,recargo:5000},{desde:15,hasta:49,recargo:4500},{desde:50,hasta:99,recargo:4000},{desde:100,hasta:null,recargo:3500}],costos:[]};}
export function configurar(input){
 if(!input||typeof input.activo!=='boolean'||!Array.isArray(input.rangos)||!input.rangos.length||input.rangos.length>20||!Array.isArray(input.costos)||input.costos.length>1000)error('Revisa la configuración de costos y rangos.');
 let next=1;
 const rangos=input.rangos.map((r,i)=>{
  const desde=entero(r.desde,1,9999),hasta=r.hasta===null?null:entero(r.hasta,desde,9999),recargo=entero(r.recargo,0,100000);
  if(desde!==next||(hasta===null&&i!==input.rangos.length-1))error('Los rangos deben comenzar en 1, sin huecos ni traslapes; el último no tiene límite.');
  next=hasta===null?null:hasta+1;return {desde,hasta,recargo};
 });
 if(next!==null)error('Deja sin límite el último rango.');
 const seen=new Set();const costos=input.costos.map(p=>{
  const sku=texto(p.sku,60),tecnica=texto(p.tecnica,50),key=sku+'|'+tecnica;
  if(!sku||!['Bordado','Serigrafía','DTF'].includes(tecnica)||seen.has(key))error('Revisa productos, técnicas y costos duplicados.');seen.add(key);
  return {sku,tecnica,prenda:p.prenda===null?null:entero(p.prenda),aplicacion:p.aplicacion===null?null:entero(p.aplicacion),otros:entero(p.otros),preparacion:entero(p.preparacion)};
 });
 return {activo:input.activo,rangos,costos};
}
function comercial(p,i){return {indice:i,sku:texto(p.sku,60),nombre:texto(p.nombreZain||p.nombre,150),color:texto(p.color,100).replace(/ · \d+$/,''),tecnica:texto(p.tecnica,50),piezas:entero(p.piezas,1,9999),tallas:texto(p.tallas,500),zona:texto(p.zona,120),cm:Number.isFinite(p.cm)?p.cm:0};}
export function generar(items,cfg){
 const c=configurar(cfg);
 return calcular(items,{partidas:items.map((p,i)=>{
  const cp=c.costos.find(v=>v.sku===p.sku&&v.tecnica===p.tecnica),r=c.rangos.find(r=>p.piezas>=r.desde&&(r.hasta===null||p.piezas<=r.hasta));
  return {indice:i,prenda:cp?.prenda??null,aplicacion:cp?.aplicacion??null,otros:cp?.otros??0,preparacion:cp?.preparacion??0,recargo:r.recargo,precio:null,descuento:0};
 }),destinatario:'',condiciones:'',plazo:'Por acordar con ZAIN.',vigencia:'',impuesto:null,envio:0,costoEnvio:0});
}
export function calcular(items,input){
 if(!Array.isArray(items)||!items.length||items.length>20||!Array.isArray(input?.partidas)||input.partidas.length!==items.length)error('Las partidas deben coincidir con el pedido.');
 let pendiente=false;
 const partidas=items.map((p,i)=>{
  const v=input.partidas[i];if(v.indice!==i)error('El orden de las partidas cambió.');
  const base=comercial(p,i),prenda=v.prenda===null?null:entero(v.prenda),aplicacion=v.aplicacion===null?null:entero(v.aplicacion),otros=entero(v.otros),preparacion=entero(v.preparacion),recargo=entero(v.recargo,0,100000),descuento=entero(v.descuento,0,10000);
  const costoUnitario=prenda===null||aplicacion===null?null:suma([prenda,aplicacion,otros]);
  const costo=costoUnitario===null?null:suma([costoUnitario*base.piezas,preparacion]);
  // Preparación se reparte entre las piezas, redondeando hacia arriba un centavo como máximo por unidad.
  const sugerido=costo===null?null:Number((BigInt(costo)*BigInt(10000+recargo)+BigInt(base.piezas*10000-1))/BigInt(base.piezas*10000));
  const precio=v.precio===null?sugerido:entero(v.precio);
  if(costo===null||precio===null)pendiente=true;
  const bruto=precio===null?null:entero(precio*base.piezas),rebaja=bruto===null?null:proporcion(bruto,descuento),importe=bruto===null?null:bruto-rebaja;
  return {...base,prenda,aplicacion,otros,preparacion,recargo,precioManual:v.precio===null?null:precio,precio,descuento,costoUnitario,costo,sugerido,bruto,rebaja,importe};
 });
 const impuesto=input.impuesto===null?null:entero(input.impuesto,0,10000),envio=entero(input.envio),costoEnvio=entero(input.costoEnvio);
 if(impuesto===null)pendiente=true;
 const cifrasPendientes=partidas.some(p=>p.importe===null||p.costo===null);
 const bruto=cifrasPendientes?null:suma(partidas.map(p=>p.bruto)),descuento=cifrasPendientes?null:suma(partidas.map(p=>p.rebaja)),subtotal=cifrasPendientes?null:suma([bruto-descuento,envio]);
 const impuestos=subtotal===null||impuesto===null?null:proporcion(subtotal,impuesto),total=impuestos===null?null:suma([subtotal,impuestos]);
 const costo=cifrasPendientes?null:suma([...partidas.map(p=>p.costo),costoEnvio]),utilidad=subtotal===null||costo===null?null:subtotal-costo;
 const vigencia=texto(input.vigencia,10);if(vigencia&&(!/^\d{4}-\d{2}-\d{2}$/.test(vigencia)||new Date(vigencia+'T12:00:00Z').toISOString().slice(0,10)!==vigencia))error('Revisa la fecha de vigencia.');
 return {schema:1,moneda:'MXN',partidas,destinatario:texto(input.destinatario,180),condiciones:texto(input.condiciones,3000),plazo:texto(input.plazo,700),vigencia,impuesto,envio,costoEnvio,bruto,descuento,subtotal,impuestos,total,costo,utilidad,margen:subtotal?Math.round(utilidad/subtotal*10000):null,preparada:!pendiente};
}
export function entrada(q){return {...q,partidas:q.partidas.map(p=>({...p,precio:p.precioManual}))};}
export function paraCliente(q){
 if(!q.preparada)error('Completa costos, precios e impuesto antes de publicar.');
 return {schema:1,moneda:'MXN',destinatario:q.destinatario,condiciones:q.condiciones,plazo:q.plazo,vigencia:q.vigencia,impuesto:q.impuesto,envio:q.envio,bruto:q.bruto,descuento:q.descuento,subtotal:q.subtotal,impuestos:q.impuestos,total:q.total,
 partidas:q.partidas.map(p=>Object.fromEntries(['indice','sku','nombre','color','tecnica','piezas','tallas','zona','cm','precio','descuento','bruto','rebaja','importe'].map(k=>[k,p[k]])))};
}
