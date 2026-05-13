const express = require("express");

const router = express.Router();

const protect = require(
    "../middleware/authMiddleware"
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
    deleteAssignment
);


// TOGGLE STATUS
router.patch(
    "/:id",
    protect,
    toggleStatus
);


module.exports = router;