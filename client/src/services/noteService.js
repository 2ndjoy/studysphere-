import axios from "axios";

const API =
    "http://localhost:5000/api/notes";


const getToken = () =>
    localStorage.getItem(
        "token"
    );


const config = () => ({
    headers: {
        Authorization:
            `Bearer ${getToken()}`,
    },
});


// GET NOTES
export const getNotes =
    async () => {

        const response =
            await axios.get(
                API,
                config()
            );

        return response.data;
    };


// CREATE NOTE
export const createNote =
    async (noteData) => {

        const response =
            await axios.post(
                API,
                noteData,
                config()
            );

        return response.data;
    };


// DELETE NOTE
export const deleteNote =
    async (id) => {

        const response =
            await axios.delete(
                `${API}/${id}`,
                config()
            );

        return response.data;
    };