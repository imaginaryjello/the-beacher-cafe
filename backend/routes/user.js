// backend/routes/user.js
import express from "express";
import bcrypt from "bcryptjs"; // ← ADD THIS
import jwt from "jsonwebtoken"; // ← ADD THIS
import Employee from "../model/employeeSchema.js";
import Notification from "../model/notificationSchema.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// ============================================
// REGISTER (SIGNUP)
// POST /api/user/register
//
// WHAT CHANGES FROM YOUR VERSION:
//   1. role is forced to "employee" — can't self-assign admin
//   2. status is explicitly set to "pending"
//   3. approvalExpiresAt is set to 3 days from now
//   4. A Notification document is created for the owner
//   5. NO JWT issued on register — employee waits for approval
// ============================================
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    // WHY: We destructure `role` out — we do NOT use it.
    // If someone sends { role: "admin" } in the body, it's ignored.

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // WHY: 3 days in milliseconds = 3 * 24 * 60 * 60 * 1000
    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

    const newEmployee = new Employee({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "employee", // SECURITY FIX: always forced, never from req.body
      status: "pending", // LOGIC FIX: always pending on signup
      approvalExpiresAt: new Date(Date.now() + THREE_DAYS), // for cron job cleanup
    });

    await newEmployee.save();

    // WHY: After saving the employee, we create an in-app notification for the owner.
    // We don't await this — if it fails, registration still succeeds.
    // The employee record is what matters; the notification is best-effort.
    Notification.create({
      type: "new_member",
      message: `New signup: ${name} (${email}) is waiting for approval.`,
      relatedId: newEmployee._id,
    }).catch((err) =>
      console.error("Failed to create signup notification:", err),
    );

    // WHY: We deliberately do NOT issue a JWT here.
    // The employee must wait for owner approval, then log in manually.
    // Auto-logging in a pending user would bypass the approval gate.
    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please wait for the owner to approve your account before logging in.",
      employee: {
        id: newEmployee._id,
        name: newEmployee.name,
        email: newEmployee.email,
        // WHY: We return status so the frontend can show the right message
        status: newEmployee.status,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating new member",
      error: error.message,
    });
  }
});
// ============================================
// LOGIN
// POST /api/user/login
//
// WHAT CHANGES FROM YOUR VERSION:
//   1. status is included in the JWT payload
//   2. status is included in the response user object
//   3. Login is NOT blocked for pending users —
//      the frontend reads the token and decides what to show
// ============================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const employeeData = await Employee.findOne({ email });

    if (!employeeData) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      employeeData.password,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // WHY: status is included in the token payload.
    // The frontend decodes this and routes the user to:
    //   - "pending" → waiting screen
    //   - "accepted" → dashboard
    //   - "inactive" → "your account has been deactivated" screen
    // This means no extra API call is needed after login.
    const token = jwt.sign(
      {
        id: employeeData._id,
        role: employeeData.role,
        status: employeeData.status, // NEW: frontend needs this to gate the dashboard
        email: employeeData.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: employeeData._id,
        name: employeeData.name,
        email: employeeData.email,
        role: employeeData.role,
        status: employeeData.status, // NEW: return status so frontend can store it
        phone: employeeData.phone,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
});

// ============================================
// GET ALL EMPLOYEES
// GET /api/user/
//
// WHAT CHANGES: Now protected by verifyToken + requireAccepted (implicit via verifyToken)
// WHY: Before, any unauthenticated request could see all employee records.
// ============================================
router.get("/", verifyToken, async (req, res) => {
  try {
    const employees = await Employee.find().select("-password");

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employees",
      error: error.message,
    });
  }
});

// ============================================
// Get pending employees for admin approval
// GET /api/user/pending

// owner needs to see the pending list and do the approbal for further processing
// ============================================
router.get("/pending", verifyToken, requireAdmin, async (req, res) => {
  try {
    const pendingEmployees = await Employee.find({
      status: "pending",
    }).select("-password");

    res.status(200).json({
      success: true,
      count: pendingEmployees.length,
      employees: pendingEmployees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching pending employees",
      error: error.message,
    });
  }
});

// ============================================
// approve employee registration
// POST /api/user/approve/:id
// ============================================
router.patch("/approve/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        status: "accepted",
        approvalExpiresAt: null, // WHY: Clear the expiry — they're approved, cron ignores them now
      },
      { new: true }, // WHY: returns the updated document, not the old one
    ).select("-password");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    // Mark related notification as read
    Notification.findOneAndUpdate(
      { relatedId: req.params.id, type: "new_member" },
      { read: true },
    ).catch(() => {}); // silent — don't block the response

    res.status(200).json({
      success: true,
      message: `${updated.name} has been approved.`,
      employee: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error approving employee",
      error: error.message,
    });
  }
});

// ============================================
// REJECT EMPLOYEE (owner only)
// PATCH /api/user/reject/:id
//
// WHY: We delete the document entirely on reject.
// A rejected signup has no use in the DB and
// clutters the pending list.
// ============================================
router.delete("/reject/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    // Clean up the notification too
    Notification.findOneAndDelete({ relatedId: req.params.id }).catch(() => {});

    res.status(200).json({
      success: true,
      message: `${deleted.name}'s signup request has been rejected and removed.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error rejecting employee",
      error: error.message,
    });
  }
});

// ============================================
// PROMOTE / DEMOTE EMPLOYEE (owner only)
// PATCH /api/user/promote/:id
// Body: { role: "coadmin" } or { role: "employee" }
//
// WHY: Owner can upgrade employee → coadmin (edit rights)
//   or downgrade coadmin → employee (remove edit rights).
//   Only "coadmin" and "employee" are valid targets —
//   you can't promote someone to "admin" (only one owner).
// ============================================
router.patch("/promote/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    // WHY: Validate the target role. Owner cannot be assigned via this route.
    if (!["coadmin", "employee"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be "coadmin" or "employee".',
      });
    }

    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({
      success: true,
      message: `${updated.name} is now a ${role}.`,
      employee: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating role",
      error: error.message,
    });
  }
});

// ============================================
// DEACTIVATE EMPLOYEE (owner only)
// PATCH /api/user/deactivate/:id
//
// WHY: Different from reject — this is for existing accepted
// employees the owner wants to suspend without deleting.
// Their data stays; they just can't log in to the dashboard.
// ============================================
router.patch("/deactivate/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      { status: "inactive" },
      { new: true },
    ).select("-password");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({
      success: true,
      message: `${updated.name} has been deactivated.`,
      employee: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deactivating employee",
      error: error.message,
    });
  }
});

export default router;
