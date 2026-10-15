import { randomUUID, createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';
import C from './config-interno.cjs';
import PublicC from '../js/config.js';
import {createWorkshop} from './talleres.mjs';
import {createQuotes} from './cotizaciones.mjs';
import {expandCatalog,normalizeNewProduct,normalCategory} from './catalogo-altas.mjs';
import {resolveInternal,projectPublic,normalizeChanges,stable} from './catalogo-gestion.mjs';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TYPES = { 'image/png':'png', 'image/jpeg':'jpg', 'image/webp':'webp', 'image/svg+xml':'svg', 'application/pdf':'pdf' };
const STATES = ['nuevo', 'contactado', 'cotizado', 'confirmado', 'produccion', 'entregado', 'cancelado'];
const fail = (status, message) => { const e = new Error(message); e.status = status; throw e; };
const sha = x => createHash('sha256').update(x).digest('hex');
const text = (v, max=1000) => typeof v === 'string' ? v.replace(/[\x00-\x08\x0b-\x1f\x7f]/g,'').slice(0,max) : '';
const equal = (a,b) => typeof a === 'string' && typeof b === 'string' && a.length===b.length && timingSafeEqual(Buffer.from(a),Buffer.from(b));
const validateID = id => { if (!UUID.test(id || '')) fail(400,'Folio inválido.'); return id; };
const validateToken = token => { if (!/^[a-f0-9]{64}$/.test(token || '')) fail(403,'No se pudo verificar esta solicitud.'); return sha(token); };

export function validateOrder(body, { allowHistoricos = false, catalogo = C, snapshot = false } = {}) {
  const C=catalogo;
  if (!body || typeof body!=='object' || Array.isArray(body)) fail(400,'Falta el pedido.');
  validateID(body.id); validateToken(body.token);
  if (!Array.isArray(body.items) || !body.items.length || body.items.length>20) fail(400,'El pedido admite hasta 20 selecciones.');
  const items = body.items.map((x,i) => {
    if (!x || typeof x !== 'object' || Array.isArray(x)) fail(400,'Selección inválida.');
    const p = C.productos.find(p=>(p.id===x.p || p.idPublico===x.p) && (p.activo!==false || allowHistoricos)) || C.catalogoYazbekPendiente?.find(p=>p.id===x.p) || (allowHistoricos && C.productosHistoricos?.find(p=>p.id===x.p));
    const n = Number(x.piezas);
    if (!p || !Number.isSafeInteger(n) || n<Math.max(1,p.minimoPiezas||0) || n>9999 || (n-(p.minimoPiezas||0))%(p.pasoPiezas||1)) fail(400,'Revisa las cantidades y mínimos de los productos.');
    const colors=p.colores.map(id=>C.colores.find(c=>c.id===id));
    if (!colors.some(c=>c?.nombre===x.color)) fail(400,'Color de producto inválido.');
    if (!p.tecnicas.map(id=>C.tecnicas.find(t=>t.id===id)?.nombre).includes(x.tecnica)) fail(400,'Técnica inválida.');
    const item={ indice:i,p:p.id,nombre:p.nombre,color:x.color,tecnica:x.tecnica,piezas:n,medidas:p.medidas||'',detalleMedidas:text(x.detalleMedidas,500),zona:text(x.zona,120),cm:Number.isFinite(x.cm)?Math.max(0,Math.min(200,x.cm)):0,tallas:text(x.tallas,500),tallasEtq:text(x.tallasEtq,80),logo:text(x.logo,250),colorLogo:text(x.colorLogo,100),pantone:text(x.pantone,80),notas:text(x.notas,1500),tieneLogo:!!x.tieneLogo,tieneRender:!!x.tieneRender };
    if(p.fabricante) {
      const col=colors.find(c=>(c?.codigo===x.colorCodigo || c?.idPublico===x.colorId) && c.nombre===x.color);
      if(!col)fail(400,'Código de color inválido para este modelo.');
      const counts=x.tallasDetalle;
      if(!counts || typeof counts!=='object' || Array.isArray(counts) || !Object.keys(counts).length || Object.entries(counts).some(([t,v])=>!p.tallas.includes(t)||!Number.isSafeInteger(v)||v<1||v>9999) || Object.values(counts).reduce((a,v)=>a+v,0)!==n)fail(400,'Revisa las tallas y su suma para la silueta elegida.');
      const zone=p.zonas.find(z=>z.nombre===(typeof x.zona==='string'?x.zona.replace(/ \(posición ajustada\)$/,''):''));
      if(!zone || !Number.isFinite(x.cm) || x.cm<0 || x.cm>zone.max)fail(400,'Revisa la ubicación y el tamaño solicitado del logo.');
      Object.assign(item,{
        codigoFabricante:p.codigoFabricante,fabricante:p.fabricante,silueta:p.silueta,
        color:col.nombre+' · '+col.codigo,colorCodigo:col.codigo,
        tallasDetalle:Object.fromEntries(p.tallas.filter(t=>counts[t]).map(t=>[t,counts[t]])),
        tallas:p.tallas.filter(t=>counts[t]).map(t=>t+' '+counts[t]).join(' · '),tallasEtq:'Tallas',
        gramaje:p.gramaje,tejido:p.tejido,composicion:p.composicionColor[col.codigo]||p.composicion,
        fuente:p.fuente,renderOrientativo:p.renderOrientativo,
        detalleMedidas:'Medidas por talla: ancho plano y largo según la guía Yazbek. No es un área de impresión.',
      });
    }
    if(p.creadoGestion||p.catalogo2026){
      const col=colors.find(c=>c.id===x.colorId&&c.nombre===x.color);if(!col)fail(400,'Color de producto inválido.');
      const zone=p.zonas.find(z=>z.nombre===String(x.zona||'').replace(/ \(posición ajustada\)$/,''));
      if(!zone||!Number.isFinite(x.cm)||x.cm<0||x.cm>zone.max)fail(400,'Revisa ubicación y tamaño del logo.');
      if(p.tallas.length){
        const counts=x.tallasDetalle;
        if(!counts||typeof counts!=='object'||Array.isArray(counts)||Object.entries(counts).some(([t,v])=>!p.tallas.includes(t)||!Number.isSafeInteger(v)||v<1)||Object.values(counts).reduce((a,v)=>a+v,0)!==n)fail(400,'Revisa las tallas y su suma.');
        item.tallasDetalle=Object.fromEntries(p.tallas.filter(t=>counts[t]).map(t=>[t,counts[t]]));item.tallas=p.tallas.filter(t=>counts[t]).map(t=>t+' '+counts[t]).join(' · ');
      }
      Object.assign(item,{silueta:p.silueta,renderOrientativo:true});
      if(p.catalogo2026)Object.assign(item,{tejido:p.tejido||'',composicion:p.composicionColor?.[col.id]||p.composicion||'',...(p.gramaje?{gramaje:p.gramaje}:{}),detalleMedidas:p.tablaTallas?'Medidas por talla: ancho plano y largo en la guía del producto; no es área de impresión.':'Tallas sujetas a confirmación; medidas exactas de prenda por confirmar.'});
    }
    if(snapshot)Object.assign(item,{nombreZain:p.nombreComercial||p.nombre,sku:p.sku,skuProveedor:p.skuProveedor??p.codigoFabricante??"",proveedor:p.proveedorCompras??p.fabricante??""});
    return item;
  });
  const files = body.files || [];
  if (!Array.isArray(files) || files.length>40) fail(400,'Revisa los archivos del pedido.');
  const seen = new Set(); let bytes=0;
  const manifest = files.map(f=> {
    if (!Number.isInteger(f.item) || !items[f.item] || !['logo','render'].includes(f.kind) || !TYPES[f.type] || (f.kind==='render' && f.type!=='image/png') || !Number.isSafeInteger(f.size) || f.size<1 || f.size>15*1024*1024) fail(400,'Cada logo o render debe ser un archivo válido de hasta 15 MB.');
    const key=f.item+':'+f.kind; if(seen.has(key)) fail(400,'Hay archivos duplicados.'); seen.add(key);bytes+=f.size;
    return { item:f.item,kind:f.kind,type:f.type,size:f.size,name:text(f.name,140),path:body.id+'/'+f.item+'-'+f.kind+'.'+TYPES[f.type] };
  });
  if(bytes>30*1024*1024) fail(400,'Los archivos de una solicitud pueden sumar hasta 30 MB.');
  for(const x of items) if((x.tieneLogo&&!seen.has(x.indice+':logo')) || (x.tieneRender&&!seen.has(x.indice+':render'))) fail(400,'Faltan archivos del logo o render. Vuelve a agregar esa selección.');
  return { items,manifest,bytes,total:items.reduce((s,x)=>s+x.piezas,0) };
}

async function jsonBody(request) {
  if(!request.headers.get('content-type')?.startsWith('application/json')) fail(415,'Usa una solicitud JSON.');
  const reader=request.body?.getReader(); if(!reader) fail(400,'Falta el pedido.');
  const chunks=[];let bytes=0;
  while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>128*1024){await reader.cancel();fail(413,'El pedido es demasiado grande.');}chunks.push(value);}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{fail(400,'No se pudo leer la solicitud.');}
}

