begin;
-- Solo cambia la configuración de cálculo. Nunca actualiza revisiones o importes de pedidos.
do $$
declare cfg public.zain_precios_config; rangos jsonb;
begin
 select * into cfg from public.zain_precios_config where id=1 for update;
 if not found or cfg.datos->>'metodo'='margen_bruto' then return; end if;
 if cfg.version=0 and jsonb_array_length(cfg.datos->'costos')=0 then
  rangos='[{"desde":1,"hasta":14,"margen":4000},{"desde":15,"hasta":49,"margen":3500},{"desde":50,"hasta":99,"margen":3000},{"desde":100,"hasta":null,"margen":2500}]'::jsonb;
 else
  -- Una configuración anterior se convierte a margen equivalente, no se renombra su porcentaje.
  select jsonb_agg(jsonb_build_object('desde',r->'desde','hasta',r->'hasta','margen',floor((r->>'recargo')::numeric*10000/(10000+(r->>'recargo')::numeric))::integer) order by ordinal) into rangos
  from jsonb_array_elements(cfg.datos->'rangos') with ordinality as t(r,ordinal);
 end if;
 update public.zain_precios_config set datos=cfg.datos||jsonb_build_object('metodo','margen_bruto','activo',false,'rangos',rangos),version=version+1,updated_at=now() where id=1;
end;
$$;
commit;
