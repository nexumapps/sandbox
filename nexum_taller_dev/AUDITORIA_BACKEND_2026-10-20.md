# Auditoría de backend — 2026-10-20

## Estado del proyecto

- Proyecto: `NEXUM-app` (`ywcrowviufbioeqixwrq`), región `us-east-2`.
- Estado tras reanudar: `ACTIVE_HEALTHY`.
- PostgreSQL: 17.11.
- Usuarios de Auth: 2; perfiles: 2.
- Talleres, membresías, dispositivos y registros de sincronización: 0 filas en la inspección.
- `nexum_global_admins`: 0 filas; `nexum_admin_audit_log`: 0 filas.
- No se crearon ni modificaron usuarios, talleres, membresías ni datos operativos.

## Migración ejecutada durante el trabajo de v11

Migración Supabase: `admin_global_workshop_status_v1` (versión registrada `20261020210050`).

- Añadió `public.nexum_workshops.is_active boolean not null default true`.
- Actualizó `public.nexum_is_member(uuid)` para exigir además que el taller esté activo.
- Verificación posterior: columna presente, `NOT NULL`, default `true`; definición SQL confirma el filtro `w.is_active = true`.
- Se conservaron permisos existentes de `nexum_is_member`: ejecución para `authenticated`, `service_role` y propietario `postgres`.
- Se desplegó `nexum-global-admin` versión 1 con `verify_jwt=true`; identificador `76e36dd2-e4a4-4877-abd4-798529981fa4`; SHA-256 del bundle `2109368a39d76f46a6b6774e4f865f8fded978ba2b8589a0d76894b6186d31fa`.

## Controles revisados

- Las tablas `nexum_global_admins` y `nexum_admin_audit_log` tienen RLS activado y no tienen grants directos para `anon` ni `authenticated`; los grants observados son para `service_role`. Esto es intencional para tablas de acceso exclusivo del backend, aunque el asesor de Supabase muestra `rls_enabled_no_policy` informativo.
- `profiles` conserva lectura autenticada limitada por RLS y las restricciones de actualización de columnas revisadas en migraciones previas.
- Las funciones de sincronización `nexum_apply_sync_operation`, `nexum_pull_sync_changes` y `nexum_is_member` siguen siendo `SECURITY DEFINER` ejecutables por usuarios autenticados. Es intencional para el diseño RPC, pero requiere conservar la validación interna de identidad, membresía, estado del perfil y taller.
- El asesor de seguridad sigue indicando protección contra contraseñas filtradas desactivada; se mantiene para la fase final de seguridad, salvo que se determine un riesgo crítico.
- El asesor de rendimiento informa una FK sin índice en `nexum_global_admins.created_by`. No es bloqueo funcional; revisar cuando se cierre la estructura de auditoría.

## Pendientes

1. La Edge Function está desplegada con `verify_jwt=true`; la revisión de contrato estático pasa. La plataforma debe validar JWT antes de invocar el handler y el handler vuelve a comprobar la identidad con Supabase Auth.
2. No existe todavía ningún administrador global autorizado. Crear el primero solo mediante operación controlada de propietario para un UUID verificado, no desde un endpoint público.
3. Probar cada acción con JWT real, incluyendo rechazo a usuarios no globales y registro de auditoría; no es posible completar esa prueba positiva mientras no exista un administrador global. No se ha creado ningún dato de prueba.
4. La migración local `MIGRACION_SINCRONIZACION_MANUAL_V10.sql` crea `nexum_register_sync_device`, pero esa migración no figura en el historial remoto y la función no apareció en la lista de RPC revisadas. Verificar/aplicar como parte del paso 3 antes de probar sincronización real.
