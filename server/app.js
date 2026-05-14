const express = require("express");

const app = express();
const cors = require("cors");
const assignmentRoutes = require(
    "./routes/assignmentRoutes"
);
const resourceRoutes = require(
    "./routes/resourceRoutes"
);
const noteRoutes = require(
    "./routes/noteRoutes"
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
app.use(
    "/api/resources",
    resourceRoutes
);
app.use(
    "/api/notes",
    noteRoutes
);



module.exports = app;