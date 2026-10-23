## V6.0-dev-v62 — consulta fiable del username
- La cabecera solicita el campo `username` al servidor mediante una acción autenticada de `login-with-username`, validando el token y consultando `public.profiles` por el ID del usuario autenticado.
- Corrige el respaldo que podía mostrar el correo completo en vez del username real. La acción devuelve únicamente el username de la propia cuenta.
- Sin cambios en credenciales, membresías, permisos ni datos del taller.
- Alineados versión de aplicación, título, referencia de estilos, caché PWA, version.txt y changelogs.
- Verificación estática: comprobar sintaxis y respuesta de la función; confirmar visualmente en navegador después de recargar.

## V6.0-dev-v61 — nombre de usuario desde el perfil autenticado
- La etiqueta de usuario de la cabecera consulta `username` directamente en `public.profiles` usando el ID de la sesión autenticada; la política RLS limita la lectura al perfil propio.
- Se deja de priorizar `user_metadata` para evitar que un valor antiguo como «Ejemplo» reemplace el nombre de usuario real.
- El texto de estado de sesión usa el username del perfil cuando está disponible; si falla la consulta, mantiene un respaldo de la sesión sin modificar datos de la cuenta.
- Se alinean APP_VERSION, título, referencia de estilos, version.txt y caché PWA en v61. Sin cambios en membresías, permisos, datos ni lógica de sincronización.
- Verificación estática: pendiente comprobar en navegador con las cuentas admin y charliecs.

## V6.0-dev-v60 — indicadores de actividad en operaciones lentas
- Los botones de acciones administrativas asíncronas muestran un indicador giratorio y texto «Procesando…» mientras esperan respuesta; quedan temporalmente deshabilitados para evitar dobles pulsaciones.
- Se añade estado de carga a la comprobación de permisos, creación de talleres/usuarios, gestión de membresías y permisos administrativos.
- El botón de sincronización muestra «Sincronizando…» hasta finalizar, incluyendo errores; conserva el mensaje de resultado existente.
- La animación respeta la preferencia del sistema de movimiento reducido y se retira al terminar la operación.
- Se alinean APP_VERSION, etiqueta visible, título, referencia de estilos, version.txt y caché PWA en v60.
- Verificación estática del código; pendiente probar las operaciones en navegador real y confirmar respuestas de éxito/error.

## V6.0-dev-v59 — selector de taller por dispositivo y entornos separados
- Se añade a Configuración un selector para usuarios con varias membresías activas, con confirmación antes de cambiar el taller utilizado en este dispositivo.
- El selector solo ofrece los talleres que el backend devuelve como membresías activas; el cambio actualiza el contexto local y conserva por separado tickets, movimientos, equipos, fotos y colas de sincronización de cada taller.
- Se bloquea el cambio mientras hay una sincronización en curso. Los administradores globales conservan el flujo «Usar en este dispositivo» de la consola administrativa.
- El botón de selección se habilita al escoger una opción diferente de la actualmente activa, sin necesidad de recargar la pantalla.
- Se alinean APP_VERSION, etiqueta visible, título, referencia de estilos, version.txt y caché PWA en v59.
- En Supabase, NEXUM ONE (entorno de pruebas anterior) pasa a NEXUM ZERO; se crea un NEXUM ONE limpio para el uso real; NEXUM TWO (Coming Soon) queda inactivo para evitar que se use antes de su lanzamiento.
- Verificación estática del código y revisión de la configuración de talleres; pendiente prueba funcional en navegador con un usuario que tenga dos membresías activas.

## V6.0-dev-v58 — auditoría reciente plegable
- La sección de auditoría queda dentro de un desplegable cerrado por defecto, reduciendo el espacio ocupado por la consola administrativa.
- El contenido de auditoría solo aparece dentro de la consola que el servidor muestra tras confirmar permisos de administrador global; se conserva la carga y visualización de los eventos.
- Sin cambios en permisos, datos ni lógica de auditoría.

## V6.0-dev-v57 — recuperación de contraseña con destino explícito
- La solicitud de recuperación redirige a la aplicación con `?reset_password=1`.
- El cliente reconoce el token de recuperación desde el fragmento o la consulta y solo abre el formulario si hay token y contexto de recuperación.
- Se conserva la validación de contraseña y el cambio mediante el endpoint Auth de Supabase.

