import { Request, Response } from "express";
import { readingsQuerySchema } from "./schema";
import * as readingService from "../../service/reading.service";
import { stringify } from "csv-stringify/sync";
import { HttpException } from "../../utils/http-exception";

export const queryReadings = async (req: Request, res: Response) => {
  const { format, ...query } = readingsQuerySchema.parse(req.body);
  const readings = await readingService.getReadingsInWindows(query);
  const first = query.windows[0];
  const last = query.windows[query.windows.length - 1];
  const fileName = `${first.eui}_${first.start.toISOString()}_${
    last.end?.toISOString() || ""
  }_readings`;

  const formattedReadings = readings.map(({ values, time }) => ({
    ...(values as object),
    timestamp: time.toISOString(),
  }));

  if (format === "json") {
    return res.json(formattedReadings);
  }

  if (!formattedReadings.length) {
    throw new HttpException(404, "no data found for the specified parameters");
  }

  const csv = stringify(formattedReadings, { header: true });
  res.writeHead(200, {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename=${fileName}.csv`,
  });
  res.end(Buffer.from(csv));
};
