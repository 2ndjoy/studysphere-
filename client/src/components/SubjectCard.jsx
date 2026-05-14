import { FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";
function SubjectCard({
    subject,
    onDelete,
}) {
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
            <div className="flex items-center gap-4">

                <div
                    className="w-5 h-5 rounded-full"
                    style={{
                        backgroundColor:
                            subject.color,
                    }}
                />

                <h2 className="text-xl font-semibold">
                    {subject.title}
                </h2>

            </div>

            <button
                onClick={() =>
                    onDelete(subject._id)
                }
                className="text-red-400 hover:text-red-500 transition"
            >
                <FaTrash />
            </button>

        </motion.div>
    );
}

export default SubjectCard;