# Database migrations, backups & production readiness

This documents the workflow introduced by the 2026-09-02 database integrity
remediation (DB-001 through DB-006). It replaces nothing that was already
working — local dev is unchanged — it only adds what production needs and
didn't have.

## Production database: SQLite (confirmed, not changed)

`docker-compose.yml` is the only real deployment artifact in this repo, and
it runs a single container with the SQLite file and `public/media` persisted
via named Docker volumes — there is no Postgres service configured or
connected anywhere. That makes SQLite the actual, currently-intended
production database, not just a dev convenience.

For this application's real workload — a company site with one admin
editing content occasionally and a public contact form — that's
appropriate: SQLite handles many concurrent readers plus one writer fine,
which is the site's actual traffic shape. `wal: true` was added to the
adapter config (`src/payload.config.ts`) specifically so an admin save and a
contact-form POST landing at the same moment don't hit a "database is
locked" error under the older rollback-journal mode.

**Switch to Postgres only if this changes** — multiple concurrent editors,
heavy write volume, or a need to run more than one app instance against the
same database (SQLite is single-file, single-host). If that happens, the
adapter swap is still just the one line documented in `.env.example` and
`src/payload.config.ts`'s comments; nothing else in this document needs to
change.

## Migrations (DB-001)

Previously, schema changes only ever happened via Payload's auto-push
(`db.push`), which **Payload itself already disables in production**
(`NODE_ENV === "production"` — see `@payloadcms/db-sqlite`'s `connect.js`).
The problem that created: with zero migrations ever generated, a fresh
production database had **no way to get its schema at all** — push is off,
and there was nothing else to apply it. That's the state this fixes.

- `migrationDir` is now set (`src/payload/migrations`).
- `20260902_125635_baseline.ts` — the full current schema (36 tables), for
  a first deploy against an empty production database.
- `20260902_125911_db_integrity_remediation.ts` — the two schema changes
  from this remediation pass (see below). Purely additive: a new nullable
  column and two new indexes, nothing dropped or altered destructively.

**Local dev is unchanged.** It still auto-pushes on save — fast iteration
was never the problem, only production's lack of any schema-apply
mechanism was. Do not set `push: false` for dev; that would slow down
every future field change for no benefit this project needs.

**Workflow going forward:**
```bash
# After changing a collection/global field:
npm run migrate:create   # generates a reviewable migration file — inspect it
npm run migrate:status   # see what's pending
npm run migrate          # apply pending migrations (production, or a fresh env)
```

**First production deploy, or any deploy against a database that has never
run a migration**, must run `npm run migrate` once before (or as part of)
starting the app — a fresh database has no tables otherwise. See the
deployment checklist below for the exact command against Docker.

## Backups (DB-002)

`npm run backup` (`src/payload/backup.ts`) creates a consistent snapshot via
SQLite's `VACUUM INTO` — not a plain file copy, which can capture a torn,
inconsistent state if the database is in WAL mode with pending writes.
Verified working: it produces a valid, independently-queryable `.db` file
with the full table set and data intact.

- **Location**: `backups/` next to the live database file (inside the
  `sqlite-data` Docker volume in production, so it survives container
  restarts the same way the live database does).
- **Frequency**: not scheduled by this repo (there's no cron/task-runner
  infrastructure here to hook into) — run it on a schedule via the host's
  own scheduler. See "Manual action required" below.
- **Retention**: keeps the most recent 14 backups by default
  (`BACKUP_RETENTION_COUNT` env var to change it), deleting older ones.
- **Restore procedure**: stop the app, replace the live database file with
  a chosen backup file, restart:
  ```bash
  docker compose stop web
  cp backups/payload-<timestamp>.db payload.db   # inside the sqlite-data volume
  docker compose start web
  ```
- **Verification**: a backup is only proven good if it's been test-restored
  at least once — do this periodically, not just when a real restore is
  needed for the first time.
- **RPO/RTO**: with daily backups, worst-case data loss (RPO) is just under
  24h of admin edits and lead submissions. Restore itself (RTO) is a file
  copy plus a container restart — a few minutes. For a low-traffic company
  site with occasional admin edits, this is an appropriate, low-complexity
  match for the actual risk — not a guess.
- **Encryption**: the backup file has the same sensitivity as the live
  database (it contains Lead contact details) — store it wherever the host
  already secures the live volume; don't copy it somewhere less protected
  than the original.

**Manual action required**: scheduling `npm run backup` to actually run
periodically (e.g. a host-level cron entry or Task Scheduler job pointed at
the deployed container, or a sidecar in whatever hosting platform is used)
is outside this repo's control — no such infrastructure exists yet, and
this document does not claim otherwise. Set it up on whatever host actually
runs the container.

## Relationship integrity (DB-003)

`sub_services.parent_service_id` is `required: true` at the Payload level,
but its DB-level foreign key is `ON DELETE SET NULL` (Payload's default for
a plain, non-array relationship field) — a genuine conflict: SQLite can't
satisfy "set to null" and "never null" at once. Confirmed directly against
the live database: deleting a referenced Service already fails with
`SQLITE_CONSTRAINT_NOTNULL` — so no orphan was ever silently created, but
the failure was a raw, unhandled SQL error.

Fixed with a `beforeDelete` hook on `Services` (`src/payload/collections/Services.ts`)
that checks for referencing SubServices first and throws a clear, actionable
`APIError` instead — same outcome (nothing is ever orphaned or lost), a
readable message instead of a crash. Verified directly against the actual
hook function: blocks when dependents exist, allows deletion when none do.

`Faqs.relatedService` is optional by design ("leave empty for a general
FAQ") and its column is correctly nullable — `ON DELETE SET NULL` there is
the *intended* behavior, not a bug, so it was left as-is.

**No orphans found**: 0 Faqs and 0 Leads exist yet, and every one of the 17
existing SubServices correctly resolves to one of the 5 existing Services —
confirmed by direct query, not assumption.

## Unique constraint (DB-004)

`SubServices.slug` is not used for routing or lookup anywhere in the
codebase today (sub-services render inline on their parent Service's page,
keyed by array index — never their own route or `find`-by-slug call), so
neither a global nor parent-scoped constraint was required for correctness.

Added a global `unique: true` anyway, matching every other slug field in
this project (Services.slug, Projects.slug) — cheap, consistent, and
guards against two admin entries silently colliding if a route ever keys
off this field later. **Verified zero duplicates** across all 17 existing
records (via direct query) before adding it, and verified the resulting
constraint actually rejects a duplicate at the database level.

## Soft delete (DB-006)

Enabled Payload's built-in `trash: true` only on **Leads**
(`src/payload/collections/Leads.ts`) — customer inquiries are the one
collection here where accidental deletion is irreversible and has real
business cost (a lost sales inquiry can't be re-entered by an admin the way
a mistakenly-deleted service description can). Deletes now move a Lead to
Payload's trash view (with a `deletedAt` timestamp) instead of removing it
outright; permanent deletion is still available from that view when wanted.

Not enabled elsewhere — Services, SubServices, Projects, etc. are
recreatable content an admin fully controls, and the audit's own guidance
was to add this only where it provides genuine business value, not
everywhere for its own sake.
