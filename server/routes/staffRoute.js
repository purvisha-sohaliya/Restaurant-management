const router = require("express").Router();
const { createStaff, getStaff, getStaffByRestaurant, updateStaff, changeStaffStatus, deleteStaff, restoreStaff, getStaffById } = require("../controllers/staffController");
const isAuth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post("/", isAuth, authorizeRoles("owner", "manager"), createStaff);
router.get("/", isAuth, authorizeRoles("owner", "manager"), getStaff);
router.get("/:id", getStaffById);
router.get("/restaurant/:id", getStaffByRestaurant);
router.put("/:id", isAuth, authorizeRoles("owner", "manager"), updateStaff);
router.patch("/:id/status", changeStaffStatus);
router.delete("/:id", isAuth, authorizeRoles("owner", "manager"), deleteStaff);
router.patch("/:id/restore", restoreStaff);

module.exports = router;