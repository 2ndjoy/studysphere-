const express = require(
    "express"
);

const router =
    express.Router();

const protect = require(
    "../middleware/authMiddleware"
);

const upload = require(
    "../middleware/uploadMiddleware"
);

const {
    uploadResource,
    getResources,
    deleteResource,
} = require(
    "../controllers/resourceController"
);


// UPLOAD
router.post(
    "/",
    protect,
    upload.single("file"),
    uploadResource
);


// GET
router.get(
    "/",
    protect,
    getResources
);


// DELETE
router.delete(
    "/:id",
    protect,
    deleteResource
);


module.exports = router;