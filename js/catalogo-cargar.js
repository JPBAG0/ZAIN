// Carga el catálogo vigente antes de iniciar la tienda.
(() => {
 const C=window.ZAIN;
 window.ZAINCatalogoListo=(async()=>{
  try{
   const r=await fetch(C.pedidosApi+'?op=catalogo-publico',{cache:'no-store',signal:AbortSignal.timeout(12000)});
   if(!r.ok)throw Error('Catálogo no disponible');
   const {catalogo}=await r.json();
   if(!catalogo||!Array.isArray(catalogo.productos)||!Array.isArray(catalogo.productosHistoricos))throw Error('Catálogo incompleto');
   Object.assign(C,catalogo);return true;
  }catch{
   C.productosHistoricos=[...C.productos,...(C.productosHistoricos||[])];C.productos=[];C.muestrasPortada=[];C.categoriasCatalogo=[];C.catalogoNoDisponible=true;return false;
  }
 })();
})();
