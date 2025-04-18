/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
    FiUserPlus,
    FiTrash2,
    FiRefreshCw,
    FiEye,
    FiKey,
    FiCheck,
    FiX,
    FiDatabase,
    FiLock,
    FiShield,
    FiUserCheck,
} from "react-icons/fi";
import {
    addUser,
    deleteUser,
    flushPrivileges,
    getPrivileges,
    getUsers,
    grantPrivileges,
    revokePrivileges,
} from "../utils/api/axios";
import Loader from "../ui/Loader";
import Error from "../ui/Error";

const MySQLUserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [newUser, setNewUser] = useState({
        username: "",
        host: "%",
        password: "",
        confirmPassword: "",
    });

    const [selectedUser, setSelectedUser] = useState(null);
    const [userGrants, setUserGrants] = useState([]);
    const [privileges, setPrivileges] = useState({
        dbName: "*",
        tableName: "*",
        selectedPrivileges: [],
    });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showGrantsModal, setShowGrantsModal] = useState(false);
    const [showPrivilegesModal, setShowPrivilegesModal] = useState(false);
    const [actionType, setActionType] = useState("grant");

    const privilegeOptions = [
        "SELECT",
        "INSERT",
        "UPDATE",
        "DELETE",
        "CREATE",
        "ALTER",
        "DROP",
        "INDEX",
        "REFERENCES",
        "CREATE TEMPORARY TABLES",
        "LOCK TABLES",
        "EXECUTE",
        "CREATE VIEW",
        "SHOW VIEW",
        "CREATE ROUTINE",
        "ALTER ROUTINE",
        "EVENT",
        "TRIGGER",
        "ALL PRIVILEGES",
    ];

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await getUsers();
            setUsers(data.users || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserGrants = async (user, host) => {
        try {
            const { data } = await getPrivileges(user, host);
            setUserGrants(data.grants || []);

            const currentPrivileges = extractPrivilegesFromGrants(
                data.grants || [],
            );
            setPrivileges((prev) => ({
                ...prev,
                selectedPrivileges: currentPrivileges,
            }));
        } catch (err) {
            setError(err.message);
        }
    };

    const extractPrivilegesFromGrants = (grants) => {
        const privileges = new Set();

        grants.forEach((grant) => {
            if (!grant.includes("GRANT") || grant.includes("USAGE")) return;

            const privilegesPart = grant
                .split("GRANT")[1]
                .split("ON")[0]
                .trim();

            if (privilegesPart.includes("ALL PRIVILEGES")) {
                privilegeOptions.forEach((opt) => {
                    if (opt !== "ALL PRIVILEGES") {
                        privileges.add(opt);
                    }
                });
                return;
            }

            privilegesPart.split(",").forEach((p) => {
                const cleanPriv = p.trim().replace(/`/g, "");
                if (privilegeOptions.includes(cleanPriv)) {
                    privileges.add(cleanPriv);
                }
            });
        });

        return Array.from(privileges);
    };

    const handleCreateUser = async () => {
        if (newUser.password !== newUser.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        try {
            await addUser(newUser.username, newUser.host, newUser.password);
            setShowCreateModal(false);
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteUser = async (user, host) => {
        if (
            window.confirm(`Are you sure you want to delete ${user}@${host}?`)
        ) {
            try {
                await deleteUser(user, host);
                fetchUsers();
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handlePrivilegeChange = (privilege) => {
        setPrivileges((prev) => {
            if (prev.selectedPrivileges.includes(privilege)) {
                return {
                    ...prev,
                    selectedPrivileges: prev.selectedPrivileges.filter(
                        (p) => p !== privilege,
                    ),
                };
            } else {
                return {
                    ...prev,
                    selectedPrivileges: [...prev.selectedPrivileges, privilege],
                };
            }
        });
    };

    const handlePrivilegeAction = async () => {
        if (!selectedUser || privileges.selectedPrivileges.length === 0) return;

        try {
            actionType === "grant"
                ? await grantPrivileges(
                      selectedUser.user,
                      selectedUser.host,
                      privileges.selectedPrivileges,
                      privileges.dbName,
                      privileges.tableName,
                  )
                : await revokePrivileges(
                      selectedUser.user,
                      selectedUser.host,
                      privileges.selectedPrivileges,
                      privileges.dbName,
                      privileges.tableName,
                  );
            setShowPrivilegesModal(false);
            fetchUserGrants(selectedUser.user, selectedUser.host);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleFlushPrivileges = async () => {
        try {
            await flushPrivileges();
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const parseGrantStatement = (grant) => {
        if (!grant.includes("GRANT")) return grant;

        try {
            const parts = grant.split("GRANT")[1].split("ON");
            const privilegesPart = parts[0].trim();
            const rest = parts[1].trim();

            const scopeParts = rest.split("TO")[0].trim().split(".");
            const db = scopeParts[0].replace(/`/g, "");
            const table =
                scopeParts.length > 1 ? scopeParts[1].replace(/`/g, "") : "*";

            return {
                privileges: privilegesPart,
                database: db,
                table: table,
                raw: grant,
            };
        } catch (e) {
            return {
                raw: grant,
            };
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all duration-300">
                        <FiUserCheck className="text-2xl text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white hover:text-blue-100 transition-colors duration-300">
                            User Management
                        </h1>
                        <p className="text-gray-400 flex items-center gap-1 hover:text-blue-300 transition-colors duration-300">
                            Manage database users and privileges
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={fetchUsers}
                        className="flex items-center gap-2 px-4 py-1 rounded-lg bg-blue-900/30 border border-blue-700/50 text-blue-100 hover:bg-blue-900/50 hover:border-blue-500/50 hover:text-white transition-all duration-300"
                    >
                        <FiRefreshCw
                            className={`${loading ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </button>
                    <button
                        onClick={handleFlushPrivileges}
                        className="flex items-center gap-2 px-4 py-1 rounded-lg bg-purple-900/30 border border-purple-700/50 text-purple-100 hover:bg-purple-900/50 hover:border-purple-500/50 hover:text-white transition-all duration-300"
                    >
                        <FiLock />
                        Flush Privileges
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-1 rounded-lg bg-green-900/30 border border-green-700/50 text-green-100 hover:bg-green-900/50 hover:border-green-500/50 hover:text-white transition-all duration-300"
                    >
                        <FiUserPlus />
                        Create User
                    </button>
                </div>
            </div>

            {error && <Error error={error} />}

            {loading && <Loader />}

            {!loading && (
                <div className="group bg-gradient-to-br from-gray-800/40 to-gray-800/20 rounded-xl border border-gray-700/50 p-6 transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors duration-300">
                            <FiDatabase className="text-xl text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                        </div>
                        <h2 className="text-xl font-semibold text-white group-hover:text-blue-100 transition-colors duration-300">
                            Database Users
                        </h2>
                    </div>

                    <div className="overflow-x-auto text-center">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700/50">
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Username
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Host
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {users.length > 0 ? (
                                    users.map((user, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-800/30 transition-colors duration-200"
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                                                {user.user}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                                                {user.host}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 flex justify-center items-center">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(
                                                                user,
                                                            );
                                                            fetchUserGrants(
                                                                user.user,
                                                                user.host,
                                                            );
                                                            setShowGrantsModal(
                                                                true,
                                                            );
                                                        }}
                                                        className="p-2 rounded-md bg-blue-900/20 border border-blue-700/50 text-blue-400 hover:bg-blue-900/30 hover:border-blue-500/50 hover:text-blue-300 transition-all duration-200"
                                                        title="View Grants"
                                                    >
                                                        <FiEye />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(
                                                                user,
                                                            );
                                                            setActionType(
                                                                "grant",
                                                            );
                                                            setShowPrivilegesModal(
                                                                true,
                                                            );
                                                        }}
                                                        className="p-2 rounded-md bg-green-900/20 border border-green-700/50 text-green-400 hover:bg-green-900/30 hover:border-green-500/50 hover:text-green-300 transition-all duration-200"
                                                        title="Grant Privileges"
                                                    >
                                                        <FiKey />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteUser(
                                                                user.user,
                                                                user.host,
                                                            )
                                                        }
                                                        className="p-2 rounded-md bg-red-900/20 border border-red-700/50 text-red-400 hover:bg-red-900/30 hover:border-red-500/50 hover:text-red-300 transition-all duration-200"
                                                        title="Delete User"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="3"
                                            className="px-4 py-8 text-center text-gray-400"
                                        >
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-xl border border-gray-700/50 w-full max-w-md">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <FiUserPlus className="text-blue-400" />
                                    Create New User
                                </h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-400 hover:text-white transition-colors duration-200"
                                >
                                    <FiX />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white transition-all duration-200"
                                        value={newUser.username}
                                        onChange={(e) =>
                                            setNewUser({
                                                ...newUser,
                                                username: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Host
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white transition-all duration-200"
                                        value={newUser.host}
                                        onChange={(e) =>
                                            setNewUser({
                                                ...newUser,
                                                host: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="%">Any host (%)</option>
                                        <option value="localhost">
                                            Localhost
                                        </option>
                                        <option value="127.0.0.1">
                                            127.0.0.1
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white transition-all duration-200"
                                        value={newUser.password}
                                        onChange={(e) =>
                                            setNewUser({
                                                ...newUser,
                                                password: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white transition-all duration-200"
                                        value={newUser.confirmPassword}
                                        onChange={(e) =>
                                            setNewUser({
                                                ...newUser,
                                                confirmPassword: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-md bg-gray-700/50 border border-gray-600/50 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateUser}
                                    className="px-4 py-2 rounded-md bg-blue-600/90 border border-blue-500/50 text-white hover:bg-blue-600 hover:border-blue-400/50 transition-all duration-200"
                                >
                                    Create User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showGrantsModal && selectedUser && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-xl border border-gray-700/50 w-full max-w-4xl">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <FiShield className="text-blue-400" />
                                    Privileges for {selectedUser.user}@
                                    {selectedUser.host}
                                </h2>
                                <button
                                    onClick={() => setShowGrantsModal(false)}
                                    className="text-gray-400 hover:text-white transition-colors duration-200"
                                >
                                    <FiX />
                                </button>
                            </div>

                            <div className="bg-gray-700/30 rounded-lg border border-gray-600/50 max-h-[70vh] overflow-y-auto">
                                {userGrants.length > 0 ? (
                                    <table className="w-full">
                                        <thead className="sticky top-0 bg-gray-800 z-10">
                                            <tr className="border-b border-gray-700/50">
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Privileges
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Database
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Table
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700/50">
                                            {userGrants.map((grant, index) => {
                                                const parsed =
                                                    parseGrantStatement(grant);
                                                return (
                                                    <tr
                                                        key={index}
                                                        className="hover:bg-gray-700/50 transition-colors duration-150"
                                                    >
                                                        <td className="px-4 py-3 whitespace-normal text-sm text-blue-300">
                                                            {parsed.privileges ||
                                                                "USAGE"}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                            {parsed.database ||
                                                                "*"}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                            {parsed.table ||
                                                                "*"}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-8 text-center text-gray-400">
                                        No privileges granted to this user
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setActionType("revoke");
                                        setShowGrantsModal(false);
                                        setShowPrivilegesModal(true);
                                    }}
                                    className="px-4 py-2 rounded-md bg-red-600/90 border border-red-500/50 text-white hover:bg-red-600 hover:border-red-400/50 transition-all duration-200 flex items-center gap-2"
                                >
                                    <FiKey /> Revoke Privileges
                                </button>
                                <button
                                    onClick={() => {
                                        setActionType("grant");
                                        setShowGrantsModal(false);
                                        setShowPrivilegesModal(true);
                                    }}
                                    className="px-4 py-2 rounded-md bg-green-600/90 border border-green-500/50 text-white hover:bg-green-600 hover:border-green-400/50 transition-all duration-200 flex items-center gap-2"
                                >
                                    <FiKey /> Grant Privileges
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showPrivilegesModal && selectedUser && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-xl border border-gray-700/50 w-full max-w-3xl">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <FiKey
                                        className={
                                            actionType === "grant"
                                                ? "text-green-400"
                                                : "text-red-400"
                                        }
                                    />
                                    {actionType === "grant"
                                        ? "Grant"
                                        : "Revoke"}{" "}
                                    Privileges for {selectedUser.user}@
                                    {selectedUser.host}
                                </h2>
                                <button
                                    onClick={() =>
                                        setShowPrivilegesModal(false)
                                    }
                                    className="text-gray-400 hover:text-white transition-colors duration-200"
                                >
                                    <FiX />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">
                                            Database Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white transition-all duration-200"
                                            value={privileges.dbName}
                                            onChange={(e) =>
                                                setPrivileges({
                                                    ...privileges,
                                                    dbName: e.target.value,
                                                })
                                            }
                                            placeholder="* for all databases"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">
                                            Table Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white transition-all duration-200"
                                            value={privileges.tableName}
                                            onChange={(e) =>
                                                setPrivileges({
                                                    ...privileges,
                                                    tableName: e.target.value,
                                                })
                                            }
                                            placeholder="* for all tables"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-400">
                                            Select Privileges
                                        </label>
                                        <span className="text-xs text-gray-500">
                                            {
                                                privileges.selectedPrivileges
                                                    .length
                                            }{" "}
                                            selected
                                        </span>
                                    </div>
                                    <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50 max-h-64 overflow-y-auto">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {privilegeOptions.map((priv) => {
                                                const isSelected =
                                                    privileges.selectedPrivileges.includes(
                                                        priv,
                                                    );
                                                return (
                                                    <div
                                                        key={priv}
                                                        className={`p-3 rounded-md border cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                                                            isSelected
                                                                ? actionType ===
                                                                  "grant"
                                                                    ? "bg-green-900/20 border-green-700/50 text-green-100"
                                                                    : "bg-red-900/20 border-red-700/50 text-red-100"
                                                                : "bg-gray-700/10 border-gray-600/50 text-gray-300 hover:bg-gray-700/30 hover:border-gray-500/50"
                                                        }`}
                                                        onClick={() =>
                                                            handlePrivilegeChange(
                                                                priv,
                                                            )
                                                        }
                                                    >
                                                        <div
                                                            className={`p-1 rounded ${
                                                                isSelected
                                                                    ? actionType ===
                                                                      "grant"
                                                                        ? "bg-green-800/50 text-green-300"
                                                                        : "bg-red-800/50 text-red-300"
                                                                    : "bg-gray-700/50"
                                                            }`}
                                                        >
                                                            {isSelected ? (
                                                                <FiCheck />
                                                            ) : (
                                                                <div className="w-4 h-4" />
                                                            )}
                                                        </div>
                                                        <span className="text-sm">
                                                            {priv}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-between items-center">
                                <div className="text-sm text-gray-400">
                                    Current scope: {privileges.dbName}.
                                    {privileges.tableName}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() =>
                                            setShowPrivilegesModal(false)
                                        }
                                        className="px-4 py-2 rounded-md bg-gray-700/50 border border-gray-600/50 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handlePrivilegeAction}
                                        disabled={
                                            privileges.selectedPrivileges
                                                .length === 0
                                        }
                                        className={`px-4 py-2 rounded-md border text-white transition-all duration-200 flex items-center gap-2 ${
                                            actionType === "grant"
                                                ? "bg-green-600/90 border-green-500/50 hover:bg-green-600 hover:border-green-400/50"
                                                : "bg-red-600/90 border-red-500/50 hover:bg-red-600 hover:border-red-400/50"
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <FiKey />
                                        {actionType === "grant"
                                            ? "Grant Privileges"
                                            : "Revoke Privileges"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MySQLUserManager;
