# ZAIN: medición para Google Ads

Preparado el 13-oct-2026. **Activado el 17-oct-2026** en la cuenta de Google Ads de JP (538-348-6598, la misma de SEASA, etiqueta AW-18438312158; la cuenta 695-604-7497 de ZAIN quedó sin uso por bloqueo de verificación de identidad): "ZAIN - Solicitud de cotización" es acción principal (objetivo Formulario de clientes potenciales, NO predeterminado de la cuenta para no mezclarse con SEASA) y "ZAIN - Clic a WhatsApp" es secundaria (objetivo Contacto); ambas cuentan Una, valor fijo MXN 1, el sitio no envía datos de usuario (las conversiones avanzadas de esa cuenta se administran en la etiqueta de Google y no se tocaron para no afectar a SEASA). Aviso de privacidad actualizado ese día. Pendiente: confirmar recepción en Ads/Tag Assistant con una solicitud real.

## Qué mide

| Acción | Se dispara cuando | Uso propuesto en Google Ads |
|---|---|---|
| Solicitud guardada | API confirmó todos los archivos y devolvió recibo | Principal de captación, contando Una; no llamarla compra/venta |
| Clic a WhatsApp | Se intenta abrir el chat desde el pedido o los enlaces de contacto | Secundaria, contando Una; no usarla además como objetivo principal de puja |

La calidad de los prospectos se confirma en el panel. Una solicitud guardada puede ser una prueba, spam o un usuario que nunca envíe el WhatsApp; no equivale a contacto validado. Si el volumen/calidad lo requieren, una futura medición offline de cotización confirmada sería otro trabajo.

## Datos y permiso

`js/medicion.js` funciona solo en el catálogo público de los orígenes expresamente configurados. Modo básico: no carga Google sin elección afirmativa. Solo necesarias permite cotizar normalmente. El banner aparece cuando hay configuración válida y `privacidadPublicada=true`; antes de eso no se pide un permiso para una etiqueta desactivada.

Se concede almacenamiento/uso para medición publicitaria, manteniendo personalización y Analytics denegados. No se activa remarketing ni conversiones mejoradas. No se envían texto del pedido, logo, notas, originales, nombre del archivo, folio, UUID en claro ni URL de seguimiento. Los parámetros de URL se reducen a identificadores publicitarios y el fragmento siempre se elimina.

Solicitud usa SHA-256 con dominio `zain:medicion:v1` sobre su ID técnico como `transaction_id`. Se deduplica en memoria, incluidas llamadas concurrentes, y Google puede deduplicar reintentos entre recargas. No se guarda un historial adicional de clientes para medición. Nunca cambiar el identificador para hacer que un reintento parezca un nuevo prospecto.

Las dos acciones tienen etiquetas distintas. No se inventan importe ni moneda. La aplicación espera un callback o un máximo de 700 ms por acción antes de continuar. El callback no acredita que Google registró la conversión ni que WhatsApp envió un mensaje.

La elección local dura como máximo 180 días. Se puede retirar en el pie; se bloquean nuevas conversiones, se eliminan las cookies de medición identificadas que pueda eliminar el sitio y se recarga, preservando carrito y archivos. Vercel Analytics existente conserva estadísticas agregadas sin cookies; no se incorpora a los accesos privados ni al seguimiento.

## Conectar cuando estén los datos

1. Completar `docs/PRIVACIDAD-BORRADOR.md` con responsable/domicilio y la operación real; crear la página pública `/privacidad` y enlazarla antes de activar medición. El borrador NO es un aviso definitivo publicado.
2. En la cuenta de Google Ads de ZAIN, crear las dos acciones web, revisar objetivos y obtener **ID de etiqueta AW-…** y **etiqueta de cada conversión**. No hace falta compartir contraseñas.
3. En `server/config-interno.cjs`, completar `medicion.googleAdsId`, `etiquetaSolicitud`, `etiquetaWhatsApp`; añadir dominio definitivo a `origenes`, luego `medicion.activa=true` y `privacidadPublicada=true`. No utilizar valores de prueba en producción. Subir versiones del recurso en todas las páginas que lo cargan.
4. Antes de gastar: verificar con Tag Assistant rechazo sin etiqueta, aceptación con etiqueta, solicitud real con archivos, retorno/reintento sin duplicados y clic de WhatsApp como acción secundaria. Los bloqueadores, falta de consentimiento y problemas de red pueden reducir conversiones observadas.
5. Revisar informes de Google Ads y conteos reales del panel; mantener pruebas canceladas como NO COTIZAR y no generar pruebas de conversión con etiquetas reales fuera del procedimiento acordado.

## Pruebas y límites

`node --test tests/medicion.test.mjs` prueba consentimiento, ruta privada, config ausente, deduplicación, separación de acciones, filtrado, espera acotada y retiro. Los tests usan identificadores ficticios y una etiqueta simulada; no acreditan recepción en Google Ads. La prueba del flujo existente puede ejecutarse sin activar medición y sin enviar el WhatsApp.

Falta confirmar titular/responsable y domicilio del aviso, calendario de conservación, IDs de ZAIN, dominio/hosting comercial y validación de recepción en Tag Assistant/Ads. La infraestructura de pedidos y la campaña son asuntos distintos; ninguna campaña se ha lanzado.

Fuentes: [modo básico de consentimiento](https://developers.google.com/tag-platform/security/concepts/consent-mode), [API de Google tag](https://developers.google.com/tag-platform/gtagjs/reference), [identificador para evitar duplicados](https://support.google.com/google-ads/answer/6386790?hl=es), [acciones principales/secundarias](https://support.google.com/google-ads/answer/11461796?hl=es).


Desde 14-oct: js/config.js se genera desde server/config-interno.cjs; regenerar el catálogo público y la función Edge después de actualizar configuración.
