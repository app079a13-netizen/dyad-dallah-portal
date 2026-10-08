import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 8) {
    console.error(
      "ADMIN_PASSWORD must be set and at least 8 characters long"
    );
    process.exit(1);
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await connection.execute(
      "INSERT INTO adminAccounts (username, passwordHash, displayName, isActive) VALUES (?, ?, ?, ?)",
      [username, passwordHash, "المدير العام", true]
    );
    console.log("Admin account created successfully.");
  } catch (error) {
    console.error("Error creating admin account:", error);
  } finally {
    await connection.end();
  }
}

main();
