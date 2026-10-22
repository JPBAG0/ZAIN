# WhatsApp manual dentro de Gestión — Prompt 7

22-oct-2026. Rama local `codex/zain-whatsapp-manual-20261022`, encima de los Prompts1 y2. Sustituye al4. **Preparado y probado con fixtures; sin publicación, migración remota, conexión de WhatsApp, mensajes reales ni tarea instalada.** El piloto con número de prueba y la verificación remota quedan pendientes.

## Funcionamiento

Pestañas WhatsApp (QR/estado cada3s, heartbeat, número, confirmación de Desvincular) y Chats (no leídos primero, hilo con texto/fotos/audio, paginación y respuesta escrita por una persona). Los mensajes enviados desde el celular aparecen como «Desde el celular». Salir limpia datos y borradores en memoria; no se guardan chats en localStorage ni en archivos.

Ligar a pedido propone coincidencias exactas del teléfono conocido; también permite buscar teléfono completo con país o folio ZAIN. El equipo confirma la vinculación. LID no se interpreta como teléfono. Crear pedido pide una partida real del catálogo y valida modelo/color/técnica/zona/talla/mínimos en el servidor; crea una solicitud, conserva logo/condiciones pendientes y no registra una venta. La ficha del pedido permite abrir su conversación.

La cotización publicada se prepara como **enlace existente de Mi pedido**, con la autorización del seguimiento actual; no se genera otro PDF ni se envía por tocar una sugerencia. Una revisión cambiada se rechaza. El seguimiento de48h requiere envío de esa revisión confirmado por este puente y ausencia de respuesta posterior; no infiere envíos anteriores hechos por wa.me o por el celular. Las cinco plantillas del profe (amable, lo pienso, precio, retroalimentación, postventa) nacen en `server/config-interno.cjs` → `js/config.js`, se siembran en la migración y se editan privadamente en WhatsApp → Plantillas. La tabla privada conserva las ediciones posteriores; regenerar catálogo no las sobrescribe. Completar los campos `{...}` antes de enviar; beneficios, precios y permisos no se inventan.

Motivos precio/tiempo/calidad/otro: evento privado del pedido, idempotencia por solicitud, resumen semanal CDMX y campo `motivos_no_venta` añadido a `zain_embudo`. Un entrante nuevo dispara el Web Push existente al equipo; texto genérico y enlace al chat, sin datos del cliente. Push requiere la configuración y suscripciones previas.

## Arquitectura y permisos

Nuevo proyecto `Proyectos-IA/Aplicaciones/zain-whatsapp`, Node20.12+ con Baileys **7.0.0-rc14**, qrcode1.5.4 y pino9.14.0 exactos/lockfile. Solo tráfico saliente; Gestión no consulta localhost. El puente usa header `x-puente` y secreto compartido; nunca tiene service_role. La Edge conserva su secreto servidor y valida el acceso del equipo por Auth + zain_equipo + zain_accesos. El secreto del puente no autoriza operaciones humanas.

SQL nuevo `supabase/whatsapp-manual.sql`, transacción única, después de las migraciones vigentes de pedidos/accesos/cliente/cotizaciones/embudo. Tablas zain_wa_chats, mensajes, salida, estado, no_venta y config. Staff activo puede leer; las escrituras solo pasan por la Edge. Helper de autorización en schema privado, SECURITY DEFINER únicamente para consultar acceso, search_path vacío; RPC de operaciones SECURITY INVOKER, ejecución solo service_role. Anon no ve QR, chats o plantillas privadas. Bucket `zain-wa-media` privado,8MB por archivo; una política restrictiva impide que una política histórica global abra el bucket. Descargas firmadas120s tras validar al equipo y mensaje exacto. No copiar URLs firmadas/QR reales a notas o logs.

