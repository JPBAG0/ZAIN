import test from 'node:test';
import assert from 'node:assert/strict';
import C from '../server/config-interno.cjs';
import {resolveInternal} from '../server/catalogo-gestion.mjs';
import {validateOrder} from '../server/pedidos.mjs';

// 27-oct-2026: zona «Libre» del personalizador (cualquier lugar y tamaño; el render recorta lo que sale de la prenda).
const edits=C.productos.map(p=>({producto_id:p.idPublico||p.id,version:1,cambios:{activo:true,...(p.catalogo2026?{proveedor:'Proveedor ficticio',sku_proveedor:'REF-'+p.sku}:{})}}));
const cat=resolveInternal(C,edits);
const p=cat.productos.find(p=>p.catalogo2026&&p.tallas?.length);
const request=item=>({id:'12345678-1234-4123-8123-123456789abc',token:'a'.repeat(64),items:[item],files:[]});
const base=extra=>({p:p.id,colorId:p.colores[0],color:cat.colores.find(c=>c.id===p.colores[0]).nombre,tecnica:cat.tecnicas.find(t=>t.id===p.tecnicas[0]).nombre,piezas:12,tallasDetalle:{[p.tallas[0]]:12},zona:'Libre',cm:8,...extra});

test('la zona Libre se acepta en cualquier prenda y deja pasar logos grandes',()=>{
 const max=Math.floor(820/p.pxPorCm);
 assert.equal(validateOrder(request(base({cm:max})),{catalogo:cat,snapshot:true}).items[0].zona,'Libre');
 assert.ok(max>p.zonas.reduce((m,z)=>Math.max(m,z.max),0),'más grande que cualquier zona fija');
 assert.throws(()=>validateOrder(request(base({cm:max+1})),{catalogo:cat,snapshot:true}),{status:400});
});

test('una zona inventada sigue rechazándose',()=>{
 assert.throws(()=>validateOrder(request(base({zona:'Donde sea'})),{catalogo:cat,snapshot:true}),{status:400});
});
