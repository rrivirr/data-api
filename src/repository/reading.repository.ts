import { db } from "../infra/db/db";
import { QueryReadingsDto } from "../types/reading.types";

export const getReadings = async (query: QueryReadingsDto) => {
  const { limit, order, rangeStart, rangeEnd, offset, eui } = query;
  return await db
    .selectFrom("events")
    .where("eui", "=", eui)
    .where("time", ">=", rangeStart)
    .$if(!!rangeEnd, (qb) => qb.where("time", "<=", rangeEnd!))
    .orderBy("created_at", order)
    .limit(limit)
    .offset(offset)
    .select(["time", "values"])
    .execute();
};
