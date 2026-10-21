# Cotizaciones por modelo y tallas

Acceso: Gestión → Cotizaciones, solo para el equipo autorizado. Permite preparar una cotización sin crear una solicitud desde el catálogo y sin capturar cantidades. El mínimo público de 12 piezas por pedido sigue intacto.

1. Subir un logo PNG, JPG, WEBP o SVG, opcional si se ofrece solo la prenda. Se prepara con el mismo motor del personalizador; quitar fondo es opcional. El original no se modifica ni se sube al servidor.
2. Seleccionar uno o más modelos. Tallas y colores proceden del catálogo vigente; costos, tramos de compra y tarifas vienen de la configuración privada existente.
3. Elegir técnica, color de vista, zona, ancho y alto. El alto se propone según la proporción del logo y admite corrección. La aplicación usa tarifa por cm² o importe fijo revisado por pieza. Las vistas son ilustrativas.
4. Definir un margen bruto por modelo o por rango, o escribir un precio directo por rango. Fórmula y redondeo en centavos: costo / (1 − margen), redondeado hacia arriba; margen menor a100%. El precio directo prevalece. Costos incompletos dejan utilidad pendiente, pero permiten precio directo.
5. Si los costos varían por volumen, se presentan todos los tramos como referencia sin pedir una cantidad. Se pueden excluir filas. Huecos documentales siguen pendientes. No se selecciona automáticamente el tramo más barato.
6. Confirmar IVA expresamente y capturar condiciones/cliente si corresponde. Ponchado o preparación se capturan como un cargo único de toda la cotización, sin repartirse entre prendas ni duplicarse por modelo.
7. Copiar el texto comercial o descargar PDF con diseños, modelos, tallas y precios por pieza. La proyección comercial enumera campos; excluye costos, utilidad, márgenes, tarifas y referencias de proveedor.

La composición vive solo en memoria mientras la página esté abierta. Descargar el PDF permite conservarla. Actualizar modelos y costos reinicia la composición con confirmación si había modelos. Salir del equipo borra la composición, el logo y los datos privados en memoria. Sin cambios a pedidos, cuentas, costos guardados, publicación de catálogo ni reglas de compra.

Archivos: js/cotizacion-modelos.js (cálculos/proyección), js/control-cotizaciones-modelos.js (interfaz/logo), js/cotizacion-modelos-pdf.js, css/cotizacion-modelos.css. No requiere migración ni despliegue de Edge. Los recursos nuevos se incluyen únicamente desde gestion-zain.html.
