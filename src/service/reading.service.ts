import type { ReadingsQuery } from "../handler/reading/schema";
import * as readingRepository from "../repository/reading.repository";

export const getReadingsInWindows = async (
  query: Omit<ReadingsQuery, "format">,
) => {
  return await readingRepository.getReadingsInWindows(query);
};
