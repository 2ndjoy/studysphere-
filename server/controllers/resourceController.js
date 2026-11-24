const Resource = require(
    "../models/Resource"
);
const {
    uploadBufferToCloudinary,
    deleteAssetFromCloudinary,
} = require("../services/cloudinaryUpload");
// UPLOAD RESOURCE


exports.uploadResource = async (req, res) => {
    // Preserve the existing no-file response.
    if (!req.file) {
        return res.status(400).json({
            message: "No file uploaded",
        });
    }

    const title = req.body?.title;

    if (
        typeof title !== "string" ||
        !title.trim()
    ) {
        return res.status(400).json({
            message: "Title is required",
        });
    }

    // Upload to Cloudinary and retain the
    // metadata needed for possible cleanup.
    let uploadedAsset;

    try {
        uploadedAsset = await uploadBufferToCloudinary(
            req.file,
            { includeMetadata: true }
        );
    } catch {
        return res.status(502).json({
            message: "File upload failed",
        });
    }

    // Store the secure URL in MongoDB.
    try {
        const resource = await Resource.create({
            title: title.trim(),
            fileUrl: uploadedAsset.url,
            fileType: req.file.mimetype,
            user: req.user.id,
        });

        return res.status(201).json(resource);
    } catch {
        // MongoDB failed after Cloudinary
        // accepted the upload.
        // Attempt to remove the orphaned asset.
        try {
            await deleteAssetFromCloudinary(
                uploadedAsset
            );
        } catch {
            // Do not reveal provider errors
            // to the client.
            console.error(
                "Cloud asset cleanup failed after resource save error"
            );
        }

        return res.status(500).json({
            message: "Unable to save resource",
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