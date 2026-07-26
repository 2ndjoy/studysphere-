import { format } from "date-fns";
import { FaCalendarAlt } from "react-icons/fa";

function UpcomingDeadlines({ assignments }) {

    return (

        <div className="bg-gray-100 dark:bg-[#1e293b] rounded-2xl p-6">

            <h2 className="text-2xl font-bold mb-6">
                Upcoming Deadlines
            </h2>

            {
                assignments.length === 0 && (

                    <p className="text-gray-500">
                        No upcoming assignments 🎉
                    </p>

                )
            }

            <div className="space-y-4">

                {
                    assignments.map((assignment) => (

                        <div
                            key={assignment._id}
                            className="flex justify-between items-center p-4 rounded-xl bg-white dark:bg-[#0f172a]"
                        >

                            <div>

                                <h3 className="font-semibold">
                                    {assignment.title}
                                </h3>

            <p className="text-sm text-gray-500">
    {assignment.subject?.title || "No Subject"}
</p>
                            </div>

                            <div className="flex items-center gap-2 text-blue-500">

                                <FaCalendarAlt />

                                <span className="text-sm">

                                    {
                                        format(
                                            new Date(
                                                assignment.dueDate
                                            ),
                                            "dd MMM yyyy"
                                        )
                                    }

                                </span>

                            </div>

                        </div>

                    ))
                }

            </div>

        </div>

    );

}

export default UpcomingDeadlines;