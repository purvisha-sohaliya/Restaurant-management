const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
    {
        restaurant_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true
        },

        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        item_name: {
            type: String,
            required: true
        },

        description: {
            type: String,
            default: ""
        },

        price: {
            type: Number,
            required: true
        },

        image: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },

        is_deleted: {
            type: Boolean,
            default: false
        }

    },
    {
        timestamps: true
    });

menuItemSchema.index(
    {
        restaurant_id: 1,
        category_id: 1,
        item_name: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);