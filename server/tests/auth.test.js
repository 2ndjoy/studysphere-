const {
    describe,
    it,
    before,
    after,
    afterEach,
} = require("node:test");

const assert = require("node:assert/strict");

const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
    configureTestEnvironment,
    startTestDatabase,
    clearTestDatabase,
    stopTestDatabase,
} = require("./helpers/testDatabase");

const {
    createUserData,
    registerUser,
    createAuthenticatedUser,
    bearerToken,
} = require("./helpers/testFixtures");

configureTestEnvironment();

let app;
let User;

describe("Authentication API Integration Tests", () => {

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

    it("registers a new user successfully", async () => {
        const credentials = createUserData();

        const response = await request(app)
            .post("/api/auth/register")
            .send(credentials);

        assert.equal(response.status, 201);

        assert.equal(
            response.body.message,
            "User registered successfully"
        );

        assert.equal(
            response.body.user.email,
            credentials.email
        );

        assert.ok(response.body.user._id);
    });

    it("stores passwords as bcrypt hashes", async () => {
        const registered = await registerUser(app);

        const storedUser = await User.findById(
            registered.id
        ).select("+password");

        assert.ok(storedUser);

        assert.notEqual(
            storedUser.password,
            registered.credentials.password
        );

        const passwordMatches = await bcrypt.compare(
            registered.credentials.password,
            storedUser.password
        );

        assert.equal(passwordMatches, true);
    });

    it("rejects registration with a duplicate email", async () => {
        const registered = await registerUser(app);

        const response = await request(app)
            .post("/api/auth/register")
            .send(registered.credentials);

        assert.equal(response.status, 400);

        assert.equal(
            response.body.message,
            "User already exists"
        );

        const count = await User.countDocuments({
            email: registered.credentials.email,
        });

        assert.equal(count, 1);
    });

    it("logs in successfully and returns a valid JWT", async () => {
        const registered = await registerUser(app);

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: registered.credentials.email,

                password:
                    registered.credentials.password,
            });

        assert.equal(response.status, 200);

        assert.equal(
            response.body.message,
            "Login successful"
        );

        assert.ok(response.body.token);

        const decoded = jwt.verify(
            response.body.token,
            process.env.JWT_SECRET
        );

        assert.equal(
            decoded.id,
            registered.id
        );
    });

    it("rejects login with an incorrect password", async () => {
        const registered = await registerUser(app);

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: registered.credentials.email,
                password: "IncorrectPassword",
            });

        assert.equal(response.status, 400);

        assert.equal(
            response.body.message,
            "Invalid email or password"
        );

        assert.equal(
            response.body.token,
            undefined
        );
    });

    it("rejects login for an unknown email", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "unknown@example.com",
                password: "TestPassword@123",
            });

        assert.equal(response.status, 400);

        assert.equal(
            response.body.message,
            "Invalid email or password"
        );

        assert.equal(
            response.body.token,
            undefined
        );
    });

    it("allows authenticated access to a protected route", async () => {
        const authenticated =
            await createAuthenticatedUser(app);

        const response = await request(app)
            .get("/api/auth/me")
            .set(
                "Authorization",
                bearerToken(authenticated.token)
            );

        assert.equal(response.status, 200);

        assert.equal(
            response.body.user.id,
            authenticated.id
        );
    });

    it("rejects protected requests without a token", async () => {
        const response = await request(app)
            .get("/api/auth/me");

        assert.equal(response.status, 401);

        assert.equal(
            response.body.message,
            "Not authorized, no token"
        );
    });

    it("rejects invalid JWT tokens", async () => {
        const response = await request(app)
            .get("/api/auth/me")
            .set(
                "Authorization",
                bearerToken("invalid-test-token")
            );

        assert.equal(response.status, 401);

        assert.equal(
            response.body.message,
            "Token failed"
        );
    });

    it("rejects expired JWT tokens", async () => {
        const registered = await registerUser(app);

        const expiredToken = jwt.sign(
            {
                id: registered.id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: -60,
            }
        );

        const response = await request(app)
            .get("/api/auth/me")
            .set(
                "Authorization",
                bearerToken(expiredToken)
            );

        assert.equal(response.status, 401);

        assert.equal(
            response.body.message,
            "Token failed"
        );
    });

    it("rejects JWT tokens signed with an incorrect secret", async () => {
        const registered = await registerUser(app);

        const invalidToken = jwt.sign(
            {
                id: registered.id,
            },
            "incorrect-test-signing-secret",
            {
                expiresIn: "1h",
            }
        );

        const response = await request(app)
            .get("/api/auth/me")
            .set(
                "Authorization",
                bearerToken(invalidToken)
            );

        assert.equal(response.status, 401);

        assert.equal(
            response.body.message,
            "Token failed"
        );
    });

});