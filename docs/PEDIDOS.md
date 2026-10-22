## Ventas reales, cobranza y negociación — 22-oct-2026

Finanzas y la bandeja de Pedidos muestran tres tarjetas separadas: **VENDIDO** (confirmado/produccion/entregado con anticipo cubierto), **POR COBRAR** (total vendido menos pagos de esa revisión, con desglose por folio) y **EN NEGOCIACIÓN** (nuevo/contactado/cotizado/aceptado sin anticipo cubierto más casos de cotizaciones por modelo enviada/autorizada). Cancelados, papelera y cargas incompletas no cuentan. Cotizaciones por modelo sin cantidades se cuentan como casos sin inventar totales; convertida solo cuenta mediante el pedido ligado. Las tres cifras monetarias llevan IVA; utilidad y margen conservan importes sin IVA, exclusivamente de vendidos. Sin porcentaje de anticipo histórico se exige el cobro total como evidencia; no se modifican los registros.

Migración nueva `supabase/ventas-reales.sql`: conserva permisos privados y añade clasificación común a las dos RPC, agregados de todas las páginas y saldos por pedido. No editar ni reaplicar los SQL históricos. La UI exige `version_ventas:1` para no presentar los totales anteriores. Reconocimiento de `convertida` sincronizado entre servidor y Edge, sin permitir marcarla manualmente. Preparado en rama local; producción pendiente. Reglas, pruebas y comandos exactos: [VENTAS-REALES.md](VENTAS-REALES.md). Este apartado sustituye los criterios de ventas de los registros históricos siguientes.

## Corrección vigente: tamaño de logo al enviar — 15-oct-2026

El personalizador ampliaba el máximo de las zonas no orientativas con escalaMaxLogo (1.3) y redondeaba a medio centímetro; la validación del servidor seguía usando zone.max. Esto bloqueaba un logo de11.5cm en pecho/chaleco cuya zona base era9cm. Se igualó la validación al máximo real del editor, incluyendo zonas orientativas sin multiplicar otra vez. Se conserva el tamaño solicitado y la posición ajustada; no se reduce el logo al enviarlo ni se cambia el carrito. Permanecen las validaciones de producto/color/técnica/tallas/cantidad, zona existente y medida finita dentro del rango ofrecido. Diseño y medidas finales requieren revisión del equipo. Sin cambios de precios, datos guardados, permisos, renders ni pedidos reales de prueba.

## Decisión vigente: gestión visual, papelera y catálogo activo — 14-oct-2026

JP pidió reorganizar el panel, ocultar cinco productos iniciales sin eliminarlos, mantener la gorra y cambiar nombres que identificaban al proveedor. Originales desactivados: playera, polo, camisa, chamarra y sudadera. Sus datos, imágenes, SKU y pedidos existentes se conservan; nuevas solicitudes no los admiten. Reactivar cambiando activo=true en server/config-interno.cjs y regenerando catálogo público y Edge. No reasignar SKU.

Catálogo visible: 39 referencias (25 prendas actuales, 13 bolsas, gorra), 14 familias de prendas y seis categorías activas. Cinco referencias desactivadas en productosHistoricos, fuera de catálogo/editor; servidor permite reintento solo de un folio previo autorizado con igual contenido. Portada: Polo clásico, Playera premium, gorra, Sudadera canguro, Bolsa Expo, Camisa ejecutiva. Nombres: Playera esencial/premium/deportiva; Polo clásico/ligero/ligero manga larga; Camisa ejecutiva/de trabajo (corta/larga), Camisa denim; Sudadera con cierre/canguro/cuello alto. Son nombres ZAIN, no certificaciones. Datos técnicos/SKU intactos; proveedor en ficha interna, nombres comerciales en seguimiento, WhatsApp y catálogo.

Panel /gestion-zain: tarjetas de Solicitudes esta semana, Por revisar, Confirmados y En producción; pulsarlas filtra la tabla. Semana desde lunes en CDMX calculada en Postgres. Otros contadores: estados actuales de todos los pedidos guardados y no retirados; no ventas cobradas ni importes. Tabla de 20 por página, folio/fecha/selección/cantidad/estado, filtros de folio/estado/semana, Activos/Papelera. Ficha lateral/modal responsive con imágenes, descargas, notas, enlace de cliente, cambio de estado y últimos 100 eventos.

Eliminar exige escribir el folio; mueve a papelera y permite restaurar. No DELETE de filas ni Storage. SQL supabase/panel-gestion.sql añade archivado_at y funciones de resumen/archivo, security invoker, rol service_role, bloqueo de fila/versiones. Seguimiento de cliente en papelera no funciona hasta restaurar; estados/archivos conservados e historial de retiro/restauración. No se retiraron pedidos reales.

