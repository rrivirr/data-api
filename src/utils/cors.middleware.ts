import { NextFunction, Request, Response } from "express";

const DEFAULT_ALLOWED_ORIGINS = "http://localhost:5173, https://*.rriv.org";

const allowedOriginPatterns = DEFAULT_ALLOWED_ORIGINS.split(",").map((origin) =>
  origin.trim(),
);

const matchesOrigin = (origin: string, pattern: string): boolean => {
  if (origin === pattern) return true;

  if (pattern.includes("*")) {
    const escaped = pattern
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\*/g, "[^.]+");

    const regex = new RegExp(`^${escaped}$`, "i");
    return regex.test(origin);
  }

  return false;
};

const isOriginAllowed = (origin: string): boolean =>
  allowedOriginPatterns.some((pattern) => matchesOrigin(origin, pattern));

export const corsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const rawOrigin = req.headers["origin"];
  const origin = typeof rawOrigin === "string" ? rawOrigin : undefined;

  if (!origin || !isOriginAllowed(origin)) {
    return next();
  }

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization,Content-Type,Accept",
  );
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
};
