import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast"; import { motion } from "framer-motion";
function Register() {
    const [formData, setFormData] = useState({
        name: "",
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
                "http://localhost:5000/api/auth/register",
                formData
            );

            console.log(response.data);

            toast.success("Registration successful!");

        } catch (error) {
            console.log(error.response.data);

            toast.error(error.response.data.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-[#1e293b] p-8 rounded-2xl shadow-lg"
            >
                <h1 className="text-3xl font-bold text-white mb-6 text-center">
                    Register
                </h1>

                <div className="mb-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg bg-[#334155] text-white outline-none"
                    />
                </div>

                <div className="mb-4">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg bg-[#334155] text-white outline-none"
                    />
                </div>

                <div className="mb-6">
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg bg-[#334155] text-white outline-none"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 transition-all p-3 rounded-lg text-white font-semibold"
                >
                    Register
                </button>
            </form>
        </div>
    );
}

export default Register;