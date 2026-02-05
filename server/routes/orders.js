const express = require("express");
const Order = require("../models/Order");
const Laptop = require("../models/Laptop");
const { auth, isAdmin } = require("../middleware/auth");

const router = express.Router();

const canAccess = (req, order) =>
  req.user.role === "admin" || order.userId.toString() === req.user.id;

router.post("/", auth, async (req, res, next) => {
  try {
    const itemsReq = req.body?.items;
    if (!Array.isArray(itemsReq) || itemsReq.length === 0) {
      return res.status(400).json({ message: "items[] required" });
    }

    const items = [];
    let total = 0;

    for (const it of itemsReq) {
      const laptopId = it.laptopId;
      const qty = Number(it.qty);

      if (!laptopId || !Number.isFinite(qty) || qty < 1) {
        return res.status(400).json({ message: "Invalid items format" });
      }

      const laptop = await Laptop.findById(laptopId);
      if (!laptop) return res.status(404).json({ message: "Laptop not found" });

      const updatedLaptop = await Laptop.findOneAndUpdate(
        { _id: laptopId, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: true }
      );
      if (!updatedLaptop) return res.status(400).json({ message: "Not enough stock" });

      items.push({
        laptopId: laptop._id,
        brand: laptop.brand,
        model: laptop.model,
        price: laptop.price,
        qty
      });

      total += laptop.price * qty;
    }

    const order = await Order.create({
      userId: req.user.id,
      items,
      total,
      status: "created"
    });

    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
});

router.get("/my", auth, async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort("-createdAt");
    res.json(orders);
  } catch (e) {
    next(e);
  }
});

router.get("/", auth, isAdmin, async (req, res, next) => {
  try {
    const orders = await Order.find().sort("-createdAt");
    res.json(orders);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", auth, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!canAccess(req, order)) return res.status(403).json({ message: "Forbidden" });
    res.json(order);
  } catch (e) {
    next(e);
  }
});

router.patch("/:id/status", auth, isAdmin, async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!["created", "paid", "shipped", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Order not found" });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/items", auth, async (req, res, next) => {
  try {
    const { laptopId, qty } = req.body || {};
    const q = Number(qty);
    if (!laptopId || !Number.isFinite(q) || q < 1) {
      return res.status(400).json({ message: "laptopId and qty required" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!canAccess(req, order)) return res.status(403).json({ message: "Forbidden" });
    if (order.status !== "created") return res.status(400).json({ message: "Order not editable" });

    const laptop = await Laptop.findById(laptopId);
    if (!laptop) return res.status(404).json({ message: "Laptop not found" });

    const dec = await Laptop.findOneAndUpdate(
      { _id: laptopId, stock: { $gte: q } },
      { $inc: { stock: -q } },
      { new: true }
    );
    if (!dec) return res.status(400).json({ message: "Not enough stock" });

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          items: {
            laptopId: laptop._id,
            brand: laptop.brand,
            model: laptop.model,
            price: laptop.price,
            qty: q
          }
        }
      },
      { new: true }
    );

    updated.total = updated.items.reduce((s, it) => s + it.price * it.qty, 0);
    await updated.save();

    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.patch("/:id/cancel", auth, async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status === "cancelled") return res.status(400).json({ message: "Already cancelled" });

    order.status = "cancelled";
    await order.save();

    for (const item of order.items) {
      await Laptop.findByIdAndUpdate(item.laptopId, {
        $inc: { stock: item.qty } 
      });
    }

    res.json({ message: "Order cancelled, stock restored", order });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id/items/:itemId", auth, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!canAccess(req, order)) return res.status(403).json({ message: "Forbidden" });
    if (order.status !== "created") return res.status(400).json({ message: "Order not editable" });

    const item = order.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    await Laptop.findByIdAndUpdate(item.laptopId, { $inc: { stock: item.qty } });

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { $pull: { items: { _id: req.params.itemId } } },
      { new: true }
    );

    updated.total = updated.items.reduce((s, it) => s + it.price * it.qty, 0);
    await updated.save();

    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", auth, isAdmin, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "shipped") {
      for (const it of order.items) {
        await Laptop.findByIdAndUpdate(it.laptopId, { $inc: { stock: it.qty } });
      }
    }

    await Order.deleteOne({ _id: order._id });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
