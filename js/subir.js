// Un único acceso al inicio, tanto en la tienda como en gestión.
(() => {
 const button=document.createElement('button');
 button.type='button';button.className='volver-arriba'+(document.querySelector('#flotante')?' volver-arriba--con-whatsapp':'');
 button.setAttribute('aria-label','Volver arriba');button.title='Volver arriba';button.hidden=true;
 button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12 6-6 6 6M12 6v13"/></svg>';
 document.body.append(button);
 function refresh(){const hidden=window.scrollY<Math.max(480,innerHeight*.7);if(button.hidden!==hidden)button.hidden=hidden;}
 addEventListener('scroll',refresh,{passive:true});addEventListener('scrollend',refresh);addEventListener('resize',refresh);addEventListener('pageshow',refresh);
 button.addEventListener('click',()=>{button.hidden=true;window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});document.querySelector('header a')?.focus({preventScroll:true});});
 new ResizeObserver(refresh).observe(document.body);refresh();
})();