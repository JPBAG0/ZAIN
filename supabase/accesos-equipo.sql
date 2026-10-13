begin;
create table if not exists public.zain_accesos (
  email text primary key check(email=lower(email)),
  nombre text not null,
  activo boolean not null default true
);
alter table public.zain_accesos enable row level security;
revoke all on public.zain_accesos from public,anon,authenticated;
grant select,insert,update,delete on public.zain_accesos to service_role;
create policy zain_solo_servidor on public.zain_accesos as restrictive for all to anon,authenticated using(false) with check(false);
commit;
-- Los correos reales se dan de alta únicamente en la base, no en GitHub.
