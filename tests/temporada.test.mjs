import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import C from '../server/config-interno.cjs';
import Pub from '../js/config.js';
import {vigente,precioAprobado,precioDesde,escalonesValidos,mensajePaquete,testimoniosPublicables,fotoTrabajo} from '../js/temporada-core.js';
import {proponerPaquete} from '../server/calcular-posadas.mjs';
import {faltanMedidas} from '../server/inventario-medidas.mjs';
import {inicial} from '../js/cotizacion-core.js';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const campana={activa:true,inicio:'2026-11-01',fin:'2026-12-31'};
const paquete={id:'gorra-chaleco',nombre:'Gorra + chaleco',estado:'aprobado',minimoPaquetes:50,piezasPorPaquete:2,precioPaquete:20000,precioPieza:10000,impuesto:1600,contenido:[{producto:'Gorra',cantidad:1,tecnica:'Bordado',ubicacion:'Frente'},{producto:'Chaleco',cantidad:1,tecnica:'Bordado',ubicacion:'Frente y espalda'}]};
test('fechas inclusivas CDMX, apagado y fechas inválidas cierran la temporada',()=>{
 assert.equal(vigente(campana,new Date('2026-11-01T05:59:59Z')),false);assert.equal(vigente(campana,new Date('2026-11-01T06:00:00Z')),true);
 assert.equal(vigente(campana,new Date('2027-01-01T05:59:59Z')),true);assert.equal(vigente(campana,new Date('2027-01-01T06:00:00Z')),false);
 for(const c of [{...campana,activa:false},{...campana,inicio:null},{...campana,fin:'2026-02-31'},{...campana,inicio:'2027-01-01'}])assert.equal(vigente(c,new Date('2026-12-01T12:00:00Z')),false);
});
test('precios y cantidades solo se muestran tras aprobación completa y consistente',()=>{
 assert.ok(precioAprobado(paquete));assert.match(mensajePaquete(paquete),/50 paquetes/);assert.match(mensajePaquete(paquete),/Frente y espalda/);
 for(const cambio of [{estado:'PENDIENTE'},{precioPaquete:null},{piezasPorPaquete:3},{precioPieza:1},{impuesto:null},{contenido:[{producto:'Gorra',cantidad:2}]}])assert.equal(precioAprobado({...paquete,...cambio}),false);
 assert.match(mensajePaquete({...paquete,estado:'PENDIENTE'}),/definir las cantidades/);
});
test('kits por escalones: contiguos desde el mínimo, sin subir de precio y último sin límite',()=>{
 const kit={...paquete,minimoPaquetes:20,precioPaquete:undefined,precioPieza:undefined,escalones:[{desde:20,hasta:49,precio:33900},{desde:50,hasta:null,precio:29900}]};delete kit.precioPaquete;delete kit.precioPieza;
 assert.ok(precioAprobado(kit));assert.equal(precioDesde(kit),29900);assert.match(mensajePaquete(kit),/20 kits/);
 for(const e of [[],[{desde:21,hasta:null,precio:100}],[{desde:20,hasta:49,precio:100},{desde:51,hasta:null,precio:90}],[{desde:20,hasta:49,precio:100},{desde:50,hasta:null,precio:120}],[{desde:20,hasta:49,precio:100}],[{desde:20,hasta:null,precio:0}]])assert.equal(precioAprobado({...kit,escalones:e}),false);
});
test('catálogo generado publica tres kits aprobados y tres testimonios sin identidad',()=>{
 assert.deepEqual(Pub.posadas,C.posadas);assert.deepEqual(Pub.clientesSatisfechos,C.clientesSatisfechos);
 assert.deepEqual(Pub.posadas.paquetes.map(p=>[p.id,precioDesde(p)]),[['kit-posada',19900],['kit-equipo',27900],['kit-regalo',49900]]);
 for(const p of Pub.posadas.paquetes){assert.ok(precioAprobado(p),p.id);assert.ok(escalonesValidos(p));assert.equal(p.minimoPaquetes,20);assert.ok(p.contenido.every(x=>/^ZN-[A-Z]{2}-\d{3}$/.test(x.sku)));}
 assert.equal(Pub.posadas.paquetes.filter(p=>p.destacado).length,1);
 assert.equal(Pub.clientesSatisfechos.length,3);assert.equal(testimoniosPublicables(Pub.clientesSatisfechos).length,0);
 for(const t of Pub.clientesSatisfechos){assert.equal(t.empresa,'');assert.equal(t.frase,'');assert.equal(t.foto,'');}
});
test('testimonios: estado, permiso de imagen y publicación explícitos; rutas externas rechazadas',()=>{
 const valido={estado:'aprobado',permisoPublicar:true,permisoImagen:true,foto:'img/trabajos/ejemplo.webp',frase:'Comentario ficticio.',producto:'Producto de prueba'};
 assert.equal(testimoniosPublicables([valido]).length,1);
 for(const cambio of [{estado:'PENDIENTE'},{permisoPublicar:false},{permisoImagen:false},{frase:'PENDIENTE'},{foto:'https://ajeno.test/foto.webp'},{foto:'img/trabajos/../otro.webp'},{producto:''}])assert.equal(testimoniosPublicables([{...valido,...cambio}]).length,0);
 assert.equal(fotoTrabajo('javascript:alert(1)'),false);
});
test('propuesta privada usa margen por piezas del motor; costos incompletos no producen precio final',()=>{
 const cfg=inicial();cfg.prendas=[{sku:'ZN-GO-002',prenda:10000,otros:0}];
 const referencia=n=>proponerPaquete({id:'ficticio',cantidadPaquetes:n,componentes:[{sku:'ZN-GO-002',cantidad:1}]},cfg);
 for(const [cantidad,margen,precio] of [[14,4000,16667],[15,3500,15385],[50,3000,14286],[100,2500,13334]]){
  const p=referencia(cantidad);assert.equal(p.componentesPropuestos[0].margen,margen);assert.equal(p.referenciaPorPaquete,precio);assert.equal(p.precioFinal,null);assert.equal(p.propuestaConPersonalizacionSinIVA,null);
 }
 assert.equal(proponerPaquete({id:'sin-costos',cantidadPaquetes:50,componentes:[{sku:'ZN-GO-002',cantidad:1}]}).referenciaSoloPrendasSinPersonalizacion,null);
});
test('auditoría distingue tabla, detalle y unitalla sin completar medidas',()=>{
 const x=faltanMedidas({productos:[{sku:'A',tallas:['M']},{sku:'B',tablaTallas:{M:{ancho:10}},detalleMedidas:''},{sku:'C',tallas:[],detalleMedidas:'Dimensiones documentadas'},{sku:'D',tablaTallas:{M:{}},detalleMedidas:'Guía'},{sku:'E',activo:false}]});
 assert.deepEqual(x.map(p=>p.sku),['A','B','C']);assert.equal(x[1].faltaTabla,false);assert.equal(x[1].faltaDetalle,true);assert.equal(x[2].tallas.length,0);
});
test('portada incluye ambas secciones, enlaces, cierre accesible y versiones nuevas',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 for(const texto of ['id="paquetes"','id="clientes-satisfechos"','id="navClientes"','id="cerrarPosada"','temporada.js?v=3','temporada.css?v=2','config.js?v=38','id="notaPaquetes"','medicion.js?v=5'])assert.ok(html.includes(texto),texto);
 assert.ok(html.indexOf('id="posadaBanner"')<html.indexOf('<header class="barra"'));
});

test('la calculadora rechaza guardar costos privados dentro del sitio',()=>{
 const raiz=fileURLToPath(new URL('../',import.meta.url));
 const resultado=spawnSync(process.execPath,['server/calcular-posadas.mjs','--salida','docs/no-debe-existir.json'],{cwd:raiz,encoding:'utf8'});
 assert.notEqual(resultado.status,0);assert.match(resultado.stderr,/fuera del repositorio/);
});
