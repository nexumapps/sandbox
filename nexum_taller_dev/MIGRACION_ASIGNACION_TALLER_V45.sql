-- NEXUM Taller V6.0-dev-v45: resolve a signed-in user's active workshop memberships.
-- Returns only the caller's own active memberships; the client never needs to type a workshop UUID.
create or replace function public.nexum_get_my_workshops()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_global_admin boolean := false;
  v_workshops jsonb := '[]'::jsonb;
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.id = v_user_id and p.is_active = true
      and coalesce(p.force_password_change, false) = false
  ) then
    return jsonb_build_object('ok', false, 'reason', 'account_not_authorized',
      'is_global_admin', false, 'workshops', '[]'::jsonb);
  end if;
  select exists (
    select 1 from public.nexum_global_admins ga
    where ga.user_id = v_user_id and ga.is_active = true
  ) into v_global_admin;
  select coalesce(
    jsonb_agg(jsonb_build_object('id', w.id, 'name', w.name) order by w.name),
    '[]'::jsonb
  ) into v_workshops
  from public.nexum_memberships m
  join public.nexum_workshops w on w.id = m.workshop_id
  where m.user_id = v_user_id and m.is_active = true and w.is_active = true;
  return jsonb_build_object('ok', true, 'is_global_admin', v_global_admin, 'workshops', v_workshops);
end;
$function$;
revoke all on function public.nexum_get_my_workshops() from public, anon;
grant execute on function public.nexum_get_my_workshops() to authenticated;
comment on function public.nexum_get_my_workshops() is
  'Returns the authenticated active profile own active workshop memberships and global-admin flag; never accepts a client-selected user ID.';
