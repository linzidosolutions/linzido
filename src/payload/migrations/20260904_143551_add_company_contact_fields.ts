import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`company_settings\` ADD \`office_address\` text;`)
  await db.run(sql`ALTER TABLE \`company_settings\` ADD \`phone\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`company_settings\` DROP COLUMN \`office_address\`;`)
  await db.run(sql`ALTER TABLE \`company_settings\` DROP COLUMN \`phone\`;`)
}
