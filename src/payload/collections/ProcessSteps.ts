import type { CollectionConfig } from "payload";

export const ProcessSteps: CollectionConfig = {
  slug: "process-steps",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["step", "title", "order"],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: "order", type: "number", required: true, defaultValue: 0 },
    { name: "step", type: "text", required: true, admin: { description: 'e.g. "01"' } },
    { name: "title", type: "text", required: true },
    { name: "body", type: "textarea", required: true },
  ],
};
