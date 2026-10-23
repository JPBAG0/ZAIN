# Camisa utilitaria manga larga — ZN-CM-016

Nueva referencia con siete fotos originales por color, tallas XS–2XL y bordado. No utiliza un render IA ni recoloración. El código y nombre del proveedor se cargan exclusivamente en la edición privada del catálogo, visible al equipo autorizado en Gestión.

## Datos y archivos

- SKU propio e inmutable: `ZN-CM-016`; ID `zn-cm-016`. Categoría Camisas, silueta Unisex.
- Colores: Blanco, Natural, Beige, Olivo, Azul marino, Carbón y Negro.
- Composición declarada: 86% poliéster / 14% elastano; gramaje 140 g/m².
- Fotos del sitio: `img/productos/zain/zn-cm-016-c01.webp` a `c07.webp`, seleccionadas mediante `fotosColor`.
- El catálogo base permanece oculto; se activa con la edición privada existente, sin reactivar otras referencias ni cambiar sus SKU.
- No se inventó costo, precio, stock, plazo o tabla de medidas. La tarifa de prenda queda pendiente en Gestión.

Los siete originales se conservan en la carpeta privada del proveedor, fuera del repositorio público, con URL, fecha y SHA-256. Para la web se centró cada original de1114×1710 en un lienzo blanco1710×1710, sin escalar ni retocar; WebP lossless. Los píxeles del rectángulo original decodificado son idénticos. El personalizador existente usa estas fotos directamente, conserva colores y superpone el logo.

Las zonas orientativas se calibraron visualmente por encima de los bolsillos, en pecho izquierdo/derecho. El máximo de9cm de ancho y4cm de alto es orientativo para cotización, no una certificación del área física. La foto incluye las etiquetas de origen; no se eliminaron. La disponibilidad y tamaño/acabado final se confirman antes de producir.

## Verificación

`tests/camisa-fotos-originales.test.mjs` comprueba las42combinaciones de color/talla, las siete fotos únicas, privacidad de la referencia de compra, snapshot interno y rechazos de técnica/zona/tallas ajenas. `tests/camisa-fotos-browser.cjs` recorre los siete colores con un logo subido y texto en390/1280px; compara los píxeles de la prenda con el original para detectar recoloración y comprueba que el logo siga visible. Pruebas con servicios ficticios, sin pedidos ni mensajes reales.

Después de cambiar la base: generar `node server/preparar-catalogo.mjs` y `node server/preparar-edge.mjs`, comprobar/deplegar la API y publicar el sitio. Activar únicamente la referencia nueva con la RPC privada existente y control de versión. Regenerar `js/catalogo-respaldo.json` desde la API cuando el catálogo definitivo esté activo.
