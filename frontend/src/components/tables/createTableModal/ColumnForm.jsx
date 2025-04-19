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
            className={`bg-gray-800/60 border rounded-xl p-5 mb-5 shadow-xl backdrop-blur-sm transition-all duration-300 ${
                isNew
                    ? "border-blue-500/60 ring-2 ring-blue-500/30 animate-pulse"
                    : "border-gray-700/70 hover:border-gray-600/80"
            }`}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <span className="text-blue-400 font-bold text-sm">
                            {index + 1}
                        </span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-300">
                        Column Configuration
                    </h4>
                </div>
                <button
                    onClick={() => removeColumn(index)}
                    className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-all ${
                        isLastColumn
                            ? "text-gray-500/80 bg-gray-800/20 border-gray-700/50 cursor-not-allowed"
                            : "text-red-400/90 hover:text-white hover:bg-red-500/20 border-red-900/40 hover:border-red-700/60"
                    } border`}
                    disabled={isLastColumn}
                    title={
                        isLastColumn
                            ? "At least one column is required"
                            : "Remove this column"
                    }
                >
                    <FaTrash className="w-3 h-3" />
                    <span>Remove</span>
                </button>
            </div>

            {/* Main Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                {/* Column Name */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <label className="block text-xs font-medium text-gray-300/90">
                            Column Name
                        </label>
                        <FaInfoCircle
                            className="text-gray-500/80 hover:text-blue-400 cursor-help text-xs"
                            title="Must be unique within the table (letters, numbers, underscores)"
                        />
                    </div>
                    <input
                        type="text"
                        value={column.name}
                        onChange={(e) =>
                            updateColumn(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/60 rounded-lg focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/70 outline-none transition text-white/90 text-sm placeholder-gray-500/60 hover:border-gray-600/70"
                        placeholder="e.g. username, email"
                    />
                </div>

                {/* Data Type */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-300/90">
                        Data Type
                    </label>
                    <div className="relative">
                        <select
                            value={column.type}
                            onChange={(e) =>
                                updateColumn(index, "type", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/60 rounded-lg focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/70 outline-none transition text-white/90 text-sm appearance-none hover:border-gray-600/70"
                            title="Select column data type"
                        >
                            {dataTypes.map((type) => (
                                <option
                                    key={type}
                                    value={type}
                                    className="bg-gray-800 text-white"
                                >
                                    {type}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-500/70">
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Default Value */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-300/90">
                        Default Value
                    </label>
                    <input
                        type="text"
                        value={column.defaultValue}
                        onChange={(e) =>
                            updateColumn(index, "defaultValue", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/60 rounded-lg focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/70 outline-none transition text-white/90 text-sm placeholder-gray-500/60 hover:border-gray-600/70"
                        placeholder="(optional)"
                        title="Enter default value for this column"
                    />
                </div>

                {/* Check Constraint */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-300/90">
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
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/60 rounded-lg focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/70 outline-none transition text-white/90 text-sm placeholder-gray-500/60 hover:border-gray-600/70"
                        placeholder="e.g. age > 18"
                        title="Enter SQL check constraint expression"
                    />
                </div>
            </div>

            {/* Constraints Toggles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div
                    className="flex items-center gap-2 p-2 bg-gray-800/40 rounded-lg hover:bg-gray-700/60 transition-colors cursor-pointer border border-gray-700/40 hover:border-gray-600/50"
                    title="Require this column to have a value (NOT NULL)"
                >
                    <input
                        type="checkbox"
                        id={`notNull-${index}`}
                        checked={column.notNull}
                        onChange={(e) =>
                            updateColumn(index, "notNull", e.target.checked)
                        }
                        className="w-4 h-4 text-blue-500/90 bg-gray-700/80 border-gray-600/70 rounded focus:ring-blue-400/80"
                    />
                    <label
                        htmlFor={`notNull-${index}`}
                        className="text-xs font-medium text-gray-300/90 cursor-pointer select-none"
                    >
                        NOT NULL
                    </label>
                </div>

                <div
                    className="flex items-center gap-2 p-2 bg-gray-800/40 rounded-lg hover:bg-gray-700/60 transition-colors cursor-pointer border border-gray-700/40 hover:border-gray-600/50"
                    title="Automatically increment values (AUTO INCREMENT)"
                >
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
                        className="w-4 h-4 text-blue-500/90 bg-gray-700/80 border-gray-600/70 rounded focus:ring-blue-400/80"
                    />
                    <label
                        htmlFor={`autoIncrement-${index}`}
                        className="text-xs font-medium text-gray-300/90 cursor-pointer select-none"
                    >
                        AUTO INCR
                    </label>
                </div>

                <div
                    className="flex items-center gap-2 p-2 bg-gray-800/40 rounded-lg hover:bg-gray-700/60 transition-colors cursor-pointer border border-gray-700/40 hover:border-gray-600/50"
                    title="Enforce unique values in this column (UNIQUE)"
                >
                    <input
                        type="checkbox"
                        id={`unique-${index}`}
                        checked={column.unique}
                        onChange={(e) =>
                            updateColumn(index, "unique", e.target.checked)
                        }
                        className="w-4 h-4 text-blue-500/90 bg-gray-700/80 border-gray-600/70 rounded focus:ring-blue-400/80"
                    />
                    <label
                        htmlFor={`unique-${index}`}
                        className="text-xs font-medium text-gray-300/90 cursor-pointer select-none"
                    >
                        UNIQUE
                    </label>
                </div>

                <div
                    className="flex items-center gap-2 p-2 bg-gray-800/40 rounded-lg hover:bg-gray-700/60 transition-colors cursor-pointer border border-gray-700/40 hover:border-gray-600/50"
                    title="Set this column as primary key (PRIMARY KEY)"
                >
                    <input
                        type="checkbox"
                        id={`primaryKey-${index}`}
                        checked={column.primaryKey}
                        onChange={(e) =>
                            updateColumn(index, "primaryKey", e.target.checked)
                        }
                        className="w-4 h-4 text-blue-500/90 bg-gray-700/80 border-gray-600/70 rounded focus:ring-blue-400/80"
                    />
                    <label
                        htmlFor={`primaryKey-${index}`}
                        className="text-xs font-medium text-gray-300/90 cursor-pointer select-none"
                    >
                        PRIMARY KEY
                    </label>
                </div>
            </div>
        </div>
    );
};

export default ColumnForm;
