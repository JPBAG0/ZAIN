import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,webcrypto} from 'node:crypto';
import {validarArchivo,prepararAdjunto} from '../js/chats-adjuntos.js';
const data=Buffer.from('%PDF-1.4\nPDF FICTICIO\n%%EOF\n');
const archivo=(x={})=>({name:'Cotizacion.pdf',type:'application/pdf',size:data.length,arrayBuffer:async()=>data,...x});
test('PDF adjunto se prepara con hash y referencia de revisión sin enviar ni guardar',async()=>{globalThis.crypto??=webcrypto;const a=await prepararAdjunto(archivo(),{tipo:'modelo',id:'11111111-1111-4111-8111-111111111111',version:3});assert.equal(a.meta.hash,createHash('sha256').update(data).digest('hex'));assert.equal(a.meta.origen.version,3);assert.equal(a.meta.nombre,'Cotizacion.pdf');});
test('adjuntos rechaza formatos activos, tamaño excesivo y MIME contradictorio',()=>{for(const x of [{name:'ataque.html',type:'text/html'},{size:8388609},{size:0},{name:'Imagen.png'}])assert.throws(()=>validarArchivo(archivo(x)),/hasta 8 MB/);assert.equal(validarArchivo(archivo({type:''})).mime,'application/pdf');assert.equal(validarArchivo(archivo({name:'Precios.xlsx',type:''})).mime,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');});
