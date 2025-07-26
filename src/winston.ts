import winston from "winston";

const logLevel = process.env.LOG_LEVEL ?? "info";

const logger = winston.createLogger({
  level: logLevel,
  transports: [
    new winston.transports.Console({
      format: winston.format.logstash(),
    }),
  ],
});

export default logger;
