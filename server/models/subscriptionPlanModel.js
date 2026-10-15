const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema({
    plan_name: {
        type: String,
        required: true,
        trim: true
    },

    plan_type: {
        type: String,
        enum: ["trial", "monthly", "yearly"],
        required: true,
        unique: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    duration_days: {
        type: Number,
        required: true,
        min: 1
    },

    max_staff: {
        type: Number,
        required: true,
        min: 1
    },

    max_tables: {
        type: Number,
        default: 10
    },

    features: {
        type: [String],
        default: [],
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
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);