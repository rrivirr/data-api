import z from "zod";

export const getPaginationSchema = (
  orderByAllowedFields: [string, ...string[]],
  defaultOrderByValue: string
) =>
  z.strictObject({
    limit: z.coerce.number().int().min(1).max(100).optional().default(100),
    offset: z.coerce.number().int().min(0).max(100).optional().default(0),
    order: z.enum(["asc", "desc"]).optional().default("desc"),
    orderBy: z
      .enum(orderByAllowedFields)
      .optional()
      .default(defaultOrderByValue),
  });

export const euiSchema = z.strictObject({ eui: z.string() });
