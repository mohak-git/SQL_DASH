import axios from "axios";
import { useEffect, useState } from "react";
import { FiLink, FiLoader, FiServer, FiWifi, FiWifiOff } from "react-icons/fi";
import { Link } from "react-router-dom";

const configBackendUrl = import.meta.env.VITE_CONFIG_BACKEND_URL;
const actualBackendUrl = import.meta.env.VITE_ACTUAL_BACKEND_URL;

const STATUS_CONFIG = {
    connecting: {
        label: "CONNECTING",
        color: "text-yellow-400",
        icon: <FiLoader className="animate-spin" />,
        bg: "bg-yellow-900/20",
    },
    connected: {
        label: "CONNECTED",
        color: "text-green-400",
        icon: <FiWifi />,
        bg: "bg-green-900/20",
    },
    error: {
        label: "ERROR",
        color: "text-red-400",
        icon: <FiWifiOff />,
        bg: "bg-red-900/20",
    },
};

const useBackendStatus = () => {
    const [status, setStatus] = useState("connecting");
    const [message, setMessage] = useState("Attempting to connect...");
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const checkStatus = async () => {
            if (!isMounted) return;
            setStatus("connecting");
            setError(null);
            try {
                const res = await axios.get("/api/status", { timeout: 4000 });
                if (isMounted) {
                    setStatus("connected");
                    setMessage(res.data.status || "Backend is operational");
                }
            } catch (err) {
                if (isMounted) {
                    setStatus("error");
                    const errMsg =
                        err.code === "ECONNABORTED"
                            ? "Connection timed out"
                            : err.response
                            ? `Proxy Error: ${err.response.status}`
                            : err.request
                            ? "Backend unreachable via proxy"
                            : `Error: ${err.message}`;
                    setMessage(errMsg);
                    setError(err.message);
                }
            }
        };

        checkStatus();
        const intervalId = setInterval(checkStatus, 7000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, []);

    return { status, message, error };
};

const InfoRow = ({ label, value, valueClass = "" }) => (
    <div className="flex justify-between">
        <span className="text-gray-400">{label}:</span>
        <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
);

const UrlDisplay = ({ label, url }) => (
    <div>
        <div className="text-gray-400 mb-1">{label}:</div>
        <code className="break-all bg-gray-900/50 p-2 rounded">{url}</code>
    </div>
);

const BackendStatusCard = ({ status, message, error }) => {
    const cfg = STATUS_CONFIG[status];
    return (
        <div className={`p-6 rounded-xl ${cfg.bg} border border-gray-700`}>
            <div className="flex items-center gap-3 mb-3">
                <div className={`text-2xl ${cfg.color}`}>{cfg.icon}</div>
                <h2 className="text-xl font-semibold">Backend Status</h2>
            </div>
            <div className="space-y-2">
                <InfoRow
                    label="Status"
                    value={cfg.label}
                    valueClass={cfg.color}
                />
                <InfoRow label="Message" value={message} />
            </div>
            {error && (
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg text-sm text-red-300">
                    <div className="font-medium mb-1">Error Details:</div>
                    <code className="break-all">{error}</code>
                </div>
            )}
        </div>
    );
};

const ConnectionUrls = () => (
    <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiServer /> Connection URLs
        </h3>
        <div className="space-y-3 text-sm">
            <UrlDisplay label="Config Backend URL" url={configBackendUrl} />
            <UrlDisplay label="Actual Backend URL" url={actualBackendUrl} />
        </div>
    </div>
);

const GetStartedSection = () => (
    <div className="flex flex-col justify-center items-center">
        <div className="text-center p-6">
            <h2 className="text-2xl font-bold mb-4">Get Started</h2>
            <p className="text-gray-400 mb-8">
                Connect to your database to begin managing your data
            </p>
            <Link
                to="/db-connection"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-850"
            >
                <FiLink /> Connect to Database
            </Link>
        </div>
    </div>
);

const SetupConnection = () => {
    const { status, message, error } = useBackendStatus();

    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 to-gray-800 flex place-items-center text-gray-100">
            <div className="container mx-auto px-4 py-12">
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                        Database Connection Manager
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Manage your database connections with this intuitive
                        interface
                    </p>
                </header>

                <div className="max-w-4xl mx-auto bg-gray-850 rounded-2xl shadow-xl p-8 border border-gray-700/50 backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <BackendStatusCard
                                status={status}
                                message={message}
                                error={error}
                            />
                            <ConnectionUrls />
                        </div>
                        <GetStartedSection />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetupConnection;
