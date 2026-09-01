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
router.get("/orders/:id", getKitchenOrderById);
router.put("/accept/:id", acceptKitchenOrder);
router.put("/ready/:id", readyKitchenOrder);
router.put("/served/:id", servedKitchenOrder);

router.get("/display-screen", getDisplayScreen);

module.exports = router;