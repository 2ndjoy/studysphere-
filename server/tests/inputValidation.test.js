
const {
    describe,
    it,
    before,
    after,
    beforeEach,
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
    bearerToken,
} = require("./helpers/testFixtures");

// Configure an isolated test environment.
configureTestEnvironment();

let app;
let account;

describe("API Input Validation Security", () => {

    before(async () => {
        await startTestDatabase();

        app = require("../app");

        const User = require("../models/User");
        await User.init();
    });

    beforeEach(async () => {
        account = await createAuthenticatedUser(app);
    });

    afterEach(async () => {
        await clearTestDatabase();
    });

    after(async () => {
        await stopTestDatabase();
    });

    // Shared helper for malformed resource ID tests.
    async function expectInvalidIdResponse(method, url) {
        const response = await request(app)
            [method](url)
            .set(
                "Authorization",
                bearerToken(account.token)
            );

        // Malformed IDs should return 400 Bad Request.
        assert.equal(
            response.status,
            400,
            `${method.toUpperCase()} ${url} should reject malformed IDs`
        );

        assert.equal(
            response.body.message,
            "Invalid resource ID"
        );

        // Do not expose internal MongoDB error details.
        const responseText = JSON.stringify(response.body);

        assert.doesNotMatch(
            responseText,
            /Cast to ObjectId failed|CastError|BSONError/i
        );
    }

    // TEST 1: NOTE ID VALIDATION
    it("rejects a malformed note ID", async () => {
        await expectInvalidIdResponse(
            "delete",
            "/api/notes/not-a-valid-id"
        );
    });

    // TEST 2: RESOURCE ID VALIDATION
    it("rejects a malformed resource ID", async () => {
        await expectInvalidIdResponse(
            "delete",
            "/api/resources/not-a-valid-id"
        );
    });

    // TEST 3: NOTIFICATION READ ID VALIDATION
    it("rejects a malformed notification ID", async () => {
        await expectInvalidIdResponse(
            "patch",
            "/api/notifications/not-a-valid-id/read"
        );
    });

    // TEST 4: NOTIFICATION DELETE ID VALIDATION
    it("rejects a malformed notification deletion ID", async () => {
        await expectInvalidIdResponse(
            "delete",
            "/api/notifications/not-a-valid-id"
        );
    });

    // TEST 5: ASSIGNMENT DELETE ID VALIDATION
    it("rejects a malformed assignment deletion ID", async () => {
        await expectInvalidIdResponse(
            "delete",
            "/api/assignments/not-a-valid-id"
        );
    });

    // TEST 6: ASSIGNMENT STATUS ID VALIDATION
    it("rejects a malformed assignment status ID", async () => {
        await expectInvalidIdResponse(
            "patch",
            "/api/assignments/not-a-valid-id"
        );
    });

    // TEST 7: SUBJECT DELETE ID VALIDATION
    it("rejects a malformed subject deletion ID", async () => {
        await expectInvalidIdResponse(
            "delete",
            "/api/subjects/not-a-valid-id"
        );
    });

});
