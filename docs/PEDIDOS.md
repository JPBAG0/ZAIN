# Pedidos ZAIN: operación y alojamiento

Actualizado: 13-oct-2026. La venta y los precios se acuerdan por WhatsApp.

## Operación

- Cliente: arma su selección → solicita cotización → se guardan el logo original, el render PNG y los detalles → WhatsApp de ZAIN abre con texto, folio y enlace a `/pedidos#ID`. El cliente confirma el envío del mensaje.
- Equipo: `/pedidos` → correo y contraseña → lista y búsqueda por folio → ficha, imágenes, descargas, notas y estado. El enlace de WhatsApp también exige iniciar sesión.
- Guardado no significa mensaje enviado, pedido confirmado o pago recibido. Estados: nuevo, contactado, cotizado, confirmado, producción, entregado, cancelado.
- Cada archivo se sube directamente al bucket privado mediante una URL firmada. La API verifica tamaño y tipo de TODOS los archivos antes de confirmar la solicitud. Las subidas incompletas no aparecen en la lista de trabajo.
- El folio persiste al reintentar el mismo contenido. Los pedidos y archivos locales se conservan para respaldo. Las alternativas de texto/ZIP son explícitas; ya no se usa el selector de aplicaciones del equipo.

## Acceso y seguridad

- Proyecto dedicado: `Zain Pedidos`, ref `upzecgfgdtllxdhshhkd`. No comparte tablas, usuarios ni secretos con Fondo IA.
- Los correos aprobados viven únicamente en `zain_accesos`. El login verifica el usuario real de Supabase y su correo confirmado; enlaza ese usuario a `zain_equipo`. Ambas autorizaciones deben seguir activas. No usa `user_metadata` para permisos.
- Crear las cuentas desde Authentication → Users → Add user → Create new user, con contraseña elegida por cada usuario y Auto Confirm User. No enviar contraseñas por chat, no agregarlas al repositorio. Los correos autorizados no son por sí solos cuentas creadas.
- RLS y permisos impiden el acceso directo de `anon` y `authenticated` a las tablas y al bucket. La función verifica autorización antes de cualquier lectura del equipo. Los visitantes solo pueden crear y completar SU solicitud mediante un secreto aleatorio que no se incluye en WhatsApp ni en la ficha.
- Descargas del equipo mediante enlaces firmados de 120 segundos. Solo se muestra el render PNG; el logo original se descarga, no se incrusta como HTML/SVG activo.
- API: límites de 20 selecciones, 15 MB por archivo y 30 MB por solicitud. Hasta 10 solicitudes nuevas por hora por origen de conexión, más un cupo acumulado reservado de 800 MB. El cupo reserva subidas parciales también; revisar borradores y uso real antes de ampliar o recuperar capacidad. No borrar órdenes ni archivos automáticamente.
- Cambios de estado/notas conservan historial y usan versión: una edición simultánea del compañero produce un conflicto, no sobrescribe su trabajo.
- `verify_jwt=false` permite solicitudes sin cuenta, pero no deshabilita los permisos: el handler valida JWT y equipo en todas las operaciones administrativas, y el secreto de la solicitud en sus operaciones de subida/finalización.
- Claves secretas solo en el entorno del servidor. El endpoint de configuración entrega únicamente la URL y la clave pública necesaria para Supabase Auth. Nunca entrega una clave de servicio.

## Código y despliegue

- Página pública: HTML/CSS/JS existente, sin framework ni build. `js/config.js` es el catálogo único y elige `pedidosApi`.
- `js/pedidos.js`: carga, conservación del folio y reintentos. `js/control-pedidos.js`, `pedidos.html`, `css/pedidos.css`: panel privado.
- `server/pedidos.mjs`: contrato HTTP común, validación, acceso, guardado y firma de archivos.
- Actual: Supabase Edge Function `zain-pedidos`. `node server/preparar-edge.mjs` genera su catálogo/adaptador a partir de los módulos fuente. Después hay que desplegar la función; un push de GitHub NO actualiza automáticamente Supabase. Repetir la generación/despliegue si cambian reglas del catálogo o servidor.
- Alternativa Vercel: `api/pedidos.mjs` usa el mismo handler, configurando su entorno. La página actual llama directamente a Supabase, por lo que no requiere copiar secretos a Vercel.
- Pruebas: `node --test tests/pedidos.test.mjs`. Verificar también una solicitud real con archivos, acceso rechazado sin sesión y login de una cuenta autorizada.

## Migrar a un servidor mensual

1. Si se mueve solo la web, publicar `index.html`, `pedidos.html`, `robots.txt`, `css/`, `js/`, `img/` con HTTPS. Mantener Supabase y el endpoint: las solicitudes ya guardadas permanecen intactas. Configurar `/pedidos` para servir `pedidos.html`.
2. Agregar el dominio definitivo a los orígenes permitidos del adaptador Supabase y cambiar `ZAIN_SITE_URL`, para que los nuevos mensajes lleven la URL correcta. Mantener redirección de la URL anterior.
3. Si se mueve además la API a Node, ejecutar `node server/iniciar.mjs` detrás de Nginx/HTTPS y cambiar `pedidosApi` a `/api/pedidos`. Usar variables `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (o ANON para compatibilidad), `SUPABASE_SECRET_KEY` (o SERVICE_ROLE), `ZAIN_SITE_URL`, `ZAIN_PEDIDOS_ENABLED=true`. `HOST`, `PORT` y `ZAIN_ALLOWED_ORIGINS` son opcionales. No requiere npm ni dependencias.
4. No publicar `server/`, `supabase/`, `tests/`, `docs/` ni archivos de entorno como recursos web. El servidor Node incluye una lista de recursos permitidos; Vercel bloquea esas rutas.
5. Cambiar también Supabase implica otra migración de datos, autenticación y objetos; no está ejecutada ni incluida en un simple cambio de hosting. Las fichas permiten exportar JSON y los originales se pueden descargar; conservar rutas/folios al planear esa migración.

## Antes de Google Ads

- Probar móvil y escritorio con un logo real de prueba y confirmar que el equipo pueda descargarlo desde la ficha.
- Confirmar dominio y un alojamiento que admita uso comercial. Vercel Hobby es personal/no comercial: https://vercel.com/docs/plans/hobby . No se contrató ni cambió un plan de pago.
- Completar aviso de privacidad del responsable para el almacenamiento de archivos; el texto del botón ya describe qué se guarda. Confirmar datos legales del negocio antes de redactar un aviso definitivo.
- Medición preparada como eventos de navegador `zain:solicitud_guardada` y `zain:whatsapp_click`. Falta configurar Google Ads con la cuenta e identificadores aprobados. No contar clic como venta ni mensaje enviado; no se activó ninguna campaña.
- Verificar la cuenta de Juan Pablo; cuenta de atención y correo del amigo, según confirme JP. No dar acceso a terceros por inferencia.
- Se conserva una solicitud claramente rotulada PRUEBA AUTOMATICA, NO COTIZAR para verificar archivos. No es un cliente ni una conversión comercial.

Fuentes: https://supabase.com/docs/guides/storage/buckets/fundamentals , https://supabase.com/docs/guides/functions , https://faq.whatsapp.com/5913398998672934 .
