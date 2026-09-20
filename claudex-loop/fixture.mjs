import assert from 'node:assert/strict';

// Two editors read version 18. The first moves the task to Done.
const initial = { status: 'Doing', version: 18 };
const firstEdit = { expectedVersion: 18, patch: { status: 'Done' } };
const olderEdit = { expectedVersion: 18, patch: { status: 'Doing' } };

function save(stored, edit) {
  if (edit.expectedVersion !== stored.version) {
    return { accepted: false, task: stored };
  }
  return {
    accepted: true,
    task: { ...stored, ...edit.patch, version: stored.version + 1 }
  };
}

const first = save(initial, firstEdit);
assert.equal(first.accepted, true);
assert.deepEqual(first.task, { status: 'Done', version: 19 });

// BEFORE: accepting the older payload unconditionally loses the edit.
const unsafe = { ...first.task, ...olderEdit.patch };
assert.equal(unsafe.status, 'Doing');
console.log('BEFORE: Done -> Doing; the older save overwrites the edit.');

// AFTER: the old base version no longer matches the stored version.
const rejected = save(first.task, olderEdit);
assert.equal(rejected.accepted, false);
assert.deepEqual(rejected.task, first.task);
console.log('AFTER: stale save rejected; Done and version 19 preserved.');

// A current editor can still save; its next version is assigned by save().
const current = save(first.task, {
  expectedVersion: 19, patch: { status: 'Archived' }
});
assert.equal(current.accepted, true);
assert.deepEqual(current.task, { status: 'Archived', version: 20 });

// Reusing that now-old base version must fail, even if the payload differs.
assert.equal(save(current.task, {
  expectedVersion: 19, patch: { status: 'Doing' }
}).accepted, false);
console.log('PASS: stale writes rejected and current writes accepted.');

// In production, compare expectedVersion and write in ONE atomic database
// operation. This sequential in-memory example does not test a real database.
