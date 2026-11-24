
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const {
    configureTestEnvironment,
} = require("./helpers/testDatabase");

configureTestEnvironment();

const {
    uploadBufferToCloudinary,
    deleteAssetFromCloudinary,
} = require("../services/cloudinaryUpload");

const jpeg = Buffer.from([
    0xff, 0xd8, 0xff, 0xd9,
]);

const pdf = Buffer.from(
    "%PDF-1.4\nTest PDF content\n"
);

const IMAGE_URL =
    "https://res.cloudinary.com/test/image/upload/test.jpg";

const PDF_URL =
    "https://res.cloudinary.com/test/raw/upload/test.pdf";

const TEST_UUID =
    "123e4567-e89b-42d3-a456-426614174000";

// This is a fake Cloudinary SDK.
// It NEVER makes a network request.
function createFakeClient({
    publicIdOverride,
    destroyError,
} = {}) {
    const uploads = [];
    const deletions = [];

    const client = {
        uploader: {
            upload_stream(options, callback) {
                return {
                    end(buffer) {
                        uploads.push({
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
                                    publicIdOverride ??
                                    `${options.folder}/${options.public_id}`,

                                resource_type:
                                    options.resource_type,
                            });
                        });
                    },
                };
            },

            async destroy(publicId, options) {
                deletions.push({
                    publicId,
                    options,
                });

                if (destroyError) {
                    throw destroyError;
                }

                return {
                    result: "ok",
                };
            },
        },
    };

    return {
        client,
        uploads,
        deletions,
    };
}

describe("Cloudinary Orphan Cleanup Security", () => {

    it("returns image metadata for cleanup", async () => {
        const { client, uploads } =
            createFakeClient();

        const asset = await uploadBufferToCloudinary(
            {
                buffer: jpeg,
                mimetype: "image/jpeg",
            },
            {
                client,
                includeMetadata: true,
            }
        );

        assert.equal(asset.url, IMAGE_URL);

        assert.equal(
            asset.resourceType,
            "image"
        );

        assert.equal(uploads.length, 1);

        assert.equal(
            asset.publicId,
            `${uploads[0].options.folder}/${uploads[0].options.public_id}`
        );
    });

    it("returns raw PDF metadata for cleanup", async () => {
        const { client } = createFakeClient();

        const asset = await uploadBufferToCloudinary(
            {
                buffer: pdf,
                mimetype: "application/pdf",
            },
            {
                client,
                includeMetadata: true,
            }
        );

        assert.equal(asset.url, PDF_URL);

        assert.equal(
            asset.resourceType,
            "raw"
        );

        assert.match(
            asset.publicId,
            /^studysphere_uploads\/[a-f0-9-]+\.pdf$/
        );
    });

    it("rejects unexpected cloud asset identifiers", async () => {
        const { client } = createFakeClient({
            publicIdOverride:
                "unexpected_folder/different-file",
        });

        await assert.rejects(
            uploadBufferToCloudinary(
                {
                    buffer: jpeg,
                    mimetype: "image/jpeg",
                },
                {
                    client,
                    includeMetadata: true,
                }
            ),
            /Cloud upload failed/
        );
    });

    it("deletes only the specified image asset", async () => {
        const { client, deletions } =
            createFakeClient();

        const asset = {
            publicId:
                `studysphere_uploads/${TEST_UUID}`,
            resourceType: "image",
        };

        await deleteAssetFromCloudinary(
            asset,
            { client }
        );

        assert.equal(deletions.length, 1);

        assert.equal(
            deletions[0].publicId,
            asset.publicId
        );

        assert.equal(
            deletions[0].options.resource_type,
            "image"
        );

        assert.equal(
            deletions[0].options.invalidate,
            true
        );
    });

    it("deletes raw PDFs with the correct resource type", async () => {
        const { client, deletions } =
            createFakeClient();

        await deleteAssetFromCloudinary(
            {
                publicId:
                    `studysphere_uploads/${TEST_UUID}.pdf`,
                resourceType: "raw",
            },
            { client }
        );

        assert.equal(deletions.length, 1);

        assert.equal(
            deletions[0].options.resource_type,
            "raw"
        );
    });

    it("refuses to delete assets outside StudySphere", async () => {
        const { client, deletions } =
            createFakeClient();

        await assert.rejects(
            deleteAssetFromCloudinary(
                {
                    publicId:
                        "../another_project/file",
                    resourceType: "image",
                },
                { client }
            ),
            /Invalid cloud asset/
        );

        assert.equal(deletions.length, 0);
    });

    it("hides internal Cloudinary deletion errors", async () => {
        const { client } = createFakeClient({
            destroyError: new Error(
                "PRIVATE_CLOUDINARY_DELETE_ERROR"
            ),
        });

        await assert.rejects(
            deleteAssetFromCloudinary(
                {
                    publicId:
                        `studysphere_uploads/${TEST_UUID}`,
                    resourceType: "image",
                },
                { client }
            ),
            (error) => {
                assert.equal(
                    error.message,
                    "Cloud cleanup failed"
                );

                assert.doesNotMatch(
                    error.message,
                    /PRIVATE_CLOUDINARY_DELETE_ERROR/
                );

                return true;
            }
        );
    });

});
