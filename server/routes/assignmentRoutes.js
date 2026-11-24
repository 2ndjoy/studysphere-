const express = require("express");

const router = express.Router();

const protect = require(
    "../middleware/authMiddleware"
);
const validateObjectId = require(
    "../middleware/validateObjectId"
);
const {
    createAssignment,
    getAssignments,
    deleteAssignment,
    toggleStatus,
} = require(
    "../controllers/assignmentController"
);


// CREATE
router.post(
    "/",
    protect,
    createAssignment
);


// GET
router.get(
    "/",
    protect,
    getAssignments
);


// DELETE
router.delete(
    "/:id",
    protect,
    validateObjectId,
    deleteAssignment
);


// TOGGLE STATUS
router.patch(
    "/:id",
    protect,
    validateObjectId,
    toggleStatus
);


module.exports = router;