import type { CollectionConfig } from "payload";
import { APIError } from "payload";

/**
 * Top-level service categories — the 5 cards on the home Services grid
 * (Web Development, Digital Marketing, Automation, CRM Development, AI
 * Solutions). Each one owns a dedicated /services/[slug] page built from
 * its hero fields plus the SubServices that point back at it.
 */
export const Services: CollectionConfig = {
  slug: "services",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "order", "published"],
  },
  access: {
    read: () => true,
  },
  versions: { drafts: true },
  hooks: {
    // SubServices.parentService is a required, non-nullable relationship
    // with a DB-level "ON DELETE SET NULL" foreign key — a genuine conflict
    // (the column can't be both NOT NULL and nulled by the FK action), so
    // deleting a Service that still has SubServices currently fails with a
    // raw SQLite constraint error. This turns that into a clear, actionable
    // message instead of an unhandled 500, and — either way — no data is
    // ever silently orphaned or deleted.
    beforeDelete: [
      async ({ req, id }) => {
        const { totalDocs } = await req.payload.count({
          collection: "sub-services",
          where: { parentService: { equals: id } },
          req,
        });
        if (totalDocs > 0) {
          throw new APIError(
            `Cannot delete this service — ${totalDocs} sub-service${totalDocs === 1 ? "" : "s"} still ` +
              `reference it. Reassign or delete ${totalDocs === 1 ? "it" : "them"} first.`,
            400
          );
        }
      },
    ],
  },
  fields: [
    { name: "published", type: "checkbox", defaultValue: true },
    {
      name: "order",
      type: "number",
      required: true,
      defaultValue: 0,
      admin: { description: "Lower numbers show first on the Services grid." },
    },
    {
      name: "displayIndex",
      type: "text",
      required: true,
      defaultValue: "01",
      admin: { description: 'Shown on the card, e.g. "01".' },
    },
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "URL segment — /services/THIS-VALUE" },
    },
    {
      name: "shortDesc",
      type: "textarea",
      required: true,
      admin: { description: "One line shown on the home page card." },
    },
    {
      name: "tags",
      type: "array",
      labels: { singular: "Tag", plural: "Tags" },
      fields: [{ name: "value", type: "text", required: true }],
    },
    { name: "heroEyebrow", type: "text", defaultValue: "Service" },
    { name: "heroTitle", type: "text", required: true },
    { name: "heroSubtitle", type: "textarea" },
    {
      name: "idealFor",
      type: "text",
      admin: { description: "One line: who this service is actually for." },
    },
    {
      name: "differentiator",
      type: "textarea",
      admin: { description: "Why Linzido specifically for this discipline — not a tool list." },
    },
    {
      name: "seo",
      type: "group",
      fields: [
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
      ],
    },
  ],
};
