
const mongoose = require("mongoose");

const validateObjectId = (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
        return res.status(400).json({
            message: "Invalid resource ID",
        });
    }

    return next();
};

module.exports = validateObjectId;
