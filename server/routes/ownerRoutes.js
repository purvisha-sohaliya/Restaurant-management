const router = require("express").Router();
const { createOwner, getOwners, getOwnerById, updateOwner, deleteOwner, restoreOwner, changeOwnerStatus } = require("../controllers/ownerController");
const isAuth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post("/", isAuth, authorizeRoles("super_admin"), createOwner);
router.get("/", isAuth, authorizeRoles("super_admin"), getOwners);
router.get("/:id", getOwnerById);
router.put("/:id", isAuth, authorizeRoles("super_admin"), updateOwner);
router.delete("/:id", isAuth, authorizeRoles("super_admin"), deleteOwner);
router.patch("/:id/restore", restoreOwner);
router.patch("/:id/status", changeOwnerStatus);

module.exports = router;