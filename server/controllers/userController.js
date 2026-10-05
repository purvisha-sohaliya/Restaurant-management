const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const { comparePassword, hashPassword } = require("../utils/bcryptHelper");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwtHelper");

exports.register = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            phone,
        } = req.body;

        const existingUser = await userModel.findOne({
            email: email.toLowerCase(),
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
                data: null,
            });
        }

        const hashedPassword = await hashPassword(password);

        const owner = await userModel.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone,
            role: "owner",
            restaurant_id: null,
        });

        const ownerResponse = owner.toObject();

        delete ownerResponse.password;
        delete ownerResponse.refreshToken;

        return res.status(201).json({
            success: true,
            message: "Owner created successfully",
            data: ownerResponse,
        });

    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({
            email, is_deleted: false
        }).select("+password");

        if (!user) return res.status(401).json({ success: false, message: "Invalid email or password" });

        if (user.status === "blocked") return res.status(403).json({ success: false, message: "User account is blocked" });

        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid email or password" });

        const payload = {
            id: user._id,
            role: user.role,
            restaurant_id: user.restaurant_id
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        user.refreshToken = refreshToken;

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.__v;
        delete userResponse.refreshToken;

        await user.save();

        return res.status(200)
            .cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 15 * 60 * 1000
            })
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            .json({
                success: true,
                message: "Login successful",
                data: userResponse,
                accessToken,
            });

    } catch (err) {
        next(err);
    }
}

exports.refreshAccessToken = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) return res.status(401).json({ success: false, data: null, message: "Token missing" });

        const decoded = jwt.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await userModel.findById(decoded.id);

        if (!user || user.refreshToken !== token) return res.status(401).json({ success: false, data: null, message: "Invalid Token" });

        const accessToken = generateAccessToken({ id: user._id, role: user.role, restaurant_id: user.restaurant_id });

        return res.status(200)
            .cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 15 * 60 * 1000
            })
            .json({
                success: true,
                message: "Access token refreshed",
                accessToken,
            });

    } catch (error) {
        next(error);
    }
}

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await userModel.find({}).select("-password -refreshToken");

        return res.status(200).json({ success: true, message: "Users fetched successfully", data: users });
    } catch (err) {
        next(err);
    }
}

exports.logout = async (req, res, next) => {
    try {
        const id = req.user.id;
        const user = await userModel.findById(id);

        if (!user) return res.status(404).json({ success: false, message: "User not found", data: null });

        user.refreshToken = null;
        await user.save();

        return res.status(200).clearCookie("accessToken")
            .clearCookie("refreshToken")
            .json({
                success: true,
                data: null,
                message: "Logout successfully"
            });
    } catch (err) {
        next(err);
    }
}

exports.profile = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user.id).select("-password -refreshToken");

        if (!user) return res.status(404).json({ success: false, message: "User not found", data: null });

        return res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
}