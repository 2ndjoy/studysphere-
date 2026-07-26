function RecentActivity({ stats }) {

    const activities = [

        {
            title: `${stats.completed} Assignments Completed`,
            time: "Updated just now",
        },

        {
            title: `${stats.pending} Assignments Pending`,
            time: "Current status",
        },

        {
            title: `${stats.totalSubjects} Subjects Created`,
            time: "Workspace summary",
        },

    ];

    return (

        <div className="bg-gray-100 dark:bg-[#1e293b] rounded-2xl p-6">

            <h2 className="text-2xl font-bold mb-6">
                Recent Activity
            </h2>

            <div className="space-y-5">

                {activities.map((activity, index) => (

                    <div
                        key={index}
                        className="border-b border-gray-300 dark:border-gray-700 pb-4 last:border-none"
                    >

                        <h3 className="font-semibold">
                            {activity.title}
                        </h3>

                        <p className="text-sm text-gray-500">
                            {activity.time}
                        </p>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default RecentActivity;