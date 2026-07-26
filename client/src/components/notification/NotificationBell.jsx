import { useState } from "react";
import { FaBell } from "react-icons/fa";
import {
    useNotifications,
} from "../../context/NotificationContext";

import {
    markAsRead,
    deleteNotification,
} from "../../services/notificationService";

function NotificationBell() {

    const {
        notifications,
        unreadCount,
        fetchNotifications,
    } = useNotifications();

    const [open, setOpen] =
        useState(false);

    const handleRead =
        async (id) => {

            await markAsRead(id);

            fetchNotifications();

        };

    const handleDelete =
        async (id) => {

            await deleteNotification(id);

            fetchNotifications();

        };

    return (

        <div className="relative">

            <button
                onClick={() =>
                    setOpen(!open)
                }
                className="relative w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
            >

                <FaBell className="text-lg" />

                {unreadCount > 0 && (

                    <span
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                    >
                        {unreadCount}
                    </span>

                )}

            </button>

            {open && (

                <div className="absolute right-0 mt-3 w-96 max-h-[500px] overflow-y-auto rounded-2xl bg-white dark:bg-[#1e293b] shadow-2xl border border-gray-200 dark:border-gray-700 z-50">

                    <div className="p-4 border-b dark:border-gray-700">

                        <h2 className="text-lg font-bold">
                            Notifications
                        </h2>

                    </div>

                    {notifications.length === 0 ? (

                        <p className="p-6 text-center text-gray-500">
                            No notifications
                        </p>

                    ) : (

                        notifications.map(
                            (notification) => (

                                <div
                                    key={notification._id}
                                    className={`p-4 border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#0f172a] transition ${
                                        notification.isRead
                                            ? ""
                                            : "bg-blue-50 dark:bg-blue-900/20"
                                    }`}
                                >

                                    <div className="flex justify-between items-start">

                                        <div className="flex-1">

                                            <h3 className="font-semibold">
                                                {notification.title}
                                            </h3>

                                            <p className="text-sm text-gray-500 mt-1">
                                                {notification.message}
                                            </p>

                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(
                                                    notification.createdAt
                                                ).toLocaleString()}
                                            </p>

                                        </div>

                                        <div className="flex flex-col gap-2 ml-4">

                                            {!notification.isRead && (

                                                <button
                                                    onClick={() =>
                                                        handleRead(
                                                            notification._id
                                                        )
                                                    }
                                                    className="text-xs text-blue-500 hover:underline"
                                                >
                                                    Read
                                                </button>

                                            )}

                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        notification._id
                                                    )
                                                }
                                                className="text-xs text-red-500 hover:underline"
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            )
                        )

                    )}

                </div>

            )}

        </div>

    );

}

export default NotificationBell;