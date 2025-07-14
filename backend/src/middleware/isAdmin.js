const admin = require("../../config/firebase");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    if (decoded.admin) {
      req.user = decoded;
      next();
    } else {
      res.status(403).json({ error: "Admin privileges required" });
    }
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
