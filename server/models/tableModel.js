const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
    {
        restaurant_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true
        },

        tableNumber: {
            type: String,
            required: true,
            trim: true,
        },

        customer_name: {
            type: String,
            default: ""
        },

        capacity: {
            type: Number,
            required: true,
            min: 1,
        },

        status: {
            type: String,
            enum: [
                "available",
                "occupied",
                "reserved",
                "cleaning",
            ],
            default: "available",
        },

        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

tableSchema.index(
    { restaurant_id: 1, tableNumber: 1 },
    { unique: true }
);

module.exports = mongoose.model("Table", tableSchema);