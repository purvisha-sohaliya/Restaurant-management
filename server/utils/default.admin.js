const userModel = require("../models/userModel");

exports.defaultAdmin = async () => {
    try {
        const adminExists = await userModel.findOne({
            email: "admin@gmail.com",
        });

        if (!adminExists) {
            await userModel.create({
                name: "Super Admin",
                email: "admin@gmail.com",
                password: "123456",
                phone: 1324612345,
                role: "super_admin", // remove if role field doesn't exist
            });

            console.log("Default Admin Created");
        }
    } catch (err) {
        console.log("Default Admin Error:", err.message);
    }
};