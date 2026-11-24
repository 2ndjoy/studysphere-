
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
let Note;
let Resource;

let owner;
let otherUser;
let ownerNote;
let ownerResource;

async function createNote(user, title) {
    const response = await request(app)
        .post("/api/notes")
        .set(
            "Authorization",
            bearerToken(user.token)
        )
        .send({
            title,
            content: "Private study notes",
        });

    assert.equal(response.status, 201);
    assert.ok(response.body._id);

    return response.body;
}

describe("Notes and Resources Ownership Security", () => {

    before(async () => {
        await startTestDatabase();

        app = require("../app");

        Note = require("../models/Note");
        Resource = require("../models/Resource");

        const User = require("../models/User");
        await User.init();
    });

    beforeEach(async () => {
        owner = await createAuthenticatedUser(app, {
            name: "Resource Owner",
        });

        otherUser = await createAuthenticatedUser(app, {
            name: "Different User",
        });

        ownerNote = await createNote(
            owner,
            "Private Research Notes"
        );

        // Synthetic database record only.
        // No Cloudinary upload or network request occurs.
        ownerResource = await Resource.create({
            title: "Private Research PDF",
            fileUrl:
                "https://example.invalid/test/research.pdf",
            fileType: "application/pdf",
            user: owner.id,
        });
    });

    afterEach(async () => {
        await clearTestDatabase();
    });

    after(async () => {
        await stopTestDatabase();
    });

    // NOTES

    it("allows the owner to retrieve their notes", async () => {
        const response = await request(app)
            .get("/api/notes")
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        assert.equal(response.status, 200);
        assert.equal(response.body.length, 1);

        assert.equal(
            response.body[0]._id,
            ownerNote._id
        );
    });

    it("prevents users from retrieving another user's notes", async () => {
        const otherNote = await createNote(
            otherUser,
            "Other User Notes"
        );

        const response = await request(app)
            .get("/api/notes")
            .set(
                "Authorization",
                bearerToken(otherUser.token)
            );

        assert.equal(response.status, 200);
        assert.equal(response.body.length, 1);

        assert.equal(
            response.body[0]._id,
            otherNote._id
        );

        assert.notEqual(
            response.body[0]._id,
            ownerNote._id
        );
    });

    it("prevents non-owners from deleting notes", async () => {
        const response = await request(app)
            .delete(`/api/notes/${ownerNote._id}`)
            .set(
                "Authorization",
                bearerToken(otherUser.token)
            );

        assert.equal(response.status, 401);

        const stored = await Note.findById(
            ownerNote._id
        );

        assert.ok(stored);
        assert.equal(
            stored.user.toString(),
            owner.id
        );
    });

    it("allows the owner to delete their note", async () => {
        const response = await request(app)
            .delete(`/api/notes/${ownerNote._id}`)
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        assert.equal(response.status, 200);

        const stored = await Note.findById(
            ownerNote._id
        );

        assert.equal(stored, null);
    });

    it("ignores attempts to assign a new note to another user", async () => {
        const response = await request(app)
            .post("/api/notes")
            .set(
                "Authorization",
                bearerToken(owner.token)
            )
            .send({
                title: "Ownership Test",
                content: "Private content",
                user: otherUser.id,
            });

        assert.equal(response.status, 201);

        assert.equal(
            response.body.user,
            owner.id
        );

        const stored = await Note.findById(
            response.body._id
        );

        assert.equal(
            stored.user.toString(),
            owner.id
        );
    });

    // RESOURCES

    it("returns only resources belonging to the authenticated user", async () => {
        const otherResource = await Resource.create({
            title: "Other User Resource",
            fileUrl:
                "https://example.invalid/test/other.pdf",
            fileType: "application/pdf",
            user: otherUser.id,
        });

        const response = await request(app)
            .get("/api/resources")
            .set(
                "Authorization",
                bearerToken(otherUser.token)
            );

        assert.equal(response.status, 200);
        assert.equal(response.body.length, 1);

        assert.equal(
            response.body[0]._id,
            otherResource._id.toString()
        );
    });

    it("prevents non-owners from deleting resources", async () => {
        const response = await request(app)
            .delete(
                `/api/resources/${ownerResource._id}`
            )
            .set(
                "Authorization",
                bearerToken(otherUser.token)
            );

        assert.equal(response.status, 401);

        const stored = await Resource.findById(
            ownerResource._id
        );

        assert.ok(stored);

        assert.equal(
            stored.user.toString(),
            owner.id
        );
    });

    it("allows the owner to delete their resource record", async () => {
        const response = await request(app)
            .delete(
                `/api/resources/${ownerResource._id}`
            )
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        assert.equal(response.status, 200);

        const stored = await Resource.findById(
            ownerResource._id
        );

        assert.equal(stored, null);
    });

});
