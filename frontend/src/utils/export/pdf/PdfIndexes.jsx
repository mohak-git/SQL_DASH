// PdfIndexes.js
import { View, Text } from "@react-pdf/renderer";
import styles from "./pdfStyles.jsx";

const PdfIndexes = ({ indexes }) => {
    if (!indexes || indexes.length === 0) return null;

    const headers = ["Name", "Column", "Unique", "Type", "Order"];

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

                {indexes.map((idx, rowIndex) => (
                    <View
                        key={rowIndex}
                        style={[
                            styles.tableRow,
                            rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow,
                        ]}
                    >
                        <View style={{ ...styles.tableCol, width: "20%" }}>
                            <Text>{idx.Key_name}</Text>
                        </View>
                        <View style={{ ...styles.tableCol, width: "20%" }}>
                            <Text>{idx.Column_name}</Text>
                        </View>
                        <View style={{ ...styles.tableCol, width: "20%" }}>
                            <Text>{idx.Non_unique === 0 ? "Yes" : "No"}</Text>
                        </View>
                        <View style={{ ...styles.tableCol, width: "20%" }}>
                            <Text>{idx.Index_type}</Text>
                        </View>
                        <View style={{ ...styles.tableCol, width: "20%" }}>
                            <Text>Asc</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default PdfIndexes;
