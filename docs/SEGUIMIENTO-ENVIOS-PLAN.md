# Seguimiento de envíos ZAIN — propuesta, sin implementación
Fecha: 14-oct-2026. Proveedor: Codex. JP pidió planearlo y NO hacerlo ahora.

## Recomendación para empezar
El equipo registraría paquetería, número de guía/talón y enlace HTTPS de rastreo. En /mi-pedido, bajo el estado del pedido, el cliente vería esos datos, podría copiar la guía y abrir “Rastrear envío”. Si no hay guía, indicar “Tu envío aún no tiene guía”; no inferir tránsito a partir del estado de producción.

Fuentes oficiales verificadas:
- [Paquetexpress: rastreo](https://www.paquetexpress.com.mx/rastreo/): búsqueda por guía o referencia. La búsqueda la encontró; la lectura completa falló, por lo que no se confirma un formato de enlace con guía precargada.
- [Tresguerras: rastreo](https://webserver.tresguerras.com.mx/3G/tracking.php): ingreso de talón. No se presupone API pública ni parámetros no documentados.
- [DHL: API oficial de tracking](https://developer.dhl.com/tracking): consulta estado, hitos y ubicación; acceso y servicio concreto a verificar en la cuenta.
- [Skydropx: webhooks](https://www.skydropx.com/webhooks/): notificaciones de cambios de envío, creación, entrega e incidencias.
- [Referencia API Skydropx](https://pro.skydropx.com/es-MX/api-docs): URL oficial abierta sin contenido legible con la herramienta; no se verificaron endpoints, autenticación, firma de webhooks, cuotas o precios.

## Segunda etapa
Elegir plataforma y acceso aprobado a API; recibir eventos reales en servidor y mostrar etapas: guía creada, recolectado, en tránsito, en reparto y entregado. Incluir incidencias, fechas y hora de última actualización, con enlace oficial alternativo. Las etapas no indican porcentaje real de distancia, tiempo o certeza de entrega.

Preferir Skydropx si las guías se generan allí y se confirma cobertura para DHL, Paquetexpress y Tresguerras. No se confirmó que pueda rastrear guías compradas por fuera ni cobertura de todos los servicios de los tres transportistas. DHL dispone de API directa; para los otros transportistas confirmar acceso comercial. No raspar páginas de rastreo ni automatizar captchas.

## Preparación futura
Colección de envíos por pedido para admitir varios bultos/guías: transportista, número, enlace, ID externo opcional, estado normalizado, eventos fechados y última sincronización. Direcciones/etiquetas privadas; cliente solo lo necesario mediante su enlace autorizado.

Enlaces HTTPS en dominios verificados, claves API solo en servidor; no consultar URLs arbitrarias del cliente. Validar origen/firma de eventos según documentación real, deduplicar y tolerar eventos fuera de orden. Falta de eventos no implica entrega. Probar en entorno de pruebas sin comprar envíos reales.

## Pendiente
Dónde comprarán guías, quién las registra, guías múltiples, cobertura/cuotas/costos de API. No se creó cuenta, webhook, nueva automatización, columna de envíos o integración, ni se emitieron guías.

