import { handleDBConnection } from "../controller/db.controllers.js";
import { Router } from "express";

const router = Router();

router.route("/connect-db").post(handleDBConnection);

export default router;
