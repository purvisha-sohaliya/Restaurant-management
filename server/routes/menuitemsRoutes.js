const router = require("express").Router();
const { createMenuItem, getMenuItems, getMenuItemById, updateMenuItem, changeStatus, deleteMenuItem, restoreMenuItem, getMenuItemsByCategory } = require("../controllers/menuitemsController");
const isAuth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

router.post("/", isAuth, authorizeRoles("owner", "manager"), upload.single("image"), createMenuItem);
router.get("/", isAuth, authorizeRoles("owner", "manager", "waiter", "cashier", "kitchen"), getMenuItems);
router.get("/:id", getMenuItemById);
router.put("/:id", isAuth, authorizeRoles("owner", "manager"), upload.single("image"), updateMenuItem);
router.patch("/:id/status", changeStatus);
router.delete("/:id", isAuth, authorizeRoles("owner", "manager"), deleteMenuItem);
router.patch("/:id/restore", restoreMenuItem);

router.get("/category/:id", getMenuItemsByCategory);

module.exports = router;