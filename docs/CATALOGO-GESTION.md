## Actualización vigente: fuentes recibidas y filtros de gestión — 15-oct-2026

Recibidos los cuatro PDF: Player y Tees72 páginas +5 de precios y Wusstek32+4,113 páginas en total. Originales e inventarioSHA256 fuera del Git público, en ZAIN/Proveedores/2026-10-15 Player y Tees y Wusstek. Estudio de ambas marcas y del nicho completado:55 SKU PT y23SKU W,183 filas impresas PT y60 tarifas W. Informe privado «Catálogo empresarial ZAIN2026»; selección y precios son documentales, no pruebas de stock o venta. No se incorporaron todavía prendas ni precios nuevos al servidor: renders en revisión por residuos en transparencia. No publicar imágenes con puntitos ni prometer réplica exacta. Mantener15 referenciasactivas: premium Caballero/Dama y13bolsas;29ocultas recuperables. Originales y pedidos archivados conservados.

JP pidió filtros también en catálogo/costos para dejar de ver referencias antiguas arriba. Gestión→Catálogo inicia en Activas; opciones Activas/Ocultas/Todas, categoría y orden Nombre/Categoría/SKU. Costos y cotizador: mismos filtros, búsqueda, Solo pendientes y orden pendientes primero. Al mostrar todas, activas primero. Filtrar u ordenar conserva importes sin guardar; filtros no alteran disponibilidad de la tienda. Productos nuevos se incorporan al cargar/actualizar. Ocultos se consultan expresamente.

Motor de costos preparado para bandas explícitas por talla y color; suma cantidades canónicas sin promediar/redondear antes de acumular. Las bandas son privadas, editables en configuración y borrador, con fuente documental. Faltas de talla/color/costo quedan pendientes, incluso con precio manual. Margen bruto y técnica por área sin cambios. Configuración area_tallas_v2 y borrador schema4, lectura histórica compatible y pestañas anteriores requieren recargar para guardar. El cliente conserva una partida combinada y no recibe bandas/costos/fuentes. Guardar precios no cambia cotizaciones históricas publicadas. Sin migración SQL ni cambios de permisos, usuarios o pedidos. Soporte genérico catalogo2026 valida tallas estructuradas en prendas estáticas nuevas; todavía sin altas nuevas.

Pruebas:105 aprobadas; navegador con fixtures sin pedidos reales, filtros activos/ocultos/categorías/orden y conservación de importes, costo mixto por talla y guardado de borrador,1280px y390px sin errores/desbordamiento. Fichas públicas muestran composición por color real y gramaje/tolerancia solo cuando existen. Este bloque prevalece sobre estados anteriores de PDF pendientes y tabla sin filtros. La publicación se verifica en el cierre de Cerebro.

# Altas propias — decisión vigente 14-oct-2026

Se pueden crear productos y categorías desde Gestión → Catálogo. Elegir colores, tallas, técnicas y cantidades; referencias de compras privadas. Tres opciones de imagen: reutilizar, subir render transparente o solicitar a Codex local. Cada producto empieza como borrador oculto. Revisar la imagen y activar manualmente; render protegido tras primera publicación. SKU ZN-NP generado por servidor. Ver RENDERS-LOCALES.md y TALLERES.md.

# Catálogo administrable de ZAIN

Actualizado: 14-oct-2026. Esta operación prevalece sobre la reactivación manual descrita en documentación anterior.

## Uso del equipo

Entrar a /gestion-zain y elegir **Catálogo**. El panel incluye las 44 referencias originales, aunque estén ocultas. Buscar por nombre, SKU ZAIN, proveedor o SKU del proveedor; filtrar Activas/Ocultas.

