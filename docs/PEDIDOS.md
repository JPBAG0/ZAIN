# Pedidos ZAIN: operación y alojamiento

## Condición vigente de Juan Pablo — 14-oct-2026

Los seis modelos originales y sus imágenes se conservan intactos; las 13 bolsas también. Las 14 familias Yazbek se deben agregar, no reemplazar lo existente. Juan Pablo exige fidelidad muy alta al producto y pidió no publicar los renders si no se puede cumplir. Los 25 prototipos IA generados no permiten garantizar una réplica exacta desde fotografías con prendas vestidas/ocultas: NO se publicaron y se archivaron fuera del repositorio. No instalar la preparación anterior, no reactivar fotos con personas o esquemas, no presentar IA como foto oficial. Conseguir fotos de prendas solas del proveedor o muestras fotografiadas para continuar.

Estado actual: GitHub `fd2863c`, Vercel success, catálogo original activo (6 prendas + 13 bolsas), API Edge versión 7 y 34 pruebas aprobadas. Datos Yazbek y solicitudes previas conservados. Documentado en Cerebro: `Catalogo ZAIN - prendas Yazbek` y `2026-10-14 ZAIN - originales restaurados y fidelidad del catalogo`.


## Correccion de JP: conservar originales y agregar prendas IA (13-oct-2026)

JP rechazo sustituir sus modelos existentes por personas y esquemas. Las seis prendas originales y las bolsas se restablecen sin modificar sus imagenes. La intención inicial de sumar mockups IA queda condicionada por la exigencia posterior de fidelidad; no publicar los prototipos. No presentar un mockup IA como fotografia oficial ni replica exacta verificada. Mientras se generan, el catalogo publico original permanece activo; los datos Yazbek y solicitudes guardadas se conservan. Esta decision posterior prevalece sobre las secciones anteriores.


## Catálogo vigente de prendas — Yazbek, 13-oct-2026

14 familias y 25 referencias verificadas del PDF completo. Dama/caballero se seleccionan dentro de una ficha; código, tallas y colores corresponden a la variante exacta. Las fotos del catálogo permanecen sin teñir. El personalizador usa **esquemas orientativos identificados** y una foto real de referencia; los PNG también llevan la advertencia. DTF por tejido pendiente de confirmar. Las seis prendas genéricas ya no se seleccionan; gorras y softshell esperan catálogo. Las 13 bolsas conservan su catálogo y mínimos.

`js/config.js` conserva IDs retirados en `productosHistoricos` para folios registrados, no para solicitudes nuevas. La API comprueba color/código, tallas y su suma, y deriva la ficha técnica. **No borrar datos ni originales antiguos**. Catálogo y servidor se regeneran/despliegan juntos: Supabase Edge versión 6; no basta con un push. Datos y criterios completos en [docs/CATALOGO-YAZBEK.md](CATALOGO-YAZBEK.md). Pruebas: `node --test tests/*.test.mjs`, 34 aprobadas. Las notas históricas debajo no prevalecen sobre esta sección.


Actualizado: 13-oct-2026. La venta y los precios se acuerdan por WhatsApp.

## Operación

- Cliente: arma su selección → solicita cotización → se guardan el logo original, el render PNG y los detalles → WhatsApp de ZAIN abre con texto, folio y enlace de seguimiento a `/mi-pedido#ID/TOKEN`. El cliente confirma el envío del mensaje.
- Equipo: `/gestion-zain` → correo y contraseña → lista y búsqueda por folio → ficha, imágenes, descargas, notas y estado. La ficha del cliente se consulta sin cuenta usando su enlace único. Solo muestra estado, fecha de solicitud, cantidades, productos, personalización y archivos propios. No incluye notas del equipo, precios ni fechas de entrega inventadas.
- Guardado no significa mensaje enviado, pedido confirmado o pago recibido. Estados: nuevo, contactado, cotizado, confirmado, producción, entregado, cancelado.
- Cada archivo se sube directamente al bucket privado mediante una URL firmada. La API verifica tamaño y tipo de TODOS los archivos antes de confirmar la solicitud. Las subidas incompletas no aparecen en la lista de trabajo.
- El folio persiste al reintentar el mismo contenido. Los pedidos y archivos locales se conservan para respaldo. Las alternativas de texto/ZIP son explícitas; ya no se usa el selector de aplicaciones del equipo.
- Después de confirmar el guardado y pasar a WhatsApp, se retiran del carrito las selecciones enviadas y sus archivos locales. El pedido en Supabase permanece intacto; se conserva el enlace de última solicitud para consultarla al volver. El borrador se cierra para que un pedido posterior tenga folio nuevo. Errores y alternativas sin nube conservan carrito/archivos; selecciones añadidas durante la subida también se conservan. Abrir WhatsApp no confirma envío del mensaje.

