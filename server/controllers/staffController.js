const userModel = require("../models/userModel");
const { hashPassword } = require("../utils/bcryptHelper");

exports.createStaff = async (req, res, next) => {
    try {
        const { name, email, password, phone, role } = req.body;

        const hashedPassword = await hashPassword(password);

        const staff = await userModel.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role,
            restaurant_id: req.user.restaurant_id
        });

        res.status(201).json({
            success: true,
            message: "Staff created successfully",
            data: staff
        });
    } catch (err) {
        next(err);
    }
};

exports.getStaff = async (req, res, next) => {
    try {
        const staff = await userModel
            .find({
                restaurant_id: req.user.restaurant_id,
                role: {
                    $in: ["manager", "cashier", "waiter", "kitchen"]
                }
            })
            .populate("restaurant_id", "restaurant_name");

        res.status(200).json({
            success: true,
            count: staff.length,
            data: staff
        });

    } catch (err) {
        next(err);
    }
};

exports.getStaffById = async (req, res, next) => {
    try {
        const staff = await userModel
            .findOne({
                _id: req.params.id,
                restaurant_id: req.user.restaurant_id,
                role: {
                    $in: ["manager", "cashier", "waiter", "kitchen"]
                }
            })
            .populate("restaurant_id", "restaurant_name");

        res.status(200).json({
            success: true,
            data: staff
        });

    } catch (err) {
        next(err);
    }
};

exports.getStaffByRestaurant = async (req, res, next) => {
    try {
        const staff = await userModel
            .find({
                restaurant_id: req.user.restaurant_id,
                role: {
                    $in: ["manager", "cashier", "waiter"]
                }
            });

        res.status(200).json({
            success: true,
            count: staff.length,
            data: staff
        });
    } catch (err) {
        next(err);
    }
};

exports.updateStaff = async (req, res, next) => {
    try {
        const staff = await userModel.findOneAndUpdate(
            {
                _id: req.params.id,
                restaurant_id: req.user.restaurant_id
            },
            req.body,
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Staff updated successfully",
            data: staff
        });

    } catch (err) {
        next(err);
    }
};

exports.changeStaffStatus = async (req, res, next) => {
    try {
        const staff = await userModel.findOneAndUpdate(
            {
                _id: req.params.id,
                restaurant_id: req.user.restaurant_id
            },
            {
                status: req.body.status
            },
            {
                new: true
            }
        );

        res.status(200).json({
            success: true,
            message: "Status updated successfully",
            data: staff
        });

    } catch (err) {
        next(err);
    }
};

exports.deleteStaff = async (req, res, next) => {
    try {
        await userModel.findOneAndUpdate(
            {
                _id: req.params.id,
                restaurant_id: req.user.restaurant_id
            },
            {
                is_deleted: true
            }
        );

        res.status(200).json({
            success: true,
            message: "Staff deleted successfully"
        });

    } catch (err) {
        next(err);
    }
};

exports.restoreStaff = async (req, res, next) => {
    try {
        const staff = await userModel.findOneAndUpdate(
            {
                _id: req.params.id,
                restaurant_id: req.user.restaurant_id
            },
            {
                is_deleted: false
            },
            {
                new: true
            }
        );

        res.status(200).json({
            success: true,
            message: "Staff restored successfully",
            data: staff
        });

    } catch (err) {
        next(err);
    }
};