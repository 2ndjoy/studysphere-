import {
    useEffect,
    useState,
} from "react";

import DashboardLayout from "../layouts/DashboardLayout";

import SubjectCard from "../components/SubjectCard";

import {
    getSubjects,
    createSubject,
    deleteSubject,
} from "../services/subjectService";
import { motion } from "framer-motion";
function Subjects() {

    const [subjects, setSubjects] =
        useState([]);

    const [title, setTitle] =
        useState("");

    const [loading, setLoading] =
        useState(true);


    // FETCH SUBJECTS
    useEffect(() => {
        let active = true;

        getSubjects()
            .then((data) => {
                if (active) setSubjects(data);
            })
            .catch((error) => {
                console.error("Failed to load subjects", error);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    // CREATE SUBJECT
    const handleCreateSubject =
        async (e) => {

            e.preventDefault();

            if (!title) return;

            try {

                const newSubject =
                    await createSubject({
                        title,
                    });

                setSubjects([
                    newSubject,
                    ...subjects,
                ]);

                setTitle("");

            } catch (error) {

                console.log(error);

            }
        };


    // DELETE SUBJECT
    const handleDeleteSubject =
        async (id) => {

            try {

                await deleteSubject(id);

                setSubjects(
                    subjects.filter(
                        (subject) =>
                            subject._id !== id
                    )
                );

            } catch (error) {

                console.log(error);

            }
        };


    return (
        <DashboardLayout>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

                <div>
                    <h1 className="text-4xl font-bold">
                        Subjects
                    </h1>

                    <p className="text-gray-400 mt-2">
                        Manage your study subjects
                    </p>
                </div>

            </div>


            {/* Create Subject */}
            <form
                onSubmit={
                    handleCreateSubject
                }
                className="bg-gray-100 dark:bg-[#1e293b] border border-white/10 rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-4"
            >

                <input
                    type="text"
                    placeholder="Enter subject name..."
                    value={title}
                    onChange={(e) =>
                        setTitle(e.target.value)
                    }
                    className="flex-1 bg-white dark:bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 outline-none text-gray-900 dark:text-white"
                />

                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 transition px-6 py-3 rounded-xl font-semibold"
                >
                    Add Subject
                </button>

            </form>


            {/* Loading */}
            {loading ? (
                <p className="text-gray-400">
                    Loading subjects...
                </p>
            ) : subjects.length === 0 ? (

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
                    <h2 className="text-2xl font-semibold mb-2">
                        No Subjects Yet
                    </h2>

                    <p className="text-gray-400">
                        Create your first subject
                    </p>

                </motion.div>

            ) : (

                <div className="grid gap-4">

                    {subjects.map((subject) => (
                        <SubjectCard
                            key={subject._id}
                            subject={subject}
                            onDelete={
                                handleDeleteSubject
                            }
                        />
                    ))}

                </div>

            )}

        </DashboardLayout>
    );
}

export default Subjects;