import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_ACTUAL_BACKEND_URL,
    // withCredentials: "true",
});

const connectToDatabase = (dbConfig) => {
    return api.post("/db/connect-db", { ...dbConfig });
};

const getConnectionDetails = () => {
    return api.get("/db/connection-details");
};

const getAllDatabases = () => {
    return api.get("/db/databases");
};

const createDatabase = (dbName) => {
    return api.post("/db/create-database", { name: dbName });
};

const dropDatabase = (dbName) => {
    return api.delete("/db/drop-database", { data: { name: dbName } });
};

const getTables = (dbName) => {
    return api.get(`/db/tables/${encodeURIComponent(dbName)}`);
};

const createTable = (dbName, tableName, columns) => {
    return api.post(
        `db/table/${encodeURIComponent(dbName)}/${encodeURIComponent(
            tableName,
        )}/create`,
        { columns },
    );
};

const addColumns = (dbName, tableName, columns) => {
    return api.patch(
        `db/table/${encodeURIComponent(dbName)}/${encodeURIComponent(
            tableName,
        )}/add-columns`,
        { columns },
    );
};

const dropColumns = (dbName, tableName, columns) => {
    return api.patch(
        `db/table/${encodeURIComponent(dbName)}/${encodeURIComponent(
            tableName,
        )}/delete-columns`,
        { columns },
    );
};

const dropTable = (dbName, tableName) => {
    return api.delete(
        `/db/table/${encodeURIComponent(dbName)}/${encodeURIComponent(
            tableName,
        )}/drop`,
    );
};
const renameTable = (dbName, tableName, newTableName) => {
    return api.put(
        `/db/table/${encodeURIComponent(dbName)}/${encodeURIComponent(
            tableName,
        )}/rename`,
        {
            newTableName,
        },
    );
};

const getDatabaseDetails = (dbName) => {
    return api.get(`/db/overview/${encodeURIComponent(dbName)}`);
};

const getQueryExecuted = (query) => {
    return api.post("/query/execute", { query });
};

const getTableDetails = (dbName, tableName) => {
    return api.get(
        `/db/table/${encodeURIComponent(dbName)}/${encodeURIComponent(
            tableName,
        )}/details`,
    );
};

const getTableData = (dbName, tableName) => {
    return api.get(
        `/db/table/${encodeURIComponent(dbName)}/${encodeURIComponent(
            tableName,
        )}/data`,
    );
};

const truncateTable = (dbName, tableName) => {
    return api.delete(
        `db/table/${encodeURIComponent(dbName)}/${encodeURIComponent(
            tableName,
        )}/truncate`,
    );
};

const exportTable = (dbName, tableName, rowLimit) => {
    return api.get(
        `/db/table/${encodeURIComponent(dbName)}/${encodeURIComponent(
            tableName,
        )}/export`,
        {
            params: { limit: rowLimit },
        },
    );
};

const getConstraints = (dbName, tableName) => {
    return api.get(
        `/db/table/${encodeURIComponent(dbName)}/${encodeURIComponent(
            tableName,
        )}/constraints`,
    );
};

const addConstraint = (dbName, tableName, constraints) => {
    return api.post(
        `/db/table/${encodeURIComponent(dbName)}/${encodeURIComponent(
            tableName,
        )}/constraints`,
        { constraints },
    );
};

const dropConstraint = (dbName, tableName, constraintName) => {
    return api.delete(
        `/db/table/${encodeURIComponent(dbName)}/${encodeURIComponent(
            tableName,
        )}/constraints`,
        {
            data: { constraint: constraintName },
        },
    );
};

const getDatabaseCode = (dbName) => {
    return api.get(`/db/code/${encodeURIComponent(dbName)}`);
};

const getTableCode = (dbName, tableName) => {
    return api.get(
        `/db/table/${encodeURIComponent(dbName)}/${encodeURIComponent(
            tableName,
        )}/code`,
    );
};

const insertRow = (dbName, tableName, data) => {
    return api.post(
        `/db/table/${encodeURIComponent(dbName)}/${encodeURIComponent(
            tableName,
        )}/data-manipulate`,
        { data },
    );
};

const deleteRow = (dbName, tableName, data) => {
    return api.delete(
        `/db/table/${encodeURIComponent(dbName)}/${encodeURIComponent(
            tableName,
        )}/data-manipulate`,
        {
            data: {
                conditions: data,
            },
        },
    );
};

const mySqlDump = (dbName, tableName, password, filepath) => {
    return api.get(
        `/db/table/${encodeURIComponent(dbName)}/${encodeURIComponent(
            tableName,
        )}/dump`,
        {
            params: { password, filepath },
        },
    );
};

const getUsers = () => {
    return api.get("/users/");
};

const addUser = (user, host, password) => {
    return api.post("/users/", {
        user,
        host,
        password,
    });
};

const deleteUser = (user, host) => {
    return api.delete(`/users/`, {
        data: {
            user,
            host,
        },
    });
};

const getPrivileges = (user, host) => {
    return api.get(`/users/privileges`, {
        params: {
            user,
            host,
        },
    });
};

const grantPrivileges = (user, host, privileges, dbName, tableName) => {
    return api.post(`/users/grant`, {
        user,
        host,
        privileges,
        dbName,
        tableName,
    });
};

const revokePrivileges = (user, host, privileges, dbName, tableName) => {
    return api.post(`/users/revoke`, {
        user,
        host,
        privileges,
        dbName,
        tableName,
    });
};

const flushPrivileges = () => {
    return api.post("/users/flush");
};

export {
    addColumns,
    addConstraint,
    addUser,
    connectToDatabase,
    createDatabase,
    createTable,
    deleteRow,
    deleteUser,
    dropColumns,
    dropConstraint,
    dropDatabase,
    dropTable,
    exportTable,
    flushPrivileges,
    getAllDatabases,
    getConnectionDetails,
    getConstraints,
    getDatabaseCode,
    getDatabaseDetails,
    getPrivileges,
    getQueryExecuted,
    getTableCode,
    getTableData,
    getTableDetails,
    getTables,
    getUsers,
    grantPrivileges,
    insertRow,
    mySqlDump,
    renameTable,
    revokePrivileges,
    truncateTable,
};