## V6.0-dev-v56 — limpieza segura de avisos de revisión ya resueltos
- Se corrige la bandeja de revisión para retirar avisos antiguos cuando no quedan operaciones locales pendientes y el registro local confirma una versión remota igual o más reciente que la del aviso.
- Los avisos con operaciones pendientes, versión desconocida o datos no confirmados se mantienen para revisión; no se eliminan ni modifican tickets por suposición.
- Sin cambios en el formato de datos, en las decisiones de conflicto ni en la interfaz estética. Pendiente prueba real en dos dispositivos.

## V6.0-dev-v55 — separación sutil en la cabecera
- Se añade una pequeña separación vertical entre la fila del usuario/cierre de sesión y los botones de sincronización/instalación.
- Se conserva la barra compacta; el ajuste es de pocos píxeles y no cambia el tamaño de los botones ni su funcionamiento.
- Sin cambios en autenticación, sincronización ni datos. Pendiente confirmación visual en la PWA.

## V6.0-dev-v54 — cabecera compacta redistribuida
- La barra conserva su altura discreta; no se aumenta el espacio vertical global.
- La marca ocupa el espacio flexible del lado izquierdo y mantiene «Gestión del Taller» con la versión debajo del logo.
- El usuario/estado de sesión y cierre de sesión quedan arriba a la derecha; sincronización e instalación se apilan debajo.
- Se conservan IDs y funciones de los botones; sin cambios en autenticación, sincronización ni datos. Pendiente prueba visual en PWA.

## V6.0-dev-v53 — escala de cabecera ajustada
- Aumenta ligeramente el logo, el texto de marca y el nombre de usuario; se conservan las dimensiones de todos los botones.
- Ajustes específicos para móvil mantienen límites de ancho para reducir riesgo de desbordamiento.
- Sin cambios funcionales, de datos locales/remotos ni de esquema Supabase. Pendiente validación visual en navegador/PWA.

## V6.0-dev-v52 — texto completo bajo el logo
- Se corrige el bloque de marca para mostrar «Gestión del Taller» en la primera línea y «V6-dev52» debajo, manteniendo la posición aprobada por el usuario.
- Se actualizan la versión interna, la etiqueta/título, version.txt, referencia de estilos y caché del service worker.
- Sin cambios en lógica funcional, autenticación, sincronización, datos locales ni esquema Supabase. Pendiente prueba visual en navegador/PWA.

## V6.0-dev-v51 — versión bajo el logotipo
- La etiqueta visible `V6.0-dev-v51` pasa debajo del logo y se alinea a la izquierda en tamaño discreto.
- Se conservan los controles de identidad de usuario y cierre de sesión en la cabecera, y sincronizar/instalar en la fila inferior.
- No se modifica lógica funcional, almacenamiento ni esquema Supabase. Pendiente comprobación visual en navegador/PWA.

## V6.0-dev-v50 — herramientas debajo de la cabecera
- Sincronizar e instalar pasan a una fila inferior compacta para evitar que compriman la identidad de usuario y el botón de cerrar sesión.
- Se mantienen los IDs y los controladores existentes: el botón de sincronización sigue abriendo el mismo panel y «Sincronizar ahora» conserva su acción.
- El evento beforeinstallprompt ya no reemplaza el SVG por texto; actualiza el título accesible del botón.
- Sin cambios en registros ni en esquema Supabase. Pendiente validación visual y funcional en navegador/PWA.

## V6.0-dev-v49 — cabecera compacta y estados por color
- Se reduce el texto de la barra superior y se usan iconos SVG para cerrar sesión, abrir opciones de sincronización e instalar la PWA.
- El usuario permanece visible con un indicador verde para sesión activa, gris sin conexión y rojo para problema de sesión; la etiqueta tiene descripción accesible.
- La sincronización usa gris neutral, verde al completar, rojo ante conflictos y naranja ante errores. El texto explicativo permanece dentro del panel de estado.
- Sin cambios en registros locales/remotos ni en el esquema de Supabase. Pendiente prueba visual y de estados en navegador/PWA.

## V6.0-dev-v48 — identidad mínima en cabecera
- La barra superior muestra el nombre de usuario disponible en la sesión y un indicador Online/Offline basado en `navigator.onLine`.
- El identificador introducido se conserva en la sesión local y durante la renovación del token; se prefiere el nombre de usuario de los metadatos si existe.
- La conectividad de red no se presenta como garantía de sincronización remota.
- No se han alterado datos del taller ni el esquema de Supabase; pendiente prueba visual en navegador/PWA.

