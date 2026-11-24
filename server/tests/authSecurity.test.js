
const {
    describe,
    it,
    before,
    after,
    afterEach,
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
    createUserData,
    registerUser,
} = require("./helpers/testFixtures");

// Configure isolated test credentials.
configureTestEnvironment();

let app;

describe("Authentication Security Regression Tests", () => {

    before(async () => {
        await startTestDatabase();

        app = require("../app");

        const User = require("../models/User");
        await User.init();
    });

    afterEach(async () => {
        await clearTestDatabase();
    });

    after(async () => {
        await stopTestDatabase();
    });

    it("does not expose password hashes during registration", async () => {
        const credentials = createUserData();

        const response = await request(app)
            .post("/api/auth/register")
            .send(credentials);

        assert.equal(response.status, 201);
        assert.ok(response.body.user);

        assert.equal(
            response.body.user.email,
            credentials.email
        );

        assert.equal(
            Object.hasOwn(response.body.user, "password"),
            false,
            "Registration response exposes a password field"
        );
    });

    it("does not expose password hashes during login", async () => {
        const registered = await registerUser(app);

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: registered.credentials.email,
                password: registered.credentials.password,
            });

        assert.equal(response.status, 200);
        assert.ok(response.body.token);
        assert.ok(response.body.user);

        assert.equal(
            Object.hasOwn(response.body.user, "password"),
            false,
            "Login response exposes a password field"
        );
    });

});
