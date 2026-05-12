import DashboardLayout from "../layouts/DashboardLayout";

function Dashboard() {
    return (
        <DashboardLayout>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-semibold mb-2">
                        Total Subjects
                    </h3>

                    <p className="text-4xl font-bold">
                        6
                    </p>
                </div>

                <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-semibold mb-2">
                        Pending Assignments
                    </h3>

                    <p className="text-4xl font-bold">
                        12
                    </p>
                </div>

                <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-semibold mb-2">
                        Uploaded Notes
                    </h3>

                    <p className="text-4xl font-bold">
                        24
                    </p>
                </div>

            </div>

        </DashboardLayout>
    );
}

export default Dashboard;