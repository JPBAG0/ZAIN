# Ventas reales y cotizaciones — 22-oct-2026

Preparado en `codex/zain-ventas-reales-20261022`, desde `7b7c7fb`. Trabajo local, sin publicación ni cambios en la base remota.

Gestión → Finanzas y Pedidos muestran tres cifras independientes. Los importes se guardan en centavos MXN:

| Cifra | Qué incluye |
| --- | --- |
| VENDIDO | Total con IVA de pedidos activos `confirmado`, `produccion` o `entregado`, con cotización publicada y pagos de esa revisión que cubran el anticipo. |
| POR COBRAR | Suma de `máximo(total con IVA − pagos verificados, 0)` exclusivamente de esos pedidos vendidos. Desglose completo por folio, vendido, cobrado y saldo. |
| EN NEGOCIACIÓN | Totales con IVA de solicitudes `nuevo`, `contactado`, `cotizado` o `aceptado` que todavía no cubran el anticipo. Las que no tienen total se cuentan como casos pendientes, sin asignarles un importe. |

Las cotizaciones por modelo `enviada`/`autorizada` sin pedido vinculado se cuentan aparte dentro de negociación. Como no tienen cantidades, **no se suman los precios «desde» ni los precios unitarios como si fueran totales**. `borrador`, `convertida` y `descartada` no aumentan esa cifra; una convertida se clasifica exclusivamente mediante el pedido vinculado.

Cancelados, papelera y cargas que aún no terminaron de guardarse quedan fuera de las tres cifras, incluso al consultar la papelera. Los costos, utilidad y margen agregados consideran únicamente vendidos; conservan la base sin IVA del cotizador. Los costos desconocidos siguen pendientes y el dashboard conserva su aviso de utilidad incompleta.

El anticipo se calcula con los puntos base publicados y el mismo redondeo del registro de pagos: `(total × porcentaje + 5000) / 10000`, división entera. Un 0% explícito es válido. Si un documento histórico no tiene porcentaje, solo el cobro completo demuestra que el anticipo está cubierto; no se inventa un 50%. Los estados confirmados sin evidencia suficiente aparecen como pendientes de revisar y quedan fuera de ventas. Un estado temprano cuyo anticipo ya está cubierto debe pasar a confirmado mediante el flujo de pagos; no se reclasifica ni se modifica automáticamente al consultar.

Se toma únicamente la revisión publicada vigente. Los saldos son los actuales de la cohorte seleccionada por fecha de solicitud CDMX, igual que el dashboard anterior; no es un historial contable de saldos al cierre de cada mes. Finanzas filtra por año/mes. Pedidos conserva folio/estado/semana y suma todas las páginas, con desglose completo de saldos. Las cotizaciones por modelo usan su fecha de creación y folio; al filtrar un estado de pedido quedan fuera, pues tienen estados propios.

## Archivos y compatibilidad

- `supabase/ventas-reales.sql`: archivo nuevo; reemplaza la vista `zain_finanzas_estado` conservando sus columnas previas y agregando `anticipo_requerido`, `vendido`, `en_negociacion`; actualiza ambas RPC financieras. No modifica registros ni los SQL históricos.
- Conserva `security_invoker`, `search_path=''`, acceso solo `service_role` y bloqueo para `PUBLIC`, `anon` y `authenticated`. La API mantiene la autorización del equipo.
- Las respuestas nuevas incluyen `version_ventas: 1`; la web evita mostrar cifras anteriores mientras falta la migración.
- `server/cotizaciones-modelos.mjs` y su copia Edge reconocen `convertida`, reservada a `cm-convertir` con pedido guardado. Guardar o cambiar estado manualmente no permite fingir una conversión.
- Versiones de Gestión: `control-pedidos.js?v=20`, `control-finanzas.js?v=3`, `finanzas.css?v=3`. No cambia el catálogo público.

## Pruebas locales reproducibles (PowerShell)

Sin build ni dependencias en la web. Las herramientas de QA se instalan fuera del repositorio:

```powershell
Set-Location 'C:\Users\JP\Dropbox\Proyectos-IA\Paginas\ZAIN\ZAIN'
$herramientasQA = Join-Path $env:TEMP 'zain-ventas-qa-20261022'
npm install --prefix $herramientasQA --save-exact @electric-sql/pglite@0.5.11 playwright@1.64.1
$env:ZAIN_PGLITE_MODULE = ([uri](Join-Path $herramientasQA 'node_modules\@electric-sql\pglite\dist\index.js')).AbsoluteUri
node --test tests/*.test.mjs
```

`tests/ventas-reales.test.mjs` ejecuta las migraciones históricas y el SQL nuevo en Postgres en memoria: cada estado, pagos cero/parciales/completos, revisión ajena, anticipo 0% e histórico, redondeo, cancelados/papelera, modelos, conversión, varias páginas, filtros, corte CDMX, permisos, reinstalación e integración del handler con las RPC reales. Sin `ZAIN_PGLITE_MODULE`, las pruebas SQL se indican como omitidas; no interpretar esa ejecución como validación de SQL.

