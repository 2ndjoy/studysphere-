
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

    // TEST 1: Root endpoint
    it("responds successfully at the root endpoint", async () => {
        const response = await request(app)
            .get("/");

        assert.equal(response.status, 200);

        assert.equal(
            response.text,
            "Server is running"
        );
    });

    // TEST 2: CORS preflight for multiple frontend origins
    it("allows PATCH requests through CORS preflight", async () => {

        const allowedOrigins = [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
        ];

        for (const origin of allowedOrigins) {

            const response = await request(app)
                .options("/api/assignments/test-id")
                .set("Origin", origin)
                .set(
                    "Access-Control-Request-Method",
                    "PATCH"
                )
                .set(
                    "Access-Control-Request-Headers",
                    "authorization,content-type"
                );

            // Express should accept the preflight request.
            assert.equal(
                response.status,
                204,
                `CORS preflight failed for ${origin}`
            );

            // The server must return the exact requesting origin.
            assert.equal(
                response.headers["access-control-allow-origin"],
                origin,
                `Incorrect CORS origin for ${origin}`
            );

            // PATCH must be an allowed HTTP method.
            const allowedMethods = (
                response.headers["access-control-allow-methods"] || ""
            )
                .split(",")
                .map((method) => method.trim());

            assert.ok(
                allowedMethods.includes("PATCH"),
                `PATCH method not allowed for ${origin}`
            );

            // Authorization and Content-Type must be allowed.
            const allowedHeaders = (
                response.headers["access-control-allow-headers"] || ""
            )
                .split(",")
                .map((header) => header.trim().toLowerCase());

            assert.ok(
                allowedHeaders.includes("authorization"),
                `Authorization header not allowed for ${origin}`
            );

            assert.ok(
                allowedHeaders.includes("content-type"),
                `Content-Type header not allowed for ${origin}`
            );
        }
    });

    // TEST 3: JWT authentication
    it("rejects protected requests without a JWT", async () => {
        const response = await request(app)
            .get("/api/auth/me");

        assert.equal(response.status, 401);

        assert.equal(
            response.body.message,
            "Not authorized, no token"
        );
    });

    // TEST 4: Isolated test database connection
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

    // TEST 5: Database create/read operation
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
