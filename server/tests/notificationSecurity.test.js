
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

// Use the isolated test environment.
configureTestEnvironment();

let app;
let Notification;
let owner;
let otherUser;
let ownerNotification;

async function createNotification(user, title) {
    const response = await request(app)
        .post("/api/notifications")
        .set(
            "Authorization",
            bearerToken(user.token)
        )
        .send({
            title,
            message: "Security regression test",
            type: "info",
        });

    assert.equal(response.status, 201);
    assert.ok(response.body._id);

    return response.body;
}

describe("Notification Ownership Security", () => {

    before(async () => {
        await startTestDatabase();

        app = require("../app");
        Notification = require("../models/Notification");

        const User = require("../models/User");
        await User.init();
    });

    beforeEach(async () => {
        owner = await createAuthenticatedUser(app, {
            name: "Notification Owner",
        });

        otherUser = await createAuthenticatedUser(app, {
            name: "Different User",
        });

        ownerNotification = await createNotification(
            owner,
            "Private Notification"
        );

        assert.equal(ownerNotification.isRead, false);
    });

    afterEach(async () => {
        await clearTestDatabase();
    });

    after(async () => {
        await stopTestDatabase();
    });

    it("allows the owner to mark their notification as read", async () => {
        const response = await request(app)
            .patch(
                `/api/notifications/${ownerNotification._id}/read`
            )
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        assert.equal(response.status, 200);
        assert.equal(response.body.isRead, true);

        const stored = await Notification.findById(
            ownerNotification._id
        );

        assert.equal(stored.isRead, true);
    });

    it("rejects another user marking the notification as read", async () => {
        const response = await request(app)
            .patch(
                `/api/notifications/${ownerNotification._id}/read`
            )
            .set(
                "Authorization",
                bearerToken(otherUser.token)
            );

        assert.equal(
            response.status,
            404,
            "Cross-user notification update was accepted"
        );

        assert.equal(
            response.body.message,
            "Notification not found"
        );

        // Unauthorized requests must not change stored data.
        const stored = await Notification.findById(
            ownerNotification._id
        );

        assert.ok(stored);
        assert.equal(stored.isRead, false);
        assert.equal(
            stored.user.toString(),
            owner.id
        );
    });

    it("marks only the authenticated user's notifications as read", async () => {
        const otherNotification = await createNotification(
            otherUser,
            "Other User Notification"
        );

        const response = await request(app)
            .patch("/api/notifications/read-all")
            .set(
                "Authorization",
                bearerToken(owner.token)
            );

        assert.equal(response.status, 200);

        const storedOwnerNotification =
            await Notification.findById(ownerNotification._id);

        const storedOtherNotification =
            await Notification.findById(otherNotification._id);

        assert.equal(
            storedOwnerNotification.isRead,
            true
        );

        assert.equal(
            storedOtherNotification.isRead,
            false
        );
    });

    it("prevents another user from deleting the notification", async () => {
        const response = await request(app)
            .delete(
                `/api/notifications/${ownerNotification._id}`
            )
            .set(
                "Authorization",
                bearerToken(otherUser.token)
            );

        // Current delete implementation returns 401.
        assert.equal(response.status, 401);

        assert.equal(
            response.body.message,
            "Not authorized"
        );

        const stored = await Notification.findById(
            ownerNotification._id
        );

        assert.ok(stored);
        assert.equal(
            stored.user.toString(),
            owner.id
        );
    });

});
