import type { CollectionConfig } from "payload";

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "title", "order"],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: "order", type: "number", required: true, defaultValue: 0 },
    { name: "quote", type: "textarea", required: true },
    { name: "name", type: "text", required: true },
    { name: "title", type: "text", required: true },
  ],
};
