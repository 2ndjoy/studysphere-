import {
    FaTrash,
} from "react-icons/fa";

import { motion } from "framer-motion";

function NoteCard({
    note,
    onDelete,
}) {

    return (
        <motion.div
            layout
            initial={{
                opacity: 0,
                scale: 0.95,
            }}
            animate={{
                opacity: 1,
                scale: 1,
            }}
            whileHover={{
                y: -5,
            }}
            className="bg-[#1e293b] border border-white/10 rounded-2xl p-6"
        >

            {/* Top */}
            <div className="flex items-center justify-between mb-4">

                <h2 className="text-2xl font-semibold">
                    {note.title}
                </h2>

                <button
                    onClick={() =>
                        onDelete(note._id)
                    }
                    className="text-red-400 hover:text-red-500 transition"
                >
                    <FaTrash />
                </button>

            </div>


            {/* Content */}
            <div
                className="prose prose-invert max-w-none text-gray-300"
                dangerouslySetInnerHTML={{
                    __html:
                        note.content,
                }}
            />

        </motion.div>
    );
}

export default NoteCard;