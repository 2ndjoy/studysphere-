import {
    useEffect,
    useState,
} from "react";

import DashboardLayout from "../layouts/DashboardLayout";

import toast from "react-hot-toast";

import {
    getNotes,
    createNote,
    deleteNote,
} from "../services/noteService";

import NoteEditor from "../components/NoteEditor";

import NoteCard from "../components/NoteCard";

function Notes() {

    const [notes,
        setNotes] =
        useState([]);

    const [title,
        setTitle] =
        useState("");

    const [content,
        setContent] =
        useState("");

    const [loading,
        setLoading] =
        useState(true);


    // FETCH
    const fetchNotes =
        async () => {

            try {

                const data =
                    await getNotes();

                setNotes(data);

            } catch (error) {

                console.log(error);

            } finally {

                setLoading(false);

            }
        };


    useEffect(() => {

        fetchNotes();

    }, []);


    // CREATE
    const handleCreate =
        async (e) => {

            e.preventDefault();

            if (!title) {
                return toast.error(
                    "Title required"
                );
            }

            try {

                const newNote =
                    await createNote({
                        title,
                        content,
                    });

                setNotes([
                    newNote,
                    ...notes,
                ]);

                toast.success(
                    "Note created!"
                );

                setTitle("");
                setContent("");

            } catch (error) {

                toast.error(
                    "Failed to create note"
                );

            }
        };


    // DELETE
    const handleDelete =
        async (id) => {

            try {

                await deleteNote(id);

                setNotes(
                    notes.filter(
                        (note) =>
                            note._id !== id
                    )
                );

                toast.success(
                    "Note deleted"
                );

            } catch (error) {

                toast.error(
                    "Delete failed"
                );

            }
        };


    return (
        <DashboardLayout>

            {/* Header */}
            <div className="mb-8">

                <h1 className="text-4xl font-bold">
                    Notes
                </h1>

                <p className="text-gray-400 mt-2">
                    Write rich study notes
                </p>

            </div>


            {/* Form */}
            <form
                onSubmit={handleCreate}
                className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 mb-8"
            >

                <input
                    type="text"
                    placeholder="Note title"
                    value={title}
                    onChange={(e) =>
                        setTitle(
                            e.target.value
                        )
                    }
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 outline-none mb-6"
                />

                <NoteEditor
                    content={content}
                    setContent={setContent}
                />

                <button
                    type="submit"
                    className="mt-6 bg-blue-600 hover:bg-blue-700 transition px-6 py-3 rounded-xl font-semibold"
                >
                    Save Note
                </button>

            </form>


            {/* Notes */}
            {loading ? (

                <p className="text-gray-400">
                    Loading notes...
                </p>

            ) : notes.length === 0 ? (

                <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-10 text-center">

                    <h2 className="text-2xl font-semibold mb-2">
                        No Notes Yet
                    </h2>

                    <p className="text-gray-400">
                        Create your first note
                    </p>

                </div>

            ) : (

                <div className="grid gap-6">

                    {notes.map((note) => (
                        <NoteCard
                            key={note._id}
                            note={note}
                            onDelete={
                                handleDelete
                            }
                        />
                    ))}

                </div>

            )}

        </DashboardLayout>
    );
}

export default Notes;