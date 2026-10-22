# Passkeys — ZAIN Gestión

Preparado en rama local `codex/zain-passkeys-20261022`, 22-oct-2026. **Sin publicación ni configuración productiva.** JP aprobó programar la propuesta del Prompt 3. El acceso por contraseña sigue disponible; no hay cuentas, tablas, Edge ni JWT propios nuevos.

## Uso

Entrar con la contraseña actual → Seguridad → Registrar este celular. Tras entrar con una llave o restaurar una sesión, confirmar primero la contraseña en Seguridad; esa confirmación local dura cinco minutos. La lista permite cambiar el nombre o quitar una llave con confirmación. Face ID, huella, PIN o llave física dependen del equipo. Una llave sincronizada puede cubrir varios dispositivos: no es un inventario físico de celulares.

En el siguiente acceso usar «Entrar con Face ID / llave del celular» o la contraseña habitual. Solo se abre una ceremonia tras tocar el botón. Cancelar conserva la vía por contraseña. Una llave no concede permisos de equipo/dueño y no es un segundo factor MFA/aal2. Quitarla impide nuevos accesos; las sesiones emitidas no se revocan por esa baja. Cerrar sesión solicita revocar la sesión actual; los access tokens ya emitidos siguen sujetos a su vigencia.

## Integración

SDK oficial `@supabase/supabase-js` **2.105.0**, copia estática con SRI y licencia MIT. Procedencia y SHA256 en [SUPABASE-SDK.json](SUPABASE-SDK.json). La API nativa requiere opt-in experimental. El recurso local evita introducir un build o una dependencia de CDN para el acceso. No actualizar el SDK sin volver a revisar la API y las pruebas.

El gestor descarta respuestas de entrada/refresh después de cerrar sesión, aborta el diálogo del autenticador, agrupa renovaciones concurrentes y limpia el almacenamiento local inmediatamente. Si el almacenamiento está bloqueado usa memoria, sin persistencia tras recargar. No se guarda la contraseña ni una llave privada. El hosting de Vercel bloquea scripts/, docs/, tests/, server/ y supabase/; mantener esas restricciones si se publica en otro hosting.

ZAIN conserva el formato JSON y nombre `zain-equipo` en sessionStorage, con un canal interno del SDK distinto por pestaña. El SDK es el único que obtiene/renueva tokens, sin temporizador paralelo; las APIs de negocio conservan sus Bearer y validación de zain_accesos/zain_equipo. `zain-taller`, js/taller.js, manifest y service worker no cambian.

La rama incluye los Prompts 1/2/7 anteriores. Esta entrega de passkeys no necesita desplegar Edge ni instalar el puente WhatsApp. Para publicar los otros cambios revisar sus guías VENTAS-REALES, POSADAS-Y-TESTIMONIOS y WHATSAPP; no habilitar servicios o campañas por publicar este acceso.

## Configuración pendiente

Supabase → Authentication → Passkeys, proyecto `upzecgfgdtllxdhshhkd`. RP ID `zain.com.mx`, origen exacto `https://zain.com.mx`, nombre «ZAIN Gestión». No usar el dominio de Supabase como RP. No cambiar el RP después de registrar llaves sin plan de nuevo registro.

Los alias, vistas previas y localhost no son el RP productivo. Un piloto real fuera de ese dominio necesita proyecto de Auth de prueba, RP localhost y origen exacto del servidor de pruebas, o un dominio de staging compatible. No añadir una vista previa Vercel ajena a este RP. Los tests de esta entrega sustituyen Auth y no demuestran disponibilidad real de passkeys en este proyecto.

## Comandos para publicar más adelante

**No ejecutados en esta entrega.** Usar esta carpeta y comprobar rama/commit antes. No hay SQL ni Edge nuevos por passkeys. Estos comandos publican cuando JP decida hacerlo:

```powershell
Set-Location 'C:\Users\JP\Dropbox\Proyectos-IA\Paginas\ZAIN\ZAIN'
git branch --show-current
git log -1 --oneline
npx --yes vercel@65.1.0 login
npx --yes vercel@65.1.0 link
npx --yes vercel@65.1.0 project inspect --non-interactive
npx --yes vercel@65.1.0 deploy --prod
```

En `link`, elegir el proyecto Vercel existente de JPBAG0/ZAIN; no crear uno nuevo. Detenerse si `project inspect` muestra otro propietario/proyecto. La CLI publica desde el árbol local; no ejecutar desde el repositorio original del panel con cambios ajenos. `git push -u origin codex/zain-passkeys-20261022` es opcional y puede iniciar vistas previas; tampoco se ejecutó.

Tras comprobar el piloto y decidir habilitar el RP definitivo, usar el Dashboard anterior o el script. `SUPABASE_ACCESS_TOKEN` debe existir solo en el entorno del proceso, cargado por el gestor de credenciales habitual y con alcance al proyecto y a su configuración Auth; no pegarlo en Git, notas, comandos registrados o logs. El script muestra únicamente cuatro campos públicos:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Configurar-passkeys.ps1 -Accion Consultar
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Configurar-passkeys.ps1 -Accion Habilitar -WhatIf
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Configurar-passkeys.ps1 -Accion Habilitar
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Configurar-passkeys.ps1 -Accion Consultar
```

Consultar antes y después. Bypass aplica solo al proceso del script local revisado; no modifica la política permanente de Windows. Habilitar solo actúa sobre el proyecto fijo de esta copia; un RP ya configurado distinto bloquea el cambio y exige revisar las llaves existentes. Para suspender nuevas entradas por llave conservando contraseña, RP y credenciales:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Configurar-passkeys.ps1 -Accion Deshabilitar
```

Esto no cierra sesiones existentes ni borra llaves. Para retirar la interfaz, preparar una nueva revisión conservando los archivos en Git; no borrar credenciales o tablas ni restaurar una Edge antigua.

## Verificación

`node --test tests/*.test.mjs` ejecuta las pruebas sin servicios reales. El test de navegador `tests/passkeys-browser.cjs` se ejecuta con una página Playwright aislada y un servidor estático local, pasando `base` y opcionalmente `capturas`. Necesita Chromium con CDP; usa un autenticador virtual, SDK real y Auth/negocio simulados, bloquea conexiones externas y no demuestra una validación criptográfica del servidor Supabase. Herramientas de QA fuera del sitio; no instalar frameworks en el proyecto.

Antes del lanzamiento quedan: configuración/habilitación real del proyecto, cuenta de prueba aislada, Safari/iPhone físico y app instalada, permisos revocados, recuperación con contraseña, red interrumpida, cancelación y registro/entrada/baja reales. No registrar usuarios reales para probar ni usar los resultados locales como evidencia productiva.

Fuentes: [guía nativa de Supabase](https://supabase.com/docs/guides/auth/passkeys), [registerPasskey](https://supabase.com/docs/reference/javascript/auth-registerpasskey), [signInWithPasskey](https://supabase.com/docs/reference/javascript/auth-signinwithpasskey), [gestión](https://supabase.com/docs/reference/javascript/auth-passkey), [cierre de sesión](https://supabase.com/docs/guides/auth/signout), [Vercel CLI](https://vercel.com/docs/cli/deploy).
