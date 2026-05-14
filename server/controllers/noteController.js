const Note = require(
    "../models/Note"
);


// CREATE NOTE
exports.createNote =
    async (req, res) => {
        try {

            const {
                title,
                content,
            } = req.body;

            const note =
                await Note.create({
                    title,
                    content,
                    user: req.user.id,
                });

            res.status(201).json(
                note
            );

        } catch (error) {

            res.status(500).json({
                message:
                    error.message,
            });

        }
    };


// GET NOTES
exports.getNotes =
    async (req, res) => {
        try {

            const notes =
                await Note.find({
                    user: req.user.id,
                }).sort({
                    createdAt: -1,
                });

            res.json(notes);

        } catch (error) {

            res.status(500).json({
                message:
                    error.message,
            });

        }
    };


// DELETE NOTE
exports.deleteNote =
    async (req, res) => {
        try {

            const note =
                await Note.findById(
                    req.params.id
                );

            if (!note) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Note not found",
                    });
            }

            if (
                note.user.toString() !==
                req.user.id
            ) {
                return res
                    .status(401)
                    .json({
                        message:
                            "Not authorized",
                    });
            }

            await note.deleteOne();

            res.json({
                message:
                    "Note deleted",
            });

        } catch (error) {

            res.status(500).json({
                message:
                    error.message,
            });

        }
    };