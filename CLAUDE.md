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
