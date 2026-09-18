const router = require("express").Router();
const { createRecipe, getRecipes, getRecipeById, updateRecipe, deleteRecipe } = require("../controllers/recipeController");
const isAuth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post("/", isAuth, authorizeRoles("owner", "manager"), createRecipe);
router.get("/", isAuth, authorizeRoles("owner", "manager"), getRecipes);
router.get("/:id", isAuth, authorizeRoles("owner", "manager"), getRecipeById);
router.put("/:id", isAuth, authorizeRoles("owner", "manager"), updateRecipe);
router.delete("/:id", isAuth, authorizeRoles("owner"), deleteRecipe);

module.exports = router;