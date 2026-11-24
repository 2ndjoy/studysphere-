const Notification = require("../models/Notification");

// GET ALL NOTIFICATIONS
exports.getNotifications = async (req, res) => {
    try {

        const notifications = await Notification.find({
            user: req.user.id,
        }).sort({
            createdAt: -1,
        });

        res.json(notifications);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

// CREATE NOTIFICATION
exports.createNotification = async (req, res) => {

    try {

        const {
            title,
            message,
            type,
        } = req.body;

        const notification =
            await Notification.create({

                user: req.user.id,

                title,

                message,

                type,

            });

        res.status(201).json(notification);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};


 // MARK AS READ
exports.markAsRead = async (req, res) => {
    try {
        // Find the notification only if it belongs
        // to the authenticated user.
        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found",
            });
        }

        notification.isRead = true;

        await notification.save();

        return res.status(200).json(notification);

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};


// MARK ALL AS READ
exports.markAllAsRead = async (req, res) => {

    try {

        await Notification.updateMany(
            {
                user: req.user.id,
            },
            {
                isRead: true,
            }
        );

        res.json({
            message:
                "All notifications marked as read",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};

// DELETE NOTIFICATION
exports.deleteNotification = async (req, res) => {

    try {

        const notification =
            await Notification.findById(
                req.params.id
            );

        if (!notification) {

            return res.status(404).json({
                message:
                    "Notification not found",
            });

        }

        if (
            notification.user.toString() !==
            req.user.id
        ) {

            return res.status(401).json({
                message:
                    "Not authorized",
            });

        }

        await notification.deleteOne();

        res.json({
            message:
                "Notification deleted",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};