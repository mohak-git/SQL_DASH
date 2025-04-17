import { exec } from "child_process";
import util from "util";
import path from "path";
import MyError from "./error.js";

const execPromise = util.promisify(exec);

const runMysqldump = async (
    dbname,
    tablename,
    username,
    password,
    outputPath,
) => {
    const dumpCommandParts = [
        `cmd /C mysqldump -u${username}`,
        dbname,
        tablename,
        `> "${outputPath}\\${dbname}_${tablename || "dump"}.sql"`,
    ];

    const dumpCommand = dumpCommandParts.join(" ").trim();
    

    const { stdout, stderr } = await execPromise(dumpCommand, {
        env: { ...process.env, MYSQL_PWD: password },
    });

    if (stderr)
        throw new MyError(
            500,
            `An error occurred while running the MySQL dump command: ${stderr}`,
        );

    return stdout;
};

export default runMysqldump;
