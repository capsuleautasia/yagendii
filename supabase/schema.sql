-- ============================================================
-- YAGENDII - ESQUEMA COMPLETO PARA SUPABASE
-- Ejecutar una sola vez en: Supabase > SQL Editor > New query
-- ============================================================

create extension if not exists pgcrypto;

-- 1. Tablas
create table if not exists public.posibles_ventas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre_cliente text not null check (char_length(trim(nombre_cliente)) between 1 and 120),
  numero_cliente text not null check (char_length(trim(numero_cliente)) between 1 and 60),
  fecha_agendada date not null,
  hora_agendada time not null,
  telefono text not null check (char_length(trim(telefono)) between 8 and 24),
  observaciones text check (observaciones is null or char_length(observaciones) <= 700),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ventas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre_cliente text not null check (char_length(trim(nombre_cliente)) between 1 and 120),
  numero_cliente text not null check (char_length(trim(numero_cliente)) between 1 and 60),
  fecha_venta date not null default current_date,
  telefono text not null check (char_length(trim(telefono)) between 8 and 24),
  observaciones text check (observaciones is null or char_length(observaciones) <= 700),
  origen_posible_venta_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.ventas.numero_cliente is 'Texto para conservar ceros iniciales, por ejemplo 0071.';
comment on column public.posibles_ventas.numero_cliente is 'Texto para conservar ceros iniciales, por ejemplo 0071.';

-- 2. Índices
create index if not exists ventas_user_fecha_idx
  on public.ventas (user_id, fecha_venta desc);

create index if not exists posibles_user_agenda_idx
  on public.posibles_ventas (user_id, fecha_agendada asc, hora_agendada asc);

create index if not exists ventas_numero_cliente_idx
  on public.ventas (user_id, numero_cliente);

create index if not exists posibles_numero_cliente_idx
  on public.posibles_ventas (user_id, numero_cliente);

-- 3. Trigger para updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ventas_set_updated_at on public.ventas;
create trigger ventas_set_updated_at
before update on public.ventas
for each row execute function public.set_updated_at();

drop trigger if exists posibles_set_updated_at on public.posibles_ventas;
create trigger posibles_set_updated_at
before update on public.posibles_ventas
for each row execute function public.set_updated_at();

-- 4. Seguridad Row Level Security
alter table public.ventas enable row level security;
alter table public.posibles_ventas enable row level security;

-- Eliminar políticas anteriores para permitir volver a ejecutar el script.
drop policy if exists "ventas_select_own" on public.ventas;
drop policy if exists "ventas_insert_own" on public.ventas;
drop policy if exists "ventas_update_own" on public.ventas;
drop policy if exists "ventas_delete_own" on public.ventas;

drop policy if exists "posibles_select_own" on public.posibles_ventas;
drop policy if exists "posibles_insert_own" on public.posibles_ventas;
drop policy if exists "posibles_update_own" on public.posibles_ventas;
drop policy if exists "posibles_delete_own" on public.posibles_ventas;

create policy "ventas_select_own"
on public.ventas for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "ventas_insert_own"
on public.ventas for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "ventas_update_own"
on public.ventas for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "ventas_delete_own"
on public.ventas for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "posibles_select_own"
on public.posibles_ventas for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "posibles_insert_own"
on public.posibles_ventas for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "posibles_update_own"
on public.posibles_ventas for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "posibles_delete_own"
on public.posibles_ventas for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

-- 5. Permisos explícitos para el rol autenticado
revoke all on table public.ventas from anon;
revoke all on table public.posibles_ventas from anon;

grant select, insert, update, delete on table public.ventas to authenticated;
grant select, insert, update, delete on table public.posibles_ventas to authenticated;

-- 6. Conversión transaccional: posible venta -> venta
-- Se ejecuta completa o no se ejecuta nada.
create or replace function public.convertir_posible_venta(
  p_posible_id uuid,
  p_fecha_venta date default current_date
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_posible public.posibles_ventas%rowtype;
  v_venta_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Sesión no válida.';
  end if;

  select *
  into v_posible
  from public.posibles_ventas
  where id = p_posible_id
    and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'La posible venta no existe o no pertenece al usuario.';
  end if;

  insert into public.ventas (
    user_id,
    nombre_cliente,
    numero_cliente,
    fecha_venta,
    telefono,
    observaciones,
    origen_posible_venta_id
  ) values (
    v_posible.user_id,
    v_posible.nombre_cliente,
    v_posible.numero_cliente,
    coalesce(p_fecha_venta, current_date),
    v_posible.telefono,
    v_posible.observaciones,
    v_posible.id
  )
  returning id into v_venta_id;

  delete from public.posibles_ventas
  where id = v_posible.id
    and user_id = auth.uid();

  return v_venta_id;
end;
$$;

revoke all on function public.convertir_posible_venta(uuid, date) from public;
grant execute on function public.convertir_posible_venta(uuid, date) to authenticated;

-- 7. Validación de cierre
-- Supabase Security Advisor debe mostrar ambas tablas con RLS habilitado.
