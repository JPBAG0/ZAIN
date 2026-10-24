export function ordenarCostos(form,estado={}){
 const originales=[...form.children].filter(e=>e.classList.contains('cot-panel'));
 const definiciones=[['rangos','Rangos de cantidad','Márgenes por volumen'],['tecnicas','Tarifas de personalización','Bordado, serigrafía y DTF'],['prendas','Costos de prendas','Modelos activos y costos por talla']];
 const paneles={};
 originales.forEach((section,i)=>{
  const [id,titulo,nota]=definiciones[i],d=document.createElement('details'),summary=document.createElement('summary');d.className='cot-panel cot-config-grupo';d.dataset.configGrupo=id;d.id='costos-'+id;d.open=estado[id]??id==='prendas';summary.innerHTML='<h2>'+titulo+'</h2><span>'+nota+'</span>';section.querySelector('h2')?.remove();d.append(summary);const body=document.createElement('div');body.className='cot-config-cuerpo';while(section.firstChild)body.append(section.firstChild);d.append(body);section.replaceWith(d);paneles[id]=d;
 });
 for(const id of ['rangos','tecnicas','prendas'])form.prepend(paneles[id]);
 paneles.rangos.querySelector('.cot-tablewrap').classList.add('cot-rangos-tabla');
 paneles.rangos.querySelectorAll('[data-quitar-rango]').forEach(b=>b.innerHTML='<span aria-hidden="true">×</span>');
 const explicaciones=paneles.rangos.querySelectorAll('.cot-ayuda');if(explicaciones[0])explicaciones[0].textContent='Define el margen bruto para cada cantidad. Precio = costo ÷ (1 − margen).';
 paneles.rangos.querySelector('.cot-resumen')?.remove();
 if(explicaciones[1])explicaciones[1].textContent='Los rangos comienzan en una pieza, sin huecos. El último no tiene límite.';
 paneles.tecnicas.querySelector('.cot-ayuda').textContent='Lo que te cobra el taller. Bordado y serigrafía: fijo por pieza, con el costo por cm² en 0. DTF: película por cm² más el aplicado por pieza.';
 const ayudas=paneles.tecnicas.querySelectorAll('.cot-ayuda');if(ayudas[1])ayudas[1].textContent='El ponchado del bordado se cobra una vez por pedido. Si un trabajo sale distinto, ajusta el costo en ese pedido.';
 const check=paneles.rangos.querySelector('[name="activo"]');if(check){const label=check.closest('label');label.lastChild.textContent=' Preparar costos al recibir solicitudes nuevas';label.insertAdjacentHTML('afterend','<p class="cot-ayuda">Al abrir o actualizar una cotización siempre se consultan los costos guardados.</p>');}
 paneles.prendas.querySelector('.cot-ayuda').textContent='Un costo por talla, igual para todos los colores. Captura el de la variante más cara.';
 form.querySelector('.cot-botones').classList.add('cot-guardar-costos');
 form.querySelector('.cot-guardar-costos .cot-ayuda').textContent='La cotización del cliente cambia solo al publicarla.';
 paneles.tecnicas.querySelectorAll('[name^=preparacion-t]').forEach(input=>input.closest('label').firstChild.textContent=input.closest('.cot-tarifa')?.querySelector('h3')?.textContent==='Bordado'?'Ponchado (una vez por pedido)':'Preparación / partida');
}
