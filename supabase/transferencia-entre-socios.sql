-- 27-nov-2026 (JP): transferencia directa de un socio a otro (JP le pasa a García dinero del negocio que tenía).
-- No toca ninguna caja ni el resultado del negocio. Quien entrega tiene menos dinero del negocio (o ZAIN le debe más):
-- +importe a su saldo; quien recibe, −importe. En el libro sale como «solo mueve dinero entre cuentas» (efecto 0);
-- el saldo de cada socio lo suma aparte zain_caja_resumen. Posterior a iva-oficinas-anticipo y libro-flexible.
-- Las funciones se corrigen sobre su definición vigente con reemplazos comprobados (si el texto no está, falla y no aplica nada).
begin;
alter table public.zain_caja_movimientos drop constraint zain_caja_movimientos_check,
 add constraint zain_caja_movimientos_check check(origen<>destino);

do $migracion$
declare d text;
 socios_cc text:=$s$(select coalesce(sum(case when origen='%1$s' then importe else -importe end),0)::bigint from public.zain_caja_movimientos where anulado_at is null and tipo='transferencia' and origen in ('juan_pablo','garcia') and destino in ('juan_pablo','garcia') and '%1$s' in (origen,destino))$s$;
 viejo text;nuevo text;
begin
 -- 1) Libro: entre socios no cambia lo que el negocio debe en total (efecto_socio 0 en el renglón).
 d:=pg_get_functiondef('public.zain_caja_libro'::regproc);
 viejo:=$v$case when c.tipo='reparto' then 0 when c.origen in ('juan_pablo','garcia') then c.importe$v$;
 nuevo:=$v$case when c.tipo='reparto' then 0 when c.origen in ('juan_pablo','garcia') and c.destino in ('juan_pablo','garcia') then 0 when c.origen in ('juan_pablo','garcia') then c.importe$v$;
 if position(viejo in d)=0 then raise exception 'zain_caja_libro cambió: revisar la migración';end if;
 execute replace(d,viejo,nuevo);
 -- 2) Saldos de socios: más lo que entregó y menos lo que recibió de otro socio.
 d:=pg_get_functiondef('public.zain_caja_resumen'::regproc);
 for viejo in select unnest(array['juan_pablo','garcia']) loop
  nuevo:=format($n$'%1$s',(select coalesce(sum(efecto_socio),0)::bigint from libro where persona='%1$s')$n$,viejo);
  if position(nuevo in d)=0 then raise exception 'zain_caja_resumen cambió: revisar la migración';end if;
  d:=replace(d,nuevo,format($n$'%1$s',(select coalesce(sum(efecto_socio),0)::bigint from libro where persona='%1$s')+$n$,viejo)||format(socios_cc,viejo));
 end loop;
 execute d;
 -- 3) Registrar y corregir: se permite socio → socio.
 d:=pg_get_functiondef('public.zain_libro_operar'::regproc);
 viejo:=$v$ or not (origen_c in ('zain','oficina_jp','oficina_garcia') or destino_c in ('zain','oficina_jp','oficina_garcia'))$v$;
 if position(viejo in d)=0 then raise exception 'zain_libro_operar cambió: revisar la migración';end if;
 d:=replace(d,viejo,'');
 d:=replace(d,'Una transferencia va entre dos cajas, o entre un socio y una caja.','Elige de dónde sale y a dónde va el dinero (deben ser distintos).');
 execute d;
end
$migracion$;
commit;
