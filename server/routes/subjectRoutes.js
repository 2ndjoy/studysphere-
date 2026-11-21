const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const validateObjectId = require(
    "../middleware/validateObjectId"
);
const {
    createSubject,
    getSubjects,
    deleteSubject,
} = require("../controllers/subjectController");


// Create subject
router.post("/", protect, createSubject);


// Get subjects
router.get("/", protect, getSubjects);


// Delete subject
router.delete(
    "/:id",
    protect,
    validateObjectId,
    deleteSubject
);


module.exports = router;