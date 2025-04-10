import asyncHandler from "../utils/asyncHandler.js";
import MyError from "../utils/error.js";
import {
    connectMySQL,
    connectSQLite,
} from "../services/database/dbConnection.service.js";

const handleDBConnection = asyncHandler(async (req, res) => {
    const { environment, ...connectionParams } = req.body;

    if (!environment) throw new MyError(400, "Environment is required");

    let connectionInfo;
    if (environment === "cloud")
        connectionInfo = await connectMySQL(connectionParams);
    else connectionInfo = await connectSQLite(connectionParams);

    return res.status(200).json(connectionInfo);
});

export { handleDBConnection };
