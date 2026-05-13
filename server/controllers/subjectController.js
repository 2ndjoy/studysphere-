const Subject = require("../models/Subject");


// CREATE SUBJECT
exports.createSubject = async (req, res) => {
    try {

        const { title, color } = req.body;

        const subject = await Subject.create({
            title,
            color,
            user: req.user.id,
        });

        res.status(201).json(subject);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};


// GET USER SUBJECTS
exports.getSubjects = async (req, res) => {
    try {

        const subjects = await Subject.find({
            user: req.user.id,
        });

        res.json(subjects);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};


// DELETE SUBJECT
exports.deleteSubject = async (req, res) => {
    try {

        const subject = await Subject.findById(
            req.params.id
        );

        if (!subject) {
            return res.status(404).json({
                message: "Subject not found",
            });
        }

        // Check ownership
        if (
            subject.user.toString() !== req.user.id
        ) {
            return res.status(401).json({
                message: "Not authorized",
            });
        }

        await subject.deleteOne();

        res.json({
            message: "Subject deleted",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};