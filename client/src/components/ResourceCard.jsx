import {
    FaTrash,
    FaExternalLinkAlt,
    FaFilePdf,
    FaImage,
} from "react-icons/fa";

import { motion } from "framer-motion";

function ResourceCard({
    resource,
    onDelete,
}) {

    const isPDF =
        resource.fileType?.includes(
            "pdf"
        );

    const isImage =
        resource.fileType?.includes(
            "image"
        );

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

                <div
                    className={`p-4 rounded-xl ${isPDF
                            ? "bg-red-500/20 text-red-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                >

                    {isPDF ? (
                        <FaFilePdf />
                    ) : (
                        <FaImage />
                    )}

                </div>


                <button
                    onClick={() =>
                        onDelete(resource._id)
                    }
                    className="text-red-400 hover:text-red-500 transition"
                >
                    <FaTrash />
                </button>

            </div>


            {/* Title */}
            <h2 className="text-xl font-semibold mb-3 line-clamp-1">
                {resource.title}
            </h2>


            {/* Type */}
            <p className="text-gray-400 text-sm mb-5">
                {resource.fileType}
            </p>


            {/* Open */}
            <a
                href={resource.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-xl font-medium"
            >
                Open File
                <FaExternalLinkAlt />
            </a>

        </motion.div>
    );
}

export default ResourceCard;