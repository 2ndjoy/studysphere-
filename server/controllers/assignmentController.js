const Assignment = require(
    "../models/Assignment"
);


// CREATE ASSIGNMENT
exports.createAssignment = async (
    req,
    res
) => {
    try {

        const {
            title,
            dueDate,
            subject,
            priority,
        } = req.body;

        const assignment =
            await Assignment.create({
                title,
                dueDate,
                subject,
                priority,
                user: req.user.id,
            });

        res.status(201).json(
            assignment
        );

    } catch (error) {

        res.status(500).json({
            message: error.message,
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
exports.toggleStatus = async (
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

        assignment.status =
            assignment.status ===
                "pending"
                ? "completed"
                : "pending";

        await assignment.save();

        res.json(assignment);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};