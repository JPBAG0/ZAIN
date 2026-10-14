import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import C from '../server/config-interno.cjs';
import Public from '../js/config.js';
import {createHandler,validateOrder} from '../server/pedidos.mjs';
const id='12345678-1234-4123-8123-123456789abc',token='a'.repeat(64);
const body=x=>({id,token,items:[x],files:[]});
const selection=(p,colorID=p.colores[0])=>({p:p.id,color:C.colores.find(c=>c.id===colorID).nombre,colorCodigo:C.colores.find(c=>c.id===colorID).codigo,tecnica:C.tecnicas.find(t=>t.id===p.tecnicas[0]).nombre,piezas:5,tallasDetalle:{M:5},zona:p.zonas[0].nombre,cm:9,tieneLogo:false,tieneRender:false});
const catalogo=[...C.productos,...(C.catalogoYazbekPendiente||[])];
const model=code=>catalogo.find(p=>p.codigoFabricante===code);
const expected={C0200:['CH','M','G','EG','EEG','EEEG'],D0200:['CH','M','G','EG','EEG'],C0300:['CH','M','G','EG','EEG','EEEG'],D0300:['CH','M','G','EG'],D0550:['CH','M','G','EG'],D1302:['CH','M','G','EG'],D1502:['CH','M','G','EG'],D1504:['CH','M','G','EG'],D0601:['CH','M','G','EG','EEG'],D0604:['CH','M','G','EG','EEG'],D0605:['CH','M','G','EG','EEG'],D0606:['CH','M','G','EG','EEG'],D0607:['CH','M','G','EG','EEG']};

test('originales activos junto con 14 familias / 25 referencias Yazbek sin personas',()=>{
  const current=catalogo.filter(p=>p.fabricante==='Yazbek');
  assert.equal(current.length,25);assert.equal(new Set(current.map(p=>p.familia)).size,14);
  for(const [code,sizes] of Object.entries(expected))assert.deepEqual(model(code).tallas,sizes,code);
  assert.equal(C.productos.filter(p=>['gorra','chamarra','playera','polo','camisa','sudadera'].includes(p.id)).length,6);
  assert.equal(C.productosHistoricos.length,0);
  assert.deepEqual(C.categoriasCatalogo,['Playeras','Polos','Camisas','Sudaderas','Chamarras','Gorras','Bolsas']);
  for (const p of C.productos.filter(p=>p.imagenLimpia)) { assert.match(p.foto,/originales-limpios/);assert.ok(readFileSync(new URL('../'+p.fotoOriginal,import.meta.url)).length>1000); }
  for(const p of current){assert.deepEqual(Object.keys(p.tablaTallas),p.tallas);assert.equal(p.fuente.catalogo,'Yazbek · catalogo.pdf');assert.equal(p.imagenFuente.origen,'IA');assert.equal(p.imagenIA,true);assert.equal(p.imagenFuente.replicaVerificada,false);assert.match(p.foto,/yazbek-ia/);assert.ok(!p.esquema);assert.ok(readFileSync(new URL('../'+p.foto,import.meta.url)).length>1000);}
});

test('todas las combinaciones publicadas guardan código, color, material y tallas canónicos',()=>{
  for(const p of catalogo.filter(p=>p.fabricante))for(const col of p.colores)for(const talla of p.tallas) {
    const x={...selection(p,col),tallasDetalle:{[talla]:5},nombre:'nombre inventado',gramaje:9999,composicion:'inventada',silueta:'otra'};
    const got=validateOrder(body(x)).items[0];
    assert.equal(got.codigoFabricante,p.codigoFabricante);assert.equal(got.nombre,p.nombre);assert.equal(got.silueta,p.silueta);assert.equal(got.gramaje,p.gramaje);
    assert.equal(got.colorCodigo,C.colores.find(c=>c.id===col).codigo);assert.equal(got.tallas,`${talla} 5`);
    assert.equal(got.composicion,p.composicionColor[got.colorCodigo]||p.composicion);
  }
});

