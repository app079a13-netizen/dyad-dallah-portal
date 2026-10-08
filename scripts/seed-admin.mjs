import bcrypt from "bcryptjs";

// Generates a bcrypt hash for the supplied admin password.
const password = process.argv[2] || process.env.ADMIN_PASSWORD;
if (!password) {
  console.error(
    "Usage: node scripts/seed-admin.mjs <password>  (or set ADMIN_PASSWORD)"
  );
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
console.log("Hash:", hash);
