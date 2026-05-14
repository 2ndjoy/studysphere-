import {
    useEffect,
    useState,
} from "react";

import DashboardLayout from "../layouts/DashboardLayout";

import toast from "react-hot-toast";

import {
    getResources,
    uploadResource,
    deleteResource,
} from "../services/resourceService";

import ResourceCard from "../components/ResourceCard";

function Resources() {

    const [resources,
        setResources] =
        useState([]);

    const [title,
        setTitle] =
        useState("");

    const [file,
        setFile] =
        useState(null);

    const [loading,
        setLoading] =
        useState(true);

    const [uploading,
        setUploading] =
        useState(false);


    // FETCH
    const fetchResources =
        async () => {

            try {

                const data =
                    await getResources();

                setResources(data);

            } catch (error) {

                console.log(error);

            } finally {

                setLoading(false);

            }
        };


    useEffect(() => {

        fetchResources();

    }, []);


    // UPLOAD
    const handleUpload =
        async (e) => {

            e.preventDefault();

            if (!title || !file) {
                return toast.error(
                    "Please fill all fields"
                );
            }

            try {

                setUploading(true);

                const formData =
                    new FormData();

                formData.append(
                    "title",
                    title
                );

                formData.append(
                    "file",
                    file
                );

                const newResource =
                    await uploadResource(
                        formData
                    );

                setResources([
                    newResource,
                    ...resources,
                ]);

                toast.success(
                    "Resource uploaded!"
                );

                setTitle("");
                setFile(null);

            } catch (error) {

                toast.error(
                    "Upload failed"
                );

            } finally {

                setUploading(false);

            }
        };


    // DELETE
    const handleDelete =
        async (id) => {

            try {

                await deleteResource(id);

                setResources(
                    resources.filter(
                        (resource) =>
                            resource._id !== id
                    )
                );

                toast.success(
                    "Resource deleted"
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
                    Resources
                </h1>

                <p className="text-gray-400 mt-2">
                    Upload and manage study files
                </p>

            </div>


            {/* Upload Form */}
            <form
                onSubmit={handleUpload}
                className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 mb-8 grid md:grid-cols-3 gap-4"
            >

                <input
                    type="text"
                    placeholder="Resource title"
                    value={title}
                    onChange={(e) =>
                        setTitle(e.target.value)
                    }
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 outline-none"
                />

                <input
                    type="file"
                    onChange={(e) =>
                        setFile(
                            e.target.files[0]
                        )
                    }
                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3"
                />

                <button
                    type="submit"
                    disabled={uploading}
                    className="bg-blue-600 hover:bg-blue-700 transition rounded-xl font-semibold"
                >
                    {uploading
                        ? "Uploading..."
                        : "Upload"}
                </button>

            </form>


            {/* Resources */}
            {loading ? (

                <p className="text-gray-400">
                    Loading resources...
                </p>

            ) : resources.length ===
                0 ? (

                <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-10 text-center">

                    <h2 className="text-2xl font-semibold mb-2">
                        No Resources Yet
                    </h2>

                    <p className="text-gray-400">
                        Upload your first study file
                    </p>

                </div>

            ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                    {resources.map(
                        (resource) => (
                            <ResourceCard
                                key={
                                    resource._id
                                }
                                resource={
                                    resource
                                }
                                onDelete={
                                    handleDelete
                                }
                            />
                        )
                    )}

                </div>

            )}

        </DashboardLayout>
    );
}

export default Resources;