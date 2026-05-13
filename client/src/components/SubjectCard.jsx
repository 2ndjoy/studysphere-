import { FaTrash } from "react-icons/fa";

function SubjectCard({
    subject,
    onDelete,
}) {
    return (
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/10 flex items-center justify-between">

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

        </div>
    );
}

export default SubjectCard;