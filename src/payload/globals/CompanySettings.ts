import type { GlobalConfig } from "payload";

/**
 * Single-record company info — replaces the old SITE/TIMELINE/METRICS/TECH
 * exports from src/lib/site.ts. Edited from one admin screen instead of code.
 */
export const CompanySettings: GlobalConfig = {
  slug: "company-settings",
  access: {
    read: () => true,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Company",
          fields: [
            { name: "name", type: "text", required: true, defaultValue: "Linzido" },
            { name: "tagline", type: "text", required: true },
            { name: "description", type: "textarea", required: true },
            {
              name: "story",
              type: "textarea",
              admin: {
                description:
                  "The fuller company narrative shown on /about — separate paragraphs, blank line between each. Keep it to real, verifiable facts.",
              },
            },
            { name: "email", type: "email", required: true },
            { name: "location", type: "text" },
            {
              name: "officeAddress",
              type: "text",
              admin: { description: "Physical office address, shown in Contact and Footer." },
            },
            {
              name: "phone",
              type: "text",
              admin: {
                description:
                  "Contact/WhatsApp number, digits only with country code (e.g. 923238579399) — used to build both the tel: and wa.me links.",
              },
            },
            { name: "url", type: "text", required: true },
            { name: "founderName", type: "text" },
            {
              name: "founderNote",
              type: "textarea",
              admin: { description: "Short first-person note from the founder, shown on /about." },
            },
          ],
        },
        {
          label: "Journey",
          fields: [
            {
              name: "timeline",
              type: "array",
              labels: { singular: "Milestone", plural: "Timeline" },
              fields: [
                { name: "year", type: "text", required: true },
                { name: "title", type: "text", required: true },
                { name: "body", type: "textarea", required: true },
              ],
            },
          ],
        },
        {
          label: "Metrics",
          fields: [
            {
              name: "metrics",
              type: "array",
              fields: [
                { name: "value", type: "number", required: true },
                { name: "suffix", type: "text", defaultValue: "" },
                { name: "label", type: "text", required: true },
              ],
            },
          ],
        },
        {
          label: "Tech stack",
          fields: [
            {
              name: "tech",
              type: "array",
              fields: [{ name: "value", type: "text", required: true }],
            },
          ],
        },
        {
          label: "Socials",
          fields: [
            {
              name: "socials",
              type: "array",
              fields: [
                { name: "label", type: "text", required: true },
                {
                  name: "href",
                  type: "text",
                  admin: { description: "Leave empty to hide this profile from the site." },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
