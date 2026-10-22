# Posadas, clientes satisfechos y tallas — 22-oct-2026

Prompt 2 preparado localmente en `codex/zain-posadas-testimonios-20261022`, encima del commit `124377c` del Prompt 1. No publicado ni desplegado. Se conserva el estilo de ZAIN: Archivo, algodón `#f3f3f1`, tinta `#111113`, cobalto `#2a3bff`, texto secundario `#66666c`; bordes y botones del sitio, sin animaciones nuevas ni frameworks.

## Catálogo y banner

La fuente es `server/config-interno.cjs`, nunca editar `js/config.js` a mano. Los bloques nuevos son `posadas` y `clientesSatisfechos`. La configuración de estos bloques vive en el catálogo de archivos; esta entrega no añade un editor en Gestión ni requiere SQL/Edge nuevos.

`posadas.activa` enciende o apaga sección y enlace; `bannerActivo` permite ocultar solo el banner. `inicio`/`fin` son fechas inclusivas `AAAA-MM-DD`, evaluadas en CDMX. Quedó propuesta la ventana 22-oct a 31-dic-2026, editable antes de publicar. Fuera de fecha, apagada o inválida no aparece. Cada visitante puede cerrar el banner durante su sesión; cambiar ID o fechas inicia una temporada distinta. Se mide su alto para no tapar la cabecera y se respeta reducir movimiento al bajar a la sección. El banner no envía mensajes ni activa publicidad.

Texto solicitado: «Paquetes para tu posada — uniformes para todo tu equipo». Enlace a `#paquetes`. Hay dos propuestas: Gorra + chaleco y Polo + gorra.

## Aprobar paquetes

Los dos registros empiezan `estado: "PENDIENTE"`, con mínimo, composición exacta y precios `null`. La web muestra «Cantidad por acordar», «Personalización por cotizar» y «Por cotizar», con enlace manual a WhatsApp. No inventa un mínimo de 50 ni pone precios sin autorización. El mensaje identifica el paquete y pide definir cantidades y personalización.

Para mostrar una oferta completa se necesita, por paquete:

- `estado: "aprobado"`.
- `minimoPaquetes`: cantidad mínima de **kits**, entera y positiva.
- `contenido`: cada componente con `producto`, `cantidad` de piezas por kit, `tecnica` (`Bordado`, `Serigrafía`, `DTF`) y `ubicacion` (`Frente`, `Espalda`, `Frente y espalda`, `Lateral izquierdo`).
- `piezasPorPaquete`: suma de las cantidades del contenido.
- `precioPaquete`: importe por kit, en centavos MXN; `precioPieza`: promedio por pieza en centavos, consistente con el anterior al centavo. La tarjeta dice expresamente «Promedio por pieza»; no supone que prendas distintas cuesten lo mismo.
- `impuesto`: `1600` para más IVA o `0` si ya se aprobó el precio sin un cargo de IVA adicional.

Si falta algo o las cantidades/precios no coinciden, la web conserva «Por cotizar». Aprobar contenido y costos exige revisión humana; cambiar un estado no calcula ni aprueba por sí solo el precio.

### Cálculo privado para revisión

`server/calcular-posadas.mjs` usa `generar` y `calcular` de `js/cotizacion-core.js`. Aplica el margen por cantidad de **cada modelo**, igual que el cotizador: 1–14 40%, 15–49 35%, 50–99 30%, 100+ 25%, o los rangos vigentes que se proporcionen en `--config-costos`.

El ejemplo propone **50 kits con una pieza de cada modelo = 100 piezas**, pendiente de aprobación. No significa 50 piezas totales ni impone ese mínimo. La talla M del chaleco es una hipótesis de cálculo, no una composición aprobada. Se usaron los costos de prendas del archivo privado local del 20-oct; no se copiaron al catálogo público.

Resultado privado en `Proyectos-IA/Paginas/ZAIN/Propuestas/2026-10-22 Paquetes posada/calculo-privado-pendiente.json`. Gorra + chaleco tiene una referencia **solo de prendas con margen**, excluyendo personalización, ponchado e impuesto de venta. Los precios finales y la propuesta completa permanecen pendientes. Polo + gorra no tiene referencia completa porque falta el costo del polo en esa fuente. No sustituir tarifas ni tomar una referencia parcial como precio comercial.

