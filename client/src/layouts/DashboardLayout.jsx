import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaBook,
    FaClipboardList,
    FaHome,
    FaStickyNote,
    FaSignOutAlt,
    FaBars, FaCalendarAlt, FaFolderOpen
} from "react-icons/fa";

import { useContext, useState } from "react";

import { AuthContext } from "../context/AuthContext";

function DashboardLayout({ children }) {
    const navigate = useNavigate();

    const { logout } = useContext(AuthContext);

    const [isSidebarOpen, setIsSidebarOpen] =
        useState(false);

    const handleLogout = () => {
        logout();

        navigate("/login");
    };

    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
            ? "bg-blue-600 text-white"
            : "hover:bg-white/10 text-gray-300"
        }`;

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex">

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() =>
                        setIsSidebarOpen(false)
                    }
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed md:static top-0 left-0 z-50
          h-screen w-64 bg-[#111827]
          border-r border-white/10
          p-6 flex flex-col
          transition-transform duration-300

          ${isSidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full md:translate-x-0"
                    }
        `}
            >

                {/* Logo */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight">
                        StudySphere
                    </h1>

                    <p className="text-sm text-gray-400 mt-1">
                        Student Workspace
                    </p>
                </div>

                {/* Navigation */}
                <nav className="space-y-3 flex-1">

                    <NavLink
                        to="/dashboard"
                        className={navLinkClass}
                        onClick={() =>
                            setIsSidebarOpen(false)
                        }
                    >
                        <FaHome />
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/subjects"
                        className={navLinkClass}
                        onClick={() =>
                            setIsSidebarOpen(false)
                        }
                    >
                        <FaBook />
                        Subjects
                    </NavLink>

                    <NavLink
                        to="/assignments"
                        className={navLinkClass}
                        onClick={() =>
                            setIsSidebarOpen(false)
                        }
                    >
                        <FaClipboardList />
                        Assignments
                    </NavLink>

                    <NavLink
                        to="/notes"
                        className={navLinkClass}
                        onClick={() =>
                            setIsSidebarOpen(false)
                        }
                    >
                        <FaStickyNote />
                        Notes
                    </NavLink>
                    <NavLink
                        to="/calendar"
                        className={navLinkClass}
                        onClick={() =>
                            setIsSidebarOpen(false)
                        }
                    >
                        <FaCalendarAlt />
                        Calendar
                    </NavLink>
                    <NavLink
                        to="/resources"
                        className={navLinkClass}
                        onClick={() =>
                            setIsSidebarOpen(false)
                        }
                    >
                        <FaFolderOpen />
                        Resources
                    </NavLink>
                </nav>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition-all"
                >
                    <FaSignOutAlt />
                    Logout
                </button>

            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">

                {/* Topbar */}
                <header className="h-16 border-b border-white/10 bg-[#111827]/80 backdrop-blur-md flex items-center justify-between gap-4 px-4 md:px-6 sticky top-0 z-30">

                    {/* Left Side */}
                    <div className="flex items-center gap-4">

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() =>
                                setIsSidebarOpen(true)
                            }
                            className="md:hidden text-2xl"
                        >
                            <FaBars />
                        </button>

                        <h2 className="text-lg md:text-xl font-semibold">
                            Dashboard
                        </h2>

                    </div>

                    {/* Profile */}
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                        J
                    </div>

                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-6">
                    {children}
                </main>

            </div>
        </div>
    );
}

export default DashboardLayout;