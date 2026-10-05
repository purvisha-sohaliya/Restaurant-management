const restaurantModel = require("../models/restaurantModel");
const userModel = require("../models/userModel");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

// CREATE RESTAURANT
exports.createRestaurant = async (req, res, next) => {
    try {
        const {
            restaurant_name,
            email,
            phone,
            address,
            city,
            country,
            owner_id,
        } = req.body;

        const owner = await userModel.findOne({
            _id: owner_id,
            role: "owner",
            is_deleted: false,
        });

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: "Owner not found",
            });
        }

        let logo = null;

        if (req.file) {
            const result = await uploadToCloudinary(
                req.file.path,
                "restaurant/logos"
            );

            logo = result.secure_url;
        }

        const restaurant = await restaurantModel.create({
            restaurant_name,
            email,
            phone,
            address,
            city,
            country,
            logo,
            owner_id: owner_id,
        });

        owner.restaurant_id = restaurant._id;
        await owner.save();

        return res.status(201).json({
            success: true,
            message: "Restaurant created successfully",
            data: restaurant,
        });

    } catch (err) {
        next(err);
    }
};

// GET RESTAURANT
exports.getRestaurants = async (req, res, next) => {
    try {
        const restaurant = await restaurantModel.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: restaurant.length,
            data: restaurant,
        });
    } catch (err) {
        next(err);
    }
}

// GET RESTAURANT BY ID
exports.getRestaurantById = async (req, res, next) => {
    try {
        const restaurant = await restaurantModel.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found",
            });
        }

        res.status(200).json({
            success: true,
            data: restaurant,
        });
    } catch (err) {
        next(err)
    }
};

// UPDATE RESTAURANT
exports.updateRestaurant = async (req, res, next) => {
    try {
        const restaurant = await restaurantModel.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found",
            });
        }

        res.status(200).json({
            success: true,
            data: restaurant,
        });
    } catch (err) {
        next(err)
    }
};

// DELETE RESTAURANT
exports.deleteRestaurant = async (req, res, next) => {
    try {
        const restaurant = await restaurantModel.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: restaurant,
        });
    } catch (err) {
        next(err);
    }
};

exports.changeRestaurantStatus = async (req, res, next) => {
    try {
        const restaurant = await restaurantModel.findById(req.params.id);

        restaurant.status =
            restaurant.status === "active" ? "inactive" : "active";

        await restaurant.save();

        res.status(200).json({
            success: true,
            data: restaurant,
        });
    } catch (err) {
        next(err);
    }
};

exports.recoverRestaurant = async (req, res, next) => {
    try {
        const restaurant = await restaurantModel.findByIdAndUpdate(
            req.params.id,
            { isDeleted: false },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: restaurant,
        });
    } catch (err) {
        next(err);
    }
};