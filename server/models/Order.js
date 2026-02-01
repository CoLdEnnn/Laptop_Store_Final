const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    laptopId: { type: mongoose.Schema.Types.ObjectId, ref: "Laptop", required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true }, 
    price: { type: Number, required: true }, 
    qty: { type: Number, required: true, min: 1 }
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], default: [] }, // embedded
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["created", "paid", "shipped", "cancelled"], default: "created" }
  },
  { timestamps: true, versionKey: false }
);

// индексы
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema, "Orders");
