import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/users`;

const getToken = () => localStorage.getItem("token");

export const getProfile = async () => {
    const res = await axios.get(`${API}/profile`, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    return res.data;
};

export const updateProfile = async (data) => {
    const res = await axios.put(`${API}/profile`, data, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    return res.data;
};

export const uploadAvatar = async (formData) => {
    const res = await axios.post(`${API}/avatar`, formData, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "multipart/form-data",
        },
    });

    return res.data;
};