const {
    describe,
    it,
    before,
    after,
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

// Configure the environment before importing the application.
configureTestEnvironment();

let app;
let Subject;

describe("StudySphere Backend Smoke Tests", () => {

    before(async () => {
        await startTestDatabase();

        app = require("../app");

        Subject = require("../models/Subject");
    });

    afterEach(async () => {
        await clearTestDatabase();
    });

    after(async () => {
        await stopTestDatabase();
    });

    it("responds successfully at the root endpoint", async () => {
        const response = await request(app)
            .get("/");

        assert.equal(response.status, 200);

        assert.equal(
            response.text,
            "Server is running"
        );
    });

    it("allows PATCH requests through CORS preflight", async () => {
        const response = await request(app)
            .options("/api/assignments/test-id")
            .set(
                "Origin",
                "http://localhost:5173"
            )
            .set(
                "Access-Control-Request-Method",
                "PATCH"
            )
            .set(
                "Access-Control-Request-Headers",
                "authorization,content-type"
            );

        assert.equal(response.status, 204);

        assert.equal(
            response.headers[
                "access-control-allow-origin"
            ],
            "http://localhost:5173"
        );

        const allowedMethods = (
            response.headers[
                "access-control-allow-methods"
            ] || ""
        ).split(",").map(
            method => method.trim()
        );

        assert.ok(
            allowedMethods.includes("PATCH")
        );
    });

    it("rejects protected requests without a JWT", async () => {
        const response = await request(app)
            .get("/api/auth/me");

        assert.equal(response.status, 401);

        assert.equal(
            response.body.message,
            "Not authorized, no token"
        );
    });

    it("connects to an isolated local test database", () => {
        assert.equal(
            mongoose.connection.readyState,
            1
        );

        assert.equal(
            mongoose.connection.host,
            "127.0.0.1"
        );

        assert.equal(
            mongoose.connection.name,
            "studysphere_test"
        );
    });

    it("creates and retrieves records from the test database", async () => {
        const subject = await Subject.create({
            title: "Automated Testing",
            color: "#3B82F6",
            user: new mongoose.Types.ObjectId(),
        });

        const retrievedSubject =
            await Subject.findById(subject._id);

        assert.ok(retrievedSubject);

        assert.equal(
            retrievedSubject.title,
            "Automated Testing"
        );

        assert.equal(
            retrievedSubject._id.toString(),
            subject._id.toString()
        );
    });

});