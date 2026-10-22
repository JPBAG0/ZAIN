import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
test('SDK fijado coincide con SHA256, SRI y API de passkeys del HTML',async()=>{
 const meta=JSON.parse(await readFile(new URL('docs/SUPABASE-SDK.json',root),'utf8'));
 const bytes=await readFile(new URL(meta.archivo,root));assert.equal(meta.version,'2.105.0');
 assert.equal(createHash('sha256').update(bytes).digest('hex'),meta.sha256);
 assert.equal('sha384-'+createHash('sha384').update(bytes).digest('base64'),meta.integridad);
 assert.ok(bytes.includes(Buffer.from('registerPasskey')));assert.ok(bytes.includes(Buffer.from('signInWithPasskey')));
 const html=await readFile(new URL('gestion-zain.html',root),'utf8');assert.ok(html.includes(meta.integridad));assert.ok(html.includes(meta.archivo));
});
test('script manual: WhatIf no contacta red, consulta no escribe, cambio y suspensión están acotados',()=>{
 if(process.platform!=='win32')return;
 const file=fileURLToPath(new URL('scripts/Configurar-passkeys.ps1',root)).replaceAll("'","''");
 const command=`$ErrorActionPreference='Stop';$global:solicitudesPasskeyTest=@();$global:rpPasskeyTest='zain.com.mx';
 function Invoke-RestMethod {param($Method,$Uri,$Headers,$ContentType,$Body)
  if($Uri -ne 'https://api.supabase.com/v1/projects/upzecgfgdtllxdhshhkd/config/auth'){throw 'Proyecto incorrecto'}
  $global:solicitudesPasskeyTest+=@{metodo=$Method;cuerpo=$Body}
  return [pscustomobject]@{passkey_enabled=$false;webauthn_rp_id=$global:rpPasskeyTest;webauthn_rp_display_name='Prueba';webauthn_rp_origins='https://'+$global:rpPasskeyTest;secreto_sintetico='no mostrar'}
 }
 & '${file}' -Accion Habilitar -WhatIf | Out-Null
 if($global:solicitudesPasskeyTest.Count -ne 0){throw 'WhatIf tocó red'}
 $global:solicitudesPasskeyTest=@();$consulta=& '${file}' -Accion Consultar
 if($global:solicitudesPasskeyTest.Count -ne 1 -or $consulta.PSObject.Properties.Name -contains 'secreto_sintetico'){throw 'Consulta insegura'}
 $global:solicitudesPasskeyTest=@();& '${file}' -Accion Habilitar | Out-Null
 $body=$global:solicitudesPasskeyTest[1].cuerpo|ConvertFrom-Json
 if($global:solicitudesPasskeyTest.Count -ne 2 -or $body.passkey_enabled -ne $true -or $body.webauthn_rp_id -ne 'zain.com.mx'){throw 'Habilitación incorrecta'}
 $global:solicitudesPasskeyTest=@();& '${file}' -Accion Deshabilitar | Out-Null
 $body=$global:solicitudesPasskeyTest[1].cuerpo|ConvertFrom-Json
 if($body.passkey_enabled -ne $false -or $body.PSObject.Properties.Name.Count -ne 1){throw 'Suspensión altera otros campos'}
 $global:solicitudesPasskeyTest=@();$global:rpPasskeyTest='otro.example.test';$bloqueo=$false
 try{& '${file}' -Accion Habilitar | Out-Null}catch{$bloqueo=$true}
 if(-not $bloqueo -or $global:solicitudesPasskeyTest.Count -ne 1){throw 'Cambió un RP distinto'}
 Write-Output 'PRUEBAS_OK'`;
 const result=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-Command',command],{encoding:'utf8',env:{...process.env,SUPABASE_ACCESS_TOKEN:'credencial-sintetica-de-prueba'}});
 assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/PRUEBAS_OK/);
});

test('configuración de hosting no sirve los scripts de administración',async()=>{
 const config=JSON.parse(await readFile(new URL('vercel.json',root),'utf8'));
 assert.ok(config.routes.some(r=>r.status===404&&new RegExp('^'+r.src+'$').test('/scripts/Configurar-passkeys.ps1')));
});
