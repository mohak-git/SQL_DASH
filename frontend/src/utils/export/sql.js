const handleExportSQL = (data, filename = "data.sql") => {
    const blob = new Blob([data], { type: "application/sql" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export default handleExportSQL;
