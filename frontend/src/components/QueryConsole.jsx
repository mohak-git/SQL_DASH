import * as monaco from "monaco-editor";
import "monaco-sql-languages/esm/languages/mysql/mysql.contribution";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    FiAlertCircle,
    FiChevronDown,
    FiChevronUp,
    FiDatabase,
    FiLoader,
    FiPlay,
    FiRotateCcw,
    FiRotateCw,
    FiTerminal,
    FiTrash2,
} from "react-icons/fi";

import { FaSort } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "../../monacoSetup.js";
import Error from "../ui/Error.jsx";
import { getGenAISuggestion, getQueryExecuted } from "../utils/api/axios.js";
import CopyButton from "./common/CopyButton.jsx";
import debounce from "lodash.debounce";

// Editor configuration
const EDITOR_OPTIONS = {
    language: "mysql",
    theme: "vs-dark",
    automaticLayout: true,
    minimap: { enabled: true },
    fontSize: 14,
    fontFamily: "Fira Code, Menlo, Monaco, Consolas, monospace",
    scrollBeyondLastLine: false,
    renderLineHighlight: "gutter",
    lineNumbers: "on",
    roundedSelection: true,
    cursorBlinking: "smooth",
    tabSize: 2,
    scrollbar: {
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
        alwaysConsumeMouseWheel: false,
    },
    wordWrap: "on",
    renderWhitespace: "selection",
    renderIndentGuides: true,
    smoothScrolling: true,
    padding: { top: 12 },
    inlineSuggest: {
        enabled: true,
    },
};

// Initial queries
const INITIAL_QUERIES = {
    database: (dbName) => [
        ` `,
        `-- Database: ${dbName}`,
        ` `,
        `USE ${dbName};`,
        `SHOW TABLES;`,
    ],
    table: (dbName, tableName) => [
        ` `,
        `-- Table: ${tableName}`,
        ` `,
        `USE ${dbName};`,
        `SELECT * FROM ${tableName} LIMIT 100;`,
    ],
};

const getInitialContent = (dbName, tableName) => {
    const baseContent = [
        `-- Ctrl+Enter to execute`,
        `-- Wait 1.5 seconds to get ai suggestions`,
        ` `,
        `SHOW DATABASES;`,
        `SELECT VERSION() AS mysql_version;`,
    ];

    if (dbName && tableName)
        baseContent.push(...INITIAL_QUERIES.table(dbName, tableName));
    else if (dbName) baseContent.push(...INITIAL_QUERIES.database(dbName));

    return baseContent.filter(Boolean).join("\n");
};

const EditorControls = ({
    onExecute,
    onClear,
    query,
    isExecuting,
    undoEdit,
    redoEdit,
}) => (
    <>
        <CopyButton
            query={query}
            position="bottom-right"
            shortcutKey="(Ctrl+C)"
        />
        <div className="absolute bottom-4 right-15 flex z-50 gap-4">
            <button
                onClick={undoEdit}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md border border-gray-700 transition-all duration-200 hover:text-white"
                title="Undo (Ctrl+Z)"
            >
                <FiRotateCcw className="w-4 h-4" />
            </button>
            <button
                onClick={redoEdit}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md border border-gray-700 transition-all duration-200 hover:text-white"
                title="Redo (Ctrl+Y)"
            >
                <FiRotateCw className="w-4 h-4" />
            </button>

            <button
                onClick={onClear}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md border border-gray-700 transition-all duration-200 hover:text-white"
                title="Clear Editor (Ctrl+Shift+Del)"
            >
                <FiTrash2 className="w-4 h-4" />
            </button>
            <button
                onClick={onExecute}
                disabled={isExecuting}
                className={`p-2 rounded-lg shadow-lg flex items-center justify-center border transition-all duration-200 ${
                    isExecuting
                        ? "border-blue-800 bg-blue-900/30 text-blue-300 cursor-wait"
                        : "border-blue-600 bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/20"
                }`}
                title="Execute (Ctrl+Enter)"
            >
                {isExecuting ? (
                    <FiLoader className="animate-spin w-4 h-4" />
                ) : (
                    <FiPlay className="w-4 h-4" />
                )}
            </button>
        </div>
    </>
);

