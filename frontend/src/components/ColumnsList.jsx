import { memo, useEffect, useState } from "react";
import {
    FaTable,
    FaKey,
    FaLink,
    FaFingerprint,
    FaStar,
    FaSearch,
    FaTimes,
    FaDatabase,
    FaPlus,
} from "react-icons/fa";
import {
    FiColumns,
    FiCopy,
    FiMinus,
    FiPlus,
    FiTrash2,
    FiX,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Error from "../ui/Error.jsx";
import Loader from "../ui/Loader.jsx";
import {
    dropColumns,
    dropTable,
    getTableDetails,
    truncateTable,
} from "../utils/api/axios.js";

const ColumnItem = memo(
    ({ column, selected, onSelect, onDelete, isDeleting, isPrimaryKey }) => {
        return (
            <div
                className={`group relative p-2 px-3 transition-all duration-200 hover:bg-gray-700/30 rounded-md ${
                    selected ? "bg-blue-900/20 border-l-2 border-blue-500" : ""
                }`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                        {onSelect && (
                            <input
                                type="checkbox"
                                checked={selected}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    onSelect(column.name, e.target.checked);
                                }}
                                className={`mr-2 h-3.5 w-3.5 rounded border ${
                                    isPrimaryKey
                                        ? "border-gray-600 cursor-not-allowed"
                                        : "border-gray-500 hover:border-blue-400"
                                } ${
                                    selected
                                        ? "bg-blue-500 border-blue-500"
                                        : "bg-gray-800"
                                } focus:ring-blue-500 focus:ring-offset-gray-800`}
                                disabled={isPrimaryKey}
                            />
                        )}
                        <div
                            className={`p-1.5 rounded ${
                                column.key === "PRI"
                                    ? "bg-blue-900/30 text-blue-400"
                                    : column.key === "MUL"
                                    ? "bg-purple-900/30 text-purple-400"
                                    : column.key === "UNI"
                                    ? "bg-yellow-700/40 text-yellow-400"
                                    : "bg-gray-700/40 text-gray-400"
                            }`}
                        >
                            {column.key === "PRI" ? (
                                <FaKey className="text-xs" />
                            ) : column.key === "MUL" ? (
                                <FaLink className="text-xs" />
                            ) : column.key === "UNI" ? (
                                <FaStar className="text-xs" />
                            ) : (
                                <FiColumns className="text-xs" />
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-gray-200 truncate">
                                {column.name}
                            </span>
                            <span className="text-xs text-gray-500 truncate">
                                {column.type}
                                {column.length ? `(${column.length})` : ""}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                        <span
                            className={`text-xs px-2 py-0.5 rounded ${
                                column.nullable === "YES"
                                    ? "bg-yellow-900/30 text-yellow-400"
                                    : "bg-green-900/30 text-green-400"
                            }`}
                        >
                            {column.nullable === "YES" ? "NULL" : "NOT NULL"}
                        </span>

                        {!isPrimaryKey && (
                            <button
                                className={`p-1 rounded-md ${
                                    onSelect
                                        ? "invisible group-hover:visible text-gray-400 hover:text-red-400"
                                        : "text-gray-500 hover:text-red-400"
                                } transition-colors`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete([column.name]);
                                }}
                                disabled={isDeleting}
                                title="Delete column"
                            >
                                <FiTrash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    },
);

const ColumnsList = () => {
    const { dbName, tableName } = useParams();
    const [tableDetails, setTableDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [multiSelectMode, setMultiSelectMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const fetchTableDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await getTableDetails(dbName, tableName);
            setTableDetails(data);
            setSelectedColumns([]);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to fetch table details",
            );
            toast.error("Failed to load table structure");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTableDetails();
    }, [dbName, tableName]);

    const filteredColumns =
        tableDetails?.columns?.filter((column) =>
            column.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ) || [];

    const handleDeleteColumns = async (columnsToDelete) => {
        if (!columnsToDelete || columnsToDelete.length === 0) return;

        const isPrimaryKey = tableDetails?.columns?.some(
            (col) => columnsToDelete.includes(col.name) && col.key === "PRI",
        );

        if (isPrimaryKey) {
            toast.error("Cannot delete primary key columns");
            return;
        }

        const confirmationMessage =
            columnsToDelete.length === 1
                ? `Delete column "${columnsToDelete[0]}"?`
                : `Delete ${columnsToDelete.length} selected columns?`;

        if (
            !window.confirm(
                `${confirmationMessage}\nThis action cannot be undone!`,
            )
        ) {
            return;
        }

        try {
            setActionLoading(true);
            await dropColumns(dbName, tableName, columnsToDelete);
            toast.success(
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-30 animate-[shimmer_1.5s_infinite]"></div>
                    <div className="font-medium relative z-10">
                        {columnsToDelete.length > 1
                            ? "Columns deleted successfully!"
                            : "Column deleted successfully!"}
                    </div>
                </div>,
                {
                    className: "bg-green-900/80 border border-green-700",
                    bodyClassName: "relative",
                },
            );
            setMultiSelectMode(false);
            setSelectedColumns([]);
            fetchTableDetails();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to delete columns",
            );
        } finally {
            setActionLoading(false);
        }
    };

    const toggleColumnSelection = (columnName, isSelected) => {
        setSelectedColumns((prev) =>
            isSelected
                ? [...prev, columnName]
                : prev.filter((name) => name !== columnName),
        );
    };

    const toggleMultiSelectMode = () => {
        setMultiSelectMode(!multiSelectMode);
        if (multiSelectMode) {
            setSelectedColumns([]);
            setSearchQuery("");
        }
    };

    const handleTruncateTable = async () => {
        if (
            !window.confirm(`Truncate ${tableName}? This will delete ALL data!`)
        ) {
            return;
        }

        try {
            setActionLoading(true);
            await truncateTable(dbName, tableName);
            toast.success(
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-30 animate-[shimmer_1.5s_infinite]"></div>
                    <div className="font-medium relative z-10">
                        Table truncated successfully!
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
            fetchTableDetails();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to truncate table",
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleDropTable = async () => {
        if (!window.confirm(`Drop ${tableName}? This cannot be undone!`)) {
            return;
        }

        try {
            setActionLoading(true);
            await dropTable(dbName, tableName);
            toast.success(
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-30 animate-[shimmer_1.5s_infinite]"></div>
                    <div className="font-medium relative z-10">
                        Table dropped successfully!
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
            navigate(`/home/${dbName}`, { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to drop table");
        } finally {
            setActionLoading(false);
        }
    };

    const clearSearch = () => setSearchQuery("");

    return (
        <div className="w-full min-w-60 h-screen bg-gray-800/90 backdrop-blur-sm border-r border-gray-700/50 overflow-y-auto flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FaDatabase className="text-blue-400" />
                        {tableName}
                    </h2>
                    <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full animate-pulse">
                        {loading ? "..." : tableDetails?.columns?.length || 0}
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
                        disabled={multiSelectMode}
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
            </div>

            {/* Table Info */}
            {!loading && !error && tableDetails && (
                <div className="p-4 border-b border-gray-700/50 bg-gray-800/60">
                    <div className="grid grid-cols-2  gap-3 text-sm">
                        <div className="text-gray-400">Engine:</div>
                        <div className="text-gray-300 font-mono text-right">
                            {tableDetails.engine || "-"}
                        </div>

                        <div className="text-gray-400">Rows:</div>
                        <div className="text-gray-300 font-mono text-right">
                            {tableDetails.rowCount?.toLocaleString() || "-"}
                        </div>

                        <div className="text-gray-400">Collation:</div>
                        <div className="text-gray-300 font-mono text-right">
                            {tableDetails.collation || "-"}
                        </div>

                        <div className="text-gray-400">Size:</div>
                        <div className="text-gray-300 font-mono text-right">
                            {tableDetails.size
                                ? `${tableDetails.size} MB`
                                : "-"}
                        </div>
                    </div>
                </div>
            )}

            {/* Column List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <Loader />
                ) : error ? (
                    <Error error={error} />
                ) : (
                    <div className="divide-y divide-gray-700/30">
                        {filteredColumns.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 text-sm animate-fadeIn">
                                {searchQuery
                                    ? `No columns found matching "${searchQuery}"`
                                    : "No columns found"}
                            </div>
                        ) : (
                            filteredColumns.map((column) => (
                                <div
                                    key={column.name}
                                    className="cursor-pointer"
                                >
                                    <ColumnItem
                                        column={column}
                                        selected={selectedColumns.includes(
                                            column.name,
                                        )}
                                        onSelect={
                                            multiSelectMode
                                                ? toggleColumnSelection
                                                : null
                                        }
                                        onDelete={handleDeleteColumns}
                                        isDeleting={actionLoading}
                                        isPrimaryKey={column.key === "PRI"}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-700/50 sticky bottom-0 bg-gray-800/90 backdrop-blur-sm flex flex-col gap-3">
                {multiSelectMode ? (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleDeleteColumns(selectedColumns)}
                            disabled={
                                actionLoading || selectedColumns.length === 0
                            }
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                                selectedColumns.length === 0
                                    ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                                    : "bg-red-900/40 hover:bg-red-800/50 border border-red-800 text-red-300 hover:text-white"
                            }`}
                        >
                            <FiMinus size={14} />
                            Delete{" "}
                            {selectedColumns.length > 0 &&
                                `(${selectedColumns.length})`}
                        </button>
                        <button
                            onClick={toggleMultiSelectMode}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/70 border border-gray-600 text-gray-300 rounded-md text-sm transition-all"
                        >
                            <FiX size={14} /> Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={toggleMultiSelectMode}
                        className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-gray-700/50 hover:bg-gray-600/70 border border-gray-600 text-gray-300 rounded-md text-sm transition-all"
                    >
                        <FiPlus size={14} /> Select Columns
                    </button>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={handleTruncateTable}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-900/40 hover:bg-yellow-800/50 border border-yellow-800 text-yellow-300 hover:text-white rounded-md text-sm transition-all"
                    >
                        <FiCopy size={14} /> Truncate
                    </button>
                    <button
                        onClick={handleDropTable}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-900/40 hover:bg-red-800/50 border border-red-800 text-red-300 hover:text-white rounded-md text-sm transition-all"
                    >
                        <FiTrash2 size={14} /> Drop
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ColumnsList;
