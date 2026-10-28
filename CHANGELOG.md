## V6.0.68beta — cancelar edición de tickets
- Añade el botón «Cancelar» junto a «Guardar cambios» en la edición del Histórico.
- Cancelar descarta los cambios temporales y vuelve a «Examinar» con el registro original intacto; la X superior sigue cerrando el diálogo.
- No cambia las validaciones ni la lógica de guardado. Actualiza versión visible, referencia de JavaScript y caché PWA.
- Solo Sandbox; Main y Supabase sin cambios.

## V6.0.67beta — vincular todos los reingresos con su ticket anterior
- Guarda `ticketReingresoOrigen` para reingresos normales y por garantía, manteniendo el Equipo ID y creando un Ticket ID nuevo.
- En «Examinar» muestra el ticket anterior cuando el ingreso es un reingreso.
- `ticketGarantiaOrigen` sigue reservado para reingresos por garantía; no se alteran los registros anteriores ni la lógica de concesión de garantías.
- Actualiza la versión visible, la referencia de JavaScript y la caché PWA.

## V6.0.65beta — corregir vencimientos al final de mes
- Al sumar meses o años a una fecha de garantía, el día se limita al último día válido del mes destino (por ejemplo, 31 de enero + 1 mes = 28/29 de febrero según el año).
- Los cálculos en días y semanas y la regla de incluir el propio día de vencimiento se mantienen.
- Actualiza versión visible, referencia de JavaScript y caché PWA.

## V6.0.64beta — evitar cambios de tasa si falla el ingreso
- La validación de fecha de salida, técnico y estado final ocurre antes de actualizar la tasa de cambio recordada.
- Si el formulario de ingreso no supera la validación, no se añade el ticket ni se modifica la tasa recordada.
- Se mantiene la lógica de validación existente y la edición atómica introducida en V6.0.60beta.
- Actualiza versión visible, referencia de JavaScript y caché PWA.

## V6.0.63beta — permitir borrar la fecha de salida
- Añade un control explícito «Borrar fecha» en el ingreso y en la edición de tickets, útil también en móviles donde el selector de fecha no ofrece una opción clara para vaciar el campo.
- Mantiene intactas las validaciones existentes: un estado final requiere fecha de salida y una fecha de salida requiere estado final; borrar el campo no desactiva ni modifica esas reglas.
- Actualiza las referencias de versión, JavaScript y caché para cargar el cambio.

## V6.0.62beta — corregir el contador de días de garantía
- Calcula los días restantes comparando fechas de calendario, evitando el día adicional que podía aparecer al contar hasta las 23:59:59.
- El día de vencimiento sigue considerándose vigente y se muestra como «Vence hoy»; la garantía solo se marca vencida a partir del día siguiente.
- Actualiza la versión de la aplicación, el recurso JavaScript y la caché del service worker para que los dispositivos reciban la corrección.

## V6.0.61beta — garantía predeterminada de una semana
- En la edición de tickets, una garantía nueva o aún no concedida propone 1 semana en lugar de 30 meses.
- Se conserva la duración y unidad existentes cuando el ticket ya tiene una garantía concedida.
- Se actualizan versión visible, referencia del JavaScript y caché PWA.
- Solo Sandbox; Main y Supabase sin cambios.

## V6.0.60beta — edición segura con validación previa
- La edición del Histórico trabaja sobre una copia temporal del ticket.
- Si falla la validación de fecha de salida, técnico, moneda o garantía, el registro original permanece intacto y no se actualiza la tasa guardada.
- El registro solo se sustituye y sincroniza después de superar todas las validaciones.
- Actualiza versión visible, referencia del JavaScript y caché PWA.
- Solo Sandbox; Main y Supabase sin cambios.

## V6.0.59beta — clave pública vigente para recuperación
- Las peticiones de envío y aplicación de recuperación usan la clave pública `sb_publishable` activa del proyecto, en vez de la clave heredada que devolvía «Invalid API key» al actualizar la contraseña.
- Se conserva el destino explícito de Sandbox y el diagnóstico detallado de errores.
- Se actualizan versión visible, referencia del JavaScript y caché PWA.
- Solo Sandbox; no se modificó Main ni se cambiaron datos o funciones de Supabase.

## V6.0.58beta — corregir destino y diagnóstico de recuperación
- La solicitud de recuperación indica la URL de Sandbox como destino, evitando que el enlace nuevo vuelva por defecto a Main.
- Si Supabase rechaza el cambio de contraseña, la interfaz muestra el detalle disponible del error en vez de ocultarlo con un mensaje genérico.
- Se renuevan la versión y la caché de la PWA.
- Solo Sandbox; no se modificó Main ni la configuración de Supabase.

## V6.0.57beta — pantalla exclusiva para recuperación de contraseña
- Cuando el enlace de recuperación se reconoce, se ocultan el encabezado de inicio de sesión y su contenido; queda visible el formulario de nueva contraseña.
- El estado visual depende de la detección existente del enlace de recuperación; no se modificó la lógica de autenticación ni Supabase.
- Se renuevan las referencias de caché de la PWA.
- Solo Sandbox; Main y Supabase sin cambios.

