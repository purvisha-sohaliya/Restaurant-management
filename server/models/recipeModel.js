const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
    restaurant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },

    menu_item_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true
    },

    ingredients: [
        {
            inventory_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Inventory",
                required: true
            },

            quantity: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],

    is_deleted: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model("Recipe", recipeSchema);