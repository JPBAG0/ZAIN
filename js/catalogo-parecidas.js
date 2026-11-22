// Gestión → Catálogo (22-nov-2026): prendas parecidas de distintos proveedores y su costo por pieza.
// JP: «que sean como prendas casi iguales pero de diferente proveedor para ver precio y qué le ofrezco al cliente…
// si me pide playera, filtro a playera y que me salgan las de todos los proveedores y ya cotizarle la que más le
// convenga». Cada SKU va en un grupo; para mover una prenda de grupo basta con cambiarla de lista aquí.
// Los costos vienen de «precios-config» (privado, solo equipo) y nunca se guardan en este archivo.
(g=>{
'use strict';
const GRUPOS={
 'Playera básica de algodón':['ZN-PL-001','ZN-PL-002','ZN-PL-003','ZN-PL-004','ZN-PL-005','ZN-PL-012','ZN-PL-013','ZN-PL-014','ZN-PL-015','ZN-PL-019','ZN-PL-024','ZN-PL-025'],
 'Playera de algodón-poliéster':['ZN-PL-016','ZN-PL-017','ZN-PL-029','ZN-PL-032'],
 'Playera oversize':['ZN-PL-018','ZN-PL-033','ZN-PL-034','ZN-PL-035'],
 'Playera cuello V':['ZN-PL-020','ZN-PL-026','ZN-PL-030'],
 'Playera manga larga':['ZN-PL-010','ZN-PL-011','ZN-PL-021','ZN-PL-022','ZN-PL-027','ZN-PL-031'],
 'Playera sin mangas':['ZN-PL-023','ZN-PL-028'],
 'Playera deportiva':['ZN-PL-006','ZN-PL-007','ZN-PL-008','ZN-PL-009','ZN-PL-036','ZN-DE-001','ZN-DE-004','ZN-DE-005','ZN-DE-006'],
 'Playera deportiva manga larga':['ZN-DE-002','ZN-DE-003'],
 'Jersey deportivo':['ZN-DE-007','ZN-DE-008','ZN-DE-009'],
 'Polo de algodón o 50/50':['ZN-PO-001','ZN-PO-002','ZN-PO-003','ZN-PO-008','ZN-PO-009','ZN-PO-014','ZN-PO-015','ZN-PO-016','ZN-PO-018','ZN-PO-019'],
 'Polo deportivo':['ZN-PO-004','ZN-PO-005','ZN-PO-010','ZN-PO-011','ZN-PO-020','ZN-PO-021','ZN-PO-022','ZN-PO-023','ZN-PO-024'],
 'Polo manga larga':['ZN-PO-006','ZN-PO-007','ZN-PO-012','ZN-PO-013','ZN-PO-017'],
 'Camisa Oxford':['ZN-CM-001','ZN-CM-002','ZN-CM-003','ZN-CM-008','ZN-CM-009','ZN-CM-012','ZN-CM-013','ZN-CM-014','ZN-CM-015'],
 'Camisa de gabardina':['ZN-CM-004','ZN-CM-005','ZN-CM-006','ZN-CM-007','ZN-CM-018'],
 'Camisa de mezclilla':['ZN-CM-010','ZN-CM-011'],
 'Camisa de cuadros':['ZN-CM-019'],
 'Camisa de pesca o utilitaria':['ZN-CM-016','ZN-CM-017','ZN-CM-020'],
 'Sudadera cuello redondo':['ZN-SU-005','ZN-SU-007','ZN-SU-013'],
 'Sudadera con capucha':['ZN-SU-001','ZN-SU-003','ZN-SU-006','ZN-SU-009','ZN-SU-011','ZN-SU-012','ZN-SU-014'],
 'Sudadera con cierre':['ZN-SU-002','ZN-SU-004','ZN-SU-008','ZN-SU-010'],
 'Chamarra softshell':['ZN-CH-001','ZN-CH-002','ZN-CH-004'],
 'Rompevientos':['ZN-CH-003','ZN-CH-007','ZN-CH-008'],
 'Chamarra acolchada':['ZN-CH-005'],
 'Chamarra universitaria':['ZN-CH-006'],
 'Chaleco softshell':['ZN-CE-001','ZN-CH-009'],
 'Chaleco acolchado':['ZN-CE-002','ZN-CH-010'],
 'Pants deportivo':['ZN-PA-001'],
 'Pantalón de mezclilla':['ZN-PA-002'],
 'Pantalón stretch':['ZN-PA-003'],
 'Playera infantil de algodón':['ZN-IN-001','ZN-IN-005','ZN-IN-006'],
 'Playera infantil deportiva':['ZN-IN-004','ZN-IN-007','ZN-IN-008'],
 'Polo infantil':['ZN-IN-003','ZN-IN-009'],
 'Sudadera infantil':['ZN-IN-002','ZN-IN-010'],
 'Gorra clásica':['ZN-GO-001','ZN-GO-002','ZN-GO-003','ZN-GO-005','ZN-GO-023','ZN-GO-025'],
 'Gorra trucker':['ZN-GO-004','ZN-GO-006','ZN-GO-008','ZN-GO-009','ZN-GO-014','ZN-GO-015','ZN-GO-016','ZN-GO-017','ZN-GO-018','ZN-GO-019','ZN-GO-020','ZN-GO-021','ZN-GO-022','ZN-GO-024'],
 'Gorra deportiva':['ZN-GO-007','ZN-GO-010','ZN-GO-011','ZN-GO-012','ZN-GO-013'],
 'Gorra outdoor':['ZN-GO-026','ZN-GO-028','ZN-GO-030'],
 'Sombrero':['ZN-GO-027','ZN-GO-029']
};
const ORDEN=Object.keys(GRUPOS),POR_SKU=new Map();
for(const [grupo,skus] of Object.entries(GRUPOS))for(const sku of skus)POR_SKU.set(sku,grupo);
// Una prenda nueva sin grupo se queda con el nombre de su categoría (por ejemplo «Bolsas»).
const grupoDe=p=>POR_SKU.get(p?.sku)||p?.categoria||'Otras';
const ordenGrupo=grupo=>{const i=ORDEN.indexOf(grupo);return i<0?ORDEN.length:i;};
const vale=(b,n)=>b&&b.costo!=null&&n>=(b.desdePiezas??1)&&(b.hastaPiezas==null||n<=b.hastaPiezas);
// Costo por pieza (centavos) para n piezas: el de la talla más barata (S a XL), más «otros». null si no hay costo.
function costoPara(c,n){
 if(!c)return null;const otros=Number(c.otros)||0;
 if(Array.isArray(c.bandas)&&c.bandas.length){const v=c.bandas.filter(b=>vale(b,n)).map(b=>b.costo);return v.length?Math.min(...v)+otros:null;}
 return c.prenda==null?null:c.prenda+otros;
}
// Tramos de cantidad para la ficha: [{desde,hasta,costo (talla más barata),mayor (talla más cara)}]. Corta en cada
// inicio y fin de banda, así que funciona aunque las tallas tengan tramos distintos; los huecos no salen.
function tramos(c){
 if(!c)return [];const otros=Number(c.otros)||0;
 if(!Array.isArray(c.bandas)||!c.bandas.length)return c.prenda==null?[]:[{desde:1,hasta:null,costo:c.prenda+otros,mayor:c.prenda+otros}];
 const bs=c.bandas.filter(b=>b.costo!=null),cortes=[...new Set(bs.flatMap(b=>[b.desdePiezas??1,...(b.hastaPiezas==null?[]:[b.hastaPiezas+1])]))].sort((a,b)=>a-b),out=[];
 cortes.forEach((a,i)=>{
  const fin=i+1<cortes.length?cortes[i+1]-1:null,v=bs.filter(b=>vale(b,a)).map(b=>b.costo+otros);if(!v.length)return;
  const t={desde:a,hasta:fin,costo:Math.min(...v),mayor:Math.max(...v)},u=out.at(-1);
  if(u&&u.hasta===a-1&&u.costo===t.costo&&u.mayor===t.mayor)u.hasta=fin;else out.push(t);
 });
 return out;
}
g.ZAINParecidas={GRUPOS,grupoDe,ordenGrupo,costoPara,tramos};
})(typeof window!=='undefined'?window:globalThis);
