// Carga el catálogo vigente antes de iniciar la tienda.
(() => {
 const C=window.ZAIN;
 // Una sola familia de navegación para las prendas de abrigo del catálogo público.
 const categoria=c=>['chamarras','sudaderas','chamarras y sudaderas'].includes(String(c).trim().toLocaleLowerCase('es-MX'))?'Chamarras y sudaderas':c;
 const unificarCategorias=()=>{
  C.productos=C.productos.map(p=>({...p,categoria:categoria(p.categoria)}));
  C.productosHistoricos=C.productosHistoricos.map(p=>({...p,categoria:categoria(p.categoria)}));
  C.categoriasCatalogo=[...new Set(C.categoriasCatalogo.map(categoria))];
 };
 const valido=c=>!!c&&Array.isArray(c.productos)&&c.productos.length>0&&Array.isArray(c.productosHistoricos)&&Array.isArray(c.categoriasCatalogo)&&Array.isArray(c.muestrasPortada);
 // Respaldo si falla la API: la última copia buena de este navegador o la foto publicada con el sitio, la más reciente.
 const LLAVE='zain-catalogo-respaldo';
 const guardarCopia=catalogo=>{try{localStorage.setItem(LLAVE,JSON.stringify({t:Date.now(),catalogo}));}catch{}};
 const copiaLocal=()=>{try{const x=JSON.parse(localStorage.getItem(LLAVE));return valido(x?.catalogo)&&Number.isFinite(x.t)?x:null;}catch{return null;}};
 const copiaSitio=async()=>{try{const r=await fetch('js/catalogo-respaldo.json',{cache:'no-cache',signal:AbortSignal.timeout(8000)});if(!r.ok)return null;const x=await r.json();const t=Date.parse(x?.generado);return valido(x?.catalogo)&&Number.isFinite(t)?{t,catalogo:x.catalogo}:null;}catch{return null;}};
 window.ZAINCatalogoListo=(async()=>{
  try{
   const r=await fetch(C.pedidosApi+'?op=catalogo-publico',{cache:'no-store',signal:AbortSignal.timeout(12000)});
   if(!r.ok)throw Error('Catálogo no disponible');
   const {catalogo}=await r.json();
   if(!catalogo||!Array.isArray(catalogo.productos)||!Array.isArray(catalogo.productosHistoricos))throw Error('Catálogo incompleto');
   Object.assign(C,catalogo);unificarCategorias();if(valido(catalogo))guardarCopia(catalogo);return true;
  }catch{
   const local=copiaLocal(),sitio=await copiaSitio(),copia=[local,sitio].filter(Boolean).sort((a,b)=>b.t-a.t)[0];
   if(copia){Object.assign(C,copia.catalogo);unificarCategorias();C.catalogoRespaldo=true;return true;}
   C.productosHistoricos=[...C.productos,...(C.productosHistoricos||[])];C.productos=[];C.muestrasPortada=[];C.categoriasCatalogo=[];C.catalogoNoDisponible=true;return false;
  }
 })();
})();
