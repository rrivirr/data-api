import express, { NextFunction, Request, Response } from "express";
import { HttpException } from "./utils/http-exception";
import errorHandler from "./utils/error-handler";
import routes from "./routes/index";

const app = express();

app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.method === "POST" || req.method === "PATCH" || req.method === "PUT") {
    if (req.headers["content-type"] !== "application/json") {
      throw new HttpException(
        415,
        "Invalid content type. API only supports application/json"
      );
    }
  }
  next();
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(routes);
app.use(errorHandler);

export default app;
