const express = require("express");

const router = express.Router();

const protect = require(
    "../middleware/authMiddleware"
);
const validateObjectId = require(
    "../middleware/validateObjectId"
);

const {

    getNotifications,

    createNotification,

    markAsRead,

    markAllAsRead,

    deleteNotification,

} = require(
    "../controllers/notificationController"
);

// GET ALL
router.get(
    "/",
    protect,
    getNotifications
);

// CREATE
router.post(
    "/",
    protect,
    createNotification
);
// MARK AS READ
router.patch(
    "/:id/read",
    protect,
    validateObjectId,
    markAsRead
);

// MARK ALL AS READ
router.patch(
    "/read-all",
    protect,
    markAllAsRead
);

// DELETE
router.delete(
    "/:id",
    protect,
    validateObjectId,
    deleteNotification
);

module.exports = router;