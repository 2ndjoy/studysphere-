
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
let owner;
let otherUser;
let ownerSubject;

function assignmentData(subjectId) {
    return {
        title: "Cloud Security Research",
        dueDate: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        subject: subjectId,
        priority: "high",
    };
}

describe("Assignment Subject Ownership Security", () => {

    before(async () => {
        await startTestDatabase();

        app = require("../app");

        Assignment = require("../models/Assignment");

        const User = require("../models/User");
        await User.init();
    });

    beforeEach(async () => {
        owner = await createAuthenticatedUser(app, {
            name: "Subject Owner",
        });

        otherUser = await createAuthenticatedUser(app, {
            name: "Different User",
        });

        const response = await request(app)
            .post("/api/subjects")
            .set(
                "Authorization",
                bearerToken(owner.token)
            )
            .send({
                title: "Cloud Security",
                color: "#3B82F6",
            });

        assert.equal(response.status, 201);
        ownerSubject = response.body;
    });

    afterEach(async () => {
        await clearTestDatabase();
    });

    after(async () => {
        await stopTestDatabase();
    });

    it("allows creating assignments with the user's own subject", async () => {
        const response = await request(app)
            .post("/api/assignments")
            .set(
                "Authorization",
                bearerToken(owner.token)
            )
            .send(assignmentData(ownerSubject._id));

        assert.equal(response.status, 201);

        assert.equal(
            response.body.user,
            owner.id
        );

        assert.equal(
            response.body.subject._id,
            ownerSubject._id
        );

        assert.equal(
            await Assignment.countDocuments(),
            1
        );
    });

    it("rejects assignments referencing another user's subject", async () => {
        const response = await request(app)
            .post("/api/assignments")
            .set(
                "Authorization",
                bearerToken(otherUser.token)
            )
            .send(assignmentData(ownerSubject._id));

        // A foreign subject should appear unavailable to this user.
        assert.equal(
            response.status,
            404,
            "Cross-user subject reference was accepted"
        );

        assert.equal(
            response.body.message,
            "Subject not found"
        );

        // Unauthorized creation must not write any assignment.
        assert.equal(
            await Assignment.countDocuments(),
            0
        );
    });

});
