# Selector de silueta ZAIN

15-oct-2026. JP pidió mejorar el selector Caballero/Dama con la skill frontend-design. Se reemplaza el desplegable por dos opciones visibles, con selección negra, texto blanco, marca de confirmación y foco cobalto. Conserva Archivo y paleta ZAIN; sin imágenes nuevas, dependencias o cambios de catálogo.

Componente compartido de js/zain.js para catálogo, personalizador y agregado rápido. Radios nativos agrupados por contexto/familia, campo con leyenda Silueta, nombres reales escapados; no se muestran selectores para familias de una sola variante. Teclado nativo con flechas/espacio/Tab y foco restaurado después de reconstruir la prenda. La etiqueta completa es el objetivo táctil (mínimo48px). Movimiento breve de confirmación, preferencia de movimiento reducido y colores forzados contemplados.

Se conserva la lógica de ID, fotos, color compatible, técnicas, zonas y reinicio de tallas al cambiar de silueta. No reasignar SKU o intercambiar fotos entre Caballero/Dama. No modificar renders originales ni especificaciones.

Prueba en Chrome aislado con catálogo local: ambas variantes, fotos correctas, colores/tallas, independencia entre tarjetas, agregado rápido, personalizador, foco y flechas;1440×1000,390×844 y375×844, movimiento reducido, sin errores JS/desbordamientos. No se envían pedidos. Recursos index.html: zain.css?v=20 y zain.js?v=28 para refrescar el navegador.
