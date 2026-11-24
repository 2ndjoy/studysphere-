const express = require(
    "express"
);

const router =
    express.Router();

const protect = require(
    "../middleware/authMiddleware"
);
const validateObjectId = require(
    "../middleware/validateObjectId"
);

const {
    createNote,
    getNotes,
    deleteNote,
} = require(
    "../controllers/noteController"
);


// CREATE
router.post(
    "/",
    protect,
    createNote
);


// GET
router.get(
    "/",
    protect,
    getNotes
);


// DELETE
router.delete(
    "/:id",
    protect,
    validateObjectId,
    deleteNote
);


module.exports = router;