Migración panel_resumen_y_papelera_zain aplicada al proyecto dedicado. Resumen real verificado en lectura SQL; permisos directos anon/authenticated denegados. 44 pruebas aprobadas; prueba visual local con datos ficticios sin archivar/restaurar en producción; login oculto, papelera y 390×844/1280×800 comprobados. Catálogo sin errores y seis muestras actuales. Publicación comprobada: commit 83560f4, Vercel success y Edge zain-pedidos versión 11 ACTIVE. Catálogo público con 39 activas/5 ocultas, seis muestras actuales y nombres sin referencias del proveedor. Panel nuevo presente; resumen sin login devuelve 401. Pruebas de tarjetas/ficha/papelera/restauración en simulación local; ningún pedido real retirado.

Envíos: JP pidió solo planear. docs/SEGUIMIENTO-ENVIOS-PLAN.md recomienda primera etapa transportista + guía/talón + enlace oficial en /mi-pedido. Segunda: API/webhooks verificados de Skydropx/DHL, hitos reales y última actualización. No implementado ni guías compradas.

Antes de publicidad: completar responsable/domicilio del aviso; IDs de Ads/conversiones y validación en cuenta/Tag Assistant antes de gastar; stock, mínimos de prendas, cotización/plazos; alta del amigo cuando JP dé su correo. Auditor Supabase: aviso existente de protección de contraseñas filtradas desactivada, [documentación](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). No se cambió Auth ni se contrató un plan.


## Decisión vigente: SKU ZAIN, proveedor interno y galería — 14-oct-2026

JP pidió que clientes vean referencias propias de ZAIN y que Yazbek/código del fabricante queden en el panel del equipo. Cada una de las 44 referencias tiene SKU persistente ZN-<categoría>-<número>; no renumerarlos al reordenar el catálogo. El servidor conserva IDs antiguos y admite los ID públicos; los pedidos existentes no se reescriben. El frontend adapta borradores anteriores por identificador de compatibilidad, conservando originales locales.

Fuente técnica: server/config-interno.cjs. Generar el catálogo público con node server/preparar-catalogo.mjs; después generar y desplegar Edge con node server/preparar-edge.mjs. js/config.js es un archivo generado, sin fabricante, códigos de modelo/color, fuentes o rutas Yazbek; no editarlo a mano. El seguimiento usa una lista permitida y nombres comerciales; el panel autorizado conserva referencia interna y agrega SKU. Esto reduce información mostrada y enviada al navegador; no convierte el historial de un repositorio público ni una fotografía conocida en secretos.

Las 25 referencias nuevas conservan la prenda IA como primera imagen. Una galería manual con flechas muestra la foto original recortada del PDF como segunda imagen, exacta para la silueta seleccionada. No teñir esa foto ni sustituir renders. Las seis prendas originales y bolsas mantienen su foto existente; no inventar fotografías con personas para artículos sin referencia equivalente. Las fotos ya recortadas y comprobadas se copiaron sin alteración a img/productos/zain/<sku>-modelo.webp; renders a <sku>-render.webp. Fotografías de origen y renders originales conservados.

“Tu logo” sin archivo responde a tinta elegida, HEX y color de texto; Original conserva contraste automático. El mensaje WhatsApp incluye SKU ZAIN y nombres/colores comerciales. Fotos con modelo conservan su color original aunque la selección de pedido sea otra; la etiqueta “Foto de referencia” lo distingue.

Validación: 36 pruebas aprobadas; todas las combinaciones de modelos, colores y tallas se derivan canónicamente; cliente sin referencias internas, equipo con ellas. 25 fotos cargadas; selector Caballero/Dama y flechas verificados; logo amarillo sin archivo observado en canvas. Celular 390×844 y escritorio 1280×800 sin desbordamiento. Supabase zain-pedidos versión 10 ACTIVE, manteniendo autorización propia existente y Storage privado. No se modificaron pedidos reales ni se enviaron mensajes. JP confirmó que cancelará desde el panel la prueba anterior NO COTIZAR; su ejecución no se da por verificada.

Publicación web comprobada: commit 688e905 en la rama de producción; Vercel success. URL pública con 44 referencias, 25 fotos adicionales, sin datos de proveedor en catálogo. Rutas /server/config-interno.cjs y /supabase/functions/zain-pedidos/catalogo.mjs devuelven 404; panel anónimo 401. Una prueba POST en producción fue rechazada por revisión automática y no ejecutada; no se creó otro pedido. Validación equivalente local aprobada.


# Pedidos ZAIN: operación y alojamiento

## Decisión vigente: renders aprobados, contornos limpios y categorías — 14-oct-2026

Después de revisar la galería de pruebas, JP autorizó explícitamente publicar las 14 familias / 25 referencias de prendas IA y pidió limpiar los puntos/manchas en contornos de las prendas anteriores. Esta autorización posterior reemplaza la pausa por exigencia de réplica exacta. Las imágenes siguen siendo ilustrativas: no llamarlas fotografías oficiales o réplicas verificadas del fabricante.

