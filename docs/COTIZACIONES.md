## Actualización vigente: fuentes recibidas y filtros de gestión — 15-oct-2026

Recibidos los cuatro PDF: Player y Tees72 páginas +5 de precios y Wusstek32+4,113 páginas en total. Originales e inventarioSHA256 fuera del Git público, en ZAIN/Proveedores/2026-10-15 Player y Tees y Wusstek. Estudio de ambas marcas y del nicho completado:55 SKU PT y23SKU W,183 filas impresas PT y60 tarifas W. Informe privado «Catálogo empresarial ZAIN2026»; selección y precios son documentales, no pruebas de stock o venta. No se incorporaron todavía prendas ni precios nuevos al servidor: renders en revisión por residuos en transparencia. No publicar imágenes con puntitos ni prometer réplica exacta. Mantener15 referenciasactivas: premium Caballero/Dama y13bolsas;29ocultas recuperables. Originales y pedidos archivados conservados.

JP pidió filtros también en catálogo/costos para dejar de ver referencias antiguas arriba. Gestión→Catálogo inicia en Activas; opciones Activas/Ocultas/Todas, categoría y orden Nombre/Categoría/SKU. Costos y cotizador: mismos filtros, búsqueda, Solo pendientes y orden pendientes primero. Al mostrar todas, activas primero. Filtrar u ordenar conserva importes sin guardar; filtros no alteran disponibilidad de la tienda. Productos nuevos se incorporan al cargar/actualizar. Ocultos se consultan expresamente.

Motor de costos preparado para bandas explícitas por talla y color; suma cantidades canónicas sin promediar/redondear antes de acumular. Las bandas son privadas, editables en configuración y borrador, con fuente documental. Faltas de talla/color/costo quedan pendientes, incluso con precio manual. Margen bruto y técnica por área sin cambios. Configuración area_tallas_v2 y borrador schema4, lectura histórica compatible y pestañas anteriores requieren recargar para guardar. El cliente conserva una partida combinada y no recibe bandas/costos/fuentes. Guardar precios no cambia cotizaciones históricas publicadas. Sin migración SQL ni cambios de permisos, usuarios o pedidos. Soporte genérico catalogo2026 valida tallas estructuradas en prendas estáticas nuevas; todavía sin altas nuevas.

Pruebas:105 aprobadas; navegador con fixtures sin pedidos reales, filtros activos/ocultos/categorías/orden y conservación de importes, costo mixto por talla y guardado de borrador,1280px y390px sin errores/desbordamiento. Fichas públicas muestran composición por color real y gramaje/tolerancia solo cuando existen. Este bloque prevalece sobre estados anteriores de PDF pendientes y tabla sin filtros. La publicación se verifica en el cierre de Cerebro.

# Cotizador privado y cotización del cliente

Vigente: 15-oct-2026. Decisión posterior de JP: usar margen bruto sobre venta; reemplaza el cálculo inicial por recargo. Autorizado por Juan Pablo: costos y precios internos, rangos editables, borrador automático para revisión, membrete ZAIN y publicación manual en Mi pedido. No se cargaron costos reales ni se aprobaron porcentajes comerciales definitivos. Márgenes válidos: 0% a 99.99%; 100% se rechaza. Costos de $100: precio $166.67 para 40%, $142.86 para 30%, antes de impuestos. Los descuentos y precios manuales cambian el margen final mostrado.

## Uso

