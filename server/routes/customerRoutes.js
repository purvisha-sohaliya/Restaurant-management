const router = require("express").Router();
const {
    createCustomer,
    getCustomers,
    getCustomerById,
    searchByPhone,
    updateCustomer,
    deleteCustomer
} = require("../controllers/customerController");
const isAuth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

// Customer routes
router.post("/", isAuth, authorizeRoles("owner", "manager", "waiter", "cashier"), createCustomer);
router.get("/", isAuth, authorizeRoles("owner", "manager", "waiter", "cashier"), getCustomers);
router.get("/search", isAuth, authorizeRoles("owner", "manager", "waiter", "cashier"), searchByPhone);
router.get("/:id", isAuth, authorizeRoles("owner", "manager", "waiter", "cashier"), getCustomerById);
router.put("/:id", isAuth, authorizeRoles("owner", "manager", "waiter", "cashier"), updateCustomer);
router.delete("/:id", isAuth, authorizeRoles("owner", "manager", "waiter", "cashier"), deleteCustomer);

module.exports = router;