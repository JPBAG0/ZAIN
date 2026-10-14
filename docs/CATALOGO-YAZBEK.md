## Decisión vigente: gestión visual, papelera y catálogo activo — 14-oct-2026

JP pidió reorganizar el panel, ocultar cinco productos iniciales sin eliminarlos, mantener la gorra y cambiar nombres que identificaban al proveedor. Originales desactivados: playera, polo, camisa, chamarra y sudadera. Sus datos, imágenes, SKU y pedidos existentes se conservan; nuevas solicitudes no los admiten. Reactivar cambiando activo=true en server/config-interno.cjs y regenerando catálogo público y Edge. No reasignar SKU.

Catálogo visible: 39 referencias (25 prendas actuales, 13 bolsas, gorra), 14 familias de prendas y seis categorías activas. Cinco referencias desactivadas en productosHistoricos, fuera de catálogo/editor; servidor permite reintento solo de un folio previo autorizado con igual contenido. Portada: Polo clásico, Playera premium, gorra, Sudadera canguro, Bolsa Expo, Camisa ejecutiva. Nombres: Playera esencial/premium/deportiva; Polo clásico/ligero/ligero manga larga; Camisa ejecutiva/de trabajo (corta/larga), Camisa denim; Sudadera con cierre/canguro/cuello alto. Son nombres ZAIN, no certificaciones. Datos técnicos/SKU intactos; proveedor en ficha interna, nombres comerciales en seguimiento, WhatsApp y catálogo.

Panel /gestion-zain: tarjetas de Solicitudes esta semana, Por revisar, Confirmados y En producción; pulsarlas filtra la tabla. Semana desde lunes en CDMX calculada en Postgres. Otros contadores: estados actuales de todos los pedidos guardados y no retirados; no ventas cobradas ni importes. Tabla de 20 por página, folio/fecha/selección/cantidad/estado, filtros de folio/estado/semana, Activos/Papelera. Ficha lateral/modal responsive con imágenes, descargas, notas, enlace de cliente, cambio de estado y últimos 100 eventos.

Eliminar exige escribir el folio; mueve a papelera y permite restaurar. No DELETE de filas ni Storage. SQL supabase/panel-gestion.sql añade archivado_at y funciones de resumen/archivo, security invoker, rol service_role, bloqueo de fila/versiones. Seguimiento de cliente en papelera no funciona hasta restaurar; estados/archivos conservados e historial de retiro/restauración. No se retiraron pedidos reales.

Migración panel_resumen_y_papelera_zain aplicada al proyecto dedicado. Resumen real verificado en lectura SQL; permisos directos anon/authenticated denegados. 44 pruebas aprobadas; prueba visual local con datos ficticios sin archivar/restaurar en producción; login oculto, papelera y 390×844/1280×800 comprobados. Catálogo sin errores y seis muestras actuales. Publicación comprobada: commit 83560f4, Vercel success y Edge zain-pedidos versión 11 ACTIVE. Catálogo público con 39 activas/5 ocultas, seis muestras actuales y nombres sin referencias del proveedor. Panel nuevo presente; resumen sin login devuelve 401. Pruebas de tarjetas/ficha/papelera/restauración en simulación local; ningún pedido real retirado.

Envíos: JP pidió solo planear. docs/SEGUIMIENTO-ENVIOS-PLAN.md recomienda primera etapa transportista + guía/talón + enlace oficial en /mi-pedido. Segunda: API/webhooks verificados de Skydropx/DHL, hitos reales y última actualización. No implementado ni guías compradas.

Antes de publicidad: completar responsable/domicilio del aviso; IDs de Ads/conversiones y validación en cuenta/Tag Assistant antes de gastar; stock, mínimos de prendas, cotización/plazos; alta del amigo cuando JP dé su correo. Auditor Supabase: aviso existente de protección de contraseñas filtradas desactivada, [documentación](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). No se cambió Auth ni se contrató un plan.


## Decisión vigente: SKU ZAIN, proveedor interno y galería — 14-oct-2026

JP pidió que clientes vean referencias propias de ZAIN y que Yazbek/código del fabricante queden en el panel del equipo. Cada una de las 44 referencias tiene SKU persistente ZN-<categoría>-<número>; no renumerarlos al reordenar el catálogo. El servidor conserva IDs antiguos y admite los ID públicos; los pedidos existentes no se reescriben. El frontend adapta borradores anteriores por identificador de compatibilidad, conservando originales locales.

Fuente técnica: server/config-interno.cjs. Generar el catálogo público con node server/preparar-catalogo.mjs; después generar y desplegar Edge con node server/preparar-edge.mjs. js/config.js es un archivo generado, sin fabricante, códigos de modelo/color, fuentes o rutas Yazbek; no editarlo a mano. El seguimiento usa una lista permitida y nombres comerciales; el panel autorizado conserva referencia interna y agrega SKU. Esto reduce información mostrada y enviada al navegador; no convierte el historial de un repositorio público ni una fotografía conocida en secretos.

