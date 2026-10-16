import { db } from "../infra/db/db";
import type { ReadingsQuery, ReadingWindow } from "../handler/reading/schema";

export const getReadingsInWindows = async (
  query: Omit<ReadingsQuery, "format">,
) => {
  const { windows, limit, offset, order } = query;
  return await db
    .selectFrom("events")
    .where((eb) =>
      eb.or(
        windows.map((window: ReadingWindow) =>
          eb.and([
            eb("eui", "=", window.eui),
            eb("time", ">=", window.start),
            ...(window.end ? [eb("time", "<=", window.end)] : []),
          ]),
        ),
      ),
    )
    .orderBy("created_at", order)
    .limit(limit)
    .offset(offset)
    .select(["time", "values"])
    .execute();
};
