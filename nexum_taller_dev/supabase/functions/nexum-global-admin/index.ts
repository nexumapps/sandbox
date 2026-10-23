// NEXUM Taller 6.0-dev-v13
// API de administración global. El despliegue de la Edge Function se gestiona por separado del paquete estático.
// Todas las acciones exigen JWT válido, perfil activo y registro activo en nexum_global_admins.
// La identidad del actor se obtiene del JWT verificado; nunca se acepta actor_user_id del cliente.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Pragma": "no-cache",
};
const MAX_BODY_BYTES = 32 * 1024;
const USERNAME_RE = /^[a-z0-9_]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ACTIONS = new Set([
  "dashboard", "list_workshops", "create_workshop", "set_workshop_status",
  "list_users", "create_user", "set_user_status", "set_membership", "list_audit",
  "list_global_admins", "set_global_admin_status", "list_memberships",
]);

type Json = Record<string, unknown>;
type Actor = { id: string; email?: string };

function response(status: number, body: Json) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}
function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function validUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}
function fail(message: string, status = 400) { return response(status, { ok: false, error: message }); }

async function requireActor(req: Request, admin: SupabaseClient): Promise<Actor> {
  const header = req.headers.get("Authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) throw Object.assign(new Error("authentication_required"), { status: 401 });
  const { data, error } = await admin.auth.getUser(match[1]);
  if (error || !data.user) throw Object.assign(new Error("invalid_session"), { status: 401 });
  const actor = data.user;
  const { data: profile, error: profileError } = await admin
    .from("profiles").select("id,is_active,force_password_change").eq("id", actor.id).maybeSingle();
  if (profileError) throw Object.assign(new Error("profile_check_failed"), { status: 503 });
  if (!profile || profile.is_active !== true || profile.force_password_change === true) {
    throw Object.assign(new Error("account_not_authorized"), { status: 403 });
  }
  const { data: globalAdmin, error: adminError } = await admin
    .from("nexum_global_admins").select("user_id,is_active").eq("user_id", actor.id).maybeSingle();
  if (adminError) throw Object.assign(new Error("global_admin_check_failed"), { status: 503 });
  if (!globalAdmin || globalAdmin.is_active !== true) {
    throw Object.assign(new Error("global_admin_required"), { status: 403 });
  }
  return { id: actor.id, email: actor.email };
}

async function audit(admin: SupabaseClient, actor: Actor, action: string, targetType: string,
  targetId: string | null, workshopId: string | null, details: Json = {}) {
  // No passwords, access tokens, refresh tokens, or raw authentication payloads are logged.
  const safeDetails = JSON.parse(JSON.stringify(details)) as Json;
  const serialized = JSON.stringify(safeDetails);
  if (new TextEncoder().encode(serialized).byteLength > 16000) throw new Error("audit_details_too_large");
  const { error } = await admin.from("nexum_admin_audit_log").insert({
    actor_user_id: actor.id, action, target_type: targetType, target_id: targetId,
    workshop_id: workshopId, details: safeDetails,
  });
  if (error) throw Object.assign(new Error("audit_write_failed"), { status: 503 });
}

async function listWorkshops(admin: SupabaseClient) {
  const { data, error } = await admin.from("nexum_workshops")
    .select("id,name,is_active,created_at").order("created_at", { ascending: false }).limit(500);
  if (error) throw Object.assign(new Error("workshop_list_failed"), { status: 503 });
  return data ?? [];
}
async function listUsers(admin: SupabaseClient) {
  const { data, error } = await admin.from("profiles")
    .select("id,username,role,display_name,email_snapshot,is_active,force_password_change,created_at,updated_at")
    .order("created_at", { ascending: false }).limit(1000);
  if (error) throw Object.assign(new Error("user_list_failed"), { status: 503 });
  return data ?? [];
}
async function listMemberships(admin: SupabaseClient) {
  const { data, error } = await admin.from("nexum_memberships")
    .select("workshop_id,user_id,is_active,created_at,created_by").order("created_at", { ascending: false }).limit(1000);
  if (error) throw Object.assign(new Error("membership_list_failed"), { status: 503 });
  return data ?? [];
}

async function isLastUsableGlobalAdmin(admin: SupabaseClient, userId: string): Promise<boolean> {
  const { data: admins, error: adminError } = await admin.from("nexum_global_admins")
    .select("user_id").eq("is_active", true);
  if (adminError) throw Object.assign(new Error("global_admin_count_failed"), { status: 503 });
  const ids = (admins ?? []).map((row) => row.user_id);
  if (!ids.includes(userId)) return false;
  const { data: profiles, error: profileError } = await admin.from("profiles")
    .select("id,is_active,force_password_change").in("id", ids);
  if (profileError) throw Object.assign(new Error("global_admin_count_failed"), { status: 503 });
  const usable = (profiles ?? []).filter((profile) => profile.is_active === true && profile.force_password_change !== true);
  return usable.length <= 1;
}

async function listGlobalAdmins(admin: SupabaseClient) {
  const { data: admins, error } = await admin.from("nexum_global_admins")
    .select("user_id,is_active,created_at,created_by,note").order("created_at", { ascending: false }).limit(500);
  if (error) throw Object.assign(new Error("global_admin_list_failed"), { status: 503 });
  const ids = (admins ?? []).map((row) => row.user_id);
  if (!ids.length) return [];
  const { data: profiles, error: profileError } = await admin.from("profiles")
    .select("id,username,display_name,email_snapshot,is_active,force_password_change").in("id", ids);
  if (profileError) throw Object.assign(new Error("global_admin_profiles_failed"), { status: 503 });
  const byId = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  return (admins ?? []).map((row) => ({ ...row, profile: byId.get(row.user_id) ?? null }));
}

async function listAudit(admin: SupabaseClient) {
  const { data, error } = await admin.from("nexum_admin_audit_log")
    .select("id,actor_user_id,action,target_type,target_id,workshop_id,details,created_at")
    .order("created_at", { ascending: false }).limit(200);
  if (error) throw Object.assign(new Error("audit_list_failed"), { status: 503 });
  return data ?? [];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return fail("method_not_allowed", 405);
  const length = Number(req.headers.get("content-length") ?? 0);
  if (Number.isFinite(length) && length > MAX_BODY_BYTES) return fail("request_too_large", 413);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return fail("admin_service_unavailable", 503);
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  try {
    const actor = await requireActor(req, admin);
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return fail("request_too_large", 413);
    let body: Json;
    try { body = JSON.parse(raw); } catch { return fail("invalid_json"); }
    const action = text(body.action, 50);
    if (!ACTIONS.has(action)) return fail("unsupported_action");

    if (action === "dashboard") {
      const [workshops, users, auditRows, globalAdmins, memberships] = await Promise.all([listWorkshops(admin), listUsers(admin), listAudit(admin), listGlobalAdmins(admin), listMemberships(admin)]);
      return response(200, { ok: true, data: { workshops, users, global_admins: globalAdmins, memberships, recent_audit: auditRows.slice(0, 20) } });
    }
    if (action === "list_workshops") return response(200, { ok: true, data: await listWorkshops(admin) });
    if (action === "list_users") return response(200, { ok: true, data: await listUsers(admin) });
    if (action === "list_audit") return response(200, { ok: true, data: await listAudit(admin) });
    if (action === "list_global_admins") return response(200, { ok: true, data: await listGlobalAdmins(admin) });
    if (action === "list_memberships") return response(200, { ok: true, data: await listMemberships(admin) });

    if (action === "set_global_admin_status") {
      const userId = body.user_id;
      const isActive = body.is_active;
      const note = text(body.note, 500);
      if (!validUuid(userId) || typeof isActive !== "boolean") return fail("invalid_global_admin_input");
      if (userId === actor.id && isActive === false) return fail("cannot_deactivate_current_global_admin", 409);
      if (isActive === false && await isLastUsableGlobalAdmin(admin, userId)) {
        return fail("cannot_deactivate_last_usable_global_admin", 409);
      }
      await audit(admin, actor, "global_admin.set_status_requested", "global_admin", userId, null, { is_active: isActive, note });
      const { data: profile, error: profileError } = await admin.from("profiles")
        .select("id,is_active,force_password_change").eq("id", userId).maybeSingle();
      if (profileError || !profile) return fail("target_profile_not_found", 404);
      if (isActive && (profile.is_active !== true || profile.force_password_change === true)) {
        return fail("target_profile_must_be_active_and_password_ready", 409);
      }
      let error;
      if (isActive) {
        ({ error } = await admin.from("nexum_global_admins").upsert({
          user_id: userId, is_active: true, created_by: actor.id, note: note || null,
        }, { onConflict: "user_id" }));
      } else {
        const { data: existing, error: lookupError } = await admin.from("nexum_global_admins")
          .select("user_id").eq("user_id", userId).maybeSingle();
        if (lookupError) return fail("global_admin_lookup_failed", 503);
        if (!existing) return fail("global_admin_not_found", 404);
        ({ error } = await admin.from("nexum_global_admins").update({ is_active: false, note: note || null }).eq("user_id", userId));
      }
      if (error) return fail("global_admin_update_failed", 409);
      await audit(admin, actor, "global_admin.set_status", "global_admin", userId, null, { is_active: isActive, note });
      return response(200, { ok: true, data: { user_id: userId, is_active: isActive, note: note || null } });
    }

    if (action === "create_workshop") {
      const name = text(body.name, 120);
      if (name.length < 2) return fail("workshop_name_required");
      await audit(admin, actor, "workshop.create_requested", "workshop", null, null, { name });
      const { data, error } = await admin.from("nexum_workshops")
        .insert({ name, is_active: true, created_by: actor.id }).select("id,name,is_active,created_at").single();
      if (error || !data) return fail("workshop_create_failed_schema_or_validation", 409);

      // V6.0-dev-v13: the creator receives an active membership atomically from the
      // workflow perspective; otherwise a successfully created workshop cannot sync.
      const { error: membershipError } = await admin.from("nexum_memberships").upsert({
        workshop_id: data.id, user_id: actor.id, is_active: true, created_by: actor.id,
      }, { onConflict: "workshop_id,user_id" });
      if (membershipError) {
        await admin.from("nexum_workshops").delete().eq("id", data.id);
        return fail("workshop_membership_create_failed_rolled_back", 409);
      }
      try {
        await audit(admin, actor, "workshop.create_and_membership", "workshop", data.id, data.id,
          { name: data.name, membership_user_id: actor.id, membership_active: true });
      } catch {
        // Roll back both rows if the final audit record cannot be written.
        await admin.from("nexum_memberships").delete().eq("workshop_id", data.id).eq("user_id", actor.id);
        await admin.from("nexum_workshops").delete().eq("id", data.id);
        return fail("workshop_create_rolled_back_audit_failure", 503);
      }
      return response(201, { ok: true, data: { ...data, membership: { user_id: actor.id, is_active: true } } });
    }

    if (action === "set_workshop_status") {
      const workshopId = body.workshop_id;
      if (!validUuid(workshopId) || typeof body.is_active !== "boolean") return fail("invalid_workshop_status_input");
      await audit(admin, actor, "workshop.set_status_requested", "workshop", workshopId, workshopId, { is_active: body.is_active });
      const { data, error } = await admin.from("nexum_workshops").update({ is_active: body.is_active })
        .eq("id", workshopId).select("id,name,is_active").maybeSingle();
      if (error || !data) return fail("workshop_update_failed", 409);
      await audit(admin, actor, "workshop.set_status", "workshop", workshopId, workshopId, { is_active: body.is_active });
      return response(200, { ok: true, data });
    }

    if (action === "create_user") {
      const email = text(body.email, 254).toLowerCase();
      const username = text(body.username, 30).toLowerCase();
      const displayName = text(body.display_name, 120);
      const password = typeof body.temporary_password === "string" ? body.temporary_password : "";
      if (!EMAIL_RE.test(email) || !USERNAME_RE.test(username) || displayName.length < 1) return fail("invalid_user_input");
      if (password.length < 12 || password.length > 128) return fail("temporary_password_must_be_12_to_128_chars");
      await audit(admin, actor, "user.create_requested", "user", null, null, { username, email, display_name: displayName });
      const { data: usernameMatch, error: usernameError } = await admin.from("profiles").select("id")
        .eq("username", username).limit(1);
      if (usernameError) return fail("user_precheck_failed", 503);
      const { data: emailMatch, error: emailError } = await admin.from("profiles").select("id")
        .eq("email_snapshot", email).limit(1);
      if (emailError) return fail("user_precheck_failed", 503);
      if (usernameMatch?.length || emailMatch?.length) return fail("username_or_email_already_in_use", 409);
      const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
      });
      if (authError || !authData.user) return fail("auth_user_create_failed", 409);
      const userId = authData.user.id;
      const { error: profileError } = await admin.from("profiles").insert({
        id: userId, username, role: "technician", display_name: displayName,
        email_snapshot: email, is_active: true, force_password_change: true,
      });
      if (profileError) {
        try { await admin.auth.admin.deleteUser(userId); } catch { /* Best-effort rollback; audit request remains. */ }
        return fail("profile_create_failed_auth_user_rolled_back", 409);
      }
      await audit(admin, actor, "user.create", "user", userId, null,
        { username, email, display_name: displayName, force_password_change: true });
      // Never echo the temporary password. The caller must communicate it via a private channel.
      return response(201, { ok: true, data: { id: userId, username, email, display_name: displayName, is_active: true, force_password_change: true } });
    }

    if (action === "set_user_status") {
      const userId = body.user_id;
      if (!validUuid(userId) || typeof body.is_active !== "boolean") return fail("invalid_user_status_input");
      if (userId === actor.id && body.is_active === false) return fail("cannot_deactivate_current_global_admin", 409);
      if (body.is_active === false && await isLastUsableGlobalAdmin(admin, userId)) {
        return fail("cannot_deactivate_last_usable_global_admin", 409);
      }
      await audit(admin, actor, "user.set_status_requested", "user", userId, null, { is_active: body.is_active });
      const { data, error } = await admin.from("profiles").update({ is_active: body.is_active })
        .eq("id", userId).select("id,username,display_name,is_active").maybeSingle();
      if (error || !data) return fail("user_update_failed", 409);
      await audit(admin, actor, "user.set_status", "user", userId, null, { is_active: body.is_active });
      return response(200, { ok: true, data });
    }

    if (action === "set_membership") {
      const userId = body.user_id, workshopId = body.workshop_id;
      if (!validUuid(userId) || !validUuid(workshopId) || typeof body.is_active !== "boolean") return fail("invalid_membership_input");
      await audit(admin, actor, "membership.set_status_requested", "membership", `${workshopId}:${userId}`, workshopId,
        { user_id: userId, is_active: body.is_active });
      const { data: user, error: userError } = await admin.from("profiles").select("id,is_active").eq("id", userId).maybeSingle();
      if (userError || !user || (body.is_active && user.is_active !== true)) return fail("active_user_required", 409);
      const { data: workshop, error: workshopError } = await admin.from("nexum_workshops").select("id,is_active").eq("id", workshopId).maybeSingle();
      if (workshopError || !workshop || (body.is_active && workshop.is_active !== true)) return fail("active_workshop_required", 409);
      const { data: existing, error: lookupError } = await admin.from("nexum_memberships").select("workshop_id,user_id")
        .eq("workshop_id", workshopId).eq("user_id", userId).maybeSingle();
      if (lookupError) return fail("membership_lookup_failed", 503);
      let error;
      if (existing) {
        ({ error } = await admin.from("nexum_memberships").update({ is_active: body.is_active })
          .eq("workshop_id", workshopId).eq("user_id", userId));
      } else if (body.is_active) {
        ({ error } = await admin.from("nexum_memberships").insert({ workshop_id: workshopId, user_id: userId, is_active: true, created_by: actor.id }));
      } else {
        return fail("cannot_deactivate_missing_membership", 409);
      }
      if (error) return fail("membership_update_failed_schema_or_validation", 409);
      await audit(admin, actor, "membership.set_status", "membership", `${workshopId}:${userId}`, workshopId,
        { user_id: userId, is_active: body.is_active });
      return response(200, { ok: true, data: { user_id: userId, workshop_id: workshopId, is_active: body.is_active } });
    }
    return fail("unsupported_action");
  } catch (error) {
    const status = Number((error as { status?: number }).status ?? 500);
    const message = error instanceof Error ? error.message : "unexpected_error";
    const safe = new Set(["authentication_required", "invalid_session", "account_not_authorized", "global_admin_required"]);
    return fail(safe.has(message) ? message : status === 503 ? message : "admin_request_failed", status >= 400 && status <= 599 ? status : 500);
  }
});
