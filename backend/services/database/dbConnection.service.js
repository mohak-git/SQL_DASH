import mysql from "mysql2/promise";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import MyError from "../../utils/error.js";

const connectMySQL = async ({ host, port, database, user, password }) => {
    if (!host || !port || !user || !password) {
        throw new MyError(400, "For MySQL connection: host, port, user and password are required");
    }

    try {
        const connection = await mysql.createConnection({
            host,
            port: Number(port),
            database,
            user,
            password,
        });

        await connection.ping();

        return {
            success: true,
            message: "MySQL connection established successfully",
            connection: {
                type: "mysql",
                host,
                port,
                database,
            },
        };
    } catch (error) {
        throw new MyError(500, `MySQL connection failed: ${error.message}`);
    }
};

const connectSQLite = async ({ database }) => {
    if (!database) {
        throw new MyError(400, "For SQLite connection: database file path is required");
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
