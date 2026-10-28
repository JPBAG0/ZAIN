-- Vigilante de la prospección por correo (28-oct-2026): eventos que manda Brevo por webhook
-- (entregado, abierto, clic, rebote, spam, baja) y resumen push 3 veces al día.
-- Un renglón por correo, campaña y evento; los repetidos se ignoran. Solo el servidor (service_role) lee o escribe.
-- La clave del webhook vive en el secreto ZAIN_BREVO_SECRETO de la Edge y, para el resumen, en el Vault
-- como 'zain_brevo_secreto' (lo crea el script privado de configuración, fuera de Git).
begin;
create table if not exists public.zain_correo_eventos (
  id bigint generated always as identity primary key,
  evento text not null check (evento in ('delivered','opened','click','soft_bounce','hard_bounce','spam','unsubscribe')),
  email text not null check (email=lower(email) and length(email) between 3 and 254),
  campana_id integer not null default 0,
  campana text not null default '' check (length(campana)<=160),
  url text not null default '' check (length(url)<=500),
  fecha timestamptz not null,
  recibido timestamptz not null default now(),
  unique (evento,email,campana_id)
);
create index if not exists zain_correo_eventos_recibido on public.zain_correo_eventos (recibido);
alter table public.zain_correo_eventos enable row level security;
revoke all on public.zain_correo_eventos from public, anon, authenticated;
grant select, insert on public.zain_correo_eventos to service_role;
grant usage on sequence public.zain_correo_eventos_id_seq to service_role;
create policy zain_solo_servidor on public.zain_correo_eventos as restrictive for all to anon, authenticated using (false) with check (false);
comment on table public.zain_correo_eventos is 'Eventos de las campañas de prospección por correo (Brevo). Contiene correos de prospectos: privado.';
commit;

-- Resumen a las 10:00, 14:00 y 18:00 de Guadalajara (16, 20 y 0 h UTC). Si ese día no hubo eventos, no avisa.
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.unschedule(jobid) from cron.job where jobname='zain-correo-resumen';
select cron.schedule('zain-correo-resumen','0 0,16,20 * * *',$job$
  select net.http_post(
    url:='https://upzecgfgdtllxdhshhkd.supabase.co/functions/v1/zain-pedidos?op=correo-resumen',
    body:='{}'::jsonb,
    headers:=jsonb_build_object('Content-Type','application/json','x-zain-clave',(select decrypted_secret from vault.decrypted_secrets where name='zain_brevo_secreto')),
    timeout_milliseconds:=15000)
$job$);
