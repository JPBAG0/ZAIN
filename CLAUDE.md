## Ajuste aprobado: diseños sin ficha y todas las selecciones — 15-oct-2026

JP pidió quitar «Tu equipo, con identidad» y el párrafo de técnicas del membrete para usar todo el ancho en los diseños del cliente. Se reemplaza el hero promocional por una galería de todas las partidas (hasta20), con imagen, nombre, color y cantidad. Sin límite de2selecciones. Miniaturas sobre fondo blanco/transparente y sin mix-blend-mode que oscurezca la imagen. Móvil2columnas; impresión hasta4columnas con saltos entre productos.

El logo ya estaba en los PNG guardados; el problema era renderFinal, que aplana la prenda/logo sobre fondo#e9e9e6 y añade ficha técnica al pie. Nuevas selecciones guardan renderDiseno transparente, directamente del lienzo con el logo; descarga técnica y miniatura del carrito conservan renderFinal. Original de logo y archivos ya guardados intactos. Las fichas históricas conocidas se reconocen por formato/fondo y se proyectan en memoria usando la transformación original y el alpha exacto del modelo del mismo SKU; se elimina exclusivamente el fondo y pie, sin generar otra prenda/logo ni adivinar máscaras por color. Prendas claras/grises no se borran por umbrales RGB. Fuente sin máscara/formato confirmado se conserva; no inventar siluetas. No se escriben derivados al servidor.

Las imágenes se preparan al abrir el pedido, dentro de la vigencia del enlace autorizado; PNG comercial en memoria y caché acotada, limpiada al salir del equipo. No cambiar precios, documentos publicados, permisos, pedidos o imágenes fuente. En cliente, un render cargando muestra Preparando diseño en vez de sustituirse por el modelo sin logo; fallo real permite referencia identificada y reintento desde Actualizar estado. Durante carga se pide esperar antes de imprimir, sin afectar revisión/publicación comercial.

QA aislado:2fichas grises con logos de prueba y1PNG transparente. Alfa de esquinas0 y logos presentes en las3; galería completa, importes correctos, lectura privada/pública y PDF. Prueba del personalizador real guardando PNG transparente en IndexedDB local, sin crear/enviar pedido al servidor. Vista20partidas y pantallas1440/390/375px sin errores/desbordamiento. Ejemplo3partidas en1A4;20partidas en4hojas con encabezados y total. Sin IA/API de pago ni modificación de base/Edge21. Detalle/publicación final en Cerebro.

## Publicación autorizada: membrete de cotización v2 — 15-oct-2026

JP aprobó expresamente la propuesta visual y pidió publicarla. Se integra el membrete v2 dinámico en Gestión→Ver membrete, Mi pedido e Imprimir/Guardar PDF. Logo ZAIN, bloque de prendas, datos de emisión/vigencia, selección con miniaturas, condiciones y total cobalto, siguiendo la propuesta aprobada. Las imágenes son los renders ya autorizados/cargados del pedido; cuando faltan se usa la foto pública del SKU identificada como Referencia del modelo, o un marcador sin inventar otra prenda. No se copian nombres/importes/fechas/IVA de la demostración: datos reales del borrador o última revisión publicada. Sin costo, margen, proveedor, bandas o tarifas internos.

Diseño compartido con CSS separado, móvil375/390px, encabezados de tabla repetidos y filas indivisibles en impresión A4. Ejemplo de2partidas en1hoja y20partidas en3hojas comprobados. Ventana de impresión como documento local Blob, opener=null, URL revocada al cargar; el botón espera imágenes/fuentes antes de imprimir. No conserva el documento en servidor ni publica automáticamente una cotización. Guardar borrador y revisar/publicar siguen siendo acciones separadas; cotizaciones guardadas conservan sus cifras. Se actualizan versiones de recursos en ambas páginas. Backend Edge21, datos, precios, permisos y pedidos sin cambios.

Validación visual con fixtures locales de gestión/cliente/publicación manual e impresión; renders originales de ejemplo, importes exactos, fechas CDMX, estados pendientes y ausencia de datos internos. Pruebas de escapado/URLs de imagen seguras. Sin pedidos o mensajes reales. Esta aprobación reemplaza las notas históricas que mantenían la propuesta v2 pendiente de aprobación e integración. Publicación final registrada en Cerebro.

