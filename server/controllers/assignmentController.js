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




exports.getAssignments = async (req, res) => {
    try {
        const {
            search,
            status,
            subject,
        } = req.query;

        // Always restrict results to the authenticated user.
        const query = {
            user: req.user.id,
        };

        // 1. Validate and safely handle search input.
        if (search !== undefined) {
            if (
                typeof search !== "string" ||
                search.length > 100
            ) {
                return res.status(400).json({
                    message: "Invalid search filter",
                });
            }

            const trimmedSearch = search.trim();

            if (trimmedSearch) {
                // Escape regular expression special characters.
                // This makes searches behave like literal text.
                const escapedSearch = trimmedSearch.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                );

                query.title = {
                    $regex: escapedSearch,
                    $options: "i",
                };
            }
        }

        // 2. Validate the status filter.
        if (
            status !== undefined &&
            status !== "all"
        ) {
            const allowedStatuses = [
                "pending",
                "completed",
            ];

            if (
                typeof status !== "string" ||
                !allowedStatuses.includes(status)
            ) {
                return res.status(400).json({
                    message: "Invalid status filter",
                });
            }

            query.status = status;
        }

        // 3. Validate the subject filter.
        if (
            subject !== undefined &&
            subject !== "all"
        ) {
            if (!mongoose.isObjectIdOrHexString(subject)) {
                return res.status(400).json({
                    message: "Invalid subject ID",
                });
            }

            query.subject = subject;
        }

        // 4. Retrieve only the authenticated user's assignments.
        const assignments = await Assignment.find(query)
            .populate("subject")
            .sort({
                createdAt: -1,
            });

        return res.status(200).json(assignments);

    } catch (error) {
        // Do not expose internal database errors to clients.
        return res.status(500).json({
            message: "Unable to retrieve assignments",
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