import axios from "axios";

const API =
    "http://localhost:5000/api/assignments";


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


// GET ASSIGNMENTS
export const getAssignments =
    async (filters = {}) => {

        const params =
            new URLSearchParams();

        if (filters.search) {
            params.append(
                "search",
                filters.search
            );
        }

        if (
            filters.status &&
            filters.status !== "all"
        ) {
            params.append(
                "status",
                filters.status
            );
        }

        if (
            filters.subject &&
            filters.subject !== "all"
        ) {
            params.append(
                "subject",
                filters.subject
            );
        }

        const response =
            await axios.get(
                `${API}?${params.toString()}`,
                config()
            );

        return response.data;
    };
// CREATE ASSIGNMENT
export const createAssignment =
    async (assignmentData) => {

        const response =
            await axios.post(
                API,
                assignmentData,
                config()
            );

        return response.data;
    };


// DELETE ASSIGNMENT
export const deleteAssignment =
    async (id) => {

        const response =
            await axios.delete(
                `${API}/${id}`,
                config()
            );

        return response.data;
    };


// TOGGLE STATUS
export const toggleAssignmentStatus =
    async (id) => {

        const response =
            await axios.patch(
                `${API}/${id}`,
                {},
                config()
            );

        return response.data;
    };