const userModel = require("../models/userModel");
const { hashPassword } = require("./bcryptHelper");

exports.defaultAdmin = async () => {
    try {
        const adminExists = await userModel.findOne({
            role: "super_admin",
        });

        if (!adminExists) {
            const hashedPassword = await hashPassword("123456");

            await userModel.create({
                name: "Super Admin",
                email: "admin@gmail.com",
                password: hashedPassword,
                phone: 1324612345,
                role: "super_admin",
            });

            console.log("Default Admin Created");
        }
    } catch (err) {
        console.log("Default Admin Error:", err.message);
    }
};