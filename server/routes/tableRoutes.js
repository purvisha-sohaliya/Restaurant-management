const router = require("express").Router();
const { createTable, getAllTables, getTableById, updateTable, deleteTable, restoreTable, updateTableStatus } = require("../controllers/tableController");
const isAuth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post("/", isAuth, authorizeRoles("owner", "manager"), createTable);
router.get("/", isAuth, authorizeRoles("owner", "manager", "waiter", "cashier"), getAllTables);
router.get("/:id", getTableById);
router.put("/:id", isAuth, authorizeRoles("owner", "manager"), updateTable);
router.delete("/:id", deleteTable);
router.patch("/:id/restore", restoreTable);
router.patch("/:id/status", isAuth, authorizeRoles("owner", "manager", "waiter"), updateTableStatus);

module.exports = router;