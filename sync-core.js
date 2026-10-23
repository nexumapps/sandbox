/*
 * NEXUM Taller 6.0 — primitivas de sincronización local.
 * No realiza red ni activa sincronización automática. El servidor es la única
 * autoridad que asigna versiones remotas. La cola no debe enviarse hasta que
 * exista sesión, taller seleccionado y respaldo verificado.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.NexumSyncCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const ENTITY_TYPES = new Set(['ticket', 'equipment', 'customer', 'movement', 'category', 'settings', 'other']);
  const ACTIONS = new Set(['upsert', 'delete']);

  function uuid() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    // Identificador local; no se utiliza como credencial de seguridad.
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 3 | 8)).toString(16);
    });
  }
  function ensureSyncMeta(record, remoteVersion) {
    const out = { ...record };
    if (typeof out.syncId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(out.syncId)) out.syncId = uuid();
    if (!Number.isInteger(out.remoteVersion) || out.remoteVersion < 0) out.remoteVersion = Number.isInteger(remoteVersion) && remoteVersion >= 0 ? remoteVersion : 0;
    if (!['local', 'pending', 'synced', 'conflict', 'error'].includes(out.syncStatus)) out.syncStatus = 'local';
    return out;
  }
  function validateOperation(op) {
    if (!op || !op.entityId || !ENTITY_TYPES.has(op.entityType) || !ACTIONS.has(op.action)) throw new Error('Operación incompleta o no permitida');
    if (!Number.isInteger(op.baseVersion) || op.baseVersion < 0) throw new Error('baseVersion inválida');
    if (op.action === 'upsert' && (!op.payload || typeof op.payload !== 'object' || Array.isArray(op.payload))) throw new Error('El payload debe ser un objeto');
    if (op.action === 'delete' && op.payload != null && (typeof op.payload !== 'object' || Array.isArray(op.payload))) throw new Error('El payload de borrado debe ser objeto o nulo');
  }
  /*
   * Solo se consolida una operación aún pendiente. Una operación en vuelo es
   * inmutable; cualquier cambio posterior genera otra operación. El borrado y
   * la recreación nunca se consolidan entre sí. Se conserva baseVersion inicial.
   */
  function enqueue(outbox, op) {
    validateOperation(op);
    const queue = Array.isArray(outbox) ? outbox.map(x => ({ ...x })) : [];
    const candidate = { ...op, operationId: op.operationId || uuid(), status: 'pending', createdAt: op.createdAt || new Date().toISOString() };
    // Solo se puede consolidar con la última operación de esa entidad. Buscar
    // cualquier operación anterior podría reordenar una secuencia upsert/delete/upsert.
    let previousIndex = -1;
    for (let i = queue.length - 1; i >= 0; i--) {
      const item = queue[i];
      if (item.entityType === candidate.entityType && item.entityId === candidate.entityId) {
        if (item.status === 'pending' && item.action === candidate.action) previousIndex = i;
        break;
      }
    }
    if (previousIndex >= 0) {
      const previous = queue[previousIndex];
      queue[previousIndex] = { ...candidate, operationId: previous.operationId, baseVersion: previous.baseVersion,
        coalescedCount: (previous.coalescedCount || 1) + 1, createdAt: previous.createdAt || candidate.createdAt };
    } else queue.push({ ...candidate, coalescedCount: 1 });
    return queue;
  }
  function markSending(outbox, operationId) {
    return outbox.map(op => op.operationId === operationId && op.status === 'pending' ? { ...op, status: 'sending' } : op);
  }
  function acknowledge(outbox, operationId) { return outbox.filter(op => op.operationId !== operationId); }
  function markRetryable(outbox, operationId, error) {
    return outbox.map(op => op.operationId === operationId ? { ...op, status: 'pending', lastError: String(error || 'Error de sincronización') } : op);
  }
  // JSON-like equality ignores object key order, but preserves array order and value types.
  function stable(value) {
    if (Array.isArray(value)) return value.map(stable);
    if (value && typeof value === 'object') return Object.keys(value).sort().reduce((out, k) => { out[k] = stable(value[k]); return out; }, {});
    return value;
  }
  function equal(a, b) { return JSON.stringify(stable(a)) === JSON.stringify(stable(b)); }
  function changedKeys(base, current) {
    const a = base || {}, b = current || {};
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(k => !equal(a[k], b[k]));
  }
  function classifyMerge(base, local, remote) {
    const localChanged = changedKeys(base, local), remoteChanged = changedKeys(base, remote);
    const overlaps = localChanged.filter(k => remoteChanged.includes(k));
    return { kind: overlaps.length ? 'conflict' : 'mergeable', localChanged, remoteChanged, overlappingKeys: overlaps };
  }
  function makeOperation({ entityType, record, action = 'upsert', baseVersion = 0, payload, legacyId }) {
    if (!record || !record.syncId) throw new Error('El registro necesita syncId estable');
    const op = { entityType, entityId: record.syncId, action, baseVersion,
      payload: action === 'delete' ? (payload ?? null) : (payload ?? { ...record }), legacyId: legacyId ?? record.ticketId ?? record.equipoId ?? record.id ?? null };
    validateOperation(op);
    return { ...op, operationId: uuid(), status: 'pending', createdAt: new Date().toISOString(), coalescedCount: 1 };
  }
  return { uuid, ensureSyncMeta, enqueue, markSending, acknowledge, markRetryable, changedKeys, classifyMerge, makeOperation, validateOperation };
});