const ResultsHeader = ({ error, executionTime, rowsAffected }) => (
    <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50 backdrop-blur-sm">
        <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
            {error ? (
                <>
                    <FiAlertCircle className="text-red-400" size={18} />
                    <span className="text-red-300">Error</span>
                </>
            ) : (
                <>
                    <FiDatabase className="text-green-400" size={18} />
                    <span className="text-green-300">Results</span>
                </>
            )}
        </h4>
        {!error && (
            <div className="text-xs text-gray-400 font-mono">
                {executionTime} • {rowsAffected} row
                {rowsAffected !== 1 ? "s" : ""}
            </div>
        )}
    </div>
);

const ResultsTable = ({ fields, results }) => {
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: "asc",
    });

    const requestSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortedResults = useMemo(() => {
        if (!sortConfig.key) return results;

        return [...results].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue == null) return sortConfig.direction === "asc" ? -1 : 1;
            if (bValue == null) return sortConfig.direction === "asc" ? 1 : -1;

            if (!isNaN(aValue)) {
                return sortConfig.direction === "asc"
                    ? parseFloat(aValue) - parseFloat(bValue)
                    : parseFloat(bValue) - parseFloat(aValue);
            }

            return sortConfig.direction === "asc"
                ? String(aValue).localeCompare(String(bValue))
                : String(bValue).localeCompare(String(aValue));
        });
    }, [results, sortConfig]);

    return (
        <div className="overflow-x-auto h-full">
            <table className="min-w-full divide-y divide-gray-700/50">
                <thead className="bg-gray-800/70 sticky top-0 z-10 backdrop-blur-3xl">
                    <tr>
                        {fields.map((field) => (
                            <th
                                key={field.name}
                                className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors"
                                onClick={() => requestSort(field.name)}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{field.name}</span>
                                    {sortConfig.key === field.name ? (
                                        sortConfig.direction === "asc" ? (
                                            <FiChevronUp
                                                className="text-blue-400 ml-1"
                                                size={14}
                                            />
                                        ) : (
                                            <FiChevronDown
                                                className="text-blue-400 ml-1"
                                                size={14}
                                            />
                                        )
                                    ) : (
                                        <FaSort
                                            className="text-gray-500/60 ml-1"
                                            size={12}
                                        />
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-gray-900/30 divide-y divide-gray-700/30">
                    {sortedResults.map((row, i) => (
                        <tr
                            key={i}
                            className="hover:bg-gray-800/50 transition-colors"
                        >
                            {fields.map((field) => (
                                <td
                                    key={`${i}-${field.name}`}
                                    className="px-4 py-3 whitespace-nowrap text-sm text-gray-300"
                                >
                                    {row[field.name] !== null ? (
                                        <span
                                            className={`${
                                                typeof row[field.name] ===
                                                "number"
                                                    ? "text-blue-400 font-mono"
                                                    : ""
                                            } ${
                                                typeof row[field.name] ===
                                                "boolean"
                                                    ? row[field.name]
                                                        ? "text-green-400"
                                                        : "text-red-400"
                                                    : ""
                                            }`}
                                        >
                                            {String(row[field.name])}
                                        </span>
                                    ) : (
                                        <span className="text-gray-500/80 italic">
                                            NULL
                                        </span>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const JsonResults = ({ results }) => {
    const renderJson = (data) => {
        if (typeof data === "object" && data !== null) {
            if (Array.isArray(data)) {
                return (
                    <span>
                        {"["}
                        {data.map((item, index) => (
                            <div key={index} style={{ paddingLeft: "1rem" }}>
                                {renderJson(item)}
                                {index < data.length - 1 ? "," : ""}
                            </div>
                        ))}
                        {"]"}
                    </span>
                );
            } else {
                return (
                    <span>
                        {"{"}
                        {Object.entries(data).map(
                            ([key, value], index, arr) => (
                                <div key={key} style={{ paddingLeft: "1rem" }}>
                                    <span className="text-purple-400">
                                        "{key}"
                                    </span>
                                    <span className="text-white">: </span>
                                    <span>{renderJson(value)}</span>
                                    {index < arr.length - 1 ? "," : ""}
                                </div>
                            ),
                        )}
                        {"}"}
                    </span>
                );
            }
        } else if (typeof data === "string")
            return <span className="text-yellow-400">"{data}"</span>;
        else if (typeof data === "number")
            return <span className="text-blue-400">{data}</span>;
        else if (typeof data === "boolean")
            return <span className="text-pink-400">{data.toString()}</span>;
        else if (data === null)
            return <span className="text-gray-500">null</span>;
        else return <span>{String(data)}</span>;
    };

    return (
        <div className="text-sm bg-gray-900/50 p-4 rounded-lg h-full overflow-auto font-mono text-gray-300 whitespace-pre-wrap">
            {renderJson(results)}
        </div>
    );
};

const ErrorDisplay = ({ error }) => (
    <div className="p-4 space-y-3 h-full overflow-auto">
        <div className="text-red-300 text-sm font-medium">{error.message}</div>
        {error.code && (
            <div className="text-xs text-gray-400 bg-gray-800/50 p-2 rounded">
                <div>
                    <span className="text-gray-300">Error Code:</span>{" "}
                    {error.code}
                </div>
                {error.sqlState && (
                    <div>
                        <span className="text-gray-300">SQL State:</span>{" "}
                        {error.sqlState}
                    </div>
                )}
            </div>
        )}
        {error.query && (
            <div className="mt-4">
                <div className="text-xs text-gray-400 mb-1">Failed Query:</div>
                <div className="text-xs text-gray-300 font-mono bg-gray-900/50 p-2 rounded overflow-x-auto">
                    {error.query}
                </div>
            </div>
        )}
    </div>
);
const registerInlineSuggestion = (model, suggestionText) => {
    monaco.languages.registerInlineCompletionsProvider("mysql", {
        provideInlineCompletions: () => ({
            items: [
                {
                    text: suggestionText,
                    range: model.getFullModelRange(),
                    command: {
                        id: "applySuggestion",
                        title: "Apply Suggestion",
                    },
                },
            ],
            dispose: () => {},
        }),
    });

    monaco.languages.registerCompletionItemProvider("mysql", {
        provideCompletionItems: () => ({
            suggestions: [
                {
                    label: "AI autocomplete",
                    kind: monaco.languages.CompletionItemKind.Text,
                    insertText: suggestionText,
                    documentation: "Suggestion from Gemini Pro",
                },
            ],
        }),
    });
};

const QueryConsole = () => {
    const { dbName, tableName } = useParams();
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [queryResult, setQueryResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!editorRef.current) return;

        monacoRef.current = monaco.editor.create(editorRef.current, {
            value: getInitialContent(dbName, tableName),
            ...EDITOR_OPTIONS,
            suggest: {
                preview: true,
            },
        });

        // Add keyboard shortcuts
        monacoRef.current.addAction({
            id: "execute-query",
            label: "Execute Query",
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
            run: executeQuery,
        });

        monacoRef.current.addAction({
            id: "clear-editor",
            label: "Clear Editor",
            keybindings: [
                monaco.KeyMod.CtrlCmd |
                    monaco.KeyMod.Shift |
                    monaco.KeyCode.Delete,
            ],
            run: clearConsole,
        });

        monacoRef.current.addAction({
            id: "undo-edit",
            label: "Undo",
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ],
            run: undoEdit,
        });

        monacoRef.current.addAction({
            id: "redo-edit",
            label: "Redo",
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyY],
            run: redoEdit,
        });

        // Execute initial queries if context is provided
        const executeInitialQueries = async () => {
            setIsExecuting(true);
            setError(null);
            setQueryResult(null);

            try {
                let queries = [];
                if (dbName && tableName) {
                    queries = INITIAL_QUERIES.table(dbName, tableName).filter(
                        (line) =>
                            !line.startsWith("--") && line.trim().endsWith(";"),
                    );
                } else if (dbName) {
                    queries = INITIAL_QUERIES.database(dbName).filter(
                        (line) =>
                            !line.startsWith("--") && line.trim().endsWith(";"),
                    );
                }

                if (queries.length > 0) {
                    const result = await executeQueriesSequentially(queries);
                    setQueryResult(result);
                }
            } catch (err) {
                setError({
                    message: err.response?.data?.error?.message || err.message,
                    code: err.response?.data?.error?.code,
                    sqlState: err.response?.data?.error?.sqlState,
                });
            } finally {
                setIsExecuting(false);
            }
        };

        executeInitialQueries();

        const model = monacoRef.current.getModel();

        const handleChange = debounce(async () => {
            const code = model.getValue().trim();
            const suggestion = await fetchGenAISuggestion(code);
            if (suggestion) registerInlineSuggestion(model, suggestion);
            monacoRef.current.trigger(
                "keyboard",
                "editor.action.triggerSuggest",
                {},
            );
        }, 1500);

        model.onDidChangeContent(handleChange);

        return () => monacoRef.current?.dispose();
    }, [dbName, tableName]);

    const fetchGenAISuggestion = async (code) => {
        // const position = editor.getPosition();
        // const currentLine = editor
        //     .getModel()
        //     .getLineContent(position.lineNumber)
        //     .trim();

        // if (!currentLine) return null;

        try {
            const { data } = await getGenAISuggestion(code);
            return data.response;
        } catch (err) {
            console.log(`Failed to fetch AI suggestion: ${err.message}`);
            return null;
        }
    };

    const executeQueriesSequentially = async (queries) => {
        let lastResult = null;
        for (const query of queries) {
            const { data } = await getQueryExecuted(query);
            if (data.success) {
                lastResult = {
                    query: data.query,
                    results: data.results,
                    fields: data.fields,
                    executionTime: data.executionTime || "0.00s",
                    rowsAffected: Array.isArray(data.results)
                        ? data.results.length
                        : data.results.affectedRows || 0,
                };
            } else {
                throw new Error(
                    data.error?.message || "Query execution failed",
                );
            }
        }
        return lastResult;
    };

    const getQueryToExecute = () => {
        const editor = monacoRef.current;
        const selection = editor.getSelection();
        const model = editor.getModel();

        // Case 1: Selected text takes priority
        if (!selection.isEmpty()) {
            return model.getValueInRange(selection);
        }

        // Case 2: Get current line if no selection
        const currentLine = selection.startLineNumber;
        const lineContent = model.getLineContent(currentLine).trim();

        // Case 3: If current line is empty, find next non-empty line
        if (!lineContent) {
            let nextLine = currentLine + 1;
            while (nextLine <= model.getLineCount()) {
                const content = model.getLineContent(nextLine).trim();
                if (content) return content;
                nextLine++;
            }
            return lineContent;
        }

        // Case 4: Find full statement (until semicolon)
        if (lineContent.endsWith(";")) {
            return lineContent;
        }

        let endLine = currentLine;
        let statement = lineContent;

        // Search forward for semicolon
        while (endLine < model.getLineCount()) {
            endLine++;
            const nextLine = model.getLineContent(endLine).trim();
            statement += " " + nextLine;
            if (nextLine.endsWith(";")) break;
        }

        return statement;
    };

    const executeQuery = async () => {
        const query = getQueryToExecute().trim();
        if (!query) return;

        setIsExecuting(true);
        setError(null);
        setQueryResult(null);

        try {
            const { data } = await getQueryExecuted(query);

            if (data.success) {
                setQueryResult({
                    query: data.query,
                    results: data.results,
                    fields: data.fields,
                    executionTime: data.executionTime || "0.00s",
                    rowsAffected: Array.isArray(data.results)
                        ? data.results.length
                        : data.results.affectedRows || 0,
                });
                toast.success(
                    <div>
                        <div className="font-medium">
                            Query executed successfully
                        </div>
                        <div className="text-xs text-gray-300 mt-1">
                            {data.executionTime} •{" "}
                            {data.results.length || data.results.affectedRows}{" "}
                            row
                            {(data.results.length !== 1 ||
                                data.results.affectedRows !== 1) &&
                                "s"}
                        </div>
                    </div>,
                    { className: "bg-green-900/80 border border-green-700" },
                );
            } else {
                throw new Error(
                    data.error?.message || "Query execution failed",
                );
            }
        } catch (err) {
            setError({
                message: err.response?.data?.error?.message || err.message,
                code: err.response?.data?.error?.code,
                sqlState: err.response?.data?.error?.sqlState,
                query,
            });
            toast.error(
                <div>
                    <div className="font-medium">Query failed</div>
                    <div className="text-xs text-gray-300 mt-1">
                        {err.response?.data?.error?.message || err.message}
                    </div>
                </div>,
                { className: "bg-red-900/80 border border-red-700" },
            );
        } finally {
            setIsExecuting(false);
        }
    };

    const undoEdit = () => monacoRef.current?.trigger(null, "undo", null);

    const redoEdit = () => monacoRef.current?.trigger(null, "redo", null);

    const clearConsole = () => {
        monacoRef.current.setValue("");
        setQueryResult(null);
        setError(null);
        toast.info("Editor cleared", {
            className: "bg-blue-900/80 border border-blue-700",
        });
    };

    const renderEditorLayout = () => {
        if (queryResult || error) {
            return (
                <div className="flex h-full">
                    <div className="w-1/2 h-[90%] relative border-r border-gray-700/50">
                        <div ref={editorRef} className="h-full w-full" />
                        <EditorControls
                            onExecute={executeQuery}
                            onClear={clearConsole}
                            isExecuting={isExecuting}
                            query={getQueryToExecute}
                            undoEdit={undoEdit}
                            redoEdit={redoEdit}
                        />
                    </div>
                    <div className="w-1/2 h-[90%] overflow-hidden flex flex-col bg-gray-900/30">
                        <ResultsHeader
                            error={error}
                            executionTime={queryResult?.executionTime}
                            rowsAffected={queryResult?.rowsAffected}
                        />
                        <div className="flex-grow overflow-auto p-0">
                            {error ? (
                                <ErrorDisplay error={error} />
                            ) : Array.isArray(queryResult?.results) ? (
                                <ResultsTable
                                    fields={queryResult.fields}
                                    results={queryResult.results}
                                />
                            ) : (
                                <JsonResults results={queryResult?.results} />
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="h-[91%] relative">
                <div ref={editorRef} className="relative h-full w-full" />
                <EditorControls
                    onExecute={executeQuery}
                    onClear={clearConsole}
                    isExecuting={isExecuting}
                    query={getQueryToExecute}
                    undoEdit={undoEdit}
                    redoEdit={redoEdit}
                />
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all duration-300">
                        <FiTerminal className="text-blue-400 text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            SQL Console
                        </h1>
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                            {dbName && (
                                <>
                                    <span className="text-blue-300">
                                        {dbName}
                                    </span>
                                    {tableName && (
                                        <>
                                            <span className="text-gray-500">
                                                /
                                            </span>
                                            <span className="text-purple-300">
                                                {tableName}
                                            </span>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-grow bg-gray-850 rounded-xl border border-gray-700/50 overflow-hidden shadow-xl">
                <div className="p-4 border-b border-gray-700/50 flex justify-between items-center bg-gray-800/50 backdrop-blur-sm">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        <FiDatabase className="text-blue-400" />
                        Query Editor
                    </h3>
                    <div className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                        {monacoRef.current?.getModel()?.getLineCount() || 0}{" "}
                        lines
                    </div>
                </div>

                {renderEditorLayout()}
            </div>
        </div>
    );
};

export default QueryConsole;
