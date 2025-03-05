const jwt = require("jsonwebtoken");

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) return res.redirect("/auth/login");

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Check if the user's role matches allowed roles
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      next();
    } catch (err) {
      res.redirect("/auth/login");
    }
  };
};

module.exports = authMiddleware;
