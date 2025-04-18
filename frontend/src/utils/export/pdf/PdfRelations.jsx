// PdfRelations.js
import { View, Text } from "@react-pdf/renderer";
import styles from "./pdfStyles.jsx";

const PdfRelations = ({ relations }) => {
    if (!relations || relations.length === 0) return null;

    const headers = ["Column", "Referenced Column", "Referenced Table"];

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

                {relations.map((rel, rowIndex) => (
                    <View
                        key={rowIndex}
                        style={[
                            styles.tableRow,
                            rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow,
                        ]}
                    >
                        <View style={{ ...styles.tableCol, width: "33.33%" }}>
                            <Text>{rel.COLUMN_NAME}</Text>
                        </View>
                        <View style={{ ...styles.tableCol, width: "33.33%" }}>
                            <Text>{rel.REFERENCED_COLUMN_NAME}</Text>
                        </View>
                        <View style={{ ...styles.tableCol, width: "33.33%" }}>
                            <Text>{rel.REFERENCED_TABLE_NAME}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default PdfRelations;
