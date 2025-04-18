import { Router } from "express";
import {
    handleAddUser,
    handleFlushPrivileges,
    handleGetUserGrants,
    handleGrantPrivileges,
    handleListDBUsers,
    handleRemoveUser,
    handleRevokePrivileges,
} from "../controller/user.controller.js";

const router = Router();

router
    .route("/")
    .get(handleListDBUsers)
    .post(handleAddUser)
    .delete(handleRemoveUser);
router.get("/privileges", handleGetUserGrants);
router.post("/grant", handleGrantPrivileges);
router.post("/revoke", handleRevokePrivileges);
router.post("/flush", handleFlushPrivileges);

export default router;
