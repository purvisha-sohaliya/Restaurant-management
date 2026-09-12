const billModel = require("../models/billModel");
const categoryModel = require("../models/categoryModel");
const menuitemsModel = require("../models/menuitemsModel");
const orderModel = require("../models/orderModel");
const restaurantModel = require("../models/restaurantModel");
const tableModel = require("../models/tableModel");
const userModel = require("../models/userModel");
const waitingEntryModel = require("../models/waitingEntryModel");

exports.getDashboard = async (req, res, next) => {
    try {
        const { role, restaurant_id } = req.user;

        if (role === "super_admin") {
            const totalRestaurants =
                await restaurantModel.countDocuments({
                    isDeleted: false
                });

            const totalOwners =
                await userModel.countDocuments({
                    role: "owner",
                    is_deleted: false
                });

            const totalOrders =
                await orderModel.countDocuments({
                    is_deleted: false
                });

            const revenueResult = await billModel.aggregate([
                {
                    $match: {
                        is_deleted: false,
                        payment_status: "Paid"
                    }
                },
                {
                    $group: {
                        _id: null,
                        revenue: {
                            $sum: "$grand_total"
                        }
                    }
                }
            ]);

            const revenue = revenueResult[0]?.revenue || 0;

            return res.status(200).json({
                success: true,
                data: {
                    totalRestaurants,
                    totalOwners,
                    totalOrders,
                    revenue
                }
            });
        }

        // ================= RESTAURANT CHECK =================

        if (!restaurant_id) {
            return res.status(400).json({
                success: false,
                message: "Restaurant not assigned"
            });
        }

        // ================= ORDERS =================

        const orders = await orderModel.find({
            restaurant_id,
            is_deleted: false
        })
            .populate("table_id", "tableNumber")
            .sort({ createdAt: -1 });

        // ================= TABLES =================

        const tables = await tableModel.find({
            restaurant_id,
            isDeleted: false
        });

        // ================= COMMON ORDER CALCULATIONS =================

        const totalOrders = orders.length;

        const pendingOrders = orders.filter(
            order => order.order_status === "Pending"
        ).length;

        const preparingOrders = orders.filter(
            order => order.order_status === "Preparing"
        ).length;

        const readyOrders = orders.filter(
            order => order.order_status === "Ready"
        ).length;

        const completedOrders = orders.filter(
            order => order.order_status === "Completed"
        ).length;

        // ================= TABLE CALCULATIONS =================

        const availableTables = tables.filter(
            table => table.status === "available"
        ).length;

        const occupiedTables = tables.filter(
            table => table.status === "occupied"
        ).length;

        const reservedTables = tables.filter(
            table => table.status === "reserved"
        ).length;

        const cleaningTables = tables.filter(
            table => table.status === "cleaning"
        ).length;

        // ================= WAITING CUSTOMERS =================

        const waitingCustomers =
            await waitingEntryModel.countDocuments({
                restaurant_id,
                status: "Waiting",
                is_deleted: false
            });

        // ================= REVENUE =================

        const revenueResult = await billModel.aggregate([
            {
                $match: {
                    is_deleted: false,
                    payment_status: "Paid"
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: {
                        $sum: "$grand_total"
                    }
                }
            }
        ]);

        const revenue = revenueResult[0]?.revenue || 0;

        // ================= RECENT ORDERS =================

        const recentOrders = orders.slice(0, 5);

        // ================= OWNER =================

        if (role === "owner") {
            const totalStaff =
                await userModel.countDocuments({
                    restaurant_id,
                    is_deleted: false,
                    role: {
                        $in: ["manager", "waiter", "kitchen"]
                    }
                });

            const totalMenu =
                await menuitemsModel.countDocuments({
                    restaurant_id,
                    is_deleted: false
                });

            const totalCategories =
                await categoryModel.countDocuments({
                    restaurant_id,
                    isDeleted: false
                });

            const totalBills =
                await billModel.countDocuments({
                    restaurant_id,
                    is_deleted: false
                });

            return res.status(200).json({
                success: true,
                data: {
                    revenue,
                    totalOrders,
                    availableTables,
                    occupiedTables,
                    reservedTables,
                    cleaningTables,
                    waitingCustomers,
                    totalStaff,
                    totalMenu,
                    totalCategories,
                    totalBills,
                    recentOrders
                }
            });
        }

        // ================= MANAGER =================

        if (role === "manager") {
            return res.status(200).json({
                success: true,
                data: {
                    revenue,
                    totalOrders,
                    availableTables,
                    occupiedTables,
                    reservedTables,
                    cleaningTables,
                    waitingCustomers,
                    pendingOrders,
                    preparingOrders,
                    readyOrders,
                    completedOrders,
                    recentOrders
                }
            });
        }

        // ================= WAITER =================

        if (role === "waiter") {
            const myOrders = orders.filter(
                order =>
                    String(order.waiter_id) ===
                    String(req.user.id)
            );

            const pendingBills =
                await billModel.countDocuments({
                    restaurant_id,
                    is_deleted: false,
                    payment_status: "Pending"
                });

            return res.status(200).json({
                success: true,
                data: {
                    revenue,
                    totalOrders: myOrders.length,
                    availableTables,
                    pendingBills,
                    completedOrders: myOrders.filter(
                        order =>
                            order.order_status === "Completed"
                    ).length
                }
            });
        }

        // ================= KITCHEN =================

        if (role === "kitchen") {

            return res.status(200).json({
                success: true,
                data: {
                    totalOrders,
                    pendingOrders,
                    preparingOrders,
                    readyOrders,
                    recentOrders
                }
            });
        }

        // ================= INVALID ROLE =================

        return res.status(403).json({
            success: false,
            message: "Dashboard not available"
        });

    } catch (error) {
        next(error);
    }
};