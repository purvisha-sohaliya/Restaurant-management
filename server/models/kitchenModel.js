const mongoose = require("mongoose");

const kitchenSchema = new mongoose.Schema(
    {
        restaurant_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true
        },

        order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },

        waiter_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        },

        kot_no: {
            type: String,
            required: true,
            unique: true,
        },

        table_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Table",
            required: true,
        },

        items: [
            {
                menu_item_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "MenuItem",
                },

                name: String,
                quantity: Number,
                token_number: {
                    type: String,
                    required: true
                },

                note: String,
                status: {
                    type: String,
                    enum: ["Pending", "Preparing", "Ready", "Served"],
                    default: "Pending",
                },
            },
        ],

        kitchen_status: {
            type: String,
            enum: ["Pending", "Preparing", "Ready", "Served", "Cancelled"],
            default: "Pending",
        },

        stock_deducted: {
            type: Boolean,
            default: false
        },

        printed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model("kitchen", kitchenSchema);