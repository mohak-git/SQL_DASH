import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import MyError from "../utils/error.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const setupGenerativeAI = async () => {
    let API_KEY = process.env.API_KEY;

    if (!API_KEY) {
        let config;
        try {
            config = JSON.parse(
                fs.readFileSync(
                    path.join(
                        __dirname,
                        "..",
                        "..",
                        "config",
                        "backend-config.json",
                    ),
                    "utf8",
                ),
            );
        } catch (error) {
            console.error("Error loading backend config: ", error);
            throw new MyError(500, "Could not load backend config.");
        }
        API_KEY = config.api_key;
    }

    if (!API_KEY) throw new MyError(500, "No API key provided.");

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    return model;
};

const buildSQLPrompt = ({
    query,
    mode = "suggest",
    description = "Provide suggestions to complete this SQL query. Just complete this one query. Stricyly don't add a single extra characters like ` or mysql or anything",
    schema = "Schema not provided. Use general SQL assumptions.",
    expectation = "Suggest how to enhance or complete the query. Provide only the suggestion or modified query in plain text.",
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

    const model = await setupGenerativeAI();

    const result = await model.generateContent(struturedPrompt);
    const response = result.response;
    const text = response.text();
    return {
        success: true,
        response: text?.trim(),
        message: "Generated SQL suggestion based on the provided prompt.",
    };
};
