import { useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
// import toast from "react-hot-toast";
import { motion } from "framer-motion";
function Login() {
    const navigate = useNavigate();

    const { setToken } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/login`,
                formData
            );

            // Save token
            localStorage.setItem(
                "token",
                response.data.token
            );

            // Update context
            setToken(response.data.token);
            toast.success("Welcome back!"); // Redirect
            navigate("/dashboard");

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Something went wrong"
            );
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f172a] flex items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-gray-100 dark:bg-[#1e293b] p-8 rounded-2xl shadow-lg"
            >
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                    Login
                </h1>

                <div className="mb-4">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg bg-[#334155] text-gray-900 dark:text-white outline-none"
                    />
                </div>

                <div className="mb-6">
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg bg-[#334155] text-gray-900 dark:text-white outline-none"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 transition-all p-3 rounded-lg text-gray-900 dark:text-white font-semibold"
                >
                    Login
                </button>
                  <p className="mt-4">Don't have an account ? <span className="text-blue-400"><Link to="/register">Register</Link></span> </p>
        
            </form>
        </div>
    );
}

export default Login;