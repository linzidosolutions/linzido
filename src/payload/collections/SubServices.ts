import type { CollectionConfig } from "payload";

/**
 * The specific offerings inside a service category — e.g. under "Web
 * Development": Custom Websites, Web Management, E-commerce. Rendered as
 * cards on the parent Service's /services/[slug] page.
 */
export const SubServices: CollectionConfig = {
  slug: "sub-services",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "parentService", "order"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "parentService",
      type: "relationship",
      relationTo: "services",
      required: true,
      hasMany: false,
    },
    { name: "order", type: "number", required: true, defaultValue: 0 },
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      // Not currently used for routing (sub-services are rendered inline on
      // their parent Service's page, not their own route) — global
      // uniqueness is set anyway for the same reason every other slug field
      // in this project has it: it's the cheapest guard against two admin
      // entries silently colliding if a route ever does key off this later.
      // Verified zero duplicates across all 17 existing records before
      // adding this constraint.
      unique: true,
    },
    {
      name: "desc",
      type: "textarea",
      required: true,
      admin: { description: "One line — what this offering actually is." },
    },
    {
      name: "problem",
      type: "textarea",
      admin: { description: "The specific situation that makes a business need this." },
    },
    {
      name: "value",
      type: "textarea",
      admin: { description: "Why it's worth doing — the business reasoning, not a feature list." },
    },
    {
      name: "features",
      type: "array",
      labels: { singular: "Feature", plural: "Features" },
      fields: [{ name: "value", type: "text", required: true }],
    },
    {
      name: "outcome",
      type: "textarea",
      admin: { description: "What the client actually walks away with. No invented metrics." },
    },
  ],
};
