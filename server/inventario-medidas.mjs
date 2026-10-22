import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export function faltanMedidas(catalogo){
 return catalogo.productos.filter(p=>p.activo!==false).map(p=>({sku:p.sku,nombre:p.nombre,categoria:p.categoria,tallas:p.tallas||[],medidasExistentes:typeof p.medidas==='string'?p.medidas:'',faltaTabla:!p.tablaTallas||!Object.keys(p.tablaTallas).length,faltaDetalle:typeof p.detalleMedidas!=='string'||!p.detalleMedidas.trim()})).filter(p=>p.faltaTabla||p.faltaDetalle);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const respaldo=JSON.parse(await readFile(new URL('../js/catalogo-respaldo.json',import.meta.url),'utf8'));
 const cat=respaldo.catalogo,pendientes=faltanMedidas(cat);
 const filas=pendientes.map(p=>`| ${p.sku} | ${p.nombre.replaceAll('|','/')} | ${p.categoria} | ${p.faltaTabla?'Falta':'Disponible'} | ${p.faltaDetalle?'Falta':'Disponible'} | ${p.tallas.length?p.tallas.join(', '):'Sin tallas / unitalla'} | ${p.medidasExistentes.replaceAll('|','/').replaceAll('\n',' ')||'No consta'} |`).join('\n');
 const texto=`# Medidas pendientes de ZAIN\n\nCorte: ${respaldo.generado}. Fuente: catálogo público respaldado; ${cat.productos.length} referencias activas. No se inventaron medidas.\n\nFaltan uno o ambos campos en ${pendientes.length} referencias: ${pendientes.filter(p=>p.faltaTabla).length} sin tablaTallas, ${pendientes.filter(p=>p.faltaDetalle).length} sin detalleMedidas.

Prioridad para conseguir guía por talla: ${pendientes.filter(p=>p.tallas.length&&p.faltaTabla).map(p=>p.sku+' '+p.nombre).join('; ')}. Tener tabla pero no detalle no significa carecer de guía: distinguir ambas columnas. Bolsas y unitalla requieren dimensiones, no una tabla de prendas por talla.\n\n| SKU | Producto | Categoría | tablaTallas | detalleMedidas | Tallas o alcance | Otras medidas existentes |\n| --- | --- | --- | --- | --- | --- | --- |\n${filas}\n\nPedir al proveedor/JP medidas y tolerancia de cada talla/modelo aplicable, en cm, aclarando ancho plano/largo. Conservar medidas ya documentadas. La lista se refiere al estado del catálogo respaldado; no certifica inventario ni stock.\n`;
 if(process.argv[2])await writeFile(process.argv[2],texto);else console.log(texto);
}
