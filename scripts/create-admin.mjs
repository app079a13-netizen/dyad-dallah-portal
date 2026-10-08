import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  const username = "admin";
  const password = "admin123";
  const passwordHash = await bcrypt.hash(password, 10);

  try {
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
