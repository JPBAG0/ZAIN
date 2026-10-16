// Guarda una copia del catálogo publicado para usarla si la API no responde.
// Uso: node server/respaldo-catalogo.mjs  (volver a correr y publicar después de cambiar el catálogo en Gestión)
import {writeFile,access} from 'node:fs/promises';
import {createRequire} from 'node:module';
const C=createRequire(import.meta.url)('./config-interno.cjs');
const r=await fetch(C.pedidosApi+'?op=catalogo-publico',{headers:{Origin:'https://zain.com.mx'},signal:AbortSignal.timeout(20000)});
if(!r.ok)throw Error('La API respondió '+r.status);
const {catalogo}=await r.json();
if(!catalogo||!Array.isArray(catalogo.productos)||!catalogo.productos.length||!Array.isArray(catalogo.productosHistoricos)||!Array.isArray(catalogo.categoriasCatalogo)||!Array.isArray(catalogo.muestrasPortada))throw Error('Catálogo incompleto; no se sobrescribe el respaldo.');
// Las fotos deben existir en el sitio: el respaldo no puede depender de Supabase.
const fotos=[...new Set([...catalogo.productos,...catalogo.productosHistoricos].flatMap(p=>[p.foto,...Object.values(p.fotosColor||{})]).filter(f=>typeof f==='string'&&f&&!/^https?:/.test(f)))];
const faltan=[];for(const f of fotos){try{await access(new URL('../'+f.replace(/^\//,''),import.meta.url));}catch{faltan.push(f);}}
if(faltan.length)console.warn('Fotos que no están en el sitio:',faltan.join(', '));
await writeFile(new URL('../js/catalogo-respaldo.json',import.meta.url),JSON.stringify({generado:new Date().toISOString(),catalogo})+'\n');
console.log(`Respaldo: ${catalogo.productos.length} productos activos, ${catalogo.productosHistoricos.length} históricos, ${fotos.length} fotos revisadas.`);
