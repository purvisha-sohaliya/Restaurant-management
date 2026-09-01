const bcrypt = require("bcrypt");

const hashPassword = async (password) => {
    return await bcrypt.hash(password, Number(process.env.SALT_ROUND));
};

const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

module.exports = { hashPassword, comparePassword };