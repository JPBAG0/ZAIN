begin;
create or replace function public.zain_guardar_catalogo(p_producto_id text,p_version integer,p_cambios jsonb,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare old public.zain_catalogo_ediciones; changed public.zain_catalogo_ediciones;
begin
 if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
 if jsonb_typeof(p_cambios)<>'object' or exists(select 1 from jsonb_object_keys(p_cambios) k where k not in ('activo','nombre','descripcion','especificaciones','tejido','composicion','gramaje','medidas','disponibilidad','proveedor','sku_proveedor','foto_id','tecnicas')) then raise exception 'Campo no editable'; end if;
 if p_cambios ? 'tecnicas' then
  if jsonb_typeof(p_cambios->'tecnicas') is distinct from 'array' then raise exception 'Tecnicas invalidas'; end if;
  if jsonb_array_length(p_cambios->'tecnicas') not between 1 and 3
   or exists(select 1 from jsonb_array_elements_text(p_cambios->'tecnicas') t where t not in ('bordado','serigrafia','dtf'))
   or (select count(distinct t) from jsonb_array_elements_text(p_cambios->'tecnicas') t)<>jsonb_array_length(p_cambios->'tecnicas')
  then raise exception 'Tecnicas invalidas'; end if;
 end if;
 if p_cambios ? 'foto_id' and p_cambios->>'foto_id' is not null and not exists(select 1 from public.zain_catalogo_fotos where id::text=p_cambios->>'foto_id' and producto_id=p_producto_id) then raise exception 'Foto no vinculada al producto'; end if;
 insert into public.zain_catalogo_ediciones(producto_id) values(p_producto_id) on conflict do nothing;
 select * into old from public.zain_catalogo_ediciones where producto_id=p_producto_id for update;
 if old.version<>p_version then return null; end if;
 update public.zain_catalogo_ediciones set cambios=old.cambios||p_cambios,version=version+1,updated_at=now(),updated_by=p_actor where producto_id=p_producto_id returning * into changed;
 insert into public.zain_catalogo_historial(producto_id,version,cambios,actor) values(p_producto_id,changed.version,p_cambios,p_actor);
 return to_jsonb(changed);
end;
$$;
revoke all on function public.zain_guardar_catalogo(text,integer,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.zain_guardar_catalogo(text,integer,jsonb,uuid) to service_role;
commit;
