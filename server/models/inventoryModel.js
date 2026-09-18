const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
    restaurant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },

    item_name: {
        type: String,
        required: true,
        trim: true
    },

    unit: {
        type: String,
        enum: ["kg", "gram", "liter", "ml", "piece"],
        required: true,
    },

    current_stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },

    stock_status: {
        type: String,
        enum: ["In Stock", "Low Stock", "Out of Stock"],
        default: "In Stock"
    },

    minimum_stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },

    expiry_date: {
        type: Date,
        default: null
    },

    purchase_price: {
        type: Number,
        default: 0,
        min: 0
    },

    is_deleted: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true,
        versionKey: false
    }
)

module.exports = mongoose.model("Inventory", inventorySchema);