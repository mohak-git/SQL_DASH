const   Error = ({ error }) => {
    return (
        <div className="bg-red-900/20 border border-red-700/50 text-red-400 p-4 m-4 rounded-xl text-sm">
            <p>{error}</p>
        </div>
    );
};

export default Error;
