import path from "node:path";
import { fileURLToPath } from "node:url";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

// Relative imports (not the "@/*" alias) so this config resolves identically
// whether it's loaded by Next.js (webpack/turbopack) or the standalone
// `payload` CLI running under Node's native ESM resolution.
import { Media } from "./payload/collections/Media";
import { Users } from "./payload/collections/Users";
import { Services } from "./payload/collections/Services";
import { SubServices } from "./payload/collections/SubServices";
import { Projects } from "./payload/collections/Projects";
import { TeamMembers } from "./payload/collections/TeamMembers";
import { Testimonials } from "./payload/collections/Testimonials";
import { ProcessSteps } from "./payload/collections/ProcessSteps";
import { Faqs } from "./payload/collections/Faqs";
import { Leads } from "./payload/collections/Leads";
import { CompanySettings } from "./payload/globals/CompanySettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Admin backend for the Linzido company site. SQLite locally (zero setup);
 * swap DATABASE_URI to a Postgres/Supabase connection string in production —
 * the adapter below is the only line that changes (see README).
 */
export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " — Linzido Admin",
    },
    components: {
      graphics: {
        Icon: "@/components/admin/Branding#Icon",
        Logo: "@/components/admin/Branding#Logo",
      },
    },
  },
  // Namespaced away from /api/* so Payload's REST/GraphQL routes can never
  // collide with the site's own API routes (e.g. /api/contact).
  routes: {
    api: "/api/payload",
  },
  editor: lexicalEditor(),
  collections: [
    Users,
    Media,
    Services,
    SubServices,
    Projects,
    TeamMembers,
    Testimonials,
    ProcessSteps,
    Faqs,
    Leads,
  ],
  globals: [CompanySettings],
  // Deliberately no `|| ""` fallback — Payload signs every admin session JWT
  // with this value, so a missing env var must fail the boot loudly rather
  // than silently start signing tokens with an empty, guessable secret.
  secret: (() => {
    if (!process.env.PAYLOAD_SECRET) {
      throw new Error(
        "PAYLOAD_SECRET is not set. Refusing to start with an empty JWT-signing secret."
      );
    }
    return process.env.PAYLOAD_SECRET;
  })(),
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || "file:./payload.db",
    },
    // WAL allows concurrent readers alongside a writer (e.g. an admin edit
    // landing at the same moment as a contact-form POST) instead of the
    // default rollback-journal mode, which can return "database is locked"
    // under exactly that overlap.
    wal: true,
    // Schema changes reach production only through reviewable migration
    // files in here (see MIGRATIONS.md) — Payload already skips auto-push
    // whenever NODE_ENV === "production", so this only affects where
    // `payload migrate:create` writes files and where `payload migrate`
    // reads them from. Local dev is untouched: it keeps auto-pushing schema
    // changes on save, same as before.
    migrationDir: path.resolve(dirname, "payload/migrations"),
  }),
  sharp,
});