`BOT_AUTOMATICO=false` es obligatorio en código y constraint SQL. Recibir un mensaje jamás crea una salida. Solo `wa-enviar` autenticado crea una reserva con actor; requiere chat con entrantes. Cada solicitud conserva UUID/ID WhatsApp estable, autor y revisión. Cola vence15min; reserva90s, candado remoto40s y candado PID local. Antes de enviar se revisan reserva, vigencia, conexión, desvinculación y acceso vigente del autor. Se muestra «escribiendo…», se pausa y se manda un texto. Una caída después de iniciar queda **incierta**, sin reenvío automático: comprobar el celular antes de decidir otra salida. No equivale a confirmación de lectura o entrega al cliente.

Puente: ignora historial append, grupos, estados, canales, protocolos y mensajes antiguos (ventana de recepción máxima120s; filtro local115s y90s antes de reconectar). Distingue fromMe; descarga archivos admitidos a memoria y los sube directamente a Storage privado. Sin historial o archivos de clientes en disco. Sesión técnica en `wa/auth/`, secretos en `.env`; ambos ignorados junto con `.local/`, `wa/Archivo/` y `referencia/`. Desvincular archiva credenciales anteriores privadamente, conserva chats y cancela salidas pendientes.

Límites: bandeja en memoria100 mensajes, deduplicación5000 IDs, tres intentos cortos de recepción. Una caída prolongada o saturación puede perder entradas; no hay importación histórica ni recuperación garantizada de esos mensajes. Archivos no admitidos/mayores de8MB o fallidos se muestran sin descarga disponible; el texto se conserva. Mensajes efímeros/view-once recibidos se tratan como archivos entrantes: revisar el consentimiento antes del piloto. No hay adjuntos salientes en esta fase. Los chats PN/LID sin equivalencia conocida permanecen separados; no se fusionan por inferencia.

Heap192MB + vigilancia RSS300MB que detiene el proceso para reinicio; no es un límite rígido del sistema operativo. La carga y consumo reales deben medirse en el piloto. La tarea sigue el patrón del chat corporativo: inicio al entrar a la sesión Windows, tres reinicios con intervalo1min, sin ventana; no funciona como servicio de arranque sin sesión. No activar otro ejecutor en Mac.

## Pruebas reproducibles sin conexión

Desde el sitio, usar Node24 para las pruebas históricas (el glob de Node20 en Windows no se expande):

```powershell
Set-Location 'C:\Users\JP\Dropbox\Proyectos-IA\Paginas\ZAIN\ZAIN'
$herramientasQA = Join-Path $env:TEMP 'zain-whatsapp-herramientas'
npm install --prefix $herramientasQA --save-exact @electric-sql/pglite@0.5.11 playwright@1.64.1
$env:ZAIN_PGLITE_MODULE = ([uri](Join-Path $herramientasQA 'node_modules\@electric-sql\pglite\dist\index.js')).AbsoluteUri
node --test tests/*.test.mjs
```

El test SQL ejecuta el archivo nuevo íntegro en PGlite con fixtures, roles y RLS; no lee ni modifica Supabase. Sin variable PGlite, se omiten pruebas SQL y no se certifican permisos. Browser usa Chrome instalado y cumple todos los archivos HTTP desde disco mediante interceptación; no necesita servidor estático ni servicios reales. Instalar primero las dependencias del puente para generar el QR ficticio (siguiente bloque).

```powershell
$env:ZAIN_PLAYWRIGHT_MODULE = ([uri](Join-Path $herramientasQA 'node_modules\playwright\index.mjs')).AbsoluteUri
node --input-type=module -e 'import {createRequire} from "node:module"; const require=createRequire(process.cwd()+"/qa.cjs"); const run=require("./tests/whatsapp-browser.cjs"); const {chromium}=await import(process.env.ZAIN_PLAYWRIGHT_MODULE); const b=await chromium.launch({channel:"chrome",headless:true}); try{console.log(JSON.stringify(await run(await b.newPage())));}finally{await b.close();}'
```

Puente, sin abrir socket ni vincular:

```powershell
Set-Location 'C:\Users\JP\Dropbox\Proyectos-IA\Aplicaciones\zain-whatsapp'
npm ci --ignore-scripts
npx --yes --package=node@20.19.0 node --test
npx --yes --package=node@20.19.0 node --input-type=module -e 'await import("@whiskeysockets/baileys"); console.log("Importación correcta; sin conexión");'
```

