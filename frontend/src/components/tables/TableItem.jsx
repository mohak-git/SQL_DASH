import { memo } from "react";
import { FaChevronRight, FaPen, FaTable, FaTrash } from "react-icons/fa";

const TableItem = memo(({ table, onClick, onDelete, onRename }) => {
    return (
        <div className="group relative p-3 px-4 transition-all duration-200 hover:bg-gray-700/50 hover:scale-[1.01] hover:shadow-md rounded-md">
            <div
                onClick={onClick}
                className="cursor-pointer flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-gray-700/40 group-hover:bg-gray-600/60 transition-colors duration-200">
                        <FaTable className="text-sm text-gray-400 group-hover:text-white transition-colors duration-200" />
                    </div>
                    <span className="truncate text-gray-300 group-hover:text-white transition-colors duration-200 ">
                        {table.tableName}
                    </span>
                </div>
                <FaChevronRight className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors duration-200" />
            </div>
            <button
                onClick={onDelete}
                className="absolute right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1 transition-opacity duration-200"
                title="Delete table"
            >
                <FaTrash className="text-sm" />
            </button>
            <button
                onClick={onRename}
                className="absolute right-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-yellow-400 hover:text-yellow-300 p-1 transition-opacity duration-200"
                title="Rename table"
            >
                <FaPen className="text-sm" />
            </button>
        </div>
    );
});

export default TableItem;
