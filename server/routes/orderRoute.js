const router = require("express").Router();
const { createOrder, getOrders, getOrderById, changeOrderStatus, deleteOrder, getOrdersByTable, getPendingOrders, getCompletedOrders, addItemsToOrder, sendToKitchen } = require("../controllers/orderController");
const isAuth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post("/", isAuth, authorizeRoles("owner", "manager", "waiter", "cashier"), createOrder);
router.get("/", isAuth, authorizeRoles("owner", "manager", "waiter", "cashier", "kitchen"), getOrders);
router.get("/:id", isAuth, authorizeRoles("owner", "manager", "waiter", "cashier", "kitchen"), getOrderById);
router.patch("/:id/status", changeOrderStatus);
router.patch("/:id/items", isAuth, authorizeRoles("owner", "manager", "waiter"), addItemsToOrder);
router.delete("/:id", deleteOrder);
router.get("/table/:id", getOrdersByTable);
router.get("/pending", getPendingOrders);
router.get("/completed", getCompletedOrders);
router.put("/send-to-kitchen/:id", sendToKitchen);

module.exports = router;