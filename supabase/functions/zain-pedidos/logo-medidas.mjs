// Proporción del logo preparado; dimensiones de cobro en centésimas de cm.
export function normalizarGeometria(g){
 if(!g||typeof g!=='object'||Array.isArray(g))return null;
 const {anchoPx,altoPx,anchoCm}=g;
 if(!Number.isSafeInteger(anchoPx)||!Number.isSafeInteger(altoPx)||anchoPx<1||altoPx<1||anchoPx>16384||altoPx>16384||!Number.isFinite(anchoCm)||anchoCm<0.01||anchoCm>200||Math.abs(anchoCm*100-Math.round(anchoCm*100))>1e-7)return null;
 return {anchoPx,altoPx,anchoCm};
}
export function medidasLogo(cm,geometria){
 const g=normalizarGeometria(geometria);if(!g||!Number.isFinite(cm)||cm<=0||g.anchoCm>cm+0.01)return null;
 const ancho=Math.round(g.anchoCm*100),alto=Math.round(ancho*g.altoPx/g.anchoPx);
 return alto>=1&&alto<=20000?{ancho,alto}:null;
}
