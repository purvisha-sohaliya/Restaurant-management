const router = require("express").Router();
const { createRestaurant, getRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant, changeRestaurantStatus, recoverRestaurant } = require("../controllers/restaurantController");
const isAuth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

router.post("/", upload.single("logo"), createRestaurant);
router.get("/", isAuth, authorizeRoles("super_admin", "manager", "owner"), getRestaurants);
router.get("/:id", isAuth, authorizeRoles("super_admin", "manager", "owner"), getRestaurantById);
router.put("/:id", isAuth, authorizeRoles("super_admin", "owner"), updateRestaurant);
router.delete("/:id", isAuth, authorizeRoles("super_admin"), deleteRestaurant);
router.patch("/:id/recover", isAuth, authorizeRoles("super_admin"), recoverRestaurant);
router.patch("/:id/status", isAuth, authorizeRoles("super_admin"), changeRestaurantStatus);

module.exports = router;