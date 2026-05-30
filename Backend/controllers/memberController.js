const mongoose = require("mongoose");
const Member = require("../models/Member");

// Helper: Validate MongoDB ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const createMember = async (req, res) => {
  try {
    const { name, gender, dob, father, mother } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (father) {
      if (!isValidId(father)) {
        return res.status(400).json({ success: false, message: "Invalid father ID" });
      }

      const fatherData = await Member.findById(father);

      if (!fatherData) {
        return res.status(404).json({
          success: false,
          message: "Father not found",
        });
      }

      if (fatherData.gender !== "Male") {
        return res.status(400).json({
          success: false,
          message: "Selected father must be Male",
        });
      }
    }

    if (mother) {
      if (!isValidId(mother)) {
        return res.status(400).json({ success: false, message: "Invalid mother ID" });
      }

      const motherData = await Member.findById(mother);

      if (!motherData) {
        return res.status(404).json({
          success: false,
          message: "Mother not found",
        });
      }

      if (motherData.gender !== "Female") {
        return res.status(400).json({
          success: false,
          message: "Selected mother must be Female",
        });
      }
    }

    const member = await Member.create({
      name: name.trim(),
      gender,
      dob,
      father: father || null,
      mother: mother || null,
    });

    res.status(201).json({
      success: true,
      member,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({
      success: false,
      message: "Server error while creating member",
    });
  }
};

const getAllMembers = async (req, res) => {
  try {
    const members = await Member.find()
      .populate("father", "name")
      .populate("mother", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching members",
    });
  }
};

const getMemberById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid member ID" });
    }

    const member = await Member.findById(req.params.id)
      .populate("father", "name gender")
      .populate("mother", "name gender");

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const children = await Member.find({
      $or: [
        { father: member._id },
        { mother: member._id },
      ],
    }).select("name gender dob");

    let siblings = [];

    const parentConditions = [];
    if (member.father) parentConditions.push({ father: member.father });
    if (member.mother) parentConditions.push({ mother: member.mother });

    if (parentConditions.length > 0) {
      siblings = await Member.find({
        _id: { $ne: member._id },
        $or: parentConditions,
      }).select("name gender");
    }

    res.status(200).json({
      success: true,
      member,
      children,
      siblings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching member details",
    });
  }
};

const updateMember = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid member ID" });
    }

    // Only allow specific fields to be updated (prevent mass assignment)
    const allowedFields = ["name", "gender", "dob", "father", "mother"];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (updates.name) updates.name = updates.name.trim();

    const { father, mother } = updates;

    if (father === req.params.id || mother === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "A member cannot be their own parent",
      });
    }

    if (father) {
      if (!isValidId(father)) return res.status(400).json({ success: false, message: "Invalid father ID" });
      const fatherData = await Member.findById(father);
      if (!fatherData) return res.status(404).json({ success: false, message: "Father not found" });
      if (fatherData.gender !== "Male") return res.status(400).json({ success: false, message: "Selected father must be Male" });
    }

    if (mother) {
      if (!isValidId(mother)) return res.status(400).json({ success: false, message: "Invalid mother ID" });
      const motherData = await Member.findById(mother);
      if (!motherData) return res.status(404).json({ success: false, message: "Mother not found" });
      if (motherData.gender !== "Female") return res.status(400).json({ success: false, message: "Selected mother must be Female" });
    }

    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      updates,  // Only whitelisted fields
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      updatedMember,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({
      success: false,
      message: "Server error while updating member",
    });
  }
};

const deleteMember = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid member ID" });
    }

    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    // Remove references to this member from their children
    await Member.updateMany(
      { father: req.params.id },
      { $set: { father: null } }
    );
    await Member.updateMany(
      { mother: req.params.id },
      { $set: { mother: null } }
    );

    await Member.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Member deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting member",
    });
  }
};

const buildTree = async (memberId) => {
  const children = await Member.find({
    $or: [
      { father: memberId },
      { mother: memberId },
    ],
  });

  const result = [];

  for (const child of children) {
    result.push({
      _id: child._id,
      name: child.name,
      gender: child.gender,
      children: await buildTree(child._id),
    });
  }

  return result;
};

const getFamilyTree = async (req, res) => {
  try {
    const roots = await Member.find({
      father: null,
      mother: null,
    });

    const tree = [];

    for (const root of roots) {
      tree.push({
        _id: root._id,
        name: root.name,
        gender: root.gender,
        children: await buildTree(root._id),
      });
    }

    res.status(200).json({
      success: true,
      tree,
    });
  } catch (error) {
    console.error("Tree Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while building family tree",
    });
  }
};

module.exports = {
  createMember,
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
  getFamilyTree,
};