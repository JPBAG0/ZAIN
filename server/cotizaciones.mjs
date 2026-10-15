import {inicial,configurar,generar,calcular,entrada,paraCliente} from '../js/cotizacion-core.js';
export function createQuotes({sb,row,fail,commercialItem}){
 const config=async()=>{const r=await sb('/rest/v1/zain_precios_config?id=eq.1&select=version,datos&limit=1');return r[0]?{...r[0],datos:configurar(r[0].datos)}:{version:0,datos:inicial()};};
 const get=async id=>(await sb('/rest/v1/zain_cotizaciones?pedido_id=eq.'+id+'&select=*&limit=1'))[0]||null;
 const ensure=async x=>{
  const old=await get(x.id);if(old)return old;
  const cfg=await config(),borrador=generar(x.items.map(commercialItem),cfg.datos.activo?cfg.datos:{...cfg.datos,costos:[],prendas:[],tecnicas:inicial().tecnicas});
  const result=await sb('/rest/v1/rpc/zain_cotizacion_guardar',{method:'POST',body:JSON.stringify({p_id:x.id,p_version:0,p_modo:'iniciar',p_borrador:borrador,p_publicada:null,p_actor:null})});
  return result||get(x.id);
 };
 return {ensure,publicada:async id=>(await sb('/rest/v1/zain_cotizaciones?pedido_id=eq.'+id+'&select=publicada&limit=1'))[0]?.publicada||null,
  handle:async(request,url,op,user,jsonBody,currentCatalog)=>{
   if(op==='precios-config'&&request.method==='GET')return {config:await config()};
   if(op==='precios-guardar'&&request.method==='POST'){
    const b=await jsonBody(request);if(!Number.isSafeInteger(b.version)||b.version<0)fail(400,'Versión inválida.');
    if(b.datos?.costeo!=='area_tallas_volumen_v3')fail(409,'El cotizador ahora incluye costos por talla, color y cantidad. Recarga la página antes de guardar.');
    let datos;try{datos=configurar(b.datos);}catch(e){fail(400,e.message);}
    const cat=await currentCatalog();for(const c of datos.costos){const p=[...cat.productos,...cat.productosHistoricos||[]].find(p=>p.sku===c.sku);if(!p||!cat.tecnicas.some(t=>t.nombre===c.tecnica&&p.tecnicas.includes(t.id)))fail(400,'Elige un SKU y técnica válidos.');}
    for(const c of datos.prendas)if(![...cat.productos,...cat.productosHistoricos||[]].some(p=>p.sku===c.sku))fail(400,'Elige un SKU válido para el costo de prenda.');
    const out=await sb('/rest/v1/rpc/zain_precios_guardar',{method:'POST',body:JSON.stringify({p_version:b.version,p_datos:datos,p_actor:user.id})});
    if(!out)fail(409,'Tu compañero cambió los costos. Actualiza antes de guardar.');return {config:out};
   }
   const b=request.method==='GET'?{id:url.searchParams.get('id')}:await jsonBody(request),x=await row(b.id);
   if(x.archivado_at||!x.guardado_at)fail(409,'Restaura el pedido y verifica sus archivos antes de cotizar.');
   if(op==='cotizacion'&&request.method==='GET')return {cotizacion:await ensure(x)};
   if(request.method!=='POST'||!['cotizacion-guardar','cotizacion-recalcular','cotizacion-publicar','cotizacion-retirar'].includes(op))fail(404,'Operación no encontrada.');
   if(!Number.isSafeInteger(b.version)||b.version<1)fail(400,'Versión inválida.');
   const old=await get(x.id);if(!old||old.version!==b.version)fail(409,'La cotización cambió. Vuelve a abrirla antes de guardar.');
   let draft=old.borrador,published=null,modo='guardar';
   if(op==='cotizacion-guardar'&&b.borrador?.schema!==5)fail(409,'El cotizador ahora incluye costos por talla, color y cantidad. Recarga la página antes de guardar.');
   try{
    if(op==='cotizacion-guardar')draft=calcular(x.items.map(commercialItem),b.borrador);
    if(op==='cotizacion-recalcular')draft=generar(x.items.map(commercialItem),(await config()).datos);
    if(op==='cotizacion-publicar'){
     if(['cancelado'].includes(x.estado))fail(409,'No publiques una cotización de un pedido cancelado.');
     draft=calcular(x.items.map(commercialItem),entrada(old.borrador));published=paraCliente(draft);modo='publicar';
    }
    if(op==='cotizacion-retirar')modo='retirar';
   }catch(e){if(e.status)throw e;fail(400,e.message);}
   const out=await sb('/rest/v1/rpc/zain_cotizacion_guardar',{method:'POST',body:JSON.stringify({p_id:x.id,p_version:b.version,p_modo:modo,p_borrador:draft,p_publicada:published,p_actor:user.id})});
   if(!out)fail(409,'Tu compañero modificó esta cotización o el pedido. Actualiza antes de continuar.');return {cotizacion:out};
  }};
}
