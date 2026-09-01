const router = require("express").Router();
const { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory, restoreCategory, changeCategoryStatus } = require("../controllers/categoryController");
const isAuth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

router.post("/", isAuth, authorizeRoles("owner", "manager"), upload.single("image"), createCategory);
router.get("/", isAuth, authorizeRoles("owner", "manager", "waiter", "cashier", "kitchen"), getCategories);
router.get("/:id", getCategoryById);
router.put("/:id", isAuth, authorizeRoles("owner", "manager"), upload.single("image"), updateCategory);
router.delete("/:id", isAuth, authorizeRoles("owner", "manager"), deleteCategory);
router.patch("/:id/restore", restoreCategory);
router.patch("/:id/status", changeCategoryStatus);

module.exports = router;