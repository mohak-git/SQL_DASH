import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { getMySQLPool, initMySQLPool } from "../../db/mysqlPool.js";
import MyError from "../../utils/error.js";

// const connectMySQL = async ({ host, port, user, password }) => {
//     if (!host || !port || !user || !password) {
//         throw new MyError(
//             400,
//             "MySQL connection requires host, port, user and password",
//         );
//     }

//     try {
//         initMySQLPool({ host, port, user, password });
//         const pool = getMySQLPool();

//         await pool.query("SELECT 1");

//         return {
//             success: true,
//             message: "MySQL connection established successfully",
//             connection: {
//                 type: "mysql",
//                 host,
//                 port,
//             },
//         };
//     } catch (error) {
//         throw new MyError(
//             500,
//             `MySQL pool connection failed: ${error.message}`,
//         );
//     }
// };

const connectMySQL = async (host, port, user, password) => {
    if (!host || !port || !user || !password) {
        throw new MyError(
            400,
            "MySQL connection requires host, port, user and password",
        );
    }

    try {
        initMySQLPool({ host, port, user, password });
        const pool = getMySQLPool();

        const connection = await pool.getConnection();
        await connection.ping();

        return {
            success: true,
            message: "MySQL connection established successfully",
            connection: {
                type: "mysql",
                host,
                port,
            },
        };
    } catch (error) {
        throw new MyError(
            500,
            `MySQL pool connection failed: ${error.message}`,
        );
    }
};

const connectSQLite = async ({ database }) => {
    if (!database) {
        throw new MyError(400, "SQLite connection requires a database path");
    }

    try {
        const connection = await open({
            filename: database,
            driver: sqlite3.Database,
        });

        await connection.get("SELECT 1");

        return {
            success: true,
            message: "SQLite connection established successfully",
            connection: {
                type: "sqlite",
                database,
            },
        };
    } catch (error) {
        throw new MyError(500, `SQLite connection failed: ${error.message}`);
    }
};

export { connectMySQL, connectSQLite };
