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
let Subject;

let owner;
let otherUser;
let subject;

async function createSubject(user, data = {}) {
    const response = await request(app)
        .post("/api/subjects")
        .set(
            "Authorization",
            bearerToken(user.token)
        )
        .send({
            title: "Cloud Application Development",
            ...data,
        });

    assert.equal(response.status, 201);
    assert.ok(response.body._id);

    return response.body;
}

describe("Subject API Integration Tests", () => {

    before(async () => {
        await startTestDatabase();

        app = require("../app");

        Subject = require("../models/Subject");

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

        assert.notEqual(owner.id, otherUser.id);

        subject = await createSubject(owner);
    });

    afterEach(async () => {
        await clearTestDatabase();
    });

    after(async () => {
        await stopTestDatabase();
    });


    // CREATE SUBJECT

    it("creates a subject with correct ownership and default color", async () => {

        assert.equal(
            subject.title,
            "Cloud Application Development"
        );

        assert.equal(
            subject.color,
            "#3B82F6"
        );

        assert.equal(
            subject.user,
            owner.id
        );

        const stored = await Subject.findById(
            subject._id
        );

        assert.ok(stored);

        assert.equal(
            stored.user.toString(),
            owner.id
        );
    });


    // GET SUBJECTS

    it("returns only subjects belonging to the authenticated user", async () => {

        const otherSubject = await createSubject(
            otherUser,
            {
                title: "Research Methods",
                color: "#FF5733",
            }
        );

        const ownerResponse = await request(app)
            .get("/api/subjects")
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        assert.equal(ownerResponse.status, 200);

        assert.equal(ownerResponse.body.length, 1);

        assert.equal(
            ownerResponse.body[0]._id,
            subject._id
        );

        const otherResponse = await request(app)
            .get("/api/subjects")
            .set(
                "Authorization",
                bearerToken(otherUser.token)
            );

        assert.equal(otherResponse.status, 200);

        assert.equal(otherResponse.body.length, 1);

        assert.equal(
            otherResponse.body[0]._id,
            otherSubject._id
        );

        assert.equal(
            otherResponse.body[0].color,
            "#FF5733"
        );
    });


    // SUBJECT AUTHORIZATION

    it("prevents non-owners from deleting subjects", async () => {

        const response = await request(app)
            .delete(`/api/subjects/${subject._id}`)
            .set(
                "Authorization",
                bearerToken(otherUser.token)
            );

        assert.equal(response.status, 401);

        assert.equal(
            response.body.message,
            "Not authorized"
        );

        const stored = await Subject.findById(
            subject._id
        );

        assert.ok(stored);

        assert.equal(
            stored.user.toString(),
            owner.id
        );
    });


    // DELETE SUBJECT

    it("allows the owner to delete a subject", async () => {

        const response = await request(app)
            .delete(`/api/subjects/${subject._id}`)
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        assert.equal(response.status, 200);

        assert.equal(
            response.body.message,
            "Subject deleted"
        );

        const stored = await Subject.findById(
            subject._id
        );

        assert.equal(stored, null);
    });

    it("rejects deletion of a nonexistent subject", async () => {

        const nonexistentId =
            new mongoose.Types.ObjectId().toString();

        const response = await request(app)
            .delete(`/api/subjects/${nonexistentId}`)
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        assert.equal(response.status, 404);

        assert.equal(
            response.body.message,
            "Subject not found"
        );
    });


    // AUTHENTICATION

    it("rejects subject operations without authentication", async () => {

        const createResponse = await request(app)
            .post("/api/subjects")
            .send({
                title: "Unauthorized Subject",
            });

        const getResponse = await request(app)
            .get("/api/subjects");

        const deleteResponse = await request(app)
            .delete(`/api/subjects/${subject._id}`);

        for (const response of [
            createResponse,
            getResponse,
            deleteResponse,
        ]) {
            assert.equal(response.status, 401);

            assert.equal(
                response.body.message,
                "Not authorized, no token"
            );
        }

        const stored = await Subject.findById(
            subject._id
        );

        assert.ok(stored);

        assert.equal(
            await Subject.countDocuments(),
            1
        );
    });

    it("rejects subject requests with an invalid JWT", async () => {

        const response = await request(app)
            .get("/api/subjects")
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

});