# Revisión de seguridad — NEXUM Taller 6.0-dev

Fecha: 2026-10-10

## Hallazgos revisados

### 1. Primer acceso y acceso a datos compartidos
- `login-with-username` comprueba `profiles.is_active` y `profiles.force_password_change`; si el cambio está pendiente responde HTTP 428 sin entregar tokens a la PWA.
- La autenticación directa contra Supabase Auth puede emitir un JWT si se conocen las credenciales. Por eso el bloqueo no puede depender solo de la función de login de NEXUM.
- `public.nexum_is_member(uuid)` se actualizó en Supabase para exigir membresía activa, perfil activo y `force_password_change=false`.
- Las políticas revisadas para `nexum_workshops`, `nexum_memberships`, `nexum_sync_devices`, `nexum_sync_records`, `nexum_sync_changes` y `nexum_sync_operations` usan esta comprobación para las operaciones de lectura/escritura que tienen políticas.
- Las RPC `nexum_apply_sync_operation` y `nexum_pull_sync_changes` también invocan la comprobación.

### 2. Perfil propio
- La política de perfil permite al usuario autenticado leer y actualizar su propia fila.
- La protección de `force_password_change`, `role` e `is_active` depende del trigger de seguridad existente. Debe mantenerse habilitado y probarse con JWT real; esta revisión no modifica esos campos ni perfiles existentes.
- La lectura del perfil propio durante un cambio pendiente no equivale a acceso a los datos del taller, pero se debe verificar que el usuario no pueda cambiar campos protegidos mediante UPDATE directo.

### 3. Sesión PWA
- El access token y refresh token se almacenan en `localStorage` bajo `nexum_v6_auth_session`; la contraseña no se guarda.
- `localStorage` expone los tokens a cualquier JavaScript ejecutado en el mismo origen. Antes de uso operativo hay que reducir el riesgo de XSS y valorar un almacenamiento más seguro en el contenedor de la aplicación. No se debe tratar el almacenamiento actual como protección equivalente a cookies HttpOnly.
- En V7 se usa Web Locks (`navigator.locks`) para coordinar renovaciones entre pestañas del mismo origen cuando el navegador lo soporta. La función vuelve a leer la sesión dentro del bloqueo y evita borrar/sobrescribir una sesión rotada por otra pestaña. En navegadores sin Web Locks la exclusión sigue siendo solo por pestaña; se necesita prueba en los navegadores objetivo.
- El cierre de sesión borra primero la sesión local y solicita revocación remota como operación best-effort. Sin conexión, la copia local de la sesión desaparece, pero la revocación remota no se puede confirmar hasta que el servidor responda.

### 4. Edge Functions y navegador
- Las dos funciones usan `withSupabase({auth: "none"})` y verifican credenciales dentro del handler. La opción `verify_jwt=false` no significa que acepten una sesión como autenticada sin más; no obstante, deben probarse límites, métodos, CORS y respuestas desde el navegador real.
- La PWA envía `apikey` y `Content-Type` a ambas funciones. No se ha realizado todavía una prueba de preflight CORS desde el origen donde se alojará la aplicación.
- `change-initial-password` falla de forma cerrada si no puede limpiar la marca después de cambiar la contraseña. En ese caso la contraseña puede haber cambiado y el acceso normal seguir bloqueado; requiere recuperación administrativa, no debe reintentarse a ciegas.

## No realizado / límites
- No se creó ninguna cuenta ni se modificó contraseña de perfiles existentes.
- No se creó taller, membresía, dispositivo o registro de sincronización.
- No se probó una sesión JWT real ni se verificó visualmente el flujo en navegador/teléfono.
- No se ha completado una auditoría de todas las tablas, buckets de Storage, triggers y funciones SQL del proyecto.
- No se ha activado sincronización de tickets ni movimientos.

## Pruebas reales necesarias antes de alta definitiva
1. Cuenta temporal desechable y aislada: confirmar que login normal devuelve 428 sin tokens.
2. Intentar acceso directo a Supabase Auth con la misma contraseña temporal; confirmar que, aunque Auth emita JWT, RLS/RPC no permiten leer/escribir datos de taller.
3. Intentar modificar `force_password_change`, `role` e `is_active` mediante UPDATE directo; debe ser rechazado.
4. Cambiar contraseña a una de 8 caracteres, confirmar que la marca pasa a falso y que el nuevo login funciona sin volver a pedir cambio.
5. Probar preflight CORS, errores de red, expiración, renovación, dos pestañas (incluido navegador sin Web Locks, si aplica) y cierre de sesión.
6. Eliminar la cuenta de prueba solo después de verificar que no tenga dependencias; nunca reutilizar perfiles operativos como prueba.

## Actualización V7
- Añadida coordinación de renovación con Web Locks cuando está disponible.
- Añadida escucha del evento `storage` para actualizar el estado visible cuando otra pestaña cambia o elimina la sesión.
- Protección adicional para no reemplazar una sesión recién rotada ni borrar una sesión válida por el error de renovación de una pestaña obsoleta.
- La compatibilidad y el comportamiento real siguen pendientes de prueba en navegador/teléfono. No resuelve el riesgo de `localStorage` ante XSS.

## Estado
Desarrollo. No es un release operativo ni una certificación de seguridad.
