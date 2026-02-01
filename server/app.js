require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const laptopRoutes = require("./routes/laptops");
const orderRoutes = require("./routes/orders");
const statsRoutes = require("./routes/stats");
const usersRoutes = require("./routes/users");

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/laptops", laptopRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/users", usersRoutes);

// Frontend static
app.use(express.static(path.join(__dirname, "..", "public")));

// API 404
app.use("/api", (req, res) => res.status(404).json({ message: "API route not found" }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error", error: err.message });
});

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error("DB connection failed:", e.message);
    process.exit(1);
  });
