# Cotizaciones por modelo y tallas

Acceso: Gestión → Cotizaciones, solo para el equipo autorizado. Permite preparar una cotización sin crear una solicitud desde el catálogo y sin capturar cantidades. El mínimo público de 12 piezas por pedido sigue intacto.

Pantalla en 4 pasos numerados y una barra fija abajo con el avance («2 modelos · 6 de 6 precios listos»), Copiar texto y Descargar PDF.

1. **Cliente y condiciones.** Cliente (opcional), IVA (por defecto «Más IVA 16%»), redondeo de precios (por defecto a peso cerrado; también múltiplos de $5 o sin redondeo), Válida hasta (por defecto hoy + 15 días) y Entrega (opcional). Vigencia y entrega llegan al PDF y al texto.
2. **Logo del cliente.** PNG, JPG, WEBP o SVG, opcional si se ofrece solo la prenda. Se prepara con el mismo motor del personalizador; quitar fondo es opcional. El original no se modifica ni se sube al servidor.
3. **Modelos.** Buscar (Enter agrega el primero) y agregar. Tallas y colores proceden del catálogo vigente; costos, tramos y tarifas vienen de la configuración privada existente. Por modelo: técnica, color de vista, zona y ancho; alto y tarifa quedan en «Alto y costo de la personalización» (el alto sigue la proporción del logo hasta que se cambie). Las vistas son ilustrativas.
   - **Margen:** cada modelo arranca con el margen del primer rango de Costos y se puede cambiar por modelo. Precio sugerido = costo / (1 − margen), hacia arriba y luego redondeado hacia arriba según el paso 1.
   - **Precio por talla:** el campo muestra el sugerido; escribir un número lo fija para esa fila (se marca «Precio escrito · sugerido $X»); borrarlo vuelve al margen. Se ve costo y utilidad por pieza (en rojo si es negativa). El redondeo nunca altera un precio escrito.
   - Si los costos varían por volumen, cada tramo aparece como «Pedido de 1 a 49 piezas» / «Pedido de 50 piezas o más», sin pedir cantidad. Se pueden quitar filas con la casilla. No se elige automáticamente el tramo más barato.
4. **Cargo único y notas.** Ponchado o preparación como cargo único de toda la cotización, sin repartirse entre prendas ni duplicarse por modelo; condiciones o notas para el cliente.

PDF con el membrete v3 (mismo generador js/cotizacion-pdf.js, modo `sinCantidades`): folio de referencia `COT-AAMMDD-HHMM` (hora CDMX; no es consecutivo ni se guarda), «Desde $X / pza» en portada y resumen en lugar de un total, vigencia y entrega capturadas, diseños, modelos, tallas y precios por pieza. La proyección comercial enumera campos; excluye costos, utilidad, márgenes, tarifas y referencias de proveedor.

La composición vive solo en memoria mientras la página esté abierta. Descargar el PDF permite conservarla. Actualizar modelos y costos reinicia la composición con confirmación si había modelos. Salir del equipo borra la composición, el logo y los datos privados en memoria. Sin cambios a pedidos, cuentas, costos guardados, publicación de catálogo ni reglas de compra.

Archivos: js/cotizacion-modelos.js (cálculos/proyección/redondeo), js/control-cotizaciones-modelos.js (interfaz/logo), js/cotizacion-modelos-pdf.js, css/cotizacion-modelos.css. No requiere migración ni despliegue de Edge. Los recursos nuevos se incluyen únicamente desde gestion-zain.html.
