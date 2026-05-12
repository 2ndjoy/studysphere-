import { useContext } from "react";

import { useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

function Dashboard() {
    const { logout } = useContext(AuthContext);

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();

        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold">
                    Dashboard
                </h1>

                <button
                    onClick={handleLogout}
                    className="bg-red-500 px-4 py-2 rounded-lg"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Dashboard;