import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.dekeoqlowiozsjpsqdsl:9I1er0NtdwzcZ81H@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
