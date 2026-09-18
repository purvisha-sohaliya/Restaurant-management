const inventoryModel = require("../models/inventoryModel");

exports.createInventory = async (req, res, next) => {
    try {
        const { item_name, unit, current_stock, minimum_stock, purchase_price, expiry_date } = req.body;

        if (!item_name || !unit) {
            const error = new Error("Item name and unit are required");
            error.statusCode = 400;
            throw error;
        }

        const existingItem = await inventoryModel.findOne({
            restaurant_id: req.user.restaurant_id,
            item_name,
            is_deleted: false
        });

        if (existingItem) {
            const error = new Error("Inventory item already exists");
            error.statusCode = 400;
            throw error;
        }

        const stock = current_stock || 0;
        const minStock = minimum_stock || 0;

        let stock_status = "In Stock";

        if (stock === 0) {
            stock_status = "Out of Stock";
        } else if (stock <= minStock) {
            stock_status = "Low Stock";
        }

        const inventory = await inventoryModel.create({
            restaurant_id: req.user.restaurant_id,
            item_name,
            unit,
            current_stock: stock,
            minimum_stock: minStock,
            stock_status,
            purchase_price: purchase_price || 0,
            expiry_date: expiry_date || null
        });

        res.status(201).json({
            success: true,
            message: "Inventory item created successfully",
            data: inventory
        });

    } catch (err) {
        next(err);
    }
}

exports.getInventory = async (req, res, next) => {
    try {
        const inventory = await inventoryModel.find({
            restaurant_id: req.user.restaurant_id,
            is_deleted: false
        }).sort({ createdAt: -1 });

        const outOfStockCount = inventory.filter(
            item => item.current_stock === 0
        ).length;

        res.status(200).json({
            success: true,
            count: inventory.length,
            outOfStockCount,
            data: inventory
        });
    } catch (err) {
        next(err);
    }
}

exports.getInventoryById = async (req, res, next) => {
    try {
        const inventory = await inventoryModel.findOne({
            _id: req.params.id,
            restaurant_id: req.user.restaurant_id,
            is_deleted: false
        });

        if (!inventory) {
            const error = new Error("Inventory item not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: inventory
        });

    } catch (err) {
        next(err);
    }
}

exports.updateInventory = async (req, res, next) => {
    try {
        const updateData = {
            ...req.body
        };

        const inventory = await inventoryModel.findByIdAndUpdate(
            {
                _id: req.params.id,
                restaurant_id: req.user.restaurant_id,
                is_deleted: false
            },
            updateData,
            {
                new: true
            }
        );

        if (!inventory) {
            const error = new Error("Inventory item not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            message: "Inventory updated successfully",
            data: inventory
        });
    } catch (err) {
        next(err);
    }
}

exports.addStock = async (req, res, next) => {
    try {
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            const error = new Error("Valid quantity is required");
            error.statusCode = 400;
            throw error;
        }

        const inventory = await inventoryModel.findOne({
            _id: req.params.id,
            restaurant_id: req.user.restaurant_id,
            is_deleted: false
        });

        if (!inventory) {
            const error = new Error("Inventory item not found");
            error.statusCode = 404;
            throw error;
        }

        inventory.current_stock += quantity;

        if (inventory.current_stock === 0) {
            inventory.stock_status = "Out of Stock";
        } else if (inventory.current_stock <= inventory.minimum_stock) {
            inventory.stock_status = "Low Stock";
        } else {
            inventory.stock_status = "In Stock";
        }

        await inventory.save();
        res.status(200).json({
            success: true,
            message: "Stock added successfully",
            data: inventory
        });
    } catch (err) {
        next(err);
    }
}

exports.getLowStock = async (req, res, next) => {
    try {
        const inventory = await inventoryModel.find({
            restaurant_id: req.user.restaurant_id,
            is_deleted: false,
            current_stock: { $gt: 0 },
            $expr: {
                $lte: ["$current_stock", "$minimum_stock"]
            }
        });

        res.status(200).json({
            success: true,
            count: inventory.length,
            data: inventory
        });

    } catch (err) {
        next(err);
    }
};

exports.getExpiredInventory = async (req, res, next) => {
    try {
        const inventory = await inventoryModel.find({
            restaurant_id: req.user.restaurant_id,
            is_deleted: false,
            expiry_date: {
                $lt: new Date()
            }
        });

        res.status(200).json({
            success: true,
            count: inventory.length,
            data: inventory
        });

    } catch (err) {
        next(err);
    }
};

exports.deleteInventory = async (req, res, next) => {
    try {
        const inventory = await inventoryModel.findOne({
            _id: req.params.id,
            restaurant_id: req.user.restaurant_id,
            is_deleted: false
        });

        if (!inventory) {
            const error = new Error("Inventory item not found");
            error.statusCode = 404;
            throw error;
        }

        inventory.is_deleted = true;

        await inventory.save();

        res.status(200).json({
            success: true,
            message: "Inventory item deleted successfully"
        });

    } catch (err) {
        next(err);
    }
};