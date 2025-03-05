const jwt = require("jsonwebtoken");

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
      return res.redirect("/auth/login"); // Redirect if no token found
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach user data to request object

      // Debugging: Log user role
      // console.log("User Role:", req.user.role);

      // Check if user has the required role
      if (roles.length && !roles.includes(req.user.role)) {
        // console.log("Unauthorized access");
        return res.status(403).json({ message: "Unauthorized access" });
      }

      next(); // Proceed to the next middleware
    } catch (err) {
      res.redirect("/auth/login");
    }
  };
};

module.exports = authMiddleware;
