NEXUM TALLER — DESARROLLO V6.0-dev-v14

Base: V5.5 beta.
Abrir index.html en un navegador moderno. Puede instalarse como PWA si el navegador lo permite.

CAMBIOS V5.5.2
- El Fondo / Balance del taller muestra las existencias físicas separadas por moneda:
  - CUP: saldo físico en CUP.
  - USD: saldo físico en USD.
  - Total: equivalente total en USD usando el cambio actual.
  - ≈ CUP al cambio actual: equivalente total expresado en CUP con la tasa actual.
- El balance conserva físicamente CUP y USD por separado. Cambiar el cambio actual modifica únicamente los equivalentes del total; no convierte ni altera las cantidades físicas almacenadas.
- El saldo inicial creado mediante Restablecer de fábrica se registra como la primera operación ECN, con ID ECN-X-0001, tipo Entrada y nota “Saldo inicial del taller”.
- El saldo inicial ya no se guarda como una cantidad separada que se sume adicionalmente al balance cuando existe esa primera ECN.
- Las reparaciones y los movimientos ECN mantienen su moneda física; para el total equivalente se usa el cambio actual.
- Las tasas históricas de cada operación siguen conservándose para sus equivalentes históricos en la lista económica.

COMPATIBILIDAD
- Las copias anteriores de V5.5 que todavía tengan un saldo inicial en economyConfig se conservan: si no existe una ECN marcada como saldo inicial, ese saldo antiguo sigue formando parte del balance como saldo legado.
- Los nuevos restablecimientos de fábrica de V5.5.2 usan la primera ECN como saldo inicial.

PRUEBAS RECOMENDADAS
1. Restablecer con 1000 CUP: debe aparecer ECN-X-0001 como Entrada y el balance debe mostrar CUP 1000, USD 0 y Total equivalente según el cambio actual.
2. Restablecer con 100 USD: debe aparecer ECN-X-0001 como Entrada y el balance debe mostrar CUP 0, USD 100 y Total 100 USD.
3. Añadir 500 CUP y 20 USD mediante ECN: el balance debe mantener CUP y USD por separado.
4. Cambiar el cambio actual: las cantidades físicas CUP/USD no deben cambiar; solo deben cambiar los equivalentes Total USD y ≈ CUP.
5. Crear un ticket en CUP y otro en USD: el resultado neto de cada ticket debe sumarse a su propia moneda física.
6. Verificar que ECN-X-0001 aparece primero en la lista económica después de un restablecimiento.

V5.5.4: renombra el indicador principal de ingresos a “Total de ingresos”, elimina su repetición en Más detalles y renombra “Fondo / Balance del taller” a “Balance Actual (Taller)”.

V5.5.5 beta
- Incremento (principal) ahora es neto: Ingresos taller menos Pérdidas de tickets, por lo que puede ser negativo cuando las salidas por devolución/cancelación superan lo generado.
- Se agregó Ingresos taller en Más detalles, conservando el valor que antes alimentaba Incremento del taller.


V5.5.6 beta: reorganización de indicadores económicos. Ingresos Totales solo considera ingresos de tickets; Ganancia del Taller = Incremento del taller (margen menos pérdidas); Ganancia Total conserva el resultado total de tickets; en Más detalles se muestran Inversión neta, Incremento taller, Reinversión, Gastos, Pérdidas y Ganancias repartidas.

V5.5.8 beta: Ganancia Total sigue el resultado neto del taller por tickets; Ganancias repartidas solo suma ganancias positivas de técnicos, excluyendo el margen del taller y sin convertirse en negativa por pérdidas.

V5.5.8: Ganancia Total = Ganancia del Taller + Ganancias repartidas; Ganancias repartidas solo considera resultado positivo destinado a técnicos.

V5.5.9 beta: En Economía, Incrementos totales = incremento/margen del taller antes de pérdidas + ganancias repartidas. Se muestra la tasa cambiaria actual junto al botón para modificarla.


V5.6.5 beta
- La ventana Economía de un ticket usa una cuadrícula única de cuadros. Margen, moneda, tasa y técnico(s) son editables directamente; inversión, precio y ganancias se muestran como datos del ticket.
- “Reinversión del taller” pasa a llamarse “Margen”.
- El margen queda limitado a la Ganancia Total y se fuerza a 0 en pérdidas.


