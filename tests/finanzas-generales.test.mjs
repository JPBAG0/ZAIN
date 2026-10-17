import test from 'node:test';
import assert from 'node:assert/strict';
import {createHandler} from '../server/pedidos.mjs';
import {validarGeneral,CATEGORIAS} from '../server/finanzas-generales.mjs';
const uid='87654321-4321-4321-8321-cba987654321',req='11111111-2222-4333-8444-555555555555';
const fail=(s,m)=>{const e=new Error(m);e.status=s;throw e;};
const base={request:req,tipo:'gasto',categoria:'Marketing y publicidad',persona:'juan_pablo',concepto:'Anuncios octubre',importe:150000,iva_recuperable:0,fecha:'2026-10-10'};
function fixture(){
 const movs=[],archivos=[],calls=[],ediciones=[];
 const fetcher=async(url,options={})=>{
  calls.push([options.method||'GET',url]);let out;
  if(url.includes('/auth/v1/user'))out={id:uid,email:'staff@example.test',email_confirmed_at:'2026-10-15'};
  else if(url.includes('/zain_accesos?'))out=[{nombre:'Equipo'}];else if(url.includes('/zain_equipo?'))out=[{user_id:uid,nombre:'Equipo',activo:true}];
  else if(url.includes('/rpc/zain_general_editar')){const b=JSON.parse(options.body),m=movs.find(m=>m.id===b.p_id);if(!m||m.anulado_at||(m.editado_at??null)!==b.p_editado_at)out=false;else{ediciones.push({...m});Object.assign(m,b.p_datos,{editado_at:new Date().toISOString(),editado_por:b.p_actor});out=true;}}
  else if(url.includes('/rpc/zain_finanzas_dashboard'))out={anio:JSON.parse(options.body).p_anio,meses:[],categorias:[],personas:{}};
  else if(url.includes('/zain_movimientos_generales')){
   const id=url.match(/id=eq\.([0-9a-f-]+)/)?.[1];
   if(options.method==='POST'){movs.push(JSON.parse(options.body));out=null;}
   else if(options.method==='PATCH'){const m=movs.find(m=>m.id===id);if(m&&!m.anulado_at)Object.assign(m,JSON.parse(options.body));out=null;}
   else out=id?movs.filter(m=>m.id===id):movs;
  }
  else if(url.includes('/zain_general_archivos'))out=options.method==='POST'?(archivos.push(JSON.parse(options.body)),null):archivos.filter(a=>url.includes(a.id));
  else if(url.includes('/storage/v1/object/'))out={};
  else throw Error('Ruta inesperada '+url);
  return Response.json(out);
 };
 const handler=createHandler({SUPABASE_URL:'https://p.supabase.co',SUPABASE_SECRET_KEY:'test-secret',SUPABASE_PUBLISHABLE_KEY:'test-public',ZAIN_SITE_URL:'https://zain.test',ZAIN_PEDIDOS_ENABLED:'true',ZAIN_GASTOS_ENABLED:'true'},fetcher);
 const call=(op,b,auth=true,q='')=>handler(new Request('https://zain.test/api/pedidos?op='+op+q,{method:b?'POST':'GET',headers:{Origin:'https://zain.test',...(auth?{Authorization:'Bearer test'}:{}),...(b?{'Content-Type':'application/json'}:{})},body:b?JSON.stringify(b):undefined}));
 return {call,movs,archivos,calls,handler,ediciones};
}
test('categorías: Flete en lugar de transporte; ingresos separan aportación de capital',()=>{
 assert.ok(CATEGORIAS.gasto.includes('Flete'));assert.ok(!CATEGORIAS.gasto.some(c=>/transporte/i.test(c)));assert.ok(CATEGORIAS.ingreso.includes('Aportación de capital'));
});
test('validación: categoría de su tipo, sin fechas futuras, reembolso solo a personas y verificado, IVA solo en gastos',()=>{
 assert.equal(validarGeneral(base,fail).importe,150000);
 for(const malo of [{categoria:'Venta sin pedido'},{fecha:'2999-01-01'},{fecha:'2026-02-30'},{importe:0},{importe:1.5},{concepto:''},{persona:'otro'},{iva_recuperable:200000},{tipo:'ingreso',categoria:'Venta sin pedido',iva_recuperable:10},{tipo:'reembolso',categoria:'Reembolso',persona:'zain',verificado:true},{tipo:'reembolso',categoria:'Reembolso'},{request:'x'}])
  assert.throws(()=>validarGeneral({...base,...malo},fail),undefined,JSON.stringify(malo));
 assert.equal(validarGeneral({...base,tipo:'reembolso',categoria:'Reembolso',persona:'garcia',verificado:true},fail).tipo,'reembolso');
});
test('requiere sesión del equipo; guardar es idempotente y devuelve el dashboard del año',async()=>{
 const f=fixture();
 assert.equal((await f.call('generales',null,false,'&anio=2026')).status,401);
 assert.equal((await f.call('generales-guardar',base,false)).status,401);
 let r=await f.call('generales-guardar',base);assert.equal(r.status,200);const d=await r.json();assert.equal(d.anio,2026);assert.equal(d.dashboard.anio,2026);
 assert.equal((await f.call('generales-guardar',base)).status,200);assert.equal(f.movs.length,1);assert.equal(f.movs[0].actor,uid);
 assert.equal((await f.call('generales-guardar',{...base,importe:999})).status,409);
 assert.equal((await f.call('generales',null,true,'&anio=1999')).status,400);
});
test('anular exige motivo y conserva el registro; comprobante ajeno se rechaza',async()=>{
 const f=fixture();await f.call('generales-guardar',base);
 assert.equal((await f.call('generales-anular',{id:req,motivo:'no'})).status,400);
 assert.equal((await f.call('generales-anular',{id:req,motivo:'Se capturó dos veces'})).status,200);
 assert.equal(f.movs.length,1);assert.ok(f.movs[0].anulado_at);assert.equal(f.movs[0].anulado_por,uid);
 const otro='99999999-2222-4333-8444-555555555555';
 assert.equal((await f.call('generales-guardar',{...base,request:otro,comprobante:'aaaaaaaa-2222-4333-8444-555555555555'})).status,400);
});
test('comprobante: valida el formato real del archivo y lo guarda fuera de los pedidos',async()=>{
 const f=fixture(),archivo='bbbbbbbb-2222-4333-8444-555555555555';
 const subir=(tipo,datos)=>f.handler(new Request('https://zain.test/api/pedidos?op=generales-comprobante&archivo='+archivo,{method:'POST',headers:{Origin:'https://zain.test',Authorization:'Bearer test','Content-Type':tipo},body:datos}));
 assert.equal((await subir('application/pdf',Buffer.from('no es un pdf'))).status,400);
 assert.equal((await subir('application/pdf',Buffer.from('%PDF-1.4 contenido de prueba'))).status,200);
 assert.match(f.archivos[0].objeto,/^generales\//);
 assert.equal((await f.call('generales-guardar',{...base,comprobante:archivo})).status,200);
});
test('editar guarda cada versión previa (historial de solo agregar) y no pisa cambios concurrentes',async()=>{
 const f=fixture();await f.call('generales-guardar',base);
 assert.equal((await f.call('generales-editar',{...base,id:req,importe:160000})).status,200);
 assert.equal((await f.call('generales-editar',{...base,id:req,importe:170000})).status,200);
 assert.equal(f.ediciones.length,2);assert.equal(f.ediciones[0].importe,150000);assert.equal(f.ediciones[1].importe,160000);assert.equal(f.movs[0].importe,170000);
 assert.equal((await f.call('generales-editar',{...base,id:req,categoria:'Venta sin pedido'})).status,400);
 f.movs[0].editado_at='2000-01-01T00:00:00Z';const viejo=f.movs[0].editado_at;
 const r=await f.handler(new Request('https://zain.test/api/pedidos?op=generales-editar',{method:'POST',headers:{Origin:'https://zain.test',Authorization:'Bearer test','Content-Type':'application/json'},body:JSON.stringify({...base,id:req})}));assert.equal(r.status,200);assert.notEqual(f.movs[0].editado_at,viejo);
 assert.equal((await f.call('generales-editar',{...base,id:'99999999-2222-4333-8444-555555555555'})).status,404);
});
