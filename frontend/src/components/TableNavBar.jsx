import { memo } from "react";
import {
    FaCode as CodeIcon,
    FaDownload as DownloadIcon,
    FaEdit as EditIcon,
    FaChartBar as EyeIcon,
    FaTerminal as TerminalIcon,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import NavBar from "./common/NavBar";

const ViewModeItem = memo(({ item }) => {
    return (
        <NavLink
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
                `group relative flex justify-center items-center text-xl font-serif size-12 rounded-lg transition-all ${
                    isActive ? "text-purple-400" : "text-cyan-400"
                }`
            }
        >
            <span className="absolute group-hover:opacity-0 group-hover:scale-0 transition-all duration-500">
                <item.icon className="size-6 font-extralight" />
            </span>
            <span className="absolute text-center opacity-0 scale-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500">
                {item.name}
            </span>
        </NavLink>
    );
});

const TableNavBar = memo(() => {
    const viewModes = [
        {
            path: "",
            icon: EyeIcon,
            name: "Data",
            exact: true,
        },
        {
            path: "code",
            icon: CodeIcon,
            name: "Code",
        },
        {
            path: "edit",
            icon: EditIcon,
            name: "Edit",
        },
        {
            path: `query-console`,
            name: "Query Console",
            icon: TerminalIcon,
        },
        {
            path: "export",
            icon: DownloadIcon,
            name: "Export",
        },
    ];

    return (
        <div className="h-full bg-gray-900 border-b border-gray-700 py-10 flex flex-col justify-between">
            <NavBar />
            <ul className="flex flex-col justify-end items-center space-y-6">
                {viewModes.map((item) => (
                    <ViewModeItem key={item.path} item={item} />
                ))}
            </ul>
        </div>
    );
});

export default TableNavBar;
