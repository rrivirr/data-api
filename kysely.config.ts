import { defineConfig, getKnexTimestampPrefix } from "kysely-ctl";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

export default defineConfig({
  kysely: new Kysely<any>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString: process.env.DATABASE_URL }),
    }),
  }),
  migrations: {
    migrationFolder: "src/infra/db/migrations",
    getMigrationPrefix: getKnexTimestampPrefix,
  },
  seeds: {
    seedFolder: "src/infra/db/seeds",
  },
});
