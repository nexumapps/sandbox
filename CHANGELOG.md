## V6.0-dev-v71 — distribución correcta de la ficha económica
- Columna izquierda: equipo, cliente, ganancia total y tasa CUP/USD.
- Columna derecha: inversión, incremento e impacto total del taller.
- El pie conserva estado y técnico apilados a la izquierda y amplía el botón «Examinar» a la derecha; las pegatinas quedan más compactas.
- Solo cambia la presentación; no se alteran cálculos, datos ni la acción de abrir el ticket.

## V6.0-dev-v70 — ficha económica con columnas independientes
- ID y fecha ocupan líneas completas al inicio de cada ficha.
- Equipo/cliente y datos económicos se organizan en dos contenedores internos independientes, evitando huecos artificiales entre columnas.
- Estado y técnico aparecen apilados en el pie izquierdo con estilo de etiqueta; el botón «Examinar» queda a la derecha y conserva la apertura de la ficha de edición.
- Sin cambios en cálculos, datos ni lógica de edición.

## V6.0-dev-v69 — ficha económica vertical y legible
- Se recupera una distribución vertical con ID como título y fecha como subtítulo.
- Los datos descriptivos y los importes quedan en columnas izquierda/derecha independientes.
- Estado y zona de acciones tienen espacios separados; el técnico ya no puede tapar las etiquetas de estado.
- Se recupera un tamaño de letra más legible, manteniendo una adaptación compacta para móvil.
- Sin cambios en cálculos, datos ni acciones de la ficha.

## V6.0-dev-v68 — ficha económica compacta y equilibrada
- La fecha aparece debajo del ID; equipo y cliente quedan en líneas separadas.
- Inversión, incremento del taller e impacto total se distribuyen en tres columnas independientes a lo ancho de la ficha.
- El técnico se muestra abreviado como «T: Nombre» junto a «Examinar y editar».
- Se ajustan tipografías y espacios para una ficha más compacta, especialmente en móvil; se mantienen cálculos y acciones existentes.

## V6.0-dev-v66 — ID de ticket a todo el ancho
- El `ticket_id` aparece como encabezado en la parte superior de cada ficha de Contabilidad y ocupa ambas columnas.
- Los IDs largos pueden partirse en varias líneas sin desbordar la tarjeta, también en móvil.
- Se conserva el contenido y la distribución de los datos restantes.

## V6.0-dev-v65 — técnico visible en Contabilidad
- La lista de Contabilidad muestra el técnico responsable de cada ticket, o «Sin asignar» si no hay técnico registrado.
- La ficha «Examinar y editar» de Economía también muestra el técnico sin modificarlo desde los controles económicos.
- Cambio limitado a la interfaz; no se modifica Supabase ni el cálculo económico.

## V6.0-dev-v64 — fechas comparables en el orden contable
- La captura confirmó que las fechas de tickets y movimientos ECN no quedaban en orden global al usar «Más antiguos».
- El comparador ahora normaliza fechas ISO (`AAAA-MM-DD`) y fechas con barras (`DD/MM/AAAA`) al mismo formato antes de ordenar tickets y movimientos en conjunto.
- Actualizada la versión visible y la caché del service worker para que el navegador descargue los recursos nuevos.

## V6.0-dev-v63 (ajuste de cabecera y caché PWA)
- Se actualiza la etiqueta de versión bajo el logo de `V6-dev60` a `V6-dev63`.
- Se incrementa la versión de caché del service worker a `nexum-v63` para facilitar la descarga de los recursos actualizados.

