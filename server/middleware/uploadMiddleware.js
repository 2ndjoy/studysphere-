
const multer = require("multer");
const path = require("node:path");

// Upload size limits.
const FIVE_MIB = 5 * 1024 * 1024;
const TEN_MIB = 10 * 1024 * 1024;

// Allowed MIME types.
const AVATAR_TYPES = new Set([
    "image/jpeg",
    "image/png",
]);

const RESOURCE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "application/pdf",
]);

// Validate the declared MIME type.
function createFileFilter(allowedTypes) {
    return (req, file, callback) => {
        if (!allowedTypes.has(file.mimetype)) {
            const error = new Error(
                "Unsupported file type"
            );

            error.status = 415;

            return callback(error);
        }

        return callback(null, true);
    };
}

// Profile avatars: maximum 5 MiB.
const avatarUpload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: FIVE_MIB,
        files: 1,
    },

    fileFilter: createFileFilter(
        AVATAR_TYPES
    ),
});

// Study resources: maximum 10 MiB.
const resourceUpload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: TEN_MIB,
        files: 1,
    },

    fileFilter: createFileFilter(
        RESOURCE_TYPES
    ),
});

// Verify supported file headers.
function hasValidSignature(buffer, mimetype) {
    if (
        !Buffer.isBuffer(buffer) ||
        buffer.length === 0
    ) {
        return false;
    }

    if (mimetype === "image/jpeg") {
        return (
            buffer.length >= 3 &&
            buffer[0] === 0xff &&
            buffer[1] === 0xd8 &&
            buffer[2] === 0xff
        );
    }

    if (mimetype === "image/png") {
        const pngSignature = Buffer.from([
            0x89, 0x50, 0x4e, 0x47,
            0x0d, 0x0a, 0x1a, 0x0a,
        ]);

        return (
            buffer.length >= pngSignature.length &&
            buffer.subarray(
                0,
                pngSignature.length
            ).equals(pngSignature)
        );
    }

    if (mimetype === "application/pdf") {
        return (
            buffer.length >= 8 &&
            /^%PDF-[12]\.\d/.test(
                buffer.subarray(0, 8)
                    .toString("ascii")
            )
        );
    }

    return false;
}

// Match file extensions to declared MIME types.
function hasMatchingExtension(file) {
    const extension = path.extname(
        file.originalname || ""
    ).toLowerCase();

    const allowedExtensions = {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "application/pdf": [".pdf"],
    };

    return (
        allowedExtensions[file.mimetype]
            ?.includes(extension) === true
    );
}

// Validate uploaded file content.
function validateFileSignature(req, res, next) {
    if (!req.file) {
        return res.status(400).json({
            message: "No file uploaded",
        });
    }

    const file = req.file;

    if (
        !hasMatchingExtension(file) ||
        !hasValidSignature(
            file.buffer,
            file.mimetype
        )
    ) {
        return res.status(415).json({
            message: "Unsupported file content",
        });
    }

    return next();
}

// Preserve existing no-file controller responses.
function validateFileIfPresent(req, res, next) {
    if (!req.file) {
        return next();
    }

    return validateFileSignature(req, res, next);
}

// Provide safe, consistent upload errors.
function handleUploadError(error, req, res, next) {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                message: "File too large",
            });
        }

        return res.status(400).json({
            message: "Invalid file upload",
        });
    }

    if (error?.status === 415) {
        return res.status(415).json({
            message: "Unsupported file type",
        });
    }

    return next(error);
}

module.exports = {
    avatarUpload,
    resourceUpload,
    validateFileSignature,
    validateFileIfPresent,
    handleUploadError,
};
