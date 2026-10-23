-- NEXUM Taller 6.0-dev
-- Migración aplicada en Supabase el 2026-10-10.
-- Propósito: impedir acceso a operaciones protegidas por membresía mientras
-- el perfil mantenga force_password_change=true. Esto también cubre el caso
-- en que alguien obtenga un JWT directamente desde Supabase Auth, evitando
-- depender únicamente de la pantalla de login de la PWA.

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
    where m.workshop_id = p_workshop_id
      and m.user_id = (select auth.uid())
      and m.is_active = true
      and p.is_active = true
      and coalesce(p.force_password_change, false) = false
  );
$function$;

comment on function public.nexum_is_member(uuid) is
  'Checks active workshop membership and blocks workshop access until the initial password change is complete.';
