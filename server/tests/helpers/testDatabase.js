const mongoose = require("mongoose");

const {
    MongoMemoryServer,
} = require("mongodb-memory-server");

const {
    randomBytes,
} = require("node:crypto");

let mongoServer;

function configureTestEnvironment() {
    process.env.NODE_ENV = "test";

    // Generate a temporary JWT secret for testing.
    process.env.JWT_SECRET =
        randomBytes(32).toString("hex");

    // Never use existing cloud database credentials.
    delete process.env.MONGO_URI;

    // Prevent existing Cloudinary credentials from being used.
    delete process.env.CLOUDINARY_URL;

    process.env.CLOUDINARY_CLOUD_NAME =
        "studysphere-test";

    process.env.CLOUDINARY_API_KEY =
        "test-api-key";

    process.env.CLOUDINARY_API_SECRET =
        "test-api-secret";
}

async function startTestDatabase() {
    if (mongoose.connection.readyState !== 0) {
        throw new Error(
            "An existing MongoDB connection was detected."
        );
    }

    mongoServer = await MongoMemoryServer.create({
        binary: {
            version: "8.2.6",
        },

        instance: {
            ip: "127.0.0.1",
            dbName: "studysphere_test",
        },
    });

    const uri = mongoServer.getUri();

    // Safety check: only permit the temporary local database.
    const databaseUrl = new URL(uri);

    if (
        databaseUrl.protocol !== "mongodb:" ||
        databaseUrl.hostname !== "127.0.0.1"
    ) {
        await mongoServer.stop();

        throw new Error(
            "Unsafe test database connection."
        );
    }

    process.env.MONGO_URI = uri;

    await mongoose.connect(uri, {
        dbName: "studysphere_test",
    });
}

async function clearTestDatabase() {
    if (
        !mongoServer ||
        mongoose.connection.readyState !== 1 ||
        mongoose.connection.host !== "127.0.0.1" ||
        mongoose.connection.name !== "studysphere_test"
    ) {
        throw new Error(
            "Database cleanup blocked for safety."
        );
    }

    const collections =
        mongoose.connection.collections;

    for (const collection of Object.values(collections)) {
        await collection.deleteMany({});
    }
}

async function stopTestDatabase() {
    try {
        await mongoose.disconnect();
    } finally {
        if (mongoServer) {
            await mongoServer.stop();

            mongoServer = undefined;
        }
    }
}

module.exports = {
    configureTestEnvironment,
    startTestDatabase,
    clearTestDatabase,
    stopTestDatabase,
};