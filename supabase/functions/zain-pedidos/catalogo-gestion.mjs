// Proyección del catálogo; el render, SKU ZAIN, paletas y tallas quedan protegidos.
export const editable=new Set(['activo','nombre','descripcion','especificaciones','tejido','composicion','gramaje','medidas','disponibilidad','proveedor','sku_proveedor','foto_id']);
export function normalizeChanges(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||!Object.keys(input).length)throw Error('Faltan los cambios del modelo.');
 const result={};
 for(const [key,val] of Object.entries(input)){
  if(!editable.has(key))throw Error('Ese campo está protegido: '+key);
  if(key==='activo'){if(typeof val!=='boolean')throw Error('Actividad inválida.');result[key]=val;continue;}
  if(key==='gramaje'){if(!Number.isInteger(val)||val<1||val>2000)throw Error('Gramaje inválido.');result[key]=val;continue;}
  if(key==='foto_id'){if(val!==null&&!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(val))throw Error('Foto inválida.');result[key]=val;continue;}
  const limits={nombre:120,descripcion:900,especificaciones:2400,tejido:120,composicion:250,medidas:300,disponibilidad:300,proveedor:120,sku_proveedor:120};
  if(typeof val!=='string'||val.length>limits[key]||/[\x00-\x08\x0b-\x1f\x7f]/.test(val))throw Error('Revisa '+key+'.');
  if(key==='nombre'&&!val.trim())throw Error('El nombre no puede quedar vacío.');
  result[key]=val.trim();
 }
 return result;
}
export function resolveInternal(base,editions){
 const catalog=structuredClone(base),map=new Map(editions.map(x=>[x.producto_id,x]));
 for(const p of catalog.productos){
  const row=map.get(p.idPublico||p.id),d=row?.cambios||{};
  p.versionCatalogo=row?.version||0;p.fotoReferenciaId=d.foto_id||null;
  if(d.activo!==undefined)p.activo=d.activo;
  if(d.nombre!==undefined){p.nombreFamiliaComercial=d.nombre;p.nombreComercial=d.nombre+(p.silueta?' · '+p.silueta:'');}
  for(const key of ['descripcion','especificaciones','tejido','gramaje','disponibilidad'])if(d[key]!==undefined)p[key]=d[key];
  if(d.composicion!==undefined){if(d.composicion!==p.composicion)p.composicionColor={};p.composicion=d.composicion;}
  if(d.medidas!==undefined&&d.medidas!==p.medidas){p.medidas=d.medidas;p.dimensiones=null;}
  p.proveedorCompras=d.proveedor??p.fabricante??'';
  p.skuProveedor=d.sku_proveedor??p.codigoFabricante??'';
 }
 catalog.productosHistoricos=catalog.productos.filter(p=>p.activo===false);
 return catalog;
}
export function projectPublic(basePublic,internal,photos,storageBase){
 const copy=structuredClone(basePublic),bySku=new Map([...copy.productos,...copy.productosHistoricos].map(p=>[p.sku,p]));
 const photoMap=new Map(photos.map(f=>[f.id,f])),all=[];
 for(const p of internal.productos){
  const pub=bySku.get(p.sku);if(!pub)continue;
  pub.activo=p.activo!==false;pub.nombre=p.nombreComercial||pub.nombre;pub.nombreFamilia=p.nombreFamiliaComercial||pub.nombreFamilia;
  for(const key of ['descripcion','especificaciones','tejido','composicion','gramaje','medidas','disponibilidad'])if(p[key]!==undefined)pub[key]=structuredClone(p[key]);
  // Las claves de composición por color conservan los IDs públicos, no códigos internos.
  if(Object.keys(p.composicionColor||{}).length===0)pub.composicionColor={};
  else pub.composicionColor=bySku.get(p.sku).composicionColor;
  if(p.dimensiones===null)pub.dimensiones=null;
  const photo=photoMap.get(p.fotoReferenciaId);
  if(photo&&photo.producto_id===(p.idPublico||p.id)&&/^[a-z0-9-]+\/[a-f0-9-]{36}\.webp$/.test(photo.objeto))pub.fotoModelo=storageBase+'/storage/v1/object/public/zain-catalogo-fotos/'+photo.objeto;
  all.push(pub);
 }
 copy.productos=all.filter(p=>p.activo);copy.productosHistoricos=all.filter(p=>!p.activo);
 copy.categoriasCatalogo=internal.categoriasCatalogo.filter(cat=>copy.productos.some(p=>p.categoria===cat));
 copy.muestrasPortada=(basePublic.muestrasPortada||[]).filter(m=>copy.productos.some(p=>p.id===m.p));
 if(!copy.muestrasPortada.length&&copy.productos.length){const p=copy.productos[0];copy.muestrasPortada=[{p:p.id,c:p.colores[0],t:p.tecnicas[0],z:p.zonas[0].id,cm:Math.min(9,p.zonas[0].max)}];}
 const bag=copy.productos.find(p=>p.id==='bolsa-expo')||copy.productos.find(p=>p.grupo==='bolsas');
 if(bag)copy.grupos.bolsas.foto=bag.foto;
 return {productos:copy.productos,productosHistoricos:copy.productosHistoricos,categoriasCatalogo:copy.categoriasCatalogo,muestrasPortada:copy.muestrasPortada,grupos:copy.grupos};
}
export const stable=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