## Corrección vigente: tamaño de logo al enviar — 15-oct-2026

El personalizador ampliaba el máximo de las zonas no orientativas con escalaMaxLogo (1.3) y redondeaba a medio centímetro; la validación del servidor seguía usando zone.max. Esto bloqueaba un logo de11.5cm en pecho/chaleco cuya zona base era9cm. Se igualó la validación al máximo real del editor, incluyendo zonas orientativas sin multiplicar otra vez. Se conserva el tamaño solicitado y la posición ajustada; no se reduce el logo al enviarlo ni se cambia el carrito. Permanecen las validaciones de producto/color/técnica/tallas/cantidad, zona existente y medida finita dentro del rango ofrecido. Diseño y medidas finales requieren revisión del equipo. Sin cambios de precios, datos guardados, permisos, renders ni pedidos reales de prueba.

## Entrega vigente: catálogo empresarial 2026 — 15-oct-2026

Esta entrega sustituye los estados históricos de fuentes pendientes y renders bloqueados. Juan Pablo autorizó expresamente limpiar la transparencia después de generar las prendas. Se conservan los originales y se eliminan residuos externos y huecos espurios del alpha, sin redibujar cortes ni suavizar la tela.

Gama seleccionada:13 referencias nuevas agrupadas en8 fichas (dos polos, playera deportiva de malla, Oxford corta y larga, chaleco, chamarra de oficina y rompevientos). SKU públicos ZN-PO-008/011, ZN-PL-008/009, ZN-CM-012/015, ZN-CE-001 y ZN-CH-002/003. Las dos premium y13 bolsas se conservan;29 referencias anteriores quedan ocultas recuperables. Resultado esperado tras activación privada:28 referencias activas y22 fichas. La portada usa6 familias representativas. Cada nueva referencia tiene render IA blanco con alpha;11 incluyen fotografía de catálogo de la silueta correspondiente. Las2 variantes sin fotografía individual no usan fotos de otra prenda. Todas son vistas ilustrativas; confirmar acabado, tono y disponibilidad.

Los nuevos productos base están ocultos hasta activarse mediante ediciones privadas existentes. Proveedor, referencia de compras, fuentes y costos nuevos se importan únicamente en Supabase y en el archivo privado del proveedor, fuera del Git público. No incluirlos en nombres de archivos, configuración pública o cotización del cliente. Cliente conserva su SKU ZAIN; equipo autorizado ve ambas referencias.

Costeo area_tallas_volumen_v3 y borradores schema5: bandas privadas por talla, color y cantidad de la partida; no sumar pedidos o partidas para conseguir descuentos de compra.61 bandas documentales, con costo XS del chaleco pendiente. La fuente de chamarras deja ambiguo120 exactas: se cargan1–11,12–119 y121+, y120 exige costo unitario revisado. Sin costo conocido, el borrador sigue pendiente incluso si se escribe precio de venta. Importes conservan el IVA incluido tal como lo dice la lista, sin dividir entre1.16 ni fijar tasa fiscal. Vigencias impresas no equivalen a precio confirmado hoy. Configuración automática sigue desactivada; tarifas de técnicas, impuesto y altura requieren revisión del equipo. Los márgenes brutos y las cotizaciones publicadas se conservan.

Validación:112 pruebas automáticas aprobadas; navegador aislado con fixtures,28 activas/29 ocultas,22 fichas/6 muestras, variantes y fotos correctas, filtros que conservan importes y61 bandas.1440/390/375px sin errores JS ni desbordamiento. No se crearon pedidos reales, usuarios ni trabajos de prueba. RLS, autenticación y permisos existentes sin cambios. La comprobación de publicación y versiones finales queda registrada en Cerebro.

## Actualización vigente: fuentes recibidas y filtros de gestión — 15-oct-2026

Recibidos los cuatro PDF: Player y Tees72 páginas +5 de precios y Wusstek32+4,113 páginas en total. Originales e inventarioSHA256 fuera del Git público, en ZAIN/Proveedores/2026-10-15 Player y Tees y Wusstek. Estudio de ambas marcas y del nicho completado:55 SKU PT y23SKU W,183 filas impresas PT y60 tarifas W. Informe privado «Catálogo empresarial ZAIN2026»; selección y precios son documentales, no pruebas de stock o venta. No se incorporaron todavía prendas ni precios nuevos al servidor: renders en revisión por residuos en transparencia. No publicar imágenes con puntitos ni prometer réplica exacta. Mantener15 referenciasactivas: premium Caballero/Dama y13bolsas;29ocultas recuperables. Originales y pedidos archivados conservados.

