> **Decisión vigente de JP:** catálogo de productos individuales y carrito personalizado sin precios ni importes de referencia. El cliente arma su selección y solicita la cotización por WhatsApp. JP está considerando paquetes separados con precio publicado; incorporarlos cuando confirme su alcance y costos. Cada producto nuevo se incorpora desde un PDF del proveedor, con modelo y colores confirmados por JP.

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
