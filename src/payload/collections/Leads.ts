import type { CollectionConfig } from "payload";

/**
 * Contact-form submissions. The public /api/contact route creates these
 * (in addition to emailing/Supabase, if configured) so every enquiry is
 * visible in one place in the admin — nothing arrives only in an inbox
 * nobody is watching.
 */
export const Leads: CollectionConfig = {
  slug: "leads",
  // Leads are customer inquiries — irreplaceable once gone (unlike Services/
  // Projects content, which an admin can always re-enter). An accidental
  // delete here should be recoverable, so this is the one collection where
  // soft-delete earns its complexity: deletes move the doc to Payload's
  // built-in trash view (with a `deletedAt` timestamp) instead of removing
  // it outright; permanent deletion is still available from that view.
  trash: true,
  defaultSort: "-receivedAt",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "company", "status", "receivedAt"],
  },
  access: {
    // Leads contain contact details — never publicly readable or writable
    // over the REST/GraphQL API. The public contact form never talks to
    // this collection directly — it POSTs to /api/contact, which uses the
    // Payload Local API (payload.create), and Payload's Local API defaults
    // to overrideAccess: true, so it's unaffected by this restriction.
    // Before this fix, `create: () => true` left a second, completely
    // unvalidated and unrate-limited public write path straight into this
    // collection via POST /api/payload/leads, bypassing every check
    // (honeypot, rate limit, length limits) that route enforces.
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "company", type: "text" },
    { name: "message", type: "textarea", required: true },
    { name: "receivedAt", type: "date", required: true, defaultValue: () => new Date().toISOString() },
    {
      name: "status",
      type: "select",
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "Contacted", value: "contacted" },
        { label: "Won", value: "won" },
        { label: "Lost", value: "lost" },
      ],
    },
  ],
};
