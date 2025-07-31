import { QueryReadingsDto } from "../types/reading.types";
import * as readingRepository from "../repository/reading.repository";

export const getReadings = async (query: QueryReadingsDto) => {
  return await readingRepository.getReadings(query);
};
