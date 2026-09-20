# Add version checks to the task update path

## Requirements

- Preserve the user's newest edit when an older save arrives later.
- Reject stale writes with a clear, inspectable result.
- Keep the change limited to the update path.

## Acceptance checks

- A current write is accepted.
- A stale write is rejected.
- A rejected stale save leaves the stored task in `Done` at its current version.
- A current save increments the stored version; reusing its old base is rejected.
- In production, the version predicate and write execute atomically in the database.

## Proof command

node fixture.mjs
