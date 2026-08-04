import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { getPool } from "./connection";

export const db = drizzle(getPool(), { schema });
