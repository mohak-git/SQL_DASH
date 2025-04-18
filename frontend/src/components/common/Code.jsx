import { useEffect, useState } from "react";
import { FaDatabase, FaFileExport, FaFolderOpen } from "react-icons/fa";
import { GrMysql } from "react-icons/gr";
import { SiMysql } from "react-icons/si";
import { useParams } from "react-router-dom";
import Error from "../../ui/Error";
import Loader from "../../ui/Loader";
import {
    getDatabaseCode,
    getTableCode,
    mySqlDump,
} from "../../utils/api/axios";
import CopyButton from "./CopyButton";

// Custom Button Component
const Button = ({
    children,
    onClick,
    className = "",
    disabled = false,
    icon: Icon,
    ...props
}) => {
    return (
        <button
            className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                disabled
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
            } text-white ${className}`}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {Icon && <Icon className="text-lg" />}
            {children}
        </button>
    );
};

// Custom Modal Component
const Modal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <FaFileExport className="text-blue-400" />
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        &times;
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

const TableCode = ({ tableName, code }) => {
    return (
        <div className="group">
            <h3 className="text-xl font-bold text-white tracking-tight mb-2 flex items-center">
                <span className="text-gray-500 mr-2">/</span>
                <span className="text-white">{tableName}</span>
            </h3>
            <div className="relative">
                <pre className="text-md font-mono bg-gray-900/60 text-gray-300 p-4 rounded-lg overflow-x-auto border border-gray-700 whitespace-pre-wrap shadow-inner">
                    <code>{highlightSQL(code)};</code>
                </pre>
                <CopyButton query={code} />
            </div>
        </div>
    );
};

const PathInput = ({ value, onChange }) => {
    const handleSelectPath = async () => {
        try {
            const selectedPath = "/path/to/exports";
            onChange(selectedPath);
        } catch (err) {
            console.error("Error selecting path:", err);
        }
    };

    return (
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Export path (e.g., /path/to/exports)"
            />
            <button
                onClick={handleSelectPath}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                title="Select path"
            >
                <FaFolderOpen />
            </button>
        </div>
    );
};

const Code = () => {
    const { dbName, tableName } = useParams();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [password, setPassword] = useState("");
    const [exportPath, setExportPath] = useState("");
    const [exportLoading, setExportLoading] = useState(false);
    const [exportError, setExportError] = useState(null);
    const [exportSuccess, setExportSuccess] = useState(false);

    const handleGetTableCode = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await getTableCode(dbName, tableName);
            setCode(data.tables);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to export table");
            console.error("Error exporting table:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleGetDatabaseCode = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await getDatabaseCode(dbName);
            setCode(data.tables);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to export table");
            console.error("Error exporting table:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportClick = (e) => {
        e.stopPropagation();
        setShowExportModal(true);
        setExportError(null);
        setExportSuccess(false);
        setPassword("");
        setExportPath("");
    };

    const handleExportSubmit = async (e) => {
        e.preventDefault();
        try {
            setExportLoading(true);
            setExportError(null);

            await mySqlDump(dbName, tableName, password, exportPath);

            setExportSuccess(true);
            setTimeout(() => {
                setShowExportModal(false);
            }, 2000);
        } catch (err) {
            setExportError(
                err.response?.data?.message ||
                    "Export failed. Please check your password and try again.",
            );
            console.error("Export error:", err);
        } finally {
            setExportLoading(false);
        }
    };

    useEffect(() => {
        if (tableName) handleGetTableCode();
        else handleGetDatabaseCode();
    }, [dbName, tableName]);

    if (loading) return <Loader />;
    if (error) return <Error />;

    return (
        <div className="bg-gray-900/90 p-6 rounded-2xl shadow-lg border border-gray-700/50 flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-b-blue-900/50 pb-4">
                <div className="flex items-center gap-3">
                    <FaDatabase className="text-blue-400/80 text-xl" />
                    <span className="text-blue-300 text-xl font-semibold">
                        {dbName}
                    </span>
                    {tableName && (
                        <>
                            <span className="text-gray-500">/</span>
                            <span className="text-amber-300 text-xl font-semibold">
                                {tableName}
                            </span>
                        </>
                    )}
                </div>
                <Button onClick={handleExportClick} icon={SiMysql}>
                    Export SQL
                </Button>
            </div>

            <div className="space-y-6">
                {Object.entries(code).map(([tableName, tableCode]) => (
                    <TableCode
                        key={tableName}
                        tableName={tableName}
                        code={tableCode}
                    />
                ))}
            </div>

            {/* Export Modal */}
            <Modal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                title={`Export ${tableName || dbName}`}
            >
                <div className="space-y-5">
                    {exportSuccess ? (
                        <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-400 flex items-center gap-3">
                            <FaFileExport className="text-xl" />
                            <div>
                                <p className="font-semibold">
                                    Export successful!
                                </p>
                                <p className="text-sm text-green-300">
                                    The file has been saved to:{" "}
                                    {exportPath || "default location"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-300 mb-1 text-sm font-medium">
                                        Export Path
                                    </label>
                                    <PathInput
                                        value={exportPath}
                                        onChange={setExportPath}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Leave empty for default location
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1 text-sm font-medium">
                                        Database Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Your MySQL password"
                                        autoComplete="current-password"
                                    />
                                </div>
                            </div>

                            {exportError && (
                                <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
                                    {exportError}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    onClick={() => {
                                        setShowExportModal(false);
                                        setPassword("");
                                        setExportError(null);
                                    }}
                                    className="bg-gray-600 hover:bg-gray-700"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleExportSubmit}
                                    disabled={!password || exportLoading}
                                    icon={exportLoading ? undefined : GrMysql}
                                >
                                    {exportLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            Exporting...
                                        </span>
                                    ) : (
                                        "Export Now"
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Code;

const highlightSQL = (code) => {
    if (!code) return null;

    const keywords = new Set([
        "CREATE",
        "TABLE",
        "PRIMARY",
        "KEY",
        "NOT",
        "NULL",
        "DEFAULT",
        "AUTO_INCREMENT",
        "ENGINE",
        "CHARSET",
        "INSERT",
        "INTO",
        "VALUES",
        "DROP",
        "DATABASE",
        "USE",
        "INDEX",
        "FOREIGN",
        "REFERENCES",
        "ON",
        "UPDATE",
        "DELETE",
        "CONSTRAINT",
        "CHECK",
        "SET",
    ]);

    return code.split(/(\s+|[,();])/g).map((token, index) => {
        if (keywords.has(token.toUpperCase())) {
            return (
                <span key={index} className="text-blue-400 font-semibold">
                    {token}
                </span>
            );
        } else if (/^`.*`$/.test(token)) {
            return (
                <span key={index} className="text-pink-400">
                    {token}
                </span>
            );
        } else {
            return token;
        }
    });
};