JP pidió filtros también en catálogo/costos para dejar de ver referencias antiguas arriba. Gestión→Catálogo inicia en Activas; opciones Activas/Ocultas/Todas, categoría y orden Nombre/Categoría/SKU. Costos y cotizador: mismos filtros, búsqueda, Solo pendientes y orden pendientes primero. Al mostrar todas, activas primero. Filtrar u ordenar conserva importes sin guardar; filtros no alteran disponibilidad de la tienda. Productos nuevos se incorporan al cargar/actualizar. Ocultos se consultan expresamente.

Motor de costos preparado para bandas explícitas por talla y color; suma cantidades canónicas sin promediar/redondear antes de acumular. Las bandas son privadas, editables en configuración y borrador, con fuente documental. Faltas de talla/color/costo quedan pendientes, incluso con precio manual. Margen bruto y técnica por área sin cambios. Configuración area_tallas_v2 y borrador schema4, lectura histórica compatible y pestañas anteriores requieren recargar para guardar. El cliente conserva una partida combinada y no recibe bandas/costos/fuentes. Guardar precios no cambia cotizaciones históricas publicadas. Sin migración SQL ni cambios de permisos, usuarios o pedidos. Soporte genérico catalogo2026 valida tallas estructuradas en prendas estáticas nuevas; todavía sin altas nuevas.

Pruebas:105 aprobadas; navegador con fixtures sin pedidos reales, filtros activos/ocultos/categorías/orden y conservación de importes, costo mixto por talla y guardado de borrador,1280px y390px sin errores/desbordamiento. Fichas públicas muestran composición por color real y gramaje/tolerancia solo cuando existen. Este bloque prevalece sobre estados anteriores de PDF pendientes y tabla sin filtros. La publicación se verifica en el cierre de Cerebro.

## Decisión vigente de JP: nuevo proveedor y archivo previo — 15-oct-2026

JP confirmó que todos los pedidos anteriores eran pruebas y autorizó retirarlos. Se archivaron reversiblemente:10 en Papelera,0 activos al verificar. Catálogo reducido a Playera premium Caballero/Dama (ZN-PL-004/005) y13 bolsas:15 referencias activas;29 ocultas (24 desactivadas ahora y5 previas). Gorra incluida entre las archivadas por la aclaración posterior de conservar solo premium/bolsas. Restauración desde Catálogo→Ocultas y Pedidos→Papelera. No borrar originales/SKU/archivos ni reactivar en masa al regenerar. Las ediciones privadas de Supabase prevalecen sobre la disponibilidad base del código.

Pendiente recibir2PDF de catálogo y2de precios de dos marcas del proveedor nuevo. Autorizado análisis profundo de la gama para uniformes empresariales, nuevos renders fieles al corte y costos reales importados por talla/rango, manteniendo referencias de proveedor privadas y SKU ZAIN nuevos sin reciclar los archivados. Ningún archivo nuevo recibido todavía; no inventar marcas, cifras, impuestos o stock. El costo por talla aún no está implementado; el cotizador actual tiene costo de prenda por SKU. Conservar margen bruto y proyección comercial combinada. Detalle: docs/MIGRACION-NUEVO-PROVEEDOR.md; decisión y evidencia en Cerebro.

## Decisión vigente de JP: siluetas visuales y tabla completa de costos — 15-oct-2026

Caballero/Dama usa un selector de dos opciones visibles con selección negra/texto blanco y confirmación, compartido en catálogo, personalizador y agregado rápido. Radios nativos por grupo, foco restaurado al reconstruir, teclado/foco/reduced motion; mismas variantes, fotos, colores y tallas. Ver docs/SELECTOR-SILUETAS.md.

