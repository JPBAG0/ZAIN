begin;
create index if not exists zain_historial_actor on public.zain_historial(actor);
-- El activador de RLS creado por Supabase no necesita estar disponible por RPC.
revoke execute on function public.rls_auto_enable() from public,anon,authenticated;
do $$ declare target text; begin
  foreach target in array array['zain_pedidos','zain_equipo','zain_historial','zain_limites'] loop
    if not exists(select 1 from pg_policies where schemaname='public' and tablename=target and policyname='zain_solo_servidor') then
      execute format('create policy zain_solo_servidor on public.%I as restrictive for all to anon,authenticated using(false) with check(false)',target);
    end if;
  end loop;
end $$;
commit;
