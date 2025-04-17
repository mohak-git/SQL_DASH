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
                <div className="bg-gray-800 h-5/6 w-5/6 rounded-xl p-6 border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="space-y-4 flex-shrink-0">
                            <div className="sticky top-0 bg-gray-800 z-10 pb-4 space-y-4 border-b border-gray-700">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <FaTable className="text-blue-400" />
                                        Create New Table
                                    </h3>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-white p-1 transition-colors"
                                        disabled={loading}
                                    >
                                        <FaTimes className="text-xl" />
                                    </button>
                                </div>

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
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white placeholder-gray-400"
                                        placeholder="e.g. users, products"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex justify-between items-center">
                                    <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                                        <FaColumns className="text-blue-400" />
                                        Table Columns
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={clearAllColumns}
                                            className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors px-3 py-1.5 bg-red-900/20 rounded-lg border border-red-800/50"
                                            disabled={
                                                newTable.columns.length <= 1
                                            }
                                        >
                                            <FaTrash className="w-3 h-3" />
                                            Clear All
                                        </button>
                                        <button
                                            onClick={addNewColumn}
                                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors px-3 py-1.5 bg-blue-900/20 rounded-lg border border-blue-800/50"
                                        >
                                            <FaPlus className="w-3 h-3" />
                                            Add Column
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable content area */}
                        <div className="flex-1 overflow-y-auto pt-2">
                            <div className="space-y-3">
                                {newTable.columns.map((column, index) => (
                                    <ColumnForm
                                        key={index}
                                        column={column}
                                        index={index}
                                        updateColumn={updateColumn}
                                        removeColumn={removeColumn}
                                        isLastColumn={
                                            newTable.columns.length <= 1
                                        }
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Footer buttons */}
                        <div className="flex-shrink-0 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-700">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                                disabled={loading}
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
                                className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-70 shadow-md`}
                            >
                                {loading ? <Loader /> : <FaPlus />}
                                Create Table
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
);

export default CreateTableModal;
