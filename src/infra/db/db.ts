import { DB } from "./db.types";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import config from "../get-config";

const dbCA = config.DATABASE_CA_CRT;
const ca = dbCA
  ? `${dbCA.replace(/\s(?!CERTIFICATE)/g, "\n").trim()}\n`
  : undefined;

const connectionString = (() => {
  if (!ca) return config.DATABASE_URL;
  const url = new URL(config.DATABASE_URL);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("sslrootcert");
  return url.toString();
})();

const dialect = new PostgresDialect({
  pool: new Pool({ connectionString, ...(ca && { ssl: { ca } }) }),
});

export const db = new Kysely<DB>({
  dialect,
});