1. Entrar a `/gestion-zain` → **Costos y cotizador**. Definir rangos contiguos desde 1 hasta un último rango sin límite. La propuesta inicial 1–14: 40%, 15–49: 35%, 50–99: 30%, 100+: 25% es editable; son **márgenes brutos objetivo sobre la venta**, no recargos sobre costo ni descuentos sucesivos. Continúan siendo una propuesta editable, no tarifas confirmadas. La aplicación automática empieza desactivada.
2. En **Costos de prendas**, todos los productos se muestran automáticamente con miniatura del render, nombre, silueta y referencias privadas. Capturar costo de prenda y otros por pieza en su fila, independiente de la técnica. Los pendientes se marcan en rojo; cero es un costo explícito. Hay búsqueda por nombre/SKU y filtro Solo pendientes. Al volver a abrir o actualizar la sección se incorporan los productos nuevos, incluidas las referencias ocultas. En **Tarifas de personalización**, definir costo MXN/cm² y preparación única para Bordado, Serigrafía y DTF. Tarifa admite cuatro decimales (0.0050); vacíos significan desconocidos y cero es un importe explícito. Costos reales deben incluir compra, maquila, flete de entrada, empaque, operación y merma según corresponda; captura esos conceptos en Otros o preparación y revisa cada diseño. Las referencias del proveedor permanecen privadas. Guardar no cambia cotizaciones existentes.
3. Activar el uso automático solo después de confirmar los costos. Al finalizar una nueva solicitud se intenta crear su borrador privado. Si falla esa preparación, la solicitud y el paso a WhatsApp se conservan y el panel reintenta al abrir el pedido. Solicitudes anteriores generan borrador al abrirlo. No se asegura que el cliente haya enviado su mensaje de WhatsApp.
4. Abrir un pedido y revisar **ancho de cobro, alto de cobro y tarifa por cm²**. Se propone el ancho solicitado del logo; el pedido no guarda su altura, por lo que debe confirmarse internamente. Nunca suponer un cuadrado ni inferir altura de la prenda. Completar costos pendientes, impuesto y condiciones; ajustar precio unitario manual o descuento por partida. Precio manual vacío conserva el cálculo. El impuesto no tiene una tasa fiscal predeterminada: el equipo elige expresamente una tasa o 0. La interfaz no determina obligaciones fiscales.
5. Guardar borrador, **Ver membrete**, revisar y **Publicar cotización revisada**. El cliente verá esa revisión en su enlace privado existente `/mi-pedido#ID/TOKEN`, con impresión/Guardar como PDF desde el navegador. No se envía ningún mensaje automático.
6. Editar otro borrador conserva la última revisión publicada hasta publicarla de nuevo. **Retirar del cliente** oculta la revisión, conservando los registros. Rehacer con costos actuales reemplaza ajustes del borrador, previa confirmación, sin cambiar la versión publicada.

## Cálculo

- Rangos por **partida**, sin acumular productos, diseños, colores o técnicas diferentes ni cambiar mínimos del catálogo.
- Área por aplicación y pieza = ancho × alto del rectángulo de cobro, no área de tinta/alpha. Dimensiones de 0.01 a 200 cm, hasta dos decimales. Aplicación por pieza = área × tarifa de su técnica, redondeada una vez al centavo.
- Costo partida = piezas × (prenda + aplicación calculada + otros) + preparación única. Se cotiza una aplicación de esa técnica por pieza en la zona de la partida. Si hay más zonas o trabajos, el equipo debe revisar su alcance; esta versión no inventa aplicaciones adicionales.
- El cliente recibe **una sola partida** con el precio combinado de prenda y personalización. No recibe tarifas por cm², área, dimensiones internas de cobro ni costos separados. Se conservan sus detalles de diseño ya disponibles.
- En un pedido se puede elegir **Importe fijo revisado / pza** si el taller cobra por puntadas, colores, pantallas o mínimos. Es una regla de costos configurable por ZAIN; no implica que todos los proveedores facturen por superficie.
- Precio sugerido unitario = costo partida / (1 − margen objetivo) / piezas, redondeado hacia arriba al centavo. La preparación ya queda distribuida; no se cobra dos veces. Precio manual sustituye el sugerido.
- Bruto = precio unitario × cantidad. Descuento adicional se calcula sobre ese bruto. Subtotal = partidas netas + envío cobrado. Impuesto sobre ese subtotal; total = subtotal + impuesto.
- Utilidad estimada = subtotal antes de impuesto − costos capturados, incluyendo costo interno de envío. Margen bruto = utilidad / subtotal. No es utilidad neta; gastos omitidos no se inventan. Si se trabaja con costos que incluyen impuestos, deben normalizarlos antes de capturar para no mezclar bases.
- Enteros: dinero en centavos, porcentajes en puntos base, medidas en centésimas de cm, tarifa en diezmilésimas de MXN y área en diezmilésimas de cm²; productos porcentuales con BigInt y redondeo a centavo. Se rechazan NaN, negativos, desbordes, índices/cantidades manipulados, descuentos >100% y rangos con huecos/traslapes. Costos pendientes o impuesto sin definir bloquean publicación. Una utilidad negativa se advierte; la revisión comercial sigue a cargo del equipo.
- Al bajar el margen objetivo por volumen, el total de un rango puede ser menor que el de una cantidad cercana del anterior. La interfaz lo avisa. Definir umbrales con costos y capacidad reales, sin prometer un porcentaje estándar de la industria.

