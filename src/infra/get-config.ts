import dotenv from "dotenv";
import { z } from "zod";
import fs, { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { homedir } from "node:os";

const readSchema = z.strictObject({
  NODE_PORT: z.coerce.number().optional(),
  LOG_LEVEL: z
    .enum(["error", "warn", "info", "http", "verbose", "debug", "silly"])
    .optional(),
  DATABASE_URL: z.string(),
  DATABASE_CA_CRT: z.string().optional(),
  NODE_ENV: z.enum(["production", "development"]).default("development"),
});

const getConfigValues = () => {
  const DATABASE_URL = process.env.DATABASE_URL;
  const NODE_PORT = process.env.NODE_PORT;
  const LOG_LEVEL = process.env.LOG_LEVEL;
  const NODE_ENV = process.env.NODE_ENV;

  const envConfig = {
    ...(DATABASE_URL && { DATABASE_URL }),
    ...(NODE_PORT && { NODE_PORT }),
    ...(LOG_LEVEL && { LOG_LEVEL }),
    ...(NODE_ENV && { NODE_ENV }),
  };

  const dirPath = path.join(homedir(), ".data-api");
  const localDirPath = `${path.join("./config")}`;

  if (!existsSync(dirPath)) {
    mkdirSync(dirPath);
  }
  if (!existsSync(localDirPath)) {
    mkdirSync(localDirPath);
  }

  const filePath = `${path.join(dirPath, "config")}`;
  const localFilePath = `${path.join(localDirPath, "config")}`;

  if (!existsSync(filePath)) {
    writeFileSync(filePath, "");
  }
  if (!existsSync(localFilePath)) {
    writeFileSync(localFilePath, "");
  }

  const fileBuffer = fs.readFileSync(filePath, "utf8");
  const localFileBuffer = fs.readFileSync(localFilePath, "utf8");
  const fileConfig = {
    ...dotenv.parse(fileBuffer),
    ...dotenv.parse(localFileBuffer),
  };

  const config = readSchema.parse({ ...fileConfig, ...envConfig });

  return config;
};

const config = getConfigValues();
export default config;
