/* Una API de pedidos común para Vercel y el futuro servidor Node. */
(() => {
  'use strict';
  const endpoint=window.ZAIN.pedidosApi||'/api/pedidos',key='zain-solicitud';
  let config={activo:false},draft=null,configError=null;
  try{draft=JSON.parse(localStorage.getItem(key));}catch{}
  const api=async(op,body)=> {
    const r=await fetch(endpoint+'?op='+op,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});
    const data=await r.json().catch(()=>({error:'No se pudo conectar con ZAIN.'}));
    if(!r.ok)throw new Error(data.error||'No se pudo guardar el pedido.');return data;
  };
  const ready=api('config').then(x=>{config=x;return x.activo;}).catch(er=>{configError=er;return false;});
  const reintentar=async()=>{config=await api('config');configError=null;return config.activo;};
  const guardarDraft=()=>{try{localStorage.setItem(key,JSON.stringify(draft));}catch{}};
  const enviar=async(items,progreso=()=>{})=> {
    await ready;if(!config.activo)throw new Error('El guardado en la nube todavía no está habilitado.');
    const files=[];
    for(let i=0;i<items.length;i++) {
      const x=items[i],stored=await window.ZAINArchivos.obtener(x.id);
      if(stored?.logo)files.push({item:i,kind:'logo',name:stored.logoNombre||'logo',type:stored.logo.type,size:stored.logo.size,blob:stored.logo});
      else if(x.tieneLogo||/archivo «/.test(x.logo||''))throw new Error('Falta el logo original de '+x.nombre+'. Vuelve a agregar ese producto.');
      if(stored?.render)files.push({item:i,kind:'render',name:'render.png',type:'image/png',size:stored.render.size,blob:stored.render});
      else if(x.tieneRender || x.tieneRender==null&&x.cm>0)throw new Error('Falta el render de '+x.nombre+'. Vuelve a agregar ese producto.');
    }
    const cleanItems=items.map(({mini,unit,archivosTemporales,...x})=>x),manifest=files.map(({blob,...x})=>x);
    const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify({items:cleanItems,files:manifest})));
    const fingerprint=Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('');
    if(!draft || draft.fingerprint!==fingerprint || !draft.created || !draft.recibo&&Date.now()-draft.created>23*3600000) {
      draft={id:crypto.randomUUID(),token:Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join(''),fingerprint,created:Date.now()};guardarDraft();
    }
    if(draft.recibo) {
      // Migra las fichas antiguas sin crear otro pedido ni cambiar el folio.
      if(!new URL(draft.recibo.url,location.href).pathname.startsWith('/mi-pedido')) {
        progreso('Preparando tu enlace de seguimiento…');
        draft.recibo=await api('finalizar',{id:draft.id,token:draft.token});guardarDraft();
      }
      return draft.recibo;
    }
    progreso('Guardando tu solicitud…');
    const owner={id:draft.id,token:draft.token};
    await api('crear',{...owner,items:cleanItems,files:manifest});
    const signed=await api('subidas',owner);let n=0;
    for(const f of signed.files) {
      const local=files.find(x=>x.item===f.item&&x.kind===f.kind);if(!local)throw new Error('Falta un archivo. Tu pedido sigue guardado aquí.');
      if(!f.subido) {
        progreso('Guardando archivos '+(n+1)+' de '+files.length+'…');
        const r=await fetch(f.url,{method:'PUT',headers:{'Content-Type':local.type},body:local.blob,signal:AbortSignal.timeout(120000)});
        if(!r.ok&&r.status!==409)throw new Error('No se pudo subir un archivo. Reintenta: tu pedido sigue guardado.');
      }
      n++;
    }
    const recibo=await api('finalizar',owner);draft.recibo=recibo;guardarDraft();
    dispatchEvent(new CustomEvent('zain:solicitud_guardada',{detail:{folio:recibo.folio,piezas:items.reduce((s,x)=>s+x.piezas,0)}}));
    return recibo;
  };
  window.ZAINPedidos={ready,activo:()=>config.activo,error:()=>configError,reintentar,enviar};
})();
