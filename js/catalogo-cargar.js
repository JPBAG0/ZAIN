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
 window.ZAINCatalogoListo=(async()=>{
  try{
   const r=await fetch(C.pedidosApi+'?op=catalogo-publico',{cache:'no-store',signal:AbortSignal.timeout(12000)});
   if(!r.ok)throw Error('Catálogo no disponible');
   const {catalogo}=await r.json();
   if(!catalogo||!Array.isArray(catalogo.productos)||!Array.isArray(catalogo.productosHistoricos))throw Error('Catálogo incompleto');
   Object.assign(C,catalogo);unificarCategorias();return true;
  }catch{
   C.productosHistoricos=[...C.productos,...(C.productosHistoricos||[])];C.productos=[];C.muestrasPortada=[];C.categoriasCatalogo=[];C.catalogoNoDisponible=true;return false;
  }
 })();
})();