CAMBIOS V5.6.9-BETA — GARANTÍAS
- Pregunta explícita al reabrir si el nuevo ingreso es por garantía; Cancelar crea un ingreso normal.
- El reingreso crea un nuevo ID de equipo y un nuevo Ticket ID. Los reingresos por garantía quedan vinculados al Ticket ID original.
- En edición se puede conceder una garantía al cliente al entregar, seleccionar duración/unidad y calcular vencimiento.
- Examinar muestra duración, inicio, vencimiento y días restantes/vencidos; también muestra el ticket original de un reingreso por garantía.
- La casilla de posible reclamación de garantía sigue siendo distinta de la garantía concedida al cliente.


CAMBIOS V5.6.14-beta
- Indicador visual de garantía concedida en la esquina superior derecha de las tarjetas.
- El estado y el contador se calculan mediante una función común compartida con la vista de detalle y el resumen de garantía original.
- La versión visible, la constante de aplicación, version.txt y la caché del service worker se mantienen sincronizadas.

CAMBIOS V5.6.16-beta — INDICADORES DE GARANTÍA
- Escudo con marca para garantía activa; escudo roto para garantía vencida.
- Indicador neutro para ticket sin garantía concedida y herramienta neutra para reingreso por garantía.
- El motivo de reingreso no concede garantía por sí mismo.
- Prueba de navegador/teléfono pendiente.


CAMBIOS V5.6.16-beta — CORRECCIÓN DEL ICONO
- Se corrige la geometría SVG de la llave inglesa del indicador de reingreso por garantía.
- Sin cambios en los datos ni en la lógica de la aplicación.


CAMBIOS V5.6.17-beta — CORRECCIÓN GEOMÉTRICA DEL ICONO
- Se sustituye el SVG de la llave inglesa para eliminar el segmento interior sobrante.
- Sin cambios en la lógica, los datos ni el diseño del resto de la aplicación.
- Pendiente de validación visual en el teléfono.


V5.6.18-beta: temas claro/oscuro/sistema, logo vectorial transparente, navegación reorganizada, configuración de categorías y tasa, y copia/restauración con preferencias. Prueba en teléfono pendiente.


V5.6.19-beta: mejoras de contraste en modo oscuro, logo de encabezado más grande e indicador “Reingreso / por garantía” en dos líneas. La validación visual en dispositivo queda pendiente.

V5.6.22-beta: el logotipo oscuro queda fijo en ambos temas; la transición se aplica al resto de la interfaz.

V5.6.24-beta: los campos Inversión, Margen y Precio final empiezan vacíos. Al introducir una inversión positiva, Margen y Precio final muestran sugerencias como placeholders; las sugerencias no se guardan como valores si el usuario deja esos campos vacíos.

ALTA CONTROLADA DE CUENTAS
Consulta ALTA_CONTROLADA_CUENTAS_V6.md antes de crear cuentas. Es un procedimiento preparado, no ejecutado: esta copia no crea usuarios, taller, membresías ni sube datos automáticamente.

NOTA DE SEGURIDAD DE ALTA (2026-10-10)
Se acordó una contraseña temporal inicial Cambiar*123 con cambio obligatorio. La especificación está en ALTA_CONTROLADA_CUENTAS_V6.md. El bloqueo de inicio de sesión y el endpoint de cambio inicial están desplegados en Supabase; el cambio exige contraseña nueva de mínimo 8 caracteres y la marca se desactiva después del cambio exitoso. No crear cuentas reales hasta completar pruebas integrales y revisión de seguridad en servidor/RLS/RPC. No se han creado cuentas ni membresías.

SEGURIDAD DE PRIMER ACCESO — ACTUALIZACIÓN 2026-10-10
La función pública nexum_is_member(uuid) se actualizó en Supabase para exigir perfil activo y que force_password_change sea falso, además de membresía activa. Esto bloquea operaciones protegidas por esa comprobación mientras esté pendiente el cambio de contraseña. La migración está registrada en MIGRACION_BLOQUEO_PRIMER_ACCESO.sql.
Esta revisión de esquema no sustituye una prueba funcional con JWT real ni una auditoría completa de RLS. No usar como release operativo todavía. No se han creado cuentas reales ni datos compartidos.

