import { Router } from "express";
import {
    handleViewTableData,
    handleDropTable,
    handleExportTable,
    handleAddColumns,
    handleTruncateTable,
    handleGetTableDetails,
    handleCreateTable,
    handleDeleteColumns,
    handleAddConstraints,
    handleDropConstraints,
    handleGetConstraints,
    handleGetTableCode,
    handleInsertDataIntoTable,
    handleDeleteDataFromTable,
    handleDumpDatabase,
    handleRenameTable,
} from "../controller/table.controller.js";

const router = Router({ mergeParams: true });

router.get("/details", handleGetTableDetails);
router.post("/create", handleCreateTable);
router.get("/data", handleViewTableData);

router.get("/code", handleGetTableCode);
router.patch("/add-columns", handleAddColumns);
router.patch("/delete-columns", handleDeleteColumns);
router
    .route("/constraints")
    .get(handleGetConstraints)
    .post(handleAddConstraints)
    .delete(handleDropConstraints);

router.delete("/drop", handleDropTable);
router.put("/rename", handleRenameTable);
router.get("/export", handleExportTable);
router.delete("/truncate", handleTruncateTable);

router
    .route("/data-manipulate")
    .post(handleInsertDataIntoTable)
    .delete(handleDeleteDataFromTable);

router.route("/dump").get(handleDumpDatabase);

export default router;
