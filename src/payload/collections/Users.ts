import type { CollectionConfig } from "payload";

/** Admin login accounts. This is the only auth-enabled collection. */
export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    // Payload's own default is `secure: false` on the admin session cookie
    // unless overridden — real risk once this runs on real HTTPS. `false`
    // stays for local dev, where the browser would silently drop a Secure
    // cookie over plain http://localhost and lock you out of /admin.
    cookies: { secure: process.env.NODE_ENV === "production" },
  },
  admin: {
    useAsTitle: "email",
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
  ],
};
