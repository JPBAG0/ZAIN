// Reglas públicas de temporada. Sin costos, nombres de contactos ni identificadores de pedidos.
export const fechaCDMX=(fecha=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Mexico_City',year:'numeric',month:'2-digit',day:'2-digit'}).format(fecha);
const dia=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
export const vigente=(c,fecha=new Date())=>!!c&&c.activa===true&&dia(c.inicio)&&dia(c.fin)&&c.inicio<=c.fin&&fechaCDMX(fecha)>=c.inicio&&fechaCDMX(fecha)<=c.fin;
export const identificador=s=>typeof s==='string'&&/^[a-z0-9][a-z0-9-]{0,59}$/.test(s);
const positivo=n=>Number.isSafeInteger(n)&&n>0;
export function precioAprobado(p){
 if(p?.estado!=='aprobado'||!positivo(p.minimoPaquetes)||!positivo(p.piezasPorPaquete)||!positivo(p.precioPaquete)||!positivo(p.precioPieza)||![0,1600].includes(p.impuesto))return false;
 if(!Array.isArray(p.contenido)||!p.contenido.length||p.contenido.some(x=>!positivo(x.cantidad)||!x.producto||!['Bordado','Serigrafía','DTF'].includes(x.tecnica)||!['Frente','Espalda','Frente y espalda','Lateral izquierdo'].includes(x.ubicacion)))return false;
 return p.contenido.reduce((s,x)=>s+x.cantidad,0)===p.piezasPorPaquete&&Math.abs(p.precioPieza-Math.round(p.precioPaquete/p.piezasPorPaquete))<=1;
}
export function mensajePaquete(p){
 const aprobado=precioAprobado(p);
 return 'Hola ZAIN, quiero cotizar el paquete '+p.nombre+'. '+(aprobado?'Pedido mínimo: '+p.minimoPaquetes+' paquetes. Incluye '+p.contenido.map(x=>x.cantidad+' '+x.producto+' ('+x.tecnica+', '+x.ubicacion+')').join('; ')+'. ':'Quiero definir las cantidades, la personalización y el precio. ')+'¿Me ayudan a prepararlo para la posada de mi equipo?';
}
export const fotoTrabajo=s=>typeof s==='string'&&/^img\/trabajos\/[a-z0-9][a-z0-9-]*\.webp$/.test(s);
export function testimoniosPublicables(lista=[]){
 return Array.isArray(lista)?lista.filter(x=>x?.estado==='aprobado'&&x.permisoPublicar===true&&x.permisoImagen===true&&fotoTrabajo(x.foto)&&typeof x.frase==='string'&&x.frase.trim()&&x.frase!=='PENDIENTE'&&typeof x.producto==='string'&&x.producto.trim()):[];
}
