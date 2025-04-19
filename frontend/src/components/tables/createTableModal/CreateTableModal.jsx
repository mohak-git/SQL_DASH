import { memo } from "react";
import { FaPlus, FaTimes, FaTable, FaColumns, FaTrash } from "react-icons/fa";
import Loader from "../../../ui/Loader.jsx";
import ColumnForm from "./ColumnForm.jsx";

const CreateTableModal = memo(
    ({ visible, loading, onClose, onSubmit, newTable, setNewTable }) => {
        const addNewColumn = () => {
            setNewTable((prev) => ({
                ...prev,
                columns: [
                    ...prev.columns,
                    {
                        name: "",
                        type: "VARCHAR(255)",
                        notNull: false,
                        defaultValue: "",
                        autoIncrement: false,
                        unique: false,
                        primaryKey: false,
                        checkExpression: "",
                    },
                ],
            }));
        };

        const clearAllColumns = () => {
            if (
                window.confirm(
                    "Are you sure you want to remove all columns? This cannot be undone.",
                )
            ) {
                setNewTable((prev) => ({
                    ...prev,
                    columns: [
                        {
                            name: "id",
                            type: "INT",
                            notNull: false,
                            defaultValue: "",
                            autoIncrement: false,
                            unique: false,
                            primaryKey: false,
                            checkExpression: "",
                        },
                    ],
                }));
            }
        };

        const removeColumn = (index) => {
            setNewTable((prev) => ({
                ...prev,
                columns: prev.columns.filter((_, i) => i !== index),
            }));
        };

        const updateColumn = (index, field, value) => {
            setNewTable((prev) => {
                const updatedColumns = [...prev.columns];
                updatedColumns[index] = {
                    ...updatedColumns[index],
                    [field]: value,
                };
                return {
                    ...prev,
                    columns: updatedColumns,
                };
            });
        };

        if (!visible) return null;

        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800/95 border border-gray-700/50 rounded-xl w-5/6 h-5/6 flex flex-col shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-800/80 border-b border-gray-700/50 p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
                                    <FaTable className="text-blue-400 text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Create New Table
                                    </h2>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Define your table structure
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white p-2 transition-colors"
                                disabled={loading}
                                title="Close dialog"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Table Name */}
                        <div>
                            <label className="block text-gray-300 mb-2 text-sm font-medium">
                                Table Name
                            </label>
                            <input
                                type="text"
                                value={newTable.name}
                                onChange={(e) =>
                                    setNewTable((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white placeholder-gray-400"
                                placeholder="e.g. users, products"
                                autoFocus
                                title="Enter table name (letters, numbers, underscores only)"
                            />
                        </div>

                        {/* Columns Header */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <FaColumns className="text-blue-400" />
                                <h3 className="text-lg font-medium text-gray-200">
                                    Table Columns
                                </h3>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={clearAllColumns}
                                    className="text-sm text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors px-3 py-2 bg-red-900/20 rounded-lg border border-red-800/50 disabled:opacity-50"
                                    disabled={newTable.columns.length <= 1}
                                    title="Reset all columns to default"
                                >
                                    <FaTrash className="w-3 h-3" />
                                    Clear All
                                </button>
                                <button
                                    onClick={addNewColumn}
                                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors px-3 py-2 bg-blue-900/20 rounded-lg border border-blue-800/50"
                                    title="Add new column"
                                >
                                    <FaPlus className="w-3 h-3" />
                                    Add Column
                                </button>
                            </div>
                        </div>

                        {/* Columns List */}
                        <div className="space-y-4">
                            {newTable.columns.map((column, index) => (
                                <ColumnForm
                                    key={index}
                                    column={column}
                                    index={index}
                                    updateColumn={updateColumn}
                                    removeColumn={removeColumn}
                                    isLastColumn={newTable.columns.length <= 1}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-800/80 border-t border-gray-700/50 p-4 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition border border-gray-600/50"
                            disabled={loading}
                            title="Cancel table creation"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={
                                loading ||
                                !newTable.name.trim() ||
                                newTable.columns.length === 0
                            }
                            className={`px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-70 shadow-md border border-blue-500/30`}
                            title={
                                !newTable.name.trim()
                                    ? "Table name is required"
                                    : newTable.columns.length === 0
                                    ? "At least one column is required"
                                    : "Create the new table"
                            }
                        >
                            {loading ? <Loader size="sm" /> : <FaPlus />}
                            Create Table
                        </button>
                    </div>
                </div>
            </div>
        );
    },
);

export default CreateTableModal;