En otra terminal, mantener abierto el servidor estático:

```powershell
Set-Location 'C:\Users\JP\Dropbox\Proyectos-IA\Paginas\ZAIN\ZAIN'
python -m http.server 8085 --bind 127.0.0.1
```

En la terminal de QA ejecutar el recorrido con Chrome instalado:

```powershell
$env:ZAIN_PLAYWRIGHT_MODULE = ([uri](Join-Path $herramientasQA 'node_modules\playwright\index.mjs')).AbsoluteUri
node --input-type=module -e 'import {createRequire} from "node:module"; const require=createRequire(process.cwd()+"/qa.cjs"); const run=require("./tests/ventas-reales-browser.cjs"); const {chromium}=await import(process.env.ZAIN_PLAYWRIGHT_MODULE); const browser=await chromium.launch({channel:"chrome",headless:true}); try{console.log(JSON.stringify(await run(await browser.newPage())));}finally{await browser.close();}'
```

`tests/ventas-reales-browser.cjs` intercepta las peticiones con fixtures, evita conexiones a servicios reales y comprueba tarjetas, etiquetas de cada pedido, desglose, periodos, servidor anterior y ancho de página a 390×844 y 1280×800. Exige cero errores JS y cero peticiones de escritura. No prueba sesión real de JP, pagos bancarios ni iPhone físico.

Resultado local del 22-oct-2026: **230 pruebas aprobadas, 0 fallidas y 0 omitidas** (25 nuevas), usando la variable de PGlite. Navegador Chromium en ambos tamaños: cero errores JavaScript, cero escrituras y sin desbordamiento. Inspección visual de Finanzas móvil y Pedidos escritorio; desglose móvil con etiquetas.

## Publicar cuando JP lo decida

Estos comandos **no se ejecutaron en esta sesión**. Requieren sesiones de Supabase/Vercel autorizadas. No poner claves ni contraseñas en archivos o argumentos.

1. Configurar `ZAIN_PGLITE_MODULE` como arriba; seleccionar la rama y comprobar el árbol. No mezclar cambios de otro trabajo:

```powershell
Set-Location 'C:\Users\JP\Dropbox\Proyectos-IA\Paginas\ZAIN\ZAIN'
git switch codex/zain-ventas-reales-20261022
git status --short
node --test tests/*.test.mjs
```

2. Aplicar **solo** el archivo nuevo al proyecto ZAIN (`upzecgfgdtllxdhshhkd`), que debe tener aplicados `gastos-cierre.sql`, `finanzas-generales.sql`, `finanzas-costo-real.sql`, `finanzas-dashboard-v2.sql` y `cotizaciones-modelos.sql`. No reaplicar los históricos:

```powershell
npx --yes supabase@2.121.0 login
npx --yes supabase@2.121.0 db query --project-ref upzecgfgdtllxdhshhkd --file supabase/ventas-reales.sql
```

3. Publicar la corrección de estados de la Edge existente, conservando su autorización propia:

```powershell
node server/preparar-edge.mjs
git diff --exit-code -- supabase/functions/zain-pedidos
npx --yes supabase@2.121.0 functions deploy zain-pedidos --project-ref upzecgfgdtllxdhshhkd --use-api --no-verify-jwt
```

4. Publicar la web desde esta rama. No hay enlace `.vercel/project.json` en esta copia: `link` es interactivo; elegir el **proyecto existente conectado a JPBAG0/ZAIN**, sin crear uno nuevo. Comprobar el nombre/propietario devueltos por `project inspect` antes de desplegar:

```powershell
npx --yes vercel@65.1.0 login
npx --yes vercel@65.1.0 link
npx --yes vercel@65.1.0 project inspect --non-interactive
npx --yes vercel@65.1.0 deploy --prod
```

Para respaldar la rama en GitHub, si se desea: `git push -u origin codex/zain-ventas-reales-20261022`. Ese push puede iniciar una vista previa según la integración; tampoco se ejecutó en esta sesión. No es necesario fusionar a la rama de producción para desplegar manualmente desde este checkout.

Después de publicar, comprobar Gestión autenticada contra los registros reales: una aceptada sin anticipo solo en negociación; una confirmada con anticipo en vendido y su saldo exacto; cancelados/papelera fuera; modelo convertido sin duplicidad. Revisar la suma del desglose, filtros mensuales y versiones de recursos. Consultar las cifras no requiere crear pedidos ni registrar pagos de prueba en producción. Registrar por separado SQL aplicado, Edge desplegada, web publicada y verificación remota; no darlos por hechos porque termine un comando.

Referencias consultadas: [funciones y permisos de Supabase](https://supabase.com/docs/guides/database/functions), [Vercel CLI deploy](https://vercel.com/docs/cli/deploy). Las opciones de Supabase se contrastaron además con `--help` de la CLI 2.121.0.
