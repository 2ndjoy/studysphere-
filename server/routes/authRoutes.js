
const express = require("express");

const router = express.Router();

const {
    register,
    login,
} = require("../controllers/authController");

const protect = require(
    "../middleware/authMiddleware"
);

const {
    loginLimiter,
    registerLimiter,
} = require(
    "../middleware/authRateLimiter"
);

// REGISTER
router.post(
    "/register",
    registerLimiter,
    register
);

// LOGIN
router.post(
    "/login",
    loginLimiter,
    login
);

// PROTECTED TEST ROUTE
router.get(
    "/me",
    protect,
    (req, res) => {
        return res.json({
            message: "Protected route accessed",
            user: req.user,
        });
    }
);

module.exports = router;
