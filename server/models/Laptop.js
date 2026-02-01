const mongoose = require("mongoose");

const laptopSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },

    specs: {
      cpu: String,
      ram: String
    },

    reviews: [
      {
        _id: true,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true, versionKey: false }
);

laptopSchema.index({ brand: 1, price: -1 });

module.exports = mongoose.model("Laptop", laptopSchema);
