import { PDFDownloadLink } from "@react-pdf/renderer";
import { FaFilePdf } from "react-icons/fa";
import MyDocument from "./PdfConfig.jsx";

const PDFDownloadButton = ({ dataToExport, filename, name }) => {
    return (
        <PDFDownloadLink
            document={
                <MyDocument
                    title={filename?.replace("-data.pdf", "")}
                    dataToExport={dataToExport}
                />
            }
            fileName={filename}
            style={{ textDecoration: "none" }}
        >
            {({ loading }) =>
                loading ? (
                    <button className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm transition-all duration-300 flex items-center gap-2 hover:bg-gray-600">
                        Preparing document...
                    </button>
                ) : (
                    <button
                        className={`px-4 py-2 ${
                            name.split(" ")[1] !== "Summary"
                                ? "bg-red-600 hover:bg-red-500"
                                : "bg-blue-600 hover:bg-blue-500"
                        } text-white rounded-lg text-sm transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg`}
                    >
                        <FaFilePdf /> {name}
                    </button>
                )
            }
        </PDFDownloadLink>
    );
};

export default PDFDownloadButton;
