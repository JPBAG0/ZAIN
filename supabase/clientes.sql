-- Clientes de ZAIN (JP, 21-nov-2026): una ficha por cliente con todos sus pedidos y cotizaciones, para ver qué se
-- cerró y qué no, y para duplicar un pedido o una cotización al mismo cliente o a otro.
-- Un cliente nunca se borra: «unido_a» lo junta con otro y sus pedidos y cotizaciones pasan a ese.
-- Posterior a cotizaciones-modelos.sql, cliente-solicitud.sql y whatsapp-manual.sql. Solo service_role (la Edge con
-- sesión del equipo); el cliente y los talleres no leen esta tabla.
create table if not exists public.zain_clientes(
 id uuid primary key default gen_random_uuid(),
 numero integer generated always as identity unique,
 nombre text not null check(char_length(nombre) between 1 and 180),
 empresa text not null default '' check(char_length(empresa)<=180),
 telefono text not null default '' check(telefono ~ '^[0-9]{0,15}$'),
 correo text not null default '' check(char_length(correo)<=254),
 notas text not null default '' check(char_length(notas)<=2000),
 unido_a uuid references public.zain_clientes(id),
 version integer not null default 1 check(version>=1),
 creado_por uuid references auth.users(id),
 actor uuid references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint zain_clientes_no_a_si_mismo check(unido_a is null or unido_a<>id)
);
alter table public.zain_clientes enable row level security;
revoke all on public.zain_clientes from public,anon,authenticated;
grant select,insert,update on public.zain_clientes to service_role;
comment on table public.zain_clientes is 'Clientes de ZAIN. Privado del equipo. Nunca se borran: unido_a los junta con otro.';

alter table public.zain_pedidos add column if not exists cliente_id uuid references public.zain_clientes(id);
alter table public.zain_cotizaciones_modelos add column if not exists cliente_id uuid references public.zain_clientes(id);
create index if not exists zain_pedidos_cliente_id on public.zain_pedidos(cliente_id);
create index if not exists zain_cotizaciones_modelos_cliente_id on public.zain_cotizaciones_modelos(cliente_id);

-- Nombre comparable: minúsculas, sin acentos y sin espacios de más.
create or replace function public.zain_cliente_clave(p text) returns text language sql immutable set search_path to '' as $$
 select regexp_replace(translate(lower(btrim(coalesce(p,''))),'áàäâéèëêíìïîóòöôúùüûñ','aaaaeeeeiiiioooouuuun'),'\s+',' ','g')
$$;

-- Busca al cliente de un pedido o una cotización: primero por teléfono (últimos 10 dígitos) y luego por nombre.
-- Dos personas con el mismo nombre y teléfonos distintos no se juntan. Un cliente ya unido devuelve el cliente que
-- lo absorbió, para que un pedido nuevo con el nombre anterior no cree otra ficha.
create or replace function public.zain_cliente_buscar(p_nombre text,p_telefono text) returns uuid language sql stable set search_path to '' as $$
 select coalesce(c.unido_a,c.id) from public.zain_clientes c
 where (length(coalesce(p_telefono,''))>=10 and length(c.telefono)>=10 and right(c.telefono,10)=right(p_telefono,10))
    or (public.zain_cliente_clave(p_nombre) not in ('','contacto de whatsapp','cliente sin nombre')
        and public.zain_cliente_clave(c.nombre)=public.zain_cliente_clave(p_nombre)
        and (length(coalesce(p_telefono,''))<10 or length(c.telefono)<10))
 order by (length(coalesce(p_telefono,''))>=10 and length(c.telefono)>=10 and right(c.telefono,10)=right(p_telefono,10)) desc,
  (c.unido_a is null) desc,c.numero
 limit 1
$$;

