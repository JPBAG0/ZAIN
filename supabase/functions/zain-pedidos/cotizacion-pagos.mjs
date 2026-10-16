const MAX=100000000000;
export const pagosIniciales=()=>({anticipo:5000,instrucciones:'Coordina con ZAIN los datos para el anticipo.'});
export function normalizarPagos(p){
 if(p==null)return null;
 if(typeof p!=='object'||Array.isArray(p)||!Number.isSafeInteger(p.anticipo)||p.anticipo<0||p.anticipo>10000||typeof p.instrucciones!=='string'||p.instrucciones.length>1000)throw Error('Revisa el porcentaje de anticipo y las instrucciones de pago.');
 return {anticipo:p.anticipo,instrucciones:p.instrucciones.replace(/[\x00-\x1f\x7f]/g,' ').trim()};
}
export function anticipoDe(total,p){
 if(total==null||p==null)return null;
 if(!Number.isSafeInteger(total)||total<0||total>MAX)throw Error('Importe inválido.');
 const pagos=normalizarPagos(p);return Number((BigInt(total)*BigInt(pagos.anticipo)+5000n)/10000n);
}
export function terminosPago(p){const v=normalizarPagos(p);if(!v)return '';
 return (v.anticipo/100)+'% de anticipo para programar la producción y '+((10000-v.anticipo)/100)+'% restante antes del envío. La aceptación de la cotización no registra un pago. '+v.instrucciones;
}
