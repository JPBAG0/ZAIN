/* Google Ads: solo el catálogo público, activa salvo oposición y con datos mínimos.
   Las solicitudes y el chat funcionan aunque la etiqueta no cargue. */
(() => {
  'use strict';
  const C=window.ZAIN,config=C.medicion||{},key='zain-consentimiento-medicion',version=1;
  const usable=C.privacidadPublicada===true&&config.activa===true&&/^AW-\d{6,20}$/.test(config.googleAdsId||'')
    &&Array.isArray(config.origenes)&&config.origenes.includes(location.origin)&&['/','/index.html'].includes(location.pathname);
  const label=x=>/^[a-zA-Z0-9_-]{5,100}$/.test(x||'')?x:null;
  const solicitationLabel=label(config.etiquetaSolicitud),whatsappLabel=label(config.etiquetaWhatsApp);
  let permitted=false,loaded=false,choice=null,lastClick=0;
  const sent=new Set(),pending=new Map();
  const defaults={ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'};
  const $=s=>document.querySelector(s);
  const save=allow=>{try{localStorage.setItem(key,JSON.stringify({version,allow,fecha:Date.now()}));}catch{}};
  const cleanLocation=()=>{
    const u=new URL(location.href);u.hash='';
    for(const k of [...u.searchParams.keys()])if(!['gclid','gbraid','wbraid','gad_source'].includes(k))u.searchParams.delete(k);
    return u.href;
  };
  const referrer=()=>{try{return new URL(document.referrer).origin;}catch{return '';}};
  function load() {
    if(!usable||!permitted||loaded)return;loaded=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
    window.gtag('consent','default',defaults);
    window.gtag('set','ads_data_redaction',true);
    window.gtag('consent','update',{...defaults,ad_storage:'granted',ad_user_data:'granted'});
    window.gtag('js',new Date());
    window.gtag('config',config.googleAdsId,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:cleanLocation(),page_referrer:referrer()});
    const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+config.googleAdsId;document.head.appendChild(script);
  }
  function choose(allow) {
    permitted=allow;choice=allow;save(allow);$('#medicionPreferencias').hidden=true;
    if(allow)load();
    else if(loaded){
      window.gtag('consent','update',defaults);
      // No toca carrito, archivos, autenticación ni otros datos necesarios.
      for(const entry of document.cookie.split(';')){const name=entry.trim().split('=')[0];if(!/^_(?:gcl|gac|ga)(?:_|$)/.test(name))continue;for(const domain of ['',location.hostname,'.'+location.hostname])document.cookie=name+'=; Max-Age=0; Path=/'+(domain?'; Domain='+domain:'');}
      location.reload();
    }
  }
  function conversion(target,params={}) {
    if(!usable||!permitted||!target)return Promise.resolve(false);
    load();
    return new Promise(resolve=>{
      let done=false;
      const finish=()=>{if(done)return;done=true;clearTimeout(timer);resolve(true);};
      const timer=setTimeout(finish,700);
      window.gtag('event','conversion',{send_to:config.googleAdsId+'/'+target,...params,page_location:cleanLocation(),page_referrer:referrer(),event_callback:finish,event_timeout:650});
    });
  }
  async function solicitud(id,piezas) {
    if(!usable||!permitted||!solicitationLabel||!/^[a-f0-9-]{36}$/i.test(id||''))return false;
    const raw=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('zain:medicion:v1:'+id));
    if(!permitted)return false;
    const transaction=Array.from(new Uint8Array(raw),x=>x.toString(16).padStart(2,'0')).join('');
    const dedup=config.googleAdsId+'/'+solicitationLabel+'/'+transaction;
    if(sent.has(dedup))return false;
    if(pending.has(dedup))return pending.get(dedup);
    // Google también deduplica por transaction_id; no se persiste un historial de clientes.
    const job=conversion(solicitationLabel,{transaction_id:transaction,piezas:Number.isSafeInteger(piezas)?Math.min(200000,Math.max(1,piezas)):1}).then(x=>{if(x)sent.add(dedup);return x;}).finally(()=>pending.delete(dedup));
    pending.set(dedup,job);return job;
  }
  function whatsapp(origen='pedido') {
    if(!usable||!permitted||!whatsappLabel||Date.now()-lastClick<1000)return Promise.resolve(false);
    lastClick=Date.now();
    return conversion(whatsappLabel,{origen:['pedido','contacto'].includes(origen)?origen:'contacto'});
  }
  window.ZAINMedicion={solicitud,whatsapp,activa:()=>usable&&permitted};
  document.querySelectorAll('[data-privacidad]').forEach(x=>x.hidden=!C.privacidadPublicada);
  if(!usable||(!solicitationLabel&&!whatsappLabel))return;
  // Medición activa por defecto (consentimiento tácito con aviso publicado); una oposición guardada la apaga y no vence.
  try{const saved=JSON.parse(localStorage.getItem(key));if(saved?.allow===false)choice=false;else if(saved?.version===version&&saved.allow===true)choice=true;}catch{}
  permitted=choice!==false;
  $('#medicionCambiar').hidden=false;
  $('#medicionPreferencias').hidden=true;
  $('#medicionPermitir').addEventListener('click',()=>choose(true));
  $('#medicionRechazar').addEventListener('click',()=>choose(false));
  $('#medicionCambiar').addEventListener('click',()=>{$('#medicionPreferencias').hidden=false;$('#medicionRechazar').focus();});
  document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a)return;try{const u=new URL(a.href,location.href);if(u.protocol==='https:'&&u.hostname==='wa.me'&&u.pathname==='/'+C.whatsapp)whatsapp('contacto').catch(()=>{});}catch{}},true);
  load();
})();