Gestión → Costos y cotizador muestra todas las prendas con miniatura del render, nombre y silueta (incluidas ocultas). Sin selector/agregado individual; productos nuevos se incorporan al cargar/actualizar. Nombre/estado/campo de costo pendiente en rojo,0 explícito válido. Búsqueda y Solo pendientes conservan importes. No persistir filas nuevas totalmente vacías para evitar migrar automáticamente las aplicaciones fijas históricas. Costos previos/cotizaciones/publicaciones conservados. Ver docs/COTIZACIONES.md. Sin cambios de base, usuarios, precios reales o renders originales.

## Decisión vigente de JP: prenda y técnica por cm² — 15-oct-2026

Costos privados separados: prenda/otros por SKU y tarifa MXN/cm²/preparación por Bordado, Serigrafía y DTF. Gestión → Costos y cotizador. Dentro del pedido, confirmar ancho y alto del rectángulo de cobro; solo se dispone del ancho solicitado, no inventar altura ni suponer cuadrado. Tarifa de hasta cuatro decimales (0.0050). Aplicación por pieza = ancho × alto × tarifa, redondeada a centavos; costo completo más preparación se divide entre1−margen bruto. Cliente: una sola partida con prenda + personalización incluidas, sin área/tarifas/costos internos. No asumir que un taller factura siempre por superficie; importe fijo revisado disponible por pedido.

Configuración nueva area_cm2_v1 y borrador schema3; adaptación al leer sin migración masiva. Guardados/publicaciones históricos no cambian; anteriores conservan aplicación fija hasta revisión explícita. Las pestañas antiguas deben recargar para guardar. Automático sigue desactivado, costos/tarifas reales vacíos. 97 pruebas y flujo visual con fixtures, sin crear pedidos ni costos reales. Ver docs/COTIZACIONES.md. La propuesta visual PDF v2 continúa pendiente de revisión, no se integra por esta modificación de costos.

## Corrección vigente de JP: margen bruto — 15-oct-2026

JP reemplazó expresamente el recargo por margen bruto sobre venta. Fórmula: precio = costo / (1 − margen). $100 de costo con40% da$166.67; con30% da$142.86 antes de impuestos. Rangos propuestos40/35/30/25%, editables y sin costos reales. Margen100% inválido. Descuentos bajan el margen final visible. NO reinterpretar recargo50% como margen50% ni recalcular cotizaciones publicadas. Configuración anterior se convierte a equivalente y exige revisión; borradores anteriores conservan precio manual. Ver docs/COTIZACIONES.md y supabase/cotizaciones-margen.sql.

JP también pidió una propuesta de diseño más trabajada para el membrete. La propuesta visual v2 es un PDF independiente con renders del catálogo y datos ficticios; pendiente de aprobar/adaptar al membrete dinámico. No confundir el cambio de fórmula publicado con la aprobación del diseño propuesto.

## Decisión vigente: cotizador privado y cotizaciones revisadas — 15-oct-2026

JP autorizó costos privados, rangos editables por partida y borrador revisable antes de publicar al cliente en /mi-pedido. Guía: docs/COTIZACIONES.md. La configuración inicial tiene costos vacíos y aplicación automática desactivada; 50/45/40/35% son recargos ilustrativos sobre costo y NO precios aprobados ni márgenes. No inventar costos ni convertir desconocidos en cero. Impuesto se define expresamente al revisar; no existe tasa fiscal predeterminada.

Gestión → Costos y cotizador configura SKU/técnica, costos de prenda/aplicación/otros/preparación y rangos. Cada pedido permite costos y precios manuales, descuento, envío, vigencia y condiciones. Guardar borrador conserva la última revisión publicada; publicar requiere revisión manual del equipo. Publicar no significa pago, aceptación del cliente o producción. Cliente y talleres nunca reciben costos/recargos/utilidad/referencias del distribuidor. Rehacer conserva publicación hasta volver a revisar; retirar conserva historial.

Motor en centavos/puntos base, control de versiones y transacciones con bloqueo; tablas/RPC privadas solo service_role tras autorización del equipo. Servidor portable ZAIN_COTIZACIONES_ENABLED=true; generar Edge con server/preparar-edge.mjs. Membrete con logo existente y opción Imprimir/Guardar PDF en navegador. No se envían notificaciones automáticas y no se crean pedidos o costos reales para probar.

## Decisión vigente: altas de catálogo, renders de Codex y talleres — 14-oct-2026

