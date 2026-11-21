
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
let User;
let owner;
let otherUser;

describe("User Profile Security", () => {

    before(async () => {
        await startTestDatabase();

        app = require("../app");
        User = require("../models/User");

        await User.init();
    });

    beforeEach(async () => {
        owner = await createAuthenticatedUser(app, {
            name: "Profile Owner",
        });

        otherUser = await createAuthenticatedUser(app, {
            name: "Different User",
        });
    });

    afterEach(async () => {
        await clearTestDatabase();
    });

    after(async () => {
        await stopTestDatabase();
    });

    it("returns only the authenticated user's profile", async () => {
        const response = await request(app)
            .get("/api/users/profile")
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        assert.equal(response.status, 200);
        assert.equal(response.body._id, owner.id);
        assert.equal(response.body.email, owner.credentials.email);

        assert.notEqual(response.body._id, otherUser.id);
    });

    it("does not expose the password hash in profile responses", async () => {
        const response = await request(app)
            .get("/api/users/profile")
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        assert.equal(response.status, 200);

        assert.equal(
            Object.hasOwn(response.body, "password"),
            false
        );
    });

    it("ignores attempts to select another user's profile using query parameters", async () => {
        const response = await request(app)
            .get("/api/users/profile")
            .query({
                id: otherUser.id,
                userId: otherUser.id,
            })
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        assert.equal(response.status, 200);
        assert.equal(response.body._id, owner.id);

        assert.notEqual(response.body._id, otherUser.id);
    });

    it("allows updating permitted profile fields", async () => {
        const updatedFields = {
            name: "Updated Profile Name",
            bio: "Master of Information Technology student",
            university: "Auckland Institute of Studies",
            department: "Information Technology",
            semester: "2026 T3",
        };

        const response = await request(app)
            .put("/api/users/profile")
            .set(
                "Authorization",
                bearerToken(owner.token)
            )
            .send(updatedFields);

        assert.equal(response.status, 200);

        assert.equal(
            response.body.message,
            "Profile updated successfully"
        );

        assert.equal(response.body.user.name, updatedFields.name);
        assert.equal(response.body.user.bio, updatedFields.bio);
        assert.equal(
            response.body.user.university,
            updatedFields.university
        );

        assert.equal(
            Object.hasOwn(response.body.user, "password"),
            false
        );

        const stored = await User.findById(owner.id);

        assert.equal(stored.name, updatedFields.name);
        assert.equal(stored.bio, updatedFields.bio);
        assert.equal(stored.semester, updatedFields.semester);
    });

    it("rejects mass-assignment attempts on sensitive user fields", async () => {
        const originalUser = await User.findById(owner.id);

        const originalPasswordHash = originalUser.password;

        const response = await request(app)
            .put("/api/users/profile")
            .set(
                "Authorization",
                bearerToken(owner.token)
            )
            .send({
                name: "Allowed Name Update",

                email: "attacker-controlled@example.com",
                password: "InjectedPassword123!",
                _id: otherUser.id,
                user: otherUser.id,

                avatar: "https://example.invalid/fake-avatar.png",

                role: "admin",
                isAdmin: true,
            });

        assert.equal(response.status, 200);

        const stored = await User.findById(owner.id);

        assert.ok(stored);

        assert.equal(stored.name, "Allowed Name Update");

        assert.equal(
            stored.email,
            owner.credentials.email
        );

        assert.equal(
            stored.password,
            originalPasswordHash
        );

        assert.equal(
            stored._id.toString(),
            owner.id
        );

        assert.equal(stored.avatar, "");

        assert.equal(stored.role, undefined);
        assert.equal(stored.isAdmin, undefined);

        assert.equal(
            Object.hasOwn(response.body.user, "password"),
            false
        );

        const unaffectedUser = await User.findById(
            otherUser.id
        );

        assert.ok(unaffectedUser);

        assert.equal(
            unaffectedUser.name,
            "Different User"
        );
    });

    it("rejects profile retrieval without authentication", async () => {
        const response = await request(app)
            .get("/api/users/profile");

        assert.equal(response.status, 401);

        assert.equal(
            response.body.message,
            "Not authorized, no token"
        );
    });

    it("rejects profile updates without authentication", async () => {
        const response = await request(app)
            .put("/api/users/profile")
            .send({
                name: "Unauthorized Update",
            });

        assert.equal(response.status, 401);

        const stored = await User.findById(owner.id);

        assert.equal(stored.name, "Profile Owner");
    });

    it("rejects profile requests with an invalid JWT", async () => {
        const invalidAuthorization = bearerToken(
            "invalid-test-token"
        );

        const getResponse = await request(app)
            .get("/api/users/profile")
            .set("Authorization", invalidAuthorization);

        const updateResponse = await request(app)
            .put("/api/users/profile")
            .set("Authorization", invalidAuthorization)
            .send({
                name: "Unauthorized Update",
            });

        assert.equal(getResponse.status, 401);
        assert.equal(updateResponse.status, 401);

        const stored = await User.findById(owner.id);

        assert.equal(stored.name, "Profile Owner");
    });

    it("returns 404 when the authenticated account no longer exists", async () => {
        await User.findByIdAndDelete(owner.id);

        const getResponse = await request(app)
            .get("/api/users/profile")
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        const updateResponse = await request(app)
            .put("/api/users/profile")
            .set(
                "Authorization",
                bearerToken(owner.token)
            )
            .send({
                name: "Deleted User",
            });

        assert.equal(getResponse.status, 404);
        assert.equal(updateResponse.status, 404);
    });

    it("rejects avatar requests without an uploaded file", async () => {
        const response = await request(app)
            .post("/api/users/avatar")
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        assert.equal(response.status, 400);

        assert.equal(
            response.body.message,
            "No image uploaded"
        );

        const stored = await User.findById(owner.id);

        assert.equal(stored.avatar, "");
    });

});
