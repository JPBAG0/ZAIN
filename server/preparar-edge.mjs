// Genera el adaptador Supabase desde el mismo servidor y catálogo de Node.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import C from '../js/config.js';
const folder=new URL('../supabase/functions/zain-pedidos/',import.meta.url);
await mkdir(folder,{recursive:true});
const source=(await readFile(new URL('./pedidos.mjs',import.meta.url),'utf8')).replace("import C from '../js/config.js';","import C from './catalogo.mjs';");
await writeFile(new URL('pedidos.mjs',folder),source);
await writeFile(new URL('catalogo.mjs',folder),'export default '+JSON.stringify(C,null,2)+';\n');
await writeFile(new URL('index.ts',folder),`import {createHandler} from './pedidos.mjs';
Deno.serve(createHandler({
  SUPABASE_URL:Deno.env.get('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  SUPABASE_PUBLISHABLE_KEY:Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY'),
  ZAIN_PEDIDOS_ENABLED:'true',
  ZAIN_SITE_URL:'https://zain-amber-sigma.vercel.app',
  ZAIN_ALLOWED_ORIGINS:'http://localhost:8085,http://127.0.0.1:8085,http://localhost:8086,http://127.0.0.1:8086',
  ZAIN_CAPACITY_MB:'800'
}));
`);
console.log('Adaptador generado desde el catálogo y servidor actuales.');
