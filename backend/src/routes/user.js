const express = require("express");

const UserApi = require("../api/user");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.get("/", authMiddleware(['admin']),UserApi.findUsers); 
router.get("/context", authMiddleware(), UserApi.findContext);

router.put("/:id", authMiddleware(), UserApi.updateUser);
router.delete("/:id", authMiddleware(), UserApi.deleteUser);
router.post("/admin", authMiddleware(['admin']), UserApi.createUser);
router.post("/verify-email", UserApi.verifyEmailToken);


module.exports = router;