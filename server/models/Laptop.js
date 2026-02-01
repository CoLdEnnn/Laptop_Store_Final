const mongoose = require('mongoose');

const laptopSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  specs: {
    cpu: String,
    ram: String
  },
  reviews: [{
    user: String,
    rating: Number,
    comment: String
  }]
}, { timestamps: true });

laptopSchema.index({ brand: 1, price: -1 });

module.exports = mongoose.model('Laptop', laptopSchema);