## V6.0-dev-v63 — orden unificado de Contabilidad
- Corrige el campo de fecha común para que los movimientos ECN utilicen `fecha` y los tickets sigan usando `fechaSalida` o `fechaEntrada`.
- Tickets y movimientos permanecen en una única lista y ahora todos los criterios de ordenamiento comparan ambos tipos; el orden por ID también reconoce el ID de los movimientos ECN.
- Se mantienen sin cambios los cálculos contables, los registros guardados y la sincronización.
- Actualizada la versión a v63.

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
- Se aumenta ligeramente el tamaño del logo y del texto «Gestión del Taller / V6-dev53».
- Se aumenta ligeramente la tipografía del nombre de usuario, con límites adaptados a móvil.
- Se conservan exactamente los tamaños de los botones de sincronización, instalación y cierre de sesión.
- Cambio visual solamente; sin cambios en autenticación, sincronización ni datos. Pendiente prueba visual en PWA.

## V6.0-dev-v52 — texto completo bajo el logo
- Se conserva la posición de la etiqueta bajo el logo y se restaura el texto en dos líneas: «Gestión del Taller» y «V6-dev52».
- La versión interna, el título de la página, la referencia de estilos y la caché PWA se alinean en v52.
- Cambio visual solamente; no se altera autenticación, sincronización ni datos. Pendiente comprobación visual en la PWA.

## V6.0-dev-v51 — versión debajo del logo
- Se coloca la etiqueta de versión en una línea discreta debajo del logotipo, alineada a la izquierda.
- Se mantiene la identidad del usuario, el indicador de sesión y el botón de cerrar sesión a la derecha; sincronización e instalación siguen en la fila inferior.
- Cambio visual solamente: no altera la autenticación, la sincronización ni los datos locales/remotos. Pendiente prueba visual en PWA.

## V6.0-dev-v50 — fila secundaria de herramientas
- Se mueve sincronización e instalación a una fila compacta debajo de la cabecera, reservando el espacio superior para logo/versión, usuario, estado y cierre de sesión.
- Se conserva el mismo botón de sincronización y el mismo panel desplegable con «Sincronizar ahora»; solo cambia su ubicación visual.
- El botón de instalación conserva su icono cuando el navegador ofrece el flujo de instalación.
- Sin cambios en datos, autenticación ni lógica de sincronización. Pendiente prueba visual en la PWA.

## V6.0-dev-v49 — cabecera compacta e indicadores de estado
- Se compacta la cabecera: logo y versión visibles a la izquierda; usuario con indicador de sesión/conectividad a la derecha.
- Cerrar sesión, sincronización e instalación pasan a controles con iconos, etiquetas accesibles y títulos descriptivos.
- El control de sincronización distingue estado normal (gris), finalización correcta (verde), conflicto (rojo) y error (naranja); el detalle textual permanece en el panel desplegable.
- No se modifican tickets, movimientos, datos económicos, credenciales guardadas ni registros de Supabase. Pendiente validación visual en navegador/PWA.

## V6.0-dev-v48 — usuario y conectividad en la barra superior
- Se muestra el nombre de usuario de la sesión autenticada junto a un indicador Online/Offline basado en la conectividad del navegador.
- El nombre se conserva al renovar el token y se actualiza al cambiar la sesión; el indicador reacciona a los eventos de conexión/desconexión.
- El estado de red se mantiene separado del estado de sincronización. No se modifican tickets, movimientos, membresías ni datos remotos.

## V6.0-dev-v47 — sesión persistente y renovación para uso offline
- La sesión autenticada se renueva automáticamente mientras la aplicación está abierta, antes de que venza el token de acceso; al volver a tener conexión también intenta renovarla.
- Si el dispositivo está sin conexión, no intenta renovar contra el servidor ni borra la sesión guardada: los datos locales y el trabajo offline permanecen disponibles. La sincronización remota sigue requiriendo Internet.
- Antes de sincronizar, intenta renovar la sesión y usa la sesión actualizada, reduciendo errores por JWT de una hora caducado.
- «Mantener sesión iniciada en este dispositivo» continúa guardando la sesión en almacenamiento persistente; sin marcarlo, la sesión sigue limitada a la pestaña/sesión del navegador.
- Alineados versión de PWA y caché estática. No se modifica ni elimina ningún registro local o remoto.

