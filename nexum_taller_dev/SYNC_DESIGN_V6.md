# NEXUM Taller 6.0 — integración de sincronización (desarrollo)

## Estado de esta copia
Esta carpeta parte de V5.6.29-beta. El módulo `sync-core.js` implementa primitivas y pruebas automatizadas; **todavía no está conectado al guardado de la aplicación ni a Supabase**. No es una versión instalable de 6.0.

## Reglas de seguridad de datos
- No subir datos existentes ni crear taller/membresías automáticamente.
- Antes de elegir el dispositivo fuente: exportar copia general y copia del repositorio de fotos; verificar que ambas puedan leerse.
- No cambiar los identificadores visibles `ticketId` (TK-A-...) ni `id` (EQ-...). `syncId` será una identidad UUID adicional.
- `remoteVersion` solo avanza con respuesta aceptada del servidor. Guardar localmente no aumenta la versión remota.
- Solo consolidar cambios aún pendientes para la misma entidad y acción; conservar la versión base original.
- Una operación en envío es inmutable. Si hay otra edición mientras está en vuelo, crear una operación posterior.
- No consolidar borrado y recreación entre sí. Los borrados remotos requieren tombstone y conflicto si la base ya cambió.
- No aplicar cambios remotos sobre un formulario que se está editando. Guardar el borrador y mostrar aviso; merge automático solo si las claves cambiadas no se solapan.
- No iniciar tráfico de red sin sesión autenticada, taller activo, dispositivo registrado y decisión explícita sobre la fuente de verdad.

## Contrato de operación
Cada operación debe llevar `operationId` UUID idempotente, `entityType`, `entityId` UUID estable, `action`, `baseVersion`, `payload` y `legacyId` opcional. Tipos y acciones se validan en el cliente como ayuda, pero el servidor sigue siendo la autoridad.

## Pruebas ejecutadas
`node --check sync-core.js`
`node --check tests/sync-core.test.js`
`node tests/sync-core.test.js`

Cobertura actual: coalescencia offline, preservación de versión base/ID de operación, operación en vuelo, reintento, ack, separación borrado/recreación, validación básica, metadatos estables y clasificación de conflicto por campo.

## Pendiente antes de probar con datos reales
1. Conectar metadata y outbox persistente a los guardados locales sin encolar automáticamente el histórico existente.
2. Añadir login, selección de taller y registro de dispositivo.
3. Definir la importación inicial segura desde el dispositivo elegido.
4. Implementar RPC de envío y pull paginado, recuperación idempotente y aplicación diferida durante edición.
5. Pruebas integrales de navegador/PWA y dos dispositivos.

## Indicador visible de conexión y sincronización
El indicador permanecerá visible en la cabecera, con texto además del color y un detalle accesible al tocarlo. Internet disponible no equivale a sincronización al día.

Estados y textos previstos:
- **Solo en este dispositivo**: no hay sesión/taller compartido configurado. Los datos siguen guardándose localmente; no se afirmará que están sincronizados.
- **Al día**: sesión válida, último pull completado y cola local vacía. Mostrar hora de última sincronización correcta.
- **Conectado · N cambios pendientes**: el servidor es alcanzable, pero quedan operaciones locales por confirmar.
- **Sincronizando · X de N**: operación en curso; conservar los cambios locales y no marcar como sincronizados hasta recibir confirmación del servidor.
- **Sin conexión · N cambios pendientes**: guardar localmente y mantener la cola para reintento posterior.
- **Revisión necesaria · N conflictos**: detener el envío automático de esas entidades y permitir comparar datos local/remoto; no sobrescribir silenciosamente.
- **No se pudo sincronizar**: explicar que los datos locales siguen guardados y ofrecer reintentar; el error no se presenta como pérdida de datos.

Al abrir el detalle se mostrarán taller/cuenta activos, dispositivo, estado de red, última sincronización correcta, número de pendientes y conflictos, y botón de sincronización manual. El estado “Al día” solo se permite tras una confirmación remota de envío y una recepción completa hasta el cursor actual; el evento `online` del navegador por sí solo nunca lo activa.

## Estado visible en la iteración de interfaz 0.3
La app muestra «Solo en este dispositivo» hasta que haya una sesión/taller conectados y exista una implementación real de sincronización. El indicador de conectividad online/offline no es prueba de sincronización. El panel declara que no se están enviando datos. Esta interfaz es deliberadamente conservadora y no incluye todavía autenticación ni conexión RPC.

