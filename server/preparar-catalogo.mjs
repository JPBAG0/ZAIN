// Genera únicamente la información que puede recibir el catálogo del cliente.
import {writeFile,mkdir,copyFile} from 'node:fs/promises';
import C from './config-interno.cjs';
if(C.productos.some(p=>!/^ZN-[A-Z]{2}-\d{3}$/.test(p.sku)) || new Set(C.productos.map(p=>p.sku)).size!==C.productos.length)throw Error('Asignar SKU únicos y persistentes antes de generar.');
const copy=structuredClone(C);
const legacyHash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0).toString(16);};
const colorIDs=new Map(C.colores.map(c=>[c.id,c.idPublico||c.id]));
const families=new Map();let count=0;
await mkdir(new URL('../img/productos/zain/',import.meta.url),{recursive:true});
copy.colores=copy.colores.map(c=>{if(c.fabricante){c.compatHash=legacyHash(c.id);c.id=c.idPublico;}delete c.idPublico;delete c.fabricante;delete c.codigo;return c;});
for(const p of copy.productos){
  p.nombre=p.nombreComercial || p.nombre.replace(/ \([CD]\d{4}\)$/,'');
  p.nombreFamilia=p.nombreFamiliaComercial || p.nombreFamilia;
  p.colores=p.colores.map(x=>colorIDs.get(x));
  if(p.fabricante){
    p.prendaCatalogo=true;
    p.compatHash=legacyHash(p.id);p.id=p.idPublico;
    if(!families.has(p.familia))families.set(p.familia,'zain-familia-'+(++count));
    p.familia=families.get(p.familia);
    const target='img/productos/zain/'+p.sku.toLowerCase()+'-render.webp';
    await copyFile(new URL('../'+p.foto,import.meta.url),new URL('../'+target,import.meta.url));
    p.foto=target;
    const photo='img/productos/zain/'+p.sku.toLowerCase()+'-modelo.webp';
    await copyFile(new URL('../img/productos/yazbek/'+p.codigoFabricante.toLowerCase()+'.webp',import.meta.url),new URL('../'+photo,import.meta.url));
    p.fotoModelo=photo;
    const compositions={};
    for(const [code,value] of Object.entries(p.composicionColor||{})){const c=C.colores.find(x=>x.fabricante===p.fabricante&&x.codigo===code);if(c)compositions[colorIDs.get(c.id)]=value;}
    p.composicionColor=compositions;
  }
  for(const key of ['idPublico','fabricante','codigoFabricante','fuente','imagenFuente','escalaNota','fotoOriginal','nombreComercial','nombreFamiliaComercial'])delete p[key];
}
copy.catalogoVersion='zain-catalogo-activo-panel-2026-10-14';
delete copy.catalogoYazbekPendiente;
copy.productosHistoricos=copy.productos.filter(p=>p.activo===false);
copy.productos=copy.productos.filter(p=>p.activo!==false);
copy.categoriasCatalogo=copy.categoriasCatalogo.filter(cat=>copy.productos.some(p=>p.categoria===cat));
copy.muestrasPortada=C.muestrasPortada.map(m=>({...m,p:C.productos.find(p=>p.id===m.p).idPublico,c:colorIDs.get(m.c)}));
const json=JSON.stringify(copy,null,2);
if(/yazbek|\b[CD]\d{4}\b/i.test(json))throw Error('La configuración pública conserva referencias del proveedor.');
await writeFile(new URL('../js/config.js',import.meta.url),'// Catálogo público generado; editar server/config-interno.cjs.\n(() => { const config = '+json+';\nif(typeof module!=="undefined" && module.exports)module.exports=config;else window.ZAIN=config;})();\n');
console.log('Catálogo público: '+copy.productos.length+' referencias; '+copy.productos.filter(p=>p.fotoModelo).length+' fotos con modelo.');