## V6.0-dev-v46 — recarga completa tras iniciar sesión
- Tras un inicio de sesión correcto, guarda primero la sesión y fuerza una recarga completa de la página para reconstruir menús, cola, permisos administrativos y estado de sincronización desde la sesión ya persistida.
- No fuerza la recarga en cada renovación del token ni al cerrar sesión.
- Se alinea la versión de la PWA y su caché. No se modifican datos del taller.

## V6.0-dev-v45 — asignación automática del taller por cuenta
- La pantalla de sincronización deja de pedir el UUID y el nombre del dispositivo; el UUID permanece interno y el usuario normal solo ve el nombre del taller asignado por el servidor.
- Se añade la RPC autenticada `nexum_get_my_workshops`, que devuelve únicamente las membresías activas de la cuenta autenticada y si tiene permiso de administración global.
- Al iniciar sesión, una cuenta normal se vincula automáticamente a su único taller activo; si no tiene una membresía válida, no queda habilitada la sincronización. Las cuentas con varias membresías no cambian arbitrariamente de taller.
- Se conserva para administradores globales el flujo existente «Usar en este dispositivo» y se guarda también el nombre visible del taller seleccionado.
- La membresía activa de `charliecs` fue verificada en el backend: NEXUM TWO(test). La asignación se obtendrá al iniciar sesión; no se cambian tickets ni movimientos remotos.
- Los datos locales antiguos sin taller asignado continúan preservados y separados. Pruebas de navegador y sincronización de extremo a extremo pendientes.

## V6.0-dev-v44
- Aísla tickets, equipos, movimientos, tasa/configuración económica, categorías, cola de salida, bandeja de entrada y cursor de sincronización por taller activo.
- Aísla la base IndexedDB de fotografías por taller, evitando que el cambio de taller muestre fotos de otro contexto.
- Al cambiar la vinculación o usar «Usar en este dispositivo», recarga los datos del taller seleccionado; se impide cambiar de taller mientras una sincronización está en curso.
- Los datos históricos que estaban en claves globales permanecen intactos y separados. No se asignan ni se envían automáticamente; la vinculación/importación explícita queda pendiente.
- Se alinean la versión visible, app.js, version.txt y la caché de la PWA. No se cambian datos remotos ni permisos del servidor.

## V6.0-dev-v43
- Consola administrativa: los mensajes de éxito y error de acciones como crear usuario, cambiar estados, revocar acceso global y gestionar membresías quedan junto a la acción que los originó.
- La actualización de las listas ya no sobrescribe el mensaje de «Comprobar acceso administrativo»; ese mensaje solo se actualiza cuando se comprueba el acceso.
- Se alinea la versión visible, `app.js`, `version.txt` y la caché de la PWA. No se modifican datos ni credenciales existentes.

## V6.0-dev-v42
- Alta de usuarios: la protección de campos de seguridad ahora permite cambios del backend confiable `service_role` (además de roles administrativos de base de datos), manteniendo bloqueados esos cambios para usuarios normales. Esto permite asignar el rol técnico y el estado inicial después de que el trigger crea el perfil.
- Se corrige la etiqueta de versión que seguía mostrando v37 en `index.html`; se alinean versión visible, `version.txt`, JavaScript y caché PWA.


## V6.0-dev-v41
- Alta de usuarios: respeta el trigger `on_auth_user_created`; el perfil inicial se crea con metadata y luego se actualiza a técnico, evitando el error `23505 profiles_pkey` por insertar el mismo perfil dos veces.
- Contraseñas: sustituye los símbolos poco claros por el ojo SVG clásico abierto/cerrado, dentro del campo de texto.
- Administración: mensajes de validación, alta y eliminación de usuario se muestran junto al formulario o acción que los genera.

