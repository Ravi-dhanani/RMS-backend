const mongoose = require("mongoose");

const assignRoleSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    height: { type: mongoose.Schema.Types.ObjectId, ref: "Heaight" },
    role: {
        type: String,
        enum: ["HEAD", "PRAMUKH"],
    },
});

module.exports = mongoose.model("Assign-role", assignRoleSchema);
