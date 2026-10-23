-- NEXUM Taller 6.0-dev-v11 — estado administrativo de talleres.
-- Revisado contra el esquema real de NEXUM-app el 2026-10-20.
-- La tabla nexum_workshops existe, pero todavía no tiene is_active.
-- Es aditiva: los talleres existentes quedan activos por defecto.
-- Aplicar solo después de revisar el diff y confirmar el proyecto correcto.

alter table public.nexum_workshops
  add column if not exists is_active boolean not null default true;

comment on column public.nexum_workshops.is_active is
  'Administrative status of the workshop. Inactive workshops cannot receive active memberships or sync operations.';

-- Hacer que la desactivación de un taller bloquee también las RPC de sincronización,
-- que ya llaman a nexum_is_member. No cambia los permisos de ejecución existentes.
create or replace function public.nexum_is_member(p_workshop_id uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select exists (
    select 1
    from public.nexum_memberships m
    join public.profiles p on p.id = m.user_id
    join public.nexum_workshops w on w.id = m.workshop_id
    where m.workshop_id = p_workshop_id
      and m.user_id = (select auth.uid())
      and m.is_active = true
      and p.is_active = true
      and coalesce(p.force_password_change, false) = false
      and w.is_active = true
  );
$function$;

comment on function public.nexum_is_member(uuid) is
  'Checks active workshop membership, active profile, completed initial password change, and active workshop status.';
