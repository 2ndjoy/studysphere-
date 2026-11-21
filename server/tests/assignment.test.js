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
const mongoose = require("mongoose");

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
let subject;
let assignment;

async function createSubject(user, title) {
    const response = await request(app)
        .post("/api/subjects")
        .set(
            "Authorization",
            bearerToken(user.token)
        )
        .send({
            title,
            color: "#3B82F6",
        });

    assert.equal(response.status, 201);
    assert.ok(response.body._id);

    return response.body;
}

function createAssignmentData(overrides = {}) {
    return {
        title: "Authorization Test Assignment",

        dueDate: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),

        subject: subject._id,
        priority: "high",

        ...overrides,
    };
}

async function createAssignment(user, overrides = {}) {
    const response = await request(app)
        .post("/api/assignments")
        .set(
            "Authorization",
            bearerToken(user.token)
        )
        .send(createAssignmentData(overrides));

    assert.equal(response.status, 201);
    assert.ok(response.body._id);

    return response.body;
}

describe("Assignment API Integration Tests", () => {

    before(async () => {
        await startTestDatabase();

        app = require("../app");

        Assignment = require("../models/Assignment");

        const User = require("../models/User");

        await User.init();
    });

    beforeEach(async () => {
        owner = await createAuthenticatedUser(app, {
            name: "Assignment Owner",
        });

        otherUser = await createAuthenticatedUser(app, {
            name: "Different User",
        });

        assert.notEqual(owner.id, otherUser.id);

        subject = await createSubject(
            owner,
            "Security Testing"
        );

        assignment = await createAssignment(owner);
    });

    afterEach(async () => {
        await clearTestDatabase();
    });

    after(async () => {
        await stopTestDatabase();
    });


    // CREATE ASSIGNMENT

    it("creates an assignment with populated subject information", async () => {
        const created = await createAssignment(owner, {
            title: "New Research Assignment",
        });

        assert.equal(
            created.title,
            "New Research Assignment"
        );

        assert.equal(created.status, "pending");
        assert.equal(created.priority, "high");
        assert.equal(created.user, owner.id);

        assert.equal(
            created.subject._id,
            subject._id
        );

        assert.equal(
            created.subject.title,
            "Security Testing"
        );

        const stored = await Assignment.findById(
            created._id
        );

        assert.ok(stored);

        assert.equal(
            stored.status,
            "pending"
        );
    });


    // GET ASSIGNMENTS

    it("allows the owner to retrieve their assignments", async () => {
        const response = await request(app)
            .get("/api/assignments")
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        assert.equal(response.status, 200);
        assert.ok(Array.isArray(response.body));

        const retrieved = response.body.find(
            item => item._id === assignment._id
        );

        assert.ok(retrieved);

        assert.equal(
            retrieved.user,
            owner.id
        );

        assert.equal(
            retrieved.subject.title,
            "Security Testing"
        );
    });

    it("prevents users from retrieving another user's assignments", async () => {
        const response = await request(app)
            .get("/api/assignments")
            .set(
                "Authorization",
                bearerToken(otherUser.token)
            );

        assert.equal(response.status, 200);

        assert.deepEqual(
            response.body,
            []
        );
    });


    // TOGGLE ASSIGNMENT STATUS

    it("allows the owner to mark an assignment as completed", async () => {
        const response = await request(app)
            .patch(`/api/assignments/${assignment._id}`)
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        assert.equal(response.status, 200);

        assert.equal(
            response.body.status,
            "completed"
        );

        assert.equal(
            response.body.subject.title,
            "Security Testing"
        );

        const stored = await Assignment.findById(
            assignment._id
        );

        assert.equal(
            stored.status,
            "completed"
        );
    });

    it("allows the owner to undo assignment completion", async () => {
        const firstResponse = await request(app)
            .patch(`/api/assignments/${assignment._id}`)
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        assert.equal(firstResponse.status, 200);

        assert.equal(
            firstResponse.body.status,
            "completed"
        );

        const secondResponse = await request(app)
            .patch(`/api/assignments/${assignment._id}`)
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        assert.equal(secondResponse.status, 200);

        assert.equal(
            secondResponse.body.status,
            "pending"
        );

        const stored = await Assignment.findById(
            assignment._id
        );

        assert.equal(
            stored.status,
            "pending"
        );
    });


    // OWNERSHIP AND AUTHORIZATION

    it("prevents non-owners from updating assignment status", async () => {
        const response = await request(app)
            .patch(`/api/assignments/${assignment._id}`)
            .set(
                "Authorization",
                bearerToken(otherUser.token)
            );

        assert.equal(response.status, 404);

        assert.equal(
            response.body.message,
            "Assignment not found"
        );

        const stored = await Assignment.findById(
            assignment._id
        );

        assert.ok(stored);

        assert.equal(
            stored.status,
            "pending"
        );

        assert.equal(
            stored.user.toString(),
            owner.id
        );
    });

    it("rejects assignment updates without authentication", async () => {
        const response = await request(app)
            .patch(`/api/assignments/${assignment._id}`);

        assert.equal(response.status, 401);

        assert.equal(
            response.body.message,
            "Not authorized, no token"
        );

        const stored = await Assignment.findById(
            assignment._id
        );

        assert.equal(stored.status, "pending");
    });

    it("rejects assignment updates with an invalid JWT", async () => {
        const response = await request(app)
            .patch(`/api/assignments/${assignment._id}`)
            .set(
                "Authorization",
                bearerToken("invalid-test-token")
            );

        assert.equal(response.status, 401);

        assert.equal(
            response.body.message,
            "Token failed"
        );

        const stored = await Assignment.findById(
            assignment._id
        );

        assert.equal(stored.status, "pending");
    });

    it("rejects updates to a nonexistent assignment", async () => {
        const nonexistentId =
            new mongoose.Types.ObjectId().toString();

        const response = await request(app)
            .patch(`/api/assignments/${nonexistentId}`)
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        assert.equal(response.status, 404);

        assert.equal(
            response.body.message,
            "Assignment not found"
        );
    });


    // DELETE ASSIGNMENT

    it("prevents non-owners from deleting assignments", async () => {
        const response = await request(app)
            .delete(`/api/assignments/${assignment._id}`)
            .set(
                "Authorization",
                bearerToken(otherUser.token)
            );

        assert.equal(response.status, 401);

        assert.equal(
            response.body.message,
            "Not authorized"
        );

        const stored = await Assignment.findById(
            assignment._id
        );

        assert.ok(stored);

        assert.equal(
            stored.user.toString(),
            owner.id
        );
    });

    it("allows the owner to delete an assignment", async () => {
        const response = await request(app)
            .delete(`/api/assignments/${assignment._id}`)
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        assert.equal(response.status, 200);

        assert.equal(
            response.body.message,
            "Assignment deleted"
        );

        const stored = await Assignment.findById(
            assignment._id
        );

        assert.equal(stored, null);
    });


    // FILTERING

    it("filters assignments by completion status", async () => {
        const completedAssignment =
            await createAssignment(owner, {
                title: "Completed Research Task",
            });

        const updateResponse = await request(app)
            .patch(
                `/api/assignments/${completedAssignment._id}`
            )
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        assert.equal(updateResponse.status, 200);

        assert.equal(
            updateResponse.body.status,
            "completed"
        );

        const response = await request(app)
            .get("/api/assignments")
            .query({
                status: "completed",
            })
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        assert.equal(response.status, 200);

        assert.equal(response.body.length, 1);

        assert.equal(
            response.body[0]._id,
            completedAssignment._id
        );

        assert.equal(
            response.body[0].status,
            "completed"
        );
    });

});