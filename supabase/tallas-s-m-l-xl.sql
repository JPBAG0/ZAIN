-- 28-oct-2026 (JP): tallas unificadas a S-M-L-XL (antes convivían CH-M-G-EG-EEG, CH-M-G-XG-2XG y S-M-L-XL).
-- CH→S, G→L, EG y XG→XL, EEG y 2XG→2XL, EEEG→3XL. Convierte pedidos, cotizaciones (borrador y publicada),
-- costos por talla y configuración de precios. Los historiales quedan como se registraron.
-- Solo cambia la talla cuando va sola entre comillas, seguida de cantidad («CH 10», «CH: 2»), de «a» o de «|»;
-- los SKU como ZN-CH-002 no se tocan.
begin;
create function pg_temp.tallas_actuales(s text) returns text language plpgsql immutable as $$
declare par text[];
begin
 foreach par slice 1 in array array[['EEEG','3XL'],['EEG','2XL'],['2XG','2XL'],['EG','XL'],['XG','XL'],['CH','S'],['G','L']] loop
  -- sola entre comillas: "CH"
  s:=regexp_replace(s,'"'||par[1]||'"','"'||par[2]||'"','g');
  -- con cantidad, rango o clave: «CH 10», «CH: 2», «CH a EG», «EEG|Blanco»
  s:=regexp_replace(s,'(^|["[:space:]·])'||par[1]||'(?=[|:]|[[:space:]][0-9]|[[:space:]]a[[:space:]])','\1'||par[2],'g');
  -- final de un rango: «S a EG»
  s:=regexp_replace(s,'([[:space:]]a[[:space:]])'||par[1]||'"','\1'||par[2]||'"','g');
 end loop;
 return s;
end $$;
do $$
declare r record; n bigint;
begin
 for r in select table_name, column_name from information_schema.columns
   where table_schema='public' and data_type='jsonb'
     and table_name in ('zain_pedidos','zain_cotizaciones','zain_cotizaciones_modelos','zain_precios_config') loop
  execute format('update public.%I set %I=pg_temp.tallas_actuales(%I::text)::jsonb where %I is not null and pg_temp.tallas_actuales(%I::text)<>%I::text',
   r.table_name, r.column_name, r.column_name, r.column_name, r.column_name, r.column_name);
  get diagnostics n = row_count;
  if n>0 then raise notice '%.%: % filas', r.table_name, r.column_name, n; end if;
 end loop;
end $$;
commit;
