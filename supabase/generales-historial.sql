-- 17-oct-2026: historial de ediciones de movimientos generales, solo agregar (append-only),
-- y edición atómica con bloqueo optimista. Sustituye la columna "anterior", que solo guardaba la última versión.
create table public.zain_general_ediciones(
 id bigint generated always as identity primary key,
 movimiento_id uuid not null references public.zain_movimientos_generales(id),
 anterior jsonb not null,
 editor uuid not null references auth.users(id),
 created_at timestamptz not null default now()
);
create index zain_general_ediciones_mov on public.zain_general_ediciones(movimiento_id,created_at);
alter table public.zain_general_ediciones enable row level security;
revoke all on public.zain_general_ediciones from public,anon,authenticated,service_role;
grant select,insert on public.zain_general_ediciones to service_role;
-- Conservar en el historial la versión previa que ya hubiera quedado en "anterior".
insert into public.zain_general_ediciones(movimiento_id,anterior,editor,created_at)
 select id,anterior,coalesce(editado_por,actor),coalesce(editado_at,now()) from public.zain_movimientos_generales where anterior is not null;
revoke update(anterior) on public.zain_movimientos_generales from service_role;

create function public.zain_general_editar(p_id uuid,p_editado_at timestamptz,p_datos jsonb,p_actor uuid)
returns boolean language plpgsql security invoker set search_path='' as $$
declare mov public.zain_movimientos_generales;
begin
 if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado';end if;
 select * into mov from public.zain_movimientos_generales where id=p_id for update;
 -- Bloqueo optimista: si alguien lo editó o anuló después de que se abrió, no se pisa su cambio.
 if not found or mov.anulado_at is not null or mov.editado_at is distinct from p_editado_at then return false;end if;
 insert into public.zain_general_ediciones(movimiento_id,anterior,editor) values(p_id,to_jsonb(mov)-'anterior',p_actor);
 update public.zain_movimientos_generales set categoria=p_datos->>'categoria',persona=p_datos->>'persona',concepto=p_datos->>'concepto',
  importe=(p_datos->>'importe')::bigint,iva_recuperable=(p_datos->>'iva_recuperable')::bigint,fecha=(p_datos->>'fecha')::date,
  comprobante=coalesce((p_datos->>'comprobante')::uuid,mov.comprobante),editado_at=now(),editado_por=p_actor
 where id=p_id;
 return true;
end;$$;
revoke all on function public.zain_general_editar(uuid,timestamptz,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.zain_general_editar(uuid,timestamptz,jsonb,uuid) to service_role;
