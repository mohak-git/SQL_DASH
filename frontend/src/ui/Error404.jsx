import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { FiArrowLeft, FiHome, FiAlertTriangle, FiSearch } from "react-icons/fi";
import { GiAlienBug } from "react-icons/gi";

const Error404 = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "404 | SQL Dashboard";
    }, []);

    return (
        <div className="top-0 fixed h-screen w-screen flex bg-gradient-to-br from-gray-900 to-gray-800 justify-center items-center py-10">
            <div className="bg-gray-850 w-2/5 rounded-2xl shadow-xl p-8 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    {/* Left Side - Minimalist 404 Animation */}
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-blue-900/20 rounded-full blur-xl opacity-30 -z-10" />
                            <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                                404
                            </h1>
                        </div>
                        <GiAlienBug className="text-4xl text-green-400 mt-4 animate-float" />
                    </div>

                    {/* Right Side - Error Message & Actions */}
                    <div className="flex-1 space-y-5">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                            Whoops! Page Not Found.
                        </h2>

                        <div className="space-y-3">
                            <p className="text-gray-300">
                                <strong>Possible reasons:</strong>
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-gray-400">
                                <li>
                                    This page got{" "}
                                    <code className="bg-gray-800 px-1 rounded">
                                        DROP TABLE
                                    </code>
                                    'd
                                </li>
                                <li>
                                    You tried{" "}
                                    <code className="bg-gray-800 px-1 rounded">
                                        SELECT * FROM imagination
                                    </code>
                                </li>
                                <li>Aliens. Definitely aliens.</li>
                            </ul>

                            {/* SQL Error Box */}
                            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 mt-3">
                                <div className="flex items-center gap-2 text-yellow-400">
                                    <FiAlertTriangle className="text-lg" />
                                    <span className="font-mono text-sm">
                                        ERROR: PageNotFoundException
                                    </span>
                                </div>
                                <div className="flex items-start gap-2 mt-1 text-sm text-gray-400">
                                    <FiSearch className="flex-shrink-0 mt-0.5" />
                                    <span>
                                        No results for{" "}
                                        <code className="bg-gray-800 px-1 rounded">
                                            WHERE url = 'this_page'
                                        </code>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-300 border border-gray-600 hover:border-gray-500 text-sm"
                            >
                                <FiArrowLeft /> Rollback
                            </button>
                            <button
                                onClick={() => navigate("/")}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                            >
                                <FiHome /> Return Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Error404;