- **Visible** publica u oculta esa referencia. No elimina el producto, el render ni los pedidos previos. Las siluetas Caballero/Dama son publicaciones separadas: desactivar ambas para retirar toda una familia.
- **Editar** permite cambiar nombre comercial, descripción, especificaciones adicionales, disponibilidad, tejido, composición, gramaje, medidas, proveedor y SKU del proveedor. Los textos públicos no deben contener referencias privadas que se quiera mantener internas.
- **Cambiar foto** prepara una segunda imagen de referencia JPG/PNG/WEBP (entrada hasta 20 MB y 40 megapíxeles), la convierte a WEBP hasta 1600 px sin metadatos y la sube al bucket de fotos del catálogo. Solo se vincula a la publicación al pulsar **Guardar y publicar**. Las fotos del catálogo son públicas; no subir datos personales ni logos de clientes aquí.
- **Usar foto original** restaura la fotografía base al guardar. Si ese modelo no tenía segunda foto, vuelve a quedar con su render solamente.
- El render de personalización, SKU ZAIN, tallas, paletas y mínimos permanecen protegidos. No se editan desde esta pantalla. La composición editada aplica a todos los colores; las medidas editadas sustituyen el texto y dimensiones anteriores.
- Cambios simultáneos se controlan por versión. Si otro miembro guardó antes, cerrar el borrador y actualizar antes de reintentar; no se sobrescribe silenciosamente.

## Referencias de compras y pedidos

ZAIN SKU sigue siendo persistente: no renumerar ni reutilizar. Se retiró del frente de las tarjetas del catálogo; aparece en especificaciones completas, pedido, WhatsApp y seguimiento. El panel del equipo muestra además proveedor y SKU proveedor. Yazbek y sus códigos iniciales vienen de la fuente técnica; bolsas/originales sin proveedor confirmado dicen **Por registrar**.

Los pedidos nuevos guardan una copia del nombre comercial y ambas referencias al crearse. Cambiar el catálogo después no cambia esa solicitud. Los pedidos anteriores conservan sus datos, y el panel obtiene sus referencias existentes de la fuente original. Los reintentos con el mismo ID requieren el secreto y contenido original; una publicación hoy oculta no impide completar un folio ya registrado y autorizado. Las altas nuevas de un modelo oculto se rechazan.

## Datos y migración

Fuente base: server/config-interno.cjs; genera js/config.js con server/preparar-catalogo.mjs. Encima se aplican las ediciones de Supabase, sin sobrescribir la fuente ni los archivos de imagen. La web espera catalogo-publico al arrancar; si no puede verificarlo muestra aviso de disponibilidad y contacto, evitando publicar modelos desactivados desde una copia vieja. Una pestaña ya abierta refleja cambios al recargar.

Migración catalogo_editable_zain_equipo aplicada desde supabase/catalogo-gestion.sql:

- zain_catalogo_ediciones: cambios de campos permitidos y versión por ID público.
- zain_catalogo_fotos: registro privado de los objetos públicos de referencia.
- zain_catalogo_historial: actor/fecha/cambios por guardado.
- zain_guardar_catalogo: bloqueo de fila, comparación de versión, verificación de foto del mismo producto y auditoría.
- zain-catalogo-fotos: bucket público exclusivo de fotografías de referencia WEBP, hasta 4 MB.
- zain-pedidos: sigue privado, reservado a logos/renders de solicitudes.

Las tres tablas tienen RLS y privilegios revocados a anon/authenticated; son accesibles solo mediante la API que valida usuario confirmado, acceso aprobado y equipo activo. La RPC admite solo service_role; no es security definer. Escrituras directas al bucket de catálogo se bloquean para visitantes/usuarios. El servidor valida ID, campos, MIME, bytes y ruta generada; no acepta URLs arbitrarias, SVG ni reemplazar archivos de render.

La función Supabase conserva verify_jwt=false y la autorización propia existente, necesaria para la creación pública y la consulta por capacidad. La edición pasa por staff antes de leer/escribir archivos o tablas.

Supabase zain-pedidos **versión 13 ACTIVE**. El generador ahora incluye index.ts, pedidos.mjs, catalogo.mjs, publico.mjs y catalogo-gestion.mjs. El push web no despliega Edge. Para Node, además de las variables existentes, configurar **ZAIN_CATALOGO_ENABLED=true**. Mantener las tablas/fotos al mover hosting; no necesita un servidor mensual adicional.

## Verificación

55 pruebas aprobadas: campos protegidos, permisos, versiones, fotos de otra referencia, composición sin IDs internos, activación y ocultamiento, pedidos anteriores, snapshots y cliente sin datos del proveedor. Pruebas de navegador con datos ficticios locales: filtros, editar, guardar, palomita, normalización de foto y limpieza de sesión, escritorio y 390×844 sin desbordamiento. No se crearon pedidos, no se modificaron publicaciones ni se subieron fotos de prueba en producción.

