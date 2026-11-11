-- Revisión de seguridad del 10-nov-2026 (punto 1): tope general por hora al crear pedidos.
-- El tope de 10 por hora por visitante depende de su IP; este segundo tope no depende de la IP.
-- Nadie puede crear más de 60 pedidos ni subir más de 300 MB en una hora, aunque cambie de dirección.
-- Lo usan la web y WhatsApp. Hasta el 10-nov iban 36 pedidos en total, así que no afecta el uso normal.
create or replace function public.zain_crear_pedido(p_id uuid, p_token_hash text, p_items jsonb, p_archivos jsonb, p_total integer, p_bytes bigint, p_capacity bigint, p_client text)
 returns jsonb
 language plpgsql
 set search_path to ''
as $function$
declare old public.zain_pedidos; used bigint; ref text;
begin
  -- Una clave persistente hace atómicos el cupo, el folio y la deduplicación.
  insert into public.zain_limites(clave) values ('capacidad') on conflict do nothing;
  select valor into used from public.zain_limites where clave='capacidad' for update;
  select * into old from public.zain_pedidos where id=p_id;
  if found then
    if old.token_hash<>p_token_hash or old.items<>p_items or old.archivos<>p_archivos then raise exception 'zain_conflict'; end if;
    return jsonb_build_object('folio',old.folio);
  end if;
  if p_bytes<0 or p_capacity<1 or used+p_bytes>p_capacity then raise exception 'zain_capacity'; end if;
  insert into public.zain_limites(clave,valor) values ('ip-'||p_client,1)
  on conflict(clave) do update set valor=case when public.zain_limites.vence<now() then 1 else public.zain_limites.valor+1 end,
    vence=case when public.zain_limites.vence<now() then now()+interval '1 hour' else public.zain_limites.vence end
  returning valor into used;
  if used>10 then raise exception 'zain_rate'; end if;
  -- Tope general por hora (no depende de la IP).
  insert into public.zain_limites(clave,valor) values ('global-pedidos-hora',1)
  on conflict(clave) do update set valor=case when public.zain_limites.vence<now() then 1 else public.zain_limites.valor+1 end,
    vence=case when public.zain_limites.vence<now() then now()+interval '1 hour' else public.zain_limites.vence end
  returning valor into used;
  if used>60 then raise exception 'zain_rate'; end if;
  insert into public.zain_limites(clave,valor) values ('global-bytes-hora',p_bytes)
  on conflict(clave) do update set valor=case when public.zain_limites.vence<now() then p_bytes else public.zain_limites.valor+p_bytes end,
    vence=case when public.zain_limites.vence<now() then now()+interval '1 hour' else public.zain_limites.vence end
  returning valor into used;
  if used>300*1024*1024 then raise exception 'zain_rate'; end if;
  ref:='ZAIN-'||upper(substr(replace(p_id::text,'-',''),1,12));
  insert into public.zain_pedidos(id,folio,token_hash,items,archivos,total) values(p_id,ref,p_token_hash,p_items,p_archivos,p_total);
  update public.zain_limites set valor=valor+p_bytes where clave='capacidad';
  return jsonb_build_object('folio',ref);
end;
$function$;

-- zain_finanzas_estado es una vista (security_invoker) con permiso solo para el servidor: no lleva protección por fila.
