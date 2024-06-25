const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    date: { type: Date, default: Date.now },
    isCredited:{ type: Boolean, default: true },
    amount: { type: Number, required: true },
    description: { type: String },
    balance: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", walletSchema);
