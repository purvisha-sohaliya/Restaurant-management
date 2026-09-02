const router = require("express").Router();
const {
    getKitchenOrders,
    getKitchenOrderById,
    acceptKitchenOrder,
    readyKitchenOrder,
    servedKitchenOrder,
    getDisplayScreen
} = require("../controllers/kitchenController");
const isAuth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.get("/orders", isAuth, authorizeRoles("owner", "manager", "kitchen"), getKitchenOrders);
router.get("/orders/:id", isAuth, authorizeRoles("owner", "manager", "kitchen"), getKitchenOrderById);
router.put("/accept/:id", isAuth, authorizeRoles("owner", "manager", "kitchen"), acceptKitchenOrder);
router.put("/ready/:id", isAuth, authorizeRoles("owner", "manager", "kitchen"), readyKitchenOrder);
router.put("/served/:id", isAuth, authorizeRoles("owner", "manager", "kitchen"), servedKitchenOrder);

router.get("/display-screen", isAuth, authorizeRoles("owner", "manager", "kitchen"), getDisplayScreen);

module.exports = router;