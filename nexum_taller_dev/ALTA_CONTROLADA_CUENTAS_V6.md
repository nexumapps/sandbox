# Procedimiento de alta controlada — NEXUM Taller 6.0

**Estado: preparado, no ejecutado.** No se han creado usuarios, talleres, membresías ni dispositivos. Este documento es una guía operativa para revisar antes de cualquier alta real.

## Decisiones acordadas

- Sin registro público desde la aplicación.
- Una cuenta individual por persona.
- Identificadores sencillos: nombres de usuario, no una cuenta compartida.
- Las tres cuentas tendrán permisos operativos equivalentes dentro del mismo taller.
- La administración de cuentas puede mantenerse separada de los permisos operativos.
- Crear las cuentas no autoriza a subir tickets, movimientos, categorías ni fotos existentes.

## Identificadores propuestos

| Persona | Nombre de usuario propuesto | Nombre visible |
|---|---|---|
| Usuario principal | `charlie` | Pendiente de confirmar |
| Padre | `padre` | Pendiente de confirmar |
| Hermano | `hermano` | Pendiente de confirmar |

Los nombres son propuestas, no cuentas creadas. La función actual acepta usuarios en minúsculas con letras ASCII, números y guion bajo, de 3 a 30 caracteres. Confirmar disponibilidad antes del alta.

## Cómo se dará de alta cada cuenta

1. Un administrador autorizado crea el usuario en **Supabase Dashboard → Authentication → Users**, con el correo individual real de esa persona. No activar registro público para resolver este proceso.
2. Asignar una contraseña temporal fuerte por un canal privado. Cada persona deberá cambiarla mediante un flujo de recuperación/cambio de contraseña probado antes de usar la app con datos reales. No compartir contraseñas entre familiares ni enviarlas por chat.
3. Obtener el UUID del usuario creado desde Authentication. No inventarlo ni usar los UUID de las cuentas de prueba antiguas.
4. Crear el perfil asociado a ese UUID con el nombre de usuario, el nombre visible, el correo exacto y `is_active = true`. El rol de perfil no sustituye a la membresía del taller. Verificar primero el esquema y cualquier política/trigger vigente; no pegar una plantilla SQL sin comprobar los valores reales.
5. Probar que la Edge Function `login-with-username` permite iniciar sesión con el nombre de usuario y contraseña correctos, y rechaza un usuario inexistente, inactivo o una contraseña incorrecta.
6. Repetir por separado para cada familiar. No crear todavía membresías hasta que se haya preparado el taller y la política de permisos.

## Dependencia técnica importante

La función existente `login-with-username` busca el campo `profiles.username`, requiere `profiles.email_snapshot` y `profiles.is_active = true`, y después autentica con el correo y la contraseña en Supabase Auth. Por tanto, crear solo el usuario en Authentication no basta: también hace falta un perfil coherente.

La tabla `profiles` usa un campo `role` de tipo enum con valores actuales `admin`, `admin_backup`, `technician` y `customer`. No asignar `admin` por comodidad ni asumir que ese rol da acceso al taller compartido. La autorización de sincronización debe depender de una membresía activa en `nexum_memberships` y de las políticas del servidor.

## Antes de crear usuarios reales

- [ ] Revisar la configuración de Auth y confirmar que el alta pública no está habilitada. No asumir que está deshabilitada sin comprobarlo en el Dashboard.
- [ ] Definir correos individuales válidos para las tres personas.
- [ ] Confirmar los tres nombres de usuario y nombres visibles.
- [ ] Preparar un procedimiento seguro para contraseña temporal y cambio/recuperación.
- [ ] Verificar la creación del perfil y probar el login con una cuenta piloto antes de crear las otras dos.
- [ ] Revisar los avisos de seguridad de Supabase antes de uso operativo.

## Después de crear las cuentas (todavía sin sincronizar datos)

1. Crear el único taller compartido `NEXUM Taller` cuando se autorice expresamente.
2. Asociar las tres cuentas a ese taller como miembros activos con los mismos permisos operativos.
3. Registrar el dispositivo tras una sesión válida y una membresía comprobada.
4. Probar acceso y cierre de sesión en cada dispositivo con datos de prueba.
5. Hacer y verificar exportaciones de datos generales y fotos del dispositivo que se elija como fuente inicial.
6. Pedir confirmación explícita sobre cuál dispositivo será la fuente de verdad.
7. Solo después diseñar y ejecutar una importación inicial controlada. No encolar automáticamente el histórico por el mero hecho de iniciar sesión.

