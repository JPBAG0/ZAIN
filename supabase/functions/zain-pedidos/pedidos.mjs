import { randomUUID, createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';
import C from './catalogo.mjs';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TYPES = { 'image/png':'png', 'image/jpeg':'jpg', 'image/webp':'webp', 'image/svg+xml':'svg', 'application/pdf':'pdf' };
const STATES = ['nuevo', 'contactado', 'cotizado', 'confirmado', 'produccion', 'entregado', 'cancelado'];
const fail = (status, message) => { const e = new Error(message); e.status = status; throw e; };
const sha = x => createHash('sha256').update(x).digest('hex');
const text = (v, max=1000) => typeof v === 'string' ? v.replace(/[\x00-\x08\x0b-\x1f\x7f]/g,'').slice(0,max) : '';
const equal = (a,b) => typeof a === 'string' && typeof b === 'string' && a.length===b.length && timingSafeEqual(Buffer.from(a),Buffer.from(b));
const validateID = id => { if (!UUID.test(id || '')) fail(400,'Folio inválido.'); return id; };
const validateToken = token => { if (!/^[a-f0-9]{64}$/.test(token || '')) fail(403,'No se pudo verificar esta solicitud.'); return sha(token); };

export function validateOrder(body, { allowHistoricos = false } = {}) {
  if (!body || typeof body!=='object' || Array.isArray(body)) fail(400,'Falta el pedido.');
  validateID(body.id); validateToken(body.token);
  if (!Array.isArray(body.items) || !body.items.length || body.items.length>20) fail(400,'El pedido admite hasta 20 selecciones.');
  const items = body.items.map((x,i) => {
    if (!x || typeof x !== 'object' || Array.isArray(x)) fail(400,'Selección inválida.');
    const p = C.productos.find(p=>p.id===x.p || p.idPublico===x.p) || C.catalogoYazbekPendiente?.find(p=>p.id===x.p) || (allowHistoricos && C.productosHistoricos?.find(p=>p.id===x.p));
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
  const row=async(id)=>{validateID(id);const rows=await sb('/rest/v1/zain_pedidos?id=eq.'+id+'&select=*&limit=1');if(!rows?.[0])fail(404,'Solicitud no encontrada.');return rows[0];};
  const owner=async body=>{const x=await row(body.id);if(!equal(x.token_hash,validateToken(body.token)))fail(403,'No se pudo verificar esta solicitud.');return x;};
  const staff=async req=> {
    const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];if(!token)fail(401,'Inicia sesión para consultar los pedidos.');
    const r=await fetcher(base+'/auth/v1/user',{headers:{apikey:publicKey,Authorization:'Bearer '+token},signal:AbortSignal.timeout(10000)});
    const u=await r.json().catch(()=>null);if(!r.ok||!u?.id)fail(401,'Tu sesión terminó. Vuelve a entrar.');
    if(!UUID.test(u.id)||!u.email_confirmed_at||typeof u.email!=='string')fail(403,'Cuenta no autorizada.');
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
    if(!x.guardado_at || !equal(readToken(x),b.token))fail(404,'Enlace de seguimiento no válido.');
    return x;
  };
  const commercialItem=p=>{const product=C.productos.find(v=>v.id===p.p || v.idPublico===p.p);return {...p,sku:product?.sku||'',nombre:p.nombre.replace(/ \([CD]\d{4}\)$/,''),color:p.color.replace(/ · \d+$/,''),detalleMedidas:(p.detalleMedidas||'').replace(/guía Yazbek/g,'guía de tallas')};};
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
  const publicRow=x=>{const {token_hash,consulta_nonce,...rest}=x;return {...rest,items:rest.items.map(p=>({...p,sku:C.productos.find(v=>v.id===p.p || v.idPublico===p.p)?.sku||''}))};};
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
      if(!ready)fail(503,'El guardado de pedidos todavía no está habilitado.');
      if(request.method==='POST'&&['crear','subidas','finalizar'].includes(op)) {
        const body=await jsonBody(request);
        if(op==='crear') {
          // El catálogo retirado solo puede reintentarse en un folio ya registrado
          // y con su secreto de carga. La RPC conserva la igualdad del contenido.
          const historical=Array.isArray(body.items)&&body.items.some(x=>C.productosHistoricos?.some(p=>p.id===x?.p));
          if(historical) {
            try{await owner(body);}catch(e){if(e.status===404)fail(400,'Esta selección pertenece al catálogo anterior. Elige una referencia del catálogo actual; tus archivos siguen guardados.');throw e;}
          }
          const x=validateOrder(body,{allowHistoricos:historical});
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
        return response(200,receipt(x));
      }
      if(request.method==='POST'&&['consulta','archivo-consulta'].includes(op)) {
        const b=await jsonBody(request),x=await customer(b);
        return response(200,op==='consulta'?{pedido:customerRow(x)}:await signedFile(x,b));
      }
      const user=await staff(request);
      if(request.method==='POST'&&op==='enlace') {
        const b=await jsonBody(request),x=await row(b.id);
        if(!x.guardado_at)fail(409,'Esta solicitud todavía no terminó de subir sus archivos.');
        return response(200,receipt(x));
      }
      if(request.method==='GET'&&op==='lista') {
        const offset=Math.max(0,Math.min(100000,Number(url.searchParams.get('offset'))||0));
        const state=url.searchParams.get('estado');if(state&&!STATES.includes(state))fail(400,'Estado inválido.');
        const q=text(url.searchParams.get('q'),50).replace(/[^a-zA-Z0-9-]/g,'');
        const rows=await sb('/rest/v1/zain_pedidos?guardado_at=not.is.null&select=id,folio,created_at,guardado_at,estado,total,notas_internas,version&order=created_at.desc&limit=50&offset='+Math.floor(offset)+(state?'&estado=eq.'+state:'')+(q?'&folio=ilike.*'+q+'*':''));
        return response(200,{pedidos:rows,equipo:user});
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
