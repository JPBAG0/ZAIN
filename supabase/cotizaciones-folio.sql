-- 24-oct-2026: el folio de las cotizaciones por modelo deja de ser consecutivo (COT-0001…), que hacía ver al negocio
-- recién empezado. Igual que los pedidos (ZAIN-XXXXXXXXXXXX), el folio nuevo sale del id: COT- y 12 caracteres.
-- Las cotizaciones existentes conservan su folio, porque ya se compartieron con clientes. Posterior a cotizaciones-modelos.sql.
begin;
alter table public.zain_cotizaciones_modelos alter column folio drop expression;
alter table public.zain_cotizaciones_modelos alter column folio set not null;
create or replace function public.zain_cotizacion_modelo_folio() returns trigger language plpgsql set search_path='' as $$
begin
 -- El folio no cambia una vez asignado.
 if tg_op='UPDATE' then new.folio:=old.folio;
 else new.folio:='COT-'||upper(substr(replace(new.id::text,'-',''),1,12));end if;
 return new;
end;$$;
drop trigger if exists zain_cotizacion_modelo_folio on public.zain_cotizaciones_modelos;
create trigger zain_cotizacion_modelo_folio before insert or update on public.zain_cotizaciones_modelos
 for each row execute function public.zain_cotizacion_modelo_folio();
revoke all on function public.zain_cotizacion_modelo_folio() from public,anon,authenticated;
commit;
