import { DB } from "./db.types";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import config from "../get-config";

const dialect = new PostgresDialect({
  pool: new Pool({ connectionString: config.DATABASE_URL }),
});

export const db = new Kysely<DB>({
  dialect,
});
