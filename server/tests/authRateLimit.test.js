
const {
    describe,
    it,
    before,
    after,
} = require("node:test");

const assert = require("node:assert/strict");
const request = require("supertest");

const {
    configureTestEnvironment,
    startTestDatabase,
    stopTestDatabase,
} = require("./helpers/testDatabase");

// Always use isolated test credentials and MongoDB.
configureTestEnvironment();

// Small limits for this test process only.
// These values will be read by our rate limiter
// when the application is loaded.
process.env.AUTH_LOGIN_RATE_LIMIT_MAX = "3";
process.env.AUTH_REGISTER_RATE_LIMIT_MAX = "3";

process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_MS = "60000";
process.env.AUTH_REGISTER_RATE_LIMIT_WINDOW_MS = "60000";

let app;

describe("Authentication Rate Limiting Security", () => {

    before(async () => {
        await startTestDatabase();

        // Load the application after setting test limits.
        app = require("../app");
    });

    after(async () => {
        await stopTestDatabase();
    });

    it("blocks excessive failed login attempts", async () => {
        const credentials = {
            email: "unknown-user@example.com",
            password: "IncorrectTestPassword123!",
        };

        // The first three attempts are allowed through
        // to the authentication controller.
        for (let attempt = 1; attempt <= 3; attempt++) {
            const response = await request(app)
                .post("/api/auth/login")
                .send(credentials);

            assert.equal(
                response.status,
                400,
                `Login attempt ${attempt} should reach the controller`
            );

            assert.equal(
                response.body.message,
                "Invalid email or password"
            );
        }

        // The fourth attempt must be rate limited.
        const blockedResponse = await request(app)
            .post("/api/auth/login")
            .send(credentials);

        assert.equal(
            blockedResponse.status,
            429,
            "Excessive login attempts were not blocked"
        );

        assert.equal(
            blockedResponse.body.message,
            "Too many login attempts. Please try again later."
        );

        assert.equal(
            blockedResponse.body.token,
            undefined
        );
    });

    it("blocks excessive registration attempts", async () => {
        // Missing name ensures each request is invalid
        // and does not create a user.
        const invalidRegistration = {
            email: "rate-limit@example.com",
            password: "StrongTestPassword123!",
        };

        // First three attempts reach registration validation.
        for (let attempt = 1; attempt <= 3; attempt++) {
            const response = await request(app)
                .post("/api/auth/register")
                .send(invalidRegistration);

            assert.equal(
                response.status,
                400,
                `Registration attempt ${attempt} should reach the controller`
            );

            assert.equal(
                response.body.message,
                "Name is required"
            );
        }

        // The fourth attempt must be blocked.
        const blockedResponse = await request(app)
            .post("/api/auth/register")
            .send(invalidRegistration);

        assert.equal(
            blockedResponse.status,
            429,
            "Excessive registration attempts were not blocked"
        );

        assert.equal(
            blockedResponse.body.message,
            "Too many registration attempts. Please try again later."
        );
    });

});
