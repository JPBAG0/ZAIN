# ZAIN — instrucciones para Claude Code

Página estática (HTML + CSS + JavaScript sin frameworks) de **ZAIN**: uniformes y artículos promocionales con logo (bordado, serigrafía, DTF). Responde al dueño **en español**.

## Cómo está hecha

- **Sin build ni dependencias.** No agregues React, Vite, Tailwind, npm ni ningún paso de compilación. Se publica subiendo la carpeta tal cual.
- `js/config.js` es la **única fuente de datos**: marca, WhatsApp, contacto, colores, técnicas (y su costo extra), productos (precio, colores, tallas, zonas del logo, `pxPorCm`), promocionales y preguntas. Cualquier cambio de contenido se hace ahí, no en el HTML.
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
