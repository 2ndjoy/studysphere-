
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const {
    configureTestEnvironment,
} = require("./helpers/testDatabase");

configureTestEnvironment();

const jpeg = Buffer.from([
    0xff, 0xd8, 0xff, 0xd9,
]);

const pdf = Buffer.from(
    "%PDF-1.4\nTest PDF content\n"
);

function loadUploader() {
    return require(
        "../services/cloudinaryUpload"
    ).uploadBufferToCloudinary;
}

// Fake Cloudinary SDK.
// Never connects to a real Cloudinary account.
function createFakeClient({
    result = {
        secure_url:
            "https://res.cloudinary.com/test/image/upload/demo.jpg",
    },
    error = null,
} = {}) {
    const calls = [];

    const client = {
        uploader: {
            upload_stream(options, callback) {
                const call = {
                    options,
                    buffer: null,
                };

                calls.push(call);

                return {
                    end(buffer) {
                        call.buffer =
                            Buffer.from(buffer);

                        queueMicrotask(() => {
                            callback(error, result);
                        });
                    },
                };
            },
        },
    };

    return { client, calls };
}

describe("Cloudinary Upload Service Security", () => {

    it("uploads JPEG images using a secure stream", async () => {
        const uploadBufferToCloudinary = loadUploader();
        const { client, calls } = createFakeClient();

        const url = await uploadBufferToCloudinary(
            {
                buffer: jpeg,
                mimetype: "image/jpeg",
            },
            { client }
        );

        assert.equal(
            url,
            "https://res.cloudinary.com/test/image/upload/demo.jpg"
        );

        assert.equal(calls.length, 1);
        assert.equal(
            calls[0].options.resource_type,
            "image"
        );
        assert.equal(
            calls[0].options.folder,
            "studysphere_uploads"
        );
        assert.equal(
            calls[0].options.overwrite,
            false
        );
        assert.deepEqual(calls[0].buffer, jpeg);
    });

    it("uploads PDFs as raw files with a PDF extension", async () => {
        const uploadBufferToCloudinary = loadUploader();

        const { client, calls } = createFakeClient({
            result: {
                secure_url:
                    "https://res.cloudinary.com/test/raw/upload/document.pdf",
            },
        });

        const url = await uploadBufferToCloudinary(
            {
                buffer: pdf,
                mimetype: "application/pdf",
            },
            { client }
        );

        assert.equal(calls.length, 1);
        assert.equal(
            calls[0].options.resource_type,
            "raw"
        );
        assert.match(
            calls[0].options.public_id,
            /^[a-f0-9-]+\.pdf$/
        );
        assert.ok(url.startsWith("https://"));
    });

    it("rejects unsupported file types before uploading", async () => {
        const uploadBufferToCloudinary = loadUploader();
        const { client, calls } = createFakeClient();

        await assert.rejects(
            uploadBufferToCloudinary(
                {
                    buffer: Buffer.from("file"),
                    mimetype: "application/octet-stream",
                },
                { client }
            ),
            /Unsupported file type/
        );

        assert.equal(calls.length, 0);
    });

    it("rejects missing file buffers", async () => {
        const uploadBufferToCloudinary = loadUploader();
        const { client, calls } = createFakeClient();

        await assert.rejects(
            uploadBufferToCloudinary(
                {
                    mimetype: "image/jpeg",
                },
                { client }
            ),
            /Invalid upload buffer/
        );

        assert.equal(calls.length, 0);
    });

    it("does not expose Cloudinary error details", async () => {
        const uploadBufferToCloudinary = loadUploader();

        const { client } = createFakeClient({
            error: new Error(
                "PRIVATE_CLOUDINARY_ERROR"
            ),
        });

        await assert.rejects(
            uploadBufferToCloudinary(
                {
                    buffer: jpeg,
                    mimetype: "image/jpeg",
                },
                { client }
            ),
            (error) => {
                assert.equal(
                    error.message,
                    "Cloud upload failed"
                );
                assert.doesNotMatch(
                    error.message,
                    /PRIVATE_CLOUDINARY_ERROR/
                );
                return true;
            }
        );
    });

    it("rejects insecure upload result URLs", async () => {
        const uploadBufferToCloudinary = loadUploader();

        const { client } = createFakeClient({
            result: {
                secure_url:
                    "http://example.com/insecure.jpg",
            },
        });

        await assert.rejects(
            uploadBufferToCloudinary(
                {
                    buffer: jpeg,
                    mimetype: "image/jpeg",
                },
                { client }
            ),
            /Cloud upload failed/
        );
    });

});
