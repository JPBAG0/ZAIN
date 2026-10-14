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


# ZAIN — página web

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


Página para vender uniformes y artículos promocionales con logo (bordado, serigrafía y DTF).

- **Catálogo** con filtros y vista de cada prenda en todos sus colores.
- **Bolsas**: una entrada abre 13 modelos del catálogo 2026, con fotos del proveedor, medidas y colores por modelo. Se excluye Metálica. Cada modelo pide consultar disponibilidad; los colores del render son ilustrativos.
- Bolsas desde **100 piezas por modelo y color**, en incrementos de 50. Otros mínimos se confirman al cotizar. Expo es la muestra de portada y se elige directamente desde el editor.
- **Logo**: colores, selector HEX y referencia Pantone para cotización. Tamaño máximo de vista previa ampliado 30%; las medidas finales se confirman antes de producir.
- **Archivos y solicitudes**: «Solicitar cotización por WhatsApp» guarda la selección, el render y el logo original en Supabase privado y abre directamente el chat de ZAIN con un folio y enlace de consulta del cliente en `/mi-pedido#ID/TOKEN`. Las alternativas de texto/ZIP son explícitas; el cliente confirma el mensaje en WhatsApp.
- **Panel privado `/gestion-zain`**: login del equipo autorizado, búsqueda, imágenes, originales, notas, estados e historial. Instrucciones de operación y migración a servidor mensual en [docs/PEDIDOS.md](docs/PEDIDOS.md).
- **Privacidad y medición preparadas**: Google Ads sigue desactivado hasta completar el aviso y sus identificadores. Consentimiento, eventos distintos y deduplicación en [docs/MEDICION.md](docs/MEDICION.md). [Borrador del aviso](docs/PRIVACIDAD-BORRADOR.md) pendiente de responsable y domicilio; no es un aviso definitivo publicado.
- **Personalizador**: el cliente sube su logo (o escribe un texto), elige prenda, color, técnica, ubicación, tamaño en cm y piezas por talla, y ve el **render al momento**. Lo puede descargar.
- **Pedido (carrito)**: junta varias prendas y lo **envía por WhatsApp** con productos, colores, tallas, cantidades y detalles de personalización. No hay pagos en línea: la venta se cierra por WhatsApp.
- Funciona en celular y en compu. El catálogo no requiere build; las solicitudes, archivos y accesos del equipo usan Supabase.

---

## 1. Antes de publicar (lista de pendientes)

Todo se cambia en **`js/config.js`** (los datos de ejemplo están marcados con ✏️):

- [ ] `whatsapp`: número con lada de país, sin espacios. México: `52` + 10 dígitos (ej. `523312345678`).
- [ ] `correo`, `ciudad`, `instagram`, `horario`.
- [ ] `minimoPiezas` y `diasEntrega`.
- [ ] Confirmar productos, colores, tallas y técnicas contra los catálogos de proveedores. Los productos individuales se cotizan por WhatsApp sin importes en el carrito. Los paquetes podrán mostrar un precio cuando JP confirme su alcance y costos.
- [ ] Productos del catálogo, colores y preguntas frecuentes.
- [ ] Fotos: las de `img/` son **de ejemplo** (generadas con IA). Cámbialas por las reales cuando las tengas.
- [ ] Revisa el pie de página y el título de la pestaña en `index.html` si quieres otro texto.

## 2. Verla en tu compu

El personalizador usa `<canvas>`, y el navegador **no deja usarlo si abres el archivo con doble clic**. Ábrela con un servidor local, desde esta carpeta:

```bash
# opción 1 (si tienes Python)
python3 -m http.server 8080
# opción 2 (si tienes Node)
npx serve .
```

Y entra a `http://localhost:8080`.

## 3. Agregar o cambiar productos

En `js/config.js`, dentro de `productos`, copia un bloque `{ ... }` completo y cambia sus datos.

**La foto del producto** tiene que ser:

- de la prenda **en blanco** (el color se pinta solo; no necesitas una foto por color),
- con **fondo transparente** (PNG o WebP),
- **cuadrada**, idealmente de 1000 × 1000 px, con la prenda centrada y de frente.

Para que el logo caiga en su lugar, cada producto tiene:

- `zonas`: dónde va el logo. La **primera** es la que se usa por defecto cuando el cliente sube su logo. `x` y `y` son el centro de la zona en píxeles de la foto (de 0 a 1000; `x` crece hacia la derecha y `y` hacia abajo). `max` es el ancho máximo del logo en cm.
- `pxPorCm`: cuántos píxeles de la foto miden 1 cm de la prenda real. Ejemplo: si el pecho de la playera mide 52 cm y en la foto ocupa 540 px, entonces `540 / 52 ≈ 10.4`.

Tip: abre el personalizador, sube cualquier logo y ajusta `x`, `y` y `pxPorCm` hasta que se vea bien.

> Ojo: «pecho izquierdo» es el izquierdo **de quien lo usa**, o sea, el lado **derecho** de la foto.

## 4. Publicarla

Son archivos estáticos: sirve cualquier hosting. Se sube **todo el contenido de esta carpeta** (que `index.html` quede en la raíz).

**Hosting con cPanel (Hostinger, GoDaddy, Neubox…)**
1. Compra el dominio y el hosting (o conecta el dominio al hosting).
2. En el Administrador de archivos, entra a `public_html`.
3. Sube todo el contenido de esta carpeta.
4. Activa el SSL gratis (HTTPS) desde el panel.

**Netlify o Vercel (gratis)**
1. Arrastra la carpeta a https://app.netlify.com/drop (o súbela a GitHub y conéctala en Vercel).
2. En «Domain settings» agrega tu dominio y sigue las instrucciones de DNS que te da.

**Servidor propio con Nginx**
```nginx
server {
  server_name zain.mx www.zain.mx;
  root /var/www/zain;
  index index.html;
  location / { try_files $uri $uri/ =404; }
  location ~* \.(css|js|webp|png|jpg|svg)$ { expires 7d; add_header Cache-Control "public"; }
}
```
Y luego HTTPS con `certbot --nginx -d zain.mx -d www.zain.mx`.

## 5. Cada vez que cambies algo

Los navegadores guardan los `.css` y `.js` en caché. Para que todos vean el cambio, en `index.html` sube el número de versión de los archivos que editaste:

```html
<link rel="stylesheet" href="css/zain.css?v=2" />
<script src="js/config.js?v=2"></script>
```

## Estructura

```
index.html          la página
css/zain.css        estilos (la paleta está en :root, al inicio)
js/config.js        ← DATOS: productos, colores, WhatsApp, preguntas
js/render.js        motor del render (pinta la prenda y estampa el logo)
js/zain.js          portada, catálogo, personalizador, pedido y animaciones
js/trama.js         efecto de semitono (WebGL) de la foto de serigrafía
img/productos/      fotos de prendas en blanco con fondo transparente
img/fotos/          fotos de técnicas y de la sección «Empresas»
img/zain-logo.svg   logo en vector
CLAUDE.md           instrucciones para Claude Code
```
