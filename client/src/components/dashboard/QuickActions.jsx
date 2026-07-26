import { Link } from "react-router-dom";
import {
    FaBook,
    FaClipboardList,
    FaStickyNote,
    FaFolderOpen,
} from "react-icons/fa";

const actions = [
    {
        title: "Add Subject",
        icon: <FaBook />,
        to: "/subjects",
        color: "bg-indigo-500",
    },
    {
        title: "Assignments",
        icon: <FaClipboardList />,
        to: "/assignments",
        color: "bg-blue-500",
    },
    {
        title: "Notes",
        icon: <FaStickyNote />,
        to: "/notes",
        color: "bg-green-500",
    },
    {
        title: "Resources",
        icon: <FaFolderOpen />,
        to: "/resources",
        color: "bg-orange-500",
    },
];

function QuickActions() {

    return (

        <div className="bg-gray-100 dark:bg-[#1e293b] rounded-2xl p-6">

            <h2 className="text-2xl font-bold mb-6">
                Quick Actions
            </h2>

            <div className="grid grid-cols-2 gap-4">

                {actions.map((action) => (

                    <Link
                        key={action.title}
                        to={action.to}
                        className="rounded-xl p-5 transition hover:scale-105 hover:shadow-xl bg-white dark:bg-[#0f172a]"
                    >

                        <div
                            className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl mb-4`}
                        >
                            {action.icon}
                        </div>

                        <h3 className="font-semibold">
                            {action.title}
                        </h3>

                    </Link>

                ))}

            </div>

        </div>

    );

}

export default QuickActions;