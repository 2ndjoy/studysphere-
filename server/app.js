const express = require("express");

const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Server is running");
});

module.exports = app;