## V6.0-dev-v40
- Panel administrativo: añade eliminación permanente de usuarios con confirmación explícita, protección contra autoeliminación y protección de cuentas con registro de administrador global.
- El backend retira membresías del usuario antes de eliminar la cuenta de autenticación; si falla la eliminación, intenta restaurar las membresías. Se conserva el registro de auditoría y no se toca el histórico de tickets/movimientos.
- Errores de eliminación aparecen junto a la acción que los provocó.
## V6.0-dev-v39 — errores junto a la acción y diagnóstico de alta
- Los errores de formularios administrativos se muestran dentro del formulario que los generó; los errores de botones de usuario/taller/membresía aparecen junto a la acción correspondiente.
- El alta de usuarios devuelve el código y mensaje de base de datos al fallar la creación del perfil, sin exponer contraseñas ni tokens.

## V6.0-dev-v38 — confirmación y visibilidad de contraseñas
- El alta de usuarios exige confirmar la contraseña temporal antes de enviar la solicitud; valida coincidencia y longitud de 8–128 caracteres.
- Se incorpora un control mostrar/ocultar en los campos de contraseña, incluidos los que aparecen dinámicamente (cambio inicial y recuperación).
- No se modifican las credenciales ya creadas ni los datos locales/históricos.

## V6.0-dev-v37 — contraseña temporal de 8 a 128 caracteres
- El formulario de creación de usuarios acepta contraseñas temporales de 8–128 caracteres.
- La función de administración de Supabase aplica el mismo rango, sin cambiar el requisito de cambiarla en el primer acceso.

## V6.0-dev-v36 — conservar el estado final
- «Sincronización finalizada/completada» se clasifica como éxito verde, siempre que no haya errores ni conflictos.
- La actualización del estado de sesión no reemplaza el resultado persistente de la última sincronización.

## V6.0-dev-v35 — estado persistente del indicador de sincronización
- El indicador superior conserva verde tras una sincronización completada sin conflictos ni revisión pendiente.
- Rojo solo para errores o conflictos/revisiones reales; amarillo para sincronización en curso o cambios pendientes.
- Evita que el texto «pendientes: 0» sea interpretado erróneamente como estado de error.

## V6.0-dev-v34 — indicadores visibles en el aviso emergente
- Se muestran etiquetas explícitas «✅ TODO CORRECTO» o «❌ ERROR / REVISIÓN» en el resumen emergente, además de los símbolos de estado.
- Se incrementa la clave de caché de la PWA para forzar que los dispositivos descarguen el archivo actualizado.

## V6.0-dev-v33 — resolución de conflictos en una sola acción
- «Conservar versión local» prepara una operación nueva con la versión remota actual como base y ejecuta la sincronización inmediatamente; no requiere un segundo reintento manual.
- Para colisiones de identificadores se reutiliza la resolución específica existente; si no puede hacerse con seguridad, se informa claramente y se conservan los datos locales.
- Los estados y errores de sincronización incorporan indicadores visuales: 🟢 para éxito y 🔴 para error, conflicto o revisión pendiente.
- Se conserva el histórico y las tasas individuales de tickets/ECN; no se borran datos locales.
- Se alinean app.js, index.html, version.txt y la caché de la PWA.

## V6.0-dev-v32 — confirmar y publicar la versión local elegida
- La resolución local crea una sola operación nueva con la versión remota revisada como base, retirando solo las operaciones conflictivas previas de la misma entidad.
- La acción espera la sincronización y muestra el resultado; no se limita a posponer el conflicto.
- Para la tasa compartida, publica el valor local vigente con la identidad canónica de la nube; no modifica tasas históricas de tickets ni ECN.

## V6.0-dev-v31 — publicar la versión local elegida
- «Conservar versión local» genera un identificador de operación nuevo para evitar la respuesta idempotente de la operación rechazada.
- Actualiza la base a la versión remota revisada y lanza la sincronización inmediatamente, también para la tasa compartida.
- Los registros históricos y sus tasas individuales no se reescriben.

## V6.0-dev-v30 — comparación antes de resolver conflictos
- La revisión de sincronización muestra los campos diferentes entre la copia local y la remota; para la tasa, muestra explícitamente ambos valores CUP/USD.
- Los cambios con operaciones locales pendientes ofrecen decisiones separadas: conservar la versión remota o conservar la local y reintentar con la versión remota como base.
- Se conservan los datos de otras entidades y las tasas históricas individuales; se añade presentación adaptable a móviles.

