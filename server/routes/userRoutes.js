const express = require("express");
const { register, login, refreshAccessToken, getAllUsers, logout, profile } = require("../controllers/userController");
const isAuth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-access-token", refreshAccessToken);
router.get("/users", isAuth, authorizeRoles("super_admin"), getAllUsers);
router.get("/profile", isAuth, profile);
router.post("/logout", isAuth, logout);

module.exports = router;