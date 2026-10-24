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