## V6.0-dev-v29 — respuestas inesperadas recuperables
- Una respuesta de sincronización no reconocida deja la operación afectada en conflicto/revisión, conserva el detalle y permite continuar con operaciones independientes.
- Se mantiene la cola local; no se confirma una operación que el servidor no haya aceptado.
- Se actualiza la versión visible y la caché de la PWA.

## V6.0-dev-v28 — resolución recuperable de colisiones de identificadores
- Supabase detecta `legacy_id` duplicados antes de escribir y devuelve un conflicto estructurado en lugar de abortar la sincronización.
- Los tickets y movimientos ECN distintos con el mismo ID visible conservan ambos registros; el entrante recibe un ID alternativo y sus operaciones pendientes se actualizan para reintento.
- Si la colisión corresponde a la misma tasa compartida, el cliente reancla la operación a la identidad canónica y reintenta con la versión remota actual.
- Los conflictos que no se pueden resolver con seguridad quedan en revisión; las demás operaciones continúan. No se borran datos locales ni se reescriben tasas históricas.
- Se alinea la versión visible y la caché de la PWA.

## V6.0-dev-v27 — identidad común para la tasa de cambio
- Corrige la causa de la falta de sincronización bidireccional: cada navegador podía crear un identificador distinto para la misma tasa compartida.
- Todos los dispositivos usan el identificador estable del ajuste de tasa ya existente en Supabase, y actualizan el registro compartido en lugar de crear otro independiente.
- La tasa remota confirmada permanece en el mismo registro y su versión se actualiza al sincronizar.

## V6.0-dev-v26 — corrección del salto literal y carga de tasa compartida
- Elimina el texto literal \\n que quedó en el HTML antes de la cabecera principal.
- La tasa compartida confirmada localmente se hidrata al iniciar la app, evitando que una tasa local antigua vuelva a prevalecer al abrir Configuración.
- Se actualizan la versión de la aplicación, la hoja de estilos y la caché de la PWA.

## V6.0-dev-v25 — confirmación de versión de tasa sincronizada
- Corrige la actualización local de la versión remota de la tasa de cambio después de que Supabase confirma su envío, para evitar que el siguiente cambio reutilice una versión obsoleta.
- Actualiza la versión de la hoja de estilos para invalidar la copia anterior en el navegador.

## V6.0-dev-v24 — sincronización de tasa monetaria y acceso
- La tasa de cambio guardada en Configuración se registra como entidad compartida y se sincroniza mediante la cola existente; los demás dispositivos aplican el valor remoto.
- Se corrige el salto de línea literal antes del contenido principal y se elimina el botón redundante «Cambiar cuenta»; «Cerrar sesión» permite iniciar otra cuenta.
- Se alinean la versión de la aplicación, la página, version.txt y la caché de la PWA.

## V6.0-dev-v23 — corrección visual de la pantalla de acceso
- Corrige el salto de línea literal que aparecía entre el acceso y la aplicación.
- Fuerza las reglas de bloqueo de contenido y visibilidad del formulario de acceso, y limita el tamaño del logotipo en móvil.
- Versiona la hoja de estilos en la URL para evitar que el navegador reutilice una copia antigua de la PWA.

## V6.0-dev-v22 — inicialización de sesión para sincronización
- Corrige la actualización inicial del estado de sincronización cuando una sesión temporal se recupera desde sessionStorage al recargar la PWA.
- La pantalla de acceso, la persistencia opcional y la recuperación por usuario/correo de V21 se mantienen.
- Se incrementa la versión visible y la caché para que los dispositivos reciban la corrección.

