-- NEXUM Taller 6.0-dev-v11 — fundación de administración global.
-- NO aplicar hasta confirmar que el proyecto Supabase correcto está ACTIVE y que
-- el esquema base profiles/workshops/memberships coincide con la documentación.
-- La asignación inicial de administradores globales es un paso manual separado;
-- esta migración NO crea ni promueve ninguna cuenta.

create table if not exists public.nexum_global_admins (
  user_id uuid primary key references auth.users(id) on delete restrict,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid null references auth.users(id) on delete set null,
  note text null check (note is null or char_length(note) <= 500)
);

create table if not exists public.nexum_admin_audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid null references auth.users(id) on delete set null,
  action text not null check (char_length(action) between 1 and 100),
  target_type text not null check (char_length(target_type) between 1 and 80),
  target_id text null check (target_id is null or char_length(target_id) <= 200),
  workshop_id uuid null references public.nexum_workshops(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (octet_length(details::text) <= 16384)
);

create index if not exists nexum_admin_audit_log_created_at_idx
  on public.nexum_admin_audit_log (created_at desc);
create index if not exists nexum_admin_audit_log_actor_idx
  on public.nexum_admin_audit_log (actor_user_id, created_at desc);
create index if not exists nexum_admin_audit_log_workshop_idx
  on public.nexum_admin_audit_log (workshop_id, created_at desc);

alter table public.nexum_global_admins enable row level security;
alter table public.nexum_admin_audit_log enable row level security;

-- Backend-only: no direct table access from anon/authenticated clients.
revoke all privileges on table public.nexum_global_admins from public, anon, authenticated;
revoke all privileges on table public.nexum_admin_audit_log from public, anon, authenticated;
grant all privileges on table public.nexum_global_admins to service_role;
grant all privileges on table public.nexum_admin_audit_log to service_role;

comment on table public.nexum_global_admins is
  'Backend-only allowlist of global administrators. Never trust profiles.role for global administration.';
comment on table public.nexum_admin_audit_log is
  'Backend-only audit trail for sensitive global administration actions. Never store credentials or tokens.';
