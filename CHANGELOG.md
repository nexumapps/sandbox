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