Juan Pablo autorizó crear productos/categorías desde gestión, reutilizar/subir renders y preparar generación con su sesión de Codex en esta computadora, sin API de imágenes de pago. También pidió accesos separados para talleres por técnica y partida. Estas decisiones prevalecen sobre restricciones históricas que requerían solicitar nuevas altas por chat o editar código.

**Gestión → Catálogo → Nuevo producto / Nueva categoría:** nombre comercial, silueta, descripción/especificaciones, colores HEX y tallas propios, técnicas múltiples, mínimo/incrementos y referencias privadas de compras. SKU nuevo inmutable ZN-NP-000001… generado por servidor; no cambia los SKU existentes. Bolsas nuevas conservan 100 por modelo/color e incrementos de 50. Las categorías aparecen al tener referencias activas. Borrador oculto; imagen revisada y activación manual. Pausar no elimina. Render protegido tras primera publicación; textos, foto secundaria, técnicas y publicación continúan editables.

**Imágenes:** reutilizar solo si coincide el corte; subir render claro cuadrado con transparencia; o fotografía nítida a cola de Codex. La fotografía de catálogo es pública, no usar logos/datos de clientes. Cola local cada 15 minutos, automatización zain-renders-pendientes-en-codex; computadora y Codex abiertos, sujeta a límites de sesión. La IA trabaja en la nube, la computadora coordina. No API de imágenes ni créditos configurados. Salida en revisión, nunca autopublicada: consultar cola → usar render → activar. La primera solicitud real de esta cola sigue pendiente de prueba de generación completa. No prometer réplica exacta sin revisión.

**Gestión → Talleres / /taller-zain:** correo aprobado y cuenta Auth confirmada, una técnica por taller. Taller principal opcional para próximas confirmaciones; asignación manual por selección para pedidos confirmados/en producción. El proveedor recibe únicamente su partida, especificaciones y archivos; no ve otras técnicas, total global, contactos, notas internas ni referencias del distribuidor. Puede marcar Aceptado/En proceso/Listo; no cambia el estado del cliente. Contador de nuevos trabajos dentro de su panel. Notificaciones automáticas por correo/WhatsApp siguen pendientes y no se enviaron mensajes. JP aún no tiene el correo del taller: cero accesos nuevos autorizados.

**Estado comprobado:** 69 pruebas aprobadas; navegador local con fixtures a 390×844 y 1280×800, creación de categoría/producto, técnicas múltiples, render en revisión y sesión del taller. RLS privado y privilegios anon/authenticated revocados en tablas/RPC nuevas; ninguna función nueva security definer. API de talleres y gestión sin login devuelve 401; catálogo público mantiene 39 activas/5 históricas. Migraciones aplicadas y Edge zain-pedidos v15 ACTIVE. Cero nuevos productos, talleres o partidas de prueba en producción. Contraseñas filtradas desactivadas sigue siendo aviso previo de Supabase; no se cambió Auth.

Pendientes externos: correo del amigo del taller y cuenta, primera referencia real a la cola; responsable/domicilio de privacidad y medición Ads continúan con sus pendientes previos; envíos solo planeados.

Detalle: [[Catalogo ZAIN - gestion de publicaciones]] · [[Renders ZAIN - cola local de Codex]] · [[Talleres ZAIN - acceso por partida]] · [[Pedidos ZAIN - panel privado y migracion]] · [[2026-10-14 ZAIN - altas renders locales y talleres]].

## Decisión vigente: técnicas editables, bolsas unificadas y regreso al inicio — 14-oct-2026

JP eligió **todas las bolsas visibles en “Todos”**. Se muestran las 13 fichas individuales junto a las familias de prendas; los filtros siguen visibles, también en Bolsas, sin una tarjeta intermedia “Ver bolsas”. En “Todos” son 28 fichas (familias agrupadas y bolsas), que representan las 39 referencias activas. #bolsas abre su filtro en el mismo catálogo.

Botón circular **Volver arriba** en la tienda y en /gestion-zain, visible después de bajar aproximadamente una pantalla. En tienda queda encima de WhatsApp, con espacio; se oculta bajo carrito/diálogos. Desplazamiento suave o inmediato con movimiento reducido; etiqueta accesible y foco al encabezado.

