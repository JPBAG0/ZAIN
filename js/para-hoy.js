// «Para hoy» de Gestión (JP, 11-nov-2026): los pedidos activos agrupados por lo que toca hacer, no por fecha.
// Cálculo puro (sin pantalla) para poder probarlo. Importes en centavos, con IVA.
export const GRUPOS=[
 ['cotizar','Por cotizar','Solicitudes sin cotización'],
 ['respuesta','Cotizadas sin respuesta','El cliente no ha contestado'],
 ['anticipo','Aceptadas · falta anticipo','Ya dijeron que sí; falta el depósito'],
 ['entregar','Por entregar','Confirmados y en producción'],
 ['cobrar','Entregados · falta cobrar','Ya se entregó y queda saldo'],
];
const HORA=3600000,DIA=24*HORA;
export function hace(desde,ahora=Date.now()){
 const ms=Math.max(0,ahora-new Date(desde).getTime());
 if(!Number.isFinite(ms))return '';
 if(ms<HORA)return 'hace menos de 1 h';
 if(ms<DIA)return 'hace '+Math.floor(ms/HORA)+' h';
 const d=Math.floor(ms/DIA);return 'hace '+d+(d===1?' día':' días');
}
export const pesos=n=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(n/100);
const num=n=>n==null||n===''||!Number.isFinite(Number(n))?null:Number(n);
// Lo que falta cobrar de un pedido: null si todavía no tiene cotización publicada.
export function saldo(p){const v=num(p.venta_total);return v==null?null:Math.max(0,v-(num(p.cobrado)||0));}
export function agrupar(pedidos,ahora=Date.now()){
 const g=Object.fromEntries(GRUPOS.map(([k])=>[k,[]]));
 for(const p of pedidos||[]){
  const edad=ahora-new Date(p.desde||p.created_at).getTime(),cuando=hace(p.desde||p.created_at,ahora),s=saldo(p),v=num(p.venta_total);
  const base={id:p.id,folio:p.folio,titulo:p.cliente||p.folio,resumen:p.resumen||'',piezas:Number(p.total)||0,edad};
  if(p.estado==='nuevo'||p.estado==='contactado')g.cotizar.push({...base,detalle:'Llegó '+cuando,urgente:edad>DIA,pestana:'cotizacion'});
  else if(p.estado==='cotizado')g.respuesta.push({...base,detalle:'Cotizada '+cuando+(v==null?'':' · '+pesos(v)),urgente:edad>2*DIA,pestana:'cobro',monto:v});
  else if(p.estado==='aceptado'){
   const req=num(p.anticipo_requerido),falta=req==null?null:Math.max(0,req-(num(p.cobrado)||0));
   g.anticipo.push({...base,detalle:'Aceptada '+cuando+(falta?' · falta '+pesos(falta):''),urgente:edad>2*DIA,pestana:'cobro',monto:falta});
  }
  else if(p.estado==='confirmado'||p.estado==='produccion')g.entregar.push({...base,detalle:(p.estado==='produccion'?'En producción ':'Confirmado ')+cuando+(s?' · por cobrar '+pesos(s):''),urgente:edad>10*DIA,pestana:'resumen',monto:s});
  // Entregado con saldo: se entregó y no han terminado de pagar (JP, 11-nov-2026). Sin saldo ya no hay nada que hacer aquí.
  else if(p.estado==='entregado'&&s>0)g.cobrar.push({...base,detalle:'Entregado '+cuando+' · falta cobrar '+pesos(s),urgente:true,pestana:'cobro',monto:s});
 }
 // Lo más viejo primero: es lo que más urge.
 return GRUPOS.map(([clave,titulo,ayuda])=>{const filas=g[clave].sort((a,b)=>b.edad-a.edad),total=filas.reduce((n,f)=>n+(f.monto||0),0);return {clave,titulo,ayuda,filas,urgentes:filas.filter(f=>f.urgente).length,total};});
}
