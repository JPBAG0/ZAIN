import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const codigo=await readFile(new URL('../js/catalogo-cargar.js',import.meta.url),'utf8');
const respaldo=JSON.parse(await readFile(new URL('../js/catalogo-respaldo.json',import.meta.url),'utf8'));
const cat=(nombre,cat='Playeras')=>({productos:[{id:'p1',nombre,categoria:cat}],productosHistoricos:[],categoriasCatalogo:[cat],muestrasPortada:[],colores:[]});
function cargar({api,sitio,local}){
 const store=new Map(local?[['zain-catalogo-respaldo',JSON.stringify(local)]]:[]);
 const ZAIN={pedidosApi:'https://api.test/f',productos:[{id:'viejo'}],productosHistoricos:[]};
 const fetch=async url=>{
  if(url.startsWith('https://api.test')){if(!api)throw Error('caída');return {ok:true,json:async()=>({catalogo:api})};}
  if(url==='js/catalogo-respaldo.json'){if(!sitio)return {ok:false};return {ok:true,json:async()=>sitio};}
  throw Error('url inesperada '+url);
 };
 const localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
 const ctx={window:{ZAIN},fetch,localStorage,AbortSignal,JSON,Date,Number,Array,Object,Set,String,Error};ctx.window.ZAIN=ZAIN;
 vm.runInNewContext(codigo,ctx);
 return {ZAIN,store,listo:ctx.window.ZAINCatalogoListo};
}
test('el respaldo publicado es un catálogo válido con fotos locales',()=>{
 assert.ok(Date.parse(respaldo.generado));assert.ok(respaldo.catalogo.productos.length>0);
 assert.ok(!/https?:\/\//.test(JSON.stringify(respaldo.catalogo)));
});
test('con la API arriba usa el catálogo vigente y guarda copia en el navegador',async()=>{
 const x=cargar({api:cat('Vigente')});assert.equal(await x.listo,true);
 assert.equal(x.ZAIN.productos[0].nombre,'Vigente');assert.equal(x.ZAIN.catalogoRespaldo,undefined);
 assert.equal(JSON.parse(x.store.get('zain-catalogo-respaldo')).catalogo.productos[0].nombre,'Vigente');
});
test('si la API falla usa la copia más reciente entre navegador y sitio',async()=>{
 const viejo=Date.parse('2026-10-01T00:00:00Z'),nuevo=Date.parse('2026-10-15T00:00:00Z');
 let x=cargar({local:{t:nuevo,catalogo:cat('Navegador','Sudaderas')},sitio:{generado:new Date(viejo).toISOString(),catalogo:cat('Sitio')}});
 assert.equal(await x.listo,true);assert.equal(x.ZAIN.productos[0].nombre,'Navegador');assert.equal(x.ZAIN.catalogoRespaldo,true);
 assert.equal(x.ZAIN.productos[0].categoria,'Chamarras y sudaderas');
 x=cargar({local:{t:viejo,catalogo:cat('Navegador')},sitio:{generado:new Date(nuevo).toISOString(),catalogo:cat('Sitio')}});
 assert.equal(await x.listo,true);assert.equal(x.ZAIN.productos[0].nombre,'Sitio');
});
test('sin API ni copias válidas muestra el catálogo como no disponible',async()=>{
 const x=cargar({local:{t:1,catalogo:{productos:[]}},sitio:{generado:'mal',catalogo:cat('X')}});
 assert.equal(await x.listo,false);assert.equal(x.ZAIN.catalogoNoDisponible,true);assert.equal(x.ZAIN.productos.length,0);
});
