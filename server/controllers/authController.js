
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Return only fields that are safe to expose to clients.
function toPublicUser(user) {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        university: user.university,
        department: user.department,
        semester: user.semester,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

// Basic email syntax validation.
// More comprehensive email verification can be added later.
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// REGISTER USER
exports.register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
        } = req.body ?? {};

        // 1. Validate the name.
        if (
            typeof name !== "string" ||
            !name.trim()
        ) {
            return res.status(400).json({
                message: "Name is required",
            });
        }

        // 2. Validate email presence.
        if (
            email === undefined ||
            email === null ||
            email === ""
        ) {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        // 3. Reject malformed emails and objects
        // containing MongoDB query operators.
        if (
            typeof email !== "string" ||
            !isValidEmail(email.trim())
        ) {
            return res.status(400).json({
                message: "Invalid email address",
            });
        }

        // 4. Validate password presence.
        if (
            password === undefined ||
            password === null ||
            password === ""
        ) {
            return res.status(400).json({
                message: "Password is required",
            });
        }

        // 5. Reject non-string passwords.
        if (typeof password !== "string") {
            return res.status(400).json({
                message: "Password must be a string",
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim();

        // 6. Check for existing accounts.
        const existingUser = await User.findOne({
            email: cleanEmail,
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        // 7. Hash the password before storage.
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // 8. Create the validated user.
        const user = await User.create({
            name: cleanName,
            email: cleanEmail,
            password: hashedPassword,
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: toPublicUser(user),
        });

    } catch (error) {
        // Handle concurrent registrations with duplicate emails.
        if (error.code === 11000) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        // Never expose database or bcrypt error details.
        return res.status(500).json({
            message: "Unable to register user",
        });
    }
};

// LOGIN USER
exports.login = async (req, res) => {
    try {
        const {
            email,
            password,
        } = req.body ?? {};

        // Validate inputs before querying MongoDB.
        // Only accept scalar strings, never query objects.
        if (
            typeof email !== "string" ||
            !email.trim() ||
            typeof password !== "string" ||
            !password
        ) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        const cleanEmail = email.trim();

        // Query with a validated string email only.
        const user = await User.findOne({
            email: cleanEmail,
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        // Verify the supplied password.
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        // Issue a JWT for the authenticated account.
        const token = jwt.sign(
            {
                id: user._id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: toPublicUser(user),
        });

    } catch (error) {
        // Don't disclose internal authentication errors.
        return res.status(500).json({
            message: "Unable to log in",
        });
    }
};
