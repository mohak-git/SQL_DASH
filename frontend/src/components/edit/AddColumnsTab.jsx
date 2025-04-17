import { useState } from "react";
import { FiPlus, FiSave, FiTrash2 } from "react-icons/fi";
import ColumnForm from "../tables/createTableModal/ColumnForm";
import Error from "../../ui/Error";
import Loader from "../../ui/Loader";
import { addColumns } from "../../utils/api/axios";
import { FaColumns, FaPlus, FaTrash } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const AddColumnsTab = ({ dbName, tableName }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [newColumns, setNewColumns] = useState([]);

    const initialColumnState = {
        name: "",
        type: "VARCHAR(255)",
        notNull: false,
        defaultValue: "",
        autoIncrement: false,
        unique: false,
        primaryKey: false,
        checkExpression: "",
    };

    const saveChanges = async () => {
        if (!window.confirm("Are you sure you want to add these columns?"))
            return;
        if (newColumns.length === 0) {
            setError("No columns to add");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await addColumns(dbName, tableName, newColumns);
            setSuccessMessage(response.data.message);
            setTimeout(() => setSuccessMessage(null), 5000);
            setNewColumns([]);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add columns");
        } finally {
            setLoading(false);
        }
    };

    const addNewColumn = () =>
        setNewColumns((prev) => [...prev, initialColumnState]);
    const updateColumn = (index, field, value) => {
        setNewColumns((prev) =>
            prev.map((col, i) =>
                i === index ? { ...col, [field]: value } : col,
            ),
        );
    };
    const removeColumn = (index) =>
        setNewColumns((prev) => prev.filter((_, i) => i !== index));

    return (
        <div className="space-y-6">
            {/* Success/Error messages */}
            {successMessage && (
                <div className="bg-green-900/30 border border-green-700/50 text-green-400 p-4 rounded-lg backdrop-blur-sm flex items-center gap-3">
                    <FiSave className="flex-shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}
            {error && <Error error={error} />}

            {/* Header with Action Buttons */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-800/50 border border-gray-700">
                        <FaColumns className="text-blue-400 text-lg" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                        Add Columns
                    </h3>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={addNewColumn}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg transition-all shadow-lg hover:shadow-blue-500/20"
                    >
                        <FiPlus className="text-md" />
                        <span>Add Column</span>
                    </button>
                    <button
                        onClick={() => setNewColumns([])}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-70hover:bg-gray-600 text-white rounded-md transition-all border border-gray-600"
                        disabled={newColumns.length === 0}
                    >
                        <FaTrash className="text-md" />
                        <span>Clear All</span>
                    </button>
                </div>
            </div>

            {/* Columns List */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
                {newColumns.length > 0 ? (
                    <div className="space-y-4">
                        {newColumns.map((column, index) => (
                            <div key={index} className="relative group">
                                <ColumnForm
                                    column={column}
                                    index={index}
                                    updateColumn={updateColumn}
                                    removeColumn={removeColumn}
                                    isLastColumn={index === newColumns.length}
                                    isNew={index === newColumns.length}
                                />
                                <button
                                    onClick={() => removeColumn(index)}
                                    className="absolute -right-3 -top-3 p-1.5 bg-red-900/80 border border-red-700/50 text-red-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-800/70 hover:text-white"
                                    title="Remove column"
                                >
                                    <IoMdClose size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center bg-gray-900/30 rounded-lg border border-dashed border-gray-700/50">
                        <p className="text-gray-400">No columns added yet</p>
                        <button
                            onClick={addNewColumn}
                            className="mt-3 px-4 py-2 text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1.5 mx-auto"
                        >
                            <FiPlus /> Add your first column
                        </button>
                    </div>
                )}

                {/* Save Button */}
                {newColumns.length > 0 && (
                    <div className="flex justify-end mt-6">
                        <button
                            onClick={saveChanges}
                            disabled={loading || newColumns.length === 0}
                            className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-green-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader size="sm" /> : <FiSave />}
                            <span>Save Changes</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddColumnsTab;
