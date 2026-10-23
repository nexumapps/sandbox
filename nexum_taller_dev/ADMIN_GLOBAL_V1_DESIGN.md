# Administración global — NEXUM Taller 6.0-dev-v13

## Estado

Implementación del contrato de backend y consola UI protegida por autorización del servidor. **La Edge Function `nexum-global-admin` está desplegada en Supabase como versión 2 con `verify_jwt=true`.** El 2026-10-20 el proyecto volvió a `ACTIVE_HEALTHY` y se confirmó el esquema base. La migración `admin_global_workshop_status_v1` ya se aplicó y verificó: `nexum_workshops.is_active` existe con `NOT NULL DEFAULT true`, y `nexum_is_member` exige taller activo. La consola se habilita solo cuando el backend confirma el permiso global. El primer administrador global ya fue provisionado de forma controlada; validar el flujo con sesión real antes de producción.

## Principios

- La administración global es independiente del rol operativo `profiles.role`.
- La única fuente de autorización global es una fila activa de `public.nexum_global_admins`.
- Cada petición verifica el JWT con Supabase Auth, después comprueba `profiles.is_active`, `profiles.force_password_change` y el registro global activo.
- La clave `service_role` se usa únicamente como secreto de entorno en Edge Functions; nunca se incorpora al paquete web.
- La acción `set_global_admin_status` permite a un administrador global activo otorgar/revocar el permiso a otros perfiles elegibles. El primer administrador se provisiona únicamente mediante un procedimiento de propietario controlado; no hay registro público ni autoelevación desde el cliente.
- No hay registro público, creación automática de taller ni importación automática de tickets, movimientos o fotos.
- La contraseña temporal no se devuelve ni se registra en auditoría. Se exige `force_password_change=true`.
- Las acciones administrativas escriben una entrada en `nexum_admin_audit_log` sin contraseñas, JWT, refresh tokens ni datos de autenticación.

## Acciones preparadas

| Acción | Propósito |
|---|---|
| `dashboard` | Resumen de talleres, usuarios y auditoría reciente |
| `list_workshops` | Listar talleres |
| `create_workshop` | Crear un taller activo |
| `set_workshop_status` | Activar/desactivar taller |
| `list_users` | Listar perfiles y estado de primer acceso |
| `create_user` | Crear usuario Auth y perfil, con cambio obligatorio; elimina el usuario Auth si falla la inserción del perfil |
| `set_user_status` | Activar/desactivar perfil; impide desactivar al administrador global que ejecuta la acción y al último administrador global utilizable |
| `set_membership` | Crear/activar/desactivar membresía de usuario en taller |
| `list_audit` | Leer hasta 200 eventos recientes |
| `list_global_admins` | Listar administradores globales con su perfil |
| `list_memberships` | Listar membresías activas e inactivas para administración |
| `set_global_admin_status` | Otorgar/revocar administración global; requiere un administrador global existente, perfil activo y contraseña inicial completada; impide revocarse a sí mismo y protege al último administrador global utilizable |

## Dependencias de esquema que deben confirmarse

El handler asume los nombres/columnas ya descritos en la documentación del proyecto:

- `profiles`: `id`, `username`, `role`, `display_name`, `email_snapshot`, `is_active`, `force_password_change`, `created_at`, `updated_at`.
- `nexum_workshops`: `id`, `name`, `created_at`, `created_by`; `is_active` se incorpora mediante `MIGRACION_ADMIN_GLOBAL_V1.sql`.
- `nexum_memberships`: `workshop_id`, `user_id`, `is_active` y unicidad de `(workshop_id,user_id)`.
- `nexum_global_admins` y `nexum_admin_audit_log`: definidos por `MIGRACION_ADMIN_GLOBAL_V1.sql`.

Si el esquema real difiere, corregir migración y handler juntos antes de desplegar. No ejecutar migraciones a ciegas.

## Límites conocidos de esta primera iteración

1. La creación de Auth y perfil no puede ser una transacción SQL única; ante fallo del perfil se intenta eliminar el usuario Auth recién creado. Este camino requiere prueba de fallo.
2. Las mutaciones y su evento de auditoría se realizan mediante llamadas separadas; antes de producción conviene consolidar las mutaciones SQL y la auditoría en RPC transaccionales donde sea posible. Si falla la escritura de auditoría, la operación puede haberse aplicado; no se debe desplegar hasta resolver o aceptar explícitamente ese riesgo.
3. La consola administrativa inicial ya está integrada en Configuración. Todavía faltan paginación completa, búsqueda, flujo de invitaciones y revocación de sesiones de usuarios.
4. `set_user_status` no sustituye la revocación de sesiones activas; la autorización de membresía/RPC debe seguir verificando `profiles.is_active`.
5. El proyecto está `ACTIVE_HEALTHY`; la función está desplegada. La prueba integral con JWT real sigue pendiente porque todavía no existe administrador global.

## Secuencia segura de activación

1. Esperar a que el proyecto correcto informe `ACTIVE`.
2. Verificar URL/ref, tablas, columnas, restricciones, migraciones, RPC y triggers reales.
3. Confirmar que el esquema base y las tablas globales están presentes; aplicar únicamente las migraciones que falten y revisar el diff.
4. Desplegar la Edge Function con `verify_jwt=true` y secreto de servicio en entorno, nunca en el cliente.
5. Verificar `verify_jwt=true` y probar peticiones anónimas, JWT inválido, perfil inactivo, cambio inicial pendiente y usuario no global: todas deben ser rechazadas. La revisión estática confirma los controles del handler; las pruebas con JWT real quedan pendientes hasta disponer de un administrador global.
6. Crear la primera fila global-admin mediante operación de propietario controlada para un UUID confirmado; nunca por un endpoint público.
7. Probar cada acción con datos de ensayo, incluidos errores y auditoría.
8. La interfaz está incorporada en la versión local de desarrollo; solo podrá operar después del alta inicial y de las pruebas con JWT real.


## V6.0-dev-v13 — alta de taller y vinculación local
- `create_workshop` activa también una membresía para el administrador creador; intenta revertir el taller si falla la membresía o la auditoría final.
- La consola presenta el UUID del taller y permite vincular el dispositivo actual con un clic.
- El proyecto tiene ahora el taller NEXUM ONE y una membresía activa del administrador global principal, creados mediante operación controlada y registrados en auditoría.
- No considerar completa la sincronización hasta probar envío, descarga, idempotencia y conflicto en dos clientes autenticados.