Las 25 referencias nuevas conservan la prenda IA como primera imagen. Una galería manual con flechas muestra la foto original recortada del PDF como segunda imagen, exacta para la silueta seleccionada. No teñir esa foto ni sustituir renders. Las seis prendas originales y bolsas mantienen su foto existente; no inventar fotografías con personas para artículos sin referencia equivalente. Las fotos ya recortadas y comprobadas se copiaron sin alteración a img/productos/zain/<sku>-modelo.webp; renders a <sku>-render.webp. Fotografías de origen y renders originales conservados.

“Tu logo” sin archivo responde a tinta elegida, HEX y color de texto; Original conserva contraste automático. El mensaje WhatsApp incluye SKU ZAIN y nombres/colores comerciales. Fotos con modelo conservan su color original aunque la selección de pedido sea otra; la etiqueta “Foto de referencia” lo distingue.

Validación: 36 pruebas aprobadas; todas las combinaciones de modelos, colores y tallas se derivan canónicamente; cliente sin referencias internas, equipo con ellas. 25 fotos cargadas; selector Caballero/Dama y flechas verificados; logo amarillo sin archivo observado en canvas. Celular 390×844 y escritorio 1280×800 sin desbordamiento. Supabase zain-pedidos versión 10 ACTIVE, manteniendo autorización propia existente y Storage privado. No se modificaron pedidos reales ni se enviaron mensajes. JP confirmó que cancelará desde el panel la prueba anterior NO COTIZAR; su ejecución no se da por verificada.

Publicación web comprobada: commit 688e905 en la rama de producción; Vercel success. URL pública con 44 referencias, 25 fotos adicionales, sin datos de proveedor en catálogo. Rutas /server/config-interno.cjs y /supabase/functions/zain-pedidos/catalogo.mjs devuelven 404; panel anónimo 401. Una prueba POST en producción fue rechazada por revisión automática y no ejecutada; no se creó otro pedido. Validación equivalente local aprobada.


# Catálogo ZAIN — prendas Yazbek

## Decisión vigente: renders aprobados, contornos limpios y categorías — 14-oct-2026

Después de revisar la galería de pruebas, JP autorizó explícitamente publicar las 14 familias / 25 referencias de prendas IA y pidió limpiar los puntos/manchas en contornos de las prendas anteriores. Esta autorización posterior reemplaza la pausa por exigencia de réplica exacta. Las imágenes siguen siendo ilustrativas: no llamarlas fotografías oficiales o réplicas verificadas del fabricante.

Se conservan los seis productos originales y sus IDs, colores, tallas y técnicas; sus archivos de imagen originales se mantienen intactos. Se usan versiones nuevas con limpieza IA de recorte en `img/productos/originales-limpios/`, sin retirar productos. Los 25 modelos nuevos están en `img/productos/yazbek-ia/`. Fuentes, prompts y hashes en `docs/IMAGENES-YAZBEK-IA.json` y `docs/IMAGENES-ORIGINALES-LIMPIAS.json`. La limpieza fue realizada con `image_gen` integrada; no se sustituyó por dibujos SVG. El motor omite ruido casi transparente en esas imágenes y conserva pliegues al cambiar de color.

Catálogo: 44 referencias (6 originales + 25 nuevas + 13 bolsas); 20 fichas de prendas en la vista inicial y una entrada Bolsas. Categorías ordenadas: Playeras, Polos, Camisas, Sudaderas, Chamarras, Gorras y Bolsas. Caballero/dama dentro de una ficha donde corresponde; sudaderas Adultos. Las bolsas mantienen Expo como entrada, sus fotografías/datos y mínimo de 100 por modelo/color, incrementos de 50.

Verificación: 34 pruebas aprobadas; las 31 imágenes de prendas cargan y se tiñen en negro, blanco y rojo. Comparación visual antes/después confirma eliminación de puntos blancos de axilas/mangas, especialmente sudadera/chamarra. Filtros y variantes comprobados en móvil; sin desbordamiento. Prueba sintética de cinco polos D0550 Rojo 413 guardó el logo original y render, dio seguimiento y descargas 200, y vació el carrito. Ningún mensaje WhatsApp real: navegación interceptada. La solicitud está marcada NO COTIZAR; su cancelación administrativa quedó solicitada a JP porque el conector SQL falló y una limpieza temporal en Edge fue rechazada. No se cambió ningún pedido real.

