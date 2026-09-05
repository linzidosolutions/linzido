import type { CollectionConfig } from "payload";

/**
 * Featured work. Mirrors the shape the frontend Work section and the
 * /work/[slug] case-study page already expect (see src/lib/site.ts's old
 * Project type) so the swap from static data to this collection needs no
 * component changes — only the data source changes.
 */
export const Projects: CollectionConfig = {
  slug: "projects",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "year", "featured", "order"],
  },
  access: {
    read: () => true,
  },
  versions: { drafts: true },
  fields: [
    { name: "published", type: "checkbox", defaultValue: true },
    { name: "order", type: "number", required: true, defaultValue: 0 },
    { name: "featured", type: "checkbox", defaultValue: false },
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "URL segment — /work/THIS-VALUE" },
    },
    { name: "category", type: "text", required: true },
    { name: "year", type: "text", required: true },
    { name: "desc", type: "textarea", required: true },
    {
      name: "stack",
      type: "array",
      labels: { singular: "Technology", plural: "Stack" },
      fields: [{ name: "value", type: "text", required: true }],
    },
    {
      name: "accent",
      type: "text",
      required: true,
      defaultValue: "#4d6dff",
      admin: { description: "Hex color used for the card's generative cover." },
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      admin: { description: "Optional — omit to use the generative gradient cover." },
    },
    {
      name: "gallery",
      type: "array",
      labels: { singular: "Screenshot", plural: "Gallery" },
      admin: { description: "Optional — real product screenshots, shown as a slider on the case study page." },
      fields: [{ name: "image", type: "upload", relationTo: "media", required: true }],
    },
    {
      name: "liveUrl",
      type: "text",
      admin: {
        description:
          "The client's live site — card links here when set. https:// is added automatically if omitted.",
      },
      hooks: {
        // A bare domain (e.g. "example.com") saves as a same-site relative
        // link instead of an external one — the case study page's "Visit
        // site" link would then point at /work/example.com instead of
        // leaving the site.
        beforeChange: [
          ({ value }) => {
            if (typeof value !== "string") return value;
            const trimmed = value.trim();
            if (!trimmed) return trimmed;
            return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
          },
        ],
      },
    },
    {
      name: "study",
      type: "group",
      admin: { description: "Case study body. Leave problem/approach empty to omit the /work/[slug] page." },
      fields: [
        {
          name: "context",
          type: "textarea",
          admin: { description: "What was actually being built, and for whom." },
        },
        { name: "problem", type: "textarea" },
        { name: "approach", type: "textarea" },
        { name: "role", type: "text" },
        {
          name: "solution",
          type: "textarea",
          admin: { description: "What was actually implemented — the concrete system, not the pitch." },
        },
        {
          name: "highlights",
          type: "array",
          labels: { singular: "Highlight", plural: "Highlights" },
          admin: { description: "Optional — specific, real features worth calling out individually." },
          fields: [{ name: "value", type: "text", required: true }],
        },
        {
          name: "outcomes",
          type: "array",
          labels: { singular: "Result", plural: "Results" },
          admin: { description: "Only include a result if it's true. No invented metrics." },
          fields: [{ name: "value", type: "text", required: true }],
        },
      ],
    },
  ],
};