## V6.0-dev-v21 — acceso protegido y recuperación de contraseña
- La PWA oculta navegación y contenido del taller hasta confirmar una sesión válida; si la sesión caduca o se cierra, vuelve a la pantalla de acceso.
- Se añade opción de sesión temporal (sessionStorage) o persistente en el dispositivo (localStorage), además de cambiar de cuenta y cerrar sesión.
- Se añade recuperación por usuario o correo y formulario para establecer una nueva contraseña desde el enlace recibido.
- Se conservan tickets, fotos, movimientos, configuración y operaciones pendientes al cerrar sesión; no se borran datos locales.
- Se incrementa la versión visible y la caché de la PWA.

## V6.0-dev-v20 — sincronización completa en una pulsación
- La acción de sincronizar coordina hasta cuatro ciclos de envío y recepción en una sola ejecución, con parada tras dos ciclos tranquilos consecutivos.
- Se muestra un único resumen final; se elimina la confirmación repetitiva antes de enviar la cola pendiente.
- Los conflictos y cambios que requieren revisión detienen el ciclo y se conservan para resolución manual; no se fuerza la aplicación de snapshots inseguros.
- Se actualizan la versión visible, version.txt y la caché de la PWA. No se borran ni reinician datos locales.

## V6.0-dev-v19 — procesar la bandeja ya recibida
- La sincronización también procesa los cambios seguros que ya estaban guardados en la bandeja local de revisiones, aunque el cursor del servidor ya haya avanzado.
- Las entradas marcadas para revisión no se aplican automáticamente; se vuelven a comprobar las operaciones locales pendientes antes de cada aplicación.
- Se incrementa la caché PWA y se sincronizan las versiones visibles.

## V6.0-dev-v19 — procesar la bandeja ya recibida
- La sincronización también procesa los cambios seguros que ya estaban guardados en la bandeja local de revisiones, aunque el cursor del servidor ya haya avanzado.
- Las entradas marcadas para revisión no se aplican automáticamente; se vuelven a comprobar las operaciones locales pendientes antes de cada aplicación.
- Se incrementa la caché PWA y se sincronizan las versiones visibles.

## V6.0-dev-v18 — aplicación segura de cambios remotos
- La sincronización aplica automáticamente snapshots recibidos cuando no hay operaciones locales pendientes para esa entidad.
- Los cambios que coinciden con operaciones locales pendientes o que no pueden aplicarse con seguridad quedan en la bandeja de revisión.
- El resumen informa cambios recibidos, aplicados automáticamente y pendientes de revisión.
- El estado de cuenta distingue entre sesión iniciada y taller configurado para evitar el mensaje engañoso de que no hay vinculación cuando el UUID ya está guardado.
- Se conserva el enfoque local-first; la aplicación remota suprime la generación de nuevas operaciones de salida.
- Se incrementa la caché PWA para distribuir el código actualizado.

## V6.0-dev-v17 — recuperación de estabilidad
- Se recupera el archivo app.js de la versión estable V6.0-dev-v14 (posterior a la corrección de la clave pública de sincronización).
- Se revierte temporalmente la aplicación automática de cambios remotos; se conserva el flujo de sincronización manual y la revisión explícita para reducir riesgos mientras se valida el intercambio entre dispositivos.
- Se incrementa la caché PWA para que los navegadores descarguen el archivo recuperado.
- No se modifican ni eliminan los datos guardados en el dispositivo.

## V6.0-dev-v16 — recuperación de arranque
- Corregido el renderizado de la sección de revisión que contenía un error de sintaxis y bloqueaba la inicialización completa de la aplicación.
- Incrementada la versión de caché de la PWA para que los dispositivos descarguen el JavaScript corregido.
- La sección de revisión muestra un resumen legible de pendientes y conflictos; no modifica ni elimina los datos locales.

# NEXUM Taller — registro de cambios

## V6.0-dev-v71 — distribución correcta de la ficha económica
- Columna izquierda: equipo, cliente, ganancia total y tasa CUP/USD.
- Columna derecha: inversión, incremento e impacto total del taller.
- El pie conserva estado y técnico apilados a la izquierda y amplía el botón «Examinar» a la derecha; las pegatinas quedan más compactas.
- Solo cambia la presentación; no se alteran cálculos, datos ni la acción de abrir el ticket.