En producción, la API pública devuelve 39 activas/5 ocultas sin campos de proveedor; catálogo privado anónimo devuelve 401. Lectura SQL comprobó tablas privadas y bucket de pedidos privado. El auditor informa RLS sin políticas en las tres tablas: denegación intencional para acceso directo, por API/service_role. Referencia: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy . Aviso previo de contraseñas filtradas desactivado: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . Auth no cambió.

La creación de referencias nuevas, modificar renders/tallas/colores, guías de envío y activar Google Ads no forman parte de esta pantalla. El plan de envíos sigue en docs/SEGUIMIENTO-ENVIOS-PLAN.md.

## Publicación comprobada — 14-oct-2026

Implementación 3eed969; publicación web 776bdc7 en claude/zain-website-deploy-d85pzy, Vercel success. Función Supabase v13 ACTIVE. URL pública comprobada: 39 referencias activas y 5 ocultas, 6 muestras de portada; sin SKU al frente de tarjetas y con SKU en la ficha de personalización. Panel publicado con pestaña Catálogo/editor, área privada oculta sin sesión; endpoint privado 401 y fuente de servidor 404. Navegador de producción sin errores ni desbordamiento en 1280×800 y 390×844. Ediciones, foto y palomita probadas con datos ficticios locales; no se modificaron publicaciones/pedidos reales para verificar. Las tablas de edición/fotos permanecían sin registros al cierre de las pruebas.

## Decisión vigente: técnicas editables, bolsas unificadas y regreso al inicio — 14-oct-2026

JP eligió **todas las bolsas visibles en “Todos”**. Se muestran las 13 fichas individuales junto a las familias de prendas; los filtros siguen visibles, también en Bolsas, sin una tarjeta intermedia “Ver bolsas”. En “Todos” son 28 fichas (familias agrupadas y bolsas), que representan las 39 referencias activas. #bolsas abre su filtro en el mismo catálogo.

Botón circular **Volver arriba** en la tienda y en /gestion-zain, visible después de bajar aproximadamente una pantalla. En tienda queda encima de WhatsApp, con espacio; se oculta bajo carrito/diálogos. Desplazamiento suave o inmediato con movimiento reducido; etiqueta accesible y foco al encabezado.

Playera premium de caballero ZN-PL-004: el render base turquesa se corrigió a blanco neutro con image_gen integrada, preservando corte/costuras/pliegues y transparencia. Original intacto; nuevo archivo versionado y WEBP lossless. No se sustituyeron otras prendas ni fotos secundarias. Tinte/color elegidos por cliente siguen funcionando.

Gestión → Catálogo → Editar ahora incluye botones múltiples **Bordado / Serigrafía / DTF**. Activos: negro con texto blanco. Guardar y publicar aplica las técnicas a esa referencia/silueta. Al menos una técnica; selección y variantes no cambian solas. El cliente ve las asignadas en la ficha y editor; servidor rechaza una desactivada para pedidos nuevos. Solicitudes previas conservan su técnica y reintentos autorizados. Esta decisión reemplaza proteger las técnicas como campo fijo.

Migración catalogo_tecnicas_editables_zain aplicada: mismos permisos privados, versión/bloqueo e historial; solo tres IDs permitidos, sin duplicados ni lista vacía. 59 pruebas aprobadas; pruebas locales con datos ficticios de selección múltiple, desactivación, reflejo en cliente, regreso al inicio y 390×844/1280×800, sin desbordamiento. No se cambiaron técnicas de productos reales para probar ni se enviaron mensajes.

Guía: docs/CATALOGO-GESTION.md. Registro completo en el Cerebro de Dropbox.


SQL adicional: supabase/catalogo-tecnicas.sql. El render blanco tiene procedencia/hash en docs/IMAGEN-PREMIUM-BLANCA.json.

## Cierre de esta actualización — 14-oct-2026

Función Supabase v14 ACTIVE y migración catalogo_tecnicas_editables_zain aplicada. Publicación base cafcf5c, Vercel success. Técnicas múltiples y reflejo en personalizador probados con datos locales; 59 pruebas aprobadas. El botón para regresar al inicio tiene estilos aislados del control de carga de logos; regreso suave/inmediato y carga de logo sin cambios de distribución comprobados en escritorio y celular. No se cambiaron técnicas de referencias reales para probar.
