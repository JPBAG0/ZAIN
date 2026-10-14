// Altas propias: datos normalizados y proyección sin referencias de compras.
const word=(v,max,label,required=false)=>{
 if(typeof v!=='string'||v.length>max||/[\x00-\x08\x0b-\x1f\x7f]/.test(v))throw Error('Revisa '+label+'.');
 const s=v.trim();if(required&&!s)throw Error('Falta '+label+'.');return s;
};
export const normalCategory=v=>{const s=word(v,80,'categoría',true);if(['todo','todos'].includes(s.toLowerCase()))throw Error('Usa otro nombre de categoría.');return s;};
export function normalizeNewProduct(b,categories,templates){
 const allowed=['nombre','categoria','descripcion','especificaciones','silueta','proveedor','sku_proveedor','colores','tallas','tecnicas','minimoPiezas','pasoPiezas','anchoFrente','modoRender','plantilla','request_id'];
 if(!b||typeof b!=='object'||Array.isArray(b)||Object.keys(b).some(k=>!allowed.includes(k)))throw Error('Datos de producto inválidos.');
 const nombre=word(b.nombre,120,'nombre',true),categoria=normalCategory(b.categoria);
 if(!categories.includes(categoria))throw Error('Selecciona una categoría existente.');
 const colors=b.colores;
 if(!Array.isArray(colors)||!colors.length||colors.length>20)throw Error('Agrega entre uno y veinte colores.');
 const colores=colors.map(c=>{
  if(!c||typeof c!=='object'||Object.keys(c).some(k=>!['nombre','hex'].includes(k)))throw Error('Color inválido.');
  const nombre=word(c.nombre,50,'color',true);if(typeof c.hex!=='string'||!/^#[a-f0-9]{6}$/i.test(c.hex))throw Error('Código HEX inválido.');
  return {nombre,hex:c.hex.toLowerCase()};
 });
 if(new Set(colores.map(c=>c.nombre.toLocaleLowerCase('es-MX'))).size!==colores.length)throw Error('No repitas nombres de color.');
 const tallas=b.tallas;if(!Array.isArray(tallas)||tallas.length>18)throw Error('Revisa las tallas.');
 const sizes=tallas.map(t=>word(t,12,'talla',true));if(new Set(sizes.map(t=>t.toLowerCase())).size!==sizes.length)throw Error('No repitas tallas.');
 const tecnicas=b.tecnicas;if(!Array.isArray(tecnicas)||!tecnicas.length||tecnicas.length>3||new Set(tecnicas).size!==tecnicas.length||tecnicas.some(t=>!['bordado','serigrafia','dtf'].includes(t)))throw Error('Selecciona técnicas válidas.');
 let minimo=b.minimoPiezas,paso=b.pasoPiezas;
 if(!Number.isSafeInteger(minimo)||minimo<1||minimo>9999||!Number.isSafeInteger(paso)||paso<1||paso>1000)throw Error('Revisa mínimo e incrementos.');
 if(categoria==='Bolsas'){minimo=100;paso=50;}
 if(!Number.isFinite(b.anchoFrente)||b.anchoFrente<10||b.anchoFrente>150)throw Error('Revisa el ancho de referencia.');
 if(!['reutilizar','subir','cola_local'].includes(b.modoRender))throw Error('Selecciona cómo preparar el render.');
 const template=b.modoRender==='reutilizar'?templates.find(p=>(p.idPublico||p.id)===b.plantilla):null;
 if(b.modoRender==='reutilizar'&&!template)throw Error('Selecciona un render existente.');
 return {nombre,categoria,descripcion:word(b.descripcion||'',900,'descripción'),especificaciones:word(b.especificaciones||'',2400,'especificaciones'),silueta:word(b.silueta||'',50,'silueta'),proveedor:word(b.proveedor||'',120,'proveedor'),sku_proveedor:word(b.sku_proveedor||'',120,'SKU proveedor'),colores,tallas:sizes,tecnicas:[...tecnicas],minimoPiezas:minimo,pasoPiezas:paso,anchoFrente:b.anchoFrente,modoRender:b.modoRender,plantilla:template?(template.idPublico||template.id):null,render_id:null};
}
export function expandCatalog(base,newRows,categories,photos,publicBase,storageBase){
 const copy=structuredClone(base),photoMap=new Map(photos.map(p=>[p.id,p]));
 const url=p=>p&&/^[a-z0-9-]+\/[a-f0-9-]{36}\.webp$/.test(p.objeto)?storageBase+'/storage/v1/object/public/zain-catalogo-fotos/'+p.objeto:'';
 for(const row of newRows){
  const d=row.datos,template=base.productos.find(p=>(p.idPublico||p.id)===d.plantilla),basePub=publicBase&&[...publicBase.productos,...publicBase.productosHistoricos].find(p=>p.sku===template?.sku);
  const render=photoMap.get(d.render_id),ownPhoto=render?.producto_id===row.id?url(render):'';
  const colors=d.colores.map((c,i)=>({id:row.id+'-color-'+i,idPublico:row.id+'-color-'+i,nombre:c.nombre,hex:c.hex}));
  copy.colores.push(...colors);
  const zones=template?structuredClone(template.zonas):[{id:'frente',nombre:'Frente',x:500,y:450,max:Math.min(d.anchoFrente,35),orientativa:true}];
  const p={id:row.id,idPublico:row.id,sku:row.sku,creadoGestion:true,publicado:!!row.publicado_at,nombre:d.nombre,nombreComercial:d.nombre+(d.silueta?' · '+d.silueta:''),nombreFamiliaComercial:d.nombre,categoria:d.categoria,descripcion:d.descripcion,especificaciones:d.especificaciones,silueta:d.silueta,colores:colors.map(c=>c.id),tallas:[...d.tallas],tecnicas:[...d.tecnicas],minimoPiezas:d.minimoPiezas,pasoPiezas:d.pasoPiezas,zonas:zones,pxPorCm:template?.pxPorCm||760/d.anchoFrente,escalaMaxLogo:template?.escalaMaxLogo||1.3,foto:ownPhoto||(d.modoRender==='reutilizar'?basePub?.foto||'':''),renderOrientativo:true,activo:false,composicionColor:{},disponibilidad:'Consulta disponibilidad.',fotoReferenciaId:null,proveedorCompras:d.proveedor,skuProveedor:d.sku_proveedor,modoRender:d.modoRender,renderBloqueado:!!row.publicado_at};
  if(d.categoria==='Bolsas')p.grupo='bolsas';
  copy.productos.push(p);
 }
 copy.categoriasCatalogo=[...new Set([...copy.categoriasCatalogo,...categories.map(c=>c.nombre)])];
 return copy;
}
export function publicNewProduct(p){
 // El SKU/proveedor de compras y origen/plantilla no forman parte de la vista pública.
 const keys=['id','sku','creadoGestion','nombre','nombreFamilia','categoria','descripcion','especificaciones','silueta','colores','tallas','tecnicas','minimoPiezas','pasoPiezas','zonas','pxPorCm','escalaMaxLogo','foto','renderOrientativo','activo','composicionColor','disponibilidad','grupo','medidas','tejido','composicion','gramaje','tecnicasNota'];
 return Object.fromEntries(keys.filter(k=>p[k]!==undefined).map(k=>[k,structuredClone(p[k])]));
}
