// Prendas de los catálogos de proveedores (soloGestion, 22-nov-2026): están en el catálogo interno para Gestión y el
// cotizador, pero nunca llegan a la página pública ni a config.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import C from '../server/config-interno.cjs';
import PublicC from '../js/config.js';
import {resolveInternal,projectPublic} from '../server/catalogo-gestion.mjs';
const base=C.productos.find(p=>p.soloCotizar&&p.categoria==='Gorras');
const interno=()=>{
 const c=structuredClone(C);
 c.colores.push({id:'zn-go-901-c01',nombre:'Negro prueba',hex:'#111111'},{id:'zn-go-901-c02',nombre:'Arena prueba',hex:'#ccbb99'});
 c.productos.push({...structuredClone(base),id:'zn-go-901',idPublico:'zn-go-901',sku:'ZN-GO-901',nombre:'Gorra de prueba',nombreComercial:'Gorra de prueba',nombreFamilia:'Gorra de prueba',nombreFamiliaComercial:'Gorra de prueba',
  familia:'zain-proveedor-zn-go-901',colores:['zn-go-901-c01','zn-go-901-c02'],foto:'',fotosColor:{},coloresSinRender:[],soloGestion:true,soloCotizar:true,activo:false});
 return resolveInternal(c,[]);
};
test('sin sesión del equipo, la prenda soloGestion y sus colores no salen',()=>{
 const pub=projectPublic(PublicC,interno(),[],'https://p.supabase.co');
 assert.ok(![...pub.productos,...pub.productosHistoricos].some(p=>p.sku==='ZN-GO-901'));
 assert.ok(!pub.colores.some(c=>c.id.startsWith('zn-go-901')));
});
test('con sesión del equipo sale oculta, solo para cotizar y con sus colores',()=>{
 const pub=projectPublic(PublicC,interno(),[],'https://p.supabase.co',true);
 assert.ok(!pub.productos.some(p=>p.sku==='ZN-GO-901'),'nunca como activa');
 const p=pub.productosHistoricos.find(p=>p.sku==='ZN-GO-901');
 assert.ok(p);assert.equal(p.soloCotizar,true);assert.equal(p.soloGestion,true);assert.equal(p.foto,'');
 assert.deepEqual(p.colores,['zn-go-901-c01','zn-go-901-c02']);
 assert.ok(pub.colores.some(c=>c.id==='zn-go-901-c02'&&c.hex==='#ccbb99'));
 // Lo demás no cambia respecto a la vista sin sesión.
 const sin=projectPublic(PublicC,interno(),[],'https://p.supabase.co');
 assert.equal(pub.productos.length,sin.productos.length);
});
test('config.js y el catálogo público del Edge no traen prendas soloGestion',()=>{
 const todas=[...PublicC.productos,...PublicC.productosHistoricos];
 assert.ok(!todas.some(p=>p.soloGestion));
 const gestion=new Set(C.productos.filter(p=>p.soloGestion).map(p=>p.sku));
 assert.ok(!todas.some(p=>gestion.has(p.sku)));
 const colores=new Set(C.productos.filter(p=>p.soloGestion).flatMap(p=>p.colores)),usados=new Set(todas.flatMap(p=>p.colores));
 assert.ok(!PublicC.colores.some(c=>colores.has(c.id)&&!usados.has(c.id)));
});
test('las prendas soloGestion cargadas: ocultas, sin marcas en sus textos, con colores, zonas y grupo de parecidas',async()=>{
 const {readFileSync}=await import('node:fs'),vm=await import('node:vm');
 const ctx={window:{}};vm.runInNewContext(readFileSync(new URL('../js/catalogo-parecidas.js',import.meta.url),'utf8'),ctx);
 const P=ctx.window.ZAINParecidas,todas=new Set(Object.values(P.GRUPOS).flat());
 for(const p of C.productos.filter(p=>p.soloGestion)){
  assert.equal(p.activo,false,p.sku);assert.equal(p.soloCotizar,true,p.sku);assert.equal(p.id,p.sku.toLowerCase());
  assert.match(p.sku,/^ZN-[A-Z]{2}-\d{3}$/);assert.ok(p.colores.length>0,p.sku);assert.ok(p.zonas.length>0&&p.pxPorCm>0,p.sku);
  for(const c of p.colores){const x=C.colores.find(k=>k.id===c);assert.ok(x&&/^#[0-9a-f]{6}$/.test(x.hex),c);}
  const texto=[p.nombre,p.descripcion,p.especificaciones,p.composicion].join(' ').toLowerCase();
  assert.doesNotMatch(texto,/\b(dimeo|dkps|fitcap|shaka|dickies|red kap|gildan|playerytees|wusstek|yazbek|bones|bibo|big bang|independent)\b/,p.sku);
  if(p.categoria!=='Bolsas')assert.ok(todas.has(p.sku),p.sku+' sin grupo de parecidas');
 }
});
