import {
    useEffect,
    useState,
} from "react";

import { motion } from "framer-motion";

import DashboardLayout from "../layouts/DashboardLayout";
import {
    FaBook,
    FaClipboardList,
    FaCheckCircle,
    FaClock,
    FaChartLine,
} from "react-icons/fa";

import StatsCard from "../components/dashboard/StatsCard";

import { useUser } from "../context/UserContext";

import {
    getDashboardStats,
} from "../services/dashboardService";

import AssignmentPieChart from "../components/charts/AssignmentPieChart";

import ProductivityBarChart from "../components/charts/ProductivityBarChart";
import DashboardSkeleton from "../components/skeletons/DashboardSkeleton";
import QuickActions from "../components/dashboard/QuickActions";
import UpcomingDeadlines from "../components/dashboard/UpcomingDeadlines";
import RecentActivity from "../components/dashboard/RecentActivity";
function Dashboard() {
const { user } = useUser();

const hour = new Date().getHours();

let greeting = "Good Evening";

if (hour < 12)
    greeting = "Good Morning";

else if (hour < 18)
    greeting = "Good Afternoon";
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
      <DashboardSkeleton />
    </DashboardLayout>
  );
}


    return (
        <DashboardLayout>

            {/* Header */}
          <motion.div
    initial={{
        opacity: 0,
        y: 15,
    }}
    animate={{
        opacity: 1,
        y: 0,
    }}
    transition={{
        duration: 0.3,
    }}
    className="mb-8"
>

    <h1 className="text-4xl font-bold">

        {greeting},{" "}

        <span className="text-blue-500">
            {user?.name || "Student"}
        </span>

        👋

    </h1>

    <p className="text-gray-400 mt-2">

        Stay productive.
        Keep learning.
        Finish today's goals.

    </p>

</motion.div>


        {/* Dashboard Stats */}

<div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-5 mb-8">

    <StatsCard
        title="Subjects"
        value={stats.totalSubjects}
        subtitle="Manage your courses"
        icon={<FaBook />}
        color="from-indigo-500 to-purple-600"
    />

    <StatsCard
        title="Assignments"
        value={stats.totalAssignments}
        subtitle="Total assignments"
        icon={<FaClipboardList />}
        color="from-cyan-500 to-blue-600"
    />

    <StatsCard
        title="Completed"
        value={stats.completed}
        subtitle="Finished successfully"
        icon={<FaCheckCircle />}
        color="from-green-500 to-emerald-600"
    />

    <StatsCard
        title="Pending"
        value={stats.pending}
        subtitle="Waiting to finish"
        icon={<FaClock />}
        color="from-orange-500 to-red-500"
    />

    <StatsCard
        title="Progress"
        value={`${stats.completionRate}%`}
        subtitle="Overall completion"
        icon={<FaChartLine />}
        color="from-pink-500 to-fuchsia-600"
    />

</div>

            {/* Progress */}
            <motion.div
                initial={{
                    opacity: 0,
                    y: 20,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.6,
                }}
                className="bg-gray-100 dark:bg-[#1e293b] border border-white/10 rounded-2xl p-6"
            >

                <div className="flex items-center justify-between mb-4">

                    <h2 className="text-2xl font-semibold">
                        Productivity Progress
                    </h2>

                    <span className="text-2xl font-bold text-blue-400">
                        {stats.completionRate}%
                    </span>

                </div>


                {/* Progress Bar */}
                <div className="w-full h-4 bg-white dark:bg-[#0f172a] rounded-full overflow-hidden">

                    <motion.div
                        initial={{
                            width: 0,
                        }}
                        animate={{
                            width: `${stats.completionRate}%`,
                        }}
                        transition={{
                            duration: 1,
                        }}
                        className="h-full bg-blue-500 rounded-full"
                    />

                </div>

                <p className="text-gray-400 mt-4">
                    You’ve completed{" "}
                    {stats.completed} out of{" "}
                    {stats.totalAssignments} assignments.
                </p>

            </motion.div>


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
<div className="grid xl:grid-cols-3 gap-6 mt-8">

    <UpcomingDeadlines
        assignments={
            stats.upcomingAssignments
        }
    />

    <QuickActions />

    <RecentActivity
        stats={stats}
    />

</div>
        </DashboardLayout>
    );
}

export default Dashboard;