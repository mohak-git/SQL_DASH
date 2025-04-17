import { View, Text } from "@react-pdf/renderer";
import styles from "./pdfStyles.jsx";

const MYSQL_KEYWORDS = [
    "CREATE",
    "TABLE",
    "NOT",
    "NULL",
    "PRIMARY",
    "KEY",
    "FOREIGN",
    "REFERENCES",
    "ON",
    "DELETE",
    "CASCADE",
    "DEFAULT",
    "ENGINE",
    "CHARSET",
    "COLLATE",
    "UNIQUE",
    "INDEX",
    "CONSTRAINT",
];

const PdfStructure = ({ structure }) => {
    if (!structure) return null;

    // Split SQL while preserving whitespace and words
    const tokens = structure.split(/(\s+)/);

    return (
        <View style={styles.section}>
            <Text style={styles.subheader}>Table Structure</Text>
            <View
                style={{
                    ...styles.sqlCode,
                    flexDirection: "row",
                    flexWrap: "wrap",
                }}
            >
                {tokens.map((token, i) => (
                    <Text
                        key={i}
                        style={
                            MYSQL_KEYWORDS.includes(token.trim().toUpperCase())
                                ? styles.sqlKeyword
                                : {}
                        }
                    >
                        {token}
                    </Text>
                ))}
            </View>
        </View>
    );
};

export default PdfStructure;
