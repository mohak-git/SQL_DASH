import { useEffect, useState } from "react";
import {
    FaDesktop,
    FaExclamationTriangle,
    FaMobileAlt,
    FaTabletAlt,
} from "react-icons/fa";
import { GiExpand } from "react-icons/gi";

const ScreenSizeWarning = () => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const deviceIcon =
        windowSize.width < 640 ? (
            <FaMobileAlt className="text-4xl group-hover:text-yellow-600" />
        ) : windowSize.width < 768 ? (
            <FaTabletAlt className="text-4xl group-hover:text-yellow-600" />
        ) : (
            <FaDesktop className="text-4xl group-hover:text-yellow-600" />
        );

    const funnyMessages = [
        "Who shrunk my browser? 🧐",
        "Is this a screen for ants? 🐜",
        "Congratulations on your new watch app! ⌚",
        "Did you find the 'zoom out' button yet? 🔍",
        "Even my grandma's flip phone is bigger 📞",
    ];
    const randomMessage =
        funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

    return (
        <div
            className={`fixed inset-0 z-[9999] bg-gray-900 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300`}
        >
            <div
                className={`relative bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-400/30 rounded-xl p-6 max-w-2xl w-full shadow-2xl shadow-yellow-400/10 transform transition-all duration-500`}
            >
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        <div className="absolute -inset-4 bg-yellow-400/10 rounded-full animate-ping opacity-75"></div>
                        <div className="relative bg-yellow-400/20 p-5 rounded-full border-2 border-yellow-400/30">
                            <FaExclamationTriangle className="text-4xl text-yellow-400 animate-bounce" />
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text">
                        {randomMessage}
                    </h3>

                    <p className="text-gray-300 mb-4">
                        This app needs some breathing room!
                        <br />
                        Try rotating your device or using a larger screen.
                    </p>

                    <div className="flex items-center justify-center gap-6 my-4">
                        <div className="flex flex-col items-center group">
                            <div className="p-3 bg-gray-700 rounded-lg group-hover:bg-yellow-400/20 transition-colors duration-300">
                                {deviceIcon}
                            </div>
                            <span className="text-xs text-gray-400 mt-2 group-hover:text-yellow-300 transition-colors duration-300">
                                {windowSize.width} × {windowSize.height}px
                            </span>
                        </div>

                        <div className="text-gray-500 text-2xl animate-pulse">
                            →
                        </div>

                        <div className="flex flex-col items-center group">
                            <div className="p-3 bg-gray-700 rounded-lg group-hover:bg-green-400/10 transition-colors duration-300">
                                <GiExpand className="text-4xl text-gray-500 group-hover:text-green-400 transition-colors duration-300" />
                            </div>
                            <span className="text-xs text-gray-400 mt-2 group-hover:text-green-300 transition-colors duration-300">
                                Min 1200px
                            </span>
                        </div>
                    </div>

                    <div className="text-xs text-yellow-400/70 mt-4 italic animate-pulse">
                        Pro tip: Try standing further from your screen
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScreenSizeWarning;
