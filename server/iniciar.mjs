import {createServer} from 'node:http';
import {readFile,realpath} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname,sep} from 'node:path';
import {createHandler} from './pedidos.mjs';

const root=fileURLToPath(new URL('../',import.meta.url)),handler=createHandler(process.env);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8'};
const port=Number(process.env.PORT||8086);if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT inválido');
createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost:'+port);
    if(url.pathname==='/api/pedidos') {
      const parts=[];let bytes=0;const bodyLimit=req.headers['content-type']==='image/webp'?4*1024*1024:128*1024;
      for await(const chunk of req){bytes+=chunk.length;if(bytes>bodyLimit){res.writeHead(413);res.end('Solicitud demasiado grande');return;}parts.push(chunk);}
      const body=Buffer.concat(parts);
      const r=await handler(new Request(url,{method:req.method,headers:req.headers,...(body.length?{body}:{} )}));
      res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));return;
    }
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
    let path=decodeURIComponent(url.pathname);if(path==='/')path='/index.html';if(['/pedidos','/gestion-zain','/mi-pedido'].includes(path))path+='.html';
    // Sirve exclusivamente la página y sus recursos. Nunca el código del servidor.
    if(path.includes('\\')||path.split('/').some(x=>x.startsWith('.'))||!/^\/(?:index\.html|pedidos\.html|gestion-zain\.html|mi-pedido\.html|robots\.txt|favicon\.ico|(?:js|css|img)\/[^?]+)$/.test(path)){res.writeHead(404);res.end('No encontrado');return;}
    const file=await realpath(resolve(root,'.'+path));const realRoot=await realpath(root);
    if(!file.startsWith(realRoot+sep)){res.writeHead(404);res.end();return;}
    const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',...(['pedidos','gestion-zain','mi-pedido'].some(p=>path==='/'+p+'.html')?{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}:{})});res.end(req.method==='HEAD'?undefined:data);
  }catch{res.writeHead(404);res.end('No encontrado');}
}).listen(port,process.env.HOST||'127.0.0.1',()=>console.log('ZAIN listo en el puerto '+port));
