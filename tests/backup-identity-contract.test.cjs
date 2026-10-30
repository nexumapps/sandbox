const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const version = fs.readFileSync(path.join(root, 'version.txt'), 'utf8').trim();
const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');

const appVersion = app.match(/const APP_VERSION="([^"]+)"/)?.[1];
assert.equal(appVersion, version, 'APP_VERSION debe coincidir con version.txt');
assert.equal(version, '6.0.71beta');

const exportStart = app.indexOf('$("backupBtn").onclick=');
const restoreStart = app.indexOf('$("restoreBtn").onclick=', exportStart);
assert.ok(exportStart >= 0 && restoreStart > exportStart, 'Debe existir el manejador de exportación');
const exportHandler = app.slice(exportStart, restoreStart);
const identityGuard = exportHandler.indexOf('if(ACTIVE_WORKSHOP_CONTEXT==="__unassigned__")');
const payload = exportHandler.indexOf('let payload=');
assert.ok(identityGuard >= 0, 'Exportación debe bloquear el taller no asignado');
assert.ok(payload > identityGuard, 'La validación debe ocurrir antes de construir el archivo');
assert.match(exportHandler, /return\}/, 'El bloqueo debe terminar el manejador antes de exportar');

const restoreHandler = app.slice(restoreStart);
assert.match(restoreHandler, /p\.workshop\.id==="__unassigned__"/, 'Restauración debe rechazar backups sin identidad verificable');
assert.match(restoreHandler, /p\.workshop\.id!==ACTIVE_WORKSHOP_CONTEXT/, 'Restauración debe rechazar otro taller');
assert.match(html, /NEXUM — Taller · V6\.0\.71beta/);
assert.match(html, /id="appVersion" class="brand-version">V6\.0\.71beta<\/small>/, 'La versión de respaldo sin conexión debe coincidir con version.txt');
assert.match(html, /app\.js\?v=142/);
assert.match(sw, /nexum-v152/);
assert.match(sw, /app\.js\?v=142/);
assert.match(changelog, /V6\.0\.71beta — mostrar correctamente el rol de Administrador Global/);

console.log('PASS: versión, exportación con taller asignado, bloqueo de restauración cruzada y caché PWA.');

assert.ok(app.includes('functions/v1/nexum-global-admin'));
assert.match(app, /action:"list_global_admins"/);
assert.match(app, /globalAdmin\?"Administrador Global"/);
assert.match(changelog, /V6\.0\.71beta — mostrar correctamente el rol de Administrador Global/);
