import { z } from "zod";
import { readingsQuerySchema } from "../handler/reading/schema";
import { euiSchema } from "../handler/generic.schema.js";

export type QueryReadingsDto = Omit<
  z.infer<typeof readingsQuerySchema> & z.infer<typeof euiSchema>,
  "format"
>;
