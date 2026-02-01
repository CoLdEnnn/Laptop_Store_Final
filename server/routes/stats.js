const express = require("express");
const Laptop = require("../models/Laptop");
const Order = require("../models/Order");
const { auth, isAdmin } = require("../middleware/auth");

const router = express.Router();

// 1) inventory by brand (по складу) - aggregation
router.get("/inventory-by-brand", auth, isAdmin, async (req, res, next) => {
  try {
    const stats = await Laptop.aggregate([
      { $match: { price: { $gte: 0 } } },
      {
        $group: {
          _id: "$brand",
          avgPrice: { $avg: "$price" },
          totalStock: { $sum: "$stock" },
          modelsCount: { $sum: 1 }
        }
      },
      { $sort: { avgPrice: -1 } }
    ]);

    res.json(stats);
  } catch (e) {
    next(e);
  }
});

// 2) revenue by brand (из заказов) - multi-stage aggregation
router.get("/revenue-by-brand", auth, isAdmin, async (req, res, next) => {
  try {
    const data = await Order.aggregate([
      { $match: { status: { $in: ["paid", "shipped"] } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.brand",
          revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
          soldQty: { $sum: "$items.qty" },
          ordersTouched: { $addToSet: "$_id" }
        }
      },
      {
        $project: {
          brand: "$_id",
          _id: 0,
          revenue: 1,
          soldQty: 1,
          ordersCount: { $size: "$ordersTouched" }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.json(data);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
