const User = require("../models/User");

// GET PROFILE
exports.getProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.json(user);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};
// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
    try {

        const {
            name,
            bio,
            university,
            department,
            semester,
        } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        user.name = name ?? user.name;
        user.bio = bio ?? user.bio;
        user.university = university ?? user.university;
        user.department = department ?? user.department;
        user.semester = semester ?? user.semester;

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                university: user.university,
                department: user.department,
                semester: user.semester,
                avatar: user.avatar,
            },
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};
// UPLOAD AVATAR
exports.uploadAvatar = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                message: "No image uploaded",
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        user.avatar = req.file.path;

        await user.save();

        res.json({
            message: "Avatar updated successfully",
            avatar: user.avatar,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};