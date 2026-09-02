const router = require("express").Router();
const {
    addToWaiting,
    getWaitingList,
    getWaitingEntryById,
    seatCustomer,
    updateWaitingStatus,
    updateWaitTime,
    deleteWaitingEntry
} = require("../controllers/waitingController");
const isAuth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post("/", isAuth, authorizeRoles("owner", "manager", "waiter"), addToWaiting);
router.get("/", isAuth, authorizeRoles("owner", "manager", "waiter"), getWaitingList);
router.get("/:id", isAuth, authorizeRoles("owner", "manager", "waiter"), getWaitingEntryById);
router.patch("/:id/seat", isAuth, authorizeRoles("owner", "manager", "waiter"), seatCustomer);
router.patch("/:id/status", isAuth, authorizeRoles("owner", "manager", "waiter"), updateWaitingStatus);
router.patch("/:id/wait-time", isAuth, authorizeRoles("owner", "manager", "waiter"), updateWaitTime);
router.delete("/:id", isAuth, authorizeRoles("owner", "manager", "waiter"), deleteWaitingEntry);

module.exports = router;