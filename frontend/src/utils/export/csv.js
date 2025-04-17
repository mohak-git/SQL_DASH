const handleExportCSV = (data, filename = "data.csv") => {
    if (!data || !data.length) return;

    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(","),
        ...data.map((row) =>
            headers
                .map((field) => {
                    const value = row[field] ?? "";
                    const sanitizedValue = `${value}`.replace(/"/g, '""');
                    return `"${sanitizedValue}"`;
                })
                .join(","),
        ),
    ];
    const csvString = csvRows.join("\n");

    const blob = new Blob([csvString], {
        type: "text/csv; charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export default handleExportCSV;