Playera premium de caballero ZN-PL-004: el render base turquesa se corrigió a blanco neutro con image_gen integrada, preservando corte/costuras/pliegues y transparencia. Original intacto; nuevo archivo versionado y WEBP lossless. No se sustituyeron otras prendas ni fotos secundarias. Tinte/color elegidos por cliente siguen funcionando.

Gestión → Catálogo → Editar ahora incluye botones múltiples **Bordado / Serigrafía / DTF**. Activos: negro con texto blanco. Guardar y publicar aplica las técnicas a esa referencia/silueta. Al menos una técnica; selección y variantes no cambian solas. El cliente ve las asignadas en la ficha y editor; servidor rechaza una desactivada para pedidos nuevos. Solicitudes previas conservan su técnica y reintentos autorizados. Esta decisión reemplaza proteger las técnicas como campo fijo.

Migración catalogo_tecnicas_editables_zain aplicada: mismos permisos privados, versión/bloqueo e historial; solo tres IDs permitidos, sin duplicados ni lista vacía. 59 pruebas aprobadas; pruebas locales con datos ficticios de selección múltiple, desactivación, reflejo en cliente, regreso al inicio y 390×844/1280×800, sin desbordamiento. No se cambiaron técnicas de productos reales para probar ni se enviaron mensajes.

Guía: docs/CATALOGO-GESTION.md. Registro completo en el Cerebro de Dropbox.

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


> **Decisión vigente de JP:** catálogo de productos individuales y carrito personalizado sin precios ni importes de referencia. El cliente arma su selección y solicita la cotización por WhatsApp. JP está considerando paquetes separados con precio publicado; incorporarlos cuando confirme su alcance y costos. Cada producto nuevo se incorpora desde un PDF del proveedor, con modelo y colores confirmados por JP.

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

`js/config.js` conserva IDs retirados en `productosHistoricos` para folios registrados, no para solicitudes nuevas. La API comprueba color/código, tallas y su suma, y deriva la ficha técnica. **No borrar datos ni originales antiguos**. Catálogo y servidor se regeneran/despliegan juntos: Supabase Edge versión 6; no basta con un push. Datos y criterios completos en [docs/CATALOGO-YAZBEK.md](docs/CATALOGO-YAZBEK.md). Pruebas: `node --test tests/*.test.mjs`, 34 aprobadas. Este apartado es histórico; prevalece la decisión del 14-oct-2026 al principio del documento.


# ZAIN — instrucciones para Claude Code

## Privacidad y medición preparada (13-oct-2026)

- `docs/PRIVACIDAD-BORRADOR.md` y su HTML son borradores locales con responsable y domicilio pendientes. La ruta `docs/` sigue bloqueada. No publicar el borrador como aviso definitivo ni activar `privacidadPublicada` hasta completar la página pública `/privacidad`.
- `medicion.activa=false` y los identificadores Google Ads están vacíos. `js/medicion.js` carga Google solo con consentimiento afirmativo, configuración válida y aviso publicado. Sigue `docs/MEDICION.md`; no activar campañas ni inventar IDs.
- Solicitud guardada es captación, no venta ni WhatsApp enviado; propuesta principal. Clic WhatsApp es secundaria. No optimizar pujas con ambas como principales. Deduplicar por identificador técnico derivado y contar Una en Ads.
- No enviar logos, notas, folios, identidad, nombres de archivo ni enlaces de seguimiento a Google. No instalar medición en acceso del equipo o ficha del cliente. La medición nunca bloquea la solicitud si falla.
- Conservar Vercel Analytics agregado existente; no confundir sus visitas con conversiones de Ads. Los tests de medición usan una etiqueta simulada y no prueban recepción en una cuenta de Ads.

## Decisión vigente posterior: pedidos privados (13-oct-2026)

