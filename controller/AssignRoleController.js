const AssignRole = require("../models/Assign.model");
const { assignRoleSchema } = require("../validators/AssignRole");
const authModel = require("../models/Auth.model");

const HeaightModel = require("../models/Heaight.model");


exports.add = async (req, res) => {
    try {

        const validatedData = await assignRoleSchema.validateAsync(req.body);

        await authModel.findByIdAndUpdate(req.body.user, {
            subRoles: [req.body.role],
            heaightID: req.body.height
        })

        if (req.body.role === "HEAD" || req.body.role === "PRAMUKH") {
            await HeaightModel.findByIdAndUpdate(
                req.body.height,
                {
                    $push: {
                        authorities: {
                            user: req.body.user,
                        },
                    },
                },
                { new: true }
            );
        }

        const exitAssignRole = await AssignRole.findOne({
            user: req.body.user,
        });

        if (exitAssignRole) {
            return res
                .status(400)
                .json({ message: "Already Assign Role", status: false });
        }

        const newAssignRole = await AssignRole.create(validatedData);

        return res.status(201).json({
            message: "Assign Role successfully",
            data: newAssignRole,
            status: true,
        });

    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};


exports.getAll = async (req, res) => {
    try {
        const roles = await AssignRole.find().populate("user height");
        res.json(roles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ ONE
exports.getById = async (req, res) => {
    try {
        const role = await AssignRole.findById(req.params.id).populate("user height");
        if (!role) return res.status(404).json({ error: "Not found" });
        res.json(role);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE
exports.update = async (req, res) => {
    try {
        const { id } = req.params;

        // Step 1: Validate new data
        const validatedData = await assignRoleSchema.validateAsync(req.body);
        const { user, role, height } = validatedData;

        // Step 2: Find existing assignment
        const existingAssign = await AssignRole.findById(id);
        if (!existingAssign) {
            return res.status(404).json({ message: "Assign Role not found", status: false });
        }

        // Step 3: Update user document
        await authModel.findByIdAndUpdate(user, {
            subRoles: [role],
            heaightID: height,
        });

        // Step 4: Remove old authority if previously assigned as HEAD/PRAMUKH
        if (existingAssign.role === "HEAD" || existingAssign.role === "PRAMUKH") {
            await HeaightModel.findByIdAndUpdate(existingAssign.height, {
                $pull: { authorities: { user } },
            });
        }

        // Step 5: Add new authority if new role is HEAD/PRAMUKH
        if (role === "HEAD" || role === "PRAMUKH") {
            await HeaightModel.updateOne(
                { _id: height, "authorities.user": { $ne: user } },
                { $push: { authorities: { user } } }
            );
        }

        // Step 6: Update the AssignRole document
        const updatedAssign = await AssignRole.findByIdAndUpdate(id, validatedData, {
            new: true,
        });

        return res.status(200).json({
            message: "Assign Role updated successfully",
            data: updatedAssign,
            status: true,
        });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
// DELETE
exports.remove = async (req, res) => {
    try {
        const { id } = req.params;

        // Step 1: Find the existing AssignRole record
        const assignRecord = await AssignRole.findById(id);
        if (!assignRecord) {
            return res.status(404).json({ message: "Assign Role not found", status: false });
        }

        const { user, role, height } = assignRecord;

        // Step 2: Remove subRoles and heaightID from user document
        await authModel.findByIdAndUpdate(user, {
            $unset: {
                subRoles: "",
                heaightID: "",
            },
        });

        // Step 3: Remove user from authorities array in Heaight if applicable
        if (role === "HEAD" || role === "PRAMUKH") {
            await HeaightModel.findByIdAndUpdate(height, {
                $pull: {
                    authorities: { user },
                },
            });
        }

        // Step 4: Delete the AssignRole record
        await AssignRole.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Assign Role removed successfully",
            status: true,
        });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
