import { useCallback, useEffect, useState } from "react";
import { FaDatabase, FaEdit, FaPlus, FaSearch, FaTimes } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Error from "../../ui/Error";
import Loader from "../../ui/Loader";
import {
    createTable,
    dropTable,
    getTables,
    renameTable,
} from "../../utils/api/axios";
import TableItem from "./TableItem";
import CreateTableModal from "./createTableModal/CreateTableModal";

const TablesList = () => {
    const { dbName } = useParams();
    const navigate = useNavigate();
    const [tables, setTables] = useState([]);
    const [filteredTables, setFilteredTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [modalState, setModalState] = useState({
        create: { visible: false, loading: false },
        rename: { visible: false, loading: false },
    });
    const [newTable, setNewTable] = useState({
        name: "",
        columns: [{ name: "id", type: "INT" }],
    });
    const [renameData, setRenameData] = useState({
        oldName: "",
        newName: "",
    });

    const fetchTables = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await getTables(dbName);
            setTables(data.tables || []);
            setFilteredTables(data.tables || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch tables");
            console.error("Error fetching tables:", err);
            toast.error("Failed to fetch tables");
        } finally {
            setLoading(false);
        }
    }, [dbName]);

    useEffect(() => {
        fetchTables();
    }, [fetchTables]);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredTables(tables);
        } else {
            const filtered = tables.filter((table) =>
                table.tableName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
            );
            setFilteredTables(filtered);
        }
    }, [searchQuery, tables]);

    const handleTableClick = useCallback(
        (tableName) => {
            navigate(`/home/${dbName}/${tableName}`);
        },
        [dbName, navigate],
    );

    const handleCreateTable = useCallback(async () => {
        if (!newTable.name.trim()) {
            toast.error("Table name is required");
            return;
        }

        if (newTable.columns.length === 0) {
            toast.error("At least one column is required");
            return;
        }

        try {
            setModalState((prev) => ({
                ...prev,
                create: { ...prev.create, loading: true },
            }));

            await createTable(dbName, newTable.name, newTable.columns);

            toast.success(
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-30 animate-[shimmer_1.5s_infinite]"></div>
                    <div className="font-medium relative z-10">
                        Table created successfully!
                    </div>
                    <div className="text-xs text-gray-300 mt-1 relative z-10">
                        {newTable.name}
                    </div>
                </div>,
                {
                    className: "bg-green-900/80 border border-green-700",
                    bodyClassName: "relative",
                },
            );

            setModalState((prev) => ({
                ...prev,
                create: { visible: false, loading: false },
            }));
            setNewTable({
                name: "",
                columns: [{ name: "id", type: "INT" }],
            });
            fetchTables();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to create table",
            );
            console.error("Error creating table:", err);
            setModalState((prev) => ({
                ...prev,
                create: { ...prev.create, loading: false },
            }));
        }
    }, [dbName, newTable, fetchTables]);

    const handleDeleteTable = useCallback(
        async (tableName) => {
            if (
                !window.confirm(
                    `Are you sure you want to delete the table "${tableName}"? This action cannot be undone.`,
                )
            ) {
                return;
            }

            try {
                await dropTable(dbName, tableName);
                toast.success(
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-30 animate-[shimmer_1.5s_infinite]"></div>
                        <div className="font-medium relative z-10">
                            Table deleted successfully!
                        </div>
                        <div className="text-xs text-gray-300 mt-1 relative z-10">
                            {tableName}
                        </div>
                    </div>,
                    {
                        className: "bg-green-900/80 border border-green-700",
                        bodyClassName: "relative",
                    },
                );
                fetchTables();
            } catch (err) {
                toast.error(
                    err.response?.data?.message || "Failed to delete table",
                );
                console.error("Error deleting table:", err);
            }
        },
        [dbName, fetchTables],
    );

    const handleRenameTable = useCallback((tableName) => {
        setRenameData({
            oldName: tableName,
            newName: tableName,
        });
        setModalState((prev) => ({
            ...prev,
            rename: { ...prev.rename, visible: true },
        }));
    }, []);

    const handleRenameSubmit = useCallback(async () => {
        const { oldName, newName } = renameData;

        if (!newName.trim()) {
            toast.error("New table name is required");
            return;
        }

        if (newName === oldName) {
            toast.error("New table name must be different");
            return;
        }

        try {
            setModalState((prev) => ({
                ...prev,
                rename: { ...prev.rename, loading: true },
            }));

            await renameTable(dbName, oldName, newName);

            toast.success(
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-30 animate-[shimmer_1.5s_infinite]"></div>
                    <div className="font-medium relative z-10">
                        Table renamed successfully!
                    </div>
                    <div className="text-xs text-gray-300 mt-1 relative z-10">
                        {oldName} → {newName}
                    </div>
                </div>,
                {
                    className: "bg-green-900/80 border border-green-700",
                    bodyClassName: "relative",
                },
            );

            setModalState((prev) => ({
                ...prev,
                rename: { visible: false, loading: false },
            }));
            await fetchTables();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to rename table",
            );
            console.error("Error renaming table:", err);
            setModalState((prev) => ({
                ...prev,
                rename: { ...prev.rename, loading: false },
            }));
        }
    }, [dbName, renameData, fetchTables]);

    const openCreateModal = useCallback(() => {
        setModalState((prev) => ({
            ...prev,
            create: { ...prev.create, visible: true },
        }));
    }, []);

    const closeModal = useCallback((modalType) => {
        setModalState((prev) => ({
            ...prev,
            [modalType]: { ...prev[modalType], visible: false },
        }));
    }, []);

    const clearSearch = useCallback(() => {
        setSearchQuery("");
    }, []);

    return (
        <>
            <div className="w-full min-w-60 h-screen bg-gray-800 py-3 border-gray-700 overflow-y-auto flex flex-col">
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FaDatabase className="text-blue-400" />
                            {dbName}
                        </h2>
                        <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full animate-pulse">
                            {loading ? "..." : tables.length}
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
                            placeholder="Search tables..."
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
                        New Table
                    </button>
                </div>

                {/* Tables List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <Loader />
                    ) : error ? (
                        <Error error={error} />
                    ) : (
                        <div className="divide-y divide-gray-700/50 px-2">
                            {filteredTables.length === 0 ? (
                                <div className="p-4 text-center text-gray-400 text-sm animate-fadeIn">
                                    {searchQuery
                                        ? `No tables found matching "${searchQuery}"`
                                        : "No tables found"}
                                </div>
                            ) : (
                                filteredTables.map((table) => (
                                    <TableItem
                                        key={table.tableName}
                                        table={table}
                                        onClick={() =>
                                            handleTableClick(table.tableName)
                                        }
                                        onDelete={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTable(table.tableName);
                                        }}
                                        onRename={(e) => {
                                            e.stopPropagation();
                                            handleRenameTable(table.tableName);
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            <CreateTableModal
                visible={modalState.create.visible}
                loading={modalState.create.loading}
                onClose={() => closeModal("create")}
                onSubmit={handleCreateTable}
                newTable={newTable}
                setNewTable={setNewTable}
            />

            {/* Rename Table Modal */}
            <div
                className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
                    modalState.rename.visible ? "" : "hidden"
                }`}
            >
                <div
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    onClick={() => closeModal("rename")}
                />
                <div className="relative w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 animate-fadeIn">
                    <div className="p-5">
                        <h3 className="text-lg font-bold text-white mb-1">
                            Rename Table
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Enter a new name for{" "}
                            <span className="text-blue-300">
                                {renameData.oldName}
                            </span>
                        </p>

                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm mb-2">
                                New Table Name
                            </label>
                            <input
                                type="text"
                                value={renameData.newName}
                                onChange={(e) =>
                                    setRenameData((prev) => ({
                                        ...prev,
                                        newName: e.target.value,
                                    }))
                                }
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white"
                                autoFocus
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => closeModal("rename")}
                                disabled={modalState.rename.loading}
                                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRenameSubmit}
                                disabled={
                                    modalState.rename.loading ||
                                    !renameData.newName.trim() ||
                                    renameData.newName.trim() ===
                                        renameData.oldName
                                }
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    modalState.rename.loading ||
                                    !renameData.newName.trim() ||
                                    renameData.newName.trim() ===
                                        renameData.oldName
                                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-500 text-white"
                                }`}
                            >
                                {modalState.rename.loading
                                    ? "Renaming..."
                                    : "Rename Table"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TablesList;