Resultado local: **254 pruebas del sitio y 9 del puente aprobadas, cero fallos u omisiones**.

Cobertura: entradas recientes/idempotentes/fromMe, ausencia de cola automática, actor y permisos revocados, doble ejecutor, reserva y cola vencidas, resultado incierto, detener durante espera, desvinculación, pedido validado, motivos/embudo, RLS y política Storage histórica permisiva. Browser390×844 y1280×800: QR ficticio renovado, medios simulados, audio conservado al sondear, vinculación/creación, sugerencias sin envío, dos envíos expresamente simulados, edición de plantillas y limpieza al salir; cero errores JS o llamadas a servicios reales. No se certifica iPhone físico, sesión real, Web Push real ni entrega de mensajes.

## Publicación futura: comandos exactos, no ejecutados

Esta rama incluye los Prompts1/2. Si falta, aplicar **ventas-reales.sql** primero según `docs/VENTAS-REALES.md`; no volver a aplicar SQL histórico. Confirmar que `cliente-solicitud.sql`, `accesos-equipo.sql` y `embudo-analista.sql` ya existen en el proyecto vigente. `whatsapp-manual.sql` es una migración de una sola aplicación: no repetirla.

Preparar el secreto privadamente y el número **de prueba**, sin conectar. El script aborta si ya hay configuración para no rotar secretos sin coordinación:

```powershell
Set-Location 'C:\Users\JP\Dropbox\Proyectos-IA\Aplicaciones\zain-whatsapp'
.\Preparar-config.ps1
npm ci --ignore-scripts
npx --yes --package=node@20.19.0 node wa/puente.mjs --check
```

Aplicar SQL, subir solo el secreto del puente y desplegar la Edge existente con autorización propia. Elegir el proyecto ZAIN indicado; no cambiar las demás claves del proyecto:

```powershell
Set-Location 'C:\Users\JP\Dropbox\Proyectos-IA\Paginas\ZAIN\ZAIN'
git switch codex/zain-whatsapp-manual-20261022
git status --short
npx --yes supabase@2.121.0 login
npx --yes supabase@2.121.0 db query --project-ref upzecgfgdtllxdhshhkd --file supabase/whatsapp-manual.sql
npx --yes supabase@2.121.0 secrets set --env-file 'C:\Users\JP\Dropbox\Proyectos-IA\Aplicaciones\zain-whatsapp\.local\supabase-secrets.env' --project-ref upzecgfgdtllxdhshhkd
node server/preparar-edge.mjs
git diff --exit-code -- supabase/functions/zain-pedidos
npx --yes supabase@2.121.0 functions deploy zain-pedidos --project-ref upzecgfgdtllxdhshhkd --use-api --no-verify-jwt
```

`ZAIN_WA_ENABLED` queda true en el adaptador; sin secreto válido no acepta el puente. La web se publica desde esta rama, tras pasar las pruebas. Elegir el **proyecto Vercel existente conectado a JPBAG0/ZAIN** y comprobar propietario/proyecto antes de deploy:

```powershell
npx --yes vercel@65.1.0 login
npx --yes vercel@65.1.0 link
npx --yes vercel@65.1.0 project inspect --non-interactive
npx --yes vercel@65.1.0 deploy --prod
```

Push opcional `git push -u origin codex/zain-whatsapp-manual-20261022`; puede iniciar una vista previa. No se hizo. El puente tiene repo local propio sin remote: no inventar repositorio remoto ni publicarlo por inferencia.

Solo después de autorizar el piloto, en **Server-JP**, preparar la tarea (queda deshabilitada) y activarla para el número de prueba configurado:

```powershell
Set-Location 'C:\Users\JP\Dropbox\Proyectos-IA\Aplicaciones\zain-whatsapp'
$node20 = (npx --yes --package=node@20.19.0 node -p 'process.execPath').Trim()
.\Instalar-puente.ps1 -Node $node20
Enable-ScheduledTask -TaskName 'ZAIN WhatsApp manual'
Start-ScheduledTask -TaskName 'ZAIN WhatsApp manual'
Get-ScheduledTaskInfo -TaskName 'ZAIN WhatsApp manual'
```

