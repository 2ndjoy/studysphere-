import {
    useEffect,
    useState,
} from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import { motion } from "framer-motion";
import AssignmentCard from "../components/AssignmentCard";

import {
    getAssignments,
    createAssignment,
    deleteAssignment,
    toggleAssignmentStatus,
} from "../services/assignmentService";

import {
    getSubjects,
} from "../services/subjectService";

function Assignments() {

    const [assignments,
        setAssignments] =
        useState([]);

    const [subjects,
        setSubjects] =
        useState([]);

    const [title,
        setTitle] =
        useState("");

    const [dueDate,
        setDueDate] =
        useState("");

    const [selectedSubject,
        setSelectedSubject] =
        useState("");

    const [loading,
        setLoading] =
        useState(true);
    const [searchTerm, setSearchTerm] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [subjectFilter, setSubjectFilter] =
        useState("all");
    const [priority, setPriority] =
        useState("medium");
    // FETCH DATA
    const fetchAssignments =
        async () => {

            try {

                setLoading(true);

                const data =
                    await getAssignments({
                        search: searchTerm,
                        status: statusFilter,
                        subject: subjectFilter,
                    });

                setAssignments(data);

            } catch (error) {

                console.log(error);

            } finally {

                setLoading(false);

            }
        };

    const fetchSubjects =
        async () => {

            try {

                const data =
                    await getSubjects();

                setSubjects(data);

            } catch (error) {

                console.log(error);

            }
        };
    useEffect(() => {

        fetchSubjects();

    }, []);


    useEffect(() => {

        fetchAssignments();

    }, [
        searchTerm,
        statusFilter,
        subjectFilter,
    ]);

    // CREATE
    const handleCreate =
        async (e) => {

            e.preventDefault();

            if (
                !title ||
                !dueDate ||
                !selectedSubject
            ) {
                return;
            }

            try {

                const newAssignment =
                    await createAssignment({
                        title,
                        dueDate,
                        subject:
                            selectedSubject, priority,
                    });
                setPriority("medium");

                setAssignments([
                    newAssignment,
                    ...assignments,
                ]);

                setTitle("");
                setDueDate("");
                setSelectedSubject("");

            } catch (error) {

                console.log(error);

            }
        };


    // DELETE
    const handleDelete =
        async (id) => {

            try {

                await deleteAssignment(id);

                setAssignments(
                    assignments.filter(
                        (assignment) =>
                            assignment._id !== id
                    )
                );

            } catch (error) {

                console.log(error);

            }
        };


    // TOGGLE STATUS
    const handleToggle =
        async (id) => {

            try {

                const updated =
                    await toggleAssignmentStatus(
                        id
                    );

                setAssignments(
                    assignments.map(
                        (assignment) =>
                            assignment._id === id
                                ? updated
                                : assignment
                    )
                );

            } catch (error) {

                console.log(error);

            }
        };


    return (
        <DashboardLayout>

            {/* Header */}
            <motion.div
                initial={{
                    opacity: 0,
                    y: 15,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.3,
                }}
                className="mb-8"
            >

                <h1 className="text-4xl font-bold">
                    Assignments
                </h1>

                <p className="text-gray-400 mt-2">
                    Track your study tasks
                </p>

            </motion.div>


            {/* Form */}
            <form
                onSubmit={handleCreate}
                className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 mb-8 grid md:grid-cols-4 gap-4"
            >

                <input
                    type="text"
                    placeholder="Assignment title"
                    value={title}
                    onChange={(e) =>
                        setTitle(
                            e.target.value
                        )
                    }
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 outline-none"
                />

                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) =>
                        setDueDate(
                            e.target.value
                        )
                    }
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 outline-none"
                />

                <select
                    value={selectedSubject}
                    onChange={(e) =>
                        setSelectedSubject(
                            e.target.value
                        )
                    }
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 outline-none"
                >

                    <option value="">
                        Select Subject
                    </option>

                    {subjects.map(
                        (subject) => (
                            <option
                                key={
                                    subject._id
                                }
                                value={
                                    subject._id
                                }
                            >
                                {subject.title}
                            </option>
                        )
                    )}

                </select>
                <select
                    value={priority}
                    onChange={(e) =>
                        setPriority(e.target.value)
                    }
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 outline-none"
                >

                    <option value="low">
                        Low Priority
                    </option>

                    <option value="medium">
                        Medium Priority
                    </option>

                    <option value="high">
                        High Priority
                    </option>

                </select>
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 transition rounded-xl font-semibold"
                >
                    Add
                </button>

            </form>
            {/* Search & Filters */}
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
                {/* Search */}
                <input
                    type="text"
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) =>
                        setSearchTerm(
                            e.target.value
                        )
                    }
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 outline-none"
                />


                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(
                            e.target.value
                        )
                    }
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 outline-none"
                >

                    <option value="all">
                        All Status
                    </option>

                    <option value="pending">
                        Pending
                    </option>

                    <option value="completed">
                        Completed
                    </option>

                </select>


                {/* Subject Filter */}
                <select
                    value={subjectFilter}
                    onChange={(e) =>
                        setSubjectFilter(
                            e.target.value
                        )
                    }
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 outline-none"
                >

                    <option value="all">
                        All Subjects
                    </option>

                    {subjects.map((subject) => (
                        <option
                            key={subject._id}
                            value={subject._id}
                        >
                            {subject.title}
                        </option>
                    ))}

                </select>

            </motion.div>

            {/* Loading */}
            {loading ? (

                <p className="text-gray-400">
                    Loading...
                </p>

            ) : assignments.length ===
                0 ? (

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

                    <h2 className="text-2xl font-semibold mb-2">
                        No Assignments Yet
                    </h2>

                    <p className="text-gray-400">
                        Create your first assignment
                    </p>

                </motion.div>

            ) : (

                <div className="grid gap-4">

                    {assignments.map(
                        (assignment) => (
                            <AssignmentCard
                                key={
                                    assignment._id
                                }
                                assignment={
                                    assignment
                                }
                                onDelete={
                                    handleDelete
                                }
                                onToggle={
                                    handleToggle
                                }
                            />
                        )
                    )}

                </div>

            )}

        </DashboardLayout>
    );
}

export default Assignments;