## Acceso y seguridad

- Proyecto dedicado: `Zain Pedidos`, ref `upzecgfgdtllxdhshhkd`. No comparte tablas, usuarios ni secretos con Fondo IA.
- Los correos aprobados viven únicamente en `zain_accesos`. El login verifica el usuario real de Supabase y su correo confirmado; enlaza ese usuario a `zain_equipo`. Ambas autorizaciones deben seguir activas. No usa `user_metadata` para permisos.
- Crear las cuentas desde Authentication → Users → Add user → Create new user, con contraseña elegida por cada usuario y Auto Confirm User. No enviar contraseñas por chat, no agregarlas al repositorio. Los correos autorizados no son por sí solos cuentas creadas.
- RLS y permisos impiden el acceso directo de `anon` y `authenticated` a las tablas y al bucket. La función verifica autorización antes de cualquier lectura del equipo. Los visitantes solo pueden crear y completar SU solicitud mediante un secreto aleatorio que no se incluye en WhatsApp ni en la ficha.
- Descargas del equipo y del cliente autorizado mediante enlaces firmados de 120 segundos. Solo se muestra el render PNG; el logo original se descarga, no se incrusta como HTML/SVG activo.
- API: límites de 20 selecciones, 15 MB por archivo y 30 MB por solicitud. Hasta 10 solicitudes nuevas por hora por origen de conexión, más un cupo acumulado reservado de 800 MB. El cupo reserva subidas parciales también; revisar borradores y uso real antes de ampliar o recuperar capacidad. No borrar órdenes ni archivos automáticamente.
- Cambios de estado/notas conservan historial y usan versión: una edición simultánea del compañero produce un conflicto, no sobrescribe su trabajo.
- `verify_jwt=false` permite solicitudes sin cuenta, pero no deshabilita los permisos: el handler valida JWT y equipo en todas las operaciones administrativas, y el secreto de la solicitud en sus operaciones de subida/finalización.
- Claves secretas solo en el entorno del servidor. El endpoint de configuración entrega únicamente la URL y la clave pública necesaria para Supabase Auth. Nunca entrega una clave de servicio.

## Código y despliegue

- Página pública: HTML/CSS/JS existente, sin framework ni build. `js/config.js` es el catálogo único y elige `pedidosApi`.
- `js/pedidos.js`: carga, conservación del folio y reintentos. `js/control-pedidos.js`, `gestion-zain.html`, `css/pedidos.css`: panel privado. `mi-pedido.html`, `js/mi-pedido.js`, `css/mi-pedido.css`: seguimiento. `pedidos.html` conserva acceso privado anterior.
- `server/pedidos.mjs`: contrato HTTP común, validación, acceso, guardado y firma de archivos.
- Actual: Supabase Edge Function `zain-pedidos`. `node server/preparar-edge.mjs` genera su catálogo/adaptador a partir de los módulos fuente. Después hay que desplegar la función; un push de GitHub NO actualiza automáticamente Supabase. Repetir la generación/despliegue si cambian reglas del catálogo o servidor.
- Alternativa Vercel: `api/pedidos.mjs` usa el mismo handler, configurando su entorno. La página actual llama directamente a Supabase, por lo que no requiere copiar secretos a Vercel.
- Pruebas: `node --test tests/pedidos.test.mjs`. Verificar también una solicitud real con archivos, acceso rechazado sin sesión y login de una cuenta autorizada.

## Migrar a un servidor mensual

