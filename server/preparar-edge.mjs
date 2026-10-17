// Genera el adaptador Supabase desde el mismo servidor y catálogo de Node.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import C from './config-interno.cjs';
import PublicC from '../js/config.js';
const folder=new URL('../supabase/functions/zain-pedidos/',import.meta.url);
await mkdir(folder,{recursive:true});
const source=(await readFile(new URL('./pedidos.mjs',import.meta.url),'utf8')).replace("import C from './config-interno.cjs';","import C from './catalogo.mjs';");
await writeFile(new URL('pedidos.mjs',folder),source.replace("import PublicC from '../js/config.js';","import PublicC from './publico.mjs';").replace("'../js/logo-medidas.js'","'./logo-medidas.mjs'"));
await writeFile(new URL('publico.mjs',folder),'export default '+JSON.stringify(PublicC,null,2)+';\n');
await writeFile(new URL('catalogo-gestion.mjs',folder),await readFile(new URL('./catalogo-gestion.mjs',import.meta.url),'utf8'));
for(const name of ['catalogo-altas.mjs','talleres.mjs','cotizaciones.mjs','cotizacion-costos.mjs','gastos.mjs','finanzas-generales.mjs','cotizacion-seguimiento.mjs'])await writeFile(new URL(name,folder),(await readFile(new URL('./'+name,import.meta.url),'utf8')).replace("'../js/cotizacion-core.js'","'./cotizacion-core.mjs'").replace("'../js/cotizacion-pagos.js'","'./cotizacion-pagos.mjs'"));
await writeFile(new URL('cotizacion-pagos.mjs',folder),await readFile(new URL('../js/cotizacion-pagos.js',import.meta.url),'utf8'));
await writeFile(new URL('cotizacion-core.mjs',folder),(await readFile(new URL('../js/cotizacion-core.js',import.meta.url),'utf8')).replace("'./cotizacion-pagos.js'","'./cotizacion-pagos.mjs'").replace("'./logo-medidas.js'","'./logo-medidas.mjs'"));
await writeFile(new URL('logo-medidas.mjs',folder),await readFile(new URL('../js/logo-medidas.js',import.meta.url),'utf8'));
await writeFile(new URL('catalogo.mjs',folder),'export default '+JSON.stringify(C,null,2)+';\n');
await writeFile(new URL('index.ts',folder),`import {createHandler} from './pedidos.mjs';
Deno.serve(createHandler({
  SUPABASE_URL:Deno.env.get('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  SUPABASE_PUBLISHABLE_KEY:Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY'),
  ZAIN_PEDIDOS_ENABLED:'true',
  ZAIN_CATALOGO_ENABLED:'true',
  ZAIN_CATALOGO_ALTAS_ENABLED:'true',
  ZAIN_TALLERES_ENABLED:'true',
  ZAIN_COTIZACIONES_ENABLED:'true',
  ZAIN_CONFIRMACION_ENABLED:'true',
  ZAIN_GASTOS_ENABLED:'true',
  ZAIN_SITE_URL:'https://zain.com.mx',
  ZAIN_ALLOWED_ORIGINS:'https://www.zain.com.mx,https://zain-amber-sigma.vercel.app,http://localhost:8085,http://127.0.0.1:8085,http://localhost:8086,http://127.0.0.1:8086',
  ZAIN_CAPACITY_MB:'800'
}));
`);
console.log('Adaptador generado desde el catálogo y servidor actuales.');