## V6.0-dev-v47 — renovación proactiva y continuidad offline
- Se expone la renovación de sesión al resto de la app y se comprueba cada 60 s cuando está visible; renueva al recuperar conectividad y al volver a sincronizar.
- La ausencia de conexión no provoca cierre de sesión ni eliminación de credenciales guardadas; el uso local sigue disponible. El login inicial y la sincronización remota sí requieren conexión.
- El control «Mantener sesión iniciada en este dispositivo» conserva su comportamiento: localStorage cuando se marca y sessionStorage cuando no.
- Versionado sincronizado en app.js, index.html, sw.js, version.txt y changelogs. Validación estática de sintaxis; pendiente prueba real prolongada en navegador/PWA.

## V6.0-dev-v46 — recarga tras autenticación
- El formulario de login recarga la página una vez guardada la sesión válida para reconstruir el estado de la aplicación y sus permisos.
- La recarga solo ocurre tras un login correcto, no durante renovaciones silenciosas de sesión.
- No se modifican datos locales ni remotos.

## V6.0-dev-v45 — asignación del taller desde la cuenta
- La pantalla de vinculación ya no solicita UUID ni permite que un usuario normal cambie de taller.
- La aplicación consulta `nexum_get_my_workshops()` con la sesión autenticada y usa la membresía activa como fuente de verdad.
- Las cuentas normales con una membresía activa se vinculan automáticamente; los administradores globales conservan el selector «Usar en este dispositivo».
- La RPC se aplicó al proyecto Supabase NEXUM-app. La membresía de charliecs fue verificada en NEXUM TWO(test).
- No se importan ni eliminan datos locales históricos. Validación E2E pendiente.

# Registro de desarrollo — NEXUM Taller 6.0

## Iteración de sincronización local 0.2 (2026-10-10)
- Se amplía `sync-core.js` con validación de tipos/acciones y creación de operaciones con identidad estable.
- Se asegura que una operación en envío no se modifique por ediciones posteriores.
- La coalescencia solo agrupa operaciones pendientes de la misma entidad y acción; no mezcla borrado con recreación y conserva la versión base original.
- La comparación de campos ignora el orden de las claves de objetos JSON para evitar conflictos falsos.
- Se agregan pruebas para reintento, confirmación, metadatos estables, validación y borrado/recreación.
- No se modifica el comportamiento de V5.6.29-beta, no se contacta Supabase, no se crean cuentas/talleres y no se suben registros.

## Limitación conocida
Esta iteración no es una versión 6.0 integrada ni lista para instalar. La app aún no consume el módulo; la persistencia de outbox, autenticación, sincronización real y conflictos de UI siguen pendientes.

### Sincronización: robustez de cola y estado visible
- Corregida la consolidación de cola: solo se consolida con la última operación pendiente de la misma entidad, evitando reordenar secuencias como guardar → borrar → recrear.
- Añadidas pruebas para preservar el orden de operaciones mixtas.
- Documentados los estados de conexión/sincronización que tendrá la interfaz: solo local, al día, pendientes, sincronizando, sin conexión, conflicto y error. El estado “Al día” exige confirmación real del servidor.

## Iteración de interfaz 0.3 — indicador de estado (2026-10-10)
- Se incorpora al encabezado un indicador persistente «Solo en este dispositivo» y un panel de detalles desplegable.
- El panel diferencia la conectividad del dispositivo de la sincronización real: declara explícitamente que no hay sesión/taller conectado y que no se envían datos a un servidor.
- El indicador escucha los eventos online/offline y actualiza solo el estado de conectividad; nunca muestra «Al día» por el mero hecho de estar conectado.
- El panel es accesible mediante botón con `aria-expanded`, `aria-controls` y región de estado.
- La interfaz no inicia sesión, no crea talleres y no transmite información.

## Verificación de esta iteración
- `node --check app.js`: correcto.
- `node --check sync-core.js`: correcto.
- `node tests/sync-core.test.js`: `sync-core tests: OK`.
- Pendiente: prueba visual en navegador/PWA y posterior integración con autenticación y sincronización real.

