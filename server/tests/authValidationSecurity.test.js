
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
    createAuthenticatedUser,
} = require("./helpers/testFixtures");

configureTestEnvironment();

let app;
let User;

describe("Authentication Input Validation Security", () => {

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

    function validRegistration(overrides = {}) {
        return {
            name: "StudySphere Test User",
            email: "auth-validation@example.com",
            password: "StrongTestPassword123!",
            ...overrides,
        };
    }

    async function register(body) {
        return request(app)
            .post("/api/auth/register")
            .send(body);
    }

    async function login(body) {
        return request(app)
            .post("/api/auth/login")
            .send(body);
    }

    async function expectRejectedRegistration(
        body,
        expectedMessage
    ) {
        const response = await register(body);

        assert.equal(
            response.status,
            400,
            `Expected HTTP 400, received ${response.status}`
        );

        assert.equal(
            response.body.message,
            expectedMessage
        );

        assert.doesNotMatch(
            JSON.stringify(response.body),
            /ValidationError|CastError|BSONError|Illegal arguments/i
        );

        const count = await User.countDocuments();

        assert.equal(
            count,
            0,
            "Invalid registration must not create a user"
        );
    }

    // TEST 1: VALID AUTHENTICATION

    it("preserves valid registration and login", async () => {
        const credentials = validRegistration();

        const registration = await register(credentials);

        assert.equal(registration.status, 201);
        assert.equal(
            registration.body.user.email,
            credentials.email
        );

        assert.equal(
            Object.hasOwn(
                registration.body.user,
                "password"
            ),
            false
        );

        const loginResponse = await login({
            email: credentials.email,
            password: credentials.password,
        });

        assert.equal(loginResponse.status, 200);
        assert.equal(
            typeof loginResponse.body.token,
            "string"
        );

        assert.equal(
            Object.hasOwn(
                loginResponse.body.user,
                "password"
            ),
            false
        );
    });

    // TESTS 2–9: INVALID REGISTRATION INPUT

    const invalidRegistrations = [
        {
            name: "missing registration name",
            body: {
                email: "auth-validation@example.com",
                password: "StrongTestPassword123!",
            },
            message: "Name is required",
        },
        {
            name: "missing registration email",
            body: {
                name: "Test User",
                password: "StrongTestPassword123!",
            },
            message: "Email is required",
        },
        {
            name: "missing registration password",
            body: {
                name: "Test User",
                email: "auth-validation@example.com",
            },
            message: "Password is required",
        },
        {
            name: "empty registration password",
            body: validRegistration({
                password: "",
            }),
            message: "Password is required",
        },
        {
            name: "malformed email address",
            body: validRegistration({
                email: "not-an-email-address",
            }),
            message: "Invalid email address",
        },
        {
            name: "non-string name",
            body: validRegistration({
                name: 12345,
            }),
            message: "Name is required",
        },
        {
            name: "non-string email",
            body: validRegistration({
                email: {
                    $ne: null,
                },
            }),
            message: "Invalid email address",
        },
        {
            name: "non-string password",
            body: validRegistration({
                password: {
                    value: "InjectedPassword",
                },
            }),
            message: "Password must be a string",
        },
    ];

    for (const scenario of invalidRegistrations) {
        it(
            `rejects ${scenario.name}`,
            async () => {
                await expectRejectedRegistration(
                    scenario.body,
                    scenario.message
                );
            }
        );
    }

    // TEST 10: MISSING LOGIN PASSWORD

    it("rejects login without a password", async () => {
        const account =
            await createAuthenticatedUser(app);

        const response = await login({
            email: account.credentials.email,
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

    // TEST 11: QUERY-OPERATOR INPUT IN LOGIN EMAIL

    it("rejects MongoDB query operators in login email", async () => {
        const account =
            await createAuthenticatedUser(app);

        // Synthetic test data in an isolated MongoDB database.
        const response = await login({
            email: {
                $ne: null,
            },
            password: account.credentials.password,
        });

        assert.equal(
            response.status,
            400,
            "Object-based login email was accepted"
        );

        assert.equal(
            response.body.message,
            "Invalid email or password"
        );

        assert.equal(
            response.body.token,
            undefined,
            "Rejected login must not issue a JWT"
        );
    });

});
