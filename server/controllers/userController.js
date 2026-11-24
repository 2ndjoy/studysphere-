const User = require("../models/User");
const {
    uploadBufferToCloudinary,
    deleteAssetFromCloudinary,
} = require("../services/cloudinaryUpload");
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
    // Preserve the existing no-file response.
    if (!req.file) {
        return res.status(400).json({
            message: "No image uploaded",
        });
    }

    let user;

    try {
        user = await User.findById(
            req.user.id
        );
    } catch {
        return res.status(500).json({
            message: "Unable to update avatar",
        });
    }

    if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
    }

    // Upload and keep the asset metadata
    // required for cleanup if saving fails.
    let uploadedAsset;

    try {
        uploadedAsset = await uploadBufferToCloudinary(
            req.file,
            { includeMetadata: true }
        );
    } catch {
        return res.status(502).json({
            message: "File upload failed",
        });
    }

    try {
        user.avatar = uploadedAsset.url;

        await user.save();

        return res.status(200).json({
            message: "Avatar updated successfully",
            avatar: user.avatar,
        });
    } catch {
        // Upload succeeded but MongoDB failed.
        // Attempt to remove the new orphaned image.
        try {
            await deleteAssetFromCloudinary(
                uploadedAsset
            );
        } catch {
            console.error(
                "Cloud asset cleanup failed after avatar save error"
            );
        }

        return res.status(500).json({
            message: "Unable to update avatar",
        });
    }
};
