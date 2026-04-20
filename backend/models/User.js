const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  // Profile fields - now optional
  name: { type: String },
  age: { type: Number },
  profession: { type: String },
  bio: {
    type: String,
    maxlength: 200,
  },  travelStatus: {
    boardingStation: { type: String, default: "" },
    boardingStationName: { type: String, default: "" },
    destinationStation: { type: String, default: "" },
    destinationStationName: { type: String, default: "" },
    travelDate: { type: Date },
    trainNumber: { type: String, default: "" },
    trainName: { type: String, default: "" },
    preferredClass: { type: String, default: "" },
    isActive: { type: Boolean, default: false },
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },

  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  online: { type: Boolean, default: false },
  lastSeen: Date,

  createdAt: { type: Date, default: Date.now },
});

const user = mongoose.model("User", userSchema);

module.exports = user;
