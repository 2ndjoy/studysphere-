const multer = require("multer");

const {
    CloudinaryStorage,
} = require(
    "multer-storage-cloudinary"
);

const cloudinary = require(
    "../config/cloudinary"
);

const storage =
    new CloudinaryStorage({
        cloudinary,

        params: {
            folder:
                "studysphere_uploads",

            allowed_formats: [
                "jpg",
                "png",
                "pdf",
                "jpeg",
            ],
        },
    });

const upload = multer({
    storage,
});

module.exports = upload;