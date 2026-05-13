import {
    FaCheck,
    FaTrash,
} from "react-icons/fa";

function AssignmentCard({
    assignment,
    onDelete,
    onToggle,
}) {

    const dueDate = new Date(
        assignment.dueDate
    ).toLocaleDateString();

    return (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            {/* Left */}
            <div>

                <div className="flex items-center gap-3 mb-2">

                    <h2
                        className={`text-xl font-semibold ${assignment.status ===
                                "completed"
                                ? "line-through text-gray-500"
                                : ""
                            }`}
                    >
                        {assignment.title}
                    </h2>

                    <span
                        className={`text-xs px-3 py-1 rounded-full ${assignment.status ===
                                "completed"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                    >
                        {assignment.status}
                    </span>

                </div>

                <p className="text-gray-400">
                    Subject:{" "}
                    {
                        assignment.subject
                            ?.title
                    }
                </p>

                <p className="text-gray-400">
                    Due: {dueDate}
                </p>

            </div>


            {/* Actions */}
            <div className="flex items-center gap-3">

                <button
                    onClick={() =>
                        onToggle(
                            assignment._id
                        )
                    }
                    className="bg-green-500 hover:bg-green-600 transition p-3 rounded-xl"
                >
                    <FaCheck />
                </button>

                <button
                    onClick={() =>
                        onDelete(
                            assignment._id
                        )
                    }
                    className="bg-red-500 hover:bg-red-600 transition p-3 rounded-xl"
                >
                    <FaTrash />
                </button>

            </div>

        </div>
    );
}

export default AssignmentCard;