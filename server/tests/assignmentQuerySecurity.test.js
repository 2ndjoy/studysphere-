
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
let account;
let subjectId;
let researchAssignmentId;
let reportAssignmentId;

describe("Assignment Query Security", () => {

    before(async () => {
        await startTestDatabase();

        app = require("../app");

        const User = require("../models/User");
        await User.init();
    });

    beforeEach(async () => {
        account = await createAuthenticatedUser(app);

        const authorization = bearerToken(account.token);

        const subjectResponse = await request(app)
            .post("/api/subjects")
            .set("Authorization", authorization)
            .send({
                title: "Cloud Development",
            });

        assert.equal(subjectResponse.status, 201);
        subjectId = subjectResponse.body._id;

        const createAssignment = async (title) => {
            const response = await request(app)
                .post("/api/assignments")
                .set("Authorization", authorization)
                .send({
                    title,
                    dueDate: "2026-12-15",
                    subject: subjectId,
                    priority: "medium",
                });

            assert.equal(response.status, 201);
            return response.body._id;
        };

        researchAssignmentId = await createAssignment(
            "Cloud Research"
        );

        reportAssignmentId = await createAssignment(
            "Report.v1"
        );
    });

    afterEach(async () => {
        await clearTestDatabase();
    });

    after(async () => {
        await stopTestDatabase();
    });

    function getAssignments(query) {
        return request(app)
            .get("/api/assignments")
            .query(query)
            .set(
                "Authorization",
                bearerToken(account.token)
            );
    }

    it("preserves normal text search", async () => {
        const response = await getAssignments({
            search: "Research",
        });

        assert.equal(response.status, 200);
        assert.equal(response.body.length, 1);
        assert.equal(
            response.body[0]._id,
            researchAssignmentId
        );
    });

    it("treats a dot as literal search text, not a regex wildcard", async () => {
        const response = await getAssignments({
            search: ".",
        });

        assert.equal(response.status, 200);
        assert.equal(response.body.length, 1);
        assert.equal(
            response.body[0]._id,
            reportAssignmentId
        );
    });

    it("handles regex metacharacters as ordinary search text", async () => {
        const response = await getAssignments({
            search: "[",
        });

        assert.equal(response.status, 200);
        assert.deepEqual(response.body, []);
    });

    it("rejects a malformed subject filter", async () => {
        const response = await getAssignments({
            subject: "not-a-valid-id",
        });

        assert.equal(response.status, 400);
        assert.equal(
            response.body.message,
            "Invalid subject ID"
        );

        assert.doesNotMatch(
            JSON.stringify(response.body),
            /CastError|Cast to ObjectId failed|BSONError/i
        );
    });

    it("rejects unsupported assignment status filters", async () => {
        const response = await getAssignments({
            status: "unknown",
        });

        assert.equal(response.status, 400);
        assert.equal(
            response.body.message,
            "Invalid status filter"
        );
    });

});
