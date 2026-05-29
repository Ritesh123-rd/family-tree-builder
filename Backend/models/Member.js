const mongoose = require("mongoose");
const validator = require("validator");

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
      validate: {
        validator: function (v) {
          // Only allow letters, spaces, hyphens, and apostrophes
          return /^[a-zA-Z\s'\-\u0900-\u097F]+$/.test(v);
        },
        message: "Name can only contain letters, spaces, hyphens and apostrophes",
      },
    },

    gender: {
      type: String,
      enum: {
        values: ["Male", "Female", "Other"],
        message: "{VALUE} is not a valid gender",
      },
      default: "Other",
    },

    dob: {
      type: Date,
      validate: {
        validator: function (v) {
          // DOB should not be in the future
          return !v || v <= new Date();
        },
        message: "Date of birth cannot be in the future",
      },
    },

    father: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      default: null,
    },

    mother: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Member", memberSchema);