REVISION DE SEGURIDAD V6.0-DEV
Consulta REVISION_SEGURIDAD_V6.md antes de autorizar cuentas definitivas. El documento diferencia lo revisado en el esquema/código de lo que todavía requiere prueba con JWT real y navegador. En particular, el almacenamiento actual de refresh token en localStorage y la renovación simultánea entre pestañas no se consideran resueltos. Este paquete sigue siendo de desarrollo.

V7: se coordinan renovaciones de sesión entre pestañas con Web Locks cuando está disponible y se actualiza el estado visual al cambiar la sesión desde otra pestaña. Esto requiere pruebas en navegadores reales y no elimina el riesgo de tokens en localStorage.

La versión de administración global anterior fue 6.0-dev-v11. La versión actual del paquete es 6.0-dev-v12; la RPC de registro de dispositivos ya está desplegada en Supabase. La sincronización real sigue requiriendo una cuenta administradora global, taller y membresía de prueba, y pruebas E2E antes de usar datos reales.


V6.0-dev-v12 — ADMINISTRACIÓN GLOBAL Y AVANCE DE SINCRONIZACIÓN
- Se añade el primer contrato de API de administración global en supabase/functions/nexum-global-admin/index.ts. Incluye verificación de JWT, perfil activo, bloqueo por cambio inicial pendiente y allowlist separada de administradores globales.
- Se incorpora MIGRACION_FUNDACION_ADMIN_GLOBAL_20261013.sql como referencia reproducible de la fundación backend-only ya aplicada, y MIGRACION_ADMIN_GLOBAL_V1.sql añade is_active a nexum_workshops sin desactivar talleres existentes. Revisar antes de aplicar.
- Se añade ADMIN_GLOBAL_V1_DESIGN.md con acciones, dependencias, límites y secuencia de activación segura.
- Se añade una prueba de contrato estática para la API administrativa.
- La función no está desplegada. La consola de Configuración está protegida por el servidor y no se muestra hasta que el endpoint confirme permisos. No se crean cuentas, talleres, membresías ni administradores globales.
- Tras reanudar, Supabase volvió a ACTIVE_HEALTHY y se confirmó el esquema base. Se detectó que nexum_workshops carece de is_active; la consola requiere aplicar primero la migración aditiva y desplegar el endpoint. No se ha ejecutado ninguna migración ni despliegue.


V6.0-dev-v14 — CORRECCIÓN DE ALTA Y VINCULACIÓN DE TALLER
- Al crear un taller desde la consola global, el administrador creador queda con membresía activa para poder sincronizar. Si falla la membresía o el registro final de auditoría, el backend intenta revertir el alta.
- La consola muestra el UUID del taller y ofrece “Usar en este dispositivo” para guardar la vinculación local sin copiar el identificador manualmente.
- Al iniciar se guarda una referencia local normalizada antes de cualquier edición, para que el primer guardado tras actualizar no encole el histórico como altas nuevas; no se borran operaciones ya pendientes.
- Antes de enviar operaciones pendientes, se muestra un resumen y se pide confirmación; cancelar conserva los datos y la cola local.
- El alta controlada actual creó NEXUM ONE y activó la membresía de charliecs11803@gmail.com; todavía hay que ejecutar la sincronización desde la aplicación y luego repetirla en un segundo dispositivo.
- Las fotos permanecen locales y no forman parte de la sincronización.

PWA / USO SIN CONEXION (V6.0-dev-v14)
1. Publica esta carpeta completa en un hosting HTTPS; no abras index.html como archivo si deseas instalar la PWA.
2. Abre el enlace HTTPS en Chrome con Internet, espera a que cargue y elige Instalar aplicación / Añadir a pantalla de inicio.
3. Abre NEXUM desde el icono instalado al menos una vez conectado. Luego prueba modo avión.
4. La caché permite abrir la interfaz y sus recursos locales; las llamadas a Supabase y la sincronización requieren Internet.
5. index.html abierto con file:// usa otro origen/almacenamiento y no comparte automáticamente datos con la PWA.
6. Las fotos se guardan localmente y no se sincronizan automáticamente en esta versión. Realiza copias de seguridad.
