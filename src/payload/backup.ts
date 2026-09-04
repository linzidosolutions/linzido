/**
 * Creates a consistent, point-in-time backup of the SQLite database file.
 *
 * Uses SQLite's own `VACUUM INTO` rather than a plain file copy — a raw
 * `cp` of a live database (especially in WAL mode, where recent writes can
 * sit in a separate -wal file) can copy a torn, inconsistent snapshot.
 * `VACUUM INTO` asks SQLite itself for an atomic, fully-consistent copy,
 * safe to run while the app is live. Talks to the database file directly
 * (not through Payload) since a file copy doesn't need the CMS runtime.
 *
 * Usage:  npm run backup
 * Retention: keeps the most recent BACKUP_RETENTION_COUNT files (default 14)
 * in a `backups/` directory next to the source database, deleting older ones.
 */
import { createClient } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

const BACKUP_RETENTION_COUNT = Number(process.env.BACKUP_RETENTION_COUNT) || 14;

async function main() {
  const databaseUri = process.env.DATABASE_URI || "file:./payload.db";
  if (!databaseUri.startsWith("file:")) {
    console.error(
      `DATABASE_URI ("${databaseUri}") is not a local SQLite file — this script only backs up local SQLite. ` +
        "Use your database provider's own backup mechanism instead (see MIGRATIONS.md)."
    );
    process.exit(1);
  }

  const dbPath = path.resolve(process.cwd(), databaseUri.replace(/^file:/, ""));
  if (!fs.existsSync(dbPath)) {
    console.error(`Database file not found at ${dbPath}`);
    process.exit(1);
  }

  const backupDir = path.join(path.dirname(dbPath), "backups");
  fs.mkdirSync(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, `payload-${timestamp}.db`);

  const client = createClient({ url: `file:${dbPath}` });
  await client.execute(`VACUUM INTO '${backupPath.replace(/'/g, "''")}'`);
  client.close();

  const sizeMb = (fs.statSync(backupPath).size / (1024 * 1024)).toFixed(2);
  console.log(`Backup written: ${backupPath} (${sizeMb} MB)`);

  const existing = fs
    .readdirSync(backupDir)
    .filter((f) => f.startsWith("payload-") && f.endsWith(".db"))
    .map((f) => ({ f, mtime: fs.statSync(path.join(backupDir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);

  const toDelete = existing.slice(BACKUP_RETENTION_COUNT);
  for (const { f } of toDelete) {
    fs.unlinkSync(path.join(backupDir, f));
    console.log(`Pruned old backup: ${f}`);
  }

  console.log(`Retention: keeping ${Math.min(existing.length, BACKUP_RETENTION_COUNT)} of ${existing.length} backups.`);
}

main().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
