import { FaSpinner } from "react-icons/fa";

const Loader = () => {
    return (
        <div className="top-0 fixed h-screen w-screen flex bg-gradient-to-br from-gray-900 to-gray-800 justify-center items-center py-10">
            <FaSpinner className="animate-spin text-xl text-blue-500" />
        </div>
    );
};

export default Loader;
