
const { rateLimit } = require("express-rate-limit");

// Read a positive integer from the environment.
// Fall back to the default for missing or invalid values.
function positiveInteger(value, defaultValue) {
    const number = Number(value);

    if (
        Number.isSafeInteger(number) &&
        number > 0
    ) {
        return number;
    }

    return defaultValue;
}

// LOGIN RATE LIMITER
// Default: 10 failed requests per 15 minutes per IP.
const loginLimiter = rateLimit({
    windowMs: positiveInteger(
        process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_MS,
        15 * 60 * 1000
    ),

    limit: positiveInteger(
        process.env.AUTH_LOGIN_RATE_LIMIT_MAX,
        10
    ),

    standardHeaders: "draft-7",
    legacyHeaders: false,

    // Successful requests do not consume the login quota.
    skipSuccessfulRequests: true,

    handler: (req, res) => {
        return res.status(429).json({
            message:
                "Too many login attempts. Please try again later.",
        });
    },
});

// REGISTRATION RATE LIMITER
// Default: 30 requests per hour per IP.
const registerLimiter = rateLimit({
    windowMs: positiveInteger(
        process.env.AUTH_REGISTER_RATE_LIMIT_WINDOW_MS,
        60 * 60 * 1000
    ),

    limit: positiveInteger(
        process.env.AUTH_REGISTER_RATE_LIMIT_MAX,
        30
    ),

    standardHeaders: "draft-7",
    legacyHeaders: false,

    handler: (req, res) => {
        return res.status(429).json({
            message:
                "Too many registration attempts. Please try again later.",
        });
    },
});

module.exports = {
    loginLimiter,
    registerLimiter,
};