-- Liga los pedidos guardados y las cotizaciones que todavía no tienen cliente; crea la ficha si no existe.
-- Se llama al abrir Clientes: así los pedidos que llegan de la página y de WhatsApp aparecen solos.
create or replace function public.zain_clientes_sincronizar() returns integer language plpgsql set search_path to '' as $$
declare r record; cid uuid; nom text; tel text; n integer:=0;
begin
 -- Dos pestañas abiertas a la vez no crean el mismo cliente dos veces.
 perform pg_advisory_xact_lock(hashtext('zain_clientes_sincronizar'));
 for r in select id,cliente from public.zain_pedidos where cliente_id is null and guardado_at is not null order by created_at,id loop
  nom:=left(regexp_replace(btrim(coalesce(r.cliente->>'nombre','')),'\s+',' ','g'),180);
  tel:=left(regexp_replace(coalesce(r.cliente->>'telefono',''),'\D','','g'),15);
  if nom='' and tel='' then continue; end if;
  cid:=public.zain_cliente_buscar(nom,tel);
  if cid is null then
   insert into public.zain_clientes(nombre,telefono) values(coalesce(nullif(nom,''),'Cliente sin nombre'),tel) returning id into cid;
  else
   update public.zain_clientes set telefono=tel,updated_at=now() where id=cid and telefono='' and length(tel)>=10;
  end if;
  update public.zain_pedidos set cliente_id=cid where id=r.id and cliente_id is null;
  n:=n+1;
 end loop;
 for r in select id,cliente from public.zain_cotizaciones_modelos where cliente_id is null order by created_at,id loop
  nom:=left(regexp_replace(btrim(coalesce(r.cliente,'')),'\s+',' ','g'),180);
  if nom='' then continue; end if;
  cid:=public.zain_cliente_buscar(nom,'');
  if cid is null then insert into public.zain_clientes(nombre) values(nom) returning id into cid; end if;
  update public.zain_cotizaciones_modelos set cliente_id=cid where id=r.id and cliente_id is null;
  n:=n+1;
 end loop;
 return n;
end $$;

-- Lista para la sección Clientes: cuántos pedidos y cotizaciones tiene cada uno, cuánto se le ha vendido
-- (total publicado con IVA de los pedidos confirmados, en producción o entregados) y su última actividad.
create or replace function public.zain_clientes_lista() returns jsonb language sql stable set search_path to '' as $$
 select coalesce(jsonb_agg(x order by x->>'ultima' desc nulls last,x->>'nombre'),'[]'::jsonb) from (
  select jsonb_build_object('id',c.id,'numero',c.numero,'nombre',c.nombre,'empresa',c.empresa,'telefono',c.telefono,'correo',c.correo,
   'version',c.version,'created_at',c.created_at,
   'pedidos',(select count(*) from public.zain_pedidos p where p.cliente_id=c.id and p.guardado_at is not null),
   'cerrados',(select count(*) from public.zain_pedidos p where p.cliente_id=c.id and p.guardado_at is not null and p.archivado_at is null and p.estado in ('confirmado','produccion','entregado')),
   'cotizaciones',(select count(*) from public.zain_cotizaciones_modelos m where m.cliente_id=c.id),
   'vendido',(select coalesce(sum((q.publicada->>'total')::bigint),0) from public.zain_pedidos p join public.zain_cotizaciones q on q.pedido_id=p.id
     where p.cliente_id=c.id and p.guardado_at is not null and p.archivado_at is null and p.estado in ('confirmado','produccion','entregado') and jsonb_typeof(q.publicada->'total')='number'),
   'ultima',greatest(c.created_at,(select max(p.created_at) from public.zain_pedidos p where p.cliente_id=c.id),(select max(m.updated_at) from public.zain_cotizaciones_modelos m where m.cliente_id=c.id))) x
  from public.zain_clientes c where c.unido_a is null
 ) s
$$;

-- Ficha de un cliente con su historial completo (pedidos, incluso los de la papelera, y cotizaciones).
create or replace function public.zain_cliente_ficha(p_id uuid) returns jsonb language sql stable set search_path to '' as $$
 select jsonb_build_object('cliente',to_jsonb(c)-'creado_por'-'actor',
  'pedidos',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'folio',p.folio,'estado',p.estado,'piezas',p.total,'created_at',p.created_at,
     'archivado',p.archivado_at is not null,'nombre',p.cliente->>'nombre',
     'importe',case when jsonb_typeof(q.publicada->'total')='number' then (q.publicada->>'total')::bigint end,
     'cotizado',q.borrador is not null,
     'prendas',(select string_agg(distinct coalesce(it->>'nombreZain',it->>'nombre'),', ') from jsonb_array_elements(p.items) it))
    order by p.created_at desc)
   from public.zain_pedidos p left join public.zain_cotizaciones q on q.pedido_id=p.id where p.cliente_id=c.id and p.guardado_at is not null),'[]'::jsonb),
  'cotizaciones',coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'folio',m.folio,'estado',m.estado,'tipo',coalesce(m.datos->>'tipo','modelos'),
     'modelos',m.modelos,'desde',m.desde,'total',case when jsonb_typeof(m.comercial->'total')='number' then (m.comercial->>'total')::bigint end,
     'pedido_id',m.pedido_id,'updated_at',m.updated_at,'version',m.version) order by m.updated_at desc)
   from public.zain_cotizaciones_modelos m where m.cliente_id=c.id),'[]'::jsonb))
 from public.zain_clientes c where c.id=p_id
