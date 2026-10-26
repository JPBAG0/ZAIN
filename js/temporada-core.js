// Reglas públicas de temporada. Sin costos, nombres de contactos ni identificadores de pedidos.
export const fechaCDMX=(fecha=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Mexico_City',year:'numeric',month:'2-digit',day:'2-digit'}).format(fecha);
const dia=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
export const vigente=(c,fecha=new Date())=>!!c&&c.activa===true&&dia(c.inicio)&&dia(c.fin)&&c.inicio<=c.fin&&fechaCDMX(fecha)>=c.inicio&&fechaCDMX(fecha)<=c.fin;
export const identificador=s=>typeof s==='string'&&/^[a-z0-9][a-z0-9-]{0,59}$/.test(s);
const positivo=n=>Number.isSafeInteger(n)&&n>0;
// Escalones de precio por kit: contiguos desde el mínimo, el último sin límite y sin subir de precio.
export function escalonesValidos(p){
 const e=p?.escalones;if(!Array.isArray(e)||!e.length||e.length>8)return false;
 return e.every((x,i)=>positivo(x.precio)&&positivo(x.desde)&&(i===e.length-1?x.hasta===null:positivo(x.hasta)&&x.hasta>=x.desde)&&x.desde===(i?e[i-1].hasta+1:p.minimoPaquetes)&&(!i||x.precio<=e[i-1].precio));
}
export function precioAprobado(p){
 const conEscalones=p?.escalones!==undefined;
 if(p?.estado!=='aprobado'||!positivo(p.minimoPaquetes)||!positivo(p.piezasPorPaquete)||![0,1600].includes(p.impuesto))return false;
 if(conEscalones?!escalonesValidos(p):!positivo(p.precioPaquete)||!positivo(p.precioPieza))return false;
 if(!Array.isArray(p.contenido)||!p.contenido.length||p.contenido.some(x=>!positivo(x.cantidad)||!x.producto||!['Bordado','Serigrafía','DTF'].includes(x.tecnica)||!['Frente','Espalda','Frente y espalda','Lateral izquierdo'].includes(x.ubicacion)))return false;
 return p.contenido.reduce((s,x)=>s+x.cantidad,0)===p.piezasPorPaquete&&(conEscalones||Math.abs(p.precioPieza-Math.round(p.precioPaquete/p.piezasPorPaquete))<=1);
}
export const precioDesde=p=>p.escalones?p.escalones.at(-1).precio:p.precioPaquete;
export function mensajePaquete(p){
 const aprobado=precioAprobado(p);
 return 'Hola ZAIN, quiero cotizar el paquete '+p.nombre+'. '+(aprobado?'Pedido mínimo: '+p.minimoPaquetes+(p.escalones?' kits':' paquetes')+'. Incluye '+p.contenido.map(x=>x.cantidad+' '+x.producto+' ('+x.tecnica+', '+x.ubicacion+')').join('; ')+'. ':'Quiero definir las cantidades, la personalización y el precio. ')+'¿Me ayudan a prepararlo para la posada de mi equipo?';
}
export const fotoTrabajo=s=>typeof s==='string'&&/^img\/trabajos\/[a-z0-9][a-z0-9-]*\.webp$/.test(s);
export function testimoniosPublicables(lista=[]){
 return Array.isArray(lista)?lista.filter(x=>x?.estado==='aprobado'&&x.permisoPublicar===true&&x.permisoImagen===true&&fotoTrabajo(x.foto)&&(x.frase===undefined||(typeof x.frase==='string'&&x.frase.trim()!=='PENDIENTE'))&&typeof x.producto==='string'&&x.producto.trim()):[];
}
