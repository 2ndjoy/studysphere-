const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        dueDate: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending",
        },

        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
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
    "Assignment",
    assignmentSchema
);