Abrir Gestión → WhatsApp con el equipo autorizado; escanear únicamente con el número de prueba. Si se prefiere la primera prueba en consola, usar `& $node20 --max-old-space-size=192 wa/puente.mjs` **en lugar** de iniciar la tarea, nunca ambos. Para suspender:

```powershell
Disable-ScheduledTask -TaskName 'ZAIN WhatsApp manual'
Stop-ScheduledTask -TaskName 'ZAIN WhatsApp manual'
```

Eso no desvincula la sesión ni borra archivos. Desvincular desde Gestión mientras el puente está conectado; si ya está detenido, hacerlo desde Dispositivos vinculados en el celular. Para retirar la publicación, conservar SQL/datos, detener/deshabilitar puente y preparar una versión Edge con ZAIN_WA_ENABLED false; no borrar tablas ni restaurar automáticamente una Edge histórica que omita otros cambios.

## Piloto y verificación pendientes

Con un número ajeno de prueba: QR/conexión; desvincular desde Gestión y desde el celular; nuevo QR; reinicio y reconexión sin importar mensajes antiguos; grupos/estados/canales ignorados; tres entradas visibles y **cero respuestas**; fromMe visible; fotos/audio privados; sugerir y ligar pedido; nueva solicitud con partida; cotización publicada → borrador → confirmación humana → una sola salida con escribiendo; resultado incierto sin reenvío; autor revocado/desvincular frena salida; segundo ejecutor rechazado; push en móvil autenticado; archivos no accesibles por anon. Medir memoria real y reinicio. Revisar compatibilidad MIME/audio y PN/LID reales.

El número de ZAIN solo se configura después de terminar ese piloto y de que JP lo decida. Registrar SQL aplicado, Edge y web publicadas, tarea activada y resultados reales por separado en Cerebro, sin QR, números, enlaces privados ni mensajes. No declarar verificado porque un comando salga0.

## Fase2 pendiente, solo documentación

No hay proveedor IA, llave IA, job de respuestas ni activación por chat. Requiere encargo nuevo, diseño revisado y BOT_AUTOMATICO más habilitación explícita por chat. Reglas1–20 de la referencia, a conservar como requisitos de diseño, sin programar:

1. Responder solo a quien escribió, sin difusión.
2. Ignorar mensajes viejos al reconectar.
3. Ignorar grupos, estados y canales.
4. fromMe humano suspende IA1h configurable.
5. Como máximo un seguimiento al día siguiente,10–19hCDMX y separación1–3min; solo si se habilita expresamente.
6. Freno tras30mensajes/10min.
7. Agrupar entradas hasta3.5s sin mensajes nuevos.
8. Marcar leído al atender, no al llegar.
9. Lectura simulada6–24s descontando tiempo transcurrido.
10. Escribiendo1.5s+22ms/letra, máximo6s+azar1.2s.
11. Respuestas breves, normalmente1–2frases y máximo2mensajes.
12. Una foto por respuesta.
13. Sin presencia permanente en línea.
14. Español de México natural y respetuoso; revisar identidad transparente del asistente antes de activar.
15. Evitar formato y frases de call center.
16. Responder lo preguntado y una pregunta sencilla si ayuda.
17. No repetir saludos/firmas, pocos emojis.
18. Solo precios/existencias/promociones confirmados; derivar dudas al equipo.
19. Nunca mentir si preguntan por automatización; ofrecer persona.
20. Escalar negociación/compra/apartado/solicitud de persona mediante aviso autorizado; ceder al intervenir el equipo.

En la fase actual solo se reutilizan filtros, conexión, fromMe visible y escribiendo para un envío humano. Ni leer un chat ni una plantilla dispara IA, seguimiento o mensaje.

Fuentes técnicas consultadas: [Baileys oficial](https://github.com/WhiskeySockets/Baileys), [documentación Baileys](https://baileys.wiki/), [Storage privado de Supabase](https://supabase.com/docs/guides/storage/buckets/fundamentals), [RLS de Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security). CLI Supabase2.121.0 contrastada con --help. La referencia del amigo permanece fuera de Git.
