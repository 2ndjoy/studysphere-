import axios from "axios";

const API =
    "http://localhost:5000/api/resources";


// TOKEN
const getToken = () => {
    return localStorage.getItem("token");
};


// CONFIG
const config = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`,
    },
});


// GET RESOURCES
export const getResources =
    async () => {

        const response =
            await axios.get(
                API,
                config()
            );

        return response.data;
    };


// UPLOAD RESOURCE
export const uploadResource =
    async (formData) => {

        const response =
            await axios.post(
                API,
                formData,
                {
                    headers: {
                        Authorization:
                            `Bearer ${getToken()}`,
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

        return response.data;
    };


// DELETE RESOURCE
export const deleteResource =
    async (id) => {

        const response =
            await axios.delete(
                `${API}/${id}`,
                config()
            );

        return response.data;
    };