1. Si se mueve solo la web, publicar `index.html`, `gestion-zain.html`, `mi-pedido.html`, `pedidos.html`, `robots.txt`, `css/`, `js/`, `img/` con HTTPS. Mantener Supabase y el endpoint: las solicitudes ya guardadas permanecen intactas. Configurar `/gestion-zain`, `/mi-pedido` y `/pedidos` para servir sus HTML del mismo nombre.
2. Agregar el dominio definitivo a los orígenes permitidos del adaptador Supabase y cambiar `ZAIN_SITE_URL`, para que los nuevos mensajes lleven la URL correcta. Mantener redirección de la URL anterior.
3. Si se mueve además la API a Node, ejecutar `node server/iniciar.mjs` detrás de Nginx/HTTPS y cambiar `pedidosApi` a `/api/pedidos`. Usar variables `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (o ANON para compatibilidad), `SUPABASE_SECRET_KEY` (o SERVICE_ROLE), `ZAIN_SITE_URL`, `ZAIN_PEDIDOS_ENABLED=true`. `HOST`, `PORT` y `ZAIN_ALLOWED_ORIGINS` son opcionales. No requiere npm ni dependencias.
4. No publicar `server/`, `supabase/`, `tests/`, `docs/` ni archivos de entorno como recursos web. El servidor Node incluye una lista de recursos permitidos; Vercel bloquea esas rutas.
5. Cambiar también Supabase implica otra migración de datos, autenticación y objetos; no está ejecutada ni incluida en un simple cambio de hosting. Las fichas permiten exportar JSON y los originales se pueden descargar; conservar rutas/folios al planear esa migración.

## Antes de Google Ads

Preparación vigente: `docs/MEDICION.md`, `js/medicion.js`, `docs/PRIVACIDAD-BORRADOR.md`. Google Ads está desactivado; faltan responsable/domicilio del aviso e identificadores reales. El borrador no está disponible como aviso público. Pruebas: `node --test tests/*.test.mjs`, 26 aprobadas al 13-oct-2026.

- Probar móvil y escritorio con un logo real de prueba y confirmar que el equipo pueda descargarlo desde la ficha.
- Confirmar dominio y un alojamiento que admita uso comercial. Vercel Hobby es personal/no comercial: https://vercel.com/docs/plans/hobby . No se contrató ni cambió un plan de pago.
- Completar aviso de privacidad del responsable para el almacenamiento de archivos; el texto del botón ya describe qué se guarda. Confirmar datos legales del negocio antes de redactar un aviso definitivo.
- Medición preparada como eventos de navegador `zain:solicitud_guardada` y `zain:whatsapp_click`. Falta configurar Google Ads con la cuenta e identificadores aprobados. No contar clic como venta ni mensaje enviado; no se activó ninguna campaña.
- Verificar la cuenta de Juan Pablo; cuenta de atención y correo del amigo, según confirme JP. No dar acceso a terceros por inferencia.
- Se conserva una solicitud claramente rotulada PRUEBA AUTOMATICA, NO COTIZAR para verificar archivos. No es un cliente ni una conversión comercial.

Fuentes: https://supabase.com/docs/guides/storage/buckets/fundamentals , https://supabase.com/docs/guides/functions , https://faq.whatsapp.com/5913398998672934 .

## Seguimiento del cliente (13-oct-2026)

- `consulta` y `archivo-consulta` son POST con ID y capacidad de lectura de 256 bits. El UUID o folio por sí solos no autorizan nada. El enlace lleva la capacidad en el fragmento, sin enviarla al servidor web, buscadores o encabezado Referer; estas páginas no incluyen Analytics.
- HMAC-SHA256, con clave derivada del hash privado del secreto de carga y dominio `zain:consulta:v1`, incorpora ID y `consulta_nonce` aleatorio del pedido. No permite recuperar el secreto de escritura. Se compara en tiempo constante; no depende de la clave del proveedor y conserva enlaces al cambiar de hosting.
- `supabase/seguimiento-cliente.sql` añade el nonce a los pedidos existentes. No cambia sus estados, productos ni permisos RLS. Para revocar un enlace concreto, un administrador de la base puede regenerar su nonce; eso invalida el enlace anterior. No rotarlo de forma rutinaria.
- `enlace` exige el login y autorización del equipo; devuelve el mismo enlace de consulta. Botón **Copiar enlace para el cliente**, también para pedidos anteriores. No copiar nunca la dirección privada de gestión al cliente.
- Los recibos locales antiguos con `/pedidos#ID` se actualizan al reenviar la misma selección; no crean otro pedido. Los enlaces ya enviados no se transforman en acceso público: mantienen login privado. Compartir el nuevo enlace desde el panel si hace falta.
- `consulta` usa lista explícita de campos; no devuelve notas internas, versiones, identidades, secretos, nonce ni paths. `archivo-consulta` firma solo los archivos del manifiesto de ese pedido tras validar la capacidad; los originales se descargan sin incrustar SVG/PDF activo.
- Quien reciba el enlace completo puede consultar esa solicitud. Mostrar este hecho al cliente; no pegar enlaces reales en documentación, logs o Git. El estado se refresca al volver a la pestaña o pulsar Actualizar estado.
- Verificado: 17 pruebas de permisos/validación; solicitud sintética real con original/render, migración de recibo conservando folio, lectura del estado cancelado, notas internas ausentes, intento de escritura rechazado. Móvil 390×844 y escritorio 1280×800 sin desbordamiento y con imagen cargada. La prueba está cancelada, NO COTIZAR.
