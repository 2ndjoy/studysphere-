
const { randomUUID } = require("node:crypto");

const cloudinary = require("../config/cloudinary");

const UPLOAD_FOLDER = "studysphere_uploads";

const ALLOWED_TYPES = {
    "image/jpeg": "image",
    "image/png": "image",
    "application/pdf": "raw",
};

// Only accept asset identifiers generated
// by StudySphere using UUID v4.
const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidAsset(asset) {
    if (
        !asset ||
        typeof asset.publicId !== "string"
    ) {
        return false;
    }

    if (
        asset.resourceType !== "image" &&
        asset.resourceType !== "raw"
    ) {
        return false;
    }

    const prefix = `${UPLOAD_FOLDER}/`;

    if (!asset.publicId.startsWith(prefix)) {
        return false;
    }

    const name = asset.publicId.slice(
        prefix.length
    );

    if (asset.resourceType === "raw") {
        if (!name.endsWith(".pdf")) {
            return false;
        }

        return UUID_PATTERN.test(
            name.slice(0, -4)
        );
    }

    return UUID_PATTERN.test(name);
}

async function uploadBufferToCloudinary(
    file,
    {
        client = cloudinary,
        includeMetadata = false,
    } = {}
) {
    if (
        !Buffer.isBuffer(file?.buffer) ||
        file.buffer.length === 0
    ) {
        throw new Error("Invalid upload buffer");
    }

    const resourceType =
        ALLOWED_TYPES[file.mimetype];

    if (!resourceType) {
        throw new Error("Unsupported file type");
    }

    const publicId =
        randomUUID() +
        (resourceType === "raw" ? ".pdf" : "");

    const expectedPublicId =
        `${UPLOAD_FOLDER}/${publicId}`;

    const options = {
        folder: UPLOAD_FOLDER,
        resource_type: resourceType,
        public_id: publicId,
        overwrite: false,
    };

    try {
        return await new Promise(
            (resolve, reject) => {
                const stream =
                    client.uploader.upload_stream(
                        options,
                        (error, result) => {
                            if (error) {
                                return reject(
                                    new Error(
                                        "Cloud upload failed"
                                    )
                                );
                            }

                            try {
                                const secureUrl =
                                    result?.secure_url;

                                const parsed =
                                    new URL(secureUrl);

                                if (
                                    parsed.protocol !== "https:" ||
                                    parsed.hostname !==
                                        "res.cloudinary.com" ||
                                    parsed.username ||
                                    parsed.password
                                ) {
                                    throw new Error(
                                        "Invalid cloud URL"
                                    );
                                }

                                // Preserve existing callers:
                                // return URL-only by default.
                                if (!includeMetadata) {
                                    return resolve(secureUrl);
                                }

                                const asset = {
                                    url: secureUrl,
                                    publicId:
                                        result.public_id,
                                    resourceType:
                                        result.resource_type,
                                };

                                // The uploaded asset must
                                // match our generated identity.
                                if (
                                    asset.publicId !==
                                        expectedPublicId ||
                                    asset.resourceType !==
                                        resourceType ||
                                    !isValidAsset(asset)
                                ) {
                                    throw new Error(
                                        "Invalid cloud asset"
                                    );
                                }

                                return resolve(asset);
                            } catch {
                                return reject(
                                    new Error(
                                        "Cloud upload failed"
                                    )
                                );
                            }
                        }
                    );

                if (typeof stream?.on === "function") {
                    stream.on("error", () => {
                        reject(
                            new Error(
                                "Cloud upload failed"
                            )
                        );
                    });
                }

                if (
                    !stream ||
                    typeof stream.end !== "function"
                ) {
                    throw new Error(
                        "Invalid upload stream"
                    );
                }

                stream.end(file.buffer);
            }
        );
    } catch {
        throw new Error("Cloud upload failed");
    }
}

// Delete only valid StudySphere assets.
// Never accept arbitrary Cloudinary public IDs.
async function deleteAssetFromCloudinary(
    asset,
    { client = cloudinary } = {}
) {
    if (!isValidAsset(asset)) {
        throw new Error("Invalid cloud asset");
    }

    try {
        const result =
            await client.uploader.destroy(
                asset.publicId,
                {
                    resource_type:
                        asset.resourceType,
                    type: "upload",
                    invalidate: true,
                }
            );

        // Cloudinary can report an asset as
        // already missing; cleanup is then
        // effectively complete.
        if (
            result?.result !== "ok" &&
            result?.result !== "not found"
        ) {
            throw new Error(
                "Unexpected deletion result"
            );
        }

        return result;
    } catch {
        // Never expose provider error details.
        throw new Error("Cloud cleanup failed");
    }
}

module.exports = {
    uploadBufferToCloudinary,
    deleteAssetFromCloudinary,
};