## V6.0.56beta — corregir recuperación de contraseña y versión de la app
- Corrige los identificadores duplicados de los botones de recuperación: el botón de inicio abre el panel y el botón del panel envía la solicitud.
- Alinea la constante interna, la versión de respaldo visible y `version.txt` en V6.0.56beta.
- Invalida la caché anterior del JavaScript y del service worker para que el navegador reciba la corrección.
- Solo Sandbox; no se modificó Supabase ni el repositorio principal.

## V6.0.55beta — ajuste fino del menú lateral
- Baja el menú lateral 2 píxeles CSS respecto a V6.0.54beta, manteniendo el cálculo dinámico según el borde real de la barra superior.
- No se modificó Supabase ni el repositorio principal.

## V6.0.54beta — posición exacta del menú lateral
- Calcula la posición superior usando el borde inferior real de la barra superior y resta 1 píxel CSS, en lugar de depender de una altura fija que no coincide con la cabecera móvil.
- Mantiene alineado el fondo oscuro con el panel lateral y recalcula al cambiar el tamaño u orientación de pantalla.
- No se modificó Supabase ni el repositorio principal.

## V6.0.53beta — menú unido a la barra superior
- Se elimina el padding superior interior del menú móvil para que el panel quede unido a la cabecera y «Inicio» aparezca desde el principio.
- No se modificó Supabase ni el repositorio principal.

## V6.0.52beta — corrección de escala del menú móvil
- Reduce el desplazamiento superior del panel y del fondo oscuro de 164 a 94 CSS px para alinearlos con la cabecera visible en móvil.
- No se modificó Supabase ni el repositorio principal.

## V6.0.51beta — posición del menú lateral móvil
- El menú lateral empieza justo debajo de la cabecera de la aplicación; se elimina el hueco vertical excesivo.
- El fondo oscurecido queda limitado al área situada bajo la cabecera.
- No se modificó Supabase ni el repositorio principal.

## V6.0.50beta — sincronización explícita y cabecera compacta
- En modo local, el botón Sincronizar ofrece pasar al modo online o continuar localmente; cancelar conserva el modo local y no inicia sincronización.
- Al elegir online, se muestra el acceso a la cuenta; la sincronización requiere autenticación y validación del taller.
- Se retira «Gestión del Taller» de la cabecera, se conserva logo y versión, y se incorpora el nombre de la aplicación al pie del menú lateral.
- Se da más espacio superior al menú lateral en móvil para que «Inicio» no quede pegado ni parcialmente oculto.
- Actualiza versión, recursos y caché PWA. No se modificó Supabase ni el repositorio principal.

## V6.0.49beta — decisión explícita online/local
- Al recuperar la conexión, pregunta si se desea pasar al modo online o continuar localmente.
- Si se continúa en local, pausa la sincronización automática aunque haya internet; el botón Sincronizar exige iniciar sesión antes de enviar o recibir datos.
- Recuerda localmente el identificador del último usuario autenticado (sin guardar credenciales) y muestra usuario recordado y taller configurado en el indicador de modo local.
- La elección local se mantiene durante la pestaña; al elegir online se solicita autenticación y se valida el taller antes de sincronizar.
- Actualiza la versión visible, el recurso JavaScript y la caché PWA. No se modificó Supabase ni el repositorio principal.

## V6.0.48beta — acceso local sin sesión
- Añade una opción explícita para abrir el taller en modo local cuando no hay conexión, no hay sesión y existe un taller configurado previamente en el dispositivo.
- El modo local no crea credenciales ni concede permisos administrativos; al volver la conexión se vuelve a pedir autenticación antes de sincronizar.
- La elección dura solo en la pestaña y se limpia al iniciar sesión o cerrar sesión. Los datos y la cola local se conservan.
- No se modificó Supabase ni el repositorio principal.

## V6.0.47beta — sincronización automática prudente
- Consulta cambios remotos cada 30 segundos mientras la aplicación está visible y conectada; la consulta periódica ejecuta únicamente la recepción incremental.
- Los cambios locales encolados activan un envío automático tras una pausa breve para agrupar operaciones, sin ventanas emergentes.
- La sincronización manual conserva su comportamiento y sus mensajes; se mantiene la protección contra ciclos simultáneos, conflictos y cambios dudosos.
- La sincronización se pausa al quedar sin conexión o en segundo plano y se reanuda al volver a la aplicación.
- Actualiza la versión visible y la caché PWA. No se modificó el esquema ni las funciones de Supabase.

## V6.0.46beta — tarjeta de taller asignado en Producción
- Se mueve la tarjeta «Taller asignado» desde Perfil al panel Producción.
- Se conservan sus identificadores, selector, mensajes y lógica de membresías para no alterar el cambio de taller por dispositivo.
- No se modifican datos, membresías, permisos ni servicios de backend.

## V6.0.45beta — indicador de verificación de Desarrolladores
- El acceso muestra «Verificando acceso…» y «Comprobando permisos con el servidor» mientras espera la respuesta.
- Se anima el icono y se deshabilita temporalmente el botón para evitar clics repetidos; después se restaura el texto original.

