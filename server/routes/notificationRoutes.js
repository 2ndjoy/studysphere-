const express = require("express");

const router = express.Router();

const protect = require(
    "../middleware/authMiddleware"
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
    deleteNotification
);

module.exports = router;