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
router.get("/search", searchByPhone);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

module.exports = router;