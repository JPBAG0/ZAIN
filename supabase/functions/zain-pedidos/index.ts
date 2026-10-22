import {createHandler} from './pedidos.mjs';
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
  ZAIN_AVISOS_ENABLED:'true',
  ZAIN_WA_ENABLED:'true',
  ZAIN_WA_SECRETO:Deno.env.get('ZAIN_WA_SECRETO'),
  ZAIN_SITE_URL:'https://zain.com.mx',
  ZAIN_ALLOWED_ORIGINS:'https://www.zain.com.mx,https://zain-amber-sigma.vercel.app,http://localhost:8085,http://127.0.0.1:8085,http://localhost:8086,http://127.0.0.1:8086',
  ZAIN_CAPACITY_MB:'800'
}));