test('no acepta colores de otra tela, código incompatible o DTF sin confirmar',()=>{
  const p=model('C0604'),x=selection(p);
  for(const invalid of [{color:'Blanco',colorCodigo:'100'},{color:'Gris',colorCodigo:'703'},{color:'Blanco',colorCodigo:'701'},{tecnica:'DTF'}])assert.throws(()=>validateOrder(body({...x,...invalid})),/Color|color|Técnica/);
  assert.equal(validateOrder(body(selection(model('D0605'),'yazbek-705'))).items[0].color,'Rosa · 705');
  assert.equal(validateOrder(body(selection(model('C0607'),'yazbek-413'))).items[0].colorCodigo,'413');
  assert.equal(validateOrder(body(selection(model('C0200'),'yazbek-102'))).items[0].composicion,'90% algodón / 10% poliéster');
});

test('rechaza tallas ajenas, sumas distintas y cantidades manipuladas',()=>{
  const x=selection(model('D0300'));
  for(const counts of [{EEG:5},{M:4},{M:-5},{M:2.5},{M:'5'},[],{},JSON.parse('{"__proto__":5}')])assert.throws(()=>validateOrder(body({...x,tallasDetalle:counts})),/tallas/);
  assert.throws(()=>validateOrder(body({...x,cm:201})),/tamaño/);
  assert.throws(()=>validateOrder(body({...x,zona:3})),/ubicación/);
});

test('bolsas mantienen 13 modelos, 100 por modelo/color e incrementos de 50',()=>{
  const bags=C.productos.filter(p=>p.grupo==='bolsas');assert.equal(bags.length,13);
  for(const p of bags){assert.equal(p.minimoPiezas,100);assert.equal(p.pasoPiezas,50);const x={p:p.id,color:C.colores.find(c=>c.id===p.colores[0]).nombre,tecnica:'Serigrafía',piezas:100};assert.equal(validateOrder(body(x)).total,100);assert.throws(()=>validateOrder(body({...x,piezas:125})),/cantidades/);}
});

test('originales restablecidos admiten nuevas cotizaciones sin hacerse pasar por Yazbek',()=>{const p=C.productos.find(p=>p.id==='polo');const x={p:p.id,color:'Azul marino',tecnica:'Bordado',piezas:5,tallas:'M 5',cm:9,zona:'Pecho izquierdo'};const checked=validateOrder(body(x)).items[0];assert.equal(checked.nombre,'Polo piqué');assert.ok(!('fabricante' in checked));});

