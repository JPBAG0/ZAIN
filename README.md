# ZAIN — página web

Página para vender uniformes y artículos promocionales con logo (bordado, serigrafía y DTF).

- **Catálogo** con filtros y vista de cada prenda en todos sus colores.
- **Personalizador**: el cliente sube su logo (o escribe un texto), elige prenda, color, técnica, ubicación, tamaño en cm y piezas por talla, y ve el **render al momento**. Lo puede descargar.
- **Pedido (carrito)**: junta varias prendas y lo **envía por WhatsApp** con todo el detalle y un total de referencia. No hay pagos en línea: la venta se cierra por WhatsApp.
- Funciona en celular y en compu. No necesita base de datos, ni instalar nada, ni compilar: son archivos estáticos.

---

## 1. Antes de publicar (lista de pendientes)

Todo se cambia en **`js/config.js`** (los datos de ejemplo están marcados con ✏️):

- [ ] `whatsapp`: número con lada de país, sin espacios. México: `52` + 10 dígitos (ej. `523312345678`).
- [ ] `correo`, `ciudad`, `instagram`, `horario`.
- [ ] `minimoPiezas` y `diasEntrega`.
- [ ] Precios de cada producto (`precio`) y el costo extra de cada técnica (`extra`). Si pones `precio: 0`, el producto sale como «A cotizar».
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
js/config.js        ← DATOS: productos, precios, WhatsApp, preguntas
js/render.js        motor del render (pinta la prenda y estampa el logo)
js/zain.js          portada, catálogo, personalizador, pedido y animaciones
js/trama.js         efecto de semitono (WebGL) de la foto de serigrafía
img/productos/      fotos de prendas en blanco con fondo transparente
img/fotos/          fotos de técnicas y de la sección «Empresas»
img/zain-logo.svg   logo en vector
CLAUDE.md           instrucciones para Claude Code
```
