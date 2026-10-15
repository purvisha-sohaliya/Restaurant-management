const subscriptionPlanModel = require("../models/subscriptionPlanModel");
const restaurantModel = require("../models/restaurantModel");
const userModel = require("../models/userModel");

exports.createSubscriptionPlan = async (req, res, next) => {
    try {
        const {
            plan_name,
            plan_type,
            price,
            duration_days,
            max_staff,
            max_tables,
            features
        } = req.body;

        if (
            !plan_name ||
            !plan_type ||
            price === undefined ||
            duration_days === undefined ||
            max_staff === undefined
        ) {
            const error = new Error("All required fields are required");
            error.statusCode = 400;
            throw error;
        }

        const existingPlan = await subscriptionPlanModel.findOne({
            plan_type
        });

        if (existingPlan) {
            const error = new Error("Subscription plan already exists");
            error.statusCode = 409;
            throw error;
        }

        const plan = await subscriptionPlanModel.create({
            plan_name,
            plan_type,
            price,
            duration_days,
            max_staff,
            max_tables,
            features
        });

        res.status(201).json({
            success: true,
            message: "Subscription plan created successfully",
            data: plan
        });

    } catch (err) {
        next(err);
    }
};

exports.activateSubscription = async (req, res, next) => {
    try {
        const { owner_id, restaurant_id, plan_id } = req.body;

        if (!owner_id || !restaurant_id || !plan_id) {
            return res.status(400).json({
                success: false,
                message: "owner_id, restaurant_id and plan_id are required"
            });
        }

        const owner = await userModel.findOne({
            _id: owner_id,
            role: "owner",
            is_deleted: false
        });

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: "Owner not found"
            });
        }

        const restaurant = await restaurantModel.findOne({
            _id: restaurant_id,
            owner_id: owner._id,
            isDeleted: false
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found for this owner"
            });
        }

        const plan = await subscriptionPlanModel.findOne({
            _id: plan_id,
            status: "active",
            is_deleted: false
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "Active subscription plan not found"
            });
        }

        const startDate = new Date();
        const endDate = new Date(startDate);

        endDate.setDate(endDate.getDate() + plan.duration_days);

        // Save all subscription fields defined in userModel
        owner.subscription = {
            plan_id: plan._id,
            restaurant_id: restaurant._id,
            plan_type: plan.plan_type,
            status: "active",
            start_date: startDate,
            end_date: endDate
        };

        await owner.save();

        const remainingDays = Math.max(
            0,
            Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        );

        return res.status(200).json({
            success: true,
            message: "Subscription activated successfully",
            data: {
                owner_id: owner._id,
                restaurant_id: restaurant._id,
                plan_id: plan._id,
                plan_name: plan.plan_name,
                plan_type: plan.plan_type,
                status: owner.subscription.status,
                start_date: startDate,
                end_date: endDate,
                remaining_days: remainingDays
            }
        });

    } catch (error) {
        next(error);
    }
};

exports.getSubscriptionPlans = async (req, res, next) => {
    try {
        const plans = await subscriptionPlanModel.find({
            is_deleted: false
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Subscription plans fetched successfully",
            data: plans
        });

    } catch (err) {
        next(err);
    }
};

exports.updateSubscriptionPlan = async (req, res, next) => {
    try {
        const allowedFields = [
            "plan_name",
            "price",
            "duration_days",
            "max_staff",
            "max_tables",
            "features"
        ];

        const updateData = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        if (Object.keys(updateData).length === 0) {
            const error = new Error("No valid fields provided");
            error.statusCode = 400;
            throw error;
        }

        const plan = await subscriptionPlanModel.findOneAndUpdate(
            {
                _id: req.params.id,
                is_deleted: false
            },
            {
                $set: updateData
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!plan) {
            const error = new Error("Subscription plan not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            message: "Subscription plan updated successfully",
            data: plan
        });

    } catch (err) {
        next(err);
    }
};

exports.deleteSubscriptionPlan = async (req, res, next) => {
    try {
        const plan = await subscriptionPlanModel.findOneAndUpdate(
            {
                _id: req.params.id,
                is_deleted: false
            },
            {
                $set: { is_deleted: true }
            },
            {
                new: true
            }
        );

        if (!plan) {
            const error = new Error("Subscription plan not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            message: "Subscription plan deleted successfully"
        });

    } catch (err) {
        next(err);
    }
};

exports.changeSubscriptionPlanStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!["active", "inactive"].includes(status)) {
            const error = new Error("Invalid status");
            error.statusCode = 400;
            throw error;
        }

        const plan = await subscriptionPlanModel.findOneAndUpdate(
            {
                _id: req.params.id,
                is_deleted: false
            },
            {
                $set: { status }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!plan) {
            const error = new Error("Subscription plan not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            message: "Subscription plan status updated successfully",
            data: plan
        });

    } catch (err) {
        next(err);
    }
};

exports.getSubscriptionStatus = async (req, res, next) => {
  try {
    const ownerId = req.user.id; // અહીં id વાપરો, _id નહીં

    const owner = await userModel.findOne({
      _id: ownerId,
      role: "owner",
      is_deleted: false,
    }).select("subscription");

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }

    const subscription = owner.subscription;

    if (!subscription || !subscription.end_date) {
      return res.status(200).json({
        success: true,
        data: {
          status: "inactive",
          remaining_days: 0,
          start_date: null,
          end_date: null,
        },
      });
    }

    const now = new Date();
    const endDate = new Date(subscription.end_date);

    const remainingDays = Math.max(
      0,
      Math.ceil(
        (endDate.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    const status =
      remainingDays === 0 ? "expired" : subscription.status;

    return res.status(200).json({
      success: true,
      data: {
        status,
        plan_id: subscription.plan_id,
        restaurant_id: subscription.restaurant_id,
        plan_type: subscription.plan_type,
        start_date: subscription.start_date,
        end_date: subscription.end_date,
        remaining_days: remainingDays,
      },
    });
  } catch (error) {
    next(error);
  }
};