const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).send("No token");

  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send("Admin only");
  }
  next();
};
