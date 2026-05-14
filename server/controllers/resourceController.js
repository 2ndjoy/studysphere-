const Resource = require(
    "../models/Resource"
);


// UPLOAD RESOURCE
exports.uploadResource =
    async (req, res) => {
        try {

            if (!req.file) {
                return res
                    .status(400)
                    .json({
                        message:
                            "No file uploaded",
                    });
            }

            const resource =
                await Resource.create({
                    title:
                        req.body.title,

                    fileUrl:
                        req.file.path,

                    fileType:
                        req.file.mimetype,

                    user: req.user.id,
                });

            res.status(201).json(
                resource
            );

        } catch (error) {

            res.status(500).json({
                message:
                    error.message,
            });

        }
    };


// GET USER RESOURCES
exports.getResources =
    async (req, res) => {
        try {

            const resources =
                await Resource.find({
                    user: req.user.id,
                }).sort({
                    createdAt: -1,
                });

            res.json(resources);

        } catch (error) {

            res.status(500).json({
                message:
                    error.message,
            });

        }
    };


// DELETE RESOURCE
exports.deleteResource =
    async (req, res) => {
        try {

            const resource =
                await Resource.findById(
                    req.params.id
                );

            if (!resource) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Resource not found",
                    });
            }

            if (
                resource.user.toString() !==
                req.user.id
            ) {
                return res
                    .status(401)
                    .json({
                        message:
                            "Not authorized",
                    });
            }

            await resource.deleteOne();

            res.json({
                message:
                    "Resource deleted",
            });

        } catch (error) {

            res.status(500).json({
                message:
                    error.message,
            });

        }
    };