$$;

-- Junta dos fichas del mismo cliente: los pedidos y cotizaciones de «origen» pasan a «destino», los datos que le
-- falten a destino se toman de origen y origen queda unido (no se borra).
create or replace function public.zain_clientes_unir(p_origen uuid,p_destino uuid,p_actor uuid) returns jsonb language plpgsql set search_path to '' as $$
declare o public.zain_clientes; d public.zain_clientes;
begin
 if p_origen is null or p_destino is null or p_origen=p_destino then raise exception 'zain_cliente_mismo'; end if;
 -- Siempre en el mismo orden para que dos uniones cruzadas no se bloqueen entre sí.
 perform 1 from public.zain_clientes where id in (p_origen,p_destino) order by id for update;
 select * into o from public.zain_clientes where id=p_origen;
 select * into d from public.zain_clientes where id=p_destino;
 if o.id is null or d.id is null or o.unido_a is not null or d.unido_a is not null then raise exception 'zain_cliente_no_existe'; end if;
 update public.zain_pedidos set cliente_id=d.id where cliente_id=o.id;
 update public.zain_cotizaciones_modelos set cliente_id=d.id where cliente_id=o.id;
 update public.zain_clientes set unido_a=d.id where unido_a=o.id;
 update public.zain_clientes set unido_a=d.id,version=version+1,actor=p_actor,updated_at=now() where id=o.id;
 update public.zain_clientes set
  empresa=case when empresa='' then o.empresa else empresa end,
  telefono=case when telefono='' then o.telefono else telefono end,
  correo=case when correo='' then o.correo else correo end,
  notas=left(btrim(notas||case when o.notas<>'' and position(o.notas in notas)=0 then E'\n'||o.notas else '' end),2000),
  version=version+1,actor=p_actor,updated_at=now()
 where id=d.id;
 return jsonb_build_object('id',d.id);
end $$;

-- Cambia el cliente de un pedido. El nombre que ve el equipo en la bandeja pasa a ser el de la ficha; el que escribió
-- el cliente al pedir se conserva en «escrito».
create or replace function public.zain_pedido_cliente(p_pedido uuid,p_cliente uuid,p_actor uuid) returns jsonb language plpgsql set search_path to '' as $$
declare p public.zain_pedidos; c public.zain_clientes;
begin
 select * into p from public.zain_pedidos where id=p_pedido for update;
 if not found or p.guardado_at is null then raise exception 'zain_pedido_no_existe'; end if;
 select * into c from public.zain_clientes where id=p_cliente and unido_a is null;
 if not found then raise exception 'zain_cliente_no_existe'; end if;
 if p.cliente_id is not distinct from c.id and p.cliente->>'nombre' is not distinct from c.nombre then return jsonb_build_object('id',p.id,'cliente_id',c.id); end if;
 update public.zain_pedidos set cliente_id=c.id,
  cliente=(cliente-'nombre')||jsonb_build_object('nombre',c.nombre)
   ||case when coalesce(cliente->>'escrito','')='' and coalesce(cliente->>'nombre','')<>'' and cliente->>'nombre'<>c.nombre then jsonb_build_object('escrito',left(cliente->>'nombre',180)) else '{}'::jsonb end
   ||case when c.telefono<>'' and coalesce(cliente->>'telefono','')='' then jsonb_build_object('telefono',c.telefono) else '{}'::jsonb end
 where id=p.id;
 -- El borrador de la cotización toma el nombre nuevo si traía el anterior (o ninguno); un nombre escrito a mano se
 -- respeta. La versión sube para que un editor abierto con el borrador viejo no lo pise.
 update public.zain_cotizaciones set borrador=jsonb_set(borrador,'{destinatario}',to_jsonb(c.nombre)),version=version+1,updated_at=now(),actor=p_actor
 where pedido_id=p.id and jsonb_typeof(borrador)='object'
  and public.zain_cliente_clave(borrador->>'destinatario') in ('',public.zain_cliente_clave(p.cliente->>'nombre'))
  and public.zain_cliente_clave(borrador->>'destinatario') is distinct from public.zain_cliente_clave(c.nombre);
 insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p.id,p_actor,p.estado,p.estado,'Cliente: '||c.nombre||'.');
 return jsonb_build_object('id',p.id,'cliente_id',c.id);
end $$;

