const jwt = require("jsonwebtoken");

const isAuth = (req, res, next) => {
     try {
        const token = req.cookies.accessToken;
        // token missing
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized" 
            });
        }

        // verify token
        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        req.user = decoded;
        next();
    } catch (error) {
        // access token expired
        if (error.name === "TokenExpiredError") {

            return res.status(401).json({
                success: false,
                message: "Access token expired"
            });
        }
        // invalid token
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
}

module.exports = isAuth;