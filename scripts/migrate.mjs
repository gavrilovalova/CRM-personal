// Applies pending database migrations and exits. Runs in a one-off container
// from the app image before the new version starts (see deploy/deploy.sh)
import { fileURLToPath } from "node:url";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = postgres(databaseUrl, { max: 1, onnotice: () => {} });
try {
  await migrate(drizzle({ client }), {
    migrationsFolder: fileURLToPath(new URL("./drizzle", import.meta.url)),
  });
  console.log("Migrations applied");
} finally {
  await client.end();
}