API `zain-pedidos` versión 9 ACTIVE, sin código de limpieza temporal, permisos/RLS/Storage privado conservados. Catálogo `originales-mas-yazbek-ia-2026-10-14`. Publicación comprobada: GitHub `c4efec9` en la rama de producción `claude/zain-website-deploy-d85pzy`, Vercel success y URL pública `https://zain-amber-sigma.vercel.app/?v=c4efec9#catalogo`. Navegador público: 44 referencias, 21 tarjetas iniciales, 6 versiones corregidas y 25 imágenes IA nuevas; siete categorías. Móvil 390×844 y escritorio 1280×800 sin desbordamiento. Árbol Git limpio tras publicación. El registro posterior de esta comprobación solo modifica documentación.

Pendientes comerciales: stock/costos, técnica por tejido y aprobación de impresión; tonos de pantalla aproximados, sin equivalencias Pantone oficiales. Las categorías no expresan rankings de ventas o margen. Ads, privacidad, precios y presupuestos no cambiaron.

## Datos verificados del proveedor

| Familia | Referencias y siluetas | Colores publicados: código y nombre | Tallas | Página física PDF |
|---|---|---|---|---|
| Polo piqué manga corta | C0550 (Caballero) / D0550 (Dama) | 415 Negro; 414 Marino; 100 Blanco; 102 Gris Jaspe; 421 Royal; 413 Rojo; 420 Jade | C0550: CH–EEG / D0550: CH–EG | 20 |
| Camisa Oxford manga larga | C0605 (Caballero) / D0605 (Dama) | 700 Blanco; 701 Azul Cielo; 703 Gris; 704 Cobalto; 705 Rosa | C0605: CH–EEG / D0605: CH–EEG | 40 |
| Playera básica 155 g | C0200 (Caballero) / D0200 (Dama) | 415 Negro; 414 Marino; 100 Blanco; 102 Gris Jaspe; 421 Royal; 413 Rojo | C0200: CH–EEEG / D0200: CH–EEG | 6 |
| Playera peso completo 195 g | C0300 (Caballero) / D0300 (Dama) | 415 Negro; 414 Marino; 100 Blanco; 102 Gris Jaspe; 421 Royal; 413 Rojo; 420 Jade | C0300: CH–EEEG / D0300: CH–EG | 10, 11 |
| Camisa gabardina manga corta | C0606 (Caballero) / D0606 (Dama) | 415 Negro; 414 Marino; 100 Blanco; 200 Beige; 213 Azul Francia; 413 Rojo | C0606: CH–EEG / D0606: CH–EEG | 41 |
| Camisa gabardina manga larga | C0607 (Caballero) / D0607 (Dama) | 415 Negro; 414 Marino; 426 Gris; 100 Blanco; 200 Beige; 213 Azul Francia; 425 Vino; 413 Rojo | C0607: CH–EEG / D0607: CH–EEG | 42 |
| Camisa Oxford manga corta | C0604 (Caballero) / D0604 (Dama) | 700 Blanco; 701 Azul Cielo | C0604: CH–EEG / D0604: CH–EEG | 39 |
| Polo ActiviTee manga corta | C1502 (Caballero) / D1502 (Dama) | 415 Negro; 414 Marino; 426 Gris; 100 Blanco; 421 Royal; 413 Rojo | C1502: CH–EEG / D1502: CH–EG | 27 |
| Playera ActiviTee manga corta | C1302 (Caballero) / D1302 (Dama) | 415 Negro; 414 Marino; 426 Gris; 100 Blanco; 421 Royal; 413 Rojo | C1302: CH–EEG / D1302: CH–EG | 24 |
| Sudadera con capucha y cierre | C0702 (Adultos) | 415 Negro; 414 Marino; 102 Gris Jaspe; 2415 Negro Jaspe | C0702: CH–EEG | 31 |
| Camisa mezclilla manga larga | C0601 (Caballero) / D0601 (Dama) | 652 Índigo Claro | C0601: CH–EEG / D0601: CH–EEG | 36 |
| Sudadera con capucha y cangurera | C0701 (Adultos) | 415 Negro; 414 Marino; 102 Gris Jaspe; 230 Arena; 427 Verde Bosque | C0701: CH–EEG | 30 |
| Sudadera con ¼ de cierre | C0703 (Adultos) | 415 Negro; 414 Marino; 2415 Negro Jaspe | C0703: CH–EEG | 31 |
| Polo ActiviTee manga larga | C1504 (Caballero) / D1504 (Dama) | 415 Negro; 414 Marino; 100 Blanco | C1504: CH–EEG / D1504: CH–EG | 28 |

El PDF completo y las guías de tallas fueron revisados. Las imágenes IA son ilustrativas, no fotografías oficiales. La ficha usa códigos y combinaciones de color/talla verificadas.
