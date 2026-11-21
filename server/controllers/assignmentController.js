const Assignment = require(
    "../models/Assignment"
);
const Subject = require(
    "../models/Subject"
);
const mongoose = require("mongoose");

exports.createAssignment = async (req, res) => {
    try {
        const {
            title,
            dueDate,
            subject,
            priority,
        } = req.body ?? {};

        // 1. Validate title.
        if (
            typeof title !== "string" ||
            !title.trim()
        ) {
            return res.status(400).json({
                message: "Title is required",
            });
        }

        // 2. Validate subject presence.
        if (
            subject === undefined ||
            subject === null ||
            subject === ""
        ) {
            return res.status(400).json({
                message: "Subject is required",
            });
        }

        // 3. Validate the subject ObjectId.
        if (!mongoose.isObjectIdOrHexString(subject)) {
            return res.status(400).json({
                message: "Invalid subject ID",
            });
        }

        // 4. Validate due date.
        if (
            typeof dueDate !== "string" ||
            !dueDate.trim() ||
            Number.isNaN(new Date(dueDate).getTime())
        ) {
            return res.status(400).json({
                message: "Invalid due date",
            });
        }

        // 5. Validate priority.
        // If omitted, the schema uses "medium".
        const allowedPriorities = [
            "low",
            "medium",
            "high",
        ];

        if (
            priority !== undefined &&
            !allowedPriorities.includes(priority)
        ) {
            return res.status(400).json({
                message: "Invalid priority",
            });
        }

        // 6. Verify subject ownership.
        const ownedSubject = await Subject.findOne({
            _id: subject,
            user: req.user.id,
        });

        if (!ownedSubject) {
            return res.status(404).json({
                message: "Subject not found",
            });
        }

        // 7. Create the validated assignment.
        const assignment = await Assignment.create({
            title: title.trim(),
            dueDate,
            subject,
            priority,
            user: req.user.id,
        });

        // Preserve the frontend's expected response format.
        await assignment.populate("subject");

        return res.status(201).json(assignment);

    } catch (error) {
        // Do not expose internal database errors.
        return res.status(500).json({
            message: "Unable to create assignment",
        });
    }
};



// GET ASSIGNMENTS
// GET ASSIGNMENTS
exports.getAssignments = async (
    req,
    res
) => {
    try {

        const {
            search,
            status,
            subject,
        } = req.query;

        // Base query
        const query = {
            user: req.user.id,
        };

        // Search filter
        if (search) {
            query.title = {
                $regex: search,
                $options: "i",
            };
        }

        // Status filter
        if (
            status &&
            status !== "all"
        ) {
            query.status = status;
        }

        // Subject filter
        if (
            subject &&
            subject !== "all"
        ) {
            query.subject = subject;
        }

        const assignments =
            await Assignment.find(query)
                .populate("subject")
                .sort({
                    createdAt: -1,
                });

        res.json(assignments);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

// DELETE ASSIGNMENT
exports.deleteAssignment = async (
    req,
    res
) => {
    try {

        const assignment =
            await Assignment.findById(
                req.params.id
            );

        if (!assignment) {
            return res.status(404).json({
                message:
                    "Assignment not found",
            });
        }

        // Ownership check
        if (
            assignment.user.toString() !==
            req.user.id
        ) {
            return res.status(401).json({
                message: "Not authorized",
            });
        }

        await assignment.deleteOne();

        res.json({
            message:
                "Assignment deleted",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};


// TOGGLE STATUS
exports.toggleStatus = async (req, res) => {
    try {

        // Find assignment belonging to the authenticated user
        const assignment = await Assignment.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!assignment) {
            return res.status(404).json({
                message: "Assignment not found",
            });
        }

        // Toggle completion status
        assignment.status =
            assignment.status === "pending"
                ? "completed"
                : "pending";

        await assignment.save();

        // Preserve subject details in the response
        await assignment.populate("subject");

        res.json(assignment);

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};