## V6.0.44beta — control de entrada a Desarrolladores
- La entrada al módulo consulta primero al servidor y solo se abre si la sesión pertenece a un administrador global activo.
- Si la validación falla, el módulo no se abre y se muestra el motivo de denegación.
- La API de administración continúa verificando el permiso en cada petición; el acceso directo a las tablas administrativas sigue bloqueado por RLS y privilegios.

## V6.0.43beta — preferencias visuales sincronizadas por usuario
- Guarda en el perfil de Supabase el modo, la paleta, el tamaño de texto y el tamaño de iconos.
- Al iniciar sesión, recupera las preferencias de la nube; conserva una copia local para uso sin conexión y actualiza la nube al cambiar ajustes.
- Preferencias personales separadas de la configuración y datos del taller.

## V6.0.42beta — paletas completas y correo público
- Las seis paletas modifican fondos, superficies, contraste y acentos en modo claro y oscuro; se mantienen los colores semánticos de los estados.
- La ficha distingue el correo público de contacto del correo principal de la cuenta y del correo secundario de recuperación existente.
- Se añadió el campo independiente `profiles.public_email` y se amplió la API de perfil para leerlo y guardarlo.
- Se actualizó la versión visible, las referencias de recursos y la caché PWA.

## V6.0.41beta — preferencias visuales por cuenta
- Añade paletas de acento, tres tamaños de letra y tres tamaños de iconos, además del tema claro/oscuro/sistema.
- Guarda las preferencias en el dispositivo vinculadas al ID de la cuenta; al cambiar de cuenta, carga sus propias preferencias y evita compartir la personalización entre usuarios.
- Añade restablecimiento de valores predeterminados; conserva los colores semánticos de estados de tickets.
- Actualiza versión visible, recursos con caché versionada y service worker.

## V6.0.40beta — restaurar cambio directo de contraseña
- Restaura en el perfil los campos de nueva contraseña y confirmación, usando la sesión autenticada para actualizarla directamente en Supabase.
- Evita enviar correos de recuperación desde el cambio de contraseña del perfil y conserva la clave pública API corregida en V6.0.38beta.
- Actualiza la versión visible, el parámetro de caché del JavaScript y el caché del service worker.

## V6.0.39beta — cambio de contraseña por correo seguro
- El botón del perfil ya no intenta cambiar la contraseña directamente ni pide una contraseña nueva en el dispositivo; solicita un correo de recuperación usando la sesión activa y el correo principal de la cuenta.
- Reutiliza el flujo existente de recuperación de Supabase y muestra el estado de envío en el perfil.
- El enlace de recuperación vuelve a Sandbox cuando la solicitud se origina en Sandbox; las solicitudes habituales de recuperación mantienen el destino principal.
- Actualiza la versión visible, el parámetro de caché del JavaScript y el caché del service worker.

## V6.0.38beta — corregir clave API de Supabase
- Sustituye las tres apariciones de la antigua clave `anon` por la clave `anon` vigente publicada por el proyecto Supabase `ywcrowviufbioeqixwrq`; la clave anterior tenía un emisor JWT distinto del valor que devuelve el proyecto y provocaba `Invalid API key`.
- Mantiene el cambio de contraseña autenticado con el token de sesión, sin verificar la contraseña actual.
- Actualiza la versión visible, el parámetro de caché del JavaScript y el caché del service worker para evitar que el dispositivo siga usando el recurso anterior.


## V6.0.34beta — unificar verificación de contraseña con el inicio de sesión
- El cambio de contraseña verifica la clave mediante el mismo endpoint de inicio de sesión por usuario/correo que usa NEXUM.
- Comprueba que la sesión autenticada devuelta corresponde al mismo usuario antes de actualizar la contraseña.

## V6.0.33beta — corregir selección del correo para cambiar contraseña
- La verificación utiliza primero el correo principal cargado desde la ficha autenticada, en lugar de depender de una segunda consulta directa a Auth que puede no devolverlo en esta sesión.
- La consulta directa queda como alternativa solo si el correo principal está vacío.

## V6.0.30beta — corregir carga de datos de perfil
- La ficha utiliza el gestor de sesión de NEXUM, compatible con sesiones guardadas en sessionStorage o localStorage.
- Se recarga al iniciar/cambiar sesión y al abrir Mi perfil, evitando que la pantalla quede vacía tras cargar antes del inicio de sesión.

## V6.0.31beta — seguridad del perfil
- Se añade el formulario de cambio de contraseña dentro de Mi perfil.
- Antes de actualizar, verifica la contraseña actual contra la cuenta autenticada y comprueba que corresponde al mismo usuario.
- La nueva contraseña se valida entre 8 y 128 caracteres y requiere confirmación.


## V6.0.32beta — corregir verificación de contraseña del perfil
- Se obtiene el correo real de la cuenta mediante `/auth/v1/user` con el token de la sesión activa, incluso si el acceso se inició con nombre de usuario.
- Se conserva la comprobación de contraseña actual y la validación de que la cuenta autenticada sea la misma antes de actualizarla.
