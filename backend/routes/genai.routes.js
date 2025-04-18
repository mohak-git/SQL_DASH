import { Router } from "express";
import { handleGetCodeSuggestions } from "../controller/genai.controller.js";

const router = Router();

router.route("/suggest").post(handleGetCodeSuggestions);

export default router;
