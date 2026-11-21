import {
    FaCheck,
    FaTrash,
    FaUndo,
} from "react-icons/fa";

import { motion } from "framer-motion";

function AssignmentCard({
    assignment,
    onDelete,
    onToggle,
}) {

    const isCompleted =
        assignment.status === "completed";

    const dueDate = new Date(
        assignment.dueDate
    ).toLocaleDateString();

    const today = new Date();

    const due = new Date(
        assignment.dueDate
    );

    const isOverdue =
        !isCompleted &&
        due < today;

    const isDueSoon =
        !isOverdue &&
        !isCompleted &&
        due - today <
        1000 * 60 * 60 * 24 * 2;

    const priorityColors = {
        low: "bg-blue-500/20 text-blue-400",
        medium: "bg-yellow-500/20 text-yellow-400",
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
            className="bg-gray-100 dark:bg-[#1e293b] border border-white/10 rounded-2xl p-6"
        >

            {/* Assignment Details */}
            <div>

                <div className="flex items-center gap-3 mb-2">

                    <h2
                        className={`text-xl font-semibold ${
                            isCompleted
                                ? "line-through text-gray-500"
                                : ""
                        }`}
                    >
                        {assignment.title}
                    </h2>

                    <span
                        className={`text-xs px-3 py-1 rounded-full ${
                            isCompleted
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                        }`}
                    >
                        {assignment.status}
                    </span>

                </div>

                {/* Priority */}
                <span
                    className={`text-xs px-3 py-1 rounded-full ${
                        priorityColors[assignment.priority]
                    }`}
                >
                    {assignment.priority}
                </span>

                {/* Overdue Warning */}
                {isOverdue && (
                    <span className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400">
                        Overdue
                    </span>
                )}

                {/* Due Soon Warning */}
                {isDueSoon && (
                    <span className="text-xs px-3 py-1 rounded-full bg-orange-500/20 text-orange-400">
                        Due Soon
                    </span>
                )}

                <p className="text-gray-400">
                    Subject:{" "}
                    {assignment.subject?.title}
                </p>

                <p className="text-gray-400">
                    Due: {dueDate}
                </p>

            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">

                {/* Complete / Undo Button */}
                <button
                    type="button"
                    onClick={() =>
                        onToggle(assignment._id)
                    }
                    title={
                        isCompleted
                            ? "Mark as pending"
                            : "Mark as completed"
                    }
                    aria-label={
                        isCompleted
                            ? "Mark as pending"
                            : "Mark as completed"
                    }
                    className={`transition p-3 rounded-xl text-white ${
                        isCompleted
                            ? "bg-amber-500 hover:bg-amber-600"
                            : "bg-green-500 hover:bg-green-600"
                    }`}
                >
                    {isCompleted ? (
                        <FaUndo />
                    ) : (
                        <FaCheck />
                    )}
                </button>

                {/* Delete Button */}
                <button
                    type="button"
                    onClick={() =>
                        onDelete(assignment._id)
                    }
                    title="Delete assignment"
                    aria-label="Delete assignment"
                    className="bg-red-500 hover:bg-red-600 transition p-3 rounded-xl text-white"
                >
                    <FaTrash />
                </button>

            </div>

        </motion.div>
    );
}

export default AssignmentCard;