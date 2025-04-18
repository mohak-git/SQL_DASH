import { View, Text } from "@react-pdf/renderer";
import styles from "./pdfStyles.jsx";

const PdfData = ({ data }) => {
    if (!data || data.length === 0) return null;

    const headers = Object.keys(data[0] || {});

    return (
        <View style={{ marginBottom: 30 }}>
            <View style={styles.table}>
                {/* Header Row */}
                <View style={styles.tableRow}>
                    {headers.map((header, i) => (
                        <View
                            key={i}
                            style={{
                                ...styles.tableColHeader,
                                width: `${100 / headers.length}%`,
                            }}
                        >
                            <Text>{header.replace(/_/g, " ")}</Text>
                        </View>
                    ))}
                </View>

                {/* Data Rows */}
                {data.map((row, rowIndex) => (
                    <View
                        key={rowIndex}
                        style={[
                            styles.tableRow,
                            rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow,
                        ]}
                    >
                        {headers.map((header, colIndex) => (
                            <View
                                key={colIndex}
                                style={{
                                    ...styles.tableCol,
                                    width: `${100 / headers.length}%`,
                                }}
                            >
                                <Text>{String(row[header] ?? "-")}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
};

export default PdfData;
