# Cotizador privado y cotización del cliente

Vigente: 15-oct-2026. Autorizado por Juan Pablo: costos y precios internos, rangos editables, borrador automático para revisión, membrete ZAIN y publicación manual en Mi pedido. No se cargaron costos reales ni se aprobaron porcentajes comerciales definitivos.

## Uso

1. Entrar a `/gestion-zain` → **Costos y cotizador**. Definir rangos contiguos desde 1 hasta un último rango sin límite. La propuesta inicial 1–14: 50%, 15–49: 45%, 50–99: 40%, 100+: 35% es editable; son **recargos sobre costo**, no margen ni descuentos sucesivos. La aplicación automática empieza desactivada.
2. Agregar costos por SKU ZAIN/técnica. Prenda y aplicación vacíos significan desconocidos; cero es un costo explícito. Otros por pieza y preparación única admiten cero. Costos reales deben incluir compra, maquila, flete de entrada, empaque, operación y merma según corresponda; captura esos conceptos en Otros o preparación y revisa cada diseño. Las referencias del proveedor permanecen privadas. Guardar no cambia cotizaciones existentes.
3. Activar el uso automático solo después de confirmar los costos. Al finalizar una nueva solicitud se intenta crear su borrador privado. Si falla esa preparación, la solicitud y el paso a WhatsApp se conservan y el panel reintenta al abrir el pedido. Solicitudes anteriores generan borrador al abrirlo. No se asegura que el cliente haya enviado su mensaje de WhatsApp.
4. Abrir un pedido, completar costos pendientes, impuesto y condiciones; ajustar precio unitario manual o descuento por partida. Precio manual vacío conserva el cálculo. El impuesto no tiene una tasa fiscal predeterminada: el equipo elige expresamente una tasa o 0. La interfaz no determina obligaciones fiscales.
5. Guardar borrador, **Ver membrete**, revisar y **Publicar cotización revisada**. El cliente verá esa revisión en su enlace privado existente `/mi-pedido#ID/TOKEN`, con impresión/Guardar como PDF desde el navegador. No se envía ningún mensaje automático.
6. Editar otro borrador conserva la última revisión publicada hasta publicarla de nuevo. **Retirar del cliente** oculta la revisión, conservando los registros. Rehacer con costos actuales reemplaza ajustes del borrador, previa confirmación, sin cambiar la versión publicada.

## Cálculo

- Rangos por **partida**, sin acumular productos, diseños, colores o técnicas diferentes ni cambiar mínimos del catálogo.
- Costo partida = piezas × (prenda + aplicación + otros) + preparación única.
- Precio sugerido unitario = costo partida × (1 + recargo) / piezas, redondeado hacia arriba al centavo. La preparación ya queda distribuida; no se cobra dos veces. Precio manual sustituye el sugerido.
- Bruto = precio unitario × cantidad. Descuento adicional se calcula sobre ese bruto. Subtotal = partidas netas + envío cobrado. Impuesto sobre ese subtotal; total = subtotal + impuesto.
- Utilidad estimada = subtotal antes de impuesto − costos capturados, incluyendo costo interno de envío. Margen bruto = utilidad / subtotal. No es utilidad neta; gastos omitidos no se inventan. Si se trabaja con costos que incluyen impuestos, deben normalizarlos antes de capturar para no mezclar bases.
- Enteros en centavos y puntos base; productos porcentuales con BigInt y redondeo a centavo. Se rechazan NaN, negativos, desbordes, índices/cantidades manipulados, descuentos >100% y rangos con huecos/traslapes. Costos pendientes o impuesto sin definir bloquean publicación. Una utilidad negativa se advierte; la revisión comercial sigue a cargo del equipo.
- Al bajar el recargo por volumen, el total de un rango puede ser menor que el de una cantidad cercana del anterior. La interfaz lo avisa. Definir umbrales con costos y capacidad reales, sin prometer un porcentaje estándar de la industria.

## Privacidad, versiones y estados

Tablas `zain_precios_config`, `zain_cotizaciones`, `zain_cotizaciones_historial`: RLS activado, sin acceso directo de anon/authenticated; RPC security invoker revocadas a PUBLIC/anon/authenticated y permitidas solo a service_role. El servidor verifica identidad real, correo confirmado y autorización del equipo antes de leer/modificar costos. Los talleres siguen viendo exclusivamente sus partidas, nunca estos importes.

Consulta del cliente: valida su capacidad individual y que el pedido siga guardado/no archivado; lee únicamente `publicada`. Proyección explícita en JS y nuevamente en SQL, sin costos, utilidad, recargo, datos del distribuidor ni borradores. No hay enlace público de cotizaciones ni listado por folio.

Guardar/publicar/retirar usa bloqueo de pedido y cotización más versión optimista en una sola transacción. Cada versión de cotización conserva borrador/publicación/actor/evento en historial privado. Publicar mueve nuevo/contactado a cotizado y registra actividad; no retrocede producción/entrega, ni confirma pedido, pago o aceptación del cliente. No se publica para pedidos cancelados o archivados.

El membrete es HTML accesible y adaptable con el logo vectorial existente, Archivo, blanco, tinta oscura y acento azul. El navegador imprime A4/guarda PDF, sin servicios externos ni API de documentos. No contiene RFC, domicilio o razón social inventados. La marca comercial no se presenta como empresa registrada.

## Implementación y operación portable

- Motor compartido: `js/cotizacion-core.js`; servidor `server/cotizaciones.mjs`, integración `server/pedidos.mjs`.
- Gestión: `js/control-cotizaciones.js`; cliente: `js/cotizacion-cliente.js`; membrete/impresión `js/cotizacion-vista.js`; estilos `css/cotizaciones.css`.
- Migración aditiva `supabase/cotizaciones.sql`; no toca productos o pedidos existentes al instalarse, ni elimina archivos. Configuración inicial desactivada y sin costos.
- Servidor portable: `ZAIN_COTIZACIONES_ENABLED=true`, junto a configuración existente. Generar Edge con `node server/preparar-edge.mjs`; publica los módulos generados y la web juntos. Un push no sustituye desplegar la función Supabase.
- Verificación: `node --test tests/*.test.mjs` (81 pruebas), incluidos centavos, preparación, descuento, tasa, datos faltantes, privacidad, versiones y revisión publicada conservada. Navegador aislado con fixtures locales: login → costos → borrador → membrete → publicar → cliente → impresión PDF; 1280×900 y 390×844, sin errores JS/desbordamiento. No se crearon pedidos ni costos reales para probar.

Pendiente de negocio: costos confirmados, rangos definitivos, impuesto aplicable, vigencia, condiciones comerciales y criterios de bordado/DTF/serigrafía por diseño. No activar publicidad por el solo hecho de instalar el cotizador.

Referencias para distinguir recargo y margen y comprobar que descuentos de volumen varían por producto (no tarifas para ZAIN): [QuickBooks](https://quickbooks.intuit.com/r/growing-a-business/markups-and-margins/), [Printful](https://help.printful.com/hc/en-us/articles/360014009700-Are-there-any-discounts-for-bulk-orders).