## Iteración de autenticación 0.4 — acceso de cuenta (2026-10-10)
- Se añade a Configuración un formulario de inicio/cierre de sesión mediante la Edge Function existente `login-with-username`.
- La sesión se guarda localmente en este dispositivo; la contraseña no se persiste.
- El estado de cabecera distingue una sesión autenticada de la ausencia de sesión, pero conserva explícitamente «taller pendiente» y no afirma sincronización.
- Iniciar sesión no crea talleres/membresías, no registra dispositivos, no consulta ni transmite tickets y no altera los datos locales.
- Se actualiza el rótulo de desarrollo y la caché PWA a `6.0-dev` para evitar mostrar V5.6.26-beta en esta copia experimental.
- Limitación: renovación automática de sesión, selección/vinculación de taller, registro de dispositivo y RPC de sincronización aún no están implementados. La sesión puede caducar; no se debe tratar esta iteración como lista para uso operativo.

## Iteración de sesión 0.5 — renovación y cierre (2026-10-10)
- Añade renovación de sesión mediante el endpoint oficial de Supabase usando el refresh token; se ejecuta al iniciar y al volver a la aplicación cuando el token está próximo a caducar.
- Si la renovación falla por conectividad, conserva la sesión local y muestra un aviso sin borrar datos. Si el servidor rechaza la renovación con HTTP 400/401, limpia la sesión y pide volver a iniciar sesión.
- Cerrar sesión limpia inmediatamente la sesión local y solicita revocación remota cuando hay conexión; el cierre local no depende de la red.
- La clave cliente es una clave pública `anon`; no se incluye una clave `service_role`.
- No se crean talleres ni dispositivos y no se accede a tickets/movimientos durante autenticación.
- Limitación: aún no se implementa almacenamiento seguro nativo del refresh token, selección de taller, registro de dispositivo ni sincronización de registros. El almacenamiento local del token en una PWA es una etapa de desarrollo y requiere revisión de seguridad antes del uso operativo.

## Procedimiento de alta controlada — 0.6 (2026-10-10)
- Se añade `ALTA_CONTROLADA_CUENTAS_V6.md` con el flujo de creación manual, individual y sin registro público desde la app.
- Documenta la dependencia de `profiles.username`, `email_snapshot` e `is_active` que requiere la función de inicio de sesión existente.
- Propone `charlie`, `padre` y `hermano` como nombres pendientes de confirmación; no crea esas cuentas.
- Separa autenticación, perfil, membresía de taller y registro de dispositivo. No se suben registros ni se crean talleres.
- No se modifica el esquema ni los datos de Supabase en esta iteración.

## 2026-10-10 — Alta controlada con contraseña temporal
- Documentada la decisión de usar `Cambiar*123` como contraseña temporal inicial, con cambio obligatorio antes de usar la aplicación.
- Especificada la marca administrativa en `app_metadata` (no `user_metadata`) y el bloqueo de datos en el servidor, incluidas RLS y funciones RPC.
- Añadidas pruebas de aceptación y aclarado que el login desplegado todavía no implementa el bloqueo. No se han creado usuarios ni cambiado datos de Supabase.


## 2026-10-10 — Contraseña temporal / primer acceso
- Añadida la marca administrativa `profiles.force_password_change`, protegida por trigger frente a cambios del usuario.
- `login-with-username` v3 bloquea la entrega de tokens cuando la contraseña temporal debe cambiarse.
- Nueva Edge Function `change-initial-password` v1 verifica credenciales, cambia la contraseña mediante API administrativa y limpia la marca.
- UI de desarrollo muestra formulario de cambio obligatorio; el mínimo se ajustó a 8 caracteres en la revisión posterior.
- Pendiente: pruebas integrales con cuenta de prueba autorizada, auditoría completa de RLS/RPC y validación en navegador. No se crearon usuarios ni membresías.


## 2026-10-10 — Ajuste de primer cambio de contraseña
- Mínimo de contraseña personal reducido de 12 a 8 caracteres en la interfaz y Edge Function `change-initial-password` v2.
- El indicador `force_password_change` se desactiva tras el cambio correcto; no vuelve a solicitar el cambio en cada inicio de sesión.
- Pendiente: prueba integral controlada y revisión de seguridad antes de usar cuentas reales.

