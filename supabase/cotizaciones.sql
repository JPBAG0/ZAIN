begin;
create table public.zain_precios_config(
 id smallint primary key check(id=1),version integer not null default 0,datos jsonb not null,
 updated_at timestamptz not null default now(),actor uuid references auth.users(id)
);
create table public.zain_cotizaciones(
 pedido_id uuid primary key references public.zain_pedidos(id),version integer not null default 1,
 borrador jsonb not null,publicada jsonb,updated_at timestamptz not null default now(),actor uuid references auth.users(id)
);
create table public.zain_cotizaciones_historial(
 pedido_id uuid not null references public.zain_pedidos(id),version integer not null,modo text not null,
 borrador jsonb not null,publicada jsonb,actor uuid references auth.users(id),created_at timestamptz not null default now(),
 primary key(pedido_id,version)
);
alter table public.zain_precios_config enable row level security;
alter table public.zain_cotizaciones enable row level security;
alter table public.zain_cotizaciones_historial enable row level security;
revoke all on public.zain_precios_config,public.zain_cotizaciones,public.zain_cotizaciones_historial from public,anon,authenticated;
grant select,insert,update on public.zain_precios_config,public.zain_cotizaciones to service_role;
grant select,insert on public.zain_cotizaciones_historial to service_role;
insert into public.zain_precios_config(id,datos) values(1,'{"activo":false,"rangos":[{"desde":1,"hasta":14,"recargo":5000},{"desde":15,"hasta":49,"recargo":4500},{"desde":50,"hasta":99,"recargo":4000},{"desde":100,"hasta":null,"recargo":3500}],"costos":[]}');
create function public.zain_precios_guardar(p_version integer,p_datos jsonb,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare old public.zain_precios_config; changed public.zain_precios_config;
begin
 if not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
 if jsonb_typeof(p_datos)<>'object' or jsonb_typeof(p_datos->'costos')<>'array' or jsonb_typeof(p_datos->'rangos')<>'array' then raise exception 'Configuracion invalida'; end if;
 select * into old from public.zain_precios_config where id=1 for update;
 if not found or old.version<>p_version then return null; end if;
 update public.zain_precios_config set version=version+1,datos=p_datos,actor=p_actor,updated_at=now() where id=1 returning * into changed;
 return jsonb_build_object('version',changed.version,'datos',changed.datos);
end;
$$;
create function public.zain_cotizacion_guardar(p_id uuid,p_version integer,p_modo text,p_borrador jsonb,p_publicada jsonb,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare pedido public.zain_pedidos; old public.zain_cotizaciones; changed public.zain_cotizaciones; documento jsonb; lineas jsonb;
begin
 if p_modo not in ('iniciar','guardar','publicar','retirar') then raise exception 'Operacion invalida'; end if;
 if p_modo<>'iniciar' and not exists(select 1 from public.zain_equipo where user_id=p_actor and activo) then raise exception 'Equipo no autorizado'; end if;
 select * into pedido from public.zain_pedidos where id=p_id and guardado_at is not null and archivado_at is null for update;
 if not found then return null; end if;
 select * into old from public.zain_cotizaciones where pedido_id=p_id for update;
 if p_modo='iniciar' then
  if found then return to_jsonb(old); end if;
  if p_version<>0 then return null; end if;
  insert into public.zain_cotizaciones(pedido_id,borrador) values(p_id,p_borrador) returning * into changed;
 else
  if not found or old.version<>p_version then return null; end if;
  documento=old.publicada;
  if p_modo='publicar' then
   if pedido.estado='cancelado' or (p_borrador->>'preparada')::boolean is distinct from true or p_publicada is null then return null; end if;
   -- Segunda proyección explícita: nunca publicar costos, recargos ni referencias de compras.
   select jsonb_agg(jsonb_build_object('indice',l->'indice','sku',l->'sku','nombre',l->'nombre','color',l->'color','tecnica',l->'tecnica','piezas',l->'piezas','tallas',l->'tallas','zona',l->'zona','cm',l->'cm','precio',l->'precio','descuento',l->'descuento','bruto',l->'bruto','rebaja',l->'rebaja','importe',l->'importe') order by (l->>'indice')::integer) into lineas from jsonb_array_elements(p_publicada->'partidas') l;
   documento=jsonb_build_object('schema',1,'moneda','MXN','folio',pedido.folio,'revision',old.version+1,'publicada_at',now(),'destinatario',p_publicada->'destinatario','condiciones',p_publicada->'condiciones','plazo',p_publicada->'plazo','vigencia',p_publicada->'vigencia','impuesto',p_publicada->'impuesto','envio',p_publicada->'envio','bruto',p_publicada->'bruto','descuento',p_publicada->'descuento','subtotal',p_publicada->'subtotal','impuestos',p_publicada->'impuestos','total',p_publicada->'total','partidas',lineas);
   -- Publicar una cotización no confirma producción ni pago.
   if pedido.estado in ('nuevo','contactado') then
    update public.zain_pedidos set estado='cotizado',version=version+1,updated_at=now() where id=p_id;
    insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,pedido.estado,'cotizado','Cotización revisada y publicada para el cliente.');
   end if;
  elsif p_modo='retirar' then documento=null;
  end if;
  update public.zain_cotizaciones set borrador=case when p_modo='retirar' then old.borrador else p_borrador end,publicada=documento,version=version+1,updated_at=now(),actor=p_actor where pedido_id=p_id returning * into changed;
 end if;
 insert into public.zain_cotizaciones_historial(pedido_id,version,modo,borrador,publicada,actor) values(p_id,changed.version,p_modo,changed.borrador,changed.publicada,p_actor);
 return to_jsonb(changed);
end;
$$;
revoke all on function public.zain_precios_guardar(integer,jsonb,uuid) from public,anon,authenticated;
revoke all on function public.zain_cotizacion_guardar(uuid,integer,text,jsonb,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.zain_precios_guardar(integer,jsonb,uuid) to service_role;
grant execute on function public.zain_cotizacion_guardar(uuid,integer,text,jsonb,jsonb,uuid) to service_role;
commit;
