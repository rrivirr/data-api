import express from "express";
import { getReadings } from "../handler/reading/handler";

const router = express.Router();
const routerWrapper = express.Router();

router.route("/:eui").get(getReadings);

routerWrapper.use("/readings", router);

export default routerWrapper;
