# Archivos y cotizaciones en Chats — 22-oct-2026

Botón **+** junto a la respuesta. **Archivo del equipo** admite PDF, JPG, PNG, WEBP, DOCX y XLSX de hasta8MB. **Cotización en PDF** permite elegir cotización por modelo lista para enviar o revisión publicada del pedido ligado. Se genera en memoria con el membrete y las imágenes existentes; no descarga ni modifica el editor. Revisa **Ver archivo** y el destinatario, escribe una leyenda si quieres y pulsa **Enviar**. Elegir no envía; Quitar solo descarta el adjunto en memoria.

## Contrato y privacidad

La carga usa URL firmada privada, ligada al actor e ID de envío, con ruta derivada de SHA256. wa-enviar comprueba el objeto real, firma de formato, tamaño/hash, ruta y versión de cotización. No expone service_role ni guarda archivos o borradores en disco/localStorage. Datos de clientes solo Supabase. SQL adicional agrega adjunto a la cola y confirma medios en historial sin borrar datos previos; no cambia RLS ni habilita escritura directa.

El puente descarga solo del Storage del proyecto, en memoria y hasta8MB, valida hash/tamaño, verifica su reserva antes de enviar y usa el mismo ID de WhatsApp. Error antes de iniciar queda No enviado; error después de iniciar requiere revisar en el celular, sin reenvío. BOT_AUTOMATICO=false. La vinculación existente se conserva al actualizar; un único ejecutor Server-JP.

## Publicación

Desde el repositorio ZAIN, aplicar solo una vez el SQL adicional; los históricos permanecen intactos. Orden: SQL → Edge → puente → web. No enviar pruebas a chats reales.

```powershell
npx --yes supabase@2.121.0 db query --linked --project-ref upzecgfgdtllxdhshhkd --file supabase/whatsapp-adjuntos.sql
node server/preparar-edge.mjs
npx --yes supabase@2.121.0 functions deploy zain-pedidos --project-ref upzecgfgdtllxdhshhkd --use-api --no-verify-jwt
```

Actualizar únicamente la tarea existente del puente después de comprobar que no haya envíos preparando/enviando. Detener el PID comprobado de wa/puente.mjs y esperar que venza su reserva remota40s. Conservar wa/auth y no desvincular. Iniciar la misma tarea:

```powershell
Start-ScheduledTask -TaskName 'ZAIN WhatsApp manual'
```

Desde el sitio, después de validar el puente:

```powershell
git push --atomic origin HEAD:refs/heads/codex/zain-whatsapp-adjuntos-20261022 HEAD:refs/heads/claude/zain-website-deploy-d85pzy
```

El push de la web no actualiza SQL, Edge ni puente. Confirmar Vercel success, chatsv2 y cssv2, firma/carga privada y estado conectado reciente. Pruebas locales277 sitio/PGlite,21 puente y navegador390/1280; datos ficticios y ningún mensaje real. Confirmación final de recepción de archivo en teléfono: prueba humana de JP.
