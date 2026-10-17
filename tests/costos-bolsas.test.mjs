import test from 'node:test';
import assert from 'node:assert/strict';
import {inicial,configurar,generar,calcular,entrada,paraCliente} from '../js/cotizacion-core.js';
import {vincularCostos,sincronizarCostos} from '../server/cotizacion-costos.mjs';
const cfg=()=>({...inicial(),prendas:[{sku:'ZN-BO-099',prenda:null,otros:0,bandas:[
 {tallas:[],colores:[],desdePiezas:1,hastaPiezas:49,costo:1701},
 {tallas:[],colores:[],desdePiezas:50,hastaPiezas:99,costo:1202},
 {tallas:[],colores:[],desdePiezas:100,hastaPiezas:null,costo:803}
],fuente:'Lista de prueba; IVA incluido'}]});
const bolsa=n=>({sku:'ZN-BO-099',nombre:'Bolsa de prueba',color:'Rojo',tecnica:'Serigrafía',piezas:n,tallasDetalle:{},cm:10});
test('bolsas sin tallas seleccionan el costo en cada límite de cantidad',()=>{
 for(const [n,costo] of [[1,1701],[49,1701],[50,1202],[99,1202],[100,803],[300,803],[9999,803]]){
  const p=generar([bolsa(n)],cfg()).partidas[0];assert.equal(p.costoPrendas,n*costo);assert.equal(p.detalleCostosTalla[0].costo,costo);
 }
 assert.equal(generar([{...bolsa(100),tallasDetalle:undefined}],cfg()).partidas[0].costoPrendas,80300);
});
test('el umbral se aplica por partida, sin sumar modelos o colores distintos',()=>{
 const q=generar([bolsa(50),{...bolsa(50),color:'Negro'}],cfg());assert.deepEqual(q.partidas.map(p=>p.costoPrendas),[60100,60100]);
});
test('cambiar los cortes conserva centavos exactos y deja pendiente un hueco o costo desconocido',()=>{
 const c=cfg();c.prendas[0].bandas[1].hastaPiezas=149;c.prendas[0].bandas[2].desdePiezas=150;
 assert.equal(generar([bolsa(100)],c).partidas[0].costoPrendas,120200);
 c.prendas[0].bandas[1].hastaPiezas=98;assert.equal(generar([bolsa(99)],c).partidas[0].costoPrendas,null);
 c.prendas[0].bandas[2].costo=null;assert.equal(generar([bolsa(150)],c).partidas[0].costoPrendas,null);
 c.prendas[0].bandas[2].costo=0;assert.equal(generar([bolsa(150)],c).partidas[0].costoPrendas,0);
});
test('se rechazan cantidades inválidas y traslapes incluso entre bandas generales y de talla',()=>{
 for(const [key,value] of [['desdePiezas',0],['desdePiezas',1.5],['hastaPiezas',-1]]){
  const c=cfg();c.prendas[0].bandas[0][key]=value;assert.throws(()=>configurar(c));
 }
 const c=cfg();c.prendas[0].bandas[1].desdePiezas=49;assert.throws(()=>configurar(c));
 const d=cfg();d.prendas[0].bandas.push({tallas:['M'],colores:[],costo:1});assert.throws(()=>configurar(d));
});
test('bandas sin talla respetan colores y no encubren un desglose inválido',()=>{
 const c=cfg();c.prendas[0].bandas.forEach(b=>b.colores=['Rojo']);
 assert.equal(generar([{...bolsa(100),color:'Negro'}],c).partidas[0].costoPrendas,null);
 assert.throws(()=>generar([{...bolsa(100),tallasDetalle:{M:99}}],c));
});
test('actualizar costos trae las bandas nuevas y conserva precio propio y revisión comercial anterior',()=>{
 const item=bolsa(100),c=cfg(),old=vincularCostos(generar([item],c),7),v=entrada(old);v.partidas[0].precio=2000;v.impuesto=0;
 const b={...calcular([item],v),origenCostos:old.origenCostos};
 const snapshot=structuredClone(b);const siguiente=cfg();siguiente.prendas[0].bandas[2].costo=800;
 const sync=sincronizarCostos([item],b,{datos:siguiente,version:8});assert.equal(sync.partidas[0].precioManual,2000);
 assert.equal(calcular([item],sync).partidas[0].costoPrendas,80000);
 assert.equal(calcular([item],snapshot).partidas[0].costoPrendas,80300);
 const out=paraCliente(calcular([item],sync));for(const k of ['bandas','fuente','costoPrendas','detalleCostosTalla'])assert.ok(!JSON.stringify(out).includes('"'+k+'"'));
});
