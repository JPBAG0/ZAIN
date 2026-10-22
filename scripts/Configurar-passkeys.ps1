# Configuración manual futura. Nunca escribe credenciales ni muestra la configuración Auth completa.
[CmdletBinding(SupportsShouldProcess)]
param([ValidateSet('Consultar','Habilitar','Deshabilitar')][string]$Accion='Consultar')
$ErrorActionPreference='Stop'
$proyectoPasskeys='upzecgfgdtllxdhshhkd'
$rpPasskeys='zain.com.mx'
$nombrePasskeys='ZAIN Gestión'
$uriPasskeys='https://api.supabase.com/v1/projects/'+$proyectoPasskeys+'/config/auth'
if($Accion -ne 'Consultar' -and -not $PSCmdlet.ShouldProcess($proyectoPasskeys, $Accion+' passkeys')) { return }
if([string]::IsNullOrWhiteSpace($env:SUPABASE_ACCESS_TOKEN)){throw 'Falta SUPABASE_ACCESS_TOKEN en el entorno de este proceso. Usa un token con alcance mínimo; no lo guardes en archivos o notas.'}
$cabecerasPasskeys=@{Authorization='Bearer '+$env:SUPABASE_ACCESS_TOKEN}
$actualPasskeys=Invoke-RestMethod -Method Get -Uri $uriPasskeys -Headers $cabecerasPasskeys
if($Accion -eq 'Habilitar'){
 if($actualPasskeys.webauthn_rp_id -and $actualPasskeys.webauthn_rp_id -ne $rpPasskeys){throw 'El RP configurado difiere del dominio esperado. Revisa sus llaves existentes en Authentication > Passkeys antes de cambiarlo; este script conserva el RP actual.'}
 $cuerpoPasskeys=@{passkey_enabled=$true;webauthn_rp_id=$rpPasskeys;webauthn_rp_display_name=$nombrePasskeys;webauthn_rp_origins='https://'+$rpPasskeys}|ConvertTo-Json
 $actualPasskeys=Invoke-RestMethod -Method Patch -Uri $uriPasskeys -Headers $cabecerasPasskeys -ContentType 'application/json' -Body $cuerpoPasskeys
}elseif($Accion -eq 'Deshabilitar'){
 $actualPasskeys=Invoke-RestMethod -Method Patch -Uri $uriPasskeys -Headers $cabecerasPasskeys -ContentType 'application/json' -Body '{"passkey_enabled":false}'
}
$actualPasskeys|Select-Object passkey_enabled,webauthn_rp_id,webauthn_rp_display_name,webauthn_rp_origins
