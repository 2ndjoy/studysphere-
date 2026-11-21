
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

configureTestEnvironment();

let app;
let Assignment;
let Subject;

let account;
let subjectId;

describe("Request Body Validation Security", () => {

    before(async () => {
        await startTestDatabase();

        app = require("../app");

        Assignment = require("../models/Assignment");
        Subject = require("../models/Subject");

        const User = require("../models/User");
        await User.init();
    });

    beforeEach(async () => {
        account = await createAuthenticatedUser(app);

        const response = await request(app)
            .post("/api/subjects")
            .set(
                "Authorization",
                bearerToken(account.token)
            )
            .send({
                title: "Cloud Application Development",
                color: "#3B82F6",
            });

        assert.equal(response.status, 201);

        subjectId = response.body._id;
        assert.ok(subjectId);
    });

    afterEach(async () => {
        await clearTestDatabase();
    });

    after(async () => {
        await stopTestDatabase();
    });

    function validAssignment(overrides = {}) {
        return {
            title: "Cloud Research Assignment",
            dueDate: "2026-12-15",
            subject: subjectId,
            priority: "high",
            ...overrides,
        };
    }

    async function expectRejectedAssignment(
        body,
        expectedMessage
    ) {
        const response = await request(app)
            .post("/api/assignments")
            .set(
                "Authorization",
                bearerToken(account.token)
            )
            .send(body);

        assert.equal(
            response.status,
            400,
            `Expected 400, received ${response.status}`
        );

        assert.equal(
            response.body.message,
            expectedMessage
        );

        // Never expose Mongoose or BSON error details.
        assert.doesNotMatch(
            JSON.stringify(response.body),
            /CastError|ValidationError|BSONError|Cast to ObjectId failed/i
        );

        // Rejected requests must not create assignments.
        const count = await Assignment.countDocuments({
            user: account.id,
        });

        assert.equal(count, 0);
    }

    // TEST 1: VALID ASSIGNMENT
    it("accepts a correctly formed assignment", async () => {
        const response = await request(app)
            .post("/api/assignments")
            .set(
                "Authorization",
                bearerToken(account.token)
            )
            .send(validAssignment());

        assert.equal(response.status, 201);
        assert.equal(
            response.body.title,
            "Cloud Research Assignment"
        );
        assert.equal(
            response.body.priority,
            "high"
        );

        assert.equal(
            response.body.subject._id,
            subjectId
        );

        const count = await Assignment.countDocuments({
            user: account.id,
        });

        assert.equal(count, 1);
    });

    // TEST 2: INVALID SUBJECT ID
    it("rejects a malformed assignment subject ID", async () => {
        await expectRejectedAssignment(
            validAssignment({
                subject: "invalid-subject-id",
            }),
            "Invalid subject ID"
        );
    });

    // TEST 3: MISSING SUBJECT
    it("rejects an assignment without a subject", async () => {
        const body = validAssignment();

        delete body.subject;

        await expectRejectedAssignment(
            body,
            "Subject is required"
        );
    });

    // TEST 4: MISSING TITLE
    it("rejects an assignment without a title", async () => {
        const body = validAssignment();

        delete body.title;

        await expectRejectedAssignment(
            body,
            "Title is required"
        );
    });

    // TEST 5: INVALID DUE DATE
    it("rejects an invalid assignment due date", async () => {
        await expectRejectedAssignment(
            validAssignment({
                dueDate: "not-a-date",
            }),
            "Invalid due date"
        );
    });

    // TEST 6: INVALID PRIORITY
    it("rejects an unsupported assignment priority", async () => {
        await expectRejectedAssignment(
            validAssignment({
                priority: "urgent",
            }),
            "Invalid priority"
        );
    });

    // TEST 7: SUBJECT WITHOUT TITLE
    it("rejects creating a subject without a title", async () => {
        const response = await request(app)
            .post("/api/subjects")
            .set(
                "Authorization",
                bearerToken(account.token)
            )
            .send({
                color: "#3B82F6",
            });

        assert.equal(response.status, 400);

        assert.equal(
            response.body.message,
            "Title is required"
        );

        assert.doesNotMatch(
            JSON.stringify(response.body),
            /ValidationError|CastError|BSONError/i
        );

        // Only the subject created during setup exists.
        const count = await Subject.countDocuments({
            user: account.id,
        });

        assert.equal(count, 1);
    });

});