Se conservan los seis productos originales y sus IDs, colores, tallas y técnicas; sus archivos de imagen originales se mantienen intactos. Se usan versiones nuevas con limpieza IA de recorte en `img/productos/originales-limpios/`, sin retirar productos. Los 25 modelos nuevos están en `img/productos/yazbek-ia/`. Fuentes, prompts y hashes en `docs/IMAGENES-YAZBEK-IA.json` y `docs/IMAGENES-ORIGINALES-LIMPIAS.json`. La limpieza fue realizada con `image_gen` integrada; no se sustituyó por dibujos SVG. El motor omite ruido casi transparente en esas imágenes y conserva pliegues al cambiar de color.

Catálogo: 44 referencias (6 originales + 25 nuevas + 13 bolsas); 20 fichas de prendas en la vista inicial y una entrada Bolsas. Categorías ordenadas: Playeras, Polos, Camisas, Sudaderas, Chamarras, Gorras y Bolsas. Caballero/dama dentro de una ficha donde corresponde; sudaderas Adultos. Las bolsas mantienen Expo como entrada, sus fotografías/datos y mínimo de 100 por modelo/color, incrementos de 50.

Verificación: 34 pruebas aprobadas; las 31 imágenes de prendas cargan y se tiñen en negro, blanco y rojo. Comparación visual antes/después confirma eliminación de puntos blancos de axilas/mangas, especialmente sudadera/chamarra. Filtros y variantes comprobados en móvil; sin desbordamiento. Prueba sintética de cinco polos D0550 Rojo 413 guardó el logo original y render, dio seguimiento y descargas 200, y vació el carrito. Ningún mensaje WhatsApp real: navegación interceptada. La solicitud está marcada NO COTIZAR; su cancelación administrativa quedó solicitada a JP porque el conector SQL falló y una limpieza temporal en Edge fue rechazada. No se cambió ningún pedido real.

API `zain-pedidos` versión 9 ACTIVE, sin código de limpieza temporal, permisos/RLS/Storage privado conservados. Catálogo `originales-mas-yazbek-ia-2026-10-14`. Publicación comprobada: GitHub `c4efec9` en la rama de producción `claude/zain-website-deploy-d85pzy`, Vercel success y URL pública `https://zain-amber-sigma.vercel.app/?v=c4efec9#catalogo`. Navegador público: 44 referencias, 21 tarjetas iniciales, 6 versiones corregidas y 25 imágenes IA nuevas; siete categorías. Móvil 390×844 y escritorio 1280×800 sin desbordamiento. Árbol Git limpio tras publicación. El registro posterior de esta comprobación solo modifica documentación.

Pendientes comerciales: stock/costos, técnica por tejido y aprobación de impresión; tonos de pantalla aproximados, sin equivalencias Pantone oficiales. Las categorías no expresan rankings de ventas o margen. Ads, privacidad, precios y presupuestos no cambiaron.


## Correccion de JP: conservar originales y agregar prendas IA (13-oct-2026)

JP rechazo sustituir sus modelos existentes por personas y esquemas. Las seis prendas originales y las bolsas se restablecen sin modificar sus imagenes. La intención inicial de sumar mockups IA queda condicionada por la exigencia posterior de fidelidad; no publicar los prototipos. No presentar un mockup IA como fotografia oficial ni replica exacta verificada. Mientras se generan, el catalogo publico original permanece activo; los datos Yazbek y solicitudes guardadas se conservan. Esta decision posterior prevalece sobre las secciones anteriores.


## HISTÓRICO: publicación reemplazada — Yazbek, 13-oct-2026

14 familias y 25 referencias verificadas del PDF completo. Dama/caballero se seleccionan dentro de una ficha; código, tallas y colores corresponden a la variante exacta. Las fotos del catálogo permanecen sin teñir. El personalizador usa **esquemas orientativos identificados** y una foto real de referencia; los PNG también llevan la advertencia. DTF por tejido pendiente de confirmar. Las seis prendas genéricas ya no se seleccionan; gorras y softshell esperan catálogo. Las 13 bolsas conservan su catálogo y mínimos.

`js/config.js` conserva IDs retirados en `productosHistoricos` para folios registrados, no para solicitudes nuevas. La API comprueba color/código, tallas y su suma, y deriva la ficha técnica. **No borrar datos ni originales antiguos**. Catálogo y servidor se regeneran/despliegan juntos: Supabase Edge versión 6; no basta con un push. Datos y criterios completos en [docs/CATALOGO-YAZBEK.md](CATALOGO-YAZBEK.md). Pruebas: `node --test tests/*.test.mjs`, 34 aprobadas. Este apartado es histórico; prevalece la decisión del 14-oct-2026 al principio del documento.


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
3. Si se mueve además la API a Node, ejecutar `node server/iniciar.mjs` detrás de Nginx/HTTPS y cambiar `pedidosApi` a `/api/pedidos`. Usar variables `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (o ANON para compatibilidad), `SUPABASE_SECRET_KEY` (o SERVICE_ROLE), `ZAIN_SITE_URL`, `ZAIN_PEDIDOS_ENABLED=true`, `ZAIN_CATALOGO_ENABLED=true`. `HOST`, `PORT` y `ZAIN_ALLOWED_ORIGINS` son opcionales. No requiere npm ni dependencias.
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
