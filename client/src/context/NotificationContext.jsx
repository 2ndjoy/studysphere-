import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    getNotifications,
} from "../services/notificationService";

const NotificationContext =
    createContext();

export const NotificationProvider =
    ({ children }) => {

        const [
            notifications,
            setNotifications,
        ] = useState([]);

        const [
            loading,
            setLoading,
        ] = useState(true);

        const fetchNotifications =
            async () => {

                try {

                    const data =
                        await getNotifications();

                    setNotifications(
                        data
                    );

                } catch (error) {

                    console.log(error);

                } finally {

                    setLoading(false);

                }

            };

        useEffect(() => {
            let active = true;

            getNotifications()
                .then((data) => {
                    if (active) setNotifications(data);
                })
                .catch((error) => {
                    console.error("Failed to load notifications", error);
                })
                .finally(() => {
                    if (active) setLoading(false);
                });

            return () => {
                active = false;
            };
        }, []);

        const unreadCount =
            notifications.filter(
                n => !n.isRead
            ).length;

        return (

            <NotificationContext.Provider
                value={{

                    notifications,

                    setNotifications,

                    fetchNotifications,

                    unreadCount,

                    loading,

                }}
            >

                {children}

            </NotificationContext.Provider>

        );

    };

export const useNotifications =
    () =>
        useContext(
            NotificationContext
        );