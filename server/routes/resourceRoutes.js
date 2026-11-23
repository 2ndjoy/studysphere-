
const express = require("express");
const router = express.Router();

const protect = require(
    "../middleware/authMiddleware"
);

const validateObjectId = require(
    "../middleware/validateObjectId"
);

const {
    resourceUpload,
    validateFileIfPresent,
    handleUploadError,
} = require("../middleware/uploadMiddleware");

const {
    uploadResource,
    getResources,
    deleteResource,
} = require("../controllers/resourceController");

// UPLOAD RESOURCE
router.post(
    "/",
    protect,
    resourceUpload.single("file"),
    validateFileIfPresent,
    uploadResource
);

// GET RESOURCES
router.get(
    "/",
    protect,
    getResources
);

// DELETE RESOURCE
router.delete(
    "/:id",
    protect,
    validateObjectId,
    deleteResource
);

// Handle errors from the upload middleware.
router.use(handleUploadError);

module.exports = router;
