
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

// Ensure test-only environment values are configured.
configureTestEnvironment();

const uploadHandlers = require(
    "../middleware/uploadMiddleware"
);

const FIVE_MIB = 5 * 1024 * 1024;
const TEN_MIB = 10 * 1024 * 1024;

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

// Create an isolated Express application that exercises
// the real upload middleware without calling Cloudinary.
function createUploadProbe(kind) {
    const uploader =
        kind === "avatar"
            ? uploadHandlers.avatarUpload
            : uploadHandlers.resourceUpload;

    assert.equal(
        typeof uploader?.single,
        "function",
        `Expected a dedicated ${kind} upload middleware`
    );

    const app = express();

    app.post(
        "/upload",
        uploader.single("file"),
        (req, res) => {
            if (!req.file) {
                return res.status(400).json({
                    message: "No file uploaded",
                });
            }

            return res.status(200).json({
                mimetype: req.file.mimetype,
                size: req.file.size,
                hasBuffer: Buffer.isBuffer(
                    req.file.buffer
                ),
                hasPath: typeof req.file.path === "string",
            });
        }
    );

    // Translate upload errors into consistent HTTP responses.
    app.use((error, req, res, next) => {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                message: "File too large",
            });
        }

        return res.status(
            error.status === 415 ? 415 : 400
        ).json({
            message: error.message || "Upload rejected",
        });
    });

    return app;
}

describe("Upload Middleware Security", () => {

    it("accepts a JPEG avatar into memory", async () => {
        const app = createUploadProbe("avatar");

        const response = await request(app)
            .post("/upload")
            .attach("file", jpegFile, {
                filename: "avatar.jpg",
                contentType: "image/jpeg",
            });

        assert.equal(response.status, 200);
        assert.equal(response.body.mimetype, "image/jpeg");
        assert.equal(response.body.hasBuffer, true);
        assert.equal(response.body.hasPath, false);
    });

    it("rejects PDF files as avatars", async () => {
        const app = createUploadProbe("avatar");

        const response = await request(app)
            .post("/upload")
            .attach("file", pdfFile, {
                filename: "document.pdf",
                contentType: "application/pdf",
            });

        assert.equal(response.status, 415);
    });

    it("accepts PDF study resources into memory", async () => {
        const app = createUploadProbe("resource");

        const response = await request(app)
            .post("/upload")
            .attach("file", pdfFile, {
                filename: "lecture.pdf",
                contentType: "application/pdf",
            });

        assert.equal(response.status, 200);
        assert.equal(response.body.mimetype, "application/pdf");
        assert.equal(response.body.hasBuffer, true);
        assert.equal(response.body.hasPath, false);
    });

    it("rejects executable resource files", async () => {
        const app = createUploadProbe("resource");

        const response = await request(app)
            .post("/upload")
            .attach("file", Buffer.from("test executable"), {
                filename: "malware.exe",
                contentType: "application/octet-stream",
            });

        assert.equal(response.status, 415);
    });

    it("rejects avatars larger than 5 MiB", async () => {
        const app = createUploadProbe("avatar");

        const oversizedFile = Buffer.concat([
            pngFile,
            Buffer.alloc(FIVE_MIB),
        ]);

        const response = await request(app)
            .post("/upload")
            .attach("file", oversizedFile, {
                filename: "large-avatar.png",
                contentType: "image/png",
            });

        assert.equal(response.status, 413);
    });

    it("rejects resources larger than 10 MiB", async () => {
        const app = createUploadProbe("resource");

        const oversizedFile = Buffer.concat([
            pdfFile,
            Buffer.alloc(TEN_MIB),
        ]);

        const response = await request(app)
            .post("/upload")
            .attach("file", oversizedFile, {
                filename: "large-resource.pdf",
                contentType: "application/pdf",
            });

        assert.equal(response.status, 413);
    });

});