## 2026-10-10 — Bloqueo de acceso en servidor durante primer cambio
- Se revisó `public.nexum_is_member(uuid)`, usada como control común por funciones protegidas del sistema de sincronización.
- Se actualizó la función para exigir membresía activa, perfil activo y `force_password_change=false`.
- Esto añade una defensa del lado servidor: el bloqueo no depende únicamente de que la PWA oculte las pantallas; las operaciones que validen esta función deben rechazar al usuario con cambio pendiente, incluso si obtiene una sesión directamente desde Supabase Auth.
- Se guardó `MIGRACION_BLOQUEO_PRIMER_ACCESO.sql` como registro reproducible de la migración aplicada.
- Verificación posterior de esquema: la función quedó desplegada y la consulta de perfiles devolvió 2 perfiles, 0 con cambio inicial pendiente. No se crearon cuentas, talleres, membresías, dispositivos ni registros de sincronización.
- Limitación: esta comprobación de esquema no equivale a una prueba funcional con JWT real. Antes de crear las cuentas definitivas falta comprobar el rechazo efectivo de las RPC/RLS con una cuenta de prueba controlada y revisar los accesos directos a tablas.

## Iteración 0.7 — revisión de sesión y accesos (2026-10-10)
- Añadido `REVISION_SEGURIDAD_V6.md` con el alcance de las políticas revisadas, límites actuales de almacenamiento de tokens, riesgo de renovación concurrente entre pestañas y lista de pruebas previas al alta.
- No se ha cambiado la lógica de autenticación ni se han creado/modificado cuentas: se evita introducir cambios de sesión sin una prueba funcional real.
- Se incrementa la etiqueta de desarrollo a `6.0-dev-v6` para identificar el paquete con la revisión documentada.
- Pendiente: JWT real, CORS desde navegador, trigger de campos protegidos, renovación entre pestañas y auditoría integral de tablas/Storage/RPC.


## V7 — renovación de sesión entre pestañas
- Se añadió coordinación de renovación mediante Web Locks en navegadores compatibles.
- Se relee el estado de sesión dentro del bloqueo y se evita que una respuesta atrasada borre o sobrescriba una sesión más reciente.
- Se añadió escucha de cambios en `localStorage` para reflejar cierre de sesión/renovación en otras pestañas.
- Se incrementaron `APP_VERSION`, `version.txt`, etiqueta visible y caché de service worker a `6.0-dev-v7`.
- Pruebas realizadas: `node --check app.js`, suite `sync-core.test.js` e integridad del ZIP. No se ha realizado prueba de navegador real ni autenticación con credenciales reales.


## 6.0-dev-v8 — Identidad de equipo y preparación de cola local
- Se renombró el campo de datos `id` a `equipoId`; `normalize()` migra automáticamente el nombre antiguo al cargar y elimina la propiedad ambigua. El ID visible del equipo permanece estable entre ingresos.
- Cada ticket y movimiento económico recibe `syncId` UUID estable, `remoteVersion` (solo versión remota confirmada) y `syncStatus`. La migración local no crea operaciones de sincronización para el histórico.
- Los nuevos Ticket ID y ECN ID incluyen componente aleatorio para reducir colisiones entre dispositivos; se preservan los IDs históricos. La identidad técnica definitiva es `syncId`.
- Se carga `sync-core.js` en la aplicación y se persisten en `nexum_sync_outbox_v1` las operaciones locales de alta de tickets y alta/edición de movimientos. No hay envío automático ni carga a Supabase en esta versión.
- Se amplió el núcleo para reconocer `equipment` y `customer` como tipos de entidad futuros. El formulario y los registros siguen manteniendo los datos del equipo en el ticket; la separación completa de la entidad Equipo y su migración relacional queda pendiente antes de activar sincronización remota.
- No se crearon cuentas, talleres, dispositivos ni datos remotos.

## Iteración de modelo local 0.4 — entidad Equipo separada (2026-10-10)
- Se añade el catálogo local `nexum_equipment_v1`, con una fila por `equipoId` visible y un `syncId` técnico estable independiente.
- La migración deriva el catálogo del histórico de tickets existentes sin encolar ni transmitir esos registros.
- Se normaliza `equipoSyncId` de los tickets históricos para que los ingresos del mismo `equipoId` apunten a la misma identidad técnica del equipo.
- Los nuevos ingresos reutilizan la identidad técnica del equipo existente cuando coincide el `equipoId`; cada ticket mantiene su propio `syncId` y `ticketId`.
- Al crear un ticket se preparan operaciones locales para `equipment` y `ticket`; no se envían al servidor.
- El modelo remoto actual todavía no admite `equipment` en su restricción de `entity_type`; la sincronización sigue desactivada hasta preparar y revisar una migración de esquema y las RPC.
- No se crean cuentas/talleres/membresías/dispositivos y no se suben datos.


