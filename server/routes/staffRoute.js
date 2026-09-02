const router = require("express").Router();
const { createStaff, getStaff, getStaffByRestaurant, updateStaff, changeStaffStatus, deleteStaff, restoreStaff, getStaffById } = require("../controllers/staffController");
const isAuth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post("/", isAuth, authorizeRoles("owner", "manager"), createStaff);
router.get("/", isAuth, authorizeRoles("owner", "manager"), getStaff);
router.get("/:id", isAuth, authorizeRoles("owner", "manager"), getStaffById);
router.get("/restaurant/:id", isAuth, authorizeRoles("owner", "manager"), getStaffByRestaurant);
router.put("/:id", isAuth, authorizeRoles("owner", "manager"), updateStaff);
router.patch("/:id/status", isAuth, authorizeRoles("owner", "manager"), changeStaffStatus);
router.delete("/:id", isAuth, authorizeRoles("owner", "manager"), deleteStaff);
router.patch("/:id/restore", isAuth, authorizeRoles("owner", "manager"), restoreStaff);

module.exports = router;