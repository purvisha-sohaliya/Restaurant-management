const inventoryModel = require("../models/inventoryModel");
const kitchenModel = require("../models/kitchenModel");
const orderModel = require("../models/orderModel");
const recipeModel = require("../models/recipeModel");

exports.getKitchenOrders = async (req, res, next) => {
    try {
        const kitchenOrders = await kitchenModel
            .find({
                restaurant_id: req.user.restaurant_id,
                kitchen_status: {
                    $ne: "Served"
                }
            })
            .populate("order_id", "order_number order_type customer_name")
            .populate("table_id", "tableNumber")
            .populate("waiter_id", "name")
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            success: true,
            count: kitchenOrders.length,
            data: kitchenOrders
        });

    } catch (err) {
        next(err);
    }
};

exports.getKitchenOrderById = async (req, res, next) => {
    try {

        const kitchenOrder = await kitchenModel
            .findOne({
                _id: req.params.id,
                restaurant_id: req.user.restaurant_id
            })
            .populate("order_id")
            .populate("table_id")
            .populate("waiter_id", "name");

        if (!kitchenOrder) {
            const error = new Error("Kitchen order not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: kitchenOrder
        });

    } catch (err) {
        next(err);
    }
};

exports.acceptKitchenOrder = async (req, res, next) => {
    try {
        const kitchenOrder = await kitchenModel.findOne({
            _id: req.params.id,
            restaurant_id: req.user.restaurant_id
        });

        if (!kitchenOrder) {
            const error = new Error("Kitchen order not found");
            error.statusCode = 404;
            throw error;
        }

        if (kitchenOrder.kitchen_status !== "Pending") {
            const error = new Error("Only pending orders can be accepted");
            error.statusCode = 400;
            throw error;
        }

        kitchenOrder.kitchen_status = "Preparing";

        kitchenOrder.items.forEach(item => {
            if (item.status === "Pending") {
                item.status = "Preparing";
            }
        });

        await kitchenOrder.save();

        const order = await orderModel.findById(kitchenOrder.order_id);

        if (order) {
            order.items.forEach(orderItem => {
                const kitchenItem = kitchenOrder.items.find(
                    kitchenItem =>
                        kitchenItem.menu_item_id.toString() ===
                        orderItem.menu_item_id.toString() && kitchenItem.token_number === orderItem.token_number
                );

                if (kitchenItem && kitchenItem.status === "Preparing") {
                    orderItem.kitchen_status = "Preparing";
                }
            });

            await order.save();
        }

        res.status(200).json({
            success: true,
            message: "Kitchen order accepted successfully",
            data: kitchenOrder
        });
    } catch (err) {
        next(err);
    }
};

exports.readyKitchenOrder = async (req, res, next) => {
    try {
        const kitchenOrder = await kitchenModel.findOne({
            _id: req.params.id,
            restaurant_id: req.user.restaurant_id
        });

        if (!kitchenOrder) {
            const error = new Error("Kitchen order not found");
            error.statusCode = 404;
            throw error;
        }

        if (kitchenOrder.kitchen_status !== "Preparing") {
            const error = new Error("Order must be Preparing");
            error.statusCode = 400;
            throw error;
        }

        const order = await orderModel.findById(kitchenOrder.order_id);

        if (!kitchenOrder.stock_deducted) {
            for (const kitchenItem of kitchenOrder.items) {

                const recipe = await recipeModel.findOne({
                    menu_item_id: kitchenItem.menu_item_id,
                    restaurant_id: req.user.restaurant_id,
                    is_deleted: false
                });

                if (!recipe) {
                    const error = new Error(
                        `Recipe not found for ${kitchenItem.name}`
                    );
                    error.statusCode = 400;
                    throw error;
                }

                for (const ingredient of recipe.ingredients) {

                    const requiredQuantity =
                        ingredient.quantity * kitchenItem.quantity;

                    const inventory = await inventoryModel.findOne({
                        _id: ingredient.inventory_id,
                        restaurant_id: req.user.restaurant_id,
                        is_deleted: false
                    });

                    if (!inventory) {
                        const error = new Error("Inventory item not found");
                        error.statusCode = 404;
                        throw error;
                    }

                    if (inventory.current_stock < requiredQuantity) {
                        const error = new Error(
                            `Insufficient stock for ${inventory.item_name}`
                        );
                        error.statusCode = 400;
                        throw error;
                    }

                    inventory.current_stock -= requiredQuantity;

                    if (inventory.current_stock === 0) {
                        inventory.stock_status = "Out of Stock";
                    } else if (
                        inventory.current_stock <= inventory.minimum_stock
                    ) {
                        inventory.stock_status = "Low Stock";
                    } else {
                        inventory.stock_status = "In Stock";
                    }

                    await inventory.save();
                }
            }
            kitchenOrder.stock_deducted = true;
        }

        kitchenOrder.kitchen_status = "Ready";

        kitchenOrder.items.forEach(item => {
            if (item.status === "Preparing") {
                item.status = "Ready";
            }
        });

        await kitchenOrder.save();

        order.items.forEach(orderItem => {
            const kitchenItem = kitchenOrder.items.find(
                kitchenItem =>
                    kitchenItem.menu_item_id.toString() ===
                    orderItem.menu_item_id.toString()
            );

            if (kitchenItem && kitchenItem.status === "Ready") {
                orderItem.kitchen_status = "Ready";
            }
        });

        await order.save();

        res.status(200).json({
            success: true,
            message: "Food is ready",
            data: kitchenOrder
        });

    } catch (err) {
        next(err);
    }
};

