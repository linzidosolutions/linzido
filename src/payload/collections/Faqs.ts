import type { CollectionConfig } from "payload";

/** Optional per-service FAQ, shown on /services/[slug] when relatedService matches. */
export const Faqs: CollectionConfig = {
  slug: "faqs",
  admin: {
    useAsTitle: "question",
    defaultColumns: ["question", "relatedService", "order"],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: "order", type: "number", required: true, defaultValue: 0 },
    { name: "question", type: "text", required: true },
    { name: "answer", type: "textarea", required: true },
    {
      name: "relatedService",
      type: "relationship",
      relationTo: "services",
      admin: { description: "Leave empty for a general FAQ shown on more than one page." },
    },
  ],
};
