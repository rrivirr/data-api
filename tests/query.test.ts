import { describe, expect, it, vi } from "vitest";

/** Queries the repository sends; a dummy driver runs nothing and returns no rows. */
const { queries } = vi.hoisted(() => ({
  queries: [] as { sql: string; parameters: readonly unknown[] }[],
}));

vi.mock("../src/infra/db/db", async () => {
  const {
    DummyDriver,
    Kysely,
    PostgresAdapter,
    PostgresIntrospector,
    PostgresQueryCompiler,
  } = await import("kysely");
  return {
    db: new Kysely({
      dialect: {
        createAdapter: () => new PostgresAdapter(),
        createDriver: () => new DummyDriver(),
        createIntrospector: (db) => new PostgresIntrospector(db),
        createQueryCompiler: () => new PostgresQueryCompiler(),
      },
      log: (event) => {
        if (event.level === "query") queries.push(event.query);
      },
    }),
  };
});

import { getReadingsInWindows } from "../src/repository/reading.repository";

describe("getReadingsInWindows", () => {
  it("ORs one clause per window, matching the EUI exactly", async () => {
    const start = new Date("2026-01-02T00:00:00.000Z");
    const end = new Date("2026-01-06T00:00:00.000Z");
    const open = new Date("2026-01-10T00:00:00.000Z");
    await getReadingsInWindows({
      windows: [
        { eui: "aBc1", start, end },
        { eui: "E2", start: open, end: null },
      ],
      limit: 50,
      offset: 10,
      order: "asc",
    });

    expect(queries).toHaveLength(1);
    expect(queries[0].sql).toBe(
      'select "time", "values" from "events" where (("eui" = $1 and "time" >= $2 and "time" <= $3) or ("eui" = $4 and "time" >= $5)) order by "created_at" asc limit $6 offset $7',
    );
    expect(queries[0].parameters).toEqual(["aBc1", start, end, "E2", open, 50, 10]);
  });
});
