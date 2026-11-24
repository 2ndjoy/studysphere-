const request = require("supertest");

const assert = require("node:assert/strict");

const {
    randomUUID,
} = require("node:crypto");

function createUserData(overrides = {}) {
    return {
        name: "StudySphere Test User",

        email:
            `test-${randomUUID()}@example.com`,

        password: "TestPassword@123",

        ...overrides,
    };
}

async function registerUser(app, overrides = {}) {
    const credentials = createUserData(overrides);

    const response = await request(app)
        .post("/api/auth/register")
        .send(credentials);

    assert.equal(response.status, 201);

    assert.ok(response.body.user?._id);

    return {
        credentials,
        user: response.body.user,
        id: response.body.user._id,
    };
}

async function loginUser(app, credentials) {
    const response = await request(app)
        .post("/api/auth/login")
        .send({
            email: credentials.email,
            password: credentials.password,
        });

    assert.equal(response.status, 200);

    assert.equal(
        typeof response.body.token,
        "string"
    );

    assert.ok(response.body.token);

    return response.body.token;
}

async function createAuthenticatedUser(
    app,
    overrides = {}
) {
    const registeredUser = await registerUser(
        app,
        overrides
    );

    const token = await loginUser(
        app,
        registeredUser.credentials
    );

    return {
        ...registeredUser,
        token,
    };
}

function bearerToken(token) {
    return `Bearer ${token}`;
}

module.exports = {
    createUserData,
    registerUser,
    loginUser,
    createAuthenticatedUser,
    bearerToken,
};