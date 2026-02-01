const express = require("express");
const Laptop = require("../models/Laptop");
const { auth, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const laptops = await Laptop.find().sort("-createdAt");
    res.json(laptops);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const laptop = await Laptop.findById(req.params.id);
    if (!laptop) return res.status(404).json({ message: "Laptop not found" });
    res.json(laptop);
  } catch (e) {
    next(e);
  }
});

router.post("/", auth, isAdmin, async (req, res, next) => {
  try {
    const { brand, model, price, stock, specs } = req.body || {};
    if (!brand || !model || price === undefined) {
      return res.status(400).json({ message: "brand, model, price required" });
    }
    const laptop = await Laptop.create({
      brand,
      model,
      price: Number(price),
      stock: stock === undefined ? 0 : Number(stock),
      specs: specs || {}
    });
    res.status(201).json(laptop);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", auth, isAdmin, async (req, res, next) => {
  try {
    const laptop = await Laptop.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!laptop) return res.status(404).json({ message: "Laptop not found" });
    res.json(laptop);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", auth, isAdmin, async (req, res, next) => {
  try {
    const deleted = await Laptop.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Laptop not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.post("/purchase/:id", auth, async (req, res, next) => {
  try {
    const updated = await Laptop.findOneAndUpdate(
      { _id: req.params.id, stock: { $gte: 1 } },
      { $inc: { stock: -1 } },
      { new: true }
    );

    if (!updated) return res.status(400).json({ message: "Out of stock or not found" });

    res.json({ ok: true, laptop: updated });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/reviews", auth, async (req, res, next) => {
  try {
    const { rating, comment } = req.body || {};
    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return res.status(400).json({ message: "rating must be 1..5" });
    }

    const updated = await Laptop.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          reviews: {
            userId: req.user.id,
            rating: r,
            comment: comment || ""
          }
        }
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Laptop not found" });

    res.json({ ok: true, laptop: updated });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id/reviews/:reviewId", auth, async (req, res, next) => {
  try {
    const updated = await Laptop.findByIdAndUpdate(
      req.params.id,
      { $pull: { reviews: { _id: req.params.reviewId } } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Laptop not found" });

    res.json({ ok: true, laptop: updated });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