- JP aprobó guardar solicitudes, logos originales y renders en un proyecto Supabase dedicado `Zain Pedidos`; los detalles operativos están en `docs/PEDIDOS.md`. Esta decisión reemplaza las instrucciones anteriores de archivos solo locales y Web Share.
- El botón principal guarda primero y abre directamente el número de ZAIN con texto, folio y enlace de seguimiento a `/mi-pedido#ID/TOKEN`. El cliente confirma el mensaje; guardado NO implica envío, pago ni pedido confirmado. No regresar al menú de compartir aplicaciones.
- Tras confirmar la solicitud en nube y pasar a WhatsApp, retirar del carrito solo las selecciones guardadas, eliminar sus archivos locales y cerrar el borrador. Conservar el enlace de la última solicitud para consulta; el siguiente pedido inicia otro folio. Si falla el guardado o se abre solo texto/ZIP sin nube, conservar carrito y originales. No borrar el pedido ni archivos de Supabase por vaciar el carrito.
- `/gestion-zain` es el login del equipo. `/pedidos` conserva enlaces privados anteriores redirigiéndolos al nuevo panel. `/mi-pedido` es una consulta individual sin login, con capacidad de lectura distinta del secreto de carga; nunca devolver notas internas, hashes, nonce ni rutas de objetos. Cambiar una ruta no sustituye autorización. Usuario real verificado, correo confirmado y autorización privada; nunca confiar en `user_metadata` ni en haber visitado la URL.
- `server/pedidos.mjs` es el servidor portable; la función Supabase se genera con `server/preparar-edge.mjs`. Un push a GitHub no despliega la función de Supabase. Catálogo/reglas nuevas requieren generar y desplegar ambos si afectan validación.
- No publicar claves ni datos de clientes. La configuración de autenticación usa solo claves públicas proporcionadas por el servidor; las de servicio se quedan en su entorno. No guardar correos de acceso reales en el código.
- Mantener `docs/PEDIDOS.md` y las notas del Cerebro actualizadas, conservar versiones anteriores, distinguir ejecutado/probado de pendiente. No reconstruir índices/grafos por este cambio.
- JP quiere iniciar publicidad esta semana; confirmar alojamiento comercial, privacidad y medición antes de considerar el lanzamiento completo. No activar campañas ni contratar planes sin su instrucción.

## Bolsas: catálogo confirmado el 13-oct-2026

- Decisión posterior de JP: mínimo 100 por cada modelo y color, en incrementos de 50. Validar en ambos formularios y en pedidos antiguos antes de compartir. Los demás mínimos siguen pendientes; no anunciar un mínimo general de 12.
- «Bolsas» en el editor carga Expo directamente y muestra un selector de modelo en el mismo editor. La tarjeta y la muestra de portada también usan Expo. No mostrar la lista «También manejamos» hasta que JP confirme esos productos.
- El logo admite 15 colores y HEX. El Pantone es referencia para cotización; JP confirmó que no tiene tabla de equivalencias. No convertir Pantone automáticamente ni presentar un HEX como equivalencia oficial.
- `escalaMaxLogo` amplía 30% el espacio de vista previa, sin prometer un área de impresión. Mantener el aviso de confirmación de medidas.
- `js/archivos.js` guarda logos originales y renders PNG de 1200 px en IndexedDB del dispositivo. Conservar bytes originales, también PDF en pedido rápido. No subir archivos a un servidor.
- Web Share se llama desde el toque con archivos ya preparados; el cliente elige WhatsApp/contacto. Nunca afirmar que el pedido fue enviado al resolver `share()`. Alternativa: ZIP con pedido TXT, renders y originales, más enlace de WhatsApp para el texto. Guardados antiguos sin originales deben avisarlo; no inventar un archivo.
- Mantener un solo botón principal «Enviar pedido por WhatsApp». Sin adjuntos, abre el chat con texto; con adjuntos compatibles, usa el menú nativo. Si no hay soporte, abre el chat y descarga el ZIP indicando que debe adjuntarse. Las alternativas quedan dentro de «Otra forma de enviar». Los saludos usan coma, sin emoji, para evitar el carácter roto observado en WhatsApp.
- Al quitar o vaciar un pedido, eliminar sus archivos locales. Si no se pueden guardar, mantenerlos en memoria y avisar para descargarlos antes de salir.