## V6.0-dev-v15 — sincronización entre dispositivos
- Los cambios remotos se aplican automáticamente cuando no hay operaciones locales pendientes para esa entidad y no hay un diálogo abierto.
- Los conflictos y cambios que no pueden aplicarse de forma segura se conservan en una sección visible de revisión.
- El resumen final distingue operaciones enviadas, cambios recibidos/aplicados, pendientes y casos que requieren revisión.
- Se elimina la confirmación por lote antes de enviar operaciones pendientes; se mantienen los datos locales ante errores.
- Se renueva la caché de la PWA para distribuir los recursos de esta versión.

## V6.0-dev-v14
- Versión anterior; corrección de la clave pública de sincronización.


## V6.0-dev-v72 — pie de ficha económica
- Se fija la columna de estado y técnico a la izquierda, manteniendo las pegatinas apiladas y sus tamaños actuales.
- El botón «Examinar» ocupa la columna derecha, centrado verticalmente y sin intercalarse entre las pegatinas.
- Solo se modifica la presentación; se conservan los datos y la acción existente del botón.


## V6.0-dev-v73 — pie económico más discreto
- Se mantiene estado y técnico apilados a la izquierda, evitando que la pegatina de estado salte de línea.
- Se reduce la altura del botón «Examinar» y el espacio superior del pie para una fila más compacta.
- Se conserva la posición del botón a la derecha y no se alteran datos ni acciones.


## V6.0-dev-v74 — tarjetas económicas adaptables
- Los movimientos se presentan en tarjetas independientes con ancho máximo, adaptándose a una, dos o tres columnas según el espacio disponible.
- La línea divisoria queda limitada al ancho de cada tarjeta.
- Las pegatinas de estado y técnico quedan más compactas; el botón «Examinar» aumenta ligeramente de tamaño y se alinea hacia la derecha.
- Sin cambios en datos, cálculos ni acciones.


## V6.0-dev-v75 — tarjetas ECN alineadas con TK
- Los movimientos ECN adoptan la tarjeta con borde, fondo, ID y fecha arriba, datos en columnas y pie separado, como las fichas TK.
- Se conservan los importes, moneda, tasa, notas y acciones existentes de editar y borrar.
- Ajuste visual adaptable para móvil y pantallas amplias; sin cambios en cálculos ni persistencia.


## V6.0-dev-v76 — corregir contenedor visual ECN
- Se refuerza el estilo de tarjeta ECN con selectores específicos para que los estilos generales no distribuyan los campos como elementos sueltos.
- ID y fecha arriba, concepto/tasa y cantidad en columnas, acciones en un pie dentro de la tarjeta.
- Ajuste adaptable para móvil; sin cambios contables ni en las acciones.


## V6.0-dev-v77 — mosaico adaptable en Cola e Histórico
- Cola e Histórico agrupan las tarjetas TK en columnas cuando el ancho lo permite; en pantallas estrechas mantienen una tarjeta por fila.
- El modo Lista conserva el formato tabular de una fila por registro y refuerza el contraste de los colores de estado para acercarlos a los del mosaico.
- No se modifica el contenido de las tarjetas ni la lógica de filtros, orden, estados o acciones.


## V6.0-dev-v78 — ajuste de tarjetas y colores en tema oscuro
- Cola e Histórico: tarjetas TK con ancho máximo controlado para formar mosaico cuando haya espacio; en pantallas estrechas, una por fila.
- Contabilidad: las tarjetas ECN ocupan el ancho disponible de cada celda y distribuyen sus datos dentro de una ficha completa, sin quedar estrechas ni centradas.
- Modo Lista: estados con fondos oscuros y texto legible en tema oscuro, tanto en tema seleccionado como en tema del sistema.
- Sin cambios en datos, contabilidad ni acciones.
