# Editar partidas y tallas de la cotización

En **Pedidos → abrir pedido → Cotización → Editar partidas y tallas** se pueden redistribuir piezas por talla, cambiar modelo/color/personalización/zona/medida y agregar, duplicar o quitar partidas. Aplicar al borrador conserva los cambios en la sesión. Guardar borrador los guarda privadamente; solo **Publicar cambios** actualiza el pedido y la revisión que ve el cliente.

JP eligió bloquear al pasar el pedido a Confirmado. Aceptado con anticipo pendiente sigue editable; al publicar una revisión distinta requiere una nueva aceptación. Confirmado, producción, entregado y cancelado quedan solo lectura. La protección existente de pagos registrados se conserva: no se reemplaza un importe publicado que ya tenga pagos. Los pagos y aceptaciones históricos no se mueven ni se borran.

Los precios escritos y los acordados por talla se conservan al cambiar cantidades, incluso si se retira la talla del grupo base. El precio sigue editable; Usar precio sugerido permite recalcular expresamente. IVA, cargos y condiciones se conservan. Nuevas partidas toman los costos configurados y permiten corregir el precio antes de publicar.

Los cambios permanecen en borrador hasta publicar. La operación SQL bloquea pedido/cotización, comprueba versiones y aplica las selecciones/archivos/totales junto con la revisión. Las partidas y archivos anteriores quedan en el archivo privado zain_cotizacion_partidas_historial; no se borran archivos de Storage. Orígenes de imágenes siempre del mismo pedido; una vista que cambia usa la referencia del producto y conserva el logo original disponible. Nuevas partidas sin logo quedan pendientes.

## Validación

290 pruebas Node20/PGlite aprobadas, incluyendo tallas/sumas, precios por grupo, agregar/quitar, archivo, bloqueo, concurrencia y permisos. Navegador390/1280: editar, duplicar/quitar/agregar, precio conservado, guardar privado, publicar y bloqueo al Confirmado. Datos ficticios y cero servicios reales contactados por las pruebas. No modificar una cotización real para verificar.

## Publicación

SQL adicional una sola vez; no reaplicar los históricos. Después Edge y web. Sin cambios al puente de WhatsApp.

```powershell
npx --yes supabase@2.121.0 db query --linked --project-ref upzecgfgdtllxdhshhkd --file supabase/cotizacion-partidas-editables.sql
node server/preparar-edge.mjs
npx --yes supabase@2.121.0 functions deploy zain-pedidos --project-ref upzecgfgdtllxdhshhkd --use-api --no-verify-jwt
git push --atomic origin HEAD:refs/heads/codex/zain-cotizacion-editable-20261023 HEAD:refs/heads/claude/zain-website-deploy-d85pzy
```

Comprobar columna partidas_version, archivo privado sin permisos de staff/anon, función ACTIVE y recursos: control-cotizacionesv39, editorv19, corev18, CSSv11 y módulos de seleccionesv1. Mantener el mismo membrete.
