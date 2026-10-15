const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: [
                "super_admin",
                "owner",
                "manager",
                "waiter",
                "cashier",
                "kitchen"
            ],
            default: "owner",
            required: true
        },

        restaurant_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant"
        },

         subscription: {
            plan_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SubscriptionPlan",
                default: null
            },

            restaurant_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Restaurant",
                default: null
            },

            plan_type: {
                type: String,
                enum: ["trial", "monthly", "yearly"],
                default: null
            },

            status: {
                type: String,
                enum: ["active", "expired", "cancelled"],
                default: null
            },

            start_date: {
                type: Date,
                default: null
            },

            end_date: {
                type: Date,
                default: null
            }
        },

        status: {
            type: String,
            enum: ["active", "blocked"],
            default: "active"
        },

        is_deleted: {
            type: Boolean,
            default: false
        },

        refreshToken: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: 0
    }
);

module.exports = mongoose.model("Users", userSchema);