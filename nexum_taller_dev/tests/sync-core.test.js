const assert = require('node:assert/strict');
const sync = require('../sync-core.js');

// Offline saves coalesce, retaining operation identity and original remote base.
let q = sync.enqueue([], { entityType: 'ticket', entityId: 'u1', action: 'upsert', baseVersion: 12, payload: { diagnostico: 'A' } });
const id = q[0].operationId;
q = sync.enqueue(q, { entityType: 'ticket', entityId: 'u1', action: 'upsert', baseVersion: 99, payload: { diagnostico: 'B' } });
q = sync.enqueue(q, { entityType: 'ticket', entityId: 'u1', action: 'upsert', baseVersion: 12, payload: { diagnostico: 'C' } });
assert.equal(q.length, 1); assert.equal(q[0].baseVersion, 12); assert.equal(q[0].payload.diagnostico, 'C');
assert.equal(q[0].operationId, id); assert.equal(q[0].coalescedCount, 3);

// Once sending, an operation is immutable; later local changes get a new op.
q = sync.markSending(q, id);
q = sync.enqueue(q, { entityType: 'ticket', entityId: 'u1', action: 'upsert', baseVersion: 12, payload: { diagnostico: 'D' } });
assert.equal(q.length, 2); assert.equal(q[0].status, 'sending'); assert.notEqual(q[1].operationId, id);
q = sync.markRetryable(q, id, 'offline'); assert.equal(q[0].status, 'pending'); assert.equal(q[0].lastError, 'offline');
q = sync.acknowledge(q, id); assert.equal(q.length, 1);

// A delete and a recreation are never coalesced into one operation.
let d = sync.enqueue([], { entityType: 'ticket', entityId: 'u2', action: 'delete', baseVersion: 2, payload: null });
d = sync.enqueue(d, { entityType: 'ticket', entityId: 'u2', action: 'upsert', baseVersion: 2, payload: { estado: 'nuevo' } });
assert.equal(d.length, 2);
// Never coalesce an upsert across a later delete for the same entity.
let ordered = sync.enqueue([], { entityType: 'ticket', entityId: 'u3', action: 'upsert', baseVersion: 0, payload: { estado: 'A' } });
ordered = sync.enqueue(ordered, { entityType: 'ticket', entityId: 'u3', action: 'delete', baseVersion: 1, payload: null });
ordered = sync.enqueue(ordered, { entityType: 'ticket', entityId: 'u3', action: 'upsert', baseVersion: 1, payload: { estado: 'B' } });
assert.equal(ordered.length, 3);
assert.deepEqual(ordered.map(x => x.action), ['upsert', 'delete', 'upsert']);
assert.throws(() => sync.enqueue([], { entityType: 'unknown', entityId: 'x', action: 'upsert', baseVersion: 0, payload: {} }));
assert.throws(() => sync.enqueue([], { entityType: 'ticket', entityId: 'x', action: 'upsert', baseVersion: -1, payload: {} }));

// Metadata is stable once assigned and doesn't change legacy visible identifiers.
const original = { ticketId: 'TK-A-0001', id: 'EQ-0001' };
const withMeta = sync.ensureSyncMeta(original);
assert.equal(withMeta.ticketId, original.ticketId); assert.equal(withMeta.id, original.id);
assert.equal(sync.ensureSyncMeta(withMeta).syncId, withMeta.syncId); assert.equal(withMeta.remoteVersion, 0);

// Key order doesn't create false conflicts; overlapping fields are surfaced.
assert.deepEqual(sync.changedKeys({ nested: { a: 1, b: 2 } }, { nested: { b: 2, a: 1 } }), []);
assert.equal(sync.classifyMerge({ a: 1, b: 1 }, { a: 2, b: 1 }, { a: 1, b: 2 }).kind, 'mergeable');
const conflict = sync.classifyMerge({ precio: 100, estado: 'En diagnóstico' }, { precio: 200, estado: 'En diagnóstico' }, { precio: 300, estado: 'Listo para recoger' });
assert.equal(conflict.kind, 'conflict'); assert.deepEqual(conflict.overlappingKeys, ['precio']);
console.log('sync-core tests: OK');
