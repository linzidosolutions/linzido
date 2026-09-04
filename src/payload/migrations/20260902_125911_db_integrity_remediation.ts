import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`leads\` ADD \`deleted_at\` text;`)
  await db.run(sql`CREATE INDEX \`leads_deleted_at_idx\` ON \`leads\` (\`deleted_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`sub_services_slug_idx\` ON \`sub_services\` (\`slug\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX \`sub_services_slug_idx\`;`)
  await db.run(sql`DROP INDEX \`leads_deleted_at_idx\`;`)
  await db.run(sql`ALTER TABLE \`leads\` DROP COLUMN \`deleted_at\`;`)
}
