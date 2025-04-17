import { useEffect, useRef } from "react";
import { FaInfoCircle, FaTrash } from "react-icons/fa";
import { dataTypes } from "./dataTypes.js";

const ColumnForm = ({
    column,
    index,
    updateColumn,
    removeColumn,
    isLastColumn,
    isNew,
}) => {
    const columnRef = useRef(null);

    useEffect(() => {
        if (isNew)
            columnRef.current?.querySelector('input[type="text"]')?.focus();
    }, [isNew]);
    return (
        <div
            ref={columnRef}
            className={`bg-gradient-to-br from-gray-800/70 to-gray-900/80 border rounded-xl p-5 mb-5 shadow-lg backdrop-blur-sm transition-all duration-300 group ${
                isNew
                    ? "border-blue-500/50 animate-pulse bg-blue-900/10"
                    : "border-gray-700 hover:border-gray-600"
            }`}
        >
            {" "}
            <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                    <span className="bg-blue-500/10 px-2 py-1 rounded-md text-blue-300">
                        Column #{index + 1}
                    </span>
                </h4>
                <button
                    onClick={() => removeColumn(index)}
                    className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition-all ${
                        isLastColumn
                            ? "text-gray-500 bg-gray-800/30 border-gray-700 cursor-not-allowed"
                            : "text-red-400 hover:text-white hover:bg-red-500/20 border-red-900/50 hover:border-red-700/70"
                    } border`}
                    disabled={isLastColumn}
                    title={
                        isLastColumn
                            ? "At least one column is required"
                            : "Remove column"
                    }
                >
                    <FaTrash className="w-3 h-3" />
                    <span>Remove</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
                <div className="space-y-1">
                    <div className="flex items-center gap-1">
                        <label className="block text-xs font-medium text-gray-300">
                            Column Name
                        </label>
                        <div className="group relative">
                            <FaInfoCircle className="text-gray-500 hover:text-blue-400 cursor-help" />
                            <span className="absolute hidden group-hover:block w-48 bg-gray-800 text-xs text-gray-300 p-2 rounded-md shadow-lg z-10 -left-48 top-0">
                                Must be unique within the table
                            </span>
                        </div>
                    </div>
                    <input
                        type="text"
                        value={column.name}
                        onChange={(e) =>
                            updateColumn(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 outline-none transition text-white text-sm placeholder-gray-500 hover:border-gray-600"
                        placeholder="e.g. username"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-300">
                        Data Type
                    </label>
                    <div className="relative">
                        <select
                            value={column.type}
                            onChange={(e) =>
                                updateColumn(index, "type", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 outline-none transition text-white text-sm appearance-none hover:border-gray-600"
                        >
                            {dataTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-500">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-300">
                        Default Value
                    </label>
                    <input
                        type="text"
                        value={column.defaultValue}
                        onChange={(e) =>
                            updateColumn(index, "defaultValue", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 outline-none transition text-white text-sm placeholder-gray-500 hover:border-gray-600"
                        placeholder="(optional)"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-300">
                        Check Constraint
                    </label>
                    <input
                        type="text"
                        value={column.checkExpression}
                        onChange={(e) =>
                            updateColumn(
                                index,
                                "checkExpression",
                                e.target.value,
                            )
                        }
                        className="w-full px-3 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 outline-none transition text-white text-sm placeholder-gray-500 hover:border-gray-600"
                        placeholder="e.g. age > 18"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2 p-2 bg-gray-800/40 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <input
                        type="checkbox"
                        id={`notNull-${index}`}
                        checked={column.notNull}
                        onChange={(e) =>
                            updateColumn(index, "notNull", e.target.checked)
                        }
                        className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-400"
                    />
                    <label
                        htmlFor={`notNull-${index}`}
                        className="text-xs font-medium text-gray-300 cursor-pointer"
                    >
                        NOT NULL
                    </label>
                </div>

                <div className="flex items-center space-x-2 p-2 bg-gray-800/40 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <input
                        type="checkbox"
                        id={`autoIncrement-${index}`}
                        checked={column.autoIncrement}
                        onChange={(e) =>
                            updateColumn(
                                index,
                                "autoIncrement",
                                e.target.checked,
                            )
                        }
                        className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-400"
                    />
                    <label
                        htmlFor={`autoIncrement-${index}`}
                        className="text-xs font-medium text-gray-300 cursor-pointer"
                    >
                        AUTO INCREMENT
                    </label>
                </div>

                <div className="flex items-center space-x-2 p-2 bg-gray-800/40 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <input
                        type="checkbox"
                        id={`unique-${index}`}
                        checked={column.unique}
                        onChange={(e) =>
                            updateColumn(index, "unique", e.target.checked)
                        }
                        className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-400"
                    />
                    <label
                        htmlFor={`unique-${index}`}
                        className="text-xs font-medium text-gray-300 cursor-pointer"
                    >
                        UNIQUE
                    </label>
                </div>

                <div className="flex items-center space-x-2 p-2 bg-gray-800/40 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <input
                        type="checkbox"
                        id={`primaryKey-${index}`}
                        checked={column.primaryKey}
                        onChange={(e) =>
                            updateColumn(index, "primaryKey", e.target.checked)
                        }
                        className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-400"
                    />
                    <label
                        htmlFor={`primaryKey-${index}`}
                        className="text-xs font-medium text-gray-300 cursor-pointer"
                    >
                        PRIMARY KEY
                    </label>
                </div>
            </div>
        </div>
    );
};

export default ColumnForm;
