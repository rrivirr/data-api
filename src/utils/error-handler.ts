import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import logger from "../winston";
import { HttpException } from "./http-exception";

export default (
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const errorLogger = logger.child({ source: "errorHandler" });
  if (err instanceof HttpException) {
    res.status(err.code).send({
      code: err.code,
      message: err.message,
    });
  } else if (err instanceof ZodError) {
    res.status(422).send({
      code: 422,
      message: err.issues.map(
        ({ path, message }) => `field: ${path}; error: ${message}`
      ),
    });
  } else {
    errorLogger.error(err);
    errorLogger.error(err?.stack);

    res.status(500).send({
      code: 500,
      message: `Internal Server Error`,
    });
  }
};