-- Duplica un pedido (JP: «si un cliente me pide lo mismo otra vez, ya nomás duplico el pedido»): mismas partidas,
-- tallas, logos y diseño, y la cotización del equipo como borrador para revisarla y publicarla. Puede ser para el
-- mismo cliente o para otro. El nuevo pedido empieza en «nuevo», sin pagos, gastos, talleres ni aceptación.
-- Los archivos ya se copiaron en Storage a la carpeta del pedido nuevo (lo hace la Edge antes de llamar aquí).
create or replace function public.zain_pedido_duplicar(p_origen uuid,p_id uuid,p_token_hash text,p_cliente uuid,p_actor uuid) returns jsonb language plpgsql set search_path to '' as $$
declare o public.zain_pedidos; c public.zain_clientes; ya public.zain_pedidos; cot public.zain_cotizaciones; ref text; nota text; bytes bigint;
begin
 select * into ya from public.zain_pedidos where id=p_id;
 if found then
  -- Reintento del mismo duplicado (se cortó la red): devolver el pedido ya creado.
  if ya.notas_internas like 'Duplicado de %' and ya.cliente_id is not distinct from p_cliente then return jsonb_build_object('id',ya.id,'folio',ya.folio); end if;
  raise exception 'zain_conflict';
 end if;
 if coalesce(p_token_hash,'') !~ '^[0-9a-f]{64}$' then raise exception 'zain_token'; end if;
 select * into o from public.zain_pedidos where id=p_origen;
 if not found or o.guardado_at is null then raise exception 'zain_pedido_no_existe'; end if;
 select * into c from public.zain_clientes where id=p_cliente and unido_a is null;
 if not found then raise exception 'zain_cliente_no_existe'; end if;
 ref:='ZAIN-'||upper(substr(replace(p_id::text,'-',''),1,12));
 nota:='Duplicado de '||o.folio||'.';
 insert into public.zain_pedidos(id,folio,token_hash,items,archivos,total,estado,guardado_at,cliente,cliente_id,notas_internas)
 values(p_id,ref,p_token_hash,
  (select coalesce(jsonb_agg(it-'pedido_hash' order by n),'[]'::jsonb) from jsonb_array_elements(o.items) with ordinality t(it,n)),
  (select coalesce(jsonb_agg(a||jsonb_build_object('path',p_id::text||substr(a->>'path',37)) order by n),'[]'::jsonb) from jsonb_array_elements(o.archivos) with ordinality t(a,n)),
  o.total,'nuevo',now(),
  jsonb_build_object('nombre',c.nombre)||case when c.telefono<>'' then jsonb_build_object('telefono',c.telefono) else '{}'::jsonb end,
  c.id,nota);
 select coalesce(sum((a->>'size')::bigint),0) into bytes from jsonb_array_elements(o.archivos) a;
 insert into public.zain_limites(clave) values('capacidad') on conflict do nothing;
 update public.zain_limites set valor=valor+bytes where clave='capacidad';
 -- Cotización del equipo como borrador: precios, cargos, IVA y condiciones; sin fecha de vigencia ni ediciones de
 -- partidas pendientes (esas eran del pedido anterior).
 select * into cot from public.zain_cotizaciones where pedido_id=p_origen;
 if found and cot.borrador is not null then
  insert into public.zain_cotizaciones(pedido_id,version,borrador,actor)
  values(p_id,1,(cot.borrador-'selecciones'-'partidasVersion')||jsonb_build_object('destinatario',c.nombre,'vigencia',''),p_actor);
 end if;
 insert into public.zain_historial(pedido_id,actor,estado_anterior,estado_nuevo,notas) values(p_id,p_actor,'nuevo','nuevo',nota||' Cliente: '||c.nombre||'.');
 return jsonb_build_object('id',p_id,'folio',ref);
end $$;

revoke all on function public.zain_cliente_clave(text),public.zain_cliente_buscar(text,text),public.zain_clientes_sincronizar(),
 public.zain_clientes_lista(),public.zain_cliente_ficha(uuid),public.zain_clientes_unir(uuid,uuid,uuid),
 public.zain_pedido_cliente(uuid,uuid,uuid),public.zain_pedido_duplicar(uuid,uuid,text,uuid,uuid) from public,anon,authenticated;
grant execute on function public.zain_cliente_clave(text),public.zain_cliente_buscar(text,text),public.zain_clientes_sincronizar(),
 public.zain_clientes_lista(),public.zain_cliente_ficha(uuid),public.zain_clientes_unir(uuid,uuid,uuid),
 public.zain_pedido_cliente(uuid,uuid,uuid),public.zain_pedido_duplicar(uuid,uuid,text,uuid,uuid) to service_role;
