const router = require("express").Router();
const {
    generateBill,
    confirmPayment,
    getBills,
    getBillById,
} = require("../controllers/billingController");
const isAuth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

// Bill routes
router.post("/", isAuth, authorizeRoles("owner", "manager", "cashier"), generateBill);
router.get("/", isAuth, authorizeRoles("owner", "manager", "cashier"), getBills);
router.get("/:id", isAuth, authorizeRoles("owner", "manager", "cashier"), getBillById);
router.patch("/:id/pay", isAuth, authorizeRoles("owner", "manager", "cashier"), confirmPayment);

module.exports = router;