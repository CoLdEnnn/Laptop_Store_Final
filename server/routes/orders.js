const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

router.post('/', async (req, res) => {
  const order = await Order.create(req.body);
  res.json(order);
});

router.get('/user/:id', async (req, res) => {
  const orders = await Order.find({ userId: req.params.id })
    .populate('laptopId');
  res.json(orders);
});

router.put('/:id/status', async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json(order);
});

module.exports = router;