exports.servedKitchenOrder = async (req, res, next) => {
    try {
        const kitchenOrder = await kitchenModel.findOne({
            _id: req.params.id,
            restaurant_id: req.user.restaurant_id
        });

        if (!kitchenOrder) {
            const error = new Error("Kitchen order not found");
            error.statusCode = 404;
            throw error;
        }

        if (kitchenOrder.kitchen_status !== "Ready") {
            const error = new Error("Order is not ready");
            error.statusCode = 400;
            throw error;
        }

        kitchenOrder.kitchen_status = "Served";

        kitchenOrder.items.forEach(item => {
            if (item.status === "Ready") {
                item.status = "Served";
            }
        });

        await kitchenOrder.save();

        const order = await orderModel.findById(kitchenOrder.order_id);

        if (order) {
            order.items.forEach(orderItem => {
                const kitchenItem = kitchenOrder.items.find(
                    kitchenItem =>
                        kitchenItem.menu_item_id.toString() ===
                        orderItem.menu_item_id.toString()
                );

                if (kitchenItem && kitchenItem.status === "Served") {
                    orderItem.kitchen_status = "Served";
                }
            });

            await order.save();
        }

        res.status(200).json({
            success: true,
            message: "Order served successfully",
            data: kitchenOrder
        });

    } catch (err) {
        next(err);
    }
};

exports.getDisplayScreen = async (req, res, next) => {
    try {
        const kitchenOrders = await kitchenModel
            .find({
                restaurant_id: req.user.restaurant_id,
                kitchen_status: {
                    $in: ["Pending", "Preparing", "Ready"]
                }
            })
            .populate(
                "order_id",
                "order_number order_type customer_name"
            )
            .populate(
                "table_id",
                "tableNumber"
            )
            .sort({
                createdAt: 1
            });

        if (!kitchenOrders || kitchenOrders.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No active kitchen orders",
                data: {
                    current_token: null,
                    current_status: null,
                    queue: []
                }
            });
        }

        const activeTokens = [];

        for (const kitchenOrder of kitchenOrders) {
            for (const item of kitchenOrder.items) {
                if (item.token_number) {
                    activeTokens.push({
                        kitchen_id: kitchenOrder._id,
                        token_number: item.token_number,
                        status:
                            item.status ||
                            kitchenOrder.kitchen_status
                    });
                }
            }
        }

        if (activeTokens.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    current_token: null,
                    current_status: null,
                    queue: []
                }
            });
        }

        const currentToken = activeTokens[0];

        const queue = activeTokens.slice(1);

        res.status(200).json({
            success: true,
            data: {
                current_token: currentToken.token_number,
                current_status: currentToken.status,
                queue
            }
        });

    } catch (err) {
        next(err);
    }
};