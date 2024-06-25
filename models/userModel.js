const mongoose = require("mongoose");
const AddressSchema = require("./addressSchema");

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
  useraddress: [AddressSchema], 
    password: {
      type: String,
    },
    googleId: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBlock: {
      type: Boolean,
      default: false,
    },
    wallet: {
      type: Number,
      default: 0
  },
  history: {
      type: Array
  },
  referalCode: {
      type: String,
      required: true,
  },
  redeemed: {
      type: Boolean,
      default: false,
  },
  redeemedUsers: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
      }
  ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