Para recalcular, sin sobrescribir salidas anteriores:

```powershell
Set-Location 'C:\Users\JP\Dropbox\Proyectos-IA\Paginas\ZAIN\ZAIN'
$salidaPropuesta = 'C:\Users\JP\Dropbox\Proyectos-IA\Paginas\ZAIN\Propuestas\2026-10-22 Paquetes posada\propuesta-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.json'
node server/calcular-posadas.mjs --fuente-prendas 'C:\Users\JP\Dropbox\Proyectos-IA\Paginas\ZAIN\Proveedores\2026-10-20 Gorras\incorporacion-privada.json' --salida $salidaPropuesta
```

Para usar los costos/rangos actuales exportados privadamente de Gestión, reemplazar `--fuente-prendas ...` por `--config-costos 'ruta-absoluta-a-la-configuracion-privada.json'`. Opcionalmente `--escenarios 'ruta-a-escenarios.json'` recibe una lista de `{id,cantidadPaquetes,componentes:[{sku,cantidad,talla,color,tecnica,zona,anchoCm}]}`. No se envía nada a Supabase ni a WhatsApp. La calculadora rechaza salidas dentro del repositorio y no sobrescribe archivos existentes. No guardar esa configuración ni la propuesta en Git o en el Cerebro.

## Testimonios y fotos reales

Se dejaron **tres entradas PENDIENTE vacías**, sin empresas, imágenes ni frases inventadas. La sección `#clientes-satisfechos` y su enlace del menú aparecen al existir al menos un testimonio completo y autorizado. Mientras no haya material real, no se muestran ejemplos como testimonios.

Cada entrada necesita `estado:"aprobado"`, `permisoPublicar:true`, `permisoImagen:true`, `frase`, `producto` y una `foto` local. La empresa solo aparece si `permisoEmpresa:true`; de otro modo dice «Cliente ZAIN». No agregar datos de contacto, pedidos ni información privada al código.

Guardar foto o logo autorizado en `img/trabajos/<nombre-generico>.webp`, sin espacios, nombres de clientes ni identificadores de pedido. Foto recomendada: **1200×900, relación 4:3, WebP, sRGB, sin metadatos personales y preferiblemente menor de 250 KB**. Revisar encuadre y legibilidad; conservar el original fuera del sitio. Un logo puede ir en un lienzo 4:3 con margen. No usar imágenes generadas como si fueran trabajos reales, ni URLs privadas/firmadas. El permiso de imagen debe cubrir cualquier marca visible. Enlazar la ruta en el catálogo, regenerar y revisar antes de publicar.

## Medidas pendientes

Inventario completo: [TALLAS-PENDIENTES.md](TALLAS-PENDIENTES.md), generado del respaldo público actual (37 activas, 27 históricas). No se modificaron medidas ni productos.

Prioridad para conseguir tablas por talla:

| SKU | Producto |
| --- | --- |
| ZN-CH-001 | Chamarra softshell |
| ZN-CH-002 | Chamarra de oficina · Unisex |
| ZN-CH-003 | Rompevientos con capucha · Unisex |

En total hay **22 referencias sin `tablaTallas`**: estas 3 chamarras, 13 bolsas y 6 gorras. Bolsas/gorras no requieren tablas de prendas por talla; revisar las dimensiones y unitalla ya documentadas, enumeradas en el inventario. **31 carecen de `detalleMedidas`**; 15 de ellas sí tienen tabla. No confundir campo descriptivo ausente con guía ausente. No se inventaron medidas.

Regeneración:

```powershell
node server/preparar-catalogo.mjs
node server/respaldo-catalogo.mjs
node server/inventario-medidas.mjs docs/TALLAS-PENDIENTES.md
```

El respaldo consulta solo el catálogo público. Se conservaron las ediciones vigentes de Gestión: la fuente estática mantiene sus estados anteriores y el respaldo registra el catálogo publicado. No se activaron ni desactivaron productos.

## Medición

Eventos informativos: `posada_banner_ver`, `posada_banner_clic`, `posada_banner_cerrar`, `posada_paquete_clic`. Solo envían ID público de temporada/paquete y los parámetros de ubicación ya filtrados de la medición existente. No añaden conversiones, valores de venta, objetivos de puja ni campañas. El enlace conserva el clic de WhatsApp secundario que ya existe. Ver [MEDICION.md](MEDICION.md). Las pruebas no certifican recepción en una cuenta de Google Ads.

