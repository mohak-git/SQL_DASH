import { memo, useCallback, useEffect, useState } from "react";
import {
    FaChevronRight,
    FaDatabase,
    FaPlus,
    FaServer,
    FaTerminal,
    FaTrash,
    FaUser,
    FaSearch,
    FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Error from "../ui/Error.jsx";
import Loader from "../ui/Loader.jsx";
import {
    createDatabase,
    dropDatabase,
    getAllDatabases,
} from "../utils/api/axios.js";

// Enhanced DatabaseItem with microinteractions
const DatabaseItem = memo(({ db, onClick, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`
                group relative p-3 px-4 transition-all duration-300 
                hover:bg-gray-700/50 hover:shadow-lg rounded-md
                border border-transparent hover:border-gray-600/50
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div
                onClick={onClick}
                className="cursor-pointer flex items-center justify-between relative z-10"
            >
                <div className="flex items-center gap-3">
                    <div
                        className={`
                            p-1.5 rounded-md bg-gray-700/40 
                            group-hover:bg-blue-500/20 transition-all duration-300
                            ${isHovered ? "ring-2 ring-blue-500/30" : ""}
                        `}
                    >
                        <FaDatabase
                            className={`
                                text-sm text-gray-400 
                                group-hover:text-blue-300 transition-all duration-300
                                ${isHovered ? "scale-110" : ""}
                            `}
                        />
                    </div>
                    <span
                        className={`
                            truncate text-gray-300 
                            group-hover:text-white transition-all duration-300
                            ${isHovered ? "font-medium" : ""}
                        `}
                    >
                        {db}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className={`
                            text-red-400 hover:text-red-300 
                            p-1 transition-all duration-300
                            ${
                                isHovered
                                    ? "opacity-100 scale-100"
                                    : "opacity-0 scale-90"
                            }
                        `}
                        title="Delete database"
                    >
                        <FaTrash className="text-sm" />
                    </button>
                    <FaChevronRight
                        className={`
                            text-xs text-gray-500 
                            group-hover:text-blue-300 transition-all duration-300
                            ${isHovered ? "translate-x-1" : ""}
                        `}
                    />
                </div>
            </div>
        </div>
    );
});

// Enhanced Modal component with animations
const DatabaseModal = memo(({ type, state, onClose, onSubmit }) => {
    const isCreate = type === "create";
    const { loading } = state.modal[type];
    const title = isCreate ? "Create New Database" : "Delete Database";
    const icon = isCreate ? (
        <FaDatabase className="text-blue-400 animate-pulse" />
    ) : (
        <FaDatabase className="text-red-400 animate-pulse" />
    );

    if (!state.modal[type].visible) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-2xl animate-scaleIn">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    {icon}
                    {title}
                </h3>

                {isCreate ? (
                    <>
                        <div className="mb-6">
                            <label className="block text-gray-300 mb-2 text-sm font-medium">
                                Database Name
                            </label>
                            <input
                                type="text"
                                value={state.newDbName}
                                onChange={(e) =>
                                    state.setNewDbName(e.target.value)
                                }
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-400"
                                placeholder="e.g. customer_data"
                                autoFocus
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Only alphanumeric characters and underscores
                                allowed
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="mb-6">
                        <p className="text-gray-300">
                            Are you sure you want to delete the database{" "}
                            <span className="font-bold text-white">
                                "{state.modal.delete.dbName}"
                            </span>
                            ?
                        </p>
                        <p className="text-red-400 text-sm mt-2 animate-pulse">
                            Warning: This action cannot be undone. All tables
                            and data will be permanently deleted.
                        </p>
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-300 hover:scale-[1.02]"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={loading}
                        className={`px-6 py-2 bg-gradient-to-r ${
                            isCreate
                                ? "from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
                                : "from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
                        } text-white rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-70 shadow-md hover:scale-[1.02] hover:shadow-lg`}
                    >
                        {loading ? (
                            <Loader size="small" />
                        ) : isCreate ? (
                            <FaPlus className="transition-transform group-hover:rotate-90" />
                        ) : (
                            <FaTrash className="transition-transform group-hover:scale-110" />
                        )}
                        {isCreate ? "Create" : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
});

const DataBaseList = () => {
    const [databases, setDatabases] = useState([]);
    const [filteredDatabases, setFilteredDatabases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newDbName, setNewDbName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [modalState, setModalState] = useState({
        create: { visible: false, loading: false },
        delete: { visible: false, loading: false, dbName: null },
    });

    const navigate = useNavigate();

    // Memoized fetch function
    const fetchDatabases = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await getAllDatabases();
            setDatabases(data.databases || []);
            setFilteredDatabases(data.databases || []);
        } catch (error) {
            console.error("Error fetching databases:", error);
            setError(
                error.response?.data?.message || "Failed to load databases",
            );
            toast.error("Failed to load databases");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDatabases();
    }, [fetchDatabases]);

    // Filter databases based on search query
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredDatabases(databases);
        } else {
            const filtered = databases.filter((db) =>
                db.toLowerCase().includes(searchQuery.toLowerCase()),
            );
            setFilteredDatabases(filtered);
        }
    }, [searchQuery, databases]);

    // Memoized click handlers
    const handleDatabaseClick = useCallback(
        (dbName) => {
            navigate(`/home/${encodeURIComponent(dbName)}`);
        },
        [navigate],
    );

    const handleCreateDatabase = useCallback(async () => {
        if (!newDbName.trim()) {
            toast.error("Please enter a database name");
            return;
        }

        try {
            setModalState((prev) => ({
                ...prev,
                create: { ...prev.create, loading: true },
            }));
            const { data } = await createDatabase(newDbName.trim());

            setDatabases((prev) => [...prev, data.databaseName]);
            setFilteredDatabases((prev) => [...prev, data.databaseName]);
            setNewDbName("");
            setModalState((prev) => ({
                ...prev,
                create: { visible: false, loading: false },
            }));

            toast.success(
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-30 animate-[shimmer_1.5s_infinite]"></div>
                    <div className="font-medium relative z-10">
                        Database created successfully!
                    </div>
                    <div className="text-xs text-gray-300 mt-1 relative z-10">
                        {data.databaseName}
                    </div>
                </div>,
                {
                    className: "bg-green-900/80 border border-green-700",
                    bodyClassName: "relative",
                },
            );
        } catch (error) {
            console.error("Error creating database:", error);
            toast.error(
                error.response?.data?.message || "Failed to create database",
            );
            setModalState((prev) => ({
                ...prev,
                create: { ...prev.create, loading: false },
            }));
        }
    }, [newDbName]);

    const handleDeleteDatabase = useCallback(async () => {
        if (!modalState.delete.dbName) return;

        try {
            setModalState((prev) => ({
                ...prev,
                delete: { ...prev.delete, loading: true },
            }));
            const { data } = await dropDatabase(modalState.delete.dbName);

            setDatabases((prev) =>
                prev.filter((db) => db !== modalState.delete.dbName),
            );
            setFilteredDatabases((prev) =>
                prev.filter((db) => db !== modalState.delete.dbName),
            );
            setModalState((prev) => ({
                ...prev,
                delete: { visible: false, loading: false, dbName: null },
            }));

            toast.success(
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-30 animate-[shimmer_1.5s_infinite]"></div>
                    <div className="font-medium relative z-10">
                        Database deleted successfully!
                    </div>
                    <div className="text-xs text-gray-300 mt-1 relative z-10">
                        {data.databaseName}
                    </div>
                </div>,
                {
                    className: "bg-green-900/80 border border-green-700",
                    bodyClassName: "relative",
                },
            );
        } catch (error) {
            console.error("Error deleting database:", error);
            toast.error(
                error.response?.data?.message || "Failed to delete database",
            );
            setModalState((prev) => ({
                ...prev,
                delete: { ...prev.delete, loading: false },
            }));
        }
    }, [modalState.delete.dbName]);

    const openCreateModal = useCallback(() => {
        setModalState((prev) => ({
            ...prev,
            create: { ...prev.create, visible: true },
        }));
    }, []);

    const openDeleteModal = useCallback((dbName) => {
        setModalState((prev) => ({
            ...prev,
            delete: { ...prev.delete, visible: true, dbName },
        }));
    }, []);

    const closeModal = useCallback((type) => {
        setModalState((prev) => ({
            ...prev,
            [type]: { ...prev[type], visible: false },
        }));
    }, []);

    const clearSearch = useCallback(() => {
        setSearchQuery("");
    }, []);

    return (
        <>
            {/* Sidebar */}
            <div className="w-full h-screen bg-gray-800 py-3 border-gray-700 overflow-y-auto flex flex-col">
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FaServer className="text-blue-400" />
                            Databases
                        </h2>
                        <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full animate-pulse">
                            {loading ? "..." : databases.length}
                        </span>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mt-4 mb-3">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-400"
                            placeholder="Search databases..."
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="flex mt-2 items-center justify-center gap-2 w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-medium rounded-md transition-all duration-300 shadow-md hover:scale-[1.02]"
                    >
                        <FaPlus
                            size={12}
                            className="transition-transform group-hover:rotate-90"
                        />
                        New Database
                    </button>
                </div>

                {/* Database List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <Loader />
                    ) : error ? (
                        <Error error={error} />
                    ) : (
                        <div className="divide-y divide-gray-700/50 px-2">
                            {filteredDatabases.length === 0 ? (
                                <div className="p-4 text-center text-gray-400 text-sm animate-fadeIn">
                                    {searchQuery
                                        ? `No databases found matching "${searchQuery}"`
                                        : "No databases found"}
                                </div>
                            ) : (
                                filteredDatabases.map((db) => (
                                    <DatabaseItem
                                        key={db}
                                        db={db}
                                        onClick={() => handleDatabaseClick(db)}
                                        onDelete={() => openDeleteModal(db)}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-700 sticky bottom-0 bg-gray-800 flex flex-col gap-3">
                    <button
                        onClick={() => navigate("/home/users")}
                        className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium rounded-md transition-all duration-300 hover:scale-[1.02] group"
                    >
                        <FaUser
                            size={12}
                            className="group-hover:text-blue-300 transition-colors"
                        />
                        <span className="group-hover:text-white transition-colors">
                            User Control
                        </span>
                    </button>

                    <button
                        onClick={() => navigate("/home/query-console")}
                        className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium rounded-md transition-all duration-300 hover:scale-[1.02] group"
                    >
                        <FaTerminal
                            size={12}
                            className="group-hover:text-green-300 transition-colors"
                        />
                        <span className="group-hover:text-white transition-colors">
                            Query Console
                        </span>
                    </button>
                </div>
            </div>

            {/* Modals */}
            <DatabaseModal
                type="create"
                state={{
                    modal: modalState,
                    newDbName,
                    setNewDbName,
                }}
                onClose={() => closeModal("create")}
                onSubmit={handleCreateDatabase}
            />
            <DatabaseModal
                type="delete"
                state={{
                    modal: modalState,
                    newDbName: "",
                    setNewDbName: () => {},
                }}
                onClose={() => closeModal("delete")}
                onSubmit={handleDeleteDatabase}
            />
        </>
    );
};

export default DataBaseList;
