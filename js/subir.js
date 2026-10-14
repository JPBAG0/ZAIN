// Un único acceso al inicio, tanto en la tienda como en gestión.
(() => {
 const button=document.createElement('button');
 button.type='button';button.className='subir'+(document.querySelector('#flotante')?' subir--con-whatsapp':'');
 button.setAttribute('aria-label','Volver arriba');button.title='Volver arriba';button.hidden=true;
 button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12 6-6 6 6M12 6v13"/></svg>';
 document.body.append(button);
 let pending=false;
 function refresh(){pending=false;button.hidden=scrollY<Math.max(480,innerHeight*.7);}
 function schedule(){if(!pending){pending=true;requestAnimationFrame(refresh);}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
 button.addEventListener('click',()=>{window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});document.querySelector('header a')?.focus({preventScroll:true});});
 new ResizeObserver(schedule).observe(document.body);refresh();
})();