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

Anticipo (%) en el paso 1 (50 por defecto; vacío = «se acuerda»): sale en el texto y en el paso 2 de «Cómo seguimos» del PDF. En modo sin cantidades el PDF ya no lleva los recuadros «Resumen» y «Cómo se paga» (repetían datos); con pocos modelos cabe en una hoja.

## Guardadas (desde 21-oct-2026)
- Lista arriba con folio consecutivo `COT-0001…` (lo da la base), cliente, estado, modelos, «desde» y fecha; búsqueda y «Ver descartadas». **Nueva cotización**, **Abrir** (tocar la fila) y **Duplicar** (copia con folio nuevo al guardarla; vigencia se reinicia a hoy+15).
- Estados: Borrador → Enviada → Autorizada; Descartada la oculta (nunca se borra). «Convertida en pedido» la pone la conversión (siguiente fase) y bloquea la edición.
- **Guardar** en la barra fija. Copiar texto o Descargar PDF guardan antes y, si era borrador, la pasan a Enviada; el PDF usa el folio guardado. Aviso al salir con cambios sin guardar.
- Se guardan los valores tal como están en pantalla (también incompletos), la última proyección comercial (`comercial`, sin costos) y el logo original en el bucket privado `zain-cotizaciones-logos` (subida firmada directa, ≤15 MB, carpeta `<id cotización>/`).
- **Precio cotizado:** al abrir, si un precio que salía del margen cambió con los costos actuales, se fija el precio guardado y se avisa cuántos. Duplicar sí recalcula.
- Concurrencia por `version`: si un compañero guardó antes, pide abrirla de nuevo.

Servidor: `server/cotizaciones-modelos.mjs` (ops `cm-lista`, `cm-leer`, `cm-guardar`, `cm-estado`, `cm-logo-subida`, solo equipo; prefijo `cm-` para no caer en el enrutador de `cotizacion*`). Migración `supabase/cotizaciones-modelos.sql` (aplicada 21-oct-2026): tabla `zain_cotizaciones_modelos` con RLS y solo `service_role`, bucket privado. Edge `zain-pedidos` desplegado con `node server/preparar-edge.mjs` + `npx supabase functions deploy zain-pedidos --project-ref upzecgfgdtllxdhshhkd --use-api --no-verify-jwt` (antes se comprobó que la v44 en línea era idéntica al repo).

Actualizar modelos y costos quita los modelos en pantalla (lo guardado se conserva). Salir del equipo limpia todo lo que está en memoria. Sin cambios a pedidos, cuentas, costos guardados, publicación de catálogo ni reglas de compra.

Archivos: js/cotizacion-modelos.js (cálculos/proyección/redondeo/anticipo), js/control-cotizaciones-modelos.js (interfaz/logo/guardado), js/cotizacion-modelos-pdf.js, css/cotizacion-modelos.css, server/cotizaciones-modelos.mjs. Los recursos nuevos se incluyen únicamente desde gestion-zain.html.
