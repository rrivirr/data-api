import winston from "winston";
import config from "./infra/get-config";

const logLevel = config.LOG_LEVEL ?? "info";

const logger = winston.createLogger({
  level: logLevel,
  transports: [
    new winston.transports.Console({
      format: winston.format.logstash(),
    }),
  ],
});

export default logger;
