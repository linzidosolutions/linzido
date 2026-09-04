import { getPayload } from "payload";
import config from "../src/payload.config";

/**
 * One-off local dev helper: resets the existing admin user's password.
 * Usage: npx payload run scripts/reset-admin.ts -- "NewPassword123!"
 */
async function run() {
  const newPassword = process.argv[2];
  if (!newPassword || newPassword.length < 8) {
    console.error("Usage: npx payload run scripts/reset-admin.ts -- <new-password (8+ chars)>");
    process.exit(1);
  }

  const payload = await getPayload({ config });
  const users = await payload.find({ collection: "users", limit: 1 });
  const user = users.docs[0];
  if (!user) {
    console.log("No user found.");
    process.exit(1);
  }
  await payload.update({
    collection: "users",
    id: user.id,
    data: { password: newPassword },
  });
  console.log("Password reset for:", user.email);
  process.exit(0);
}

run();
