import { Request, Response } from "express";
import { readingsQuerySchema } from "./schema";
import { euiSchema } from "../generic.schema";
import * as readingService from "../../service/reading.service";
import { stringify } from "csv-stringify/sync";

export const getReadings = async (req: Request, res: Response) => {
  const params = euiSchema.parse(req.params);
  const { format, ...query } = readingsQuerySchema.parse(req.query);

  const readings = await readingService.getReadings({ ...query, ...params });

  const formattedReadings = readings.map(({ values, time }) => ({
    ...(values as object),
    timestamp: time.toISOString(),
  }));

  if (format === "json") {
    return res.json(formattedReadings);
  }

  const csv = stringify(formattedReadings, { header: true });
  const csvBuffer = Buffer.from(csv);
  const fileName = `${params.eui}_${query.rangeStart.toISOString()}_${
    query.rangeEnd?.toISOString() || ""
  }_readings`;

  res.writeHead(200, {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename=${fileName}.csv`,
  });

  res.end(csvBuffer);
};
