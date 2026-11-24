
const express = require("express");
const router = express.Router();

const protect = require(
    "../middleware/authMiddleware"
);

const {
    avatarUpload,
    validateFileIfPresent,
    handleUploadError,
} = require("../middleware/uploadMiddleware");

const {
    getProfile,
    updateProfile,
    uploadAvatar,
} = require("../controllers/userController");

// GET PROFILE
router.get(
    "/profile",
    protect,
    getProfile
);

// UPDATE PROFILE
router.put(
    "/profile",
    protect,
    updateProfile
);

// UPLOAD AVATAR
router.post(
    "/avatar",
    protect,
    avatarUpload.single("file"),
    validateFileIfPresent,
    uploadAvatar
);

// Handle errors from the upload middleware.
router.use(handleUploadError);

module.exports = router;