## Estado de autenticación — iteración 0.4
- Configuración permite iniciar/cerrar sesión con la función existente `login-with-username`.
- Se conserva la sesión (tokens y usuario) en almacenamiento local para este prototipo; nunca se guarda la contraseña.
- Una sesión válida solo significa que el usuario se autenticó. No prueba membresía de taller ni sincronización.
- Todavía no se llama a `nexum_apply_sync_operation` ni `nexum_pull_sync_changes`; no se sube ni descarga información del taller.
- Antes de probar con usuarios operativos: implementar renovación de token, gestión de expiración y recuperación de sesión; validar respuesta/identidad y conectar registro seguro del dispositivo y selección de taller.


## V6.0-dev-v8 — decisiones de identidad
- `equipoId` es el identificador visible del equipo físico y se repite en cada ingreso de ese equipo. Nunca debe confundirse con el identificador del ticket.
- `ticketId` identifica una operación/ingreso único; cada reingreso genera un ticket nuevo. `ticketGarantiaOrigen` conserva actualmente el Ticket ID visible, y deberá resolverse a `syncId` en la migración relacional.
- `ECN ID` identifica un movimiento económico individual. El `syncId` UUID de ese movimiento es su identidad técnica estable para sincronización.
- En local, los registros existentes migran de `id` a `equipoId` al cargarse; los IDs visibles ya existentes no se regeneran.
- La cola local `nexum_sync_outbox_v1` es preparatoria: no debe despacharse hasta integrar el taller autenticado, la selección de fuente inicial, el control de versiones, pull y resolución de conflictos. No cargar automáticamente registros históricos.
- La base remota actual aún no permite `equipment`/`customer` en el constraint de `nexum_sync_records`; actualizar esquema y RPCs con migración revisada antes de cualquier transmisión.

## Entidad Equipo independiente — dev v9
`equipoId` es el identificador visible del equipo físico y se repite en todos sus ingresos. Cada fila de ticket conserva un `ticketId` visible y un `syncId` UUID propio. El catálogo local `nexum_equipment_v1` mantiene una entidad por `equipoId` y su `syncId` estable; `equipoSyncId` en tickets es por ahora una referencia de compatibilidad al `syncId` del equipo. La migración se construye desde los tickets existentes y no pone el histórico en la cola. Antes de activar red, el esquema remoto y las funciones RPC deben aceptar `equipment` y validarse las referencias ticket-equipo.


## Estado revisado — V6.0-dev-v12 (2026-10-20)
- El módulo manual ya está conectado al RPC de registro, al envío idempotente y al pull paginado; la RPC `nexum_register_sync_device` se desplegó en Supabase mediante la migración `add_sync_device_registration_rpc_v1`.
- El guardado local detecta altas y ediciones de tickets, equipos y movimientos, sin encolar el histórico solo por abrir la PWA. Los borrados explícitos de tickets/movimientos pueden generar tombstones; el restablecimiento general local no genera borrados remotos.
- Los cambios entrantes se mantienen en bandeja de revisión. Se pueden aplicar individualmente para ticket/equipo/movimiento o archivar el aviso. Los tipos no soportados quedan sin aplicar. Conflictos requieren elección explícita entre versión remota y reintento local sobre la versión remota actual.
- Tras confirmar una operación, se actualiza `remoteVersion` en almacenamiento y memoria; operaciones posteriores pendientes de la misma entidad usan la versión aceptada por el servidor. Una entidad en conflicto se excluye del resto de la tanda hasta resolverlo.
- Estado del servidor verificado tras la migración: 0 dispositivos, 0 registros, 0 operaciones y 0 cambios. No se crearon datos para probar.
- Pendiente para considerar sincronización terminada: alta controlada del primer administrador global; crear taller y membresía de prueba; probar JWT válido/inválido, registro de dispositivo, envío, reintento idempotente, pull de varias páginas, conflicto en dos clientes y borrado; revisar fotos (actualmente locales), expiración/renovación de sesión y recuperación ante fallo de aplicación local.


## Estado revisado — V6.0-dev-v13 (2026-10-20)
- Se provisionó el taller `NEXUM ONE` y la membresía activa del administrador principal; las operaciones quedaron registradas en `nexum_admin_audit_log`.
- La consola muestra el UUID del taller y permite vincularlo al dispositivo actual con un clic.
- La app persiste un baseline local normalizado al inicio para evitar que la primera edición tras actualizar convierta el histórico local en altas nuevas; la cola previa se preserva.
- Antes de enviar operaciones pendientes, se muestra una muestra de identificadores y se exige confirmación explícita; cancelar no altera la cola.
- El alta de talleres desde la consola crea también la membresía del administrador creador.
- Pendiente: sincronización E2E desde un navegador autenticado y un segundo dispositivo; pruebas de rechazo, idempotencia, pull paginado, conflicto y borrado. Las fotos no se sincronizan.
