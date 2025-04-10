/* eslint-disable no-unused-vars */
import axios from "axios";
import { useState } from "react";
import {
    FiServer,
    FiDatabase,
    FiUser,
    FiLock,
    FiArrowRight,
    FiHardDrive,
    FiCloud,
} from "react-icons/fi";

const DBConnectForm = () => {
    const [activeTab, setActiveTab] = useState("localhost");
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null);

    const [dbConfig, setdbConfig] = useState({
        localhost: {
            type: "sqlite",
            host: "localhost",
            database: "./localdb.sqlite",
            user: "",
            password: "",
            port: "",
        },
        cloud: {
            type: "mysql",
            host: "localhost",
            port: "3306",
            database: "",
            user: "root",
            password: "",
        },
    });

    const handleInputChange = (e) => {
        setdbConfig((prev) => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [e.target.name]: e.target.value,
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsConnecting(true);
        setConnectionStatus(null);

        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_ACTUAL_BACKEND_URL}/db/connect-db`,
                {
                    ...dbConfig[activeTab],
                    environment: activeTab,
                },
            );

            setConnectionStatus({
                success: true,
                message: "Connection successful!",
            });
        } catch (error) {
            setConnectionStatus({
                success: false,
                message:
                    error.response?.data?.message ||
                    "Connection failed. Please check your credentials.",
            });
        } finally {
            setIsConnecting(false);
        }
    };

    const currentConfig = dbConfig[activeTab];

    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-gray-850 rounded-2xl shadow-xl p-8 space-y-6 border border-gray-700/50 backdrop-blur-sm"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Database Connection
                    </h2>
                    <p className="text-gray-400">
                        {activeTab === "localhost"
                            ? "Connect to local SQLite database"
                            : "Connect to cloud MySQL database"}
                    </p>
                </div>

                {/* Environment Tabs */}
                <div className="flex border-b border-gray-700 gap-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab("localhost")}
                        className={`flex-1 py-2 font-medium text-sm flex items-center justify-center gap-2 ${
                            activeTab === "localhost"
                                ? "text-blue-400 border-b-2 border-blue-500"
                                : "text-gray-400 hover:text-gray-300"
                        }`}
                    >
                        <FiHardDrive className="w-4 h-4" />
                        Localhost (SQLite)
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("cloud")}
                        className={`flex-1 py-2 font-medium text-sm flex items-center justify-center gap-2 ${
                            activeTab === "cloud"
                                ? "text-blue-400 border-b-2 border-blue-500"
                                : "text-gray-400 hover:text-gray-300"
                        }`}
                    >
                        <FiCloud className="w-4 h-4" />
                        Cloud (MySQL)
                    </button>
                </div>

                <div className="space-y-5">
                    {activeTab === "cloud" && (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                <FiServer className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                name="host"
                                value={currentConfig.host}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition text-white placeholder-gray-500"
                                placeholder="Server host"
                                required
                            />
                        </div>
                    )}

                    {activeTab === "cloud" && (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                <span className="text-sm">#</span>
                            </div>
                            <input
                                type="number"
                                name="port"
                                value={currentConfig.port}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition text-white placeholder-gray-500"
                                placeholder="Port"
                                required
                            />
                        </div>
                    )}

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                            <FiDatabase className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            name="database"
                            value={currentConfig.database}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition text-white placeholder-gray-500"
                            placeholder={
                                activeTab === "localhost"
                                    ? "Database file path"
                                    : "Database name"
                            }
                        />
                    </div>

                    {activeTab === "cloud" && (
                        <>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                    <FiUser className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    name="user"
                                    value={currentConfig.user}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition text-white placeholder-gray-500"
                                    placeholder="Username"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                    <FiLock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={currentConfig.password}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition text-white placeholder-gray-500"
                                    placeholder="Password"
                                    required={activeTab === "cloud"}
                                />
                            </div>
                        </>
                    )}
                </div>

                {connectionStatus && (
                    <div
                        className={`p-3 rounded-lg ${
                            connectionStatus.success
                                ? "bg-green-900/30 text-green-400"
                                : "bg-red-900/30 text-red-400"
                        }`}
                    >
                        {connectionStatus.message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isConnecting}
                    className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-850 ${
                        isConnecting ? "opacity-80 cursor-not-allowed" : ""
                    }`}
                >
                    {isConnecting ? (
                        <>
                            <svg
                                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Connecting...
                        </>
                    ) : (
                        <>
                            Connect to{" "}
                            {activeTab === "localhost" ? "SQLite" : "MySQL"}{" "}
                            Database
                            <FiArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>

                <div className="text-center text-sm text-gray-500 mt-4">
                    <p>Your credentials are encrypted during transmission</p>
                    {activeTab === "localhost" && (
                        <p className="mt-1">
                            SQLite database will be created if it doesn't exist
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default DBConnectForm;
