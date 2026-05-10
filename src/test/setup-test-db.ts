import { randomUUID } from "crypto";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { join } from "path";

export type TestDbContext = {
  pool: Pool;
  db: NodePgDatabase<typeof schema>;
  testDbName: string;
};

const adminDbUrl = process.env.ADMIN_DB_URL;

export async function createTestDb(): Promise<TestDbContext> {
  const testDbName = `test_db_${randomUUID().replace(/-/g, "")}`;
  const testDbUrl = `postgresql://user:password@localhost:5432/${testDbName}`;

  const adminPool = new Pool({ connectionString: adminDbUrl });
  await adminPool.query(`CREATE DATABASE "${testDbName}"`); // creating new database using Admin connection
  await adminPool.end(); // and then closing the connection

  const pool = new Pool({
    connectionString: testDbUrl,
    max: 10,
    idleTimeoutMillis: 30000,
  });
  const db = drizzle(pool, { schema, casing: "snake_case" });
  await migrate(db, { migrationsFolder: join(__dirname, "../db/drizzle") });

  return { pool, db, testDbName };
}

export async function destroyTestDb({ pool, testDbName }: TestDbContext) {
  await pool.end(); // closing test db connection

  const adminPool = new Pool({ connectionString: adminDbUrl });

  // closing any active test connections left
  await adminPool.query(
    `
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = $1 AND pid <> pg_backend_pid()
    `,
    [testDbName],
  );

  //deleting the test database
  await adminPool.query(`DROP DATABASE IF EXISTS "${testDbName}"`);
  await adminPool.end();
}
