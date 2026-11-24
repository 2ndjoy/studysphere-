
const {
    describe,
    it,
} = require("node:test");

const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");

const {
    configureTestEnvironment,
} = require("./helpers/testDatabase");

configureTestEnvironment();

const upload = require(
    "../middleware/uploadMiddleware"
);

// Minimal file signatures used for isolated tests.
// No real user files or Cloudinary uploads are involved.

const jpegFile = Buffer.from([
    0xff, 0xd8, 0xff, 0xd9,
]);

const pngFile = Buffer.from([
    0x89, 0x50, 0x4e, 0x47,
    0x0d, 0x0a, 0x1a, 0x0a,
    0x00,
]);

const pdfFile = Buffer.from(
    "%PDF-1.4\nTest PDF content\n"
);

function createSignatureProbe(kind) {
    const uploader =
        kind === "avatar"
            ? upload.avatarUpload
            : upload.resourceUpload;

    assert.equal(
        typeof upload.validateFileSignature,
        "function",
        "Expected file-signature validation middleware"
    );

    const app = express();

    app.post(
        "/upload",
        uploader.single("file"),
        upload.validateFileSignature,
        (req, res) => {
            return res.status(200).json({
                message: "File validated",
                mimetype: req.file.mimetype,
            });
        }
    );

    app.use((error, req, res, next) => {
        return res.status(
            error.status || 400
        ).json({
            message: error.message ||
                "Upload rejected",
        });
    });

    return app;
}

describe("Upload File Signature Security", () => {

    it("accepts a JPEG with a matching signature", async () => {
        const app = createSignatureProbe("avatar");

        const response = await request(app)
            .post("/upload")
            .attach("file", jpegFile, {
                filename: "profile.jpg",
                contentType: "image/jpeg",
            });

        assert.equal(response.status, 200);
    });

    it("accepts a PNG with a matching signature", async () => {
        const app = createSignatureProbe("avatar");

        const response = await request(app)
            .post("/upload")
            .attach("file", pngFile, {
                filename: "profile.png",
                contentType: "image/png",
            });

        assert.equal(response.status, 200);
    });

    it("accepts a PDF with a matching signature", async () => {
        const app = createSignatureProbe("resource");

        const response = await request(app)
            .post("/upload")
            .attach("file", pdfFile, {
                filename: "lecture.pdf",
                contentType: "application/pdf",
            });

        assert.equal(response.status, 200);
    });

    it("rejects PDF content disguised as a JPEG", async () => {
        const app = createSignatureProbe("avatar");

        const response = await request(app)
            .post("/upload")
            .attach("file", pdfFile, {
                filename: "profile.jpg",
                contentType: "image/jpeg",
            });

        assert.equal(response.status, 415);
    });

    it("rejects fake PDF content", async () => {
        const app = createSignatureProbe("resource");

        const response = await request(app)
            .post("/upload")
            .attach(
                "file",
                Buffer.from("not a real PDF"),
                {
                    filename: "lecture.pdf",
                    contentType: "application/pdf",
                }
            );

        assert.equal(response.status, 415);
    });

    it("rejects a misleading executable extension", async () => {
        const app = createSignatureProbe("resource");

        const response = await request(app)
            .post("/upload")
            .attach("file", jpegFile, {
                filename: "suspicious.exe",
                contentType: "image/jpeg",
            });

        assert.equal(response.status, 415);
    });

});
