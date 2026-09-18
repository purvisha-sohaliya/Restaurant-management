const router = require("express").Router();
const { createInventory, getInventory, getInventoryById, updateInventory, addStock, getLowStock, deleteInventory, getExpiredInventory } = require("../controllers/inventoryController");
const isAuth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post("/", isAuth, authorizeRoles("owner", "manager"), createInventory);
router.get("/", isAuth, authorizeRoles("owner", "manager"), getInventory);
router.patch("/:id/add-stock", isAuth, authorizeRoles("owner", "manager"), addStock);
router.get("/low-stock", isAuth, authorizeRoles("owner", "manager"), getLowStock);
router.get("/expired", isAuth, authorizeRoles("owner", "manager"), getExpiredInventory);
router.get("/:id", isAuth, authorizeRoles("owner", "manager"), getInventoryById);
router.put("/:id", isAuth, authorizeRoles("owner", "manager"), updateInventory);
router.delete("/:id", isAuth, authorizeRoles("owner"), deleteInventory);

module.exports = router;