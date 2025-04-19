import { getCodeSuggestion } from "../services/genai.service.js";
import asyncHandler from "../utils/asyncHandler.js";
export const handleGetCodeSuggestions = asyncHandler(async (req, res) => {
    const { prompt } = req.body;
    const response = await getCodeSuggestion(prompt);
    return res.status(200).json(response);
});
