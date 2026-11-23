const express = require("express");

const app = express();
// const cors = require("cors");
const assignmentRoutes = require(
    "./routes/assignmentRoutes"
);
const resourceRoutes = require(
    "./routes/resourceRoutes"
);
const noteRoutes = require(
    "./routes/noteRoutes"
);
const userRoutes = require("./routes/userRoutes");

const notificationRoutes = require(
    "./routes/notificationRoutes"
);

app.use(express.json());
const cors = require("cors");

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "https://dashing-bublanina-164786.netlify.app",
            "https://studysphere-mocha.vercel.app"
        ],
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
        ],
        credentials: true,
    })
);

const authRoutes = require("./routes/authRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.get("/", (req, res) => {
    res.send("Server is running");
});
app.use(
    "/api/assignments",
    assignmentRoutes
);
app.use(
    "/api/resources",
    resourceRoutes
);
app.use(
    "/api/notes",
    noteRoutes
);
app.use("/api/users", userRoutes);

app.use(
    "/api/notifications",
    notificationRoutes
);

module.exports = app;