import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import C from '../server/config-interno.cjs';
import Pub from '../js/config.js';
import {validateOrder} from '../server/pedidos.mjs';
// Se ejercita el máximo del editor real contra el servidor, sin duplicar la fórmula.
const editor=readFileSync(new URL('../js/zain.js',import.meta.url),'utf8');
const expression=editor.match(/const maxLogo = (\(z\) => [^;]+);/)[1];
const editorMax=runInNewContext('('+expression+')',{C:Pub});
const body=item=>({id:'12345678-1234-4123-8123-123456789abc',token:'a'.repeat(64),items:[item],files:[]});
function selection(p,z){const col=C.colores.find(c=>c.id===p.colores[0]);return {p:p.id,color:col.nombre,colorId:col.idPublico||col.id,colorCodigo:col.codigo,tecnica:C.tecnicas.find(t=>t.id===p.tecnicas[0]).nombre,piezas:5,tallasDetalle:{[p.tallas.includes('M')?'M':p.tallas[0]]:5},zona:z.nombre+' (posición ajustada)',cm:editorMax(z)};}
const check=(item,cat=C)=>validateOrder(body(item),{allowHistoricos:true,catalogo:cat,snapshot:true});
test('logo de11.5cm elegido en polo o chaleco se envía sin recortar tamaño ni posición',()=>{
 for(const sku of ['ZN-PO-008','ZN-CE-001','ZN-PL-004']){const p=C.productos.find(p=>p.sku===sku),z=p.zonas[0],v=selection(p,z);assert.ok(v.cm>=11.5);v.cm=11.5;const saved=check(v).items[0];assert.equal(saved.cm,11.5);assert.equal(saved.zona,v.zona);}
});
test('todas las zonas del catálogo aceptan el máximo real que ofrece el editor y rechazan el siguiente paso',()=>{
 let checked=0;
 for(const p of C.productos.filter(p=>p.fabricante||p.catalogo2026))for(const z of p.zonas){const item=selection(p,z);assert.equal(check(item).items[0].cm,item.cm,p.sku+' '+z.nombre);assert.throws(()=>check({...item,cm:item.cm+.5}),/tamaño/);checked++;}
 assert.ok(checked>50);
});
test('zonas orientativas de nuevas altas no reciben ampliación doble',()=>{
 const cat=structuredClone(C),p=cat.productos.find(p=>p.sku==='ZN-CE-001');p.catalogo2026=false;p.creadoGestion=true;p.activo=true;p.zonas[0].orientativa=true;const z=p.zonas[0],item=selection(p,z);assert.equal(item.cm,9);assert.equal(check(item,cat).items[0].cm,9);assert.throws(()=>check({...item,cm:9.5},cat),/tamaño/);
});
test('conserva rechazo de zona desconocida y tamaños no numéricos o fuera del control',()=>{
 const p=C.productos.find(p=>p.sku==='ZN-CE-001'),v=selection(p,p.zonas[0]);for(const cm of [NaN,Infinity,-1,200,'11.5',null])assert.throws(()=>check({...v,cm}),/tamaño/);assert.throws(()=>check({...v,zona:'Zona ajena'}),/ubicación/);
});
