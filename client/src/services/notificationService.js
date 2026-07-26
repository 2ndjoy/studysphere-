import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/notifications`;

const getToken = () =>
    localStorage.getItem("token");

const config = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`,
    },
});

export const getNotifications = async () => {

    const res = await axios.get(
        API,
        config()
    );

    return res.data;

};

export const createNotification = async (
    data
) => {

    const res = await axios.post(
        API,
        data,
        config()
    );

    return res.data;

};

export const markAsRead = async (
    id
) => {

    const res = await axios.patch(
        `${API}/${id}/read`,
        {},
        config()
    );

    return res.data;

};

export const markAllAsRead =
    async () => {

        const res =
            await axios.patch(
                `${API}/read-all`,
                {},
                config()
            );

        return res.data;

    };

export const deleteNotification =
    async (id) => {

        const res =
            await axios.delete(
                `${API}/${id}`,
                config()
            );

        return res.data;

    };