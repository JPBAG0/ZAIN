// Service worker de Gestión: solo muestra avisos push y abre el pedido. No guarda nada en caché.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('push',e=>{
 let d={};try{d=e.data?.json()||{};}catch{d={body:e.data?.text()||''};}
 const url=typeof d.url==='string'&&d.url.startsWith('/gestion-zain')?d.url:'/gestion-zain';
 e.waitUntil(self.registration.showNotification(d.title||'ZAIN',{body:d.body||'',tag:d.tag||undefined,icon:'/img/app-192.png',badge:'/img/app-192.png',data:{url}}));
});
self.addEventListener('notificationclick',e=>{
 e.notification.close();
 // El parámetro cambia en cada aviso para que la página recargue y abra la ficha del pedido.
 const destino=new URL(e.notification.data?.url||'/gestion-zain',self.location.origin);destino.searchParams.set('aviso',Date.now().toString(36));
 e.waitUntil((async()=>{
  const abiertas=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  const actual=abiertas.find(c=>new URL(c.url).pathname.startsWith('/gestion-zain'));
  if(actual){await actual.focus();return actual.navigate(destino.href);}
  return self.clients.openWindow(destino.href);
 })());
});
