import express from "express";
import { queryReadings } from "../handler/reading/handler";

const router = express.Router();
const routerWrapper = express.Router();

router.post("/", queryReadings);

routerWrapper.use("/readings", router);

export default routerWrapper;
