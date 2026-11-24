
const {
    describe,
    it,
    before,
    beforeEach,
    afterEach,
    after,
} = require("node:test");

const assert = require("node:assert/strict");
const request = require("supertest");
const { Writable } = require("node:stream");

const {
    configureTestEnvironment,
    startTestDatabase,
    clearTestDatabase,
    stopTestDatabase,
} = require("./helpers/testDatabase");

const {
    createAuthenticatedUser,
    bearerToken,
} = require("./helpers/testFixtures");

configureTestEnvironment();

const jpegFile = Buffer.from([
    0xff, 0xd8, 0xff, 0xd9,
]);

const pdfFile = Buffer.from(
    "%PDF-1.4\nTest PDF content\n"
);

const IMAGE_URL =
    "https://res.cloudinary.com/test/image/upload/avatar.jpg";

const PDF_URL =
    "https://res.cloudinary.com/test/raw/upload/lecture.pdf";

let app;
let User;
let Resource;
let owner;

let cloudinary;
let originalUploadStream;

let uploadCalls = [];
let simulateUploadFailure = false;

function authenticatedPost(endpoint) {
    return request(app)
        .post(endpoint)
        .set(
            "Authorization",
            bearerToken(owner.token)
        );
}

describe("Real Upload Endpoint Security", () => {

    before(async () => {
        await startTestDatabase();


        // SAFETY: Replace the new Cloudinary
        // SDK upload_stream method with a fake.
        cloudinary = require(
            "../config/cloudinary"
        );

        originalUploadStream =
            cloudinary.uploader.upload_stream;

        cloudinary.uploader.upload_stream =
            (options, callback) => {
                const chunks = [];

                return new Writable({
                    write(chunk, encoding, done) {
                        chunks.push(
                            Buffer.from(chunk)
                        );

                        done();
                    },

                    final(done) {
                        uploadCalls.push({
                            options,
                            buffer:
                                Buffer.concat(chunks),
                        });

                        queueMicrotask(() => {
                            if (simulateUploadFailure) {
                                return callback(
                                    new Error(
                                        "PRIVATE_CLOUDINARY_ERROR"
                                    )
                                );
                            }

                            return callback(null, {
                                secure_url:
                                    options.resource_type === "raw"
                                        ? PDF_URL
                                        : IMAGE_URL,

                                public_id:
                                    `${options.folder}/${options.public_id}`,

                                resource_type:
                                    options.resource_type,
                            });
                        });

                        done();
                    },
                });
            };

        // Load actual Express routes after
        // installing both safety interceptors.
        app = require("../app");

        User = require("../models/User");
        Resource = require("../models/Resource");

        await User.init();
    });

    beforeEach(async () => {
        uploadCalls = [];
        simulateUploadFailure = false;

        owner = await createAuthenticatedUser(
            app
        );
    });

    afterEach(async () => {
        await clearTestDatabase();
    });

    after(async () => {
        // Restore the replaced methods.

        if (cloudinary) {
            cloudinary.uploader.upload_stream =
                originalUploadStream;
        }

        await stopTestDatabase();
    });

    it("rejects unauthenticated resource uploads", async () => {
        const response = await request(app)
            .post("/api/resources")
            .field("title", "Unauthorized Resource")
            .attach("file", pdfFile, {
                filename: "lecture.pdf",
                contentType: "application/pdf",
            });

        assert.equal(response.status, 401);
        assert.equal(uploadCalls.length, 0);
        assert.equal(
            await Resource.countDocuments(),
            0
        );
    });

    it("rejects unauthenticated avatar uploads", async () => {
        const response = await request(app)
            .post("/api/users/avatar")
            .attach("file", jpegFile, {
                filename: "avatar.jpg",
                contentType: "image/jpeg",
            });

        assert.equal(response.status, 401);
        assert.equal(uploadCalls.length, 0);
    });

    it("uploads a PDF resource and stores its secure URL", async () => {
        const response = await authenticatedPost(
            "/api/resources"
        )
            .field("title", "Cloud Lecture")
            .attach("file", pdfFile, {
                filename: "lecture.pdf",
                contentType: "application/pdf",
            });

        assert.equal(response.status, 201);
        assert.equal(
            response.body.fileUrl,
            PDF_URL
        );

        assert.equal(
            response.body.fileType,
            "application/pdf"
        );

        assert.equal(
            response.body.user,
            owner.id
        );

        assert.equal(uploadCalls.length, 1);
        assert.equal(
            uploadCalls[0].options.resource_type,
            "raw"
        );

        const stored = await Resource.findById(
            response.body._id
        );

        assert.ok(stored);
        assert.equal(stored.fileUrl, PDF_URL);
    });

    it("uploads an avatar and updates only its owner", async () => {
        const response = await authenticatedPost(
            "/api/users/avatar"
        )
            .attach("file", jpegFile, {
                filename: "avatar.jpg",
                contentType: "image/jpeg",
            });

        assert.equal(response.status, 200);

        assert.equal(
            response.body.message,
            "Avatar updated successfully"
        );

        assert.equal(
            response.body.avatar,
            IMAGE_URL
        );

        const stored = await User.findById(
            owner.id
        );

        assert.equal(
            stored.avatar,
            IMAGE_URL
        );

        assert.equal(uploadCalls.length, 1);
        assert.equal(
            uploadCalls[0].options.resource_type,
            "image"
        );
    });

    it("rejects PDF uploads to the avatar endpoint", async () => {
        const response = await authenticatedPost(
            "/api/users/avatar"
        )
            .attach("file", pdfFile, {
                filename: "profile.pdf",
                contentType: "application/pdf",
            });

        assert.equal(response.status, 415);
        assert.equal(uploadCalls.length, 0);

        const stored = await User.findById(
            owner.id
        );

        assert.equal(stored.avatar, "");
    });

    it("rejects disguised file content before cloud upload", async () => {
        const response = await authenticatedPost(
            "/api/users/avatar"
        )
            .attach("file", pdfFile, {
                filename: "fake.jpg",
                contentType: "image/jpeg",
            });

        assert.equal(response.status, 415);
        assert.equal(uploadCalls.length, 0);
    });

    it("rejects misleading executable file extensions", async () => {
        const response = await authenticatedPost(
            "/api/resources"
        )
            .field("title", "Suspicious File")
            .attach("file", jpegFile, {
                filename: "malware.exe",
                contentType: "image/jpeg",
            });

        assert.equal(response.status, 415);
        assert.equal(uploadCalls.length, 0);
    });

    it("rejects oversized resources before cloud upload", async () => {
        const oversizedPdf = Buffer.concat([
            pdfFile,
            Buffer.alloc(10 * 1024 * 1024),
        ]);

        const response = await authenticatedPost(
            "/api/resources"
        )
            .field("title", "Oversized Resource")
            .attach("file", oversizedPdf, {
                filename: "large.pdf",
                contentType: "application/pdf",
            });

        assert.equal(response.status, 413);
        assert.equal(uploadCalls.length, 0);

        assert.equal(
            await Resource.countDocuments(),
            0
        );
    });

    it("handles cloud failures without leaking internal errors", async () => {
        simulateUploadFailure = true;

        const response = await authenticatedPost(
            "/api/resources"
        )
            .field("title", "Failed Upload")
            .attach("file", pdfFile, {
                filename: "lecture.pdf",
                contentType: "application/pdf",
            });

        assert.equal(response.status, 502);

        assert.equal(
            response.body.message,
            "File upload failed"
        );

        assert.doesNotMatch(
            JSON.stringify(response.body),
            /PRIVATE_CLOUDINARY_ERROR/
        );

        assert.equal(uploadCalls.length, 1);

        assert.equal(
            await Resource.countDocuments(),
            0
        );
    });

});
