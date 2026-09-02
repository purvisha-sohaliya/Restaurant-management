const router = require("express").Router();
const { createOrder, getOrders, getOrderById, changeOrderStatus, getOrdersByTable, getPendingOrders, getCompletedOrders, addItemsToOrder, sendToKitchen } = require("../controllers/orderController");
const isAuth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post("/", isAuth, authorizeRoles("owner", "manager", "waiter", "cashier"), createOrder);
router.get("/", isAuth, authorizeRoles("owner", "manager", "waiter", "cashier", "kitchen"), getOrders);
router.get("/:id", isAuth, authorizeRoles("owner", "manager", "waiter", "cashier", "kitchen"), getOrderById);
router.patch("/:id/items", isAuth, authorizeRoles("owner", "manager", "waiter"), addItemsToOrder);
router.get("/table/:id", isAuth, authorizeRoles("owner", "manager", "waiter"), getOrdersByTable);
router.get("/pending", isAuth, authorizeRoles("owner", "manager", "waiter"), getPendingOrders);
router.get("/completed", isAuth, authorizeRoles("owner", "manager", "waiter"), getCompletedOrders);
router.put("/send-to-kitchen/:id", isAuth, authorizeRoles("owner", "manager", "waiter"), sendToKitchen);

module.exports = router;