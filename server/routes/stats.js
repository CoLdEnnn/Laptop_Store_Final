const express = require('express');
const Laptop = require('../models/Laptop');
const router = express.Router();

router.get('/', async (req, res) => {
  const stats = await Laptop.aggregate([
    { $match: { price: { $gt: 500 } } },
    {
      $group: {
        _id: "$brand",
        avgPrice: { $avg: "$price" },
        totalStock: { $sum: "$stock" },
        models: { $sum: 1 }
      }
    },
    { $sort: { avgPrice: -1 } }
  ]);
  res.json(stats);
});

module.exports = router;
