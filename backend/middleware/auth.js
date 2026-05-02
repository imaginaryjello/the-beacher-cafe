// middleware/auth.js
import jwt from "jsonwebtoken";

// ============================================
// MIDDLEWARE 1: verifyToken
// Checks that the request has a valid JWT.
// Attaches the decoded payload to req.user.
//
// HOW TO USE:
//   router.get("/protected", verifyToken, (req, res) => {
//     res.json({ user: req.user }); // req.user = { id, role, status, email }
//   });
// ============================================
export const verifyToken = (req, res, next) => {
  // WHY: Token comes in the Authorization header as "Bearer <token>"
  // We split on the space and take the second part.
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    // WHY: jwt.verify() both decodes AND checks the signature + expiry.
    // If the token is tampered with or expired, it throws an error.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, status, email, iat, exp }
    next(); // move on to the actual route handler
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// ============================================
// MIDDLEWARE 2: requireAdmin
// Must be used AFTER verifyToken (needs req.user).
// Blocks anyone who isn't role: "admin" (the owner).
//
// HOW TO USE:
//   router.patch("/approve/:id", verifyToken, requireAdmin, handler);
//   ↑ verifyToken runs first, then requireAdmin, then handler
// ============================================
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      // WHY 403 not 401: 401 = "who are you?", 403 = "I know who you are, you just can't do this"
      message: "Access denied. Owner privileges required.",
    });
  }
  next();
};

// ============================================
// MIDDLEWARE 3: requireAccepted
// Blocks employees who are still pending or inactive
// from accessing dashboard-level routes.
//
// WHY: Even if a pending user has a valid JWT, they
// shouldn't be able to hit internal API routes.
// The frontend also blocks them, but defense-in-depth
// means the backend enforces it too.
// ============================================
export const requireAccepted = (req, res, next) => {
  if (req.user.status !== "accepted") {
    return res.status(403).json({
      success: false,
      message: "Account not yet approved by owner.",
    });
  }
  next();
};