test('un folio existente se reintenta solo con su secreto y contenido iguales',async()=>{
  const x={p:'polo',color:'Azul marino',tecnica:'Bordado',piezas:5,tallas:'M 5',cm:9,zona:'Pecho izquierdo'};
  const checked=validateOrder(body(x),{allowHistoricos:true});let writes=0;
  const old={id,folio:'ZAIN-PRUEBA',token_hash:createHash('sha256').update(token).digest('hex'),items:checked.items,archivos:checked.manifest,total:5,consulta_nonce:'prueba',guardado_at:'2026-10-13T18:00:00Z'};
  const fake=async(url,opts)=>{
    if(url.includes('/rpc/zain_crear_pedido')){const b=JSON.parse(opts.body);if(b.p_token_hash!==old.token_hash || JSON.stringify(b.p_items)!==JSON.stringify(old.items))return Response.json({message:'zain_conflict'},{status:409});writes++;return Response.json({folio:old.folio});}
    return Response.json([old]);
  };
  const h=createHandler({SUPABASE_URL:'https://project.supabase.co',SUPABASE_SECRET_KEY:'test-secret',SUPABASE_PUBLISHABLE_KEY:'test-public',ZAIN_PEDIDOS_ENABLED:'true',ZAIN_SITE_URL:'https://zain.test'},fake);
  const req=b=>h(new Request('https://zain.test/api/pedidos?op=crear',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://zain.test'},body:JSON.stringify(b)}));
  assert.equal((await req(body(x))).status,200);assert.equal(writes,1);
  assert.equal((await req(body({...x,piezas:6,tallas:'M 6'}))).status,409);assert.equal(writes,1);
  assert.equal((await req({...body(x),token:'b'.repeat(64)})).status,409);assert.equal(writes,1);
  const oldProjection=validateOrder(body(x),{allowHistoricos:true}).items[0];assert.ok(!('fabricante' in oldProjection));assert.equal(oldProjection.nombre,'Polo piqué');
});

test('consulta de prendas guarda especificaciones sin exponer notas privadas o rutas',async()=>{
  const p=model('D0605'),checked=validateOrder(body(selection(p,'yazbek-705'))),hash=createHash('sha256').update(token).digest('hex');
  const row={id,folio:'ZAIN-PRUEBA',token_hash:hash,consulta_nonce:'prueba',items:checked.items,archivos:[],total:5,created_at:'2026-10-13',guardado_at:'2026-10-13',estado:'nuevo',notas_internas:'NO MOSTRAR'};
  const h=createHandler({SUPABASE_URL:'https://project.supabase.co',SUPABASE_SECRET_KEY:'test-secret',SUPABASE_PUBLISHABLE_KEY:'test-public',ZAIN_PEDIDOS_ENABLED:'true',ZAIN_SITE_URL:'https://zain.test'},async()=>Response.json([row]));
  const {createHmac}=await import('node:crypto');const read=createHmac('sha256',Buffer.from(hash,'hex')).update('zain:consulta:v1:'+id+':prueba').digest('hex');
  const r=await h(new Request('https://zain.test/api/pedidos?op=consulta',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://zain.test'},body:JSON.stringify({id,token:read})}));
  const out=await r.json();assert.ok(!('codigoFabricante' in out.pedido.items[0]));assert.ok(!('fabricante' in out.pedido.items[0]));assert.equal(out.pedido.items[0].sku,p.sku);assert.equal(out.pedido.items[0].color,'Rosa');assert.ok(!/Yazbek|D0605/i.test(JSON.stringify(out)));assert.equal(out.pedido.items[0].composicion,'75% algodón / 25% poliéster');assert.ok(!JSON.stringify(out).includes('NO MOSTRAR'));assert.ok(!('fuente' in out.pedido.items[0]));
});

test('catálogo público conserva 44 referencias sin marca/códigos del proveedor y 25 fotos extra',()=>{
 assert.equal(Public.productos.length,44);
 assert.equal(new Set(Public.productos.map(p=>p.sku)).size,44);
 assert.ok(!/Yazbek|\b[CD]\d{4}\b/i.test(JSON.stringify(Public)));
 assert.equal(Public.productos.filter(p=>p.fotoModelo).length,25);
 for(const p of Public.productos.filter(p=>p.fotoModelo)){
  assert.ok(readFileSync(new URL('../'+p.fotoModelo,import.meta.url)).length>1000);
  assert.ok(readFileSync(new URL('../'+p.foto,import.meta.url)).length>1000);
 }
});
test('cada variante/color/talla pública se deriva al modelo interno exacto sin código enviado',()=>{
 for(const p of Public.productos.filter(p=>p.prendaCatalogo))for(const colorID of p.colores)for(const size of p.tallas){
  const color=Public.colores.find(c=>c.id===colorID);
  const item={p:p.id,color:color.nombre,colorId:color.id,tecnica:Public.tecnicas.find(t=>t.id===p.tecnicas[0]).nombre,piezas:5,tallasDetalle:{[size]:5},zona:p.zonas[0].nombre,cm:9};
  const got=validateOrder(body(item)).items[0],internal=C.productos.find(v=>v.idPublico===p.id);
  assert.equal(got.codigoFabricante,internal.codigoFabricante);
  assert.equal(got.composicion,internal.composicionColor[got.colorCodigo]||internal.composicion);
  const foreign=Public.colores.find(c=>!p.colores.includes(c.id) && c.id.startsWith('zain-color-'));
  if(foreign)assert.throws(()=>validateOrder(body({...item,colorId:foreign.id,colorCodigo:''})),/color/);
 }
});