export function createHandler(env={}, fetcher=fetch) {
  const base=(env.SUPABASE_URL||'').replace(/\/$/,'');
  const key=env.SUPABASE_SECRET_KEY||env.SUPABASE_SERVICE_ROLE_KEY||'';
  const publicKey=env.SUPABASE_PUBLISHABLE_KEY||env.SUPABASE_ANON_KEY||'';
  const site=(env.ZAIN_SITE_URL||'https://zain-amber-sigma.vercel.app').replace(/\/$/,'');
  const origins=new Set([new URL(site).origin,...(env.ZAIN_ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean)]);
  const ready=env.ZAIN_PEDIDOS_ENABLED==='true' && /^https:\/\//.test(base) && !!key && !!publicKey;
  const bucket='zain-pedidos';
  const storageURL = raw => {
    if(typeof raw!=='string')fail(502,'No se pudo preparar el archivo.');
    const path=/^https:\/\//.test(raw)||raw.startsWith('/storage/v1/')?raw:'/storage/v1/'+raw.replace(/^\//,'');
    const u=new URL(path,base);if(u.origin!==new URL(base).origin)fail(502,'No se pudo preparar el archivo.');return u;
  };
  const serviceHeaders={apikey:key,...(key.startsWith('eyJ')?{Authorization:'Bearer '+key}:{})};
  const sb = async(path,options={}) => {
    const r=await fetcher(base+path,{...options,headers:{...serviceHeaders,'Content-Type':'application/json',...options.headers},signal:AbortSignal.timeout(15000)});
    const body=await r.json().catch(()=>null);
    if(!r.ok){const message=String(body?.message||'');if(message.includes('zain_rate'))fail(429,'Demasiadas solicitudes. Intenta más tarde.');if(message.includes('zain_capacity'))fail(503,'El guardado de archivos está temporalmente ocupado. Contacta a ZAIN por WhatsApp.');if(message.includes('zain_conflict'))fail(409,'Esta solicitud ya existe con otros datos.');fail(502,'No se pudo guardar o consultar el pedido. Intenta de nuevo.');}
    return body;
  };

  const catalogEnabled=env.ZAIN_CATALOGO_ENABLED==='true';
  const altasEnabled=env.ZAIN_CATALOGO_ALTAS_ENABLED==='true';
  const quotesEnabled=env.ZAIN_COTIZACIONES_ENABLED==='true';
  const paged=async path=>{
    const out=[];for(let offset=0;offset<5000;offset+=200){const rows=await sb(path+'&limit=200&offset='+offset);out.push(...rows);if(rows.length<200)return out;}
    fail(503,'El catálogo excede la capacidad de esta vista.');};
  const catalogRows=()=>altasEnabled?paged('/rest/v1/zain_catalogo_ediciones?select=producto_id,cambios,version&order=producto_id.asc'):sb('/rest/v1/zain_catalogo_ediciones?select=producto_id,cambios,version&limit=200');
  const catalogPhotos=async(rows,products=[])=>{
    const ids=[...new Set([...rows.map(r=>r.cambios?.foto_id),...products.map(p=>p.datos.render_id)].filter(id=>UUID.test(id||'')))],out=[];
    for(let i=0;i<ids.length;i+=100)out.push(...await sb('/rest/v1/zain_catalogo_fotos?id=in.('+ids.slice(i,i+100).join(',')+')&select=id,producto_id,objeto'));return out;};
  const catalogState=async()=>{
    const rows=catalogEnabled?await catalogRows():[];
    const [products,categories]=altasEnabled?await Promise.all([paged('/rest/v1/zain_productos_gestion?select=id,sku,datos,publicado_at&order=id.asc'),paged('/rest/v1/zain_categorias_gestion?select=nombre&order=nombre.asc')]):[[],[]];
    const photos=await catalogPhotos(rows,products);
    const expanded=altasEnabled?expandCatalog(C,products,categories,photos,PublicC,base):C;
    return {rows,products,categories,photos,cat:resolveInternal(expanded,rows)};};
  const currentCatalog=async()=>(await catalogState()).cat;
  const knownProduct=async id=>(altasEnabled?(await currentCatalog()).productos:C.productos).find(p=>(p.idPublico||p.id)===id);
  const productInfo=(p,photos=[])=>{
    const original=[...PublicC.productos,...PublicC.productosHistoricos].find(x=>x.sku===p.sku),photo=photos.find(x=>x.id===p.fotoReferenciaId&&x.producto_id===(p.idPublico||p.id)&&/^[a-z0-9-]+\/[a-f0-9-]{36}\.webp$/.test(x.objeto));
    return {id:p.idPublico||p.id,sku:p.sku,skuProveedor:p.skuProveedor??p.codigoFabricante??'',proveedor:p.proveedorCompras??p.fabricante??'',silueta:p.silueta||'',categoria:p.categoria,tecnicas:[...p.tecnicas],activo:p.activo!==false,nombre:p.nombreFamiliaComercial||p.nombreFamilia||p.nombre,descripcion:p.descripcion||'',especificaciones:p.especificaciones||'',tejido:p.tejido||'',composicion:p.composicion||'',gramaje:p.gramaje||null,medidas:p.medidas||'',disponibilidad:p.disponibilidad||'Consulta disponibilidad.',creadoGestion:!!p.creadoGestion,modoRender:p.modoRender||'existente',renderBloqueado:!!p.renderBloqueado,renderListo:!!p.foto,fotoRender:p.creadoGestion?p.foto:original?.foto||'',fotoModelo:photo?base+'/storage/v1/object/public/zain-catalogo-fotos/'+photo.objeto:original?.fotoModelo||'',version:p.versionCatalogo||0};
  };

  const row=async(id)=>{validateID(id);const rows=await sb('/rest/v1/zain_pedidos?id=eq.'+id+'&select=*&limit=1');if(!rows?.[0])fail(404,'Solicitud no encontrada.');return rows[0];};
  const owner=async body=>{const x=await row(body.id);if(x.archivado_at)fail(410,'Esta solicitud fue retirada. Contacta a ZAIN.');if(!equal(x.token_hash,validateToken(body.token)))fail(403,'No se pudo verificar esta solicitud.');return x;};
  const identity=async req=> {
    const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];if(!token)fail(401,'Inicia sesión para consultar los pedidos.');
    const r=await fetcher(base+'/auth/v1/user',{headers:{apikey:publicKey,Authorization:'Bearer '+token},signal:AbortSignal.timeout(10000)});
    const u=await r.json().catch(()=>null);if(!r.ok||!u?.id)fail(401,'Tu sesión terminó. Vuelve a entrar.');
    if(!UUID.test(u.id)||!u.email_confirmed_at||typeof u.email!=='string')fail(403,'Cuenta no autorizada.');
    return u;
  };
  const staff=async req=>{
    const u=await identity(req);
    const access=await sb('/rest/v1/zain_accesos?email=eq.'+encodeURIComponent(u.email.toLowerCase())+'&activo=eq.true&select=nombre&limit=1');
    if(!access?.length)fail(403,'Esta cuenta no tiene acceso al panel de ZAIN.');
    let users=await sb('/rest/v1/zain_equipo?user_id=eq.'+u.id+'&select=user_id,nombre,activo&limit=1');
    if(!users.length){await sb('/rest/v1/zain_equipo?on_conflict=user_id',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates'},body:JSON.stringify({user_id:u.id,nombre:access[0].nombre})});users=await sb('/rest/v1/zain_equipo?user_id=eq.'+u.id+'&select=user_id,nombre,activo&limit=1');}
    if(!users[0]?.activo)fail(403,'Esta cuenta no tiene acceso al panel de ZAIN.');return {id:u.id,nombre:users[0].nombre};
  };
  // Capacidad de consulta independiente del token que autoriza las cargas.
  const readToken=x=>{
    if(!/^[a-f0-9]{64}$/.test(x.token_hash||'') || !x.consulta_nonce)fail(503,'El seguimiento todavía no está disponible.');
    return createHmac('sha256',Buffer.from(x.token_hash,'hex')).update('zain:consulta:v1:'+x.id+':'+x.consulta_nonce).digest('hex');
  };
  const receipt=x=>({id:x.id,folio:x.folio,url:site+'/mi-pedido#'+x.id+'/'+readToken(x)});
  const customer=async b=>{
    validateID(b.id);
    if(!/^[a-f0-9]{64}$/.test(b.token||''))fail(404,'Enlace de seguimiento no válido.');
    const x=await row(b.id);
    if(x.archivado_at || !x.guardado_at || !equal(readToken(x),b.token))fail(404,'Enlace de seguimiento no válido.');
    return x;
  };
  const commercialItem=p=>{const product=C.productos.find(v=>v.id===p.p || v.idPublico===p.p);return {...p,sku:p.sku||product?.sku||'',nombre:p.nombreZain||product?.nombreComercial||p.nombre.replace(/ \([CD]\d{4}\)$/,''),color:p.color.replace(/ · \d+$/,''),detalleMedidas:(p.detalleMedidas||'').replace(/guía Yazbek/g,'guía de tallas')};};
  const customerRow=x=>({folio:x.folio,created_at:x.created_at,estado:x.estado,total:x.total,
    items:x.items.map(commercialItem).map(p=>Object.fromEntries(['sku','indice','nombre','color','tecnica','piezas','medidas','detalleMedidas','zona','cm','tallas','tallasEtq','logo','colorLogo','pantone','notas','silueta','gramaje','tejido','composicion','renderOrientativo'].filter(k=>p[k]!==undefined).map(k=>[k,p[k]]))),
    archivos:x.archivos.map(({item,kind,name,type})=>({item,kind,name,type}))});
  const signedFile=async(x,b)=>{
    if(!x.guardado_at)fail(409,'Esta solicitud todavía no terminó de subir sus archivos.');
    const f=x.archivos.find(f=>f.item===b.item&&f.kind===b.kind);if(!f)fail(404,'Archivo no encontrado.');
    const data=await sb('/storage/v1/object/sign/'+bucket+'/'+f.path,{method:'POST',body:JSON.stringify({expiresIn:120})});
    const signed=storageURL(data.signedURL);
    if(f.kind==='logo'||b.descarga)signed.searchParams.set('download',f.name||'archivo.'+TYPES[f.type]);
    return {url:signed.href,name:f.name,type:f.type};
  };
  const publicRow=x=>{const {token_hash,consulta_nonce,...rest}=x;return {...rest,items:rest.items.map(item=>{const {pedido_hash,...p}=item;const product=C.productos.find(v=>v.id===p.p || v.idPublico===p.p);return {...p,nombre:p.nombreZain||product?.nombreComercial||p.nombre,nombreProveedor:p.nombre,sku:p.sku||product?.sku||'',skuProveedor:p.skuProveedor??p.codigoFabricante??product?.codigoFabricante??'',proveedor:p.proveedor??p.fabricante??product?.fabricante??''};})};};
  const quotes=createQuotes({sb,row,fail,commercialItem});
  return async request => {
    const headers={'Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
    const response=(status,body)=>new Response(JSON.stringify(body),{status,headers});
    try {
      const origin=request.headers.get('origin');
      if(origin&&!origins.has(origin))fail(403,'Origen no permitido.');
      if(origin){headers['Access-Control-Allow-Origin']=origin;headers['Vary']='Origin';}
      if(request.method==='OPTIONS'){headers['Access-Control-Allow-Methods']='GET, POST, OPTIONS';headers['Access-Control-Allow-Headers']='Content-Type, Authorization';return new Response(null,{status:204,headers});}
      const url=new URL(request.url),op=url.searchParams.get('op')||'config';
      if(request.method==='GET'&&op==='config')return response(200,{activo:ready,...(ready?{supabaseUrl:base,publishableKey:publicKey}:{})});
      if(request.method==='GET'&&op==='catalogo-publico'){
        if(!ready&&catalogEnabled)fail(503,'No se pudo actualizar el catálogo.');
        const {rows,cat,photos}=await catalogState();
        headers['Cache-Control']='no-store';
        return response(200,{catalogo:projectPublic(PublicC,cat,photos,base)});
      }
      if(!ready)fail(503,'El guardado de pedidos todavía no está habilitado.');
      if(request.method==='POST'&&['crear','subidas','finalizar'].includes(op)) {
        const body=await jsonBody(request);
        if(op==='crear') {

          let catalog=C,existing=null,requestHash=null;
          if(catalogEnabled){
            validateID(body.id);validateToken(body.token);
            requestHash=sha(stable({items:body.items,files:body.files||[]}));
            try{existing=await owner(body);}catch(e){if(e.status!==404)throw e;}
            if(existing){
              if(existing.items?.[0]?.pedido_hash){
                if(existing.items[0].pedido_hash!==requestHash)fail(409,'Esta solicitud ya existe con otros datos.');
                return response(200,{id:body.id,folio:existing.folio});
              }
              const old=validateOrder(body,{allowHistoricos:true});
              if(stable(old.items)!==stable(existing.items)||stable(old.manifest)!==stable(existing.archivos))fail(409,'Esta solicitud ya existe con otros datos.');
              return response(200,{id:body.id,folio:existing.folio});
            }
            catalog=await currentCatalog();
          }
          // El catálogo retirado solo puede reintentarse en un folio ya registrado
          // y con su secreto de carga. La RPC conserva la igualdad del contenido.
          const historical=Array.isArray(body.items)&&body.items.some(x=>C.productosHistoricos?.some(p=>p.id===x?.p));
          if(historical) {
            try{await owner(body);}catch(e){if(e.status===404)fail(400,'Esta selección pertenece al catálogo anterior. Elige una referencia del catálogo actual; tus archivos siguen guardados.');throw e;}
          }
          const x=validateOrder(body,{allowHistoricos:historical,catalogo:catalog,snapshot:catalogEnabled});
          if(requestHash)for(const item of x.items)item.pedido_hash=requestHash;
          const ip=request.headers.get('x-vercel-forwarded-for')||request.headers.get('x-forwarded-for')||request.headers.get('cf-connecting-ip')||'sin-ip';
          const client=createHmac('sha256',key).update(ip.split(',')[0].trim()).digest('hex');
          const result=await sb('/rest/v1/rpc/zain_crear_pedido',{method:'POST',body:JSON.stringify({p_id:body.id,p_token_hash:validateToken(body.token),p_items:x.items,p_archivos:x.manifest,p_total:x.total,p_bytes:x.bytes,p_capacity:Math.min(Number(env.ZAIN_CAPACITY_MB)||800,100000)*1024*1024,p_client:client})});
          return response(200,{id:body.id,folio:result.folio});
        }
        const x=await owner(body);
        if(op==='subidas') {
          if(x.guardado_at)return response(200,{files:[],guardado:true,folio:x.folio});
          if(Date.now()-new Date(x.created_at).getTime()>24*3600000)fail(410,'Esta solicitud expiró. Crea una nueva.');
          const files=[];
          const stored=await sb('/storage/v1/object/list/'+bucket,{method:'POST',body:JSON.stringify({prefix:x.id,limit:100,offset:0})});
          for(const f of x.archivos){const old=stored.find(s=>s.name===f.path.split('/')[1]);if(old){if(Number(old.metadata?.size)!==f.size||old.metadata?.mimetype!==f.type)fail(409,'Un archivo no coincide. Crea una nueva solicitud.');files.push({...f,subido:true});continue;}const data=await sb('/storage/v1/object/upload/sign/'+bucket+'/'+f.path,{method:'POST',body:'{}'});files.push({...f,url:storageURL(data.url).href});}
          return response(200,{files});
        }
        if(!x.guardado_at) {
          const stored=await sb('/storage/v1/object/list/'+bucket,{method:'POST',body:JSON.stringify({prefix:x.id,limit:100,offset:0,sortBy:{column:'name',order:'asc'}})});
          for(const f of x.archivos){const s=stored.find(s=>s.name===f.path.split('/')[1]);if(!s||Number(s.metadata?.size)!==f.size||s.metadata?.mimetype!==f.type)fail(409,'Todavía faltan archivos por subir. Reintenta para completar la solicitud.');}
          await sb('/rest/v1/zain_pedidos?id=eq.'+x.id+'&guardado_at=is.null',{method:'PATCH',body:JSON.stringify({guardado_at:new Date().toISOString()})});
        }
        if(quotesEnabled){try{await quotes.ensure(x);}catch{console.warn('ZAIN: borrador pendiente; se reintentará desde gestión.');}}
        return response(200,receipt(x));
      }
      if(request.method==='POST'&&['consulta','archivo-consulta'].includes(op)) {
        const b=await jsonBody(request),x=await customer(b);
        return response(200,op==='consulta'?{pedido:{...customerRow(x),...(quotesEnabled?{cotizacion:await quotes.publicada(x.id)}:{})}}:await signedFile(x,b));
      }
      if(request.method==='POST'&&['render-local-subida','render-local-finalizar'].includes(op)){
        if(!altasEnabled)fail(503,'La cola local todavía no está habilitada.');
        const b=await jsonBody(request);validateID(b.id);
        if(!/^[a-f0-9]{64}$/.test(b.ticket||''))fail(403,'Ticket de render no válido.');
        const jobs=await sb('/rest/v1/zain_render_cola?id=eq.'+b.id+'&select=id,producto_id,estado,worker_hash,worker_at,resultado_foto&limit=1'),job=jobs[0];
        if(!job||job.estado!=='generando'||!equal(job.worker_hash,sha(b.ticket))||!Number.isFinite(new Date(job.worker_at).getTime())||Date.now()-new Date(job.worker_at).getTime()>2*3600000)fail(403,'Ticket de render no válido.');
        if(op==='render-local-subida'){
          if(!Number.isSafeInteger(b.size)||b.size<20||b.size>4*1024*1024||b.type!=='image/webp')fail(400,'Render WEBP inválido.');
          let photoID=job.resultado_foto;
          if(!photoID){photoID=randomUUID();const accepted=await sb('/rest/v1/rpc/zain_render_salida_local',{method:'POST',body:JSON.stringify({p_id:b.id,p_hash:sha(b.ticket),p_foto:photoID})});if(!accepted)fail(409,'La solicitud cambió.');}
          const path=job.producto_id+'/'+photoID+'.webp';
          const data=await sb('/storage/v1/object/upload/sign/zain-catalogo-fotos/'+path,{method:'POST',body:'{}'});
          return response(200,{foto_id:photoID,url:storageURL(data.url).href});
        }
        if(!job.resultado_foto)fail(409,'Falta subir el render.');
        const stored=await sb('/storage/v1/object/list/zain-catalogo-fotos',{method:'POST',body:JSON.stringify({prefix:job.producto_id,limit:1000,offset:0})});
        const f=stored.find(x=>x.name===job.resultado_foto+'.webp');
        if(!f||f.metadata?.mimetype!=='image/webp'||!Number.isSafeInteger(Number(f.metadata?.size))||Number(f.metadata?.size)<20||Number(f.metadata?.size)>4*1024*1024)fail(409,'La subida todavía no se pudo verificar.');
        const image=await fetcher(base+'/storage/v1/object/public/zain-catalogo-fotos/'+job.producto_id+'/'+job.resultado_foto+'.webp',{headers:{Range:'bytes=0-19'},signal:AbortSignal.timeout(15000)});
        if(!image.ok)fail(409,'No se pudo verificar el render.');const reader=image.body.getReader();let prefix=Buffer.alloc(0);while(prefix.length<20){const chunk=await reader.read();if(chunk.done)break;prefix=Buffer.concat([prefix,Buffer.from(chunk.value).subarray(0,20-prefix.length)]);}await reader.cancel();
        if(prefix.length<20||prefix.toString('ascii',0,4)!=='RIFF'||prefix.toString('ascii',8,12)!=='WEBP'||prefix.readUInt32LE(4)+8!==Number(f.metadata.size))fail(400,'El render no es un archivo WEBP válido.');
        const done=await sb('/rest/v1/rpc/zain_render_listo_local',{method:'POST',body:JSON.stringify({p_id:b.id,p_hash:sha(b.ticket)})});
        if(!done)fail(409,'La solicitud cambió.');
        return response(200,{estado:'revision'});
      }

      if(op.startsWith('taller-')){if(env.ZAIN_TALLERES_ENABLED!=='true')fail(503,'El acceso de talleres todavía no está habilitado.');return await createWorkshop({sb,identity,row,signedFile,jsonBody,fail,response})(request,url,op);}
      const user=await staff(request);
      if(/^(precios-|cotizacion)/.test(op)){
        if(!quotesEnabled)fail(503,'El cotizador todavía no está habilitado.');
        return response(200,await quotes.handle(request,url,op,user,jsonBody,currentCatalog));
      }

      if(request.method==='GET'&&op==='talleres-lista'){
        if(env.ZAIN_TALLERES_ENABLED!=='true')return response(200,{talleres:[],habilitado:false});
        return response(200,{talleres:await sb('/rest/v1/zain_talleres?select=id,email,nombre,tecnica,activo,principal,version&order=nombre.asc&limit=200'),habilitado:true});
      }
      if(request.method==='POST'&&op==='talleres-guardar'){
        if(env.ZAIN_TALLERES_ENABLED!=='true')fail(503,'Los talleres todavía no están habilitados.');
        const b=await jsonBody(request);
        if(b.id)validateID(b.id);
        const email=typeof b.email==='string'?b.email.trim().toLowerCase():'';
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||typeof b.nombre!=='string'||!b.nombre.trim()||b.nombre.length>120||!['Bordado','DTF','Serigrafía'].includes(b.tecnica)||typeof b.activo!=='boolean'||typeof b.principal!=='boolean'||(b.id&&(!Number.isSafeInteger(b.version)||b.version<0)))fail(400,'Revisa los datos del taller.');
        const out=await sb('/rest/v1/rpc/zain_guardar_taller',{method:'POST',body:JSON.stringify({p_id:b.id||null,p_version:b.version||0,p_email:email,p_nombre:b.nombre.trim(),p_tecnica:b.tecnica,p_activo:b.activo,p_principal:b.principal,p_actor:user.id})});
        if(!out)fail(409,'El taller cambió. Actualiza antes de guardar.');return response(200,{taller:out});
      }
      if(request.method==='GET'&&op==='talleres-partidas'){
        if(env.ZAIN_TALLERES_ENABLED!=='true')return response(200,{partidas:[]});
        const id=validateID(url.searchParams.get('id'));await row(id);
        return response(200,{partidas:await sb('/rest/v1/zain_partidas_taller?pedido_id=eq.'+id+'&select=id,indice,taller_id,tecnica,estado,version&order=indice.asc')});
      }
      if(request.method==='POST'&&op==='talleres-asignar'){
        if(env.ZAIN_TALLERES_ENABLED!=='true')fail(503,'Los talleres todavía no están habilitados.');
        const b=await jsonBody(request);validateID(b.id);validateID(b.taller_id);
        const x=await row(b.id),ts=await sb('/rest/v1/zain_talleres?id=eq.'+b.taller_id+'&activo=eq.true&select=id,tecnica&limit=1');
        if(x.archivado_at||!x.guardado_at||!['confirmado','produccion'].includes(x.estado)||!Number.isSafeInteger(b.indice)||!x.items[b.indice]||ts[0]?.tecnica!==x.items[b.indice].tecnica)fail(400,'Confirma el pedido y elige un taller compatible.');
        const out=await sb('/rest/v1/rpc/zain_asignar_partida',{method:'POST',body:JSON.stringify({p_pedido:b.id,p_indice:b.indice,p_taller:b.taller_id,p_actor:user.id})});return response(200,{asignacion:out});
      }


      if(request.method==='POST'&&op==='categoria-crear'){
        if(!altasEnabled)fail(503,'Las altas de categorías todavía no están habilitadas.');
        const b=await jsonBody(request);let name;try{name=normalCategory(b.nombre);}catch(e){fail(400,e.message);}
        const state=await catalogState(),same=state.cat.categoriasCatalogo.find(n=>n.toLocaleLowerCase('es-MX')===name.toLocaleLowerCase('es-MX'));
        if(same)return response(200,{nombre:same});
        const data=await sb('/rest/v1/rpc/zain_crear_categoria',{method:'POST',body:JSON.stringify({p_nombre:name,p_actor:user.id})});
        return response(200,{nombre:data.nombre});
      }
      if(request.method==='POST'&&op==='producto-crear'){
        if(!altasEnabled)fail(503,'Las altas de productos todavía no están habilitadas.');
        const b=await jsonBody(request);validateID(b.request_id);
        const state=await catalogState();let d;try{d=normalizeNewProduct(b,state.cat.categoriasCatalogo,C.productos);}catch(e){fail(400,e.message);}
        const result=await sb('/rest/v1/rpc/zain_crear_producto',{method:'POST',body:JSON.stringify({p_request:b.request_id,p_datos:d,p_hash:sha(stable(d)),p_actor:user.id})});
        return response(200,{id:result.id,sku:result.sku});
      }
      if(request.method==='POST'&&op==='catalogo-render'){
        if(!altasEnabled)fail(503,'Las altas todavía no están habilitadas.');
        const b=await jsonBody(request),p=await knownProduct(b.id);
        if(!p?.creadoGestion||!UUID.test(b.foto_id||'')||!Number.isSafeInteger(b.version))fail(400,'Referencia de render inválida.');
        if(p.renderBloqueado)fail(409,'El render se conserva después de la primera publicación.');
        const data=await sb('/rest/v1/rpc/zain_asignar_render',{method:'POST',body:JSON.stringify({p_producto:b.id,p_foto:b.foto_id,p_version:b.version,p_actor:user.id})});
        if(!data)fail(409,'Otro miembro cambió el producto. Actualiza antes de continuar.');
        return response(200,{guardado:true,version:data.version});
      }
      if(request.method==='POST'&&op==='render-solicitar'){
        if(!altasEnabled)fail(503,'Las solicitudes de render todavía no están habilitadas.');
        const b=await jsonBody(request),p=await knownProduct(b.id);validateID(b.request_id);
        if(!p?.creadoGestion||!UUID.test(b.foto_id||''))fail(400,'Selecciona un producto nuevo y su fotografía.');
        if(p.renderBloqueado)fail(409,'Ese producto ya fue publicado; su render está protegido.');
        const data=await sb('/rest/v1/rpc/zain_solicitar_render',{method:'POST',body:JSON.stringify({p_producto:b.id,p_foto:b.foto_id,p_request:b.request_id,p_actor:user.id})});
        return response(200,{solicitud:data});
      }
      if(request.method==='GET'&&op==='render-estados'){
        if(!altasEnabled)return response(200,{solicitudes:[]});
        const selected=url.searchParams.get('id');if(selected&&!await knownProduct(selected))fail(400,'Producto no disponible.');
        const rows=await sb('/rest/v1/zain_render_cola?select=id,producto_id,estado,created_at,updated_at,error,resultado_foto&order=created_at.desc&limit=200'+(selected?'&producto_id=eq.'+encodeURIComponent(selected):''));
        const ids=rows.map(x=>x.resultado_foto).filter(id=>UUID.test(id||''));const photos=ids.length?await sb('/rest/v1/zain_catalogo_fotos?id=in.('+ids.join(',')+')&select=id,producto_id,objeto'):[];
        return response(200,{solicitudes:rows.map(x=>{const f=photos.find(f=>f.id===x.resultado_foto&&f.producto_id===x.producto_id);return {...x,url:x.estado==='revision'&&f&&/^[a-z0-9-]+\/[a-f0-9-]{36}\.webp$/.test(f.objeto)?base+'/storage/v1/object/public/zain-catalogo-fotos/'+f.objeto:null};})});
      }

      if(request.method==='GET'&&op==='catalogo-lista'){
        const {rows,cat,photos}=await catalogState();
        return response(200,{productos:cat.productos.map(p=>productInfo(p,photos)),editable:catalogEnabled,opcionesTecnicas:C.tecnicas.map(({id,nombre})=>({id,nombre})),categorias:cat.categoriasCatalogo,altas:altasEnabled,plantillas:[...PublicC.productos,...PublicC.productosHistoricos].map(p=>({id:p.id,nombre:p.nombre,sku:p.sku,foto:p.foto})),renderLocal:true});
      }
      if(request.method==='POST'&&op==='catalogo-guardar'){
        if(!catalogEnabled)fail(503,'La edición del catálogo todavía no está habilitada.');
        const b=await jsonBody(request),p=await knownProduct(b.id);
        if(!p||!Number.isSafeInteger(b.version)||b.version<0)fail(400,'Referencia de catálogo inválida.');
        let changes;try{changes=normalizeChanges(b.cambios);}catch(e){fail(400,e.message);}
        if(changes.categoria!==undefined&&!(await currentCatalog()).categoriasCatalogo.includes(changes.categoria))fail(400,'Categoría no disponible.');
        if(changes.activo===true&&p.creadoGestion&&!p.foto)fail(409,'Prepara y revisa el render antes de publicar.');
        const r=await sb('/rest/v1/rpc/zain_guardar_catalogo',{method:'POST',body:JSON.stringify({p_producto_id:b.id,p_version:b.version,p_cambios:changes,p_actor:user.id})});
        if(!r)fail(409,'Tu compañero modificó este modelo. Recárgalo antes de guardar.');
        return response(200,{guardado:true,version:r.version});
      }
      if(request.method==='POST'&&op==='catalogo-foto'){
        if(!catalogEnabled)fail(503,'La edición del catálogo todavía no está habilitada.');
        const id=url.searchParams.get('id'),p=await knownProduct(id);
        if(!p||request.headers.get('content-type')!=='image/webp')fail(400,'Usa una foto WEBP del producto.');
        const chunks=[],reader=request.body?.getReader();if(!reader)fail(400,'Falta la foto.');
        let bytes=0;while(true){const v=await reader.read();if(v.done)break;bytes+=v.value.length;if(bytes>4*1024*1024){await reader.cancel();fail(413,'La foto puede pesar hasta 4 MB.');}chunks.push(v.value);}
        const data=Buffer.concat(chunks);
        if(data.length<20||data.toString('ascii',0,4)!=='RIFF'||data.toString('ascii',8,12)!=='WEBP'||data.readUInt32LE(4)+8!==data.length)fail(400,'La foto WEBP no es válida.');
        const photoID=randomUUID(),path=id+'/'+photoID+'.webp';
        const r=await fetcher(base+'/storage/v1/object/zain-catalogo-fotos/'+path,{method:'POST',headers:{...serviceHeaders,'Content-Type':'image/webp','x-upsert':'false'},body:data,signal:AbortSignal.timeout(30000)});
        if(!r.ok)fail(502,'No se pudo guardar la foto. Intenta de nuevo.');
        await sb('/rest/v1/zain_catalogo_fotos',{method:'POST',body:JSON.stringify({id:photoID,producto_id:id,objeto:path,creada_by:user.id})});
        return response(200,{foto_id:photoID,url:base+'/storage/v1/object/public/zain-catalogo-fotos/'+path});
      }

      if(request.method==='POST'&&op==='enlace') {
        const b=await jsonBody(request),x=await row(b.id);
        if(x.archivado_at || !x.guardado_at)fail(409,'Esta solicitud fue retirada o todavía no terminó de subir sus archivos.');
        return response(200,receipt(x));
      }
      if(request.method==='GET'&&op==='resumen')return response(200,{resumen:await sb('/rest/v1/rpc/zain_panel_resumen',{method:'POST',body:'{}'}),equipo:user});
      if(request.method==='GET'&&op==='lista') {
        const offset=Math.max(0,Math.min(100000,Number(url.searchParams.get('offset'))||0));
        const state=url.searchParams.get('estado');if(state&&!STATES.includes(state))fail(400,'Estado inválido.');
        const q=text(url.searchParams.get('q'),50).replace(/[^a-zA-Z0-9-]/g,'');
        const trash=url.searchParams.get('papelera')==='true';
        let dateFilter='';
        if(url.searchParams.get('periodo')==='semana'){const summary=await sb('/rest/v1/rpc/zain_panel_resumen',{method:'POST',body:'{}'});dateFilter='&created_at=gte.'+encodeURIComponent(summary.semana_desde);}
        const rows=await sb('/rest/v1/zain_pedidos?guardado_at=not.is.null&archivado_at='+(trash?'not.is.null':'is.null')+'&select=id,folio,created_at,guardado_at,archivado_at,estado,total,version,items&order='+(trash?'archivado_at.desc,':'')+'created_at.desc,id.desc&limit=21&offset='+Math.floor(offset)+(state?'&estado=eq.'+state:'')+(q?'&folio=ilike.*'+q+'*':'')+dateFilter);
        const items=rows.slice(0,20).map(({items,...x})=>({...x,selecciones:items.length,resumen:items.slice(0,2).map(p=>C.productos.find(v=>v.id===p.p || v.idPublico===p.p)?.nombreComercial||p.nombre).join(' / ')}));
        return response(200,{pedidos:items,siguiente:rows.length>20,equipo:user});
      }
      if(request.method==='POST'&&op==='archivar'){
        const b=await jsonBody(request);validateID(b.id);
        if(!Number.isSafeInteger(b.version)||b.version<0||typeof b.archivar!=='boolean')fail(400,'Revisa la solicitud que quieres retirar o restaurar.');
        const x=await row(b.id);
        if(b.archivar&&b.folio!==x.folio)fail(400,'Escribe el folio completo para moverlo a la papelera.');
        const result=await sb('/rest/v1/rpc/zain_archivar_pedido',{method:'POST',body:JSON.stringify({p_id:b.id,p_version:b.version,p_archivar:b.archivar,p_actor:user.id})});
        if(!result)fail(409,'Tu compañero modificó este pedido. Recarga antes de continuar.');
        return response(200,{pedido:publicRow(result)});
      }
      if(request.method==='GET'&&op==='historial'){
        const id=validateID(url.searchParams.get('id'));
        return response(200,{historial:await sb('/rest/v1/zain_historial?pedido_id=eq.'+id+'&select=id,created_at,estado_anterior,estado_nuevo,notas&order=created_at.desc,id.desc&limit=100')});
      }
      const id=request.method==='GET'?url.searchParams.get('id'):null;
      if(request.method==='GET'&&op==='detalle')return response(200,{pedido:publicRow(await row(id))});
      if(request.method==='POST'&&op==='actualizar') {
        const b=await jsonBody(request);validateID(b.id);
        if(!STATES.includes(b.estado)||!Number.isInteger(b.version)||b.version<0)fail(400,'Revisa el estado de la solicitud.');
        const result=await sb('/rest/v1/rpc/zain_actualizar_pedido',{method:'POST',body:JSON.stringify({p_id:b.id,p_version:b.version,p_estado:b.estado,p_notas:text(b.notas,5000),p_actor:user.id})});
        if(!result)fail(409,'Tu compañero modificó este pedido. Recarga para ver el cambio antes de guardarlo.');
        return response(200,{pedido:publicRow(result)});
      }
      if(request.method==='POST'&&op==='archivo') {
        const b=await jsonBody(request),x=await row(b.id);
        return response(200,await signedFile(x,b));
      }
      fail(404,'Operación no encontrada.');
    }catch(e){if(!e.status)console.error('ZAIN pedidos: error interno',e.name);return response(e.status||502,{error:e.status?e.message:'No se pudo completar la solicitud. Intenta de nuevo.'});}
  };
}
