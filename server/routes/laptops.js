const express = require('express');
const router = express.Router();
const Laptop = require('../models/Laptop');
const { auth, isAdmin } = require('../middleware/auth');

// CREATE (admin)
router.post('/', auth, isAdmin, async (req, res) => {
  const laptop = await Laptop.create(req.body);
  res.json(laptop);
});

// READ ALL
router.get('/', async (req, res) => {
  const laptops = await Laptop.find();
  res.json(laptops);
});

// READ ONE
router.get('/:id', async (req, res) => {
  const laptop = await Laptop.findById(req.params.id);
  res.json(laptop);
});

// UPDATE (admin)
router.put('/:id', auth, isAdmin, async (req, res) => {
  const laptop = await Laptop.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  );
  res.json(laptop);
});

// DELETE (admin)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  await Laptop.findByIdAndDelete(req.params.id);
  res.send("Laptop deleted");
});

// ADVANCED UPDATE: $inc
router.post('/purchase/:id', async (req, res) => {
  await Laptop.findByIdAndUpdate(
    req.params.id,
    { $inc: { stock: -1 } }
  );
  res.send("Purchase successful");
});

// ADVANCED UPDATE: $push
router.post('/:id/review', async (req, res) => {
  await Laptop.findByIdAndUpdate(
    req.params.id,
    { $push: { reviews: req.body } }
  );
  res.send("Review added");
});

// ADVANCED DELETE: $pull
router.delete('/:id/review', async (req, res) => {
  await Laptop.findByIdAndUpdate(
    req.params.id,
    { $pull: { reviews: { user: req.body.user } } }
  );
  res.send("Review removed");
});

module.exports = router;