## 6.0-dev-v10 — primer ciclo de sincronización manual
- Se añade una pantalla de vinculación que exige el UUID de un taller asignado por administración; no crea talleres ni carga históricos.
- Se añade acción manual de sincronización: registro autenticado del dispositivo, envío idempotente de operaciones pendientes mediante `nexum_apply_sync_operation` y descarga paginada por cursor mediante `nexum_pull_sync_changes`.
- Los errores de red devuelven operaciones a pendientes; los conflictos se conservan para revisión. Los cambios entrantes se guardan en una bandeja local y no sobrescriben automáticamente tickets ni formularios.
- Se añade `MIGRACION_SINCRONIZACION_MANUAL_V10.sql` para registrar dispositivos mediante RPC, sin permiso de inserción directa desde el cliente. Debe aplicarse y verificarse antes de usar el botón.
- La sincronización sigue bloqueada hasta que exista una membresía activa, el administrador proporcione el UUID del taller y la migración RPC esté desplegada. No se ha importado el histórico ni se han creado cuentas/datos ficticios.

## 6.0-dev-v11 — preparación de administración global (2026-10-20)
- Añade `supabase/functions/nexum-global-admin/index.ts` como primer contrato de backend para resumen, listado, creación y estado de talleres, usuarios, membresías y consulta de auditoría.
- La autorización global se separa de `profiles.role`: exige JWT válido, perfil activo, `force_password_change=false` y fila activa en `nexum_global_admins`.
- La función no ofrece endpoint para otorgar privilegios globales. La primera asignación queda como procedimiento manual controlado tras validar el backend.
- Las altas de usuario requieren correo, nombre de usuario y contraseña temporal de al menos 12 caracteres; crean el perfil con `force_password_change=true`, no devuelven ni registran la contraseña y eliminan el usuario Auth si falla la inserción del perfil.
- Añade `MIGRACION_FUNDACION_ADMIN_GLOBAL_20261013.sql` como referencia reproducible de la fundación ya aplicada, `MIGRACION_ADMIN_GLOBAL_V1.sql` para añadir `nexum_workshops.is_active`, `ADMIN_GLOBAL_V1_DESIGN.md` y prueba estática del contrato administrativo.
- Añade una consola inicial en Configuración para crear talleres/usuarios, activar o desactivar usuarios y talleres, listar/administrar membresías, otorgar/revocar administradores globales y consultar auditoría. El panel permanece oculto hasta que el endpoint confirme los permisos globales.
- Tras reanudar, Supabase volvió a `ACTIVE_HEALTHY`; se confirmó el esquema base y 2 usuarios Auth/perfiles, sin talleres ni membresías. Se aplicó y verificó la migración `admin_global_workshop_status_v1`, que añade `nexum_workshops.is_active` con valor predeterminado true y actualiza `nexum_is_member` para bloquear talleres inactivos. La Edge Function no se ha desplegado y no se han creado talleres ni administradores globales.
- Limitaciones documentadas: falta UI, pruebas con JWT real y consolidar mutaciones/auditoría en transacciones cuando corresponda.


## 2026-10-20 — Administración global v11: revisión y despliegue
- Revisión final del handler `nexum-global-admin`; desplegado como versión 1 en el proyecto Supabase `ywcrowviufbioeqixwrq`, con `verify_jwt=true`.
- La función exige JWT, valida la sesión con Supabase Auth y requiere perfil activo, primer cambio de contraseña completado y fila activa en `nexum_global_admins`. La clave `service_role` solo se lee desde secretos de entorno.
- Añadida protección contra desactivar al último administrador global utilizable, tanto al cambiar el estado global-admin como al desactivar su perfil.
- Contrato estático y pruebas locales de sincronización pasan. No se crearon ni promovieron usuarios, talleres, membresías ni registros. Las dos cuentas Auth/perfiles de pruebas existentes se conservaron.
- Estado real confirmado tras el despliegue: 2 usuarios Auth, 2 perfiles, 0 talleres, 0 membresías y 0 administradores globales.
- Pendiente: alta inicial controlada del administrador global y pruebas integrales con JWT real (incluidos rechazos y auditoría). La función está activa, pero el panel aún no puede utilizarse hasta ese alta.


