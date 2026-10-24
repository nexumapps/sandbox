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
