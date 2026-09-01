const router = require("express").Router();
const { createRestaurant, getRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant, changeRestaurantStatus, recoverRestaurant } = require("../controllers/restaurantController");
const isAuth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post("/", isAuth, authorizeRoles("super_admin"), createRestaurant);
router.get("/", isAuth, authorizeRoles("super_admin", "manager", "owner"), getRestaurants);
router.get("/:id", getRestaurantById);
router.put("/:id", isAuth, authorizeRoles("super_admin", "owner"), updateRestaurant);
router.delete("/:id", isAuth, authorizeRoles("super_admin"), deleteRestaurant);
router.patch("/:id/recover", recoverRestaurant);
router.patch("/:id/status", changeRestaurantStatus);

module.exports = router;