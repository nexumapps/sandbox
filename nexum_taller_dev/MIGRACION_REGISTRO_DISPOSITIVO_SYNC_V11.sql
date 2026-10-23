-- NEXUM Taller V6.0-dev-v11
-- Completa el RPC que la aplicación llama antes de subir/descargar cambios.
-- La función solo registra dispositivos autenticados con membresía activa.
-- No concede INSERT directo a anon/authenticated sobre nexum_sync_devices.
create or replace function public.nexum_register_sync_device(
  p_workshop_id uuid,
  p_device_id uuid,
  p_device_label text default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_label text := left(coalesce(nullif(trim(p_device_label), ''), 'Dispositivo NEXUM'), 120);
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;

  if p_workshop_id is null or p_device_id is null
     or not public.nexum_is_member(p_workshop_id) then
    raise exception 'workshop_access_denied' using errcode = '42501';
  end if;

  insert into public.nexum_sync_devices(id, workshop_id, user_id, device_label, last_seen_at)
  values (p_device_id, p_workshop_id, v_user_id, v_label, pg_catalog.now())
  on conflict (id) do update
    set device_label = excluded.device_label,
        last_seen_at = pg_catalog.now()
    where nexum_sync_devices.workshop_id = excluded.workshop_id
      and nexum_sync_devices.user_id = excluded.user_id;

  if not exists (
    select 1 from public.nexum_sync_devices d
    where d.id = p_device_id
      and d.workshop_id = p_workshop_id
      and d.user_id = v_user_id
  ) then
    raise exception 'device_access_denied' using errcode = '42501';
  end if;

  return jsonb_build_object('registered', true, 'device_id', p_device_id);
end;
$$;

revoke all on function public.nexum_register_sync_device(uuid, uuid, text) from public, anon;
grant execute on function public.nexum_register_sync_device(uuid, uuid, text) to authenticated;
