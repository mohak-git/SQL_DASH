import { exec } from "child_process";
import util from "util";
import MyError from "./error.js";
import { log } from "console";

const execPromise = util.promisify(exec);

const runMysqldump = async (dbname, tablename, username, password) => {
    const dumpCommand =
        tablename !== "undefined"
            ? `mysqldump -u${username} ${dbname} ${tablename}`
            : `mysqldump -u${username} ${dbname}`;

    const { stdout, stderr } = await execPromise(dumpCommand, {
        env: { ...process.env, MYSQL_PWD: password },
        maxBuffer: 1024 * 1024 * 10,
    });

    if (stderr) throw new MyError(500, `MySQL dump error: ${stderr}`);

    return stdout;
};

export default runMysqldump;