## No hacer

- No crear las cuentas todavía sin autorización y datos de contacto reales.
- No usar las cuentas antiguas de prueba como miembros reales.
- No guardar contraseñas en archivos, código, tickets ni conversaciones.
- No insertar membresías directamente desde el navegador.
- No crear taller/dispositivos ni subir registros automáticamente al iniciar sesión.
- No declarar «Al día» hasta confirmar envío y recepción reales del servidor.

## Contraseña temporal y cambio obligatorio (backend desplegado; pruebas integrales pendientes)

Contraseña temporal inicial propuesta: `Cambiar*123`.

**Esta contraseña no se debe reutilizar como contraseña permanente ni publicar en documentación de producción.** Como es idéntica para varias cuentas, solo se usará durante el alta controlada y se comunicará individualmente por un canal privado. Antes de abrir la aplicación a datos reales, cada persona debe cambiarla.

### Requisitos de implementación

1. La cuenta se crea desde un procedimiento administrativo controlado, nunca desde el formulario público de la aplicación.
2. El administrador establece `profiles.force_password_change = true` al preparar cada cuenta temporal. La columna queda protegida contra cambios por el usuario autenticado.
3. `login-with-username` autentica las credenciales, consulta la marca en el servidor y no entrega tokens de sesión si el cambio está pendiente.
4. `change-initial-password` vuelve a verificar la contraseña actual, comprueba la marca, exige una contraseña nueva de al menos 8 caracteres y la cambia con la API administrativa; después limpia la marca. No devuelve una sesión funcional: requiere iniciar sesión otra vez.
5. La interfaz de desarrollo muestra el formulario obligatorio cuando recibe la respuesta específica del login.
6. Antes de producción, auditar todas las políticas RLS y funciones `SECURITY DEFINER` para confirmar que no existe una vía de acceso a datos mientras la marca esté activa; las cuentas reales siguen sin crearse hasta superar pruebas integrales. Nunca registrar contraseñas en logs.
7. La función pública de login debe devolver un estado explícito de “cambio obligatorio” sin permitir que la aplicación trate esa sesión como una sesión normal.

### Estado de seguridad actual

El backend ya incorpora la columna `profiles.force_password_change`, protegida frente a cambios realizados por el propio usuario; `login-with-username` versión 3 no entrega tokens cuando la marca está activa y responde con un estado específico para exigir el cambio. La Edge Function `change-initial-password` versión 2 verifica las credenciales temporales, exige una nueva contraseña de al menos 8 caracteres, la cambia mediante la API administrativa y limpia la marca. La interfaz de desarrollo muestra el formulario de cambio obligatorio, con mínimo de 8 caracteres. La obligación se controla mediante `force_password_change`: tras un cambio exitoso se pone en `false`, por lo que no se vuelve a pedir en inicios de sesión posteriores; solo se exige de nuevo si un administrador vuelve a activar la marca. **No se han creado cuentas ni se han probado credenciales reales; aún falta una prueba integral controlada y revisión de seguridad antes de usarlo en producción.**

### Pruebas de aceptación necesarias

- [ ] Login con contraseña temporal activa el estado de cambio obligatorio.
- [ ] No se puede consultar ni modificar datos del taller mientras el cambio está pendiente, incluso llamando directamente a RPC/API.
- [ ] Contraseña nueva incorrecta o no confirmada no elimina la marca.
- [ ] Un cambio correcto actualiza la contraseña y elimina la marca de forma segura.
- [ ] La contraseña temporal deja de funcionar y el login con la nueva contraseña funciona.
- [ ] Sesión revocada, token inválido y cuenta inactiva fallan de forma segura.
- [ ] No se filtran tokens ni contraseñas en mensajes, logs ni almacenamiento persistente innecesario.
- [ ] Repetir las pruebas para cada uno de los tres tipos de cuenta antes de dar de alta usuarios reales.


## Ajuste solicitado — 2026-10-10
- La contraseña personal nueva tiene mínimo de 8 caracteres (máximo 128), tanto en interfaz como en backend.
- El cambio obligatorio es de un solo uso: al completar el cambio, `force_password_change` pasa a `false`. Los siguientes inicios de sesión usan el flujo normal y no piden cambiarla otra vez, salvo que un administrador reactive la marca.
- La función `change-initial-password` está desplegada en versión 2. No se han creado cuentas reales ni se ha ejecutado una prueba integral con credenciales.
