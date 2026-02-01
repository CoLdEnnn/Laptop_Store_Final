const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  laptopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Laptop' },
  status: { type: String, default: 'created' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
