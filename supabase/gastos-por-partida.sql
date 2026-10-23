-- 23-oct-2026: costo real contra cotizado por partida. Un gasto puede asignarse a una partida de la revisión publicada.
-- No reescribe zain_finanzas_operar: la partida viaja en p_datos y un disparador sobre el evento (misma transacción)
-- la guarda en el movimiento. Solicitudes sin la clave «partida» (clientes anteriores) no la modifican.
begin;
alter table public.zain_pedido_movimientos add column partida integer check(partida between 0 and 19);
grant update(partida) on public.zain_pedido_movimientos to service_role;

create function public.zain_movimiento_partida()
returns trigger language plpgsql security invoker set search_path='' as $$
declare n integer;total integer;
begin
 if new.modo not in ('gasto','editar') or not (new.datos ? 'partida') then return new;end if;
 n=nullif(new.datos->>'partida','')::integer;
 if n is not null then
  select jsonb_array_length(coalesce(h.borrador->'partidas','[]'::jsonb)) into total
  from public.zain_cotizaciones c join public.zain_cotizaciones_historial h on h.pedido_id=c.pedido_id and h.version=(c.publicada->>'revision')::integer and h.modo='publicar'
  where c.pedido_id=new.pedido_id;
  if total is null or n<0 or n>=total then raise exception 'Partida inválida para este pedido';end if;
 end if;
 update public.zain_pedido_movimientos set partida=n
 where id=case new.modo when 'gasto' then new.request else (new.datos->>'movimiento')::uuid end and pedido_id=new.pedido_id and tipo='gasto';
 return new;
end;$$;
create trigger zain_movimiento_partida after insert on public.zain_finanzas_eventos for each row execute function public.zain_movimiento_partida();

-- Igual que antes más «cotizado»: costo de la revisión publicada, total y por partida (solo equipo, nunca al cliente).
create or replace function public.zain_finanzas_ver(p_id uuid)
returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('resumen',to_jsonb(f),'version',coalesce(f.version,0),'cierre',c.cierre,
 'movimientos',coalesce((select jsonb_agg(to_jsonb(m)-'actor'-'anulado_por'-'editado_por' order by m.created_at desc,m.id) from public.zain_pedido_movimientos m where m.pedido_id=p_id),'[]'::jsonb),
 'cotizado',(select jsonb_build_object('revision',h.version,'total',(h.borrador->>'costo')::bigint,'partidas',coalesce((select jsonb_agg(jsonb_build_object('indice',k-1,'nombre',coalesce(p->>'nombreZain',p->>'nombre'),'color',p->>'color','piezas',(p->>'piezas')::integer,'costo',(p->>'costo')::bigint) order by k) from jsonb_array_elements(h.borrador->'partidas') with ordinality x(p,k)),'[]'::jsonb))
  from public.zain_cotizaciones q join public.zain_cotizaciones_historial h on h.pedido_id=q.pedido_id and h.version=(q.publicada->>'revision')::integer and h.modo='publicar' where q.pedido_id=p_id))
 from public.zain_finanzas_estado f left join public.zain_pedido_cuentas c on c.pedido_id=f.id where f.id=p_id;
$$;
revoke all on function public.zain_movimiento_partida() from public,anon,authenticated;
revoke all on function public.zain_finanzas_ver(uuid) from public,anon,authenticated;
grant execute on function public.zain_finanzas_ver(uuid) to service_role;
commit;