## Pruebas reproducibles

No hay build. Herramientas de pruebas fuera del repositorio:

```powershell
$herramientasQA = Join-Path $env:TEMP 'zain-posadas-herramientas'
npm install --prefix $herramientasQA --save-exact @electric-sql/pglite@0.5.11 playwright@1.64.1
$env:ZAIN_PGLITE_MODULE = ([uri](Join-Path $herramientasQA 'node_modules\@electric-sql\pglite\dist\index.js')).AbsoluteUri
node --test tests/*.test.mjs
```

En otra terminal, desde el repositorio: `python -m http.server 8080 --bind 127.0.0.1`. Para probar Chromium usando Chrome instalado:

```powershell
$env:ZAIN_PLAYWRIGHT_MODULE = ([uri](Join-Path $herramientasQA 'node_modules\playwright\index.mjs')).AbsoluteUri
node --input-type=module -e 'import {createRequire} from "node:module"; const require=createRequire(process.cwd()+"/qa.cjs"); const run=require("./tests/temporada-browser.cjs"); const {chromium}=await import(process.env.ZAIN_PLAYWRIGHT_MODULE); const b=await chromium.launch({channel:"chrome",headless:true}); try{console.log(JSON.stringify(await run(await b.newPage())));}finally{await b.close();}'
```

El recorrido intercepta las API externas y las dos aperturas de WhatsApp. Comprueba 390×844/1280×800, fechas/apagado, cierre persistente, salto accesible, precios pendientes y aprobados con fixtures, permisos/anonimización, caída de API/respaldo y ausencia de desbordamiento. No manda mensajes. Las fotos, frases y precios de QA son exclusivamente ficticios y no se agregan al catálogo comercial.

Resultado local del 22-oct-2026: **239 pruebas aprobadas, 0 fallidas, 0 omitidas** (9 nuevas sobre las 230 del Prompt1). Chromium a390×844/1280×800: sin desbordamiento, cero errores JavaScript y cero escrituras; dos aperturas de WhatsApp interceptadas. No se probó iPhone físico ni recepción real en Google Ads. Capturas de revisión de la web pendiente en `Proyectos-IA/Paginas/ZAIN/Propuestas/2026-10-22 Paquetes posada/Revision local/`.

## Publicación pendiente: comandos exactos

No ejecutados. Esta rama hereda la implementación del Prompt 1. Si aún no se publicó, seguir primero su SQL y Edge en [VENTAS-REALES.md](VENTAS-REALES.md); de otro modo la interfaz financiera avisará que falta la migración. **El Prompt 2 no necesita SQL ni Edge nuevos.**

```powershell
Set-Location 'C:\Users\JP\Dropbox\Proyectos-IA\Paginas\ZAIN\ZAIN'
git switch codex/zain-posadas-testimonios-20261022
git status --short
node server/preparar-catalogo.mjs
node server/respaldo-catalogo.mjs
node --test tests/*.test.mjs
```

Revisar cambios del respaldo antes de publicar; conservar la versión anterior en Archivo si se vuelve a generar. Deberá estar configurada la variable PGlite de arriba para no omitir las pruebas SQL heredadas. Guardar cualquier nueva regeneración revisada en Git antes del despliegue.

No hay enlace Vercel en esta copia. Elegir el **proyecto existente conectado a JPBAG0/ZAIN**, sin crear otro, y comprobar propietario/proyecto antes del último comando:

```powershell
npx --yes vercel@65.1.0 login
npx --yes vercel@65.1.0 link
npx --yes vercel@65.1.0 project inspect --non-interactive
npx --yes vercel@65.1.0 deploy --prod
```

Respaldo opcional en GitHub: `git push -u origin codex/zain-posadas-testimonios-20261022`; puede iniciar una vista previa según la integración. No se hizo push en esta sesión. Verificar después fechas/cierre, cantidades y precios aprobados, enlaces manuales, testimonios/permisos y recursos versionados en HTTPS. Registrar publicado y verificado por separado en Cerebro. Publicar esta rama conserva los precios de paquetes pendientes hasta aprobación explícita; no convertir las referencias internas en ofertas.