## 6.0-dev-v12 — integración de cola y revisión de sincronización (2026-10-20)
- Aplicada en Supabase la migración `add_sync_device_registration_rpc_v1`; `nexum_register_sync_device(uuid,uuid,text)` ya existe como `SECURITY DEFINER`, con `EXECUTE` para `authenticated` y sin ejecución para `anon`. La función comprueba sesión y membresía mediante `nexum_is_member`, y no concede escritura directa en la tabla de dispositivos.
- La cola local ahora detecta altas y ediciones de tickets, equipos y movimientos en el guardado común, sin encolar el histórico durante el arranque. Los metadatos de versión/estado no generan operaciones falsas.
- Se evita continuar enviando otras operaciones de una entidad tras un conflicto. Tras una operación aceptada, las operaciones pendientes posteriores de la misma entidad se rebasan a la nueva versión confirmada.
- Se registran borrados de tickets y movimientos como tombstones cuando ya hay versión remota o una operación local previa pendiente; no se generan borrados remotos por el restablecimiento general local.
- La bandeja de entrada ahora permite aplicar cambios remotos compatibles individualmente o archivar el aviso; los cambios con operaciones locales pendientes se bloquean hasta resolver conflicto. Se añade resolución explícita de conflicto: conservar remoto o reintentar local sobre la versión remota actual.
- `markLocalSync` actualiza tanto `localStorage` como los objetos en memoria para evitar que el siguiente guardado revierta la versión remota confirmada.
- Se añadió `MIGRACION_REGISTRO_DISPOSITIVO_SYNC_V11.sql` como registro local de la migración aplicada y se actualizó el service worker a caché `nexum-v6.0-dev-12`.
- Pruebas locales: `node --check app.js`, `node --check sync-core.js`, `node tests/sync-core.test.js` y `node tests/admin-global-contract.test.cjs`.
- Limitación importante: no se ha ejecutado sincronización E2E con sesión, taller y membresía reales porque el proyecto sigue sin talleres, membresías ni administrador global. No se han subido registros ni se han creado datos de prueba remotos. Las fotos siguen almacenadas localmente y no se sincronizan.

## 6.0-dev-v14 — vinculación administrativa del taller (2026-10-20)
- La creación de un taller desde `nexum-global-admin` activa también la membresía del administrador creador; si falla la membresía o la auditoría final, intenta revertir las filas creadas y devuelve un error explícito.
- La consola muestra el UUID de cada taller y permite vincular este dispositivo con un clic, conservando la etiqueta de dispositivo existente cuando la haya.
- El panel de sincronización escucha el evento de vinculación local para actualizarse sin recargar la página.
- Al iniciar, se persiste una referencia local normalizada antes del primer guardado para evitar que datos históricos legados se clasifiquen como altas nuevas; la cola ya existente se conserva.
- Antes de enviar operaciones pendientes, la sincronización muestra el número y una muestra de IDs y exige confirmación explícita, para evitar subidas inesperadas de datos antiguos.
- Se actualizan `APP_VERSION`, la etiqueta visible, `version.txt` y la caché del service worker a `6.0-dev-v14`.
- La cuenta global-admin activa y el taller NEXUM ONE con membresía del administrador se provisionaron en Supabase el 2026-10-20. El alta se anotó en `nexum_admin_audit_log`.
- Verificación local: pendiente de ejecutar tras aplicar estos cambios. La sincronización E2E entre dispositivos y la sincronización de fotos continúan pendientes.

## V6.0-dev-v14 — preparación PWA/offline (2026-10-20)
- Se completó el manifiesto PWA con identidad NEXUM, `start_url`/`scope`, iconos PNG de 192 y 512 px, icono maskable y apple-touch-icon.
- Se amplió el HTML con metadatos de instalación móvil e iconos.
- Se reforzó el service worker: cachea todos los recursos locales necesarios, reclama clientes tras activar y ofrece fallback a `index.html` para navegación sin conexión.
- La limpieza de caché ahora solo elimina cachés de versiones NEXUM, no las de otras aplicaciones del mismo origen.
- El botón Instalar dispone de ayuda manual si el navegador no emite `beforeinstallprompt`.
- Se sincronizaron `version.txt`, título/etiqueta, changelog y versión de caché.
- Límite conocido: el service worker requiere HTTPS o localhost; `file://index.html` no puede tener PWA/offline de la misma manera. Esta corrección no certifica todavía la sincronización cloud ni la conservación de datos entre orígenes.
