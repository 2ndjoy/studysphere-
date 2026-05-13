const express = require("express");

const app = express();
const cors = require("cors");
const assignmentRoutes = require(
    "./routes/assignmentRoutes"
);
app.use(express.json());
app.use(cors());

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
module.exports = app;