import { getMySQLPool } from "../db/mysqlPool.js";
import asyncHandler from "../utils/asyncHandler.js";
import MyError from "../utils/error.js";

const handleRawQuery = asyncHandler(async (req, res) => {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
        throw new MyError(400, "Query must be a valid SQL string.");
    }

    const pool = getMySQLPool();

    try {
        const [results, fields] = await pool.query(query);

        return res.status(200).json({
            success: true,
            query,
            results,
            fields,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: {
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                message: error.message,
            },
        });
    }
});

export { handleRawQuery };
