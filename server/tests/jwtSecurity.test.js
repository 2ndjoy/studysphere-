
const {
    describe,
    it,
    before,
    after,
    afterEach,
} = require("node:test");

const assert = require("node:assert/strict");
const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

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

// Use isolated test credentials and database.
configureTestEnvironment();

let app;
let User;

describe("JWT Account Validation Security", () => {

    before(async () => {
        await startTestDatabase();

        app = require("../app");
        User = require("../models/User");

        await User.init();
    });

    afterEach(async () => {
        await clearTestDatabase();
    });

    after(async () => {
        await stopTestDatabase();
    });

    it("allows a valid JWT belonging to an existing user", async () => {
        const account = await createAuthenticatedUser(app);

        const response = await request(app)
            .get("/api/auth/me")
            .set(
                "Authorization",
                bearerToken(account.token)
            );

        assert.equal(response.status, 200);
        assert.equal(response.body.user.id, account.id);
    });

    it("rejects a JWT after its user account is deleted", async () => {
        const account = await createAuthenticatedUser(app);

        // Remove the user only from the isolated test database.
        await User.findByIdAndDelete(account.id);

        const storedUser = await User.findById(account.id);
        assert.equal(storedUser, null);

        const response = await request(app)
            .get("/api/auth/me")
            .set(
                "Authorization",
                bearerToken(account.token)
            );

        assert.equal(
            response.status,
            401,
            "JWT for a deleted account was accepted"
        );

        assert.equal(response.body.user, undefined);
    });

    it("rejects a validly signed JWT for a nonexistent account", async () => {
        const nonexistentId =
            new mongoose.Types.ObjectId().toString();

        const token = jwt.sign(
            { id: nonexistentId },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const response = await request(app)
            .get("/api/auth/me")
            .set(
                "Authorization",
                bearerToken(token)
            );

        assert.equal(
            response.status,
            401,
            "JWT for a nonexistent account was accepted"
        );

        assert.equal(response.body.user, undefined);
    });

});
