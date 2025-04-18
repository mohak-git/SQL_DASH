import { Router } from "express";
import { handleRawQuery } from "../controller/query.controller.js";

const router = Router();

router.route("/execute").post(handleRawQuery);

export default router;