- Fuente: PDF «1-BOLSAS CATÁLOGO 2026», páginas de producto 3–16. Se incluyen 13 modelos, excluyendo Metálica. Usa las páginas de producto; el índice tiene números desfasados.
- Fotos originales extraídas del PDF con su transparencia, proporcionadas en un lienzo cuadrado. No sustituirlas por imágenes generadas. `fotoColor` identifica el tono original; el motor lo conserva y simula las otras variantes con el mapa de sombras.
- Colores específicos de cada modelo y sus muestras del PDF. Market enumera 15 tonos aunque el encabezado dice 14; se conservan los 15 nombrados, incluido Lino.
- Medidas: largo de base, altura, fuelle y altura con asas donde constan. Mezclilla se titula 38×45 y especifica fuelle de 8 cm: mostrar ambos datos.
- Consulta de disponibilidad en cada modelo. Fotografías ilustrativas y colores sujetos a variación. Las piezas por bulto son información del proveedor, no el mínimo de venta de ZAIN.
- La portada del catálogo muestra una sola entrada «Bolsas». Al entrar se muestran los modelos. El personalizador usa el mismo motor, colores y animaciones de las prendas existentes.
- Serigrafía es la aplicación documentada. Colombia y Manta incluyen notas de sublimación del PDF; no añadir técnicas a otras bolsas sin confirmación.

Página estática (HTML + CSS + JavaScript sin frameworks) de **ZAIN**: uniformes y artículos promocionales con logo (bordado, serigrafía, DTF). Responde al dueño **en español**.

## Cómo está hecha

- **Sin build ni dependencias.** No agregues React, Vite, Tailwind, npm ni ningún paso de compilación. Se publica subiendo la carpeta tal cual.
- `js/config.js` es la **única fuente de datos**: marca, WhatsApp, contacto, colores, técnicas y productos (colores, tallas, zonas del logo, `pxPorCm`), promocionales y preguntas. Cualquier cambio de contenido se hace ahí, no en el HTML.
- `js/render.js` (`window.ZR`) es el motor del render en `<canvas>`:
  - `tenir()` pinta la foto blanca de la prenda del color elegido usando un mapa de sombras (los pliegues salen de la foto).
  - `estampar()` aplica el logo con el acabado de cada técnica (bordado: puntadas, relieve y sombra; serigrafía: tinta mate con grano; DTF: lustre) y pasa las arrugas de la tela por encima.
  - Las fotos de producto deben ser **prendas blancas, fondo transparente, cuadradas (1000×1000)**.
- `js/trama.js`: trama de semitono en WebGL (adaptada del «Halftone» de Scrolltide) que «imprime» la foto de serigrafía con el scroll.
- Animaciones: solo se activan si `<html>` tiene la clase `.anim` (script del `<head>`; se omite con «reducir movimiento»). La entrada con el logo sale una vez por visita (`sessionStorage`). Todo el contenido es visible sin JS.
- `js/zain.js`: portada (carrusel en arco arrastrable, adaptado del «Arc Carousel» de Scrolltide), catálogo, personalizador y pedido.
- El **pedido** se guarda en `localStorage` (`zain-pedido`) y se envía con un enlace `https://wa.me/<número>?text=...`. **No hay pagos en línea; la venta es por WhatsApp.** No agregues pasarelas de pago salvo que el dueño lo pida.
- Estilos en `css/zain.css`; la paleta está en variables de `:root`. Solo tema claro.

## Reglas

- Para probar, levanta un servidor local (`python3 -m http.server 8080`). Con `file://` el canvas falla por seguridad del navegador.
- Después de editar un `.css` o `.js`, **sube su `?v=N` en `index.html`** para que el navegador no use la versión en caché.
- Mantén la accesibilidad: botones reales, `aria-label` en los iconos, foco visible, contraste AA y `prefers-reduced-motion`.
- Inputs con `font-size` de 16px o más (iPhone hace zoom si es menor). Estilos `:hover` solo dentro de `@media (hover: hover) and (pointer: fine)`.
- Las imágenes de `img/` son **de ejemplo** (generadas con IA). Cuando el dueño mande las reales, quítales el fondo, déjalas cuadradas a 1000×1000 en WebP y recalibra `zonas` y `pxPorCm` del producto.
- «Pecho izquierdo» = izquierdo de quien lo usa = lado derecho de la foto.

## Publicar

Es un sitio estático: sirve cualquier hosting (cPanel `public_html`, Netlify, Vercel, Nginx). El README explica cada opción y la configuración de Nginx con HTTPS. Antes de publicar, confirma con el dueño que `whatsapp` en `config.js` ya tiene su número real.
