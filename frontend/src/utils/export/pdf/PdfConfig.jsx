import { Document, Page, Text, View } from "@react-pdf/renderer";
import styles from "./pdfStyles.jsx";
import PdfStructure from "./PdfStructure.jsx";
import PdfColumns from "./PdfColumns.jsx";
import PdfRelations from "./PdfRelations.jsx";
import PdfIndexes from "./PdfIndexes.jsx";
import PdfData from "./PdfData.jsx";

const MyDocument = ({ title, dataToExport }) => {
    const { data, structure, meta } = dataToExport || {};
    const { columns, foreignKeys, indexes } = meta || {};

    const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <Document>
            {(structure || columns || foreignKeys || indexes) && (
                <Page size="A4" style={styles.page}>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Text style={styles.coverTitle}>{title}</Text>
                        <Text style={styles.coverSubtitle}>
                            MySQL Database Documentation
                        </Text>

                        <View
                            style={{
                                marginTop: 40,
                                padding: 20,
                                backgroundColor: styles.colors.mysqlLightBlue,
                                borderRadius: 8,
                                borderLeft: `4px solid ${styles.colors.mysqlOrange}`,
                            }}
                        >
                            <Text
                                style={{
                                    textAlign: "center",
                                    color: styles.colors.mysqlDarkBlue,
                                    fontSize: 12,
                                }}
                            >
                                Generated on: {currentDate}
                            </Text>
                        </View>
                    </View>

                    {/* Watermark */}
                    <Text
                        style={{
                            position: "absolute",
                            bottom: 60,
                            left: 0,
                            right: 0,
                            textAlign: "center",
                            color: styles.colors.mysqlLightBlue,
                            fontSize: 72,
                            opacity: 0.1,
                            fontWeight: "bold",
                        }}
                    >
                        MySQL
                    </Text>

                    <Text style={styles.footer}>© 2025 SQL Dash</Text>
                </Page>
            )}

            {/* Data Page */}
            {data && data.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <Text style={styles.header}>Table Data</Text>
                    <Text style={styles.date}>{currentDate}</Text>
                    <PdfData data={data} />
                    <Text style={styles.footer}>© 2025 SQL Dash</Text>
                </Page>
            )}

            {/* Structure Page */}
            {structure && (
                <Page size="A4" style={styles.page}>
                    <Text style={styles.header}>Table Structure</Text>
                    <Text style={styles.date}>{currentDate}</Text>
                    <PdfStructure structure={structure} />
                    <Text style={styles.footer}>© 2025 SQL Dash</Text>
                </Page>
            )}

            {/* Columns Page */}
            {columns && columns.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <Text style={styles.header}>Table Columns</Text>
                    <Text style={styles.date}>{currentDate}</Text>
                    <PdfColumns columns={columns} />
                    <Text style={styles.footer}>© 2025 SQL Dash</Text>
                </Page>
            )}

            {/* Relations Page */}
            {foreignKeys && foreignKeys.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <Text style={styles.header}>Foreign Key Relations</Text>
                    <Text style={styles.date}>{currentDate}</Text>
                    <PdfRelations relations={foreignKeys} />
                    <Text style={styles.footer}>© 2025 SQL Dash</Text>
                </Page>
            )}

            {/* Indexes Page */}
            {indexes && indexes.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <Text style={styles.header}>Table Indexes</Text>
                    <Text style={styles.date}>{currentDate}</Text>
                    <PdfIndexes indexes={indexes} />
                    <Text style={styles.footer}>© 2025 SQL Dash</Text>
                </Page>
            )}
        </Document>
    );
};

export default MyDocument;
