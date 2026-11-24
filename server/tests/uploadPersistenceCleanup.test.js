
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
let originalDestroy;

let uploadCalls = [];
let deletionCalls = [];
let simulateCleanupFailure = false;

function authenticatedPost(endpoint) {
    return request(app)
        .post(endpoint)
        .set(
            "Authorization",
            bearerToken(owner.token)
        );
}

function uploadPdf() {
    return authenticatedPost("/api/resources")
        .field("title", "Cleanup Test Resource")
        .attach("file", pdfFile, {
            filename: "lecture.pdf",
            contentType: "application/pdf",
        });
}

function uploadAvatar() {
    return authenticatedPost("/api/users/avatar")
        .attach("file", jpegFile, {
            filename: "avatar.jpg",
            contentType: "image/jpeg",
        });
}

describe("Upload Persistence and Orphan Cleanup", () => {

    before(async () => {
        await startTestDatabase();

        // Intercept Cloudinary BEFORE loading the app.
        // No actual cloud upload or deletion occurs.
        cloudinary = require(
            "../config/cloudinary"
        );

        originalUploadStream =
            cloudinary.uploader.upload_stream;

        originalDestroy =
            cloudinary.uploader.destroy;

        cloudinary.uploader.upload_stream =
            (options, callback) => {
                return {
                    end(buffer) {
                        uploadCalls.push({
                            options,
                            buffer: Buffer.from(buffer),
                        });

                        queueMicrotask(() => {
                            callback(null, {
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
                    },
                };
            };

        cloudinary.uploader.destroy =
            async (publicId, options) => {
                deletionCalls.push({
                    publicId,
                    options,
                });

                if (simulateCleanupFailure) {
                    throw new Error(
                        "PRIVATE_CLOUDINARY_DELETE_ERROR"
                    );
                }

                return {
                    result: "ok",
                };
            };

        app = require("../app");

        User = require("../models/User");
        Resource = require("../models/Resource");

        await User.init();
    });

    beforeEach(async () => {
        uploadCalls = [];
        deletionCalls = [];
        simulateCleanupFailure = false;

        owner = await createAuthenticatedUser(app);
    });

    afterEach(async () => {
        await clearTestDatabase();
    });

    after(async () => {
        if (cloudinary) {
            cloudinary.uploader.upload_stream =
                originalUploadStream;

            cloudinary.uploader.destroy =
                originalDestroy;
        }

        await stopTestDatabase();
    });

    it("deletes an uploaded PDF when saving its resource fails", async () => {
        const originalCreate = Resource.create;

        Resource.create = async () => {
            throw new Error(
                "PRIVATE_DATABASE_SAVE_ERROR"
            );
        };

        let response;

        try {
            response = await uploadPdf();
        } finally {
            Resource.create = originalCreate;
        }

        assert.equal(response.status, 500);

        assert.equal(
            response.body.message,
            "Unable to save resource"
        );

        assert.equal(uploadCalls.length, 1);
        assert.equal(deletionCalls.length, 1);

        const expectedPublicId =
            `${uploadCalls[0].options.folder}/` +
            uploadCalls[0].options.public_id;

        assert.equal(
            deletionCalls[0].publicId,
            expectedPublicId
        );

        assert.equal(
            deletionCalls[0].options.resource_type,
            "raw"
        );

        assert.equal(
            await Resource.countDocuments(),
            0
        );
    });

    it("deletes an uploaded avatar when saving the user fails", async () => {
        const originalSave = User.prototype.save;

        User.prototype.save = async function () {
            throw new Error(
                "PRIVATE_DATABASE_SAVE_ERROR"
            );
        };

        let response;

        try {
            response = await uploadAvatar();
        } finally {
            User.prototype.save = originalSave;
        }

        assert.equal(response.status, 500);

        assert.equal(
            response.body.message,
            "Unable to update avatar"
        );

        assert.equal(uploadCalls.length, 1);
        assert.equal(deletionCalls.length, 1);

        const expectedPublicId =
            `${uploadCalls[0].options.folder}/` +
            uploadCalls[0].options.public_id;

        assert.equal(
            deletionCalls[0].publicId,
            expectedPublicId
        );

        assert.equal(
            deletionCalls[0].options.resource_type,
            "image"
        );

        const stored = await User.findById(
            owner.id
        );

        assert.equal(stored.avatar, "");
    });

    it("does not expose private errors if orphan cleanup also fails", async () => {
        simulateCleanupFailure = true;

        const originalCreate = Resource.create;

        Resource.create = async () => {
            throw new Error(
                "PRIVATE_DATABASE_SAVE_ERROR"
            );
        };

        let response;

        try {
            response = await uploadPdf();
        } finally {
            Resource.create = originalCreate;
        }

        assert.equal(response.status, 500);

        assert.equal(
            response.body.message,
            "Unable to save resource"
        );

        assert.equal(deletionCalls.length, 1);

        assert.doesNotMatch(
            JSON.stringify(response.body),
            /PRIVATE_DATABASE_SAVE_ERROR|PRIVATE_CLOUDINARY_DELETE_ERROR/
        );
    });

    it("keeps the cloud asset when the resource saves successfully", async () => {
        const response = await uploadPdf();

        assert.equal(response.status, 201);
        assert.equal(response.body.fileUrl, PDF_URL);

        assert.equal(uploadCalls.length, 1);
        assert.equal(deletionCalls.length, 0);

        const stored = await Resource.findById(
            response.body._id
        );

        assert.ok(stored);
        assert.equal(stored.fileUrl, PDF_URL);
    });

});
