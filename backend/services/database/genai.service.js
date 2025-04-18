import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
import { GoogleGenerativeAI } from "@google/generative-ai";
import MyError from "../../utils/error.js";

const API_KEY = process.env.API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const buildSQLPrompt = ({
    query,
    mode = "suggest",
    description = "Provide suggestions to complete this SQL query. Just complete this one query. Don't add extra characters like ` or mysql or anything",
    schema = "Schema not provided. Use general SQL assumptions.",
    expectation = "Suggest how to enhance or complete the query. Provide only the suggestion or modified query.",
}) =>
    `
    [MODE]: ${mode}
    [DESCRIPTION]: ${description}
    [CURRENT_QUERY]: ${query}
    [SCHEMA]: ${schema}
    [EXPECTATION]: ${expectation}
`.trim();

export const getCodeSuggestion = async (prompt) => {
    const { mode, description, query, schema, expectation } = prompt;
    if (!query)
        throw new MyError(
            400,
            "SQL query is required to generate a suggestion.",
        );

    const struturedPrompt = buildSQLPrompt({
        mode,
        description,
        query,
        schema,
        expectation,
    });

    const result = await model.generateContent(struturedPrompt);
    const response = result.response;
    const text = response.text();
    return {
        success: true,
        response: text?.trim(),
        message: "Generated SQL suggestion based on the provided prompt.",
    };
};
