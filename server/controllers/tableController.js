const tableModel = require("../models/tableModel");

exports.createTable = async (req, res, next) => {
    try {
        const table = await tableModel.create({ ...req.body, restaurant_id: req.user.restaurant_id });

        res.status(201).json({
            success: true,
            data: table,
        });
    } catch (err) {
        next(err);
    }
};

exports.getAllTables = async (req, res, next) => {
    try {
        const tables = await tableModel.find({ restaurant_id: req.user.restaurant_id }).sort({ tableNumber: 1 });

        res.status(200).json({
            success: true,
            count: tables.length,
            data: tables,
        });
    } catch (err) {
        next(err);
    }
};

exports.getTableById = async (req, res, next) => {
    try {
        const table = await tableModel.findOne({
            _id: req.params.id,
            restaurant_id: req.user.restaurant_id
        });

        if (!table) {
            return res.status(404).json({
                success: false,
                message: "Table not found",
            });
        }
        res.status(200).json({
            success: true,
            data: table,
        });
    } catch (err) {
        next(err);
    }
};

exports.updateTable = async (req, res, next) => {
    try {
        const table = await tableModel.findByIdAndUpdate({
            _id: req.params.id,
            restaurant_id: req.user.restaurant_id
        }, req.body, { new: true });

        if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

        res.status(200).json({
            success: true,
            data: table,
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteTable = async (req, res, next) => {
    try {
        const table = await tableModel.findByIdAndUpdate(
            {
                _id: req.params.id,
                restaurant_id: req.user.restaurant_id
            },
            {
                isDeleted: true
            },
            {
                new: true
            }
        );

        if (!table) {
            return res.status(404).json({
                success: false,
                message: "Table not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Table deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

exports.restoreTable = async (req, res, next) => {
    try {
        const table = await tableModel.findByIdAndUpdate(
            {
                _id: req.params.id,
                restaurant_id: req.user.restaurant_id
            },
            {
                isDeleted: false,
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: table
        });
    } catch (error) {
        next(error);
    }
};

exports.updateTableStatus = async (req, res, next) => {
    try {
        const table = await tableModel.findByIdAndUpdate(
            {
                _id: req.params.id,
                restaurant_id: req.user.restaurant_id
            },
            { status: req.body.status },
            { new: true }
        );
        res.json(table);
    } catch (err) {
        next(err);
    }
};