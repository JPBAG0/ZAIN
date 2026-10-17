-- Avisos push al equipo (17-oct-2026): celulares suscritos y llaves VAPID.
-- Solo el servidor (service_role) las lee o escribe; el equipo se suscribe a través de la Edge con su sesión.
begin;
create table if not exists public.zain_push (
  endpoint text primary key check (length(endpoint) between 20 and 1000),
  user_id uuid not null references public.zain_equipo(user_id) on delete cascade,
  p256dh text not null check (length(p256dh) between 80 and 100),
  auth text not null check (length(auth) between 16 and 32),
  dispositivo text not null default '' check (length(dispositivo)<=80),
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create index if not exists zain_push_usuario on public.zain_push (user_id);
create table if not exists public.zain_push_llaves (
  id smallint primary key check (id=1),
  publica text not null,
  x text not null,
  y text not null,
  d text not null,
  creado timestamptz not null default now()
);
alter table public.zain_push enable row level security;
alter table public.zain_push_llaves enable row level security;
revoke all on public.zain_push, public.zain_push_llaves from public, anon, authenticated;
grant select, insert, update, delete on public.zain_push to service_role;
grant select, insert on public.zain_push_llaves to service_role;
create policy zain_solo_servidor on public.zain_push as restrictive for all to anon, authenticated using (false) with check (false);
create policy zain_solo_servidor on public.zain_push_llaves as restrictive for all to anon, authenticated using (false) with check (false);
comment on table public.zain_push is 'Celulares del equipo que reciben avisos de solicitudes y aceptaciones. Privado.';
comment on table public.zain_push_llaves is 'Llaves VAPID de los avisos push. Privado: nunca exponer d.';
commit;
