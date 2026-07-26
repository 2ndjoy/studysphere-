import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaBook,
    FaClipboardList,
    FaHome,
    FaStickyNote,
    FaSignOutAlt,
    FaBars,
    FaCalendarAlt,
    FaFolderOpen,
    FaMoon,
    FaUser,
    FaSun,
    FaTimes
} from "react-icons/fa";

import { useContext, useState, useRef, useEffect } from "react";
import NotificationBell from "../components/notification/NotificationBell";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";

function DashboardLayout({ children }) {
    const { user } = useUser();
    const [showMenu, setShowMenu] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const dropdownRef = useRef(null);

    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
            isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
        }`;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 flex transition-colors duration-200">

            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed md:sticky top-0 left-0 z-50
                    h-screen w-64 bg-gray-900 border-r border-gray-800
                    p-5 flex flex-col justify-between shrink-0
                    transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                <div>
                    {/* Header/Logo */}
                    <div className="flex items-center justify-between mb-8 px-2">
                        <Link to="/" className="group flex flex-col">
                            <h1 className="text-2xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                                StudySphere
                            </h1>
                            <span className="text-xs text-gray-400 mt-0.5">
                                Student Workspace
                            </span>
                        </Link>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden text-gray-400 hover:text-white p-1"
                            aria-label="Close menu"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1.5">
                        <NavLink
                            to="/dashboard"
                            className={navLinkClass}
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <FaHome className="text-lg" />
                            Dashboard
                        </NavLink>

                        <NavLink
                            to="/profile"
                            className={navLinkClass}
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <FaUser className="text-lg" />
                            Profile
                        </NavLink>

                        <NavLink
                            to="/subjects"
                            className={navLinkClass}
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <FaBook className="text-lg" />
                            Subjects
                        </NavLink>

                        <NavLink
                            to="/assignments"
                            className={navLinkClass}
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <FaClipboardList className="text-lg" />
                            Assignments
                        </NavLink>

                        <NavLink
                            to="/notes"
                            className={navLinkClass}
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <FaStickyNote className="text-lg" />
                            Notes
                        </NavLink>

                        <NavLink
                            to="/calendar"
                            className={navLinkClass}
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <FaCalendarAlt className="text-lg" />
                            Calendar
                        </NavLink>

                        <NavLink
                            to="/resources"
                            className={navLinkClass}
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <FaFolderOpen className="text-lg" />
                            Resources
                        </NavLink>
                    </nav>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 mt-auto font-medium"
                >
                    <FaSignOutAlt className="text-lg" />
                    Logout
                </button>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen">

                {/* Topbar Navigation */}
                <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 transition-colors duration-200">

                    {/* Left Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                            aria-label="Open sidebar"
                        >
                            <FaBars className="text-xl" />
                        </button>

                        <h2 className="text-lg md:text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
                            Dashboard
                        </h2>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-3">

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors flex items-center justify-center focus:outline-none"
                            aria-label="Toggle Theme"
                        >
                            {theme === "dark" ? <FaSun className="text-amber-400" /> : <FaMoon />}
                        </button>

                        {/* Notification Component */}
                        <NotificationBell />

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1" />

                        {/* User Profile Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                            >
                                <img
                                    src={
                                        user?.avatar ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            user?.name || "User"
                                        )}&background=2563eb&color=fff`
                                    }
                                    alt="Profile avatar"
                                    className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-600/30"
                                />

                                <div className="hidden md:block text-left pr-2">
                                    <h4 className="font-semibold text-sm leading-tight text-gray-800 dark:text-gray-100">
                                        {user?.name || "User"}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
                                        {user?.email || "student@workspace.com"}
                                    </p>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {showMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden z-50"
                                    >
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 md:hidden">
                                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                                                {user?.name || "User"}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {user?.email}
                                            </p>
                                        </div>

                                        <div className="p-1.5 space-y-1">
                                            <Link
                                                to="/profile"
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={() => setShowMenu(false)}
                                            >
                                                <FaUser className="text-gray-400" />
                                                My Profile
                                            </Link>

                                            <button
                                                onClick={() => {
                                                    setShowMenu(false);
                                                    handleLogout();
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                            >
                                                <FaSignOutAlt />
                                                Logout
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Page Content Container */}
                <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;