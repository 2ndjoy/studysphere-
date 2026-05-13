import {
    useEffect,
    useState,
} from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import AssignmentPieChart from "../components/charts/AssignmentPieChart";

import ProductivityBarChart from "../components/charts/ProductivityBarChart";
import {
    FaBook,
    FaClipboardList,
    FaCheckCircle,
    FaClock,
} from "react-icons/fa";

import {
    getDashboardStats,
} from "../services/dashboardService";

function Dashboard() {

    const [stats, setStats] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    useEffect(() => {

        const fetchStats =
            async () => {

                try {

                    const data =
                        await getDashboardStats();

                    setStats(data);

                } catch (error) {

                    console.log(error);

                } finally {

                    setLoading(false);

                }
            };

        fetchStats();

    }, []);


    if (loading) {
        return (
            <DashboardLayout>
                <p className="text-gray-400">
                    Loading dashboard...
                </p>
            </DashboardLayout>
        );
    }


    return (
        <DashboardLayout>

            {/* Header */}
            <div className="mb-8">

                <h1 className="text-4xl font-bold">
                    Dashboard
                </h1>

                <p className="text-gray-400 mt-2">
                    Welcome back to your
                    workspace
                </p>

            </div>


            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

                {/* Subjects */}
                <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6">

                    <div className="flex items-center justify-between mb-4">

                        <div className="bg-blue-500/20 text-blue-400 p-3 rounded-xl">
                            <FaBook />
                        </div>

                        <span className="text-sm text-gray-400">
                            Subjects
                        </span>

                    </div>

                    <h2 className="text-4xl font-bold">
                        {
                            stats.totalSubjects
                        }
                    </h2>

                </div>


                {/* Assignments */}
                <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6">

                    <div className="flex items-center justify-between mb-4">

                        <div className="bg-purple-500/20 text-purple-400 p-3 rounded-xl">
                            <FaClipboardList />
                        </div>

                        <span className="text-sm text-gray-400">
                            Assignments
                        </span>

                    </div>

                    <h2 className="text-4xl font-bold">
                        {
                            stats.totalAssignments
                        }
                    </h2>

                </div>


                {/* Completed */}
                <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6">

                    <div className="flex items-center justify-between mb-4">

                        <div className="bg-green-500/20 text-green-400 p-3 rounded-xl">
                            <FaCheckCircle />
                        </div>

                        <span className="text-sm text-gray-400">
                            Completed
                        </span>

                    </div>

                    <h2 className="text-4xl font-bold">
                        {stats.completed}
                    </h2>

                </div>


                {/* Pending */}
                <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6">

                    <div className="flex items-center justify-between mb-4">

                        <div className="bg-yellow-500/20 text-yellow-400 p-3 rounded-xl">
                            <FaClock />
                        </div>

                        <span className="text-sm text-gray-400">
                            Pending
                        </span>

                    </div>

                    <h2 className="text-4xl font-bold">
                        {stats.pending}
                    </h2>

                </div>

            </div>


            {/* Progress Section */}
            <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6">

                <div className="flex items-center justify-between mb-4">

                    <h2 className="text-2xl font-semibold">
                        Productivity Progress
                    </h2>

                    <span className="text-2xl font-bold text-blue-400">
                        {
                            stats.completionRate
                        }
                        %
                    </span>

                </div>


                {/* Progress Bar */}
                <div className="w-full h-4 bg-[#0f172a] rounded-full overflow-hidden">

                    <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{
                            width: `${stats.completionRate}%`,
                        }}
                    />

                </div>

                <p className="text-gray-400 mt-4">
                    You’ve completed{" "}
                    {stats.completed} out of{" "}
                    {
                        stats.totalAssignments
                    }{" "}
                    assignments.
                </p>

            </div>
            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">

                <AssignmentPieChart
                    completed={stats.completed}
                    pending={stats.pending}
                />

                <ProductivityBarChart
                    completed={stats.completed}
                    pending={stats.pending}
                />

            </div>
        </DashboardLayout>
    );
}

export default Dashboard;