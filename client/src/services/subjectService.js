import axios from "axios";

const API = "http://localhost:5000/api/subjects";


// Get token
const getToken = () => {
    return localStorage.getItem("token");
};


// Axios config
const config = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`,
    },
});


// GET SUBJECTS
export const getSubjects = async () => {

    const response = await axios.get(
        API,
        config()
    );

    return response.data;
};


// CREATE SUBJECT
export const createSubject = async (
    subjectData
) => {

    const response = await axios.post(
        API,
        subjectData,
        config()
    );

    return response.data;
};


// DELETE SUBJECT
export const deleteSubject = async (
    id
) => {

    const response = await axios.delete(
        `${API}/${id}`,
        config()
    );

    return response.data;
};