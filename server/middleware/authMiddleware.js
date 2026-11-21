
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/User");

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Reject requests without a Bearer token.
    if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
    ) {
        return res.status(401).json({
            message: "Not authorized, no token",
        });
    }

    const token = authHeader.split(" ")[1];

    let decoded;

    // Step 1: Verify the JWT signature and expiration.
    try {
        decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
    } catch (error) {
        return res.status(401).json({
            message: "Token failed",
        });
    }

    // Step 2: Validate the account ID in the JWT.
    if (
        !decoded ||
        typeof decoded.id !== "string" ||
        !mongoose.isValidObjectId(decoded.id)
    ) {
        return res.status(401).json({
            message: "Token failed",
        });
    }

    // Step 3: Verify that the account still exists.
    try {
        const userExists = await User.exists({
            _id: decoded.id,
        });

        if (!userExists) {
            return res.status(401).json({
                message: "Token failed",
            });
        }

        // Preserve the JWT payload format used by the app.
        req.user = decoded;

        return next();

    } catch (error) {
        // Do not expose internal database errors.
        return res.status(503).json({
            message: "Authentication temporarily unavailable",
        });
    }
};

module.exports = protect;
