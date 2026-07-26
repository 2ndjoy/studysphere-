import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useUser } from "../context/UserContext";
import DashboardLayout from "../layouts/DashboardLayout";

import {
    getProfile,
    updateProfile,
    uploadAvatar,
} from "../services/userService";

function Profile() {
const { fetchUser } = useUser();
    const [loading, setLoading] = useState(true);

    const [avatar, setAvatar] = useState("");

    const [selectedImage, setSelectedImage] = useState(null);

    const [preview, setPreview] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        bio: "",
        university: "",
        department: "",
        semester: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {

        try {

            const user = await getProfile();

            setFormData({
                name: user.name || "",
                email: user.email || "",
                bio: user.bio || "",
                university: user.university || "",
                department: user.department || "",
                semester: user.semester || "",
            });

            setAvatar(user.avatar || "");

        } catch (error) {

            toast.error("Failed to load profile");

        } finally {

            setLoading(false);

        }
    };

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

    };

    const handleSave = async (e) => {

        e.preventDefault();

        try {

          await updateProfile({
    name: formData.name,
    bio: formData.bio,
    university: formData.university,
    department: formData.department,
    semester: formData.semester,
});

await fetchUser();

toast.success("Profile updated successfully");
        } catch (error) {

            toast.error("Failed to update profile");

        }

    };

    const handleImageChange = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        setSelectedImage(file);

        setPreview(URL.createObjectURL(file));

    };

    const handleAvatarUpload = async () => {

        if (!selectedImage) {
            return toast.error("Please select an image");
        }

        try {

            const data = new FormData();

            data.append("file", selectedImage);

           const response = await uploadAvatar(data);

setAvatar(response.avatar);

await fetchUser();

setPreview("");

setSelectedImage(null);

toast.success("Avatar updated!");
        } catch (error) {

            toast.error("Upload failed");

        }

    };

    if (loading) {

        return (

            <DashboardLayout>

                <div className="flex items-center justify-center h-[70vh]">

                    <p className="text-xl text-gray-500">
                        Loading Profile...
                    </p>

                </div>

            </DashboardLayout>

        );

    }

    return (        <DashboardLayout>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-5xl mx-auto"
            >

                <h1 className="text-4xl font-bold mb-8">
                    My Profile
                </h1>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Avatar Card */}

                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-lg p-8 flex flex-col items-center">

                        <img
                            src={
                                preview ||
                                avatar ||
                                `https://ui-avatars.com/api/?name=${formData.name}`
                            }
                            alt="Profile"
                            className="w-40 h-40 rounded-full object-cover border-4 border-blue-500"
                        />

                        <input
                            type="file"
                            accept="image/*"
                            className="mt-6"
                            onChange={handleImageChange}
                        />

                        <button
                            onClick={handleAvatarUpload}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition"
                        >
                            Upload Photo
                        </button>

                        <div className="mt-6 text-center">

                            <h2 className="text-2xl font-semibold">
                                {formData.name}
                            </h2>

                            <p className="text-gray-500 dark:text-gray-400">
                                {formData.email}
                            </p>

                        </div>

                    </div>

                    {/* Profile Form */}

                    <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] rounded-2xl shadow-lg p-8">

                        <form
                            onSubmit={handleSave}
                            className="space-y-5"
                        >

                            <div>

                                <label className="block mb-2 font-medium">
                                    Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f172a]"
                                />

                            </div>

                            <div>

                                <label className="block mb-2 font-medium">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-[#111827]"
                                />

                            </div>

                            <div>

                                <label className="block mb-2 font-medium">
                                    Bio
                                </label>

                                <textarea
                                    rows="4"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f172a]"
                                />

                            </div>

                            <div className="grid md:grid-cols-2 gap-5">

                                <div>

                                    <label className="block mb-2 font-medium">
                                        University
                                    </label>

                                    <input
                                        type="text"
                                        name="university"
                                        value={formData.university}
                                        onChange={handleChange}
                                        className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f172a]"
                                    />

                                </div>

                                <div>

                                    <label className="block mb-2 font-medium">
                                        Department
                                    </label>

                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f172a]"
                                    />

                                </div>

                            </div>

                            <div>

                                <label className="block mb-2 font-medium">
                                    Semester
                                </label>

                                <input
                                    type="text"
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f172a]"
                                />

                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
                            >
                                Save Changes
                            </button>

                        </form>

                    </div>

                </div>

            </motion.div>

        </DashboardLayout>

    );

}

export default Profile;