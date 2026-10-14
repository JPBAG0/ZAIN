# ZAIN — página web

## Catálogo vigente de prendas — Yazbek, 13-oct-2026

14 familias y 25 referencias verificadas del PDF completo. Dama/caballero se seleccionan dentro de una ficha; código, tallas y colores corresponden a la variante exacta. Las fotos del catálogo permanecen sin teñir. El personalizador usa **esquemas orientativos identificados** y una foto real de referencia; los PNG también llevan la advertencia. DTF por tejido pendiente de confirmar. Las seis prendas genéricas ya no se seleccionan; gorras y softshell esperan catálogo. Las 13 bolsas conservan su catálogo y mínimos.

`js/config.js` conserva IDs retirados en `productosHistoricos` para folios registrados, no para solicitudes nuevas. La API comprueba color/código, tallas y su suma, y deriva la ficha técnica. **No borrar datos ni originales antiguos**. Catálogo y servidor se regeneran/despliegan juntos: Supabase Edge versión 5; no basta con un push. Datos y criterios completos en [docs/CATALOGO-YAZBEK.md](docs/CATALOGO-YAZBEK.md). Pruebas: `node --test tests/*.test.mjs`, 34 aprobadas. Las notas históricas debajo no prevalecen sobre esta sección.


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
