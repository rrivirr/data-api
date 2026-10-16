import { NextFunction, Request, Response } from "express";
import { verifyJwtToken } from "../infra/jwt";
import { HttpException } from "./http-exception";

export const jwtMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers["authorization"];
  if (!authorization?.startsWith("Bearer ")) {
    throw new HttpException(401, "invalid access token");
  }
  const decoded = await verifyJwtToken(authorization.slice("Bearer ".length));
  if (decoded.azp !== "data-api") {
    throw new HttpException(403, "access to resource denied");
  }
  next();
};
