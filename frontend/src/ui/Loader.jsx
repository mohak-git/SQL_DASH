import { FaSpinner, FaDatabase } from "react-icons/fa";
import { GiSpinningBlades } from "react-icons/gi";

const Loader = ({ message = "Executing query..." }) => {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 z-[9999] overflow-hidden">
            {/* Main loader */}
            <div className="relative flex flex-col items-center justify-center gap-4 z-10">
                <div className="relative">
                    <GiSpinningBlades className="text-5xl text-blue-400 animate-spin opacity-70" />
                    <FaSpinner className="absolute inset-0 m-auto text-3xl text-blue-500 animate-spin" />
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping opacity-0" />
                </div>

                <div className="text-center space-y-2">
                    <p className="text-blue-400 font-mono text-sm animate-pulse">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Loader;
