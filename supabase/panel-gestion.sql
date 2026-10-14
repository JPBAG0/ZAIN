begin;
alter table public.zain_pedidos add column if not exists archivado_at timestamptz;
create index if not exists zain_pedidos_bandeja_fecha on public.zain_pedidos(created_at desc) where guardado_at is not null and archivado_at is null;
create index if not exists zain_pedidos_papelera_fecha on public.zain_pedidos(archivado_at desc) where guardado_at is not null and archivado_at is not null;
create or replace function public.zain_panel_resumen()
returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object(
 'semana_desde',date_trunc('week',now() at time zone 'America/Mexico_City') at time zone 'America/Mexico_City',
 'solicitudes_semana',count(*) filter(where archivado_at is null and created_at >= (date_trunc('week',now() at time zone 'America/Mexico_City') at time zone 'America/Mexico_City')),
 'por_revisar',count(*) filter(where archivado_at is null and estado='nuevo'),
 'confirmados',count(*) filter(where archivado_at is null and estado='confirmado'),
 'produccion',count(*) filter(where archivado_at is null and estado='produccion'),
 'entregados',count(*) filter(where archivado_at is null and estado='entregado'),
 'activos',count(*) filter(where archivado_at is null),
 'papelera',count(*) filter(where archivado_at is not null)
 ) from public.zain_pedidos where guardado_at is not null;
$$;
revoke all on function public.zain_panel_resumen() from public,anon,authenticated;
grant execute on function public.zain_panel_resumen() to service_role;
create or replace function public.zain_archivar_pedido(p_id uuid,p_version integer,p_archivar boolean,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare old public.zain_pedidos; changed public.zain_pedidos;
begin
 if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
 select * into old from public.zain_pedidos where id=p_id and guardado_at is not null for update;
 if not found or old.version<>p_version then return null; end if;
 if (old.archivado_at is not null)=p_archivar then return to_jsonb(old); end if;
 update public.zain_pedidos set archivado_at=case when p_archivar then now() else null end,version=version+1,updated_at=now() where id=p_id returning * into changed;
 insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,old.estado,old.estado,case when p_archivar then 'Movido a papelera; archivos conservados.' else 'Restaurado desde papelera.' end);
 return to_jsonb(changed);
end;
$$;
revoke all on function public.zain_archivar_pedido(uuid,integer,boolean,uuid) from public,anon,authenticated;
grant execute on function public.zain_archivar_pedido(uuid,integer,boolean,uuid) to service_role;
create or replace function public.zain_actualizar_pedido(p_id uuid,p_version integer,p_estado text,p_notas text,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare old public.zain_pedidos; changed public.zain_pedidos;
begin
 if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
 select * into old from public.zain_pedidos where id=p_id and guardado_at is not null and archivado_at is null for update;
 if not found or old.version<>p_version then return null; end if;
 update public.zain_pedidos set estado=p_estado,notas_internas=p_notas,version=version+1,updated_at=now() where id=p_id returning * into changed;
 insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,old.estado,p_estado,p_notas);
 return to_jsonb(changed);
end;
$$;
revoke all on function public.zain_actualizar_pedido(uuid,integer,text,text,uuid) from public,anon,authenticated;
grant execute on function public.zain_actualizar_pedido(uuid,integer,text,text,uuid) to service_role;
commit;

