import {
    FaCheck,
    FaTrash,
} from "react-icons/fa";
import { motion } from "framer-motion";
function AssignmentCard({
    assignment,
    onDelete,
    onToggle,
}) {

    const dueDate = new Date(
        assignment.dueDate
    ).toLocaleDateString();
    const today = new Date();

    const due = new Date(
        assignment.dueDate
    );

    const isOverdue =
        assignment.status !==
        "completed" &&
        due < today;

    const isDueSoon =
        !isOverdue &&
        assignment.status !==
        "completed" &&
        due - today <
        1000 * 60 * 60 * 24 * 2;


    const priorityColors = {
        low: "bg-blue-500/20 text-blue-400",
        medium:
            "bg-yellow-500/20 text-yellow-400",
        high: "bg-red-500/20 text-red-400",
    };
    return (
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
                duration: 0.4,
            }}
            whileHover={{
                y: -5,
                scale: 1.02,
            }}
            className="bg-[#1e293b] border border-white/10 rounded-2xl p-6"
        >
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
                <span
                    className={`text-xs px-3 py-1 rounded-full ${priorityColors[
                        assignment.priority
                    ]
                        }`}
                >
                    {assignment.priority}
                </span>


                {isOverdue && (
                    <span className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400">
                        Overdue
                    </span>
                )}


                {isDueSoon && (
                    <span className="text-xs px-3 py-1 rounded-full bg-orange-500/20 text-orange-400">
                        Due Soon
                    </span>
                )}
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

        </motion.div>
    );
}

export default AssignmentCard;