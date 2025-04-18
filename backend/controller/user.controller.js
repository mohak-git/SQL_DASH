import {
    createUser,
    flushPrivileges,
    getUserGrants,
    grantUserPrivileges,
    listUsersWithAccess,
    removeUser,
    revokeUserPrivileges,
} from "../services/database/userPrivileges.service.js";

import asyncHandler from "../utils/asyncHandler.js";
import MyError from "../utils/error.js";

const handleListDBUsers = asyncHandler(async (req, res) => {
    const result = await listUsersWithAccess();
    res.status(200).json(result);
});

const handleAddUser = asyncHandler(async (req, res) => {
    const { user, host, password } = req.body;
    if (!user || !password)
        throw new MyError(400, "User and password are required");

    const result = await createUser(user, host, password);
    res.status(200).json(result);
});

const handleRemoveUser = asyncHandler(async (req, res) => {
    const { user, host } = req.body;

    if (!user) throw new MyError(400, "User is required");

    const result = await removeUser(user, host);
    res.status(200).json(result);
});

const handleGetUserGrants = asyncHandler(async (req, res) => {
    const { user, host } = req.query;
    if (!user) throw new MyError(400, "User is required");

    const result = await getUserGrants(user, host);
    res.status(200).json(result);
});

const handleGrantPrivileges = asyncHandler(async (req, res) => {
    const { user, host, privileges, dbName, tableName } = req.body;

    if (!user || !privileges)
        throw new MyError(400, "User and privileges are required");

    const result = await grantUserPrivileges(
        user,
        host,
        privileges,
        dbName,
        tableName,
    );
    res.status(200).json(result);
});

const handleRevokePrivileges = asyncHandler(async (req, res) => {
    const { user, host, privileges, dbName, tableName } = req.body;

    if (!user || !privileges)
        throw new MyError(400, "User and privileges are required");

    const result = await revokeUserPrivileges(
        user,
        host,
        privileges,
        dbName,
        tableName,
    );
    res.status(200).json(result);
});

const handleFlushPrivileges = asyncHandler(async (req, res) => {
    const result = await flushPrivileges();
    res.status(200).json(result);
});

export {
    handleAddUser,
    handleFlushPrivileges,
    handleGetUserGrants,
    handleGrantPrivileges,
    handleListDBUsers,
    handleRemoveUser,
    handleRevokePrivileges,
};
