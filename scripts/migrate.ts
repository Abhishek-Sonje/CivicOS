import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function runMigrations() {
  const dbUrl = process.env.DATABASE_URL || "file:local.db";
  console.log(`⏳ Running migrations on: ${dbUrl}...`);

  const client = createClient({
    url: dbUrl,
  });

  const db = drizzle(client);

  try {
    await migrate(db, {
      migrationsFolder: path.resolve(process.cwd(), "drizzle"),
    });
    console.log("✅ Migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

runMigrations();
