const router = require("express").Router();
const { createOwner, getOwners, getOwnerById, updateOwner, deleteOwner, restoreOwner, changeOwnerStatus } = require("../controllers/ownerController");
const isAuth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post("/", isAuth, authorizeRoles("super_admin"), createOwner);
router.get("/", isAuth, authorizeRoles("super_admin"), getOwners);
router.get("/:id", isAuth, authorizeRoles("super_admin"), getOwnerById);
router.put("/:id", isAuth, authorizeRoles("super_admin"), updateOwner);
router.delete("/:id", isAuth, authorizeRoles("super_admin"), deleteOwner);
router.patch("/:id/restore", isAuth, authorizeRoles("super_admin"), restoreOwner);
router.patch("/:id/status", isAuth, authorizeRoles("super_admin"), changeOwnerStatus);

module.exports = router;