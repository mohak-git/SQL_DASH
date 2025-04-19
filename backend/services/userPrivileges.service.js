import { getMySQLPool } from "../db/mysqlPool.js";
import MyError from "../utils/error.js";

const listUsersWithAccess = async () => {
    const pool = getMySQLPool();
    const [users] = await pool.query(`SELECT user, host FROM mysql.user`);
    return {
        success: true,
        users,
    };
};

const getUserGrants = async (user, host = "%") => {
    const pool = getMySQLPool();

    const escapedUser = user.replace(/'/g, "''");
    const escapedHost = host.replace(/'/g, "''");

    const userStr = `'${escapedUser}'@'${escapedHost}'`;

    try {
        const [grants] = await pool.query(`SHOW GRANTS FOR ${userStr}`);
        return {
            success: true,
            user: `${user}@${host}`,
            grants: grants.map((g) => Object.values(g)[0]),
        };
    } catch (error) {
        throw new MyError(500, "Failed to retrieve user grants", error);
    }
};

const createUser = async (user, host = "%", password) => {
    const pool = getMySQLPool();
    await pool.query(`CREATE USER IF NOT EXISTS ??@?? IDENTIFIED BY ?`, [
        user,
        host,
        password,
    ]);

    return {
        success: true,
        message: `User ${user}@${host} created successfully`,
    };
};

const removeUser = async (user, host = "%") => {
    const pool = getMySQLPool();
    await pool.query(`DROP USER IF EXISTS ??@??`, [user, host]);

    return {
        success: true,
        message: `User ${user}@${host} removed successfully`,
    };
};

const grantUserPrivileges = async (
    user,
    host = "%",
    privileges,
    dbName = "*",
    tableName = "*",
) => {
    const pool = getMySQLPool();

    if (!Array.isArray(privileges) || privileges.length === 0) {
        throw new MyError(400, "Privileges array is required");
    }

    const privilegeStr = privileges.join(", ");
    const escapeIfNotWildcard = (val) => (val === "*" ? "*" : `\`${val}\``);
    const target = `${escapeIfNotWildcard(dbName)}.${escapeIfNotWildcard(
        tableName,
    )}`;
    
    await pool.query(`GRANT ${privilegeStr} ON ${target} TO ??@??`, [
        user,
        host,
    ]);

    return {
        success: true,
        message: `Granted [${privileges}] on ${target} to ${user}@${host}`,
    };
};

const revokeUserPrivileges = async (
    user,
    host = "%",
    privileges,
    dbName = "*",
    tableName = "*",
) => {
    const pool = getMySQLPool();

    if (!Array.isArray(privileges) || privileges.length === 0) {
        throw new MyError(400, "Privileges array is required");
    }

    const privilegeStr = privileges.join(", ");

    const escapeIfNotWildcard = (val) => (val === "*" ? "*" : `\`${val}\``);
    const target = `${escapeIfNotWildcard(dbName)}.${escapeIfNotWildcard(
        tableName,
    )}`;

    await pool.query(`REVOKE ${privilegeStr} ON ${target} FROM ??@??`, [
        user,
        host,
    ]);

    return {
        success: true,
        message: `Revoked [${privileges}] on ${target} from ${user}@${host}`,
    };
};

const flushPrivileges = async () => {
    const pool = getMySQLPool();
    await pool.query(`FLUSH PRIVILEGES`);
    return { success: true, message: "Privileges flushed." };
};

export {
    createUser,
    flushPrivileges,
    getUserGrants,
    grantUserPrivileges,
    listUsersWithAccess,
    removeUser,
    revokeUserPrivileges,
};
