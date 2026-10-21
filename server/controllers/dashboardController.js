const mongoose = require("mongoose");
const billModel = require("../models/billModel");
const categoryModel = require("../models/categoryModel");
const menuitemsModel = require("../models/menuitemsModel");
const orderModel = require("../models/orderModel");
const restaurantModel = require("../models/restaurantModel");
const tableModel = require("../models/tableModel");
const userModel = require("../models/userModel");
const waitingEntryModel = require("../models/waitingEntryModel");

// =================== Get Dashboard ===================
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

        for (const order of recentOrders) {

            const bill = await billModel.findOne({
                order_id: order._id,
                restaurant_id,
                is_deleted: false
            });

            if (bill) {
                order.grand_total = bill.grand_total;
            }
        }

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

// =================== Revenue Overview ===================
exports.getMonthlyRevenue = async (req, res, next) => {
    try {
        const restaurantId = req.user.restaurant_id;
        const year = Number(req.query.year) || new Date().getFullYear();

        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year + 1, 0, 1);

        const revenueData = await billModel.aggregate([
            {
                $match: {
                    restaurant_id: new mongoose.Types.ObjectId(restaurantId),
                    payment_status: "Paid",
                    is_deleted: false,
                    createdAt: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $month: "$createdAt"
                    },
                    revenue: {
                        $sum: "$grand_total"
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]);

        const months = [
            "Jan", "Feb", "Mar", "Apr",
            "May", "Jun", "Jul", "Aug",
            "Sep", "Oct", "Nov", "Dec"
        ];

        const monthlyRevenue = months.map((month, index) => {
            const foundMonth = revenueData.find(
                (item) => item._id === index + 1
            );

            return {
                month: month,
                revenue: foundMonth ? foundMonth.revenue : 0
            };
        });

        return res.status(200).json({
            success: true,
            year: year,
            data: monthlyRevenue
        });
    } catch (err) {
        next(err);
    }
}

// =================== Order Overview ===================
exports.getDailyOrders = async (req, res, next) => {
    try {
        const restaurantId = req.user.restaurant_id;

        const today = new Date();

        const year = today.getFullYear();
        const month = today.getMonth() + 1;

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        const orderData = await orderModel.aggregate([
            {
                $match: {
                    restaurant_id: new mongoose.Types.ObjectId(restaurantId),
                    is_deleted: false,
                    createdAt: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dayOfMonth: "$createdAt"
                    },
                    orders: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]);

        const totalDays = new Date(year, month, 0).getDate();

        const dailyOrders = Array.from(
            { length: totalDays },
            (_, index) => {
                const day = index + 1;

                const foundDay = orderData.find(
                    (item) => item._id === day
                );

                return {
                    day: day,
                    orders: foundDay ? foundDay.orders : 0
                };
            }
        );

        return res.status(200).json({
            success: true,
            year,
            month,
            data: dailyOrders
        });

    } catch (err) {
        next(err);
    }
}

exports.getMonthlyOrders = async (req, res, next) => {
    try {
        const restaurantId = req.user.restaurant_id;

        const year = Number(req.query.year) || new Date().getFullYear();

        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year + 1, 0, 1);

        const orderData = await orderModel.aggregate([
            {
                $match: {
                    restaurant_id: new mongoose.Types.ObjectId(restaurantId),
                    is_deleted: false,
                    createdAt: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $month: "$createdAt"
                    },
                    orders: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]);

        const months = [
            "Jan", "Feb", "Mar", "Apr",
            "May", "Jun", "Jul", "Aug",
            "Sep", "Oct", "Nov", "Dec"
        ];

        const monthlyOrders = months.map((month, index) => {
            const foundMonth = orderData.find(
                (item) => item._id === index + 1
            );

            return {
                month,
                orders: foundMonth ? foundMonth.orders : 0
            };
        });

        return res.status(200).json({
            success: true,
            year,
            data: monthlyOrders
        });

    } catch (error) {
        next(error);
    }
};

// =================== Top Selling Items ===================
exports.getTopSellingItems = async (req, res, next) => {
    try {
        const restaurantId = req.user.restaurant_id;

        const topItems = await orderModel.aggregate([
            {
                $match: {
                    restaurant_id: new mongoose.Types.ObjectId(restaurantId),
                    is_deleted: false,
                    order_status: {
                        $in: ["Served", "Completed"]
                    }
                }
            },
            {
                $unwind: "$items"
            },
            {
                $group: {
                    _id: "$items.menu_item_id",
                    item_name: {
                        $first: "$items.item_name"
                    },
                    total_quantity: {
                        $sum: "$items.quantity"
                    }
                }
            },
            {
                $sort: {
                    total_quantity: -1
                }
            },
            {
                $limit: 5
            },
            {
                $project: {
                    _id: 0,
                    item_name: 1,
                    total_quantity: 1
                }
            }
        ]);

        return res.status(200).json({ success: true, data: topItems });
    } catch (err) {
        next(err);
    }
}

// =================== Order TYpe Distribution ===================
exports.getOrderTypeDistribution = async (req, res, next) => {
    try {
        const restaurantId = req.user.restaurant_id;

        const orderData = await orderModel.aggregate([
            {
                $match: {
                    restaurant_id: new mongoose.Types.ObjectId(restaurantId),
                    is_deleted: false,
                    order_type: {
                        $in: ["Dine In", "Takeaway", "Delivery"]
                    }
                }
            },
            {
                $group: {
                    _id: "$order_type",
                    count: { $sum: 1 }
                }
            }
        ]);

        const orderTypes = ["Dine In", "Takeaway", "Delivery"];

        const distribution = orderTypes.map((type) => {
            const foundType = orderData.find(
                (item) => item._id === type
            );

            return {
                name: type,
                value: foundType ? foundType.count : 0
            };
        });

        const totalOrders = distribution.reduce(
            (total, item) => total + item.value,
            0
        );

        return res.status(200).json({
            success: true,
            totalOrders,
            data: distribution
        });

    } catch (error) {
        next(error);
    }
};