const recipeModel = require("../models/recipeModel");

exports.createRecipe = async (req, res, next) => {
    try {
        const { menu_item_id, ingredients } = req.body;

        if (!menu_item_id || !ingredients || ingredients.length === 0) {
            const error = new Error("Menu item and ingredients are required");
            error.statusCode = 400;
            throw error;
        }

        const existingRecipe = await recipeModel.findOne({
            restaurant_id: req.user.restaurant_id,
            menu_item_id,
            is_deleted: false
        });

        if (existingRecipe) {
            const error = new Error("Recipe already exists for this menu item");
            error.statusCode = 400;
            throw error;
        }

        const recipe = await recipeModel.create({
            restaurant_id: req.user.restaurant_id,
            menu_item_id,
            ingredients
        });

        res.status(201).json({
            success: true,
            message: "Recipe created successfully",
            data: recipe
        });

    } catch (err) {
        next(err);
    }
}

exports.getRecipes = async (req, res, next) => {
    try {
        const recipes = await recipeModel.find({
            restaurant_id: req.user.restaurant_id,
            is_deleted: false
        }).populate("menu_item_id", "item_name")
            .populate("ingredients.inventory_id", "item_name unit")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: recipes.length,
            data: recipes
        });

    } catch (err) {
        next(err);
    }
}

exports.getRecipeById = async (req, res, next) => {
    try {
        const recipe = await recipeModel
            .findOne({
                _id: req.params.id,
                restaurant_id: req.user.restaurant_id,
                is_deleted: false
            })
            .populate("menu_item_id", "item_name")
            .populate("ingredients.inventory_id", "item_name unit");

        if (!recipe) {
            const error = new Error("Recipe not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: recipe
        });

    } catch (err) {
        next(err);
    }
};  

exports.updateRecipe = async (req, res, next) => {
    try {
        const { menu_item_id, ingredients } = req.body;

        const recipe = await recipeModel.findOne({
            _id: req.params.id,
            restaurant_id: req.user.restaurant_id,
            is_deleted: false
        });

        if (!recipe) {
            const error = new Error("Recipe not found");
            error.statusCode = 404;
            throw error;
        }

        if (menu_item_id) {
            recipe.menu_item_id = menu_item_id;
        }

        if (ingredients) {
            recipe.ingredients = ingredients;
        }

        await recipe.save();

        res.status(200).json({
            success: true,
            message: "Recipe updated successfully",
            data: recipe
        });

    } catch (err) {
        next(err);
    }
};

exports.deleteRecipe = async (req, res, next) => {
    try {
        const recipe = await recipeModel.findOne({
            _id: req.params.id,
            restaurant_id: req.user.restaurant_id,
            is_deleted: false
        });

        if (!recipe) {
            const error = new Error("Recipe not found");
            error.statusCode = 404;
            throw error;
        }

        recipe.is_deleted = true;

        await recipe.save();

        res.status(200).json({
            success: true,
            message: "Recipe deleted successfully"
        });

    } catch (err) {
        next(err);
    }
};