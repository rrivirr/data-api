import { z } from "zod";

const windowSchema = z.strictObject({
  eui: z.string().min(1),
  start: z.coerce.date(),
  end: z.coerce.date().nullable(),
});

export const readingsQuerySchema = z.strictObject({
  windows: z.array(windowSchema).min(1).max(1000),
  format: z.enum(["csv", "json"]).default("json"),
  limit: z.number().int().min(1).max(100000).default(100000),
  offset: z.number().int().min(0).default(0),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type ReadingsQuery = z.infer<typeof readingsQuerySchema>;
export type ReadingWindow = z.infer<typeof windowSchema>;
