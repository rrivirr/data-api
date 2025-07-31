import { z } from "zod";
import { getPaginationSchema } from "../generic.schema";

export const readingsQuerySchema = z
  .strictObject({
    format: z.enum(["csv", "json"]).default("json"),
    rangeStart: z.coerce.date().default(new Date(Date.now() - 5 * 60 * 1000)),
    rangeEnd: z.coerce.date().optional(),
    ...getPaginationSchema(["createdAt"], "createdAt").shape,
  })
  .check((ctx) => {
    const { rangeStart, rangeEnd } = ctx.value;
    if (rangeEnd && +rangeEnd < +rangeStart) {
      ctx.issues.push({
        code: "custom",
        message: `Date Range Validation Failed; start ${rangeStart.toISOString()}, end ${rangeEnd.toISOString()}`,
        input: ctx.value,
        path: ["rangeStart", "rangeEnd"],
      });
    }
  });
