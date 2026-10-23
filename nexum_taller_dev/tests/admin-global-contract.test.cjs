const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const fn = fs.readFileSync(path.join(root, 'supabase/functions/nexum-global-admin/index.ts'), 'utf8');
const migration = fs.readFileSync(path.join(root, 'MIGRACION_ADMIN_GLOBAL_V1.sql'), 'utf8');
const foundation = fs.readFileSync(path.join(root, 'MIGRACION_FUNDACION_ADMIN_GLOBAL_20261013.sql'), 'utf8');
const frontend = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

for (const action of ['dashboard','list_workshops','create_workshop','set_workshop_status','list_users','create_user','set_user_status','set_membership','list_audit','list_global_admins','set_global_admin_status','list_memberships']) {
  assert.ok(fn.includes(`"${action}"`), `missing action ${action}`);
}
assert.ok(fn.includes('admin.auth.getUser(match[1])'), 'must verify the bearer token with Supabase Auth');
assert.ok(fn.includes('nexum_global_admins'), 'must use separate global-admin allowlist');
assert.ok(fn.includes('force_password_change'), 'must block users with forced initial password change');
assert.ok(fn.includes('nexum_admin_audit_log'), 'must audit admin operations');
assert.ok(fn.includes('Never echo the temporary password') || fn.includes('Never echo the temporary password.'), 'must not return temporary password');
assert.ok(foundation.includes('enable row level security'), 'admin tables must have RLS enabled');
assert.ok(foundation.includes('from public, anon, authenticated'), 'direct client privileges must be revoked');
assert.ok(!/SUPABASE_SERVICE_ROLE_KEY\s*=\s*["'][^"']+["']/.test(frontend), 'service role key must never be hardcoded in frontend');
assert.ok(html.includes('id="globalAdminPanel" class="hidden"'), 'admin console must start hidden');
assert.ok(frontend.includes('/functions/v1/nexum-global-admin'), 'console must call the admin edge function');
assert.ok(migration.includes('add column if not exists is_active boolean not null default true'), 'workshop status migration must be additive and preserve existing workshops');
assert.ok(migration.includes('and w.is_active = true'), 'inactive workshops must be blocked by the common membership gate');
assert.ok(fn.includes('workshop.create_requested'), 'must record the requested mutation before applying it');
assert.ok(fn.includes('workshop.create_and_membership'), 'workshop creation must audit the workshop and creator membership together');
assert.ok(fn.includes('workshop_membership_create_failed_rolled_back'), 'workshop must roll back if creator membership cannot be created');
assert.ok(frontend.includes('ID del taller: ${w.id}'), 'admin console must show the workshop UUID needed for sync');
assert.ok(frontend.includes('Usar en este dispositivo'), 'admin console must allow one-click local workshop binding');
assert.ok(frontend.includes('nexum-sync-config-changed'), 'manual sync panel must refresh after local workshop binding');
assert.ok(fn.includes('isLastUsableGlobalAdmin'), 'must protect the last usable global administrator from deactivation');
assert.ok(fn.includes('cannot_deactivate_last_usable_global_admin'), 'must reject last-admin lockout');
console.log('admin-global contract tests: OK');
