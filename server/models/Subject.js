const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        color: {
            type: String,
            default: "#3B82F6",
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Subject",
    subjectSchema
);