## Privacidad, versiones y estados

Tablas `zain_precios_config`, `zain_cotizaciones`, `zain_cotizaciones_historial`: RLS activado, sin acceso directo de anon/authenticated; RPC security invoker revocadas a PUBLIC/anon/authenticated y permitidas solo a service_role. El servidor verifica identidad real, correo confirmado y autorización del equipo antes de leer/modificar costos. Los talleres siguen viendo exclusivamente sus partidas, nunca estos importes.

Consulta del cliente: valida su capacidad individual y que el pedido siga guardado/no archivado; lee únicamente `publicada`. Proyección explícita en JS y nuevamente en SQL, sin costos, utilidad, recargo, datos del distribuidor ni borradores. No hay enlace público de cotizaciones ni listado por folio.

Guardar/publicar/retirar usa bloqueo de pedido y cotización más versión optimista en una sola transacción. Cada versión de cotización conserva borrador/publicación/actor/evento en historial privado. Publicar mueve nuevo/contactado a cotizado y registra actividad; no retrocede producción/entrega, ni confirma pedido, pago o aceptación del cliente. No se publica para pedidos cancelados o archivados.

El membrete es HTML accesible y adaptable con el logo vectorial existente, Archivo, blanco, tinta oscura y acento azul. El navegador imprime A4/guarda PDF, sin servicios externos ni API de documentos. No contiene RFC, domicilio o razón social inventados. La marca comercial no se presenta como empresa registrada.

## Implementación y operación portable

- Motor compartido: `js/cotizacion-core.js`; servidor `server/cotizaciones.mjs`, integración `server/pedidos.mjs`.
- Gestión: `js/control-cotizaciones.js`; cliente: `js/cotizacion-cliente.js`; membrete/impresión `js/cotizacion-vista.js`; estilos `css/cotizaciones.css`.
- Migraciones aditivas `supabase/cotizaciones.sql` y `supabase/cotizaciones-margen.sql`; no toca productos o pedidos existentes al instalarse, ni elimina archivos. Configuración inicial desactivada y sin costos.
- Servidor portable: `ZAIN_COTIZACIONES_ENABLED=true`, junto a configuración existente. Generar Edge con `node server/preparar-edge.mjs`; publica los módulos generados y la web juntos. Un push no sustituye desplegar la función Supabase.
- Verificación: `node --test tests/*.test.mjs` (97 pruebas), incluidos centavos, preparación, descuento, tasa, datos faltantes, privacidad, versiones y revisión publicada conservada. Navegador aislado con fixtures locales: login → costos → borrador → membrete → publicar → cliente → impresión PDF; 1280×900 y 390×844, sin errores JS/desbordamiento. No se crearon pedidos ni costos reales para probar.

Pendiente de negocio: costos confirmados, rangos definitivos, impuesto aplicable, vigencia, condiciones comerciales y tarifas por cm² de bordado/DTF/serigrafía y preparación confirmadas con sus talleres. No se cargaron costos o tarifas reales ni se activó el uso automático. No activar publicidad por el solo hecho de instalar el cotizador.

Referencias para distinguir recargo y margen y comprobar que descuentos de volumen varían por producto (no tarifas para ZAIN): [QuickBooks](https://quickbooks.intuit.com/r/growing-a-business/markups-and-margins/), [Printful](https://help.printful.com/hc/en-us/articles/360014009700-Are-there-any-discounts-for-bulk-orders).

## Compatibilidad de la decisión posterior

Las publicaciones existentes no se recalculan. Las configuraciones de recargo anteriores se convierten a un margen equivalente y quedan pendientes de revisión con aplicación automática desactivada. Solo la configuración inicial intacta sin costos recibe los rangos propuestos 40/35/30/25. Los borradores schema1 conservan el precio anterior como manual al abrirse/guardarse; dejarlo vacío solicita el cálculo nuevo. El historial y los documentos publicados permanecen intactos. Schema2 identifica margen_bruto; margenObjetivo es privado y el margen final corresponde a utilidad/subtotal después del descuento.

## Costeo por superficie — decisión posterior de JP, 15-oct-2026

La configuración privada incorpora costeo=area_cm2_v1, prendas (SKU, prenda, otros) y tres técnicas (tarifaCm2, preparación). El JSON anterior se adapta al leer y se persiste al guardar el equipo; no requiere migración ni escritura masiva de datos. Las filas costos anteriores se conservan y pueden revisarse en Costos anteriores por pieza. Si se agrega ese SKU a prendas, las nuevas solicitudes usan área; las cotizaciones guardadas mantienen su modo/importes hasta editar o rehacer expresamente.

Borradores schema3 guardan modo area/fijo, ancho, alto y tarifa como valores privados congelados. Schema1/2 se adaptan a fijo, conservando los importes. Publicaciones e historial permanecen intactos. El servidor recalcula área y aplicación, sin confiar en importes derivados del navegador. Rechaza guardados desde pestañas antiguas para evitar que borren la nueva configuración. El uso automático desactivado omite tanto prendas como tarifas. Guardar una tarifa no recotiza pedidos existentes.

Verificación: 97 pruebas (incluidas tarifas subcentavo, tres técnicas, rectángulo no cuadrado, redondeos, pendientes, compatibilidad, pestaña antigua y no filtración al cliente). Navegador aislado con fixtures: captura tarifa0.0050, persistencia, rehacer, completar10×5cm=50cm², aplicación0.25MXN/pieza, margen, publicación y cliente/PDF sin cm² ni tarifas; celular390×844 y escritorio1280×900, sin errores JS/desbordamientos. No se usaron clientes o pedidos reales.

## Captura visual completa — decisión posterior de JP, 15-oct-2026

La tabla deriva sus filas del catálogo administrable y conserva las filas de costos guardadas. No requiere seleccionar/agregar cada SKU. Render pequeño a la izquierda (Sin render si no existe), nombre, silueta y SKU/proveedor privados. Ocultos se identifican. Fila sin costo de prenda: nombre, estado Costo pendiente y campo en rojo; costo0 explícito deja de estar pendiente. Búsqueda y Solo pendientes no alteran datos ni marcan cambios de costos; al guardar, los campos filtrados conservan sus importes.

Las filas nuevas sin costo y otros0 no se persisten automáticamente como una nueva configuración de prenda. Así se evita migrar inadvertidamente los costos históricos fijos a área con solo guardar rangos/tarifas. Filas antes guardadas se conservan, aunque se deje pendiente el costo. Los costos no se inventan ni se recotizan pedidos existentes. Productos nuevos aparecen al cargar/actualizar la sección; no se promete actualización en tiempo real de una pestaña ya abierta.

Verificación visual local con catálogo completo y fixture de producto nuevo: todas las filas, render, texto rojo,0 explícito, búsqueda, filtro, preservación de vacíos, nueva referencia sin alta manual, guardar y flujo de cotización. Escritorio1280×900 y celular390×844 sin errores JS/desbordamiento. No se crearon productos o costos reales.
