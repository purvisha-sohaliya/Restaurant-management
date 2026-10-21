const router = require("express").Router();
const isAuth = require("../middleware/auth.middleware");
const { getDashboard, getMonthlyRevenue, getDailyOrders, getMonthlyOrders, getTopSellingItems, getOrderTypeDistribution } = require("../controllers/dashboardController");
const authorizeRoles = require("../middleware/role.middleware");

router.get("/", isAuth, getDashboard);
router.get("/revenue/monthly", isAuth, authorizeRoles("owner", "manager"), getMonthlyRevenue);
router.get("/orders/daily", isAuth, authorizeRoles("owner", "manager"), getDailyOrders);
router.get("/orders/monthly", isAuth, authorizeRoles("owner", "manager"), getMonthlyOrders);
router.get("/items/top-selling", isAuth, authorizeRoles("owner", "manager"), getTopSellingItems);
router.get("/orders/type-distribution", isAuth, authorizeRoles("owner", "manager"), getOrderTypeDistribution);

module.exports = router;