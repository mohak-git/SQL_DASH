import { View, Text } from "@react-pdf/renderer";
import styles from "./pdfStyles.jsx";

const PdfColumns = ({ columns }) => {
    if (!columns || columns.length === 0) return null;

    const headers = ["Name", "Type", "Nullable", "Key", "Default", "Extra"];

    return (
        <View style={{ marginTop: 40 }}>
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    {headers.map((header, i) => (
                        <View
                            key={i}
                            style={{
                                ...styles.tableColHeader,
                                width: `${100 / headers.length}%`,
                            }}
                        >
                            <Text>{header}</Text>
                        </View>
                    ))}
                </View>

                {columns.map((col, rowIndex) => (
                    <View
                        key={rowIndex}
                        style={[
                            styles.tableRow,
                            rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow,
                        ]}
                    >
                        <View style={{ ...styles.tableCol, width: "16.66%" }}>
                            <Text>{col.COLUMN_NAME}</Text>
                        </View>
                        <View style={{ ...styles.tableCol, width: "16.66%" }}>
                            <Text>{col.COLUMN_TYPE}</Text>
                        </View>
                        <View style={{ ...styles.tableCol, width: "16.66%" }}>
                            <Text>{col.IS_NULLABLE}</Text>
                        </View>
                        <View style={{ ...styles.tableCol, width: "16.66%" }}>
                            <Text>{col.COLUMN_KEY || "-"}</Text>
                        </View>
                        <View style={{ ...styles.tableCol, width: "16.66%" }}>
                            <Text>{col.COLUMN_DEFAULT ?? "NULL"}</Text>
                        </View>
                        <View style={{ ...styles.tableCol, width: "16.66%" }}>
                            <Text>{col.EXTRA || "-"}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default PdfColumns;
