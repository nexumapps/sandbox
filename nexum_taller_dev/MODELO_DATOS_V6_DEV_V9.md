# Modelo de datos local — NEXUM Taller 6.0 dev v9

## Identidades
- `equipoId`: identificador visible del equipo físico (`EQ-...`), común a todos sus ingresos.
- `ticketId`: identificador visible único por ingreso/operación (`TK-A-...`).
- `syncId`: UUID técnico permanente de cada entidad sincronizable; nunca reemplaza los IDs visibles.
- `ECN-X-...`: identificador visible único por movimiento económico.
- `operationId`: UUID distinto por operación de sincronización.
- `workshop_id`: ámbito de aislamiento remoto; se asignará cuando exista una vinculación explícita con un taller.

## Almacenamiento local
- Tickets: `taller_electronica_v5`.
- Movimientos ECN: `taller_electronica_v5_movements`.
- Catálogo de equipos: `nexum_equipment_v1`.
- Cola de sincronización: `nexum_sync_outbox_v1`.
- Fotos: IndexedDB `nexum_v56_photos`; los archivos siguen locales.

## Seguridad de migración
La construcción inicial del catálogo de equipos deriva una fila por `equipoId` del histórico existente y conserva los IDs visibles. No encola ni transmite automáticamente los registros históricos. El código de sincronización de servidor permanece inactivo: el esquema remoto existente aún requiere aceptar `equipment` y comprobar las referencias antes